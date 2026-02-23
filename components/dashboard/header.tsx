"use client";

import { Calendar as CalendarIcon, Menu as MenuIcon } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Sidebar } from "@/components/dashboard/sidebar";
import { useState } from "react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { authClient } from "@/lib/auth-client";
import { AuthUser } from "@/types";

const pathMap: Record<string, string> = {
  "/": "대시보드",
  "/sales": "매출 관리",
  "/staff": "직원 관리",
  "/courses": "코스 관리",
  "/finance": "경영 분석",
  "/settlement/salary": "급여 정산",
  "/settlement/salary/history": "정산 내역",
  "/settlement/weekly": "주급 정산",
  "/settlement/monthly": "월급 정산",
  "/settings": "환경 설정",
};

export function Header() {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const getBreadcrumbs = () => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 0) {
      return (
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage className="font-semibold text-zinc-900 dark:text-zinc-100">
              대시보드
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      );
    }

    return (
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink
            href="/"
            className="text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            대시보드
          </BreadcrumbLink>
        </BreadcrumbItem>
        {segments.map((segment, index) => {
          const path = `/${segments.slice(0, index + 1).join("/")}`;
          const isLast = index === segments.length - 1;
          const label = pathMap[path] || segment;

          return (
            <div key={path} className="flex items-center gap-2">
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    href={path}
                    className="text-zinc-500 hover:text-zinc-900 transition-colors"
                  >
                    {label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </div>
          );
        })}
      </BreadcrumbList>
    );
  };

  return (
    <header className="flex items-center justify-between px-4 md:px-8 h-16 bg-white dark:bg-zinc-950/50 backdrop-blur-md sticky top-0 z-10 border-b border-zinc-100 dark:border-zinc-800/50">
      <div className="flex items-center gap-2 md:gap-4">
        {/* Mobile Menu Trigger */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-zinc-600"
            >
              <MenuIcon className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72 border-r-0">
            <SheetHeader className="sr-only">
              <SheetTitle>메뉴</SheetTitle>
            </SheetHeader>
            <Sidebar />
          </SheetContent>
        </Sheet>

        <Breadcrumb className="hidden md:block">{getBreadcrumbs()}</Breadcrumb>
      </div>

      <div className="flex items-center gap-2 md:gap-6">
        {/* User Info & Logout */}
        <div className="flex items-center gap-4 border-r pr-4 mr-2 border-zinc-200 dark:border-zinc-800">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {session?.user.name}
            </p>
            <p className="text-xs text-zinc-500 uppercase">
              {(session?.user as AuthUser | undefined)?.role || "USER"}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              await authClient.signOut();
              window.location.href = "/auth";
            }}
            className="text-zinc-500 hover:text-red-500 hover:bg-red-50/50"
          >
            로그아웃
          </Button>
        </div>

        {/* Date Selector */}
        <div className="sm:block">
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="h-10 gap-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 font-medium text-zinc-600 dark:text-zinc-300"
              >
                <CalendarIcon className="size-4 text-zinc-400" />
                <span className="hidden lg:inline">오늘: </span>
                {date ? format(date, "MM/dd", { locale: ko }) : "날짜 선택"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(newDate) => {
                  setDate(newDate);
                  setIsCalendarOpen(false);
                }}
                initialFocus
                locale={ko}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </header>
  );
}
