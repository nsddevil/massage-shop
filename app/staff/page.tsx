import { Sidebar } from "@/components/dashboard/sidebar";
import { StaffPageClient } from "./StaffPageClient";
import { getEmployees } from "@/app/actions/staff";
import { Employee } from "@/types";

export default async function StaffPage() {
  const result = await getEmployees();
  const employees: Employee[] = result.success
    ? (result.data as unknown as Employee[])
    : [];

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-black overflow-hidden font-sans">
      {/* Sidebar - Desktop Only */}
      <aside className="hidden lg:block w-72 shrink-0 h-full">
        <Sidebar />
      </aside>

      {/* Client Context Container */}
      <StaffPageClient initialEmployees={employees} />
    </div>
  );
}
