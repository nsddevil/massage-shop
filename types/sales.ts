import { PayMethod, CourseType } from "@/generated/prisma/enums";

export type { PayMethod };

export const PAY_METHOD_LABELS: Record<PayMethod, string> = {
  CASH: "현금",
  TRANSFER: "이체",
  CARD: "카드",
  HEELY: "힐리",
  MATONG: "마통",
};

export interface SaleTherapistInput {
  employeeId: string;
  isChoice: boolean;
}

export interface CreateSaleInput {
  courseId: string;
  payMethod: PayMethod;
  totalPrice: number;
  therapists: SaleTherapistInput[];
  createdAt?: Date;
}

export interface UpdateSaleInput extends CreateSaleInput {
  id: string;
}

export interface SaleWithDetails {
  id: string;
  courseId: string;
  course: {
    name: string;
    type: CourseType;
    duration: number;
    price: number;
  };
  payMethod: PayMethod;
  totalPrice: number;
  therapists: {
    id: string;
    employeeId: string;
    employee: {
      name: string;
    };
    isChoice: boolean;
    commissionAmount: number;
    choiceFee: number;
  }[];
  createdAt: Date;
}

export interface DailySummary {
  CASH: number;
  TRANSFER: number;
  CARD: number;
  HEELY: number;
  MATONG: number;
  total: number;
}
