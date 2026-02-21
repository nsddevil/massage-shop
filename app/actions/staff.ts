"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { CreateEmployeeInput, UpdateEmployeeInput } from "@/types";

export async function updateEmployee(data: UpdateEmployeeInput) {
  try {
    const { id, ...updateData } = data;
    const updatedEmployee = await prisma.employee.update({
      where: { id },
      data: {
        ...updateData,
        joinedAt: updateData.joinedAt
          ? new Date(updateData.joinedAt)
          : undefined,
      },
    });
    revalidatePath("/staff");
    revalidatePath("/attendance");
    revalidatePath("/settlement/salary");
    revalidatePath("/settlement/monthly");
    return { success: true, data: updatedEmployee };
  } catch (error) {
    console.error("Failed to update employee:", error);
    return { success: false, error: "직원 정보 수정에 실패했습니다." };
  }
}

export async function deleteEmployee(id: string) {
  try {
    await prisma.employee.delete({
      where: { id },
    });
    revalidatePath("/staff");
    revalidatePath("/attendance");
    revalidatePath("/settlement/salary");
    revalidatePath("/settlement/monthly");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete employee:", error);
    return { success: false, error: "직원 삭제에 실패했습니다." };
  }
}

export async function resignEmployee(id: string, resignedAt: Date) {
  try {
    await prisma.employee.update({
      where: { id },
      data: { resignedAt },
    });
    revalidatePath("/staff");
    revalidatePath("/attendance");
    revalidatePath("/settlement/salary");
    revalidatePath("/settlement/monthly");
    return { success: true };
  } catch (error) {
    console.error("Failed to resign employee:", error);
    return { success: false, error: "퇴사 처리에 실패했습니다." };
  }
}

export async function restoreEmployee(id: string) {
  try {
    await prisma.employee.update({
      where: { id },
      data: { resignedAt: null },
    });
    revalidatePath("/staff");
    revalidatePath("/attendance");
    revalidatePath("/settlement/salary");
    revalidatePath("/settlement/monthly");
    return { success: true };
  } catch (error) {
    console.error("Failed to restore employee:", error);
    return { success: false, error: "복구 처리에 실패했습니다." };
  }
}

export async function getEmployees(
  options: { includeResigned?: boolean } = { includeResigned: true },
) {
  try {
    const whereClause = options.includeResigned ? {} : { resignedAt: null };
    const employees = await prisma.employee.findMany({
      where: whereClause,
      orderBy: { joinedAt: "desc" },
    });
    return { success: true, data: employees };
  } catch (error) {
    console.error("Failed to fetch employees:", error);
    return { success: false, error: "직원 목록을 불러오는데 실패했습니다." };
  }
}

export async function createEmployee(data: CreateEmployeeInput) {
  try {
    const newEmployee = await prisma.employee.create({
      data: {
        ...data,
        name: data.name,
        phone: data.phone,
        joinedAt: new Date(data.joinedAt),
      },
    });
    revalidatePath("/staff");
    revalidatePath("/attendance");
    revalidatePath("/settlement/salary");
    revalidatePath("/settlement/monthly");
    return { success: true, data: newEmployee };
  } catch (error) {
    console.error("Failed to create employee:", error);
    return { success: false, error: "직원 등록에 실패했습니다." };
  }
}
