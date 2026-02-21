"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/dashboard/header";
import {
  Coins,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  User,
  Plus,
  Minus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getWeeklySettlementData,
  createSettlement,
} from "@/app/actions/settlement";
import { SettlementDetailDialog } from "./components/SettlementDetailDialog";
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks } from "date-fns";
import { ko } from "date-fns/locale";
import { cn } from "@/lib/utils";

export interface SettlementItem {
  therapist: {
    id: string;
    name: string;
  };
  salesCount: number;
  totalCommission: number;
  totalChoiceFee: number;
  totalBonus: number;
  totalAdvance: number;
  netAmount: number;
  isAlreadySettled: boolean;
  details: {
    sales: any[];
    extras: any[];
  };
}

export function WeeklySettlementClient({
  initialData,
}: {
  initialData: SettlementItem[];
}) {
  const [mounted, setMounted] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [data, setData] = useState<SettlementItem[]>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<SettlementItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    // Cascading render 경고를 피하기 위해 비동기로 처리
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // 월요일~일요일 범위 계산
  const getWeekRange = (date: Date) => {
    const start = startOfWeek(date, { weekStartsOn: 1 });
    const end = endOfWeek(date, { weekStartsOn: 1 });
    return { start, end };
  };

  const { start, end } = getWeekRange(currentDate);

  const fetchSettlementData = async (date: Date) => {
    setIsLoading(true);
    const range = getWeekRange(date);
    const result = await getWeeklySettlementData(range.start, range.end);
    if (result.success && result.data) {
      setData(result.data as SettlementItem[]);
    }
    setIsLoading(false);
  };

  const handlePrevWeek = () => {
    const newDate = subWeeks(currentDate, 1);
    setCurrentDate(newDate);
    fetchSettlementData(newDate);
  };

  const handleNextWeek = () => {
    const newDate = addWeeks(currentDate, 1);
    setCurrentDate(newDate);
    fetchSettlementData(newDate);
  };

  const handleSettlement = async (item: SettlementItem) => {
    if (!confirm(`${item.therapist.name} 관리사의 정산을 완료하시겠습니까?`))
      return;

    setIsProcessing(item.therapist.id);
    const result = await createSettlement({
      employeeId: item.therapist.id,
      type: "WEEKLY",
      periodStart: start,
      periodEnd: end,
      totalAmount: item.netAmount,
      details: {
        baseAmount: item.totalCommission,
        mealAllowance: 0,
        bonusAmount: item.totalBonus,
        advanceAmount: item.totalAdvance,
        totalAmount: item.netAmount,
      },
      extraPaymentIds: [], // 주급에서는 별도 관리 안 함
    });

    if (result.success) {
      alert("정산이 완료되었습니다.");
      fetchSettlementData(currentDate);
    } else {
      alert(result.error || "정산 처리에 실패했습니다.");
    }
    setIsProcessing(null);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
      <Header />

      <main className="flex-1 overflow-y-auto bg-zinc-50/50 dark:bg-zinc-950 p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 pb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1 text-center md:text-left">
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center justify-center md:justify-start gap-3">
                <Coins className="size-6 text-emerald-600" />
                주급 정산 관리
              </h1>
              <p className="text-sm font-medium text-zinc-500">
                월요일부터 일요일까지의 커미션 및 수당을 정산합니다.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 p-1.5 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 w-fit mx-auto md:mx-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrevWeek}
                className="size-9 rounded-xl text-zinc-500"
              >
                <ChevronLeft className="size-5" />
              </Button>
              <div className="flex flex-col items-center px-4 min-w-[200px]">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="size-3.5 text-emerald-600" />
                  <span className="text-sm font-black text-zinc-900 dark:text-zinc-100">
                    {format(start, "MM월 dd일", { locale: ko })} ~{" "}
                    {format(end, "MM월 dd일", { locale: ko })}
                  </span>
                </div>
                <span className="text-[10px] text-zinc-400 font-bold uppercase">
                  {format(currentDate, "yyyy년 w주차", { locale: ko })}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNextWeek}
                disabled={!mounted || start > new Date()}
                className="size-9 rounded-xl text-zinc-500"
              >
                <ChevronRight className="size-5" />
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-4">
              <div className="size-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-zinc-500 font-bold">정산 데이터 집계 중...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {data.length === 0 ? (
                <Card className="border-dashed border-2 bg-zinc-50/50 py-20 text-center">
                  <p className="text-zinc-500">
                    해당 기간에 활동한 관리사가 없습니다.
                  </p>
                </Card>
              ) : (
                data.map((item) => (
                  <Card
                    key={item.therapist.id}
                    onClick={() => {
                      setSelectedItem(item);
                      setIsDetailOpen(true);
                    }}
                    className={cn(
                      "border-none shadow-sm bg-white dark:bg-zinc-900 overflow-hidden transition-all cursor-pointer hover:ring-2 hover:ring-emerald-500/20",
                      item.isAlreadySettled &&
                        "opacity-75 bg-zinc-50 dark:bg-zinc-900/50",
                    )}
                  >
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row">
                        <div className="p-6 md:w-64 border-b md:border-b-0 md:border-r border-zinc-100 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/30">
                          <div className="flex items-center gap-4 md:flex-col md:items-start md:gap-3">
                            <div className="size-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 shadow-sm flex items-center justify-center border border-zinc-200 dark:border-zinc-700">
                              <User className="size-7 text-zinc-500 dark:text-zinc-400" />
                            </div>
                            <div>
                              <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100 mt-1">
                                {item.therapist.name}
                              </h3>
                              {item.isAlreadySettled && (
                                <Badge className="mt-2 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-none font-bold text-[10px] px-2 py-0.5">
                                  정산 완료
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex-1 p-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="flex flex-col justify-center gap-1 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                            <p className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-1.5 mb-1">
                              <Clock className="size-3.5" /> 수행 코스
                            </p>
                            <div className="flex items-baseline gap-1">
                              <span className="text-xl font-black text-zinc-900 dark:text-zinc-100">
                                {item.salesCount}
                              </span>
                              <span className="text-xs font-medium text-zinc-500">
                                건
                              </span>
                            </div>
                            <p className="text-xs font-medium text-zinc-500 mt-1">
                              ₩{item.totalCommission.toLocaleString()}
                            </p>
                          </div>

                          <div className="flex flex-col justify-center gap-1 p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100/50 dark:border-emerald-900/30">
                            <p className="text-xs font-bold text-emerald-600/80 dark:text-emerald-400/80 uppercase flex items-center gap-1.5 mb-1">
                              <Plus className="size-3.5" /> 초이스 수당
                            </p>
                            <p className="text-xl font-black text-emerald-600 dark:text-emerald-500">
                              + ₩{item.totalChoiceFee.toLocaleString()}
                            </p>
                          </div>

                          <div className="flex flex-col justify-center gap-1 p-4 rounded-2xl bg-red-50/50 dark:bg-red-900/10 border border-red-100/50 dark:border-red-900/30">
                            <p className="text-xs font-bold text-red-600/80 dark:text-red-400/80 uppercase flex items-center gap-1.5 mb-1">
                              <Minus className="size-3.5" /> 가불/보너스
                            </p>
                            <p className="text-xl font-black text-red-600 dark:text-red-500">
                              {item.totalBonus - item.totalAdvance >= 0
                                ? "+"
                                : ""}
                              ₩
                              {(
                                item.totalBonus - item.totalAdvance
                              ).toLocaleString()}
                            </p>
                            <div className="flex gap-2 mt-1">
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                B: {item.totalBonus.toLocaleString()}
                              </span>
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                A: {item.totalAdvance.toLocaleString()}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col justify-center gap-1 p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                            <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase mb-1">
                              최종 지급액
                            </p>
                            <p className="text-2xl font-black text-blue-600 dark:text-blue-400 tracking-tight">
                              ₩{item.netAmount.toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <div
                          className="p-6 md:w-48 flex items-center justify-center bg-zinc-50/30 dark:bg-zinc-900/30 md:border-l border-zinc-100 dark:border-zinc-800"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {item.isAlreadySettled ? (
                            <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                              <CheckCircle2 className="size-5" /> 완료됨
                            </div>
                          ) : (
                            <Button
                              onClick={() => handleSettlement(item)}
                              disabled={isProcessing === item.therapist.id}
                              className="w-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold h-11 rounded-xl shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                              {isProcessing === item.therapist.id ? (
                                <div className="size-5 border-2 border-white dark:border-zinc-900 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                "정산 완료하기"
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
              <SettlementDetailDialog
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                data={selectedItem}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
