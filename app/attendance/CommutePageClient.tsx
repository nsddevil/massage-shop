"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/dashboard/header";
import {
  LogIn,
  LogOut,
  CheckCircle2,
  AlertCircle,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  clockIn,
  clockOut,
  getTodayCommuteStatus,
} from "@/app/actions/commute";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { ko } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface EmployeeStatus {
  id: string;
  name: string;
  role: string;
  status: "OFF" | "WORKING" | "DONE";
  clockInTime?: Date | null;
  clockOutTime?: Date | null;
}

export function CommutePageClient({
  initialData,
  businessDate,
  initialDate,
}: {
  initialData: EmployeeStatus[];
  businessDate: Date;
  initialDate?: string;
}) {
  const [data, setData] = useState<EmployeeStatus[]>(initialData);
  const [selectedEmp, setSelectedEmp] = useState<EmployeeStatus | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // 실시간 시계
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const refreshData = async () => {
    const res = await getTodayCommuteStatus();
    if (res.success && res.data) {
      setData(res.data as EmployeeStatus[]);
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "OWNER":
        return "사장";
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

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case "OWNER":
        return "bg-zinc-900 hover:bg-zinc-800 text-white border-zinc-900"; // 사장: 검정 (권위)
      case "MANAGER":
        return "bg-blue-600 hover:bg-blue-700 text-white border-blue-600"; // 실장: 파랑 (신뢰)
      case "THERAPIST":
        return "bg-rose-500 hover:bg-rose-600 text-white border-rose-500"; // 관리사: 분홍 (케어)
      case "STAFF":
        return "bg-slate-500 hover:bg-slate-600 text-white border-slate-500"; // 직원: 회색 (기본)
      default:
        return "bg-zinc-200 text-zinc-700 hover:bg-zinc-300";
    }
  };

  const handleCardClick = (emp: EmployeeStatus) => {
    setSelectedEmp(emp);
    setIsDialogOpen(true);
  };

  const handleClockIn = async () => {
    if (!selectedEmp) return;
    setIsProcessing(true);
    const res = await clockIn(selectedEmp.id);
    if (res.success) {
      toast.success(`${selectedEmp.name}님 출근 처리되었습니다.`);
      await refreshData();
      setIsDialogOpen(false);
    } else {
      toast.error(res.error || "실패했습니다.");
    }
    setIsProcessing(false);
  };

  const handleClockOut = async () => {
    if (!selectedEmp) return;
    setIsProcessing(true);
    const res = await clockOut(selectedEmp.id);
    if (res.success) {
      toast.success(`${selectedEmp.name}님 퇴근 처리되었습니다.`);
      await refreshData();
      setIsDialogOpen(false);
    } else {
      toast.error(res.error || "실패했습니다.");
    }
    setIsProcessing(false);
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "WORKING":
        return "bg-emerald-100/80 border-emerald-200 text-emerald-700 ring-2 ring-emerald-500/20";
      case "DONE":
        return "bg-zinc-100 border-zinc-200 text-zinc-500 opacity-70";
      default:
        return "bg-white border-zinc-200 text-zinc-700 hover:border-emerald-300 hover:shadow-md";
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-zinc-50/50 dark:bg-zinc-950">
      <Header />

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Top Section: Date & Time */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4">
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest">
                {format(businessDate, "yyyy년 MM월 dd일 (EEE)", { locale: ko })}{" "}
                영업일 기준
              </h2>
              <h1 className="text-4xl md:text-5xl font-black text-zinc-900 dark:text-zinc-100 tabular-nums tracking-tight">
                {format(currentTime, "HH:mm:ss")}
              </h1>
            </div>

            <Button
              variant="outline"
              size="lg"
              className="rounded-2xl font-bold gap-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm"
              onClick={() => router.push("/attendance/history")}
            >
              <History className="size-5 text-zinc-400" />
              전체 기록 조회
            </Button>
          </div>

          {/* Employee Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {data.map((emp) => (
              <button
                key={emp.id}
                onClick={() => handleCardClick(emp)}
                className={cn(
                  "relative flex flex-col items-center justify-center p-6 gap-3 rounded-3xl border transition-all duration-200 cursor-pointer active:scale-95 text-left outline-none",
                  statusColor(emp.status),
                )}
              >
                {/* Status Indicator */}
                <div className="absolute top-4 right-4">
                  {emp.status === "WORKING" && (
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                  )}
                  {emp.status === "DONE" && (
                    <CheckCircle2 className="size-5 text-zinc-400" />
                  )}
                </div>

                {/* Avatar */}
                <div
                  className={cn(
                    "size-20 rounded-2xl flex items-center justify-center shadow-sm text-2xl font-black mb-1",
                    emp.status === "WORKING"
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800",
                  )}
                >
                  {emp.name.slice(0, 1)}
                </div>

                {/* Info */}
                <div className="text-center flex flex-col items-center gap-1">
                  <span className="text-lg font-black block leading-none">
                    {emp.name}
                  </span>
                  <Badge
                    variant="outline"
                    className={cn(
                      "px-2 py-0.5 text-xs font-bold border-0",
                      getRoleBadgeStyle(emp.role),
                    )}
                  >
                    {getRoleLabel(emp.role)}
                  </Badge>
                </div>

                {/* Time Badge */}
                {emp.status === "WORKING" && emp.clockInTime && (
                  <Badge
                    variant="secondary"
                    className="bg-white/50 backdrop-blur-sm text-emerald-700 font-bold border-emerald-200 mt-2"
                  >
                    {format(new Date(emp.clockInTime), "HH:mm")} 출근됨
                  </Badge>
                )}
                {emp.status === "DONE" && emp.clockOutTime && (
                  <Badge
                    variant="secondary"
                    className="bg-zinc-200/50 text-zinc-500 font-medium border-transparent mt-2"
                  >
                    {format(new Date(emp.clockOutTime), "HH:mm")} 퇴근함
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* Action Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-sm rounded-[2rem] border-none shadow-2xl p-6">
          <DialogHeader className="items-center text-center space-y-4 pt-4">
            <div className="size-24 rounded-3xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-4xl font-black text-zinc-900 dark:text-zinc-100">
              {selectedEmp?.name.slice(0, 1)}
            </div>
            <div>
              <DialogTitle className="flex flex-col items-center gap-2 text-2xl font-black text-zinc-900 dark:text-zinc-100">
                <span>{selectedEmp?.name}</span>
                {selectedEmp && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "px-2 py-0.5 text-sm font-bold border-0",
                      getRoleBadgeStyle(selectedEmp.role),
                    )}
                  >
                    {getRoleLabel(selectedEmp.role)}
                  </Badge>
                )}
              </DialogTitle>
              <DialogDescription className="text-zinc-500 font-medium mt-1">
                {selectedEmp?.status === "WORKING"
                  ? "현재 근무 중입니다. 퇴근하시겠습니까?"
                  : selectedEmp?.status === "DONE"
                    ? "오늘 업무를 마치셨습니다. 다시 출근하시겠습니까?"
                    : "안녕하세요! 출근하시겠습니까?"}
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {(selectedEmp?.status === "OFF" ||
              selectedEmp?.status === "DONE") && (
              <Button
                onClick={handleClockIn}
                className="w-full h-16 text-lg font-bold bg-zinc-900 hover:bg-zinc-800 text-white rounded-2xl shadow-lg"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  "처리 중..."
                ) : (
                  <>
                    <LogIn className="mr-2" />{" "}
                    {selectedEmp?.status === "DONE"
                      ? "다시 출근하기"
                      : "출근하기"}
                  </>
                )}
              </Button>
            )}

            {selectedEmp?.status === "WORKING" && (
              <Button
                onClick={handleClockOut}
                className="w-full h-16 text-lg font-bold bg-red-500 hover:bg-red-600 text-white rounded-2xl shadow-lg"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  "처리 중..."
                ) : (
                  <>
                    <LogOut className="mr-2" /> 퇴근하기
                  </>
                )}
              </Button>
            )}

            {/* 시급제 직원(STAFF)일 경우 식대 안내 메시지 (퇴근 시) */}
            {selectedEmp?.role === "STAFF" &&
              selectedEmp?.status === "WORKING" && (
                <div className="bg-blue-50 text-blue-700 text-xs font-bold p-3 rounded-xl text-center flex items-center justify-center gap-2">
                  <AlertCircle className="size-4" />
                  퇴근 시 일일 식대가 급여에 포함됩니다.
                </div>
              )}

            {/* 히스토리 바로가기 버튼 */}
            <Button
              variant="ghost"
              className="w-full text-zinc-500 font-bold gap-2"
              onClick={() =>
                router.push(`/attendance/history?employeeId=${selectedEmp?.id}`)
              }
            >
              <History className="size-4" />이 직원의 출퇴근 기록 보기
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
