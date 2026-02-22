export const dynamic = "force-dynamic";

import { Sidebar } from "@/components/dashboard/sidebar";
import { FinancePageClient } from "./FinancePageClient";
import { getMonthlyFinance } from "@/app/actions/finance";
import { unstable_noStore as noStore } from "next/cache";
import { getKSTDate } from "@/lib/date";

export default async function FinancePage() {
  noStore();
  const now = getKSTDate();
  const financeRes = await getMonthlyFinance(
    now.getFullYear(),
    now.getMonth() + 1,
  );

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-black overflow-hidden font-sans">
      {/* Sidebar - Desktop Only */}
      <aside className="hidden lg:block w-72 shrink-0 h-full">
        <Sidebar />
      </aside>

      <FinancePageClient
        initialData={
          financeRes.success && financeRes.data
            ? (financeRes.data as any)
            : {
                summary: {
                  totalRevenue: 0,
                  totalExpense: 0,
                  netProfit: 0,
                  expenseBreakdown: {
                    general: 0,
                    commission: 0,
                    labor: 0,
                    extra: 0,
                  },
                },
                chartData: [],
              }
        }
        initialDate={now.toISOString()}
      />
    </div>
  );
}
