import { redirect } from "next/navigation";
import { isOwner } from "@/lib/auth-util";
import { Sidebar } from "@/components/dashboard/sidebar";
import { UserManagementClient } from "./UserManagementClient";

export default async function UserManagementPage() {
  const owner = await isOwner();
  if (!owner) {
    redirect("/");
  }

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-black overflow-hidden font-sans">
      <aside className="hidden lg:block w-72 shrink-0 h-full">
        <Sidebar />
      </aside>
      <UserManagementClient />
    </div>
  );
}
