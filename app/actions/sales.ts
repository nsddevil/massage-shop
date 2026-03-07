"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { validateOwner } from "@/lib/auth-util";
import { CreateSaleInput, UpdateSaleInput, Course } from "@/types";
import { kst } from "@/lib/date";

/**
 * 커미션 계산 로직
 * 1인 코스: 결제 금액의 10%
 * 2인 코스: 60분 6000원, 80분 8000원
 * 초이스 수당: +2000원
 */
function calculateCommission(
  course: Course,
  therapistsCount: number,
  isChoice: boolean,
) {
  const choiceFee = isChoice ? 2000 : 0;
  // 관리사 수에 따라 1인/2인 커미션 결정
  const baseCommission =
    therapistsCount >= 2 ? course.commissionDouble : course.commissionSingle;

  return { commissionAmount: baseCommission, choiceFee };
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
          createdAt: data.createdAt,
          startTime: data.startTime,
          endTime: data.endTime,
        },
      });

      // 2. 관리사별 커미션 기록 생성
      const therapistsCount = data.therapists.length;
      for (const t of data.therapists) {
        const { commissionAmount, choiceFee } = calculateCommission(
          course,
          therapistsCount,
          t.isChoice,
        );

        await tx.saleTherapist.create({
          data: {
            saleId: newSale.id,
            employeeId: t.employeeId,
            isChoice: t.isChoice,
            commissionAmount,
            choiceFee,
            createdAt: data.createdAt,
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

export async function updateSale(data: UpdateSaleInput) {
  try {
    const authCheck = await validateOwner();
    if (!authCheck.success) return authCheck;

    // 1. 코스 정보 조회
    const course = await prisma.course.findUnique({
      where: { id: data.courseId },
    });

    if (!course) {
      return { success: false, error: "코스 정보를 찾을 수 없습니다." };
    }

    // 2. 트랜잭션 처리
    const sale = await prisma.$transaction(async (tx) => {
      // 2-1. 기존 매출 수정
      const updatedSale = await tx.sale.update({
        where: { id: data.id },
        data: {
          courseId: data.courseId,
          payMethod: data.payMethod,
          totalPrice: data.totalPrice,
          createdAt: data.createdAt,
          startTime: data.startTime,
          endTime: data.endTime,
        },
      });

      // 2-2. 기존 관리사 커미션 기록 삭제
      await tx.saleTherapist.deleteMany({
        where: { saleId: data.id },
      });

      // 2-3. 새 관리사별 커미션 기록 생성
      const therapistsCount = data.therapists.length;
      for (const t of data.therapists) {
        const { commissionAmount, choiceFee } = calculateCommission(
          course,
          therapistsCount,
          t.isChoice,
        );

        await tx.saleTherapist.create({
          data: {
            saleId: updatedSale.id,
            employeeId: t.employeeId,
            isChoice: t.isChoice,
            commissionAmount,
            choiceFee,
            createdAt: data.createdAt,
          },
        });
      }

      return updatedSale;
    });

    revalidatePath("/sales");
    revalidatePath("/");
    return { success: true, data: sale };
  } catch (error) {
    console.error("Failed to update sale:", error);
    return { success: false, error: "매출 수정에 실패했습니다." };
  }
}

export async function deleteSale(id: string) {
  try {
    const authCheck = await validateOwner();
    if (!authCheck.success) return authCheck;

    await prisma.$transaction(async (tx) => {
      // 1. 관리사 커미션 기록 삭제
      await tx.saleTherapist.deleteMany({
        where: { saleId: id },
      });

      // 2. 매출 삭제
      await tx.sale.delete({
        where: { id },
      });
    });

    revalidatePath("/sales");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete sale:", error);
    return { success: false, error: "매출 삭제에 실패했습니다." };
  }
}

export async function getDailySummary(date: Date = kst.nowKST()) {
  try {
    const start = kst.startOfDay(date);
    const end = kst.endOfDay(date);

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
      orderBy: { startTime: "desc" },
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

export async function getDailySales(date: Date = kst.nowKST()) {
  try {
    const start = kst.startOfDay(date);
    const end = kst.endOfDay(date);

    const sales = await prisma.sale.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      orderBy: { startTime: "desc" }, // 최신 시작 시간 우선 정렬
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
    console.error("Failed to fetch daily sales:", error);
    return {
      success: false,
      error: "일별 매출 목록을 불러오는데 실패했습니다.",
    };
  }
}
