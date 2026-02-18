"use client";

import { useState } from "react";
import { Header } from "@/components/dashboard/header";
import { Banknote, Plus, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SummaryCards } from "./components/SummaryCards";
import { SalesTable } from "./components/SalesTable";
import { SaleRegistrationDialog } from "./components/SaleRegistrationDialog";
import { Course, Employee, SaleWithDetails } from "@/types";

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
  const [sales, setSales] = useState<SaleWithDetails[]>(initialSales);
  const [summary, setSummary] = useState(initialSummary);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
                매출 및 커미션 관리
              </h1>
              <p className="text-sm font-medium text-zinc-500">
                오늘의 매출을 기록하고 관리사별 커미션을 자동 계산합니다.
              </p>
            </div>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 h-11 px-6 rounded-2xl shadow-lg shadow-emerald-200 dark:shadow-none transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="size-5" />
              신규 매출 등록
            </Button>
          </div>

          {/* Summary Cards Section */}
          <section>
            <SummaryCards summary={summary} />
          </section>

          {/* Recent Sales Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <History className="size-5 text-zinc-400" />
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                최근 매출 내역
              </h2>
            </div>
            <SalesTable sales={sales} />
          </section>
        </div>
      </main>

      <SaleRegistrationDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        courses={courses}
        employees={employees}
        onSuccess={(newSale) => {
          // 실제로는 페이지 전체를 revalidate하거나 데이터를 다시 불러오는 것이 좋지만
          // 여기서는 간단히 로컬 상태만 업데이트하거나 알림 처리
          window.location.reload();
        }}
      />
    </div>
  );
}
