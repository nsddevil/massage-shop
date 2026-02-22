"use client";

import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

interface RevenueChartProps {
  data: {
    time: string;
    revenue: number;
    fullRevenue: number;
  }[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Card className="border-none shadow-sm shadow-zinc-200 dark:shadow-none bg-white dark:bg-zinc-900/50 p-2">
      <CardHeader className="flex flex-row items-center justify-between pb-6">
        <div className="space-y-1">
          <CardTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
            주간 매출 추이
          </CardTitle>
          <CardDescription className="text-sm font-medium text-zinc-400">
            최근 7일간의 일별 매출 흐름
          </CardDescription>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-blue-600"></span>
            <span className="text-zinc-600 dark:text-zinc-400">매출액</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-zinc-200 dark:bg-zinc-700"></span>
            <span className="text-zinc-600 dark:text-zinc-400">평균 매출</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-[300px] min-h-[300px] w-full mt-4">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                stroke="#f1f5f9"
                className="dark:stroke-zinc-800"
              />
              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fontWeight: 600, fill: "#94a3b8" }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fontWeight: 600, fill: "#94a3b8" }}
                tickFormatter={(value) => `₩${value}k`}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  backgroundColor: "#18181b",
                  color: "#fff",
                  padding: "12px",
                }}
                itemStyle={{
                  color: "#fff",
                  fontSize: "12px",
                  fontWeight: "bold",
                }}
                labelStyle={{
                  color: "#a1a1aa",
                  fontSize: "10px",
                  marginBottom: "4px",
                }}
                cursor={{ stroke: "#2563eb", strokeWidth: 1 }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#2563eb"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-zinc-50/50 dark:bg-zinc-900/50 rounded-xl">
            <div className="animate-pulse text-zinc-400 text-xs font-bold">
              차트 로딩 중...
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
