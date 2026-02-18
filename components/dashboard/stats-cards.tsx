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

const stats = [
  {
    title: "총 매출액",
    value: "₩12,450,000",
    change: "+12%",
    trend: "up",
    trendLabel: "어제 대비",
    icon: Wallet,
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
  },
  {
    title: "총 지출액",
    value: "₩4,200,000",
    details: [
      { label: "고정비", value: "₩1,200,000" },
      { label: "인건비/변동비", value: "₩3,000,000" },
    ],
    icon: Briefcase,
    color: "text-zinc-600",
    bgColor: "bg-zinc-50 dark:bg-zinc-900/40",
  },
  {
    title: "순이익",
    value: "₩8,250,000",
    change: "+15%",
    trend: "up",
    trendLabel: "수익률 66%",
    icon: TrendingUp,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
  },
  {
    title: "반올림 조정",
    value: "-₩40,000",
    change: "-0.1%",
    trend: "down",
    trendLabel: "자동 보정",
    icon: Calculator,
    color: "text-red-600",
    bgColor: "bg-red-50 dark:bg-red-900/20",
  },
];

export function StatsCards() {
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

            {stat.details ? (
              <div className="mt-4 space-y-2">
                {stat.details.map((detail, dIdx) => (
                  <div
                    key={dIdx}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="text-zinc-400 font-medium">
                      {detail.label}
                    </span>
                    <span className="text-zinc-900 dark:text-zinc-300 font-bold">
                      {detail.value}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
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
                  {stat.change}
                </span>
                <span className="text-[10px] text-zinc-400 font-medium">
                  {stat.trendLabel}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
