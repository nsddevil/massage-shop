import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { RecentSalesTable } from "@/components/dashboard/recent-sales-table";

export default function Home() {
  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-black overflow-hidden font-sans">
      {/* Sidebar - Desktop Only for now */}
      <aside className="hidden lg:block w-72 shrink-0 h-full">
        <Sidebar />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto bg-zinc-50/50 dark:bg-zinc-950 p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-4 md:space-y-8 pb-12">
            {/* Stats Cards Section */}
            <section>
              <StatsCards />
            </section>

            {/* Revenue Trends Section */}
            <section>
              <RevenueChart />
            </section>

            {/* Recent Service Records Section */}
            <section>
              <RecentSalesTable />
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
