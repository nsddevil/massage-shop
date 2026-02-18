"use server";

import prisma from "@/lib/prisma";
import { startOfMonth, endOfMonth, eachDayOfInterval, format } from "date-fns";

export async function getMonthlyFinance(year: number, month: number) {
  try {
    const startDate = startOfMonth(new Date(year, month - 1));
    const endDate = endOfMonth(startDate);

    // 1. 매출 데이터 가져오기
    const sales = await prisma.sale.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        totalPrice: true,
        createdAt: true,
      },
    });

    // 2. 지출 데이터 (고정/일반) 가져오기
    const expenses = await prisma.expense.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // 3. 정산 데이터 (주급/월급) 가져오기
    const settlements = await prisma.settlement.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // 4. 추가 지급액 (가불/보너스) 가져오기
    // 보통 Settlement에 포함되지만, 포함되지 않은 경우를 대비
    const extraPayments = await prisma.extraPayment.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
        isSettled: false, // 아직 정산되지 않은 항목만 별도로 지출로 잡음
      },
    });

    // 일별 데이터 취합을 위한 맵 생성
    const daysInMonth = eachDayOfInterval({ start: startDate, end: endDate });
    const dailyData: Record<
      string,
      { revenue: number; expense: number; netProfit: number }
    > = {};

    daysInMonth.forEach((day) => {
      dailyData[format(day, "yyyy-MM-dd")] = {
        revenue: 0,
        expense: 0,
        netProfit: 0,
      };
    });

    let totalRevenue = 0;
    let totalExpense = 0;

    // 매출 합산
    sales.forEach((sale) => {
      const dayKey = format(sale.createdAt, "yyyy-MM-dd");
      if (dailyData[dayKey]) {
        dailyData[dayKey].revenue += sale.totalPrice;
        totalRevenue += sale.totalPrice;
      }
    });

    // 일반 지출 합산
    expenses.forEach((exp) => {
      const dayKey = format(exp.date, "yyyy-MM-dd");
      if (dailyData[dayKey]) {
        dailyData[dayKey].expense += exp.amount;
        totalExpense += exp.amount;
      }
    });

    // 정산 지출 합산
    settlements.forEach((set) => {
      const dayKey = format(set.createdAt, "yyyy-MM-dd");
      if (dailyData[dayKey]) {
        dailyData[dayKey].expense += set.totalAmount;
        totalExpense += set.totalAmount;
      }
    });

    // 추가 지급액 합산
    extraPayments.forEach((extra) => {
      const dayKey = format(extra.date, "yyyy-MM-dd");
      if (dailyData[dayKey]) {
        dailyData[dayKey].expense += extra.amount;
        totalExpense += extra.amount;
      }
    });

    // 순이익 계산
    Object.keys(dailyData).forEach((key) => {
      dailyData[key].netProfit =
        dailyData[key].revenue - dailyData[key].expense;
    });

    const chartData = Object.entries(dailyData).map(([date, data]) => ({
      date,
      ...data,
    }));

    // 정산 내역 분리 (주급=커미션, 월급=인건비)
    const commissionSettlements = settlements.filter(
      (s) => s.type === "WEEKLY",
    );
    const laborSettlements = settlements.filter((s) => s.type === "MONTHLY");

    return {
      success: true,
      data: {
        summary: {
          totalRevenue,
          totalExpense,
          netProfit: totalRevenue - totalExpense,
          expenseBreakdown: {
            general: expenses.reduce((sum, e) => sum + e.amount, 0),
            commission: commissionSettlements.reduce(
              (sum, s) => sum + s.totalAmount,
              0,
            ),
            labor: laborSettlements.reduce((sum, s) => sum + s.totalAmount, 0),
            extra: extraPayments.reduce((sum, ex) => sum + ex.amount, 0),
          },
        },
        chartData,
      },
    };
  } catch (error) {
    console.error("Failed to fetch monthly finance:", error);
    return {
      success: false,
      error: "월별 재무 데이터를 불러오는데 실패했습니다.",
    };
  }
}
