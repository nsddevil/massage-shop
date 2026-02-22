"use server";

import prisma from "@/lib/prisma";
import { eachDayOfInterval, format } from "date-fns";
import { kst } from "@/lib/date";

export async function getMonthlyFinance(year: number, month: number) {
  try {
    // KST 기준 월의 시작/끝 계산
    const baseDate = new Date(
      Date.UTC(year, month - 1, 1) - 9 * 60 * 60 * 1000,
    );
    const startDate = kst.startOfMonth(baseDate);
    const endDate = kst.endOfMonth(startDate);

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
    const extraPayments = await prisma.extraPayment.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
        isSettled: false,
      },
    });

    // 일별 데이터 취합
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

    sales.forEach((sale) => {
      totalRevenue += sale.totalPrice;
      const dayKey = format(sale.createdAt, "yyyy-MM-dd");
      if (dailyData[dayKey]) {
        dailyData[dayKey].revenue += sale.totalPrice;
      }
    });

    expenses.forEach((exp) => {
      totalExpense += exp.amount;
      const dayKey = format(exp.date, "yyyy-MM-dd");
      if (dailyData[dayKey]) {
        dailyData[dayKey].expense += exp.amount;
      }
    });

    settlements.forEach((set) => {
      totalExpense += set.totalAmount;
      const dayKey = format(set.createdAt, "yyyy-MM-dd");
      if (dailyData[dayKey]) {
        dailyData[dayKey].expense += set.totalAmount;
      }
    });

    extraPayments.forEach((extra) => {
      totalExpense += extra.amount;
      const dayKey = format(extra.date, "yyyy-MM-dd");
      if (dailyData[dayKey]) {
        dailyData[dayKey].expense += extra.amount;
      }
    });

    Object.keys(dailyData).forEach((key) => {
      dailyData[key].netProfit =
        dailyData[key].revenue - dailyData[key].expense;
    });

    const chartData = Object.entries(dailyData).map(([date, data]) => ({
      date,
      ...data,
    }));

    const commissionSettlements = settlements.filter(
      (s) => s.type === "WEEKLY",
    );
    const laborSettlements = settlements.filter((s) =>
      ["MONTHLY", "SALARY"].includes(s.type),
    );

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

export async function getFinanceStats() {
  try {
    const now = kst.nowKST();
    const today = kst.startOfDay(now);
    const monthStart = kst.startOfMonth(now);
    const monthEnd = kst.endOfMonth(now);

    const todaySales = await prisma.sale.aggregate({
      where: {
        createdAt: { gte: today, lte: kst.endOfDay(today) },
      },
      _sum: { totalPrice: true },
    });

    const monthSales = await prisma.sale.aggregate({
      where: {
        createdAt: { gte: monthStart, lte: monthEnd },
      },
      _sum: { totalPrice: true },
    });

    const monthExpenses = await prisma.expense.aggregate({
      where: {
        date: { gte: monthStart, lte: monthEnd },
      },
      _sum: { amount: true },
    });

    return {
      success: true,
      data: {
        todayRevenue: todaySales._sum.totalPrice || 0,
        monthRevenue: monthSales._sum.totalPrice || 0,
        monthExpense: monthExpenses._sum.amount || 0,
      },
    };
  } catch (error) {
    console.error("Finance Stats Error:", error);
    return { success: false, error: "통계 조회 실패" };
  }
}
