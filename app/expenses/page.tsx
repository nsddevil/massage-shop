import { ExpensesClient } from "./ExpensesClient";
import { Sidebar } from "@/components/dashboard/sidebar";

export default function ExpensesPage() {
  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-black overflow-hidden font-sans">
      <aside className="hidden lg:block w-72 shrink-0 h-full border-r border-zinc-200 dark:border-zinc-800">
        <Sidebar />
      </aside>
      <ExpensesClient />
    </div>
  );
}
