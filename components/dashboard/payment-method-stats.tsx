"use client";

import {
  CreditCard,
  Banknote,
  Landmark,
  Smartphone,
  SmartphoneNfc,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface PaymentMethodStatsProps {
  data: {
    name: string;
    value: number;
    method: string;
  }[];
}

export function PaymentMethodStats({ data }: PaymentMethodStatsProps) {
  const getIcon = (method: string) => {
    switch (method) {
      case "CASH":
        return <Banknote className="size-4" />;
      case "CARD":
        return <CreditCard className="size-4" />;
      case "TRANSFER":
        return <Landmark className="size-4" />;
      case "MATONG":
        return <Smartphone className="size-4" />;
      case "HEELY":
        return <SmartphoneNfc className="size-4" />;
      default:
        return <CreditCard className="size-4" />;
    }
  };

  const getColorClass = (method: string) => {
    switch (method) {
      case "CASH":
        return "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20";
      case "CARD":
        return "text-blue-600 bg-blue-50 dark:bg-blue-900/20";
      case "TRANSFER":
        return "text-amber-600 bg-amber-50 dark:bg-amber-900/20";
      case "MATONG":
        return "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20";
      case "HEELY":
        return "text-rose-600 bg-rose-50 dark:bg-rose-900/20";
      default:
        return "text-zinc-600 bg-zinc-50 dark:bg-zinc-900/20";
    }
  };

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="border-none shadow-sm shadow-zinc-200 dark:shadow-none bg-white dark:bg-zinc-900/50 overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-4 p-6 border-b border-zinc-50 dark:border-zinc-800/50">
        <div className="space-y-1">
          <CardTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            결제 수단별 실적
          </CardTitle>
          <CardDescription className="text-xs font-medium text-zinc-400">
            이번 달 유입 경로별 누적 매출 현황
          </CardDescription>
        </div>
        <div className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-800/50 px-4 py-2 rounded-2xl border border-zinc-100 dark:border-zinc-700/50">
          <div className="text-right">
            <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">
              전체 매출 합계
            </div>
            <div className="text-lg font-black text-zinc-900 dark:text-zinc-50 leading-none">
              ₩{total.toLocaleString()}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 md:p-6 pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
          {data.length > 0 ? (
            data
              .sort((a, b) => b.value - a.value)
              .map((item, idx) => (
                <div
                  key={idx}
                  className="flex flex-col gap-3 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 bg-white dark:bg-zinc-900/30 hover:bg-zinc-50 dark:hover:bg-zinc-800/20 transition-all group relative overflow-hidden"
                >
                  <div className="flex items-center justify-between relative z-10">
                    <div
                      className={cn(
                        "p-2.5 rounded-xl transition-transform group-hover:scale-110 shadow-sm",
                        getColorClass(item.method),
                      )}
                    >
                      {getIcon(item.method)}
                    </div>
                    <div className="bg-zinc-100/50 dark:bg-zinc-800/50 px-2 py-0.5 rounded-full text-[10px] font-black text-zinc-500 whitespace-nowrap">
                      {total > 0 ? ((item.value / total) * 100).toFixed(1) : 0}%
                    </div>
                  </div>

                  <div className="flex flex-col gap-0.5 relative z-10">
                    <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500">
                      {item.name}
                    </span>
                    <span className="text-lg font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
                      ₩{item.value.toLocaleString()}
                    </span>
                  </div>

                  <div className="absolute bottom-0 left-0 w-full h-1 bg-zinc-100 dark:bg-zinc-800/50">
                    <div
                      className="h-full bg-blue-500 transition-all duration-500"
                      style={{
                        width: `${total > 0 ? (item.value / total) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              ))
          ) : (
            <div className="col-span-full py-12 text-center text-sm text-zinc-400 font-medium italic border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-3xl">
              이번 달 결제 내역이 아직 없습니다.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
