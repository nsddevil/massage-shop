"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { DailyFinanceData } from "@/types";

interface FinanceChartProps {
  data: DailyFinanceData[];
}

interface TooltipEntry {
  name: string;
  value: number;
  color: string;
}

export function FinanceChart({ data }: FinanceChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Card className="border-none shadow-sm shadow-zinc-200 dark:shadow-none bg-white dark:bg-zinc-900 overflow-hidden">
      <CardHeader className="p-6 pb-0">
        <CardTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
          재무 추이
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="h-[350px] min-h-[350px] w-full">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient
                    id="colorNetProfit"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                  className="dark:stroke-zinc-800"
                />
                <XAxis
                  dataKey="date"
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => value.split("-")[2]} // 일자만 표시
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) =>
                    `₩${(value / 10000).toLocaleString()}만`
                  }
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white dark:bg-zinc-900 p-4 border border-zinc-100 dark:border-zinc-800 shadow-xl rounded-2xl">
                          <p className="text-sm font-bold mb-2 text-zinc-500">
                            {label}
                          </p>
                          <div className="space-y-1.5">
                            {(payload as unknown as TooltipEntry[]).map(
                              (entry) => (
                                <div
                                  key={entry.name}
                                  className="flex items-center justify-between gap-4"
                                >
                                  <div className="flex items-center gap-2">
                                    <div
                                      className="size-2 rounded-full"
                                      style={{ backgroundColor: entry.color }}
                                    />
                                    <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                                      {entry.name === "revenue"
                                        ? "매출"
                                        : entry.name === "expense"
                                          ? "지출"
                                          : "순이익"}
                                    </span>
                                  </div>
                                  <span className="text-xs font-black text-zinc-900 dark:text-zinc-100">
                                    ₩{Number(entry.value).toLocaleString()}
                                  </span>
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  name="revenue"
                />
                <Area
                  type="monotone"
                  dataKey="netProfit"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorNetProfit)"
                  name="netProfit"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-zinc-50/50 dark:bg-zinc-900/50 rounded-2xl">
              <div className="animate-pulse text-zinc-400 text-xs font-bold">
                재무 데이터 로딩 중...
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
