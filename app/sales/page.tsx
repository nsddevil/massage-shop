import { Sidebar } from "@/components/dashboard/sidebar";
import { SalesPageClient } from "./SalesPageClient";
import { getDailySummary, getDailySales } from "@/app/actions/sales";
import { getCourses } from "@/app/actions/course";
import { getEmployees } from "@/app/actions/staff";
import { parseISO } from "date-fns";
import { kst } from "@/lib/date";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function SalesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const dateStr = params.date;
  const targetDate = dateStr ? parseISO(dateStr) : kst.startOfDay(new Date());

  const [dailySalesRes, summaryRes, coursesRes, employeesRes] =
    await Promise.all([
      getDailySales(targetDate),
      getDailySummary(targetDate),
      getCourses(),
      getEmployees(),
    ]);

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-black overflow-hidden font-sans">
      {/* Sidebar - Desktop Only */}
      <aside className="hidden lg:block w-72 shrink-0 h-full">
        <Sidebar />
      </aside>

      <SalesPageClient
        initialDate={targetDate}
        initialSales={dailySalesRes.success ? dailySalesRes.data || [] : []}
        initialSummary={summaryRes.success ? summaryRes.data || null : null}
        courses={coursesRes.success ? coursesRes.data || [] : []}
        employees={employeesRes.success ? employeesRes.data || [] : []}
      />
    </div>
  );
}
