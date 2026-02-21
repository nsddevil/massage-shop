"use client";

import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/dashboard/header";
import {
  Banknote,
  Plus,
  History,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SummaryCards } from "./components/SummaryCards";
import { SalesTable } from "./components/SalesTable";
import { SaleRegistrationDialog } from "./components/SaleRegistrationDialog";
import { Course, Employee, SaleWithDetails } from "@/types";
import { format, subDays, addDays } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getDailySales, getDailySummary } from "@/app/actions/sales";
import { toast } from "sonner";

interface SalesPageClientProps {
  initialSales: any[];
  initialSummary: any;
  courses: Course[];
  employees: Employee[];
}

export function SalesPageClient({
  initialSales,
  initialSummary,
  courses,
  employees,
}: SalesPageClientProps) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [sales, setSales] = useState<SaleWithDetails[]>(initialSales);
  const [summary, setSummary] = useState(initialSummary);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async (date: Date) => {
    setLoading(true);
    try {
      const [salesRes, summaryRes] = await Promise.all([
        getDailySales(date),
        getDailySummary(date),
      ]);

      if (salesRes.success) {
        setSales(salesRes.data as unknown as SaleWithDetails[]);
      } else {
        toast.error("매출 내역을 불러오는데 실패했습니다.");
      }

      if (summaryRes.success) {
        setSummary(summaryRes.data);
      } else {
        toast.error("요약 정보를 불러오는데 실패했습니다.");
      }
    } catch {
      toast.error("데이터 로딩 중 오류가 발생했습니다.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData(currentDate);
  }, [currentDate, fetchData]);

  const handlePrevDay = () => setCurrentDate((prev) => subDays(prev, 1));
  const handleNextDay = () => setCurrentDate((prev) => addDays(prev, 1));
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setCurrentDate(date);
      setIsCalendarOpen(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
      <Header />

      <main className="flex-1 overflow-y-auto bg-zinc-50/50 dark:bg-zinc-950 p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 pb-12">
          {/* Top Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-3">
                <Banknote className="size-6 text-emerald-600" />
                일별 매출 관리
              </h1>
              <p className="text-sm font-medium text-zinc-500">
                날짜별 매출 현황을 조회하고 관리합니다.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Date Navigation */}
              <div className="flex items-center bg-white dark:bg-zinc-900 rounded-lg border shadow-sm p-1">
                <Button variant="ghost" size="icon" onClick={handlePrevDay}>
                  <ChevronLeft className="size-4" />
                </Button>

                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-[140px] justify-center text-left font-bold text-lg",
                        !currentDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(currentDate, "yyyy.MM.dd")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="center">
                    <Calendar
                      mode="single"
                      selected={currentDate}
                      onSelect={handleDateSelect}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <Button variant="ghost" size="icon" onClick={handleNextDay}>
                  <ChevronRight className="size-4" />
                </Button>
              </div>

              <Button
                onClick={() => setIsDialogOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 h-11 px-6 rounded-2xl shadow-lg shadow-emerald-200 dark:shadow-none transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Plus className="size-5" />
                신규 매출 등록
              </Button>
            </div>
          </div>

          {/* Summary Cards Section */}
          <section className="relative">
            {loading && (
              <div className="absolute inset-0 bg-white/50 dark:bg-black/50 z-10 flex items-center justify-center rounded-xl backdrop-blur-sm">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              </div>
            )}
            <SummaryCards summary={summary} />
          </section>

          {/* Daily Sales Section */}
          <section className="space-y-4 relative">
            {loading && (
              <div className="absolute inset-0 bg-white/50 dark:bg-black/50 z-10 flex items-center justify-center rounded-xl backdrop-blur-sm">
                <div className="flex flex-col items-center gap-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                  <span className="text-sm font-bold text-emerald-600">
                    내역 불러오는 중...
                  </span>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <History className="size-5 text-zinc-400" />
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {format(currentDate, "MM월 dd일")} 매출 내역
              </h2>
            </div>
            <SalesTable
              sales={sales}
              courses={courses}
              employees={employees}
              onSuccess={() => fetchData(currentDate)}
            />
          </section>
        </div>
      </main>

      <SaleRegistrationDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        courses={courses}
        employees={employees}
        defaultDate={currentDate}
        onSuccess={() => {
          // 현재 날짜 데이터 다시 불러오기
          fetchData(currentDate);
        }}
      />
    </div>
  );
}
