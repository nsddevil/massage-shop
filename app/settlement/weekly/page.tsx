import { Sidebar } from "@/components/dashboard/sidebar";
import { WeeklySettlementClient } from "./WeeklySettlementClient";
import { getWeeklySettlementData } from "@/app/actions/settlement";
import { startOfWeek, endOfWeek } from "date-fns";
import { unstable_noStore as noStore } from "next/cache";
import { getKSTDate } from "@/lib/date";

export const dynamic = "force-dynamic";

export default async function WeeklySettlementPage() {
  noStore();
  const now = getKSTDate();
  // 월요일~일요일 범위
  const start = startOfWeek(now, { weekStartsOn: 1 });
  const end = endOfWeek(now, { weekStartsOn: 1 });

  const settlementRes = await getWeeklySettlementData(start, end);

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-black overflow-hidden font-sans">
      {/* Sidebar - Desktop Only */}
      <aside className="hidden lg:block w-72 shrink-0 h-full">
        <Sidebar />
      </aside>

      <WeeklySettlementClient
        initialData={settlementRes.success ? settlementRes.data || [] : []}
        initialDate={now.toISOString()}
      />
    </div>
  );
}
