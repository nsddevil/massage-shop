"use server";

import prisma from "@/lib/prisma";
import { ActionResponse, UsersResponse } from "@/types";
import { revalidatePath } from "next/cache";
import { validateOwner } from "@/lib/auth-util";

/**
 * 직원과 코스를 제외한 모든 영업 데이터 초기화
 * - 매출, 정산, 지출, 근태, 가불금 내역 삭제
 */
export async function resetBusinessData(): Promise<ActionResponse> {
  try {
    await validateOwner();
    await prisma.$transaction(async (tx) => {
      // 1. 매출 상세 기록 삭제
      await tx.saleTherapist.deleteMany();

      // 2. 매출 기록 삭제
      await tx.sale.deleteMany();

      // 3. 정산 내역 삭제
      await tx.settlement.deleteMany();

      // 4. 가불금 및 보너스 삭제
      await tx.extraPayment.deleteMany();

      // 5. 근태 기록 삭제
      await tx.attendance.deleteMany();

      // 6. 지출 내역 삭제
      await tx.expense.deleteMany();
    });

    // 전체 캐시 갱신
    revalidatePath("/");
    revalidatePath("/finance");
    revalidatePath("/sales");
    revalidatePath("/settlement/weekly");
    revalidatePath("/settlement/salary");
    revalidatePath("/expenses");
    revalidatePath("/attendance");

    return { success: true };
  } catch (error) {
    console.error("Failed to reset business data:", error);
    return { success: false, error: "데이터 초기화에 실패했습니다." };
  }
}

/**
 * 모든 사용자 목록 조회
 */
export async function getUsers(): Promise<UsersResponse> {
  try {
    const authCheck = await validateOwner();
    if (!authCheck.success) return authCheck;

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        createdAt: true,
      },
    });

    return { success: true, data: users };
  } catch (error) {
    console.error("Failed to get users:", error);
    return { success: false, error: "사용자 목록을 불러오는데 실패했습니다." };
  }
}

/**
 * 사용자 권한 업데이트
 */
export async function updateUserRole(
  userId: string,
  role: string,
): Promise<ActionResponse> {
  try {
    const authCheck = await validateOwner();
    if (!authCheck.success) return authCheck;

    await prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Failed to update user role:", error);
    return { success: false, error: "권한 업데이트에 실패했습니다." };
  }
}
