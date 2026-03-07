"use client";

import { useState, useCallback } from "react";
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
import { Course, Employee, SaleWithDetails, DailySummary } from "@/types";
import { format, subDays, addDays } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useRouter } from "next/navigation";

interface SalesPageClientProps {
  initialDate: Date;
  initialSales: SaleWithDetails[];
  initialSummary: DailySummary | null;
  courses: Course[];
  employees: Employee[];
}

export function SalesPageClient({
  initialDate,
  initialSales,
  initialSummary,
  courses,
  employees,
}: SalesPageClientProps) {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // 데이터 페칭 함수 (필요 시 수동 호출용 - 예: 등록 성공 후)
  const refreshData = useCallback(() => {
    router.refresh();
  }, [router]);

  const handlePrevDay = () => {
    const nextDate = subDays(initialDate, 1);
    router.push(`?date=${format(nextDate, "yyyy-MM-dd")}`);
  };

  const handleNextDay = () => {
    const nextDate = addDays(initialDate, 1);
    router.push(`?date=${format(nextDate, "yyyy-MM-dd")}`);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setIsCalendarOpen(false);
      router.push(`?date=${format(date, "yyyy-MM-dd")}`);
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
                        !initialDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(initialDate, "yyyy.MM.dd")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="center">
                    <Calendar
                      mode="single"
                      selected={initialDate}
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
            <SummaryCards summary={initialSummary} />
          </section>

          {/* Daily Sales Section */}
          <section className="space-y-4 relative">
            <div className="flex items-center gap-2">
              <History className="size-5 text-zinc-400" />
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {format(initialDate, "MM월 dd일")} 매출 내역
              </h2>
            </div>
            <SalesTable
              sales={initialSales}
              courses={courses}
              employees={employees}
              onSuccess={refreshData}
            />
          </section>
        </div>
      </main>

      <SaleRegistrationDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        courses={courses}
        employees={employees}
        defaultDate={initialDate}
        onSuccess={refreshData}
      />
    </div>
  );
}
