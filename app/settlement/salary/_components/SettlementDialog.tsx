"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CalendarIcon,
  Calculator,
  AlertCircle,
  FileText,
  ArrowRight,
} from "lucide-react";
import { format, addMonths, subDays, addDays } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useCallback } from "react";
import { ko } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  calculateSalaryAction,
  confirmSalarySettlement,
} from "@/app/actions/settlement";
import { SalaryCalculationResult } from "@/types";
import { toast } from "sonner";

interface SettlementDialogProps {
  employee: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function SettlementDialog({
  employee,
  open,
  onOpenChange,
  onSuccess,
}: SettlementDialogProps) {
  // 기본 정산 기간 설정: 마지막 정산일 다음날(없으면 입사일) ~ 한 달 뒤 전날
  const getDefaultDates = () => {
    const start = employee.lastSettlementEnd
      ? addDays(new Date(employee.lastSettlementEnd), 1)
      : new Date(employee.joinedAt);

    const end = subDays(addMonths(start, 1), 1);
    return { start, end };
  };

  const { start: initStart, end: initEnd } = getDefaultDates();

  const [startDate, setStartDate] = useState<Date>(initStart);
  const [endDate, setEndDate] = useState<Date>(initEnd);
  const [result, setResult] = useState<SalaryCalculationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const handleCalculate = useCallback(async () => {
    setLoading(true);
    const res = await calculateSalaryAction(employee.id, startDate, endDate);
    if (res.success && res.data) {
      setResult(res.data);
    } else {
      toast.error(res.error || "급여 계산 중 오류가 발생했습니다.");
    }
    setLoading(false);
  }, [employee.id, startDate, endDate]);

  // 기간 변경 시 자동 재계산
  useEffect(() => {
    if (open && employee) {
      handleCalculate();
    }
  }, [startDate, endDate, open, employee, handleCalculate]);

  const handleConfirm = async () => {
    if (!result) return;

    setIsConfirming(true);
    const res = await confirmSalarySettlement(result);
    if (res.success) {
      toast.success("정산이 성공적으로 완료되었습니다.");
      onSuccess();
    } else {
      toast.error(res.error || "정산 저장 중 오류가 발생했습니다.");
    }
    setIsConfirming(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none rounded-3xl shadow-2xl [&>button]:text-white max-h-[95vh] flex flex-col">
        <DialogHeader className="p-8 bg-zinc-900 text-white shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-2xl">
              <Calculator className="size-6" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black">
                {employee.name}님 정산
              </DialogTitle>
              <p className="text-zinc-400 text-sm font-medium mt-1">
                급여 귀속 기간 및 상세 내역을 확인하세요.
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="p-8 space-y-8 bg-white dark:bg-zinc-950 overflow-y-auto">
          {/* Date Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">
                시작일
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full h-12 justify-start text-left font-bold rounded-xl border-zinc-200 dark:border-zinc-800",
                      !startDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-blue-600" />
                    {startDate ? (
                      format(startDate, "yy.MM.dd")
                    ) : (
                      <span>선택</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0 rounded-2xl overflow-hidden"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => date && setStartDate(date)}
                    initialFocus
                    locale={ko}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">
                종료일
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full h-12 justify-start text-left font-bold rounded-xl border-zinc-200 dark:border-zinc-800",
                      !endDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-emerald-600" />
                    {endDate ? format(endDate, "yy.MM.dd") : <span>선택</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0 rounded-2xl overflow-hidden"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => date && setEndDate(date)}
                    initialFocus
                    locale={ko}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Calculation Preview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <FileText className="size-4 text-zinc-400" />
                <span className="text-sm font-black text-zinc-900 dark:text-zinc-50">
                  정산 상세
                </span>
              </div>
              <Badge
                variant="outline"
                className="text-[10px] font-bold border-zinc-200"
              >
                {result?.employee.role === "MANAGER"
                  ? "실장"
                  : result?.employee.role === "THERAPIST"
                    ? "관리사"
                    : "직원"}
              </Badge>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-900 p-6 rounded-3xl space-y-4 border border-zinc-100 dark:border-zinc-800">
              {loading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="text-xs font-bold text-zinc-400">
                    데이터를 계산하고 있습니다...
                  </p>
                </div>
              ) : result ? (
                <>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm font-medium">
                      <span className="text-zinc-500">
                        기본 근무 수당 ({result.period.workedDays}일)
                      </span>
                      <span className="text-zinc-900 dark:text-zinc-50">
                        ₩{result.details.baseAmount.toLocaleString()}
                      </span>
                    </div>
                    {result.details.mealAllowance > 0 && (
                      <div className="flex justify-between items-center text-sm font-medium">
                        <span className="text-zinc-500">식대 합계</span>
                        <span className="text-zinc-900 dark:text-zinc-50">
                          ₩{result.details.mealAllowance.toLocaleString()}
                        </span>
                      </div>
                    )}
                    {result.details.bonusAmount > 0 && (
                      <div className="flex justify-between items-center text-sm font-bold text-blue-600">
                        <span>보너스 합계</span>
                        <span>
                          + ₩{result.details.bonusAmount.toLocaleString()}
                        </span>
                      </div>
                    )}
                    {result.details.advanceAmount > 0 && (
                      <div className="flex justify-between items-center text-sm font-bold text-red-600">
                        <span>가불금 공제</span>
                        <span>
                          - ₩{result.details.advanceAmount.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="h-px bg-zinc-200 dark:bg-zinc-800" />

                  <div className="flex justify-between items-end pt-2">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                        실 지급액
                      </p>
                      <p className="text-3xl font-black text-blue-600">
                        ₩{result.details.totalAmount.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-zinc-400">
                        총 {result.period.totalDays}일 기준
                      </p>
                      {result.roleType === "STAFF" && (
                        <p className="text-[10px] font-bold text-zinc-500">
                          {result.period.totalWorkHours}시간 근무
                        </p>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center gap-3 text-zinc-400">
                  <AlertCircle className="size-8" />
                  <p className="text-xs font-bold">계산된 데이터가 없습니다.</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-500/10 p-4 rounded-2xl border border-amber-100 dark:border-amber-500/20">
            <AlertCircle className="size-5 text-amber-600 shrink-0" />
            <p className="text-[11px] font-bold text-amber-800 dark:text-amber-400">
              정산 확정 시 해당 기간의 가불금 및 보너스 내역이 &apos;정산
              완료&apos; 처리되며 이후 수정이 불가능합니다.
            </p>
          </div>
        </div>

        <DialogFooter className="p-8 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-4 shrink-0">
          <Button
            variant="ghost"
            className="h-14 px-8 rounded-2xl font-black text-zinc-500 border-none hover:bg-zinc-200 dark:hover:bg-zinc-800"
            onClick={() => onOpenChange(false)}
          >
            취소
          </Button>
          <Button
            className="flex-1 h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-lg gap-2 shadow-xl shadow-blue-200 dark:shadow-none transition-all duration-300 active:scale-95 disabled:grayscale"
            disabled={!result || loading || isConfirming}
            onClick={handleConfirm}
          >
            {isConfirming ? "정산 중..." : "정산 확정하기"}
            <ArrowRight className="size-5" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
