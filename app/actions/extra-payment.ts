"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { startOfMonth, endOfMonth } from "date-fns";

/**
 * 월별 직원 지급 내역 조회
 */
export async function getExtraPayments(year: number, month: number) {
  try {
    const startDate = startOfMonth(new Date(year, month - 1));
    const endDate = endOfMonth(startDate);

    const payments = await prisma.extraPayment.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        employee: {
          select: {
            name: true,
            role: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    return { success: true, data: payments };
  } catch (error) {
    console.error("Failed to fetch extra payments:", error);
    return { success: false, error: "지급 내역을 불러오는데 실패했습니다." };
  }
}

/**
 * 직원 지급 내역 생성 (가불/보너스)
 */
export async function createExtraPayment(data: {
  employeeId: string;
  type: "ADVANCE" | "BONUS";
  amount: number;
  date: Date;
}) {
  try {
    const payment = await prisma.extraPayment.create({
      data: {
        employeeId: data.employeeId,
        type: data.type,
        amount: data.amount,
        date: data.date,
        isSettled: false, // 기본값: 미정산
      },
    });

    revalidatePath("/expenses");
    revalidatePath("/finance");
    // 정산 페이지 데이터도 갱신될 수 있음
    revalidatePath("/settlement/weekly");
    revalidatePath("/settlement/monthly");

    return { success: true, data: payment };
  } catch (error) {
    console.error("Failed to create extra payment:", error);
    return { success: false, error: "지금 등록에 실패했습니다." };
  }
}

/**
 * 직원 지급 내역 삭제
 * - 이미 정산된(isSettled === true) 항목은 삭제 불가
 */
export async function deleteExtraPayment(id: string) {
  try {
    const payment = await prisma.extraPayment.findUnique({
      where: { id },
    });

    if (!payment) {
      return { success: false, error: "존재하지 않는 내역입니다." };
    }

    if (payment.isSettled) {
      return {
        success: false,
        error: "이미 정산 완료된 내역은 삭제할 수 없습니다.",
      };
    }

    await prisma.extraPayment.delete({
      where: { id },
    });

    revalidatePath("/expenses");
    revalidatePath("/finance");
    revalidatePath("/settlement/weekly");
    revalidatePath("/settlement/monthly");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete extra payment:", error);
    return { success: false, error: "삭제에 실패했습니다." };
  }
}
