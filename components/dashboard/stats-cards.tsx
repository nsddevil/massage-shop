"use client";

import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Briefcase,
  Calculator,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardsProps {
  data: {
    todayRevenue: number;
    monthNetProfit: number;
    monthProfitRate: number;
    activeStaffCount: number;
    activeStaff?: { name: string; role: string }[];
    pendingExtraAmount: number;
  } | null;
}

export function StatsCards({ data }: StatsCardsProps) {
  const stats = [
    {
      title: "오늘의 매출액",
      value: `₩${(data?.todayRevenue || 0).toLocaleString()}`,
      change: "실시간",
      trend: "up",
      trendLabel: "오늘 하루 집계",
      icon: Wallet,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      title: "현재 근무 인원",
      value: `${data?.activeStaffCount || 0}명`,
      trend: "up",
      trendLabel: "현재 매장 운영 중",
      icon: Briefcase,
      color: "text-zinc-600",
      bgColor: "bg-zinc-50 dark:bg-zinc-900/40",
    },
    {
      title: "이번 달 예상 순이익",
      value: `₩${(data?.monthNetProfit || 0).toLocaleString()}`,
      change: `${(data?.monthProfitRate || 0).toFixed(1)}%`,
      trend: (data?.monthNetProfit || 0) >= 0 ? "up" : "down",
      trendLabel: `수익률 ${(data?.monthProfitRate || 0).toFixed(0)}%`,
      icon: TrendingUp,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
    },
    {
      title: "미정산 가불금",
      value: `₩${(data?.pendingExtraAmount || 0).toLocaleString()}`,
      change: "보류 중",
      trend: "down",
      trendLabel: "정산 필요 항목",
      icon: Calculator,
      color: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-900/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {stats.map((stat, idx) => (
        <Card
          key={idx}
          className="border-none shadow-sm shadow-zinc-200 dark:shadow-none bg-white dark:bg-zinc-900/50 overflow-hidden group transition-all hover:shadow-md"
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-6">
            <CardTitle className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-800 dark:group-hover:text-zinc-200 transition-colors">
              {stat.title}
            </CardTitle>
            <div className={cn("p-2 rounded-xl", stat.bgColor)}>
              <stat.icon className={cn("size-4", stat.color)} />
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              {stat.value}
            </div>

            {stat.title === "현재 근무 인원" &&
              data?.activeStaff &&
              data.activeStaff.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2 overflow-y-auto max-h-[80px] pr-1">
                  {data.activeStaff.map((staff, sIdx) => (
                    <div
                      key={sIdx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800/50 shadow-sm"
                    >
                      <span className="size-1.5 rounded-full bg-blue-500 animate-pulse" />
                      {staff.name}
                      <span className="text-[9px] opacity-70 font-medium">
                        {staff.role}
                      </span>
                    </div>
                  ))}
                </div>
              )}

            <div className="flex items-center gap-2 mt-2">
              <span
                className={cn(
                  "flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                  stat.trend === "up"
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                )}
              >
                {stat.trend === "up" ? (
                  <TrendingUp className="size-3 mr-0.5" />
                ) : (
                  <TrendingDown className="size-3 mr-0.5" />
                )}
                {stat.change || "0%"}
              </span>
              <span className="text-[10px] text-zinc-400 font-medium">
                {stat.trendLabel}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
