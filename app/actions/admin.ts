"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * 직원과 코스를 제외한 모든 영업 데이터 초기화
 * - 매출, 정산, 지출, 근태, 가불금 내역 삭제
 */
export async function resetBusinessData() {
  try {
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
