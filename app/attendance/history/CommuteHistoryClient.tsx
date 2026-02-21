"use client";

import { useState, useEffect } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  subMonths,
  addMonths,
} from "date-fns";
import { ko } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/dashboard/header";
import {
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
  Calendar as CalendarIcon,
} from "lucide-react";
import { toast } from "sonner";
import {
  getCommuteHistory,
  updateCommuteRecord,
  deleteCommuteRecord,
} from "@/app/actions/commute";

interface CommuteRecord {
  id: string;
  date: Date;
  employeeId: string;
  employee: {
    name: string;
    role: string;
  };
  clockIn: Date;
  clockOut: Date | null;
  workHours: number | null;
}

export function CommuteHistoryClient() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [records, setRecords] = useState<CommuteRecord[]>([]);
  const [loading, setLoading] = useState(false);

  // 수정 다이얼로그 상태
  const [selectedRecord, setSelectedRecord] = useState<CommuteRecord | null>(
    null,
  );
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editClockIn, setEditClockIn] = useState("");
  const [editClockOut, setEditClockOut] = useState("");

  const fetchHistory = async () => {
    setLoading(true);
    const startDate = startOfMonth(currentDate);
    const endDate = endOfMonth(currentDate);

    const res = await getCommuteHistory(startDate, endDate);
    if (res.success && res.data) {
      setRecords(res.data as unknown as CommuteRecord[]);
    } else {
      toast.error(res.error || "내역을 불러오는데 실패했습니다.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHistory();
  }, [currentDate]);

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const handleEditClick = (record: CommuteRecord) => {
    setSelectedRecord(record);
    // 날짜 인풋 포맷: YYYY-MM-DDTHH:mm
    setEditClockIn(format(new Date(record.clockIn), "yyyy-MM-dd'T'HH:mm"));
    setEditClockOut(
      record.clockOut
        ? format(new Date(record.clockOut), "yyyy-MM-dd'T'HH:mm")
        : "",
    );
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedRecord || !editClockIn) return;

    try {
      const res = await updateCommuteRecord(selectedRecord.id, {
        clockIn: new Date(editClockIn),
        clockOut: editClockOut ? new Date(editClockOut) : null,
      });

      if (res.success) {
        toast.success("수정되었습니다.");
        setIsEditDialogOpen(false);
        fetchHistory();
      } else {
        toast.error(res.error || "수정에 실패했습니다.");
      }
    } catch {
      toast.error("입력 형식이 올바르지 않습니다.");
    }
  };

  const handleDelete = async () => {
    if (!selectedRecord || !confirm("정말 이 기록을 삭제하시겠습니까?")) return;

    const res = await deleteCommuteRecord(selectedRecord.id);
    if (res.success) {
      toast.success("삭제되었습니다.");
      setIsEditDialogOpen(false);
      fetchHistory();
    } else {
      toast.error(res.error || "삭제에 실패했습니다.");
    }
  };

  // CommuteHistoryClient.tsx

  // Role Badge Helper Component
  const RoleBadge = ({ role }: { role: string }) => {
    let style = "bg-zinc-200 text-zinc-700 hover:bg-zinc-300";
    let label = role;

    switch (role) {
      case "OWNER":
        style = "bg-zinc-900 hover:bg-zinc-800 text-white border-zinc-900";
        label = "사장";
        break;
      case "MANAGER":
        style = "bg-blue-600 hover:bg-blue-700 text-white border-blue-600";
        label = "실장";
        break;
      case "THERAPIST":
        style = "bg-rose-500 hover:bg-rose-600 text-white border-rose-500";
        label = "관리사";
        break;
      case "STAFF":
        style = "bg-slate-500 hover:bg-slate-600 text-white border-slate-500";
        label = "직원";
        break;
    }

    return (
      <Badge
        variant="outline"
        className={cn("text-xs font-bold px-2 py-0.5 border-0", style)}
      >
        {label}
      </Badge>
    );
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-zinc-50 dark:bg-zinc-950">
      <Header />

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <CalendarIcon className="size-6" />
              출퇴근 기록 조회
            </h1>

            {/* Month Navigation */}
            <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 p-1 rounded-lg border shadow-sm">
              <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
                <ChevronLeft className="size-4" />
              </Button>
              <span className="text-lg font-bold min-w-[140px] text-center">
                {format(currentDate, "yyyy년 MM월")}
              </span>
              <Button variant="ghost" size="icon" onClick={handleNextMonth}>
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>

          {/* Desktop View (Table) */}
          <div className="hidden md:block bg-white dark:bg-zinc-900 rounded-xl border shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">날짜 (요일)</TableHead>
                  <TableHead>이름</TableHead>
                  <TableHead>직급</TableHead>
                  <TableHead>출근 시간</TableHead>
                  <TableHead>퇴근 시간</TableHead>
                  <TableHead>근무 시간</TableHead>
                  <TableHead className="w-[80px]">관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="h-32 text-center text-zinc-500"
                    >
                      로딩 중...
                    </TableCell>
                  </TableRow>
                ) : records.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="h-32 text-center text-zinc-500"
                    >
                      기록이 없습니다.
                    </TableCell>
                  </TableRow>
                ) : (
                  records.map((record) => (
                    <TableRow key={record.id} className="group">
                      <TableCell className="font-medium text-zinc-500">
                        {format(new Date(record.date), "MM-dd (EEE)", {
                          locale: ko,
                        })}
                      </TableCell>
                      <TableCell className="font-bold text-zinc-900 dark:text-zinc-100">
                        {record.employee.name}
                      </TableCell>
                      <TableCell>
                        <RoleBadge role={record.employee.role} />
                      </TableCell>
                      <TableCell className="text-emerald-700 font-medium">
                        {format(new Date(record.clockIn), "HH:mm")}
                      </TableCell>
                      <TableCell
                        className={
                          record.clockOut
                            ? "text-zinc-700"
                            : "text-red-400 font-bold"
                        }
                      >
                        {record.clockOut
                          ? format(new Date(record.clockOut), "HH:mm")
                          : "미마감"}
                      </TableCell>
                      <TableCell>
                        {record.workHours ? `${record.workHours} 시간` : "-"}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleEditClick(record)}
                        >
                          <Pencil className="size-4 text-zinc-400 hover:text-blue-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile View (Card List) */}
          <div className="space-y-4 md:hidden">
            {loading ? (
              <div className="text-center py-10 text-zinc-500">로딩 중...</div>
            ) : records.length === 0 ? (
              <div className="text-center py-10 text-zinc-500">
                기록이 없습니다.
              </div>
            ) : (
              records.map((record) => (
                <Card key={record.id} className="overflow-hidden">
                  <CardContent className="p-4 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-lg text-zinc-900 dark:text-zinc-100">
                            {record.employee.name}
                          </span>
                          <RoleBadge role={record.employee.role} />
                        </div>
                        <div className="text-sm text-zinc-500 flex items-center gap-1">
                          <CalendarIcon className="size-3" />
                          {format(new Date(record.date), "MM월 dd일 (EEE)", {
                            locale: ko,
                          })}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditClick(record)}
                      >
                        <Pencil className="size-4 text-zinc-400" />
                      </Button>
                    </div>

                    <div className="bg-zinc-50 dark:bg-zinc-900 p-3 rounded-xl grid grid-cols-3 gap-2">
                      <div className="text-center">
                        <div className="text-xs text-zinc-500 mb-1">출근</div>
                        <div className="font-bold text-emerald-600">
                          {format(new Date(record.clockIn), "HH:mm")}
                        </div>
                      </div>
                      <div className="text-center flex items-center justify-center pt-4">
                        <div className="w-full h-px bg-zinc-200 dark:bg-zinc-700"></div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-zinc-500 mb-1">퇴근</div>
                        <div
                          className={`font-bold ${
                            record.clockOut
                              ? "text-zinc-900 dark:text-zinc-100"
                              : "text-red-500"
                          }`}
                        >
                          {record.clockOut
                            ? format(new Date(record.clockOut), "HH:mm")
                            : "미마감"}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-zinc-100 dark:border-zinc-800">
                      <span className="text-sm font-medium text-zinc-500">
                        총 근무 시간
                      </span>
                      <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                        {record.workHours ? `${record.workHours} 시간` : "-"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>출퇴근 기록 수정</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>이름</Label>
              <div className="font-bold text-lg">
                {selectedRecord?.employee.name}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="clockIn">출근 시간</Label>
              <Input
                id="clockIn"
                type="datetime-local"
                value={editClockIn}
                onChange={(e) => setEditClockIn(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="clockOut">퇴근 시간</Label>
              <Input
                id="clockOut"
                type="datetime-local"
                value={editClockOut}
                onChange={(e) => setEditClockOut(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="size-4 mr-2" /> 삭제
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                취소
              </Button>
              <Button onClick={handleSaveEdit}>저장</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
