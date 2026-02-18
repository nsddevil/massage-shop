"use client";

import { Card, CardContent } from "@/components/ui/card";
import { PAY_METHOD_LABELS, PayMethod } from "@/types";
import { cn } from "@/lib/utils";
import {
  Wallet,
  CreditCard,
  Landmark,
  Smartphone,
  MoreHorizontal,
  CircleDollarSign,
  LucideIcon,
} from "lucide-react";

interface SummaryCardsProps {
  summary: Record<string, number> | null;
}

const METHOD_ICONS: Record<string, LucideIcon> = {
  CASH: Wallet,
  TRANSFER: Landmark,
  CARD: CreditCard,
  HEELY: Smartphone,
  MATONG: MoreHorizontal,
  total: CircleDollarSign,
};

const METHOD_COLORS: Record<string, string> = {
  CASH: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20",
  TRANSFER: "text-blue-600 bg-blue-50 dark:bg-blue-900/20",
  CARD: "text-purple-600 bg-purple-50 dark:bg-purple-900/20",
  HEELY: "text-pink-600 bg-pink-50 dark:bg-pink-900/20",
  MATONG: "text-orange-600 bg-orange-50 dark:bg-orange-900/20",
  total: "text-zinc-900 bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-100",
};

export function SummaryCards({ summary }: SummaryCardsProps) {
  if (!summary) return null;

  const methods = [
    "CASH",
    "TRANSFER",
    "CARD",
    "HEELY",
    "MATONG",
  ] as PayMethod[];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
      {/* Total Card - Featured */}
      <Card className="col-span-2 md:col-span-3 lg:col-span-6 bg-emerald-600 border-none shadow-lg shadow-emerald-100 dark:shadow-none overflow-hidden">
        <CardContent className="p-6 md:p-8 flex items-center justify-between relative">
          <div className="space-y-2 relative z-10">
            <p className="text-emerald-50/80 font-bold text-sm uppercase tracking-wider">
              오늘의 총 매출 합계
            </p>
            <h3 className="text-3xl md:text-4xl font-black text-white tracking-tighter">
              ₩{summary.total.toLocaleString()}
            </h3>
          </div>
          <CircleDollarSign className="size-20 text-white/10 absolute -right-4 -bottom-4 rotate-12" />
        </CardContent>
      </Card>

      {/* Individual Method Cards */}
      {methods.map((method) => {
        const Icon = METHOD_ICONS[method];
        return (
          <Card
            key={method}
            className="border-none shadow-sm bg-white dark:bg-zinc-900 overflow-hidden"
          >
            <CardContent className="p-4 md:p-5 space-y-3">
              <div
                className={cn(
                  "size-10 rounded-xl flex items-center justify-center",
                  METHOD_COLORS[method],
                )}
              >
                <Icon className="size-5" />
              </div>
              <div className="space-y-0.5 text-right">
                <p className="text-[13px] font-bold text-zinc-400 uppercase tracking-tight">
                  {PAY_METHOD_LABELS[method]}
                </p>
                <div className="text-lg font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
                  ₩{(summary[method] || 0).toLocaleString()}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
