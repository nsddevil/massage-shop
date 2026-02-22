import { Sidebar } from "@/components/dashboard/sidebar";
import { CommutePageClient } from "./CommutePageClient";
import { getTodayCommuteStatus } from "@/app/actions/commute";
import { unstable_noStore as noStore } from "next/cache";
import { kst } from "@/lib/date";

export const dynamic = "force-dynamic";

export default async function CommutePage() {
  noStore();
  const now = kst.now();
  const { data, businessDate } = await getTodayCommuteStatus();

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-black overflow-hidden font-sans">
      {/* Sidebar - Desktop Only (Optional for Kiosk, but good for nav) */}
      <aside className="hidden lg:block w-72 shrink-0 h-full">
        <Sidebar />
      </aside>

      <CommutePageClient
        initialData={data || []}
        businessDate={businessDate || now}
        initialDate={now.toISOString()}
      />
    </div>
  );
}
