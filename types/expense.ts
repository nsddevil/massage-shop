export interface Expense {
  id: string;
  type: "FIXED" | "GENERAL";
  category: string;
  amount: number;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}
