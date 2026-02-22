import { CommuteHistoryClient } from "./CommuteHistoryClient";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Suspense } from "react";

export default function CommuteHistoryPage() {
  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-black overflow-hidden font-sans">
      <aside className="hidden lg:block w-72 shrink-0 h-full border-r border-zinc-200 dark:border-zinc-800">
        <Sidebar />
      </aside>
      <Suspense
        fallback={
          <div className="flex-1 flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
            <div className="text-zinc-500 font-medium">로딩 중...</div>
          </div>
        }
      >
        <CommuteHistoryClient />
      </Suspense>
    </div>
  );
}
