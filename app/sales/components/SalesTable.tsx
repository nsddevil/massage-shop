"use client";

import { SaleWithDetails, PAY_METHOD_LABELS } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

interface SalesTableProps {
  sales: SaleWithDetails[];
}

export function SalesTable({ sales }: SalesTableProps) {
  if (sales.length === 0) {
    return (
      <Card className="border-dashed border-2 bg-zinc-50/50 dark:bg-zinc-900/10 py-20 text-center">
        <p className="text-zinc-500 font-medium">
          검색된 매출 내역이 없습니다.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Mobile Card Layout */}
      <div className="md:hidden space-y-4">
        {sales.map((sale) => {
          const totalCommission = sale.therapists.reduce(
            (acc, t) => acc + t.commissionAmount + t.choiceFee,
            0,
          );

          return (
            <Card
              key={sale.id}
              className="border-none shadow-sm bg-white dark:bg-zinc-900 overflow-hidden"
            >
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-zinc-900 dark:text-zinc-100 text-lg">
                        {sale.course.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-none text-[10px] h-5 font-bold">
                        {PAY_METHOD_LABELS[sale.payMethod]}
                      </Badge>
                      <span className="text-[10px] text-zinc-400 font-medium">
                        {format(new Date(sale.createdAt), "HH:mm", {
                          locale: ko,
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black text-zinc-900 dark:text-zinc-100">
                      ₩{sale.totalPrice.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-50 dark:border-zinc-800">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">
                      참여 관리사
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {sale.therapists.map((t) => (
                        <Badge
                          key={t.id}
                          variant="outline"
                          className="text-[9px] px-1.5 py-0 border-zinc-200 dark:border-zinc-800 font-medium lowercase"
                        >
                          {t.employee.name}
                          {t.isChoice ? "(초이스)" : ""}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1 text-right">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">
                      합계 커미션
                    </span>
                    <div className="text-blue-600 dark:text-blue-400 font-bold text-sm">
                      ₩{totalCommission.toLocaleString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Desktop Table Layout */}
      <Card className="hidden md:block border-none shadow-sm bg-white dark:bg-zinc-900/50 overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-zinc-50/50 dark:bg-zinc-900/30 border-y border-zinc-100 dark:border-zinc-800">
                <TableHead className="font-bold text-zinc-400 uppercase text-[10px] pl-6 h-12">
                  시간
                </TableHead>
                <TableHead className="font-bold text-zinc-400 uppercase text-[10px] h-12">
                  코스명
                </TableHead>
                <TableHead className="font-bold text-zinc-400 uppercase text-[10px] h-12">
                  결제수단
                </TableHead>
                <TableHead className="font-bold text-zinc-400 uppercase text-[10px] h-12">
                  결제금액
                </TableHead>
                <TableHead className="font-bold text-zinc-400 uppercase text-[10px] h-12">
                  관리사 (커미션)
                </TableHead>
                <TableHead className="font-bold text-zinc-400 uppercase text-[10px] text-right pr-6 h-12">
                  커미션 합계
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.map((sale) => {
                const totalCommission = sale.therapists.reduce(
                  (acc, t) => acc + t.commissionAmount + t.choiceFee,
                  0,
                );

                return (
                  <TableRow
                    key={sale.id}
                    className="border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-colors"
                  >
                    <TableCell className="pl-6 py-4 font-medium text-zinc-400 text-xs">
                      {format(new Date(sale.createdAt), "HH:mm", {
                        locale: ko,
                      })}
                    </TableCell>
                    <TableCell className="font-bold text-zinc-900 dark:text-zinc-100">
                      {sale.course.name}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="font-bold text-[10px] px-2 py-0.5 border-none bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                      >
                        {PAY_METHOD_LABELS[sale.payMethod]}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-bold">
                      ₩{sale.totalPrice.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1.5">
                        {sale.therapists.map((t) => (
                          <div
                            key={t.id}
                            className="flex items-center gap-1 bg-zinc-50 dark:bg-zinc-800 px-2 py-0.5 rounded-lg border border-zinc-100 dark:border-zinc-700"
                          >
                            <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                              {t.employee.name}
                              {t.isChoice && " (초이스)"}
                            </span>
                            <span className="text-[10px] text-blue-600 font-medium">
                              {t.commissionAmount + t.choiceFee}
                            </span>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-6 font-black text-blue-600 dark:text-blue-400">
                      ₩{totalCommission.toLocaleString()}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
