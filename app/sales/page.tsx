import { Sidebar } from "@/components/dashboard/sidebar";
import { SalesPageClient } from "./SalesPageClient";
import {
  getRecentSales,
  getDailySummary,
  getDailySales,
} from "@/app/actions/sales";
import { getCourses } from "@/app/actions/course";
import { getEmployees } from "@/app/actions/staff";

export default async function SalesPage() {
  const [dailySalesRes, summaryRes, coursesRes, employeesRes] =
    await Promise.all([
      getDailySales(),
      getDailySummary(),
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
        initialSales={dailySalesRes.success ? dailySalesRes.data : []}
        initialSummary={summaryRes.success ? summaryRes.data : null}
        courses={coursesRes.success ? coursesRes.data : []}
        employees={employeesRes.success ? employeesRes.data : []}
      />
    </div>
  );
}
