"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/dashboard/header";
import {
  Wallet,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
// getMonthlySettlementCandidates, confirmSettlement 는 제거되거나 리팩토링 되었습니다.
// import {
//   getMonthlySettlementCandidates,
//   confirmSettlement,
// } from "@/app/actions/settlement";
import { toast } from "sonner";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";

interface SettlementCandidate {
  employee: any;
  period: { start: string | Date; end: string | Date };
  stats: {
    workedDays: number;
    totalWorkHours: number;
    periodTotalDays: number;
  };
  details: {
    workAmount: number;
    mealAmount: number;
    bonusAmount: number;
    advanceAmount: number;
    baseSalary: number;
    hourlyRate: number;
  };
  totalAmount: number;
  extras: any[];
  isSettled: boolean;
  settlementId?: string;
}

interface MonthlySettlementClientProps {
  initialCandidates: any[]; // 구체적인 타입 정의 필요하지만 일단 any로 시작
  initialYear: number;
  initialMonth: number;
}

export function MonthlySettlementClient({
  initialCandidates,
  initialYear,
  initialMonth,
}: MonthlySettlementClientProps) {
  const [candidates, setCandidates] =
    useState<SettlementCandidate[]>(initialCandidates);
  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);
  const [loading, setLoading] = useState(false);
  const [selectedCandidate, setSelectedCandidate] =
    useState<SettlementCandidate | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const fetchCandidates = async (y: number, m: number) => {
    setLoading(true);
    const result = await getMonthlySettlementCandidates(y, m);
    if (result.success) {
      setCandidates(result.data);
      setSelectedIds([]); // Reset selection on fetch
    } else {
      toast.error("정산 데이터를 불러오는데 실패했습니다.");
    }
    setLoading(false);
  };

  const handlePrevMonth = () => {
    let newMonth = month - 1;
    let newYear = year;
    if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }
    setYear(newYear);
    setMonth(newMonth);
    fetchCandidates(newYear, newMonth);
  };

  const handleNextMonth = () => {
    let newMonth = month + 1;
    let newYear = year;
    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    }
    setYear(newYear);
    setMonth(newMonth);
    fetchCandidates(newYear, newMonth);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // Only select those not yet settled
      const ids = candidates
        .filter((c) => !c.isSettled)
        .map((c) => c.employee.id);
      setSelectedIds(ids);
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((pid) => pid !== id));
    }
  };

  const handleConfirm = async () => {
    if (!selectedCandidate) return;

    // eslint-disable-next-line no-restricted-globals
    if (
      !confirm(
        `${selectedCandidate.employee.name}님의 급여 정산을 확정하시겠습니까?\n확정 후에는 수정할 수 없습니다.`,
      )
    ) {
      return;
    }

    setIsConfirming(true);
    try {
      const result = await confirmSettlement({
        employeeId: selectedCandidate.employee.id,
        type: "MONTHLY",
        periodStart: selectedCandidate.period.start,
        periodEnd: selectedCandidate.period.end,
        totalDaysInPeriod: selectedCandidate.stats.periodTotalDays,
        workedDays: selectedCandidate.stats.workedDays,
        totalAmount: selectedCandidate.totalAmount,
        details: selectedCandidate.details,
        extraIds: selectedCandidate.extras.map((ex: any) => ex.id),
      });

      if (result.success) {
        toast.success("정산이 확정되었습니다.");
        setSelectedCandidate(null);
        fetchCandidates(year, month); // Refresh list
      } else {
        toast.error((result.error as string) || "정산 확정에 실패했습니다.");
      }
    } catch (error) {
      toast.error("오류가 발생했습니다.");
    }
    setIsConfirming(false);
  };

  const handleBatchSettle = async () => {
    if (selectedIds.length === 0) return;

    // eslint-disable-next-line no-restricted-globals
    if (
      !confirm(
        `선택한 ${selectedIds.length}명의 급여 정산을 일괄 확정하시겠습니까?\n확정 후에는 수정할 수 없습니다.`,
      )
    ) {
      return;
    }

    setIsConfirming(true);
    let successCount = 0;

    // Process sequentially to avoid DB lock issues or overwhelming server
    for (const id of selectedIds) {
      const candidate = candidates.find((c) => c.employee.id === id);
      if (!candidate) continue;

      try {
        const result = await confirmSettlement({
          employeeId: candidate.employee.id,
          type: "MONTHLY",
          periodStart: candidate.period.start,
          periodEnd: candidate.period.end,
          totalDaysInPeriod: candidate.stats.periodTotalDays,
          workedDays: candidate.stats.workedDays,
          totalAmount: candidate.totalAmount,
          details: candidate.details,
          extraIds: candidate.extras.map((ex: any) => ex.id),
        });

        if (result.success) successCount++;
      } catch (error) {
        console.error(`Failed to settle for ${candidate.employee.name}`, error);
      }
    }

    if (successCount > 0) {
      toast.success(`${successCount}명의 정산이 완료되었습니다.`);
      setSelectedIds([]);
      fetchCandidates(year, month);
    } else {
      toast.error("정산 처리에 실패했습니다.");
    }
    setIsConfirming(false);
  };

  // 총 예상 급여 합계
  const totalSettlementAmount = candidates.reduce(
    (sum, c) => sum + c.totalAmount,
    0,
  );
  const pendingCount = candidates.filter((c) => !c.isSettled).length;

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
      <Header />

      <main className="flex-1 overflow-y-auto bg-zinc-50/50 dark:bg-zinc-950 p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 pb-12">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-3">
                <Wallet className="size-6 text-blue-600" />
                월별 급여 정산
              </h1>
              <p className="text-sm font-medium text-zinc-500">
                직원별 근무 기록을 바탕으로 급여를 계산하고 정산합니다.
                <br className="md:hidden" />
                <span className="text-xs text-blue-600 font-bold ml-1">
                  * 체크박스를 선택하여 일괄 정산할 수 있습니다.
                </span>
              </p>
            </div>

            <div className="flex items-center gap-4">
              {selectedIds.length > 0 && (
                <Button
                  onClick={handleBatchSettle}
                  disabled={isConfirming}
                  className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 dark:shadow-none animate-in fade-in slide-in-from-bottom-2"
                >
                  {isConfirming
                    ? "처리중..."
                    : `${selectedIds.length}명 일괄 정산`}
                </Button>
              )}

              <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 p-1 rounded-xl border shadow-sm">
                <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
                  <ChevronLeft className="size-4" />
                </Button>
                <div className="px-4 font-bold text-lg min-w-[140px] text-center">
                  {year}년 {month}월
                </div>
                <Button variant="ghost" size="icon" onClick={handleNextMonth}>
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-none shadow-sm shadow-zinc-200 dark:shadow-none bg-white dark:bg-zinc-900">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-zinc-500">
                  정산 현황
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">
                    {candidates.length}명
                  </span>
                  <span className="text-sm text-zinc-500">
                    중{" "}
                    <span className="text-red-600 font-bold">
                      {pendingCount}명
                    </span>{" "}
                    미정산
                  </span>
                </div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm shadow-zinc-200 dark:shadow-none bg-white dark:bg-zinc-900 md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-zinc-500">
                  총 예상 지급액
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold flex items-center gap-2 text-blue-600">
                  ₩ {totalSettlementAmount.toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Candidates Table */}
          <Card className="border-none shadow-sm shadow-zinc-200 dark:shadow-none bg-white dark:bg-zinc-900 overflow-hidden">
            <div className="overflow-x-auto">
              {loading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-zinc-50/50 dark:bg-zinc-900/30">
                      <TableHead className="w-[50px] text-center">
                        <Checkbox
                          checked={
                            candidates.length > 0 &&
                            candidates.filter((c) => !c.isSettled).length > 0 &&
                            candidates
                              .filter((c) => !c.isSettled)
                              .every((c) => selectedIds.includes(c.employee.id))
                          }
                          onCheckedChange={(checked) =>
                            handleSelectAll(!!checked)
                          }
                          disabled={candidates.every((c) => c.isSettled)}
                        />
                      </TableHead>
                      <TableHead className="font-bold">직원명</TableHead>
                      <TableHead className="font-bold">직급</TableHead>
                      <TableHead className="font-bold">정산 기간</TableHead>
                      <TableHead className="font-bold text-right">
                        근무일/시간
                      </TableHead>
                      <TableHead className="font-bold text-right">
                        기본급/시급
                      </TableHead>
                      <TableHead className="font-bold text-right">
                        예상 수령액
                      </TableHead>
                      <TableHead className="font-bold text-center">
                        상태
                      </TableHead>
                      <TableHead className="font-bold text-center">
                        관리
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {candidates.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={9}
                          className="h-40 text-center text-zinc-500"
                        >
                          정산 대상자가 없습니다.
                        </TableCell>
                      </TableRow>
                    ) : (
                      candidates.map((candidate, idx) => {
                        const {
                          employee,
                          period,
                          stats,
                          details,
                          totalAmount,
                          isSettled,
                        } = candidate;
                        const startFormat = format(
                          new Date(period.start),
                          "MM.dd",
                        );
                        const endFormat = format(new Date(period.end), "MM.dd");
                        const isSelected = selectedIds.includes(employee.id);

                        return (
                          <TableRow
                            key={idx}
                            className={cn(
                              "group transition-colors",
                              isSettled || isSelected
                                ? "bg-zinc-50/30"
                                : "hover:bg-zinc-50/50",
                            )}
                          >
                            <TableCell className="text-center">
                              <Checkbox
                                checked={isSelected || isSettled}
                                onCheckedChange={(checked) =>
                                  handleSelectOne(employee.id, !!checked)
                                }
                                disabled={isSettled}
                              />
                            </TableCell>
                            <TableCell className="font-bold">
                              {employee.name}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className="text-[10px] font-bold"
                              >
                                {employee.role}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs text-zinc-500">
                              {startFormat} ~ {endFormat}
                            </TableCell>
                            <TableCell className="text-right text-sm">
                              {employee.role === "STAFF" ? (
                                <div className="flex flex-col items-end">
                                  <span className="font-medium">
                                    {stats.totalWorkHours}시간
                                  </span>
                                  <span className="text-xs text-zinc-400">
                                    ({stats.workedDays}일 출근)
                                  </span>
                                </div>
                              ) : (
                                <div className="flex flex-col items-end">
                                  <span className="font-medium">
                                    {stats.workedDays}일 근무
                                  </span>
                                  <span className="text-xs text-zinc-400">
                                    총 {stats.periodTotalDays}일 기준
                                  </span>
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="text-right text-sm font-medium">
                              {employee.role === "STAFF"
                                ? `₩ ${employee.hourlyRate?.toLocaleString()}/시간`
                                : `₩ ${employee.baseSalary?.toLocaleString()}`}
                            </TableCell>
                            <TableCell className="text-right font-bold text-blue-600">
                              ₩ {totalAmount.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-center">
                              {isSettled ? (
                                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none">
                                  정산 완료
                                </Badge>
                              ) : (
                                <Badge
                                  variant="secondary"
                                  className="text-zinc-500 bg-zinc-100"
                                >
                                  미정산
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              <Button
                                variant={isSettled ? "ghost" : "default"}
                                size="sm"
                                className={cn(
                                  "font-bold shadow-sm h-8",
                                  isSettled
                                    ? "text-zinc-400 hover:text-zinc-600"
                                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200",
                                )}
                                onClick={() => setSelectedCandidate(candidate)}
                                disabled={isSettled}
                              >
                                {isSettled ? "상세 보기" : "정산 하기"}
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              )}
            </div>
          </Card>
        </div>
      </main>

      {/* Detail Dialog */}
      <Dialog
        open={!!selectedCandidate}
        onOpenChange={(open) => !open && setSelectedCandidate(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              급여 상세 내역{" "}
              {selectedCandidate?.employee.payStartDay > 1
                ? `(기준일: ${selectedCandidate?.employee.payStartDay}일)`
                : ""}
            </DialogTitle>
            <DialogDescription>
              {selectedCandidate?.employee.name}님의 {month}월 귀속 급여
              내역입니다.
            </DialogDescription>
          </DialogHeader>

          {selectedCandidate && (
            <div className="space-y-5 py-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">기본 근무 수당</span>
                  <span className="font-medium">
                    ₩ {selectedCandidate.details.workAmount.toLocaleString()}
                  </span>
                </div>
                {selectedCandidate.details.mealAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">
                      식대 ({selectedCandidate.stats.workedDays}일)
                    </span>
                    <span className="font-medium">
                      ₩ {selectedCandidate.details.mealAmount.toLocaleString()}
                    </span>
                  </div>
                )}
                {selectedCandidate.details.bonusAmount > 0 && (
                  <div className="flex justify-between text-sm text-emerald-600">
                    <span>
                      보너스 (
                      {
                        selectedCandidate.extras.filter(
                          (e: any) => e.type === "BONUS",
                        ).length
                      }
                      건)
                    </span>
                    <span className="font-bold">
                      + ₩{" "}
                      {selectedCandidate.details.bonusAmount.toLocaleString()}
                    </span>
                  </div>
                )}
                {selectedCandidate.details.advanceAmount > 0 && (
                  <div className="flex justify-between text-sm text-red-600">
                    <span>
                      가불금 공제 (
                      {
                        selectedCandidate.extras.filter(
                          (e: any) => e.type === "ADVANCE",
                        ).length
                      }
                      건)
                    </span>
                    <span className="font-bold">
                      - ₩{" "}
                      {selectedCandidate.details.advanceAmount.toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-2" />
                <div className="flex justify-between font-bold text-xl pt-1">
                  <span>실 지급액</span>
                  <span className="text-blue-600">
                    ₩ {selectedCandidate.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-900 p-3 rounded-lg text-xs text-zinc-500 space-y-1">
                <div>
                  • 귀속 기간:{" "}
                  {format(
                    new Date(selectedCandidate.period.start),
                    "yyyy.MM.dd",
                  )}{" "}
                  ~{" "}
                  {format(new Date(selectedCandidate.period.end), "yyyy.MM.dd")}
                </div>
                <div>
                  • 총 근무:{" "}
                  {selectedCandidate.employee.role === "STAFF"
                    ? `${selectedCandidate.stats.totalWorkHours}시간`
                    : `${selectedCandidate.stats.workedDays}일`}
                </div>
              </div>

              <Button
                className="w-full h-11 text-base font-bold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 dark:shadow-none"
                onClick={handleConfirm}
                disabled={isConfirming}
              >
                {isConfirming ? "처리 중..." : "정산 확정하기"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
