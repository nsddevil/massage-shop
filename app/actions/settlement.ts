"use server";

import prisma from "@/lib/prisma";
import {
  startOfDay,
  endOfDay,
  differenceInCalendarDays,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import { revalidatePath } from "next/cache";
import {
  SalaryCalculationResult,
  SalaryCalculationDetail,
  EmployeeSettlementRole,
} from "@/types";
import { Prisma } from "@/generated/prisma/client";

type SettlementWithEmployee = Prisma.SettlementGetPayload<{
  include: { employee: { select: { id: true; name: true; role: true } } };
}>;

/**
 * 월급 정산 대상 직원 리스트 조회
 */
export async function getEmployeeListForSalary() {
  try {
    const employees = await prisma.employee.findMany({
      where: {
        resignedAt: null,
      },
      orderBy: { name: "asc" },
    });

    // 각 직원의 마지막 정산 내역 조회하여 다음 정산 시작일 제안용 데이터 포함
    const employeesWithLastSettlement = await Promise.all(
      employees.map(async (emp) => {
        const lastSettlement = await prisma.settlement.findFirst({
          where: { employeeId: emp.id, type: "SALARY" },
          orderBy: { createdAt: "desc" },
        });

        return {
          ...emp,
          lastSettlementEnd: lastSettlement?.periodEnd || null,
          lastSettlementAt: lastSettlement?.createdAt || null,
        };
      }),
    );

    return { success: true, data: employeesWithLastSettlement };
  } catch (error) {
    console.error("Failed to fetch employee list for salary:", error);
    return { success: false, error: "직원 목록을 불러오는데 실패했습니다." };
  }
}

/**
 * 실시간 급여 계산 (프리뷰)
 */
export async function calculateSalaryAction(
  employeeId: string,
  startDate: Date,
  endDate: Date,
): Promise<{
  success: boolean;
  data?: SalaryCalculationResult;
  error?: string;
}> {
  try {
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) throw new Error("직원을 찾을 수 없습니다.");

    const start = startOfDay(startDate);
    const end = endOfDay(endDate);

    // 1. 출퇴근 기록 조회
    const attendances = await prisma.attendance.findMany({
      where: {
        employeeId,
        date: { gte: start, lte: end },
        clockOut: { not: null },
      },
    });

    // 2. 추가 수당(보너스, 가불) 조회
    const extras = await prisma.extraPayment.findMany({
      where: {
        employeeId,
        date: { gte: start, lte: end },
        isSettled: false,
      },
    });

    const workedDays = attendances.length;
    const totalWorkHours = attendances.reduce(
      (sum, att) => sum + (att.workHours || 0),
      0,
    );
    const periodTotalDays = differenceInCalendarDays(end, start) + 1;

    let baseAmount = 0;
    let mealAllowance = 0;
    let bonusAmount = 0;
    let advanceAmount = 0;
    let roleType: EmployeeSettlementRole = "REGULAR";

    // 보너스/가불 합산
    extras.forEach((ex) => {
      if (ex.type === "BONUS") bonusAmount += ex.amount;
      if (ex.type === "ADVANCE") advanceAmount += ex.amount;
    });

    if (employee.role === "STAFF") {
      roleType = "STAFF";
      // 시급제: (시간 * 시급) + (일수 * 식대)
      baseAmount = Math.floor(totalWorkHours * (employee.hourlyRate || 0));
      mealAllowance = workedDays * (employee.mealAllowance || 0);
    } else {
      roleType = "REGULAR";
      // 정규직: (기본급 / 기간총일수) * 실제근무일수
      const dailyRate = (employee.baseSalary || 0) / periodTotalDays;
      baseAmount = Math.floor(dailyRate * workedDays);
    }

    const totalAmount =
      baseAmount + mealAllowance + bonusAmount - advanceAmount;

    return {
      success: true,
      data: {
        employee,
        roleType,
        period: {
          start,
          end,
          totalDays: periodTotalDays,
          workedDays,
          totalWorkHours,
        },
        details: {
          baseAmount,
          mealAllowance,
          bonusAmount,
          advanceAmount,
          totalAmount: Math.ceil(Math.max(0, totalAmount) / 100) * 100,
        },
        extraPayments: extras,
      },
    };
  } catch (error) {
    console.error("Failed to calculate salary:", error);
    return { success: false, error: "급여 계산에 실패했습니다." };
  }
}

/**
 * 월급 정산 확정 및 저장
 */
export async function confirmSalarySettlement(result: SalaryCalculationResult) {
  try {
    const { employee, period, details, extraPayments } = result;

    await prisma.$transaction(async (tx) => {
      // 1. 정산 기록 생성
      await tx.settlement.create({
        data: {
          employeeId: employee.id,
          type: "SALARY",
          periodStart: period.start,
          periodEnd: period.end,
          totalDaysInPeriod: period.totalDays,
          workedDays: period.workedDays,
          totalAmount: details.totalAmount,
          details: details as unknown as Prisma.InputJsonValue,
        },
      });

      // 2. 포함된 추가 수당 정산 완료 처리
      if (extraPayments.length > 0) {
        await tx.extraPayment.updateMany({
          where: { id: { in: extraPayments.map((p) => p.id) } },
          data: { isSettled: true },
        });
      }
    });

    revalidatePath("/settlement/salary");
    revalidatePath("/settlement/salary/history");
    return { success: true };
  } catch (error) {
    console.error("Failed to confirm salary settlement:", error);
    return { success: false, error: "정산 저장에 실패했습니다." };
  }
}

/**
 * 정산 내역 조회
 */
export async function getSalarySettlementHistory(
  year?: number,
  month?: number,
) {
  try {
    const where: Prisma.SettlementWhereInput = {
      type: "SALARY",
    };

    if (year && month) {
      const start = startOfMonth(new Date(year, month - 1, 1));
      const end = endOfMonth(new Date(year, month - 1, 1));
      where.createdAt = { gte: start, lte: end };
    }

    const history = await prisma.settlement.findMany({
      where,
      include: {
        employee: {
          select: { id: true, name: true, role: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      data: history as unknown as SettlementWithEmployee[],
    };
  } catch (error) {
    console.error("Failed to fetch salary history:", error);
    return { success: false, error: "정산 내역을 불러오는데 실패했습니다." };
  }
}

/**
 * 정산 현황 통계 조회
 */
export async function getSalarySettlementStats(year: number, month: number) {
  try {
    const start = startOfMonth(new Date(year, month - 1, 1));
    const end = endOfMonth(new Date(year, month - 1, 1));

    // 1. 이번 달 정산 완료 건수 (createdAt 기준)
    const settledCount = await prisma.settlement.count({
      where: {
        type: "SALARY",
        createdAt: { gte: start, lte: end },
      },
    });

    // 2. 미지급 가불금 합계 (isSettled: false)
    const unpaidAdvance = await prisma.extraPayment.aggregate({
      where: {
        type: "ADVANCE",
        isSettled: false,
      },
      _sum: {
        amount: true,
      },
    });

    return {
      success: true,
      data: {
        settledCount,
        unpaidAdvanceAmount: unpaidAdvance._sum.amount || 0,
      },
    };
  } catch (error) {
    console.error("Failed to fetch salary stats:", error);
    return { success: false, error: "통계 정보를 불러오는데 실패했습니다." };
  }
}

/**
 * 정산 확정 (데이터 저장)
 */
export async function confirmSettlement(data: {
  employeeId: string;
  type: string;
  periodStart: Date | string;
  periodEnd: Date | string;
  totalDaysInPeriod: number;
  workedDays: number;
  totalAmount: number;
  details: SalaryCalculationDetail;
  extraIds: string[];
}) {
  try {
    const periodStart = new Date(data.periodStart);
    const periodEnd = new Date(data.periodEnd);

    await prisma.$transaction(async (tx) => {
      await tx.settlement.create({
        data: {
          employeeId: data.employeeId,
          type: data.type,
          periodStart: periodStart,
          periodEnd: periodEnd,
          totalDaysInPeriod: data.totalDaysInPeriod,
          workedDays: data.workedDays,
          totalAmount: data.totalAmount,
          details: {
            ...data.details,
            extraIds: data.extraIds,
          } as unknown as Prisma.InputJsonValue,
        },
      });

      if (data.extraIds && data.extraIds.length > 0) {
        await tx.extraPayment.updateMany({
          where: { id: { in: data.extraIds } },
          data: { isSettled: true },
        });
      }
    });

    revalidatePath("/settlement/monthly");
    return { success: true };
  } catch (error) {
    console.error("Failed to confirm settlement:", error);
    return { success: false, error: "정산 처리에 실패했습니다." };
  }
}

/**
 * 주간 정산 데이터 조회
 */
export async function getWeeklySettlementData(startDate: Date, endDate: Date) {
  try {
    const start = startOfDay(startDate);
    const end = endOfDay(endDate);

    // 1. 관리사(THERAPIST)만 조회 (실장은 주급 제외)
    const therapists = await prisma.employee.findMany({
      where: {
        role: "THERAPIST",
        resignedAt: null,
      },
    });

    const items = await Promise.all(
      therapists.map(async (therapist) => {
        const commissions = await prisma.saleTherapist.findMany({
          where: {
            employeeId: therapist.id,
            sale: {
              createdAt: { gte: start, lte: end },
            },
          },
          include: {
            sale: { include: { course: true } },
          },
        });

        // 주급에서는 보너스/가불금 제외 (월급에서 처리)
        // 화면 표시용으로 조회는 할 수 있으나, 정산 금액에는 포함하지 않음
        /* 
        /* 
        const items = await prisma.extraPayment.findMany({
          where: {
            employeeId: therapist.id,
            date: { gte: start, lte: end },
            isSettled: false,
          },
        });
        */

        const salesCount = commissions.length;
        const totalCommission = commissions.reduce(
          (sum, c) => sum + c.commissionAmount,
          0,
        );
        const totalChoiceFee = commissions.reduce(
          (sum, c) => sum + c.choiceFee,
          0,
        );

        // 보너스/가불금 0 처리
        const totalBonus = 0;
        const totalAdvance = 0;

        // 주급 = 커미션 + 지명수당
        const netAmount = totalCommission + totalChoiceFee;

        const existingSettlement = await prisma.settlement.findFirst({
          where: {
            employeeId: therapist.id,
            type: "WEEKLY",
            periodStart: { gte: start },
            periodEnd: { lte: end },
          },
        });

        return {
          therapist: { id: therapist.id, name: therapist.name },
          salesCount,
          totalCommission,
          totalChoiceFee,
          totalBonus,
          totalAdvance,
          netAmount,
          isAlreadySettled: !!existingSettlement,
          settlementId: existingSettlement?.id || null,
          details: {
            sales: commissions.map((c) => ({
              id: c.sale.id,
              date: c.sale.createdAt,
              courseName: c.sale.course.name,
              amount: c.commissionAmount + c.choiceFee,
            })),
            extras: [], // 주급 명세서에는 추가 수당 표시 안 함
          },
        };
      }),
    );

    const activeItems = items.filter(
      (item) => item.salesCount > 0 || item.isAlreadySettled,
    );

    return { success: true, data: activeItems };
  } catch (error) {
    console.error("Failed to fetch weekly settlement data:", error);
    return { success: false, error: "데이터 조회 중 오류가 발생했습니다." };
  }
}

/**
 * 주급 정산 생성
 */
export async function createSettlement(data: {
  employeeId: string;
  type: string;
  periodStart: Date;
  periodEnd: Date;
  totalAmount: number;
  details: SalaryCalculationDetail;
  extraPaymentIds: string[];
}) {
  try {
    await prisma.$transaction(async (tx) => {
      await tx.settlement.create({
        data: {
          employeeId: data.employeeId,
          type: data.type,
          periodStart: data.periodStart,
          periodEnd: data.periodEnd,
          totalAmount: data.totalAmount,
          details: {
            ...data.details,
            extraIds: data.extraPaymentIds,
          } as unknown as Prisma.InputJsonValue,
        },
      });

      if (data.extraPaymentIds.length > 0) {
        await tx.extraPayment.updateMany({
          where: { id: { in: data.extraPaymentIds } },
          data: { isSettled: true },
        });
      }
    });

    revalidatePath("/settlement/weekly");
    return { success: true };
  } catch (error) {
    console.error("Failed to create weekly settlement:", error);
    return { success: false, error: "정산 생성에 실패했습니다." };
  }
}
/**
 * 월간 정산 대상자 목록 조회
 */
export async function getMonthlySettlementCandidates(
  year: number,
  month: number,
) {
  try {
    const start = startOfMonth(new Date(year, month - 1, 1));
    const end = endOfMonth(new Date(year, month - 1, 1));

    const employees = await prisma.employee.findMany({
      where: { resignedAt: null },
    });

    const candidates = await Promise.all(
      employees.map(async (employee) => {
        const calcRes = await calculateSalaryAction(employee.id, start, end);
        if (!calcRes.success || !calcRes.data) return null;

        const { period, details, extraPayments } = calcRes.data;

        // 이미 정산되었는지 확인
        const existing = await prisma.settlement.findFirst({
          where: {
            employeeId: employee.id,
            type: "SALARY",
            periodStart: start,
            periodEnd: end,
          },
        });

        return {
          employee,
          period: { start, end },
          stats: {
            workedDays: period.workedDays,
            totalWorkHours: period.totalWorkHours,
            periodTotalDays: period.totalDays,
          },
          details: {
            baseAmount: details.baseAmount,
            mealAllowance: details.mealAllowance,
            bonusAmount: details.bonusAmount,
            advanceAmount: details.advanceAmount,
            totalAmount: details.totalAmount,
          },
          totalAmount: details.totalAmount,
          extras: extraPayments,
          isSettled: !!existing,
          settlementId: existing?.id,
        };
      }),
    );

    return {
      success: true,
      data: candidates.filter((c) => c !== null),
    };
  } catch (error) {
    console.error("Failed to fetch monthly settlement candidates:", error);
    return {
      success: false,
      error: "정산 대상자 정보를 불러오는데 실패했습니다.",
    };
  }
}

/**
 * 정산 삭제
 */
export async function deleteSettlement(id: string) {
  try {
    const settlement = await prisma.settlement.findUnique({
      where: { id },
    });

    if (!settlement) {
      return { success: false, error: "정산 내역을 찾을 수 없습니다." };
    }

    await prisma.$transaction(async (tx) => {
      // 1. 관련된 추가 수당(ExtraPayment)이 있다면 미정산 상태로 복구
      // details JSON에 extraIds 혹은 관련 정보가 있는지 확인 (SALARY 정산의 경우)
      const details = settlement.details as { extraIds?: string[] };
      if (details.extraIds && details.extraIds.length > 0) {
        await tx.extraPayment.updateMany({
          where: { id: { in: details.extraIds } },
          data: { isSettled: false },
        });
      }

      // 2. 정산 기록 삭제
      await tx.settlement.delete({
        where: { id },
      });
    });

    // 3. 관련 페이지 재검증 (대시보드, 경영분석 포함)
    revalidatePath("/");
    revalidatePath("/finance");
    revalidatePath("/settlement/weekly");
    revalidatePath("/settlement/salary/history");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete settlement:", error);
    return { success: false, error: "정산 삭제에 실패했습니다." };
  }
}
