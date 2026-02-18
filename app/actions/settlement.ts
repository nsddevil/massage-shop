"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { startOfDay, endOfDay } from "date-fns";

/**
 * 특정 주간의 관리사별 정산 대상 데이터 가져오기
 * @param startDate 주간 시작일 (월요일)
 * @param endDate 주간 종료일 (일요일)
 */
export async function getWeeklySettlementData(startDate: Date, endDate: Date) {
  try {
    const start = startOfDay(startDate);
    const end = endOfDay(endDate);

    // 1. 모든 관리사 목록 가져오기
    const therapists = await prisma.employee.findMany({
      where: {
        role: "THERAPIST",
        resignedAt: null,
      },
    });

    // 2. 해당 기간의 모든 SaleTherapist 기록 가져오기
    const salesData = await prisma.saleTherapist.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      include: {
        sale: {
          include: {
            course: true,
          },
        },
      },
    });

    // 3. 해당 기간의 추가 지급액 (가불/보너스) 가져오기
    const extraPayments = await prisma.extraPayment.findMany({
      where: {
        date: {
          gte: start,
          lte: end,
        },
        isSettled: false,
      },
    });

    // 4. 이미 완료된 정산 기록 확인
    const existingSettlements = await prisma.settlement.findMany({
      where: {
        periodStart: start,
        periodEnd: end,
        type: "WEEKLY",
      },
    });

    // 데이터 가공: 관리사별로 묶기
    const settlementList = therapists.map((t) => {
      const mySales = salesData.filter((s) => s.employeeId === t.id);
      const myExtras = extraPayments.filter((e) => e.employeeId === t.id);
      const isAlreadySettled = existingSettlements.some(
        (s) => s.employeeId === t.id,
      );

      const totalCommission = mySales.reduce(
        (sum, s) => sum + s.commissionAmount,
        0,
      );
      const totalChoiceFee = mySales.reduce((sum, s) => sum + s.choiceFee, 0);

      const totalBonus = myExtras
        .filter((e) => e.type === "BONUS")
        .reduce((sum, e) => sum + e.amount, 0);
      const totalAdvance = myExtras
        .filter((e) => e.type === "ADVANCE")
        .reduce((sum, e) => sum + e.amount, 0);

      const netAmount =
        totalCommission + totalChoiceFee + totalBonus - totalAdvance;

      return {
        therapist: {
          id: t.id,
          name: t.name,
        },
        salesCount: mySales.length,
        totalCommission,
        totalChoiceFee,
        totalBonus,
        totalAdvance,
        netAmount,
        isAlreadySettled,
        details: {
          sales: mySales.map((s) => ({
            id: s.id,
            date: s.createdAt,
            courseName: s.sale.course.name,
            amount: s.commissionAmount + s.choiceFee,
            isChoice: s.isChoice,
          })),
          extras: myExtras.map((e) => ({
            id: e.id,
            type: e.type,
            amount: e.amount,
            date: e.date,
          })),
        },
      };
    });

    return { success: true, data: settlementList };
  } catch (error) {
    console.error("Failed to fetch weekly settlement data:", error);
    return { success: false, error: "정산 데이터를 불러오는데 실패했습니다." };
  }
}

/**
 * 정산 기록 생성
 */
export async function createSettlement(data: {
  employeeId: string;
  type: "WEEKLY" | "MONTHLY";
  periodStart: Date;
  periodEnd: Date;
  totalAmount: number;
  details: any;
  extraPaymentIds: string[];
}) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. 정산 레코드 생성
      const settlement = await tx.settlement.create({
        data: {
          employeeId: data.employeeId,
          type: data.type,
          periodStart: startOfDay(data.periodStart),
          periodEnd: endOfDay(data.periodEnd),
          totalAmount: data.totalAmount,
          details: data.details as any,
        },
      });

      // 2. 포함된 가불금/보너스 항목 정산 완료 처리
      if (data.extraPaymentIds.length > 0) {
        await tx.extraPayment.updateMany({
          where: {
            id: { in: data.extraPaymentIds },
          },
          data: {
            isSettled: true,
          },
        });
      }

      return settlement;
    });

    revalidatePath("/settlement/weekly");
    revalidatePath("/finance");
    return { success: true, data: result };
  } catch (error) {
    console.error("Failed to create settlement:", error);
    return { success: false, error: "정산 처리에 실패했습니다." };
  }
}
