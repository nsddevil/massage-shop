"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { CreateCourseInput, UpdateCourseInput } from "@/types";

export async function createCourse(data: CreateCourseInput) {
  try {
    const course = await prisma.course.create({
      data: {
        name: data.name,
        type: data.type,
        duration: data.duration,
        price: data.price,
        isActive: true,
      },
    });
    revalidatePath("/courses");
    return { success: true, data: course };
  } catch (error) {
    console.error("Failed to create course:", error);
    return { success: false, error: "코스 등록에 실패했습니다." };
  }
}

export async function updateCourse(data: UpdateCourseInput) {
  try {
    const { id, ...updateData } = data;
    const updatedCourse = await prisma.course.update({
      where: { id },
      data: updateData,
    });
    revalidatePath("/courses");
    return { success: true, data: updatedCourse };
  } catch (error) {
    console.error("Failed to update course:", error);
    return { success: false, error: "코스 정보 수정에 실패했습니다." };
  }
}

export async function toggleCourseStatus(id: string, isActive: boolean) {
  try {
    await prisma.course.update({
      where: { id },
      data: { isActive },
    });
    revalidatePath("/courses");
    return { success: true };
  } catch (error) {
    console.error("Failed to toggle course status:", error);
    return { success: false, error: "코스 상태 변경에 실패했습니다." };
  }
}

export async function deleteCourse(id: string) {
  try {
    // 매출 내역이 있는지 확인
    const salesCount = await prisma.sale.count({
      where: { courseId: id },
    });

    if (salesCount > 0) {
      return {
        success: false,
        error:
          "매출 내역이 있는 코스는 삭제할 수 없습니다. '숨김' 처리를 이용해주세요.",
      };
    }

    await prisma.course.delete({
      where: { id },
    });
    revalidatePath("/courses");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete course:", error);
    return { success: false, error: "코스 삭제에 실패했습니다." };
  }
}

export async function getCourses() {
  try {
    const courses = await prisma.course.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return { success: true, data: courses };
  } catch (error) {
    console.error("Failed to fetch courses:", error);
    return { success: false, error: "코스 목록을 불러오는데 실패했습니다." };
  }
}
