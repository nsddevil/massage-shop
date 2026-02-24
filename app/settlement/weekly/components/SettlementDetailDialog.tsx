"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { WeeklySettlementItem } from "@/types";

interface SettlementDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  data: WeeklySettlementItem | null;
}

export function SettlementDetailDialog({
  isOpen,
  onClose,
  data,
}: SettlementDetailDialogProps) {
  if (!data) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-[95vw] rounded-3xl p-0 overflow-hidden border-none shadow-2xl max-h-[90dvh] flex flex-col [&>button]:text-zinc-500 dark:[&>button]:text-white bg-white dark:bg-zinc-900">
        <DialogHeader className="p-6 bg-zinc-900 shrink-0">
          <DialogTitle className="text-xl font-black text-white flex items-center gap-3">
            <span className="text-emerald-400 font-black">
              {data.therapist.name}
            </span>
            <span className="text-zinc-400 text-sm font-medium">
              정산 명세서
            </span>
          </DialogTitle>
          <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mt-1">
            Detailed Settlement History
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 min-h-0">
          <div className="space-y-8">
            {/* Sales List */}
            <section className="space-y-4">
              <h4 className="text-sm font-black text-zinc-900 dark:text-zinc-100 flex items-center justify-between">
                수행 코스 내역
                <span className="text-xs text-zinc-400">
                  {data.salesCount}건
                </span>
              </h4>
              <div className="space-y-2">
                {data.details.sales.map((sale, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800/50"
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-zinc-400">
                        {format(new Date(sale.date), "MM/dd HH:mm", {
                          locale: ko,
                        })}
                      </span>
                      <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase">
                        {sale.courseName}
                        {sale.isChoice && (
                          <Badge className="ml-2 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-none text-[10px]">
                            초이스
                          </Badge>
                        )}
                      </span>
                    </div>
                    <span className="font-black text-zinc-900 dark:text-zinc-100">
                      ₩{sale.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <Separator className="bg-zinc-100 dark:bg-zinc-800" />

            {/* Extras List */}
            <section className="space-y-4">
              <h4 className="text-sm font-black text-zinc-900 dark:text-zinc-100">
                가불 및 보너스 내역
              </h4>
              {data.details.extras.length === 0 ? (
                <p className="text-xs text-zinc-400 italic">내역이 없습니다.</p>
              ) : (
                <div className="space-y-2">
                  {data.details.extras.map((extra, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800/50"
                    >
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-zinc-400">
                          {format(new Date(extra.date), "MM/dd", {
                            locale: ko,
                          })}
                        </span>
                        <span
                          className={`text-sm font-bold ${extra.type === "BONUS" ? "text-emerald-600" : "text-red-500"}`}
                        >
                          {extra.type === "BONUS" ? "보너스" : "가불금"}
                        </span>
                      </div>
                      <span
                        className={`font-black ${extra.type === "BONUS" ? "text-emerald-600" : "text-red-500"}`}
                      >
                        {extra.type === "BONUS" ? "+" : "-"} ₩
                        {extra.amount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>

        <div className="p-6 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center shrink-0">
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-zinc-400 uppercase">
              정산 합계
            </span>
            <span className="text-xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
              ₩{data.netAmount.toLocaleString()}
            </span>
          </div>
          <Button
            onClick={onClose}
            className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold px-8 rounded-xl h-12 shadow-lg"
          >
            확인
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
