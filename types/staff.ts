export enum Role {
  OWNER = "OWNER",
  MANAGER = "MANAGER",
  THERAPIST = "THERAPIST",
  STAFF = "STAFF",
}

export interface Employee {
  id: string;
  name: string;
  phone?: string | null;
  role: Role;
  joinedAt: Date;
  resignedAt?: Date | null;
  baseSalary?: number | null;
  hourlyRate?: number | null;
  mealAllowance?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateEmployeeInput = Omit<
  Employee,
  "id" | "createdAt" | "updatedAt" | "resignedAt"
>;

export type UpdateEmployeeInput = Partial<CreateEmployeeInput> & { id: string };

export const ROLE_LABELS: Record<Role, string> = {
  OWNER: "사장",
  MANAGER: "실장",
  THERAPIST: "관리사",
  STAFF: "직원",
};
