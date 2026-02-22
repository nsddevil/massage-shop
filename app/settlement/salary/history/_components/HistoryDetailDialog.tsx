"use client";

import {
  Dialog as ShadcnDialog,
  DialogContent as ShadcnDialogContent,
  DialogHeader as ShadcnDialogHeader,
  DialogTitle as ShadcnDialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  Calendar,
  User2,
  Wallet,
  PlusCircle,
  MinusCircle,
  Equal,
  Info,
  Trash2,
  Loader2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { deleteSettlement } from "@/app/actions/settlement";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";

interface HistoryDetailDialogProps {
  item: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleteSuccess?: () => void;
}

export function HistoryDetailDialog({
  item,
  open,
  onOpenChange,
  onDeleteSuccess,
}: HistoryDetailDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  if (!item) return null;

  const handleDelete = async () => {
    if (
      !confirm(
        "정말 이 정산 내역을 삭제하시겠습니까? 관련 가불금 등이 미정산 상태로 복구됩니다.",
      )
    ) {
      return;
    }

    setIsDeleting(true);
    const result = await deleteSettlement(item.id);
    setIsDeleting(false);

    if (result.success) {
      toast.success("정산 내역이 삭제되었습니다.");
      onOpenChange(false);
      onDeleteSuccess?.();
    } else {
      toast.error(result.error || "삭제에 실패했습니다.");
    }
  };

  const details = item.details as any;

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "MANAGER":
        return "실장";
      case "THERAPIST":
        return "관리사";
      case "STAFF":
        return "직원";
      default:
        return role;
    }
  };

  return (
    <ShadcnDialog open={open} onOpenChange={onOpenChange}>
      <ShadcnDialogContent className="max-w-md w-[95vw] rounded-3xl p-0 overflow-hidden border-none shadow-2xl bg-white dark:bg-zinc-900 [&>button]:text-white">
        <ShadcnDialogHeader className="bg-zinc-900 dark:bg-black p-8 text-left relative">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-2 bg-blue-600 rounded-xl">
              <Info className="size-5 text-white" />
            </div>
            <ShadcnDialogTitle className="text-2xl font-black text-white tracking-tight">
              정산 상세 내역
            </ShadcnDialogTitle>
          </div>
          <p className="text-zinc-400 font-medium">
            정산일에 수행된 계산 상세 항목을 보여줍니다.
          </p>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            disabled={isDeleting}
            className="absolute top-8 right-12 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
          >
            {isDeleting ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <Trash2 className="size-5" />
            )}
          </Button>
        </ShadcnDialogHeader>

        <div className="p-8 space-y-8 overflow-y-auto max-h-[70vh]">
          {/* Employee Info */}
          <div className="flex items-center gap-4 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
            <div className="p-3 bg-white dark:bg-zinc-800 rounded-xl shadow-sm">
              <User2 className="size-6 text-zinc-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-50">
                  {item.employee.name}
                </h3>
                <Badge
                  variant="secondary"
                  className="text-[10px] font-bold px-2 py-0 bg-blue-50 text-blue-600 dark:bg-blue-500/10"
                >
                  {getRoleLabel(item.employee.role)}
                </Badge>
              </div>
              <p className="text-xs text-zinc-500 font-medium mt-0.5">
                정산일: {format(new Date(item.createdAt), "yyyy.MM.dd HH:mm")}
              </p>
            </div>
          </div>

          {/* Period Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-zinc-400" />
              <h4 className="text-sm font-black text-zinc-900 dark:text-zinc-50">
                정산 기간 및 근무
              </h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4 border-none bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl">
                <p className="text-[10px] font-bold text-zinc-400 uppercase mb-1">
                  정산 범위
                </p>
                <p className="text-sm font-black">
                  {format(new Date(item.periodStart), "yy.MM.dd")} ~{" "}
                  {format(new Date(item.periodEnd), "yy.MM.dd")}
                </p>
              </Card>
              <Card className="p-4 border-none bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl">
                <p className="text-[10px] font-bold text-zinc-400 uppercase mb-1">
                  실 근무일 / 총 일수
                </p>
                <p className="text-sm font-black">
                  {item.workedDays}일 / {item.totalDaysInPeriod}일
                </p>
              </Card>
            </div>
          </div>

          {/* Money Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Wallet className="size-4 text-zinc-400" />
              <h4 className="text-sm font-black text-zinc-900 dark:text-zinc-50">
                금액 상세 내역
              </h4>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg">
                    <PlusCircle className="size-3.5 text-zinc-600 dark:text-zinc-400" />
                  </div>
                  <span className="text-sm font-bold text-zinc-600 dark:text-zinc-400">
                    기본 금액 (일할/시급)
                  </span>
                </div>
                <span className="text-sm font-black">
                  ₩{(details.baseAmount || 0).toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-emerald-100 dark:bg-emerald-500/10 rounded-lg">
                    <PlusCircle className="size-3.5 text-emerald-600" />
                  </div>
                  <span className="text-sm font-bold text-zinc-600 dark:text-zinc-400">
                    식대 및 수당
                  </span>
                </div>
                <span className="text-sm font-black text-emerald-600">
                  +₩{(details.mealAllowance || 0).toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-blue-100 dark:bg-blue-500/10 rounded-lg">
                    <PlusCircle className="size-3.5 text-blue-600" />
                  </div>
                  <span className="text-sm font-bold text-zinc-600 dark:text-zinc-400">
                    보너스
                  </span>
                </div>
                <span className="text-sm font-black text-blue-600">
                  +₩{(details.bonusAmount || 0).toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-500/10 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-red-100 dark:bg-red-500/20 rounded-lg">
                    <MinusCircle className="size-3.5 text-red-600" />
                  </div>
                  <span className="text-sm font-bold text-zinc-600 dark:text-zinc-400">
                    가불금 공제
                  </span>
                </div>
                <span className="text-sm font-black text-red-600">
                  -₩{(details.advanceAmount || 0).toLocaleString()}
                </span>
              </div>

              <div className="pt-2">
                <div className="flex items-center justify-between p-5 bg-zinc-900 dark:bg-black rounded-2xl shadow-lg ring-1 ring-zinc-800">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-white/10 rounded-lg">
                      <Equal className="size-4 text-white" />
                    </div>
                    <span className="text-base font-black text-white tracking-tight">
                      총 실 지급액
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black text-blue-400">
                      ₩{(item.totalAmount || 0).toLocaleString()}
                    </span>
                    <p className="text-[10px] font-bold text-zinc-500 mt-0.5">
                      100원 단위 올림 적용됨
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ShadcnDialogContent>
    </ShadcnDialog>
  );
}
