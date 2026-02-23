"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { validateOwner } from "@/lib/auth-util";
import { startOfMonth, endOfMonth } from "date-fns";
import { ActionResponse, Expense } from "@/types";

/**
 * 월별 매장 지출 조회
 */
export async function getExpenses(
  year: number,
  month: number,
): Promise<ActionResponse<Expense[]>> {
  try {
    const startDate = startOfMonth(new Date(year, month - 1));
    const endDate = endOfMonth(startDate);

    const expenses = await prisma.expense.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    return { success: true, data: expenses };
  } catch (error) {
    console.error("Failed to fetch expenses:", error);
    return { success: false, error: "지출 내역을 불러오는데 실패했습니다." };
  }
}

/**
 * 매장 지출 생성
 */
export async function createExpense(data: {
  type: "FIXED" | "GENERAL";
  category: string;
  amount: number;
  date: Date;
}): Promise<ActionResponse<Expense>> {
  try {
    const expense = await prisma.expense.create({
      data: {
        type: data.type,
        category: data.category,
        amount: data.amount,
        date: data.date,
      },
    });

    revalidatePath("/expenses");
    revalidatePath("/finance"); // 재무 현황에도 반영
    return { success: true, data: expense as Expense };
  } catch (error) {
    console.error("Failed to create expense:", error);
    return { success: false, error: "지출 등록에 실패했습니다." };
  }
}

/**
 * 매장 지출 수정
 */
export async function updateExpense(
  id: string,
  data: {
    type: "FIXED" | "GENERAL";
    category: string;
    amount: number;
    date: Date;
  },
): Promise<ActionResponse<Expense>> {
  try {
    const authCheck = await validateOwner();
    if (!authCheck.success) return { success: false, error: authCheck.error };

    const expense = await prisma.expense.update({
      where: { id },
      data: {
        type: data.type,
        category: data.category,
        amount: data.amount,
        date: data.date,
      },
    });

    revalidatePath("/expenses");
    revalidatePath("/finance");
    return { success: true, data: expense as Expense };
  } catch (error) {
    console.error("Failed to update expense:", error);
    return { success: false, error: "지출 수정에 실패했습니다." };
  }
}

/**
 * 매장 지출 삭제
 */
export async function deleteExpense(id: string): Promise<ActionResponse> {
  try {
    const authCheck = await validateOwner();
    if (!authCheck.success) return authCheck;

    await prisma.expense.delete({
      where: { id },
    });

    revalidatePath("/expenses");
    revalidatePath("/finance");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete expense:", error);
    return { success: false, error: "지출 삭제에 실패했습니다." };
  }
}
