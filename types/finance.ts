export interface DailyFinanceData {
  date: string;
  revenue: number;
  expense: number;
  netProfit: number;
}

export interface FinanceData {
  summary: {
    totalRevenue: number;
    totalExpense: number;
    netProfit: number;
    expenseBreakdown: {
      general: number;
      commission: number;
      labor: number;
      extra: number;
    };
  };
  chartData: DailyFinanceData[];
}
