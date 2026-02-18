"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { CreateSaleInput } from "@/types";
import { startOfDay, endOfDay } from "date-fns";

/**
 * 커미션 계산 로직
 * 1인 코스: 결제 금액의 10%
 * 2인 코스: 60분 6000원, 80분 8000원
 * 초이스 수당: +2000원
 */
function calculateCommission(
  courseType: "SINGLE" | "DOUBLE",
  duration: number,
  totalPrice: number,
  isChoice: boolean,
) {
  let commissionAmount = 0;
  const choiceFee = isChoice ? 2000 : 0;

  if (courseType === "SINGLE") {
    // 1인 코스: 결제 금액의 10% (소수점 절사)
    commissionAmount = Math.floor(totalPrice * 0.1);
  } else {
    // 2인 코스: 시간별 고정 금액
    if (duration <= 60) {
      commissionAmount = 6000;
    } else if (duration <= 80) {
      commissionAmount = 8000;
    } else {
      // 80분 초과 시에도 8000원 또는 별도 로직 (현재는 8000원 기준)
      commissionAmount = 8000;
    }
  }

  return { commissionAmount, choiceFee };
}

export async function createSale(data: CreateSaleInput) {
  try {
    // 코스 정보 조회
    const course = await prisma.course.findUnique({
      where: { id: data.courseId },
    });

    if (!course) {
      return { success: false, error: "코스 정보를 찾을 수 없습니다." };
    }

    // 트랜잭션 처리
    const sale = await prisma.$transaction(async (tx) => {
      // 1. 매출 생성
      const newSale = await tx.sale.create({
        data: {
          courseId: data.courseId,
          payMethod: data.payMethod,
          totalPrice: data.totalPrice,
        },
      });

      // 2. 관리사별 커미션 기록 생성
      for (const t of data.therapists) {
        const { commissionAmount, choiceFee } = calculateCommission(
          course.type,
          course.duration,
          data.totalPrice,
          t.isChoice,
        );

        await tx.saleTherapist.create({
          data: {
            saleId: newSale.id,
            employeeId: t.employeeId,
            isChoice: t.isChoice,
            commissionAmount,
            choiceFee,
          },
        });
      }

      return newSale;
    });

    revalidatePath("/sales");
    revalidatePath("/"); // 대시보드 갱신
    return { success: true, data: sale };
  } catch (error) {
    console.error("Failed to create sale:", error);
    return { success: false, error: "매출 등록에 실패했습니다." };
  }
}

export async function getDailySummary(date: Date = new Date()) {
  try {
    const start = startOfDay(date);
    const end = endOfDay(date);

    const sales = await prisma.sale.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
      },
    });

    // 결제 수단별 집계
    const summary = {
      CASH: 0,
      TRANSFER: 0,
      CARD: 0,
      HEELY: 0,
      MATONG: 0,
      total: 0,
    };

    sales.forEach((sale) => {
      summary[sale.payMethod] += sale.totalPrice;
      summary.total += sale.totalPrice;
    });

    return { success: true, data: summary };
  } catch (error) {
    console.error("Failed to fetch daily summary:", error);
    return { success: false, error: "일별 요약을 불러오는데 실패했습니다." };
  }
}

export async function getRecentSales(limit: number = 20) {
  try {
    const sales = await prisma.sale.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        course: true,
        therapists: {
          include: {
            employee: true,
          },
        },
      },
    });

    return { success: true, data: sales };
  } catch (error) {
    console.error("Failed to fetch recent sales:", error);
    return {
      success: false,
      error: "최근 매출 목록을 불러오는데 실패했습니다.",
    };
  }
}
