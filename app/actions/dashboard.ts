"use server";

import prisma from "@/lib/prisma";
import { subDays, format, eachDayOfInterval } from "date-fns";
import { kst } from "@/lib/date";

export async function getDashboardStats() {
  try {
    const now = kst.nowKST();
    const todayStart = kst.startOfDay(now);
    const todayEnd = kst.endOfDay(now);
    const monthStart = kst.startOfMonth(now);
    const monthEnd = kst.endOfMonth(now);

    // 1. 오늘의 매출
    const todaySales = await prisma.sale.aggregate({
      where: {
        createdAt: { gte: todayStart, lte: todayEnd },
      },
      _sum: { totalPrice: true },
    });

    // 2. 이번 달 매출 및 지출 (순이익 계산용)
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

    const monthSettlements = await prisma.settlement.aggregate({
      where: {
        createdAt: { gte: monthStart, lte: monthEnd },
      },
      _sum: { totalAmount: true },
    });

    const totalRevenue = monthSales._sum.totalPrice || 0;
    const totalExpense =
      (monthExpenses._sum.amount || 0) +
      (monthSettlements._sum.totalAmount || 0);
    const netProfit = totalRevenue - totalExpense;

    // 3. 현재 근무 인원 (아직 퇴근하지 않은 모든 인원)
    const activeAttendances = await prisma.attendance.findMany({
      where: {
        clockOut: null,
      },
      include: {
        employee: {
          select: {
            name: true,
            role: true,
          },
        },
      },
    });

    const roleMap: Record<string, string> = {
      OWNER: "사장",
      MANAGER: "실장",
      THERAPIST: "관리사",
      STAFF: "직원",
    };

    const activeStaff = activeAttendances.map((a) => ({
      name: a.employee.name,
      role: roleMap[a.employee.role] || a.employee.role,
    }));

    // 4. 미정산 가불금
    const pendingExtra = await prisma.extraPayment.aggregate({
      where: { isSettled: false },
      _sum: { amount: true },
    });

    return {
      success: true,
      data: {
        todayRevenue: todaySales._sum.totalPrice || 0,
        monthNetProfit: netProfit,
        monthProfitRate:
          totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0,
        activeStaffCount: activeAttendances.length,
        activeStaff,
        pendingExtraAmount: pendingExtra._sum.amount || 0,
      },
    };
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error);
    return {
      success: false,
      error: "대시보드 통계를 불러오는데 실패했습니다.",
    };
  }
}

export async function getWeeklyRevenue() {
  try {
    const now = kst.nowKST();
    const sevenDaysAgo = subDays(now, 6);
    const startDate = kst.startOfDay(sevenDaysAgo);
    const endDate = kst.endOfDay(now);

    const sales = await prisma.sale.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
      },
      select: {
        totalPrice: true,
        createdAt: true,
      },
    });

    const interval = eachDayOfInterval({ start: startDate, end: endDate });
    const dailyData = interval.map((day) => {
      const dayStr = format(day, "MM/dd");
      const dayTotal = sales
        .filter((sale) => format(sale.createdAt, "MM/dd") === dayStr)
        .reduce((sum, sale) => sum + sale.totalPrice, 0);

      return {
        time: dayStr,
        revenue: dayTotal / 1000, // k 단위로 변환 (기존 차트 형식 유지)
        fullRevenue: dayTotal,
      };
    });

    return { success: true, data: dailyData };
  } catch (error) {
    console.error("Failed to fetch weekly revenue:", error);
    return {
      success: false,
      error: "주간 매출 데이터를 불러오는데 실패했습니다.",
    };
  }
}

export async function getRecentSales() {
  try {
    const sales = await prisma.sale.findMany({
      take: 5,
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

    return {
      success: true,
      data: sales.map((sale) => ({
        id: sale.id,
        date: format(sale.createdAt, "MM/dd"),
        time: format(sale.createdAt, "HH:mm"),
        course: sale.course.name,
        staff: {
          name: sale.therapists[0]?.employee.name || "N/A",
          image: null, // 실제 이미지 필드가 없으므로 null
        },
        payment: {
          method: sale.payMethod,
        },
        amount: sale.totalPrice,
        commission: sale.therapists.reduce(
          (sum, t) => sum + t.commissionAmount + t.choiceFee,
          0,
        ),
        status: "완료",
      })),
    };
  } catch (error) {
    console.error("Failed to fetch recent sales:", error);
    return {
      success: false,
      error: "최근 서비스 내역을 불러오는데 실패했습니다.",
    };
  }
}

export async function getExpenseDistribution() {
  try {
    const now = kst.nowKST();
    const monthStart = kst.startOfMonth(now);
    const monthEnd = kst.endOfMonth(now);

    const expenses = await prisma.expense.findMany({
      where: { date: { gte: monthStart, lte: monthEnd } },
    });

    const settlements = await prisma.settlement.findMany({
      where: { createdAt: { gte: monthStart, lte: monthEnd } },
    });

    const fixedExpense = expenses
      .filter((e) => e.type === "FIXED")
      .reduce((sum, e) => sum + e.amount, 0);

    const generalExpense = expenses
      .filter((e) => e.type === "GENERAL")
      .reduce((sum, e) => sum + e.amount, 0);

    const laborExpense = settlements.reduce((sum, s) => sum + s.totalAmount, 0);

    return {
      success: true,
      data: [
        { name: "인건비", value: laborExpense },
        { name: "고정비", value: fixedExpense },
        { name: "일반지출", value: generalExpense },
      ],
    };
  } catch (error) {
    console.error("Failed to fetch expense distribution:", error);
    return {
      success: false,
      error: "지출 비중 데이터를 불러오는데 실패했습니다.",
    };
  }
}

export async function getPaymentDistribution() {
  try {
    const now = kst.nowKST();
    const monthStart = kst.startOfMonth(now);
    const monthEnd = kst.endOfMonth(now);

    const sales = await prisma.sale.groupBy({
      by: ["payMethod"],
      where: {
        createdAt: { gte: monthStart, lte: monthEnd },
      },
      _sum: { totalPrice: true },
    });

    const labelMap: Record<string, string> = {
      CASH: "현금",
      CARD: "카드",
      TRANSFER: "계좌이체",
      MATONG: "마통",
      HEELY: "힐리",
    };

    const data = sales.map((item) => ({
      name: labelMap[item.payMethod] || item.payMethod,
      value: item._sum.totalPrice || 0,
      method: item.payMethod,
    }));

    return { success: true, data };
  } catch (error) {
    console.error("Failed to fetch payment distribution:", error);
    return {
      success: false,
      error: "결제 수단 비중 데이터를 불러오는데 실패했습니다.",
    };
  }
}

export async function getTopRankings() {
  try {
    const now = kst.nowKST();
    const monthStart = kst.startOfMonth(now);
    const monthEnd = kst.endOfMonth(now);

    // 1. 인기 코스 TOP 3 (판매량 기준)
    const topCourseIds = await prisma.sale.groupBy({
      by: ["courseId"],
      where: {
        createdAt: { gte: monthStart, lte: monthEnd },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
      take: 3,
    });

    const topCourses = await Promise.all(
      topCourseIds.map(async (item) => {
        const course = await prisma.course.findUnique({
          where: { id: item.courseId },
          select: { name: true },
        });
        return {
          name: course?.name || "알 수 없는 코스",
          count: item._count.id,
        };
      }),
    );

    // 2. 인기 관리사 TOP 3 (초이스 수당 기준)
    const topTherapistIds = await prisma.saleTherapist.groupBy({
      by: ["employeeId"],
      where: {
        createdAt: { gte: monthStart, lte: monthEnd },
      },
      _sum: {
        choiceFee: true,
      },
      orderBy: {
        _sum: {
          choiceFee: "desc",
        },
      },
      take: 3,
    });

    const topTherapists = await Promise.all(
      topTherapistIds.map(async (item) => {
        const employee = await prisma.employee.findUnique({
          where: { id: item.employeeId },
          select: { name: true },
        });
        return {
          name: employee?.name || "알 수 없는 관리사",
          amount: item._sum.choiceFee || 0,
        };
      }),
    );

    return {
      success: true,
      data: {
        courses: topCourses,
        therapists: topTherapists,
      },
    };
  } catch (error) {
    console.error("Failed to fetch top rankings:", error);
    return {
      success: false,
      error: "전체 순위 데이터를 불러오는데 실패했습니다.",
    };
  }
}
