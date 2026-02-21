import { Employee, Settlement, ExtraPayment } from "@/generated/prisma/client";

export type SettlementType = "SALARY" | "WEEKLY";
export type EmployeeSettlementRole = "REGULAR" | "STAFF";

export interface SalaryCalculationDetail {
  baseAmount: number; // 월급제: 기본급(일할계산), 시급제: 시급 * 시간
  mealAllowance: number; // 시급제용 식대 합계
  bonusAmount: number; // 보너스 합계
  advanceAmount: number; // 가불금 합계
  totalAmount: number; // 최종 지급액 (세전/세후 구분 필요시 확장)
}

export interface SalaryCalculationResult {
  employee: Employee;
  roleType: EmployeeSettlementRole;
  period: {
    start: Date;
    end: Date;
    totalDays: number; // 정산 기간 총 일수
    workedDays: number; // 실제 근무일
    totalWorkHours: number; // 총 근무 시간 (시급제용)
  };
  details: SalaryCalculationDetail;
  extraPayments: ExtraPayment[];
}

export interface SettlementWithEmployee extends Settlement {
  employee: {
    id: string;
    name: string;
    role: string;
  };
}
