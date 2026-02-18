"use client";

import {
  Search,
  Calendar as CalendarIcon,
  Bell,
  Menu as MenuIcon,
} from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
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

export function Header() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

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

        <Breadcrumb className="hidden md:block">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                href="/"
                className="text-zinc-500 hover:text-zinc-900 transition-colors"
              >
                대시보드
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-semibold text-zinc-900 dark:text-zinc-100">
                개요
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center gap-2 md:gap-6">
        {/* Date Selector - Desktop Only */}
        <div className="hidden sm:block">
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

        {/* Search - Responsive Width */}
        <div className="relative w-40 md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
          <Input
            placeholder="거래 내역 검색..."
            className="pl-10 h-10 bg-zinc-50 dark:bg-zinc-900 border-none ring-1 ring-zinc-200 dark:ring-zinc-800 focus-visible:ring-blue-500/50"
          />
        </div>

        {/* Notifications & Profile */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="relative text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          >
            <Bell className="size-5" />
            <span className="absolute top-2.5 right-2.5 size-1.5 bg-red-500 rounded-full border border-white dark:border-zinc-950"></span>
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-3 cursor-pointer pl-1">
            <Avatar className="size-9 border-2 border-white dark:border-zinc-800 shadow-sm">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>관리</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  );
}
