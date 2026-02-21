import { Sidebar } from "@/components/dashboard/sidebar";
import { SalaryHistoryClient } from "./SalaryHistoryClient";
import { getSalarySettlementHistory } from "@/app/actions/settlement";

export default async function SalaryHistoryPage() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const result = await getSalarySettlementHistory(year, month);
  const initialHistory = result.success ? result.data : [];

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-black overflow-hidden font-sans">
      <aside className="hidden lg:block w-72 shrink-0 h-full">
        <Sidebar />
      </aside>

      <SalaryHistoryClient
        initialHistory={initialHistory}
        initialYear={year}
        initialMonth={month}
      />
    </div>
  );
}
