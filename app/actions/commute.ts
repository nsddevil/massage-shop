"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { subDays, differenceInMinutes } from "date-fns";
import { kst } from "@/lib/date";

/**
 * 현재 시간을 기준으로 영업일(Business Date)을 계산합니다.
 * - 기준: 새벽 06:00 이전이면 전날을 영업일로 간주
 */
function getBusinessDate(date: Date = kst.nowKST()) {
  const hours = date.getHours();
  if (hours < 6) {
    return kst.startOfDay(subDays(date, 1));
  }
  return kst.startOfDay(date);
}

/**
 * 출근 처리
 */
export async function clockIn(employeeId: string) {
  try {
    const now = kst.nowKST();
    const businessDate = getBusinessDate(now);

    // 이미 출근 중인지 확인 (아직 퇴근 안 한 기록이 있는지)
    const existingActiveRecord = await prisma.attendance.findFirst({
      where: {
        employeeId,
        clockOut: null,
      },
    });

    if (existingActiveRecord) {
      return { success: false, error: "이미 근무 중입니다." };
    }

    // 출근 기록 생성
    await prisma.attendance.create({
      data: {
        employeeId,
        date: businessDate,
        clockIn: now,
      },
    });

    revalidatePath("/attendance");
    return { success: true };
  } catch (error) {
    console.error("ClockIn Error:", error);
    return { success: false, error: "출근 처리에 실패했습니다." };
  }
}

/**
 * 퇴근 처리
 */
export async function clockOut(employeeId: string) {
  try {
    const now = kst.nowKST();

    // 가장 최근의 미종료 출근 기록 찾기
    const attendance = await prisma.attendance.findFirst({
      where: {
        employeeId,
        clockOut: null,
      },
      orderBy: {
        clockIn: "desc",
      },
    });

    if (!attendance) {
      return { success: false, error: "출근 기록이 없습니다." };
    }

    // 근무 시간 계산 (시간 단위, 소수점)
    const minutesWorked = differenceInMinutes(now, attendance.clockIn);
    const workHours = parseFloat((minutesWorked / 60).toFixed(2));

    // 퇴근 기록 업데이트
    await prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        clockOut: now,
        workHours,
      },
    });

    revalidatePath("/attendance");
    return { success: true };
  } catch (error) {
    console.error("ClockOut Error:", error);
    return { success: false, error: "퇴근 처리에 실패했습니다." };
  }
}

/**
 * 오늘의 직원별 출퇴근 현황 조회
 */
export async function getTodayCommuteStatus() {
  try {
    const now = kst.nowKST();
    const businessDate = getBusinessDate(now);

    // 1. 전체 직원 목록 (퇴직자 제외)
    const employees = await prisma.employee.findMany({
      where: { resignedAt: null },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        role: true,
        // 아바타 이미지는 클라이언트에서 처리 (pravatar)
      },
    });

    // 2. 오늘의 근태 기록 조회
    const todayAttendances = await prisma.attendance.findMany({
      where: {
        date: businessDate,
      },
    });

    // 3. 데이터 병합
    const statusList = employees.map((emp) => {
      const myRecords = todayAttendances.filter((a) => a.employeeId === emp.id);

      // 상태 결정 로직
      // 1. 현재 근무 중 (퇴근 안 함)
      const activeRecord = myRecords.find((a) => a.clockOut === null);

      // 2. 퇴근 완료 (오늘 기록은 있지만 모두 퇴근 처리됨)
      const hasFinishedRecord = myRecords.length > 0 && !activeRecord;

      let status: "OFF" | "WORKING" | "DONE" = "OFF";
      let lastClockIn = null;
      let lastClockOut = null;

      if (activeRecord) {
        status = "WORKING";
        lastClockIn = activeRecord.clockIn;
      } else if (hasFinishedRecord) {
        status = "DONE";
        // 가장 마지막 퇴근 기록
        const lastRecord = myRecords.sort(
          (a, b) => b.clockOut!.getTime() - a.clockOut!.getTime(),
        )[0];
        lastClockIn = lastRecord.clockIn;
        lastClockOut = lastRecord.clockOut;
      }

      return {
        ...emp,
        status,
        clockInTime: lastClockIn,
        clockOutTime: lastClockOut,
      };
    });

    // 정렬: WORKING -> DONE -> OFF 순서로 보기 좋게
    const sortedList = statusList.sort((a, b) => {
      const score = (status: string) => {
        if (status === "WORKING") return 3;
        if (status === "DONE") return 2;
        return 1;
      };
      return score(b.status) - score(a.status);
    });

    return { success: true, data: sortedList, businessDate };
  } catch (error) {
    console.error("GetStatus Error:", error);
    return { success: false, error: "현황 조회 실패" };
  }
}

/**
 * 출퇴근 기록 조회 (History)
 */
export async function getCommuteHistory(
  startDate: Date,
  endDate: Date,
  employeeId?: string,
) {
  try {
    const whereClause: any = {
      date: {
        gte: kst.startOfDay(startDate),
        lte: kst.endOfDay(endDate),
      },
    };

    if (employeeId && employeeId !== "ALL") {
      whereClause.employeeId = employeeId;
    }

    const history = await prisma.attendance.findMany({
      where: whereClause,
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

    return { success: true, data: history };
  } catch (error) {
    console.error("GetHistory Error:", error);
    return { success: false, error: "기록 조회 실패" };
  }
}

/**
 * 출퇴근 기록 수정
 */
export async function updateCommuteRecord(
  id: string,
  data: { clockIn: Date; clockOut: Date | null },
) {
  try {
    let workHours = null;

    if (data.clockOut) {
      const minutesWorked = differenceInMinutes(data.clockOut, data.clockIn);
      workHours = parseFloat((minutesWorked / 60).toFixed(2));
    }

    await prisma.attendance.update({
      where: { id },
      data: {
        clockIn: data.clockIn,
        clockOut: data.clockOut,
        workHours,
      },
    });

    revalidatePath("/attendance/history");
    return { success: true };
  } catch (error) {
    console.error("UpdateRecord Error:", error);
    return { success: false, error: "기록 수정 실패" };
  }
}

/**
 * 출퇴근 기록 삭제
 */
export async function deleteCommuteRecord(id: string) {
  try {
    await prisma.attendance.delete({
      where: { id },
    });

    revalidatePath("/attendance/history");
    return { success: true };
  } catch (error) {
    console.error("DeleteRecord Error:", error);
    return { success: false, error: "기록 삭제 실패" };
  }
}
