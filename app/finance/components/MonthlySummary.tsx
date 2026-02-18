"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  CircleDollarSign,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

interface MonthlySummaryProps {
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
}

export function MonthlySummary({ summary }: MonthlySummaryProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
      {/* Revenue Card */}
      <Card className="border-none shadow-sm shadow-emerald-100 dark:shadow-none bg-emerald-50 dark:bg-emerald-950/20 overflow-hidden group">
        <CardContent className="p-6 relative">
          <div className="space-y-1 relative z-10">
            <p className="text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="size-3" /> 총 매출
            </p>
            <h3 className="text-2xl font-black text-emerald-900 dark:text-emerald-100 tracking-tight">
              ₩{summary.totalRevenue.toLocaleString()}
            </h3>
          </div>
          <ArrowUpRight className="size-16 text-emerald-600/10 absolute -right-2 -bottom-2 group-hover:scale-110 transition-transform" />
        </CardContent>
      </Card>

      {/* Expense Card */}
      <Card className="border-none shadow-sm shadow-orange-100 dark:shadow-none bg-orange-50 dark:bg-orange-950/20 overflow-hidden group">
        <CardContent className="p-6 relative">
          <div className="space-y-1 relative z-10">
            <p className="text-orange-600 dark:text-orange-400 font-bold text-xs uppercase tracking-wider flex items-center gap-2">
              <TrendingDown className="size-3" /> 총 지출
            </p>
            <h3 className="text-2xl font-black text-orange-900 dark:text-orange-100 tracking-tight">
              ₩{summary.totalExpense.toLocaleString()}
            </h3>
            <div className="flex gap-3 pt-2">
              <div className="flex flex-col">
                <span className="text-[10px] text-orange-400 font-bold">
                  일반/고정
                </span>
                <span className="text-xs font-bold text-orange-700 dark:text-orange-300">
                  ₩{summary.expenseBreakdown.general.toLocaleString()}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-orange-400 font-bold">
                  커미션
                </span>
                <span className="text-xs font-bold text-orange-700 dark:text-orange-300">
                  ₩{summary.expenseBreakdown.commission.toLocaleString()}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-orange-400 font-bold">
                  인건비
                </span>
                <span className="text-xs font-bold text-orange-700 dark:text-orange-300">
                  ₩{summary.expenseBreakdown.labor.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
          <ArrowDownRight className="size-16 text-orange-600/10 absolute -right-2 -bottom-2 group-hover:scale-110 transition-transform" />
        </CardContent>
      </Card>

      {/* Net Profit Card */}
      <Card className="border-none shadow-lg shadow-blue-100 dark:shadow-none bg-blue-600 overflow-hidden group">
        <CardContent className="p-6 relative">
          <div className="space-y-1 relative z-10">
            <p className="text-blue-100/80 font-bold text-xs uppercase tracking-wider flex items-center gap-2">
              <CircleDollarSign className="size-3" /> 최종 순이익
            </p>
            <h3 className="text-2xl font-black text-white tracking-tight">
              ₩{summary.netProfit.toLocaleString()}
            </h3>
            <p className="text-[11px] text-blue-100 font-medium">
              이번 달 예상 실이익입니다.
            </p>
          </div>
          <Wallet className="size-20 text-white/10 absolute -right-4 -bottom-4 group-hover:rotate-12 transition-transform" />
        </CardContent>
      </Card>
    </div>
  );
}
