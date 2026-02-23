"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  ReceiptText,
  BarChart3,
  Coins,
  Wallet,
  TrendingDown,
  Clock,
  Settings,
  Menu,
  History,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth-client";
import { AuthUser } from "@/types";

const menuItems = [
  { name: "대시보드", icon: LayoutDashboard, href: "/" },
  { name: "직원관리", icon: Users, href: "/staff" },
  { name: "코스관리", icon: BookOpen, href: "/courses" },
  { name: "일별매출", icon: ReceiptText, href: "/sales" },
  { name: "월별 경영분석", icon: BarChart3, href: "/finance" },
  { name: "주급정산", icon: Coins, href: "/settlement/weekly" },
  { name: "월급정산", icon: Wallet, href: "/settlement/salary" },
  { name: "지출관리", icon: TrendingDown, href: "/expenses" },
  { name: "출퇴근관리", icon: Clock, href: "/attendance" },
  { name: "근태기록", icon: History, href: "/attendance/history" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();
  const user = session?.user as AuthUser | undefined;
  const isOwner = user?.role === "admin" || user?.role === "OWNER";

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-950 border-r-0 lg:border-r border-zinc-200 dark:border-zinc-800">
      {/* Logo Section */}
      <div className="flex items-center gap-3 px-6 h-16 shrink-0 border-b lg:border-b-0 border-zinc-100 dark:border-zinc-800">
        <div className="size-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <Menu className="size-5 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Massage Shop
          </span>
          <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">
            매장 관리 시스템
          </span>
        </div>
      </div>

      <ScrollArea className="flex-1 px-3 py-2">
        <div className="space-y-1 py-4">
          {menuItems
            .filter((item) => {
              if (
                !isOwner &&
                ["주급정산", "월급정산", "월별 경영분석"].includes(item.name)
              ) {
                return false;
              }
              return true;
            })
            .map((item) => (
              <Link key={item.href} href={item.href}>
                <span
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-zinc-100 dark:hover:bg-zinc-900 group",
                    pathname === item.href
                      ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                      : "text-zinc-600 dark:text-zinc-400",
                  )}
                >
                  <item.icon
                    className={cn(
                      "size-4 shrink-0 transition-colors",
                      pathname === item.href
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100",
                    )}
                  />
                  {item.name}
                </span>
              </Link>
            ))}

          {/* Owner Only Menu */}
          {isOwner && (
            <>
              <Link href="/admin/users">
                <span
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-zinc-100 dark:hover:bg-zinc-900 group",
                    pathname === "/admin/users"
                      ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                      : "text-zinc-600 dark:text-zinc-400",
                  )}
                >
                  <ShieldAlert
                    className={cn(
                      "size-4 shrink-0 transition-colors",
                      pathname === "/admin/users"
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100",
                    )}
                  />
                  사용자 권한 관리
                </span>
              </Link>
            </>
          )}
        </div>

        {isOwner && (
          <>
            <Separator className="my-4 mx-3 bg-zinc-100 dark:bg-zinc-800" />
            <div className="space-y-1">
              <Link href="/settings">
                <span
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-zinc-100 dark:hover:bg-zinc-900 group text-zinc-600 dark:text-zinc-400",
                    pathname === "/settings" &&
                      "bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100",
                  )}
                >
                  <Settings className="size-4 shrink-0 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100" />
                  설정
                </span>
              </Link>
            </div>
          </>
        )}
      </ScrollArea>
    </div>
  );
}
