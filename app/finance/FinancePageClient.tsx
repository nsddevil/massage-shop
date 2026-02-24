"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/dashboard/header";
import {
  CircleDollarSign,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  CreditCard,
  Banknote,
  Smartphone,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MonthlySummary } from "./components/MonthlySummary";
import { FinanceChart } from "./components/FinanceChart";
import { getMonthlyFinance } from "@/app/actions/finance";
import { format, addMonths, subMonths } from "date-fns";
import { ko } from "date-fns/locale";
import { FinanceData } from "@/types";

// FinanceData interface moved to types/finance.ts

export function FinancePageClient({
  initialData,
  initialDate,
}: {
  initialData: FinanceData;
  initialDate?: string;
}) {
  const [mounted, setMounted] = useState(false);
  const [currentDate, setCurrentDate] = useState(
    initialDate ? new Date(initialDate) : new Date(),
  );
  const [data, setData] = useState<FinanceData>(initialData);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const fetchFinanceData = async (date: Date) => {
    setIsLoading(true);
    const result = await getMonthlyFinance(
      date.getFullYear(),
      date.getMonth() + 1,
    );
    if (result.success && result.data) {
      setData(result.data as FinanceData);
    }
    setIsLoading(false);
  };

  const handlePrevMonth = () => {
    const newDate = subMonths(currentDate, 1);
    setCurrentDate(newDate);
    fetchFinanceData(newDate);
  };

  const handleNextMonth = () => {
    const newDate = addMonths(currentDate, 1);
    setCurrentDate(newDate);
    fetchFinanceData(newDate);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
      <Header />

      <main className="flex-1 overflow-y-auto bg-zinc-50/50 dark:bg-zinc-950 p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 pb-12">
          {/* Header Section */}
          <div className="flex flex-col items-center md:items-start md:flex-row md:justify-between gap-4">
            <div className="space-y-1 text-center md:text-left">
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center justify-center md:justify-start gap-3">
                <CircleDollarSign className="size-6 text-blue-600" />
                월별 경영 분석
              </h1>
              <p className="text-sm font-medium text-zinc-500">
                월간 매출, 지출 및 실질 손이익을 분석하여 보여줍니다.
              </p>
            </div>

            {/* Month Selector */}
            <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 p-1.5 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 w-fit">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrevMonth}
                className="size-9 rounded-xl text-zinc-500"
              >
                <ChevronLeft className="size-5" />
              </Button>
              <div className="flex items-center gap-2 px-3 min-w-[140px] justify-center">
                <CalendarIcon className="size-4 text-blue-600" />
                <span className="text-sm font-black text-zinc-900 dark:text-zinc-100">
                  {format(currentDate, "yyyy년 MM월", { locale: ko })}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNextMonth}
                disabled={!mounted || currentDate >= new Date()}
                className="size-9 rounded-xl text-zinc-500"
              >
                <ChevronRight className="size-5" />
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-4">
              <div className="size-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-zinc-500 font-bold">데이터 분석 중...</p>
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <MonthlySummary summary={data.summary} />

              {/* Chart Section */}
              <FinanceChart data={data.chartData} />

              {/* Detailed Info (Optional) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-none shadow-sm shadow-zinc-200 dark:shadow-none bg-white dark:bg-zinc-900">
                  <div className="p-6 border-b border-zinc-100 dark:border-zinc-800">
                    <h3 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                      <TrendingUp className="size-4 text-emerald-600" />
                      지출 상세 비중
                    </h3>
                  </div>
                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="size-8 bg-orange-100 dark:bg-orange-950/40 rounded-lg flex items-center justify-center">
                            <Banknote className="size-4 text-orange-600" />
                          </div>
                          <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
                            일반/고정 지출
                          </span>
                        </div>
                        <span className="font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
                          ₩
                          {data.summary.expenseBreakdown.general.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="size-8 bg-blue-100 dark:bg-blue-950/40 rounded-lg flex items-center justify-center">
                            <CreditCard className="size-4 text-blue-600" />
                          </div>
                          <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
                            커미션 정산 (주급)
                          </span>
                        </div>
                        <span className="font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
                          ₩
                          {data.summary.expenseBreakdown.commission.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="size-8 bg-cyan-100 dark:bg-cyan-950/40 rounded-lg flex items-center justify-center">
                            <CreditCard className="size-4 text-cyan-600" />
                          </div>
                          <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
                            인건비 정산 (월급)
                          </span>
                        </div>
                        <span className="font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
                          ₩
                          {data.summary.expenseBreakdown.labor.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="size-8 bg-purple-100 dark:bg-purple-950/40 rounded-lg flex items-center justify-center">
                            <Smartphone className="size-4 text-purple-600" />
                          </div>
                          <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
                            기타 및 추가 지급
                          </span>
                        </div>
                        <span className="font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
                          ₩
                          {data.summary.expenseBreakdown.extra.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm shadow-zinc-200 dark:shadow-none bg-white dark:bg-zinc-900">
                  <div className="p-6 border-b border-zinc-100 dark:border-zinc-800">
                    <h3 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                      <MoreHorizontal className="size-4 text-zinc-400" />
                      재무 인사이트
                    </h3>
                  </div>
                  <CardContent className="p-6 flex flex-col justify-center h-[200px] text-center space-y-2">
                    <p className="text-zinc-500 text-sm font-medium">
                      {data.summary.netProfit > 0
                        ? "이번 달은 안정적인 수익 구조를 유지하고 있습니다."
                        : "이번 달은 지출이 매출보다 많습니다. 지출 항목을 점검해 보세요."}
                    </p>
                    <div className="pt-2">
                      <span
                        className={`text-2xl font-black ${data.summary.netProfit > 0 ? "text-blue-600" : "text-red-600"}`}
                      >
                        수익률:{" "}
                        {data.summary.totalRevenue > 0
                          ? (
                              (data.summary.netProfit /
                                data.summary.totalRevenue) *
                              100
                            ).toFixed(1)
                          : 0}
                        %
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
