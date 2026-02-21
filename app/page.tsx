export const dynamic = "force-dynamic";

import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { RecentSalesTable } from "@/components/dashboard/recent-sales-table";
import { ExpenseChart } from "@/components/dashboard/expense-chart";
import { PaymentMethodStats } from "@/components/dashboard/payment-method-stats";
import { PopularityRankings } from "@/components/dashboard/popularity-rankings";
import {
  getDashboardStats,
  getWeeklyRevenue,
  getRecentSales,
  getExpenseDistribution,
  getPaymentDistribution,
  getTopRankings,
} from "@/app/actions/dashboard";

export default async function Home() {
  const [
    statsRes,
    weeklyRevenueRes,
    recentSalesRes,
    expenseRes,
    paymentRes,
    rankingsRes,
  ] = await Promise.all([
    getDashboardStats(),
    getWeeklyRevenue(),
    getRecentSales(),
    getExpenseDistribution(),
    getPaymentDistribution(),
    getTopRankings(),
  ]);

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
              <StatsCards
                data={statsRes.success && statsRes.data ? statsRes.data : null}
              />
            </section>

            {/* Trends & Analysis Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-8">
              <div className="xl:col-span-2">
                <RevenueChart
                  data={
                    weeklyRevenueRes.success && weeklyRevenueRes.data
                      ? weeklyRevenueRes.data
                      : []
                  }
                />
              </div>
              <div className="xl:col-span-1">
                <ExpenseChart
                  data={
                    expenseRes.success && expenseRes.data ? expenseRes.data : []
                  }
                />
              </div>
            </div>

            {/* Payment Method Stats Section */}
            <section>
              <PaymentMethodStats
                data={
                  paymentRes.success && paymentRes.data ? paymentRes.data : []
                }
              />
            </section>

            {/* Popularity Rankings Section */}
            <section>
              <PopularityRankings
                data={
                  rankingsRes.success && rankingsRes.data
                    ? rankingsRes.data
                    : null
                }
              />
            </section>

            {/* Recent Service Records Section */}
            <section>
              <RecentSalesTable
                data={
                  recentSalesRes.success && recentSalesRes.data
                    ? recentSalesRes.data
                    : []
                }
              />
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
