"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

interface ExpenseChartProps {
  data: {
    name: string;
    value: number;
  }[];
}

const COLORS = ["#2563eb", "#94a3b8", "#f43f5e"];

export function ExpenseChart({ data }: ExpenseChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Card className="border-none shadow-sm shadow-zinc-200 dark:shadow-none bg-white dark:bg-zinc-900/50 p-2">
      <CardHeader className="flex flex-row items-center justify-between pb-6">
        <div className="space-y-1">
          <CardTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
            지출 비중 분석
          </CardTitle>
          <CardDescription className="text-sm font-medium text-zinc-400">
            이번 달 주요 지출 항목별 분포
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="h-[300px] min-h-[300px] w-full mt-4">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ left: -20, right: 20 }}
            >
              <CartesianGrid
                horizontal={false}
                strokeDasharray="3 3"
                stroke="#f1f5f9"
                className="dark:stroke-zinc-800"
              />
              <XAxis
                type="number"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fontWeight: 600, fill: "#94a3b8" }}
                tickFormatter={(value) =>
                  `₩${(value / 10000).toLocaleString()}만`
                }
              />
              <YAxis
                dataKey="name"
                type="category"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fontWeight: 700, fill: "#64748b" }}
                width={80}
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
                formatter={(value: number | string | undefined) => [
                  `₩${Number(value || 0).toLocaleString()}`,
                  "금액",
                ]}
                cursor={{ fill: "#f8fafc", opacity: 0.1 }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-zinc-50/50 dark:bg-zinc-900/50 rounded-xl">
            <div className="animate-pulse text-zinc-400 text-xs font-bold">
              분석 데이터 로딩 중...
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
