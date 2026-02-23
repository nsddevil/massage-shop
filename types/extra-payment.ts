export interface ExtraPayment {
  id: string;
  employeeId: string;
  type: "ADVANCE" | "BONUS";
  amount: number;
  date: Date;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
  employee?: {
    name: string;
  };
}
