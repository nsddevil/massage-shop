export const dynamic = "force-dynamic";

import { CommutePageClient } from "./CommutePageClient";
import { getTodayCommuteStatus } from "@/app/actions/commute";
import { Sidebar } from "@/components/dashboard/sidebar";

export default async function CommutePage() {
  const { data, businessDate } = await getTodayCommuteStatus();

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-black overflow-hidden font-sans">
      {/* Sidebar - Desktop Only (Optional for Kiosk, but good for nav) */}
      <aside className="hidden lg:block w-72 shrink-0 h-full">
        <Sidebar />
      </aside>

      <CommutePageClient
        initialData={data || []}
        businessDate={businessDate || new Date()}
      />
    </div>
  );
}
