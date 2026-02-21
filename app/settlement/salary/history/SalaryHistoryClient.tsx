"use client";

import { useState } from "react";
import { Header } from "@/components/dashboard/header";
import {
  History,
  ChevronLeft,
  ChevronRight,
  Search,
  ArrowLeft,
  CalendarDays,
  User2,
  BadgeCent,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { format } from "date-fns";
import { getSalarySettlementHistory } from "@/app/actions/settlement";
import { toast } from "sonner";
import { HistoryDetailDialog } from "./_components/HistoryDetailDialog";

interface SalaryHistoryClientProps {
  initialHistory: any[];
  initialYear: number;
  initialMonth: number;
}

export function SalaryHistoryClient({
  initialHistory,
  initialYear,
  initialMonth,
}: SalaryHistoryClientProps) {
  const [history, setHistory] = useState(initialHistory);
  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<any>(null);

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

  const fetchHistory = async (y: number, m: number) => {
    setLoading(true);
    const result = await getSalarySettlementHistory(y, m);
    if (result.success) {
      setHistory(result.data || []);
    } else {
      toast.error("내역을 불러오는데 실패했습니다.");
    }
    setLoading(false);
  };

  const handlePrevMonth = () => {
    let nm = month - 1,
      ny = year;
    if (nm < 1) {
      nm = 12;
      ny -= 1;
    }
    setYear(ny);
    setMonth(nm);
    fetchHistory(ny, nm);
  };

  const handleNextMonth = () => {
    let nm = month + 1,
      ny = year;
    if (nm > 12) {
      nm = 1;
      ny += 1;
    }
    setYear(ny);
    setMonth(nm);
    fetchHistory(ny, nm);
  };

  const filteredHistory = history.filter((item) =>
    item.employee.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-zinc-50 dark:bg-black">
      <Header />

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <Link href="/settlement/salary">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-800"
                  >
                    <ArrowLeft className="size-5" />
                  </Button>
                </Link>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-zinc-900 dark:bg-zinc-800 rounded-xl">
                    <History className="size-6 text-white" />
                  </div>
                  <h1 className="text-3xl font-black tracking-tight">
                    정산 히스토리
                  </h1>
                </div>
              </div>
              <p className="text-zinc-500 font-medium pl-14">
                완료된 급여 정산 내역을 확인하고 관리합니다.
              </p>
            </div>

            <div className="flex items-center gap-4 bg-white dark:bg-zinc-900 p-2 rounded-2xl border shadow-sm">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrevMonth}
                className="rounded-xl"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <div className="flex items-center gap-2 px-4 min-w-[140px] justify-center">
                <CalendarDays className="size-4 text-blue-600" />
                <span className="font-black text-lg">
                  {year}년 {month}월
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNextMonth}
                className="rounded-xl"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>

          {/* Search & Stats */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
              <Input
                placeholder="직원 이름으로 검색..."
                className="pl-10 h-14 rounded-2xl bg-white dark:bg-zinc-900 border-none shadow-sm font-bold"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* History Table */}
          <Card className="border-none shadow-xl shadow-zinc-200/50 dark:shadow-none bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-zinc-50/50 dark:bg-zinc-900/50 hover:bg-transparent border-b border-zinc-100 dark:border-zinc-800">
                  <TableHead className="font-black h-14 px-6">직원</TableHead>
                  <TableHead className="font-black h-14">정산 기간</TableHead>
                  <TableHead className="font-black h-14 text-right">
                    근무 정보
                  </TableHead>
                  <TableHead className="font-black h-14 text-right">
                    정산 금액
                  </TableHead>
                  <TableHead className="font-black h-14 text-center">
                    정산 일시
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-64 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <p className="text-xs font-bold text-zinc-400">
                          내역을 불러오는 중...
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredHistory.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-64 text-center text-zinc-400 font-bold"
                    >
                      정산 내역이 없습니다.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredHistory.map((item) => (
                    <TableRow
                      key={item.id}
                      className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 border-b border-zinc-50 dark:border-zinc-800 transition-colors cursor-pointer"
                      onClick={() => setSelectedItem(item)}
                    >
                      <TableCell className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
                            <User2 className="size-4 text-zinc-500" />
                          </div>
                          <div>
                            <p className="font-black text-zinc-900 dark:text-zinc-50">
                              {item.employee.name}
                            </p>
                            <Badge
                              variant="outline"
                              className="text-[10px] font-bold mt-1 border-zinc-200 uppercase"
                            >
                              {getRoleLabel(item.employee.role)}
                            </Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm font-bold text-zinc-600 dark:text-zinc-400">
                          {format(new Date(item.periodStart), "yy.MM.dd")} ~{" "}
                          {format(new Date(item.periodEnd), "yy.MM.dd")}
                        </p>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="space-y-1">
                          <p className="text-sm font-black text-zinc-900 dark:text-zinc-50">
                            {item.workedDays}일 근무
                          </p>
                          <p className="text-[10px] font-bold text-zinc-400">
                            총 {item.totalDaysInPeriod}일 중
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-col items-end gap-1">
                          <p className="text-lg font-black text-blue-600">
                            ₩{item.totalAmount.toLocaleString()}
                          </p>
                          <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-400">
                            <BadgeCent className="size-3" />
                            <span>상세 내역 포함</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <p className="text-xs font-bold text-zinc-500">
                          {format(new Date(item.createdAt), "yyyy.MM.dd HH:mm")}
                        </p>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </div>
      </main>

      <HistoryDetailDialog
        item={selectedItem}
        open={!!selectedItem}
        onOpenChange={(open) => !open && setSelectedItem(null)}
      />
    </div>
  );
}
