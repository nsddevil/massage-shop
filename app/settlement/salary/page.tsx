export const dynamic = "force-dynamic";

import { Sidebar } from "@/components/dashboard/sidebar";
import { SalarySettlementClient } from "./SalarySettlementClient";
import {
  getEmployeeListForSalary,
  getSalarySettlementStats,
} from "@/app/actions/settlement";
import { unstable_noStore as noStore } from "next/cache";
import { kst } from "@/lib/date";

export default async function SalarySettlementPage() {
  noStore();
  const now = kst.now();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const [empRes, statsRes] = await Promise.all([
    getEmployeeListForSalary(),
    getSalarySettlementStats(year, month),
  ]);

  const employees = empRes.success ? empRes.data : [];
  const stats = statsRes.success
    ? statsRes.data
    : { settledCount: 0, unpaidAdvanceAmount: 0 };

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-black overflow-hidden font-sans">
      <aside className="hidden lg:block w-72 shrink-0 h-full">
        <Sidebar />
      </aside>

      <SalarySettlementClient
        employees={employees || []}
        stats={stats || { settledCount: 0, unpaidAdvanceAmount: 0 }}
        initialDate={now.toISOString()}
      />
    </div>
  );
}
