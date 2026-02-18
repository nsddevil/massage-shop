"use client";

import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

const data = [
  { time: "08:00", revenue: 200, avg: 150 },
  { time: "10:00", revenue: 400, avg: 350 },
  { time: "12:00", revenue: 850, avg: 600 },
  { time: "14:00", revenue: 750, avg: 550 },
  { time: "16:00", revenue: 1600, avg: 1200 },
  { time: "18:00", revenue: 1800, avg: 1400 },
  { time: "20:00", revenue: 1100, avg: 1000 },
  { time: "22:00", revenue: 500, avg: 700 },
];

export function RevenueChart() {
  return (
    <Card className="border-none shadow-sm shadow-zinc-200 dark:shadow-none bg-white dark:bg-zinc-900/50 p-2">
      <CardHeader className="flex flex-row items-center justify-between pb-6">
        <div className="space-y-1">
          <CardTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
            일일 매출 추이 및 피크 타임 분석
          </CardTitle>
          <CardDescription className="text-sm font-medium text-zinc-400">
            운영 기간 동안의 실시간 매출 추적
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
      <CardContent className="h-[300px] w-full mt-4">
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
            <Area
              type="monotone"
              dataKey="avg"
              stroke="#e2e8f0"
              strokeWidth={2}
              fill="transparent"
              className="dark:stroke-zinc-700"
            />
            <ReferenceLine
              x="18:00"
              stroke="#2563eb"
              strokeDasharray="3 3"
              label={{
                value: "₩1,800k",
                position: "top",
                fill: "#2563eb",
                fontSize: 14,
                fontWeight: "bold",
                offset: 10,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
