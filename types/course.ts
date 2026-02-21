import { CourseType } from "@/generated/prisma/enums";
export { CourseType };

export interface Course {
  id: string;
  name: string;
  type: CourseType;
  duration: number; // 소요 시간 (분)
  price: number; // 금액
  isActive: boolean; // 활성화 여부
  createdAt: Date;
  updatedAt: Date;
}

export type CreateCourseInput = Omit<
  Course,
  "id" | "createdAt" | "updatedAt" | "isActive"
>;

export type UpdateCourseInput = Partial<CreateCourseInput> & {
  id: string;
  isActive?: boolean;
};

export const COURSE_TYPE_LABELS: Record<CourseType, string> = {
  SINGLE: "관리사 1인",
  DOUBLE: "관리사 2인",
};
