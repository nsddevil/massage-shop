"use client";

import { CreditCard, Banknote, QrCode, Filter, Download } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const sales = [
  {
    time: "18:30",
    course: "안티그래비티 플로트 세션",
    staff: { name: "사라", image: "https://i.pravatar.cc/150?u=sarah" },
    payment: { method: "신용카드", icon: CreditCard },
    amount: "₩85,000",
    commission: "+₩12,750",
    status: "완료",
  },
  {
    time: "17:45",
    course: "딥 티슈 마사지",
    staff: { name: "제임스", image: "https://i.pravatar.cc/150?u=james" },
    payment: { method: "현금", icon: Banknote },
    amount: "₩120,000",
    commission: "+₩18,000",
    status: "완료",
  },
  {
    time: "16:15",
    course: "아로마테라피 60분",
    staff: { name: "알렉스", image: "https://i.pravatar.cc/150?u=alex" },
    payment: { method: "QR 결제", icon: QrCode },
    amount: "₩95,000",
    commission: "+₩14,250",
    status: "완료",
  },
  {
    time: "15:00",
    course: "안티그래비티 플로트 세션",
    staff: { name: "데이비드", image: "https://i.pravatar.cc/150?u=david" },
    payment: { method: "신용카드", icon: CreditCard },
    amount: "₩85,000",
    commission: "+₩12,750",
    status: "준비중",
  },
];

export function RecentSalesTable() {
  return (
    <Card className="border-none shadow-sm shadow-zinc-200 dark:shadow-none bg-white dark:bg-zinc-900/50">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="space-y-1">
          <CardTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
            최근 서비스 기록
          </CardTitle>
          <CardDescription className="text-sm font-medium text-zinc-400">
            오늘 발생한 서비스 내역 요약
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 h-9 border-zinc-200 dark:border-zinc-800 font-bold text-zinc-600 dark:text-zinc-300"
          >
            <Filter className="size-3.5" />
            필터
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 h-9 border-zinc-200 dark:border-zinc-800 font-bold text-zinc-600 dark:text-zinc-300"
          >
            <Download className="size-3.5" />
            내보내기
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="min-w-[800px] lg:min-w-full">
            <TableHeader>
              <TableRow className="bg-zinc-50/50 dark:bg-zinc-900/30 border-y border-zinc-100 dark:border-zinc-800">
                <TableHead className="w-[100px] font-bold text-zinc-400 uppercase text-[10px] pl-6 tracking-wider">
                  시간
                </TableHead>
                <TableHead className="font-bold text-zinc-400 uppercase text-[10px] tracking-wider">
                  코스명
                </TableHead>
                <TableHead className="font-bold text-zinc-400 uppercase text-[10px] tracking-wider">
                  담당 직원
                </TableHead>
                <TableHead className="font-bold text-zinc-400 uppercase text-[10px] tracking-wider">
                  결제 수단
                </TableHead>
                <TableHead className="font-bold text-zinc-400 uppercase text-[10px] tracking-wider text-right">
                  금액
                </TableHead>
                <TableHead className="font-bold text-zinc-400 uppercase text-[10px] tracking-wider text-right">
                  커미션
                </TableHead>
                <TableHead className="font-bold text-zinc-400 uppercase text-[10px] tracking-wider text-center pr-6">
                  상태
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.map((sale, idx) => (
                <TableRow
                  key={idx}
                  className="border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-colors"
                >
                  <TableCell className="font-bold text-zinc-900 dark:text-zinc-100 pl-6">
                    {sale.time}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-lg bg-blue-50 dark:bg-blue-900/10 flex items-center justify-center">
                        <CreditCard className="size-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="font-bold text-zinc-900 dark:text-zinc-200 text-sm">
                        {sale.course}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <Avatar className="size-7 border border-white dark:border-zinc-800 ring-2 ring-zinc-50 dark:ring-zinc-900 shadow-sm">
                        <AvatarImage src={sale.staff.image} />
                        <AvatarFallback>{sale.staff.name[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">
                        {sale.staff.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-500">
                      <sale.payment.icon className="size-4" />
                      <span className="text-xs font-bold">
                        {sale.payment.method}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-bold text-zinc-900 dark:text-zinc-100">
                    {sale.amount}
                  </TableCell>
                  <TableCell className="text-right font-bold text-emerald-600 dark:text-emerald-400">
                    {sale.commission}
                  </TableCell>
                  <TableCell className="text-center pr-6">
                    <Badge
                      variant="outline"
                      className={cn(
                        "font-bold text-[10px] px-2.5 py-0.5 border-none",
                        sale.status === "완료"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
                      )}
                    >
                      {sale.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between px-6 py-6 border-t border-zinc-100 dark:border-zinc-800/50">
          <p className="text-xs font-semibold text-zinc-400">
            총 24건 중 4건 표시 중
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-3 border-zinc-200 dark:border-zinc-800 font-bold text-zinc-600 dark:text-zinc-300"
            >
              이전
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-3 border-zinc-200 dark:border-zinc-800 font-bold text-zinc-600 dark:text-zinc-300"
            >
              다음
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
