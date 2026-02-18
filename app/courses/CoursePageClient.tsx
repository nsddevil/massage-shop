"use client";

import { useState } from "react";
import { Search, Filter, BookOpen } from "lucide-react";
import { Course } from "@/types";
import { Header } from "@/components/dashboard/header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CourseTable } from "./components/CourseTable";
import { CourseRegistrationDialog } from "./components/CourseRegistrationDialog";

interface CoursePageClientProps {
  initialCourses: Course[];
}

export function CoursePageClient({ initialCourses }: CoursePageClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("selling");

  const filteredCourses = initialCourses.filter((course) => {
    const matchesSearch = course.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesTab =
      activeTab === "all" ||
      (activeTab === "selling" && course.isActive) ||
      (activeTab === "hidden" && !course.isActive);

    return matchesSearch && matchesTab;
  });

  const sellingCount = initialCourses.filter((c) => c.isActive).length;
  const hiddenCount = initialCourses.filter((c) => !c.isActive).length;

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
      <Header />

      <main className="flex-1 overflow-y-auto bg-zinc-50/50 dark:bg-zinc-950 p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 pb-12">
          {/* Top Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-3">
                <BookOpen className="size-6 text-blue-600" />
                코스 관리
              </h1>
              <p className="text-sm font-medium text-zinc-500">
                매장에서 제공하는 마사지 코스 및 가격을 관리합니다.
              </p>
            </div>
            <CourseRegistrationDialog />
          </div>

          {/* Filters & Actions */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row items-center gap-4 bg-white dark:bg-zinc-900/50 p-2 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
                <Input
                  placeholder="코스 이름으로 검색..."
                  className="pl-10 h-11 bg-transparent border-none focus-visible:ring-0 text-sm font-medium"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto px-1">
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full md:w-auto"
                >
                  <TabsList className="bg-zinc-100/50 dark:bg-zinc-800/50 h-9 p-1 rounded-xl">
                    <TabsTrigger
                      value="all"
                      className="rounded-lg px-4 text-xs font-bold"
                    >
                      전체 {initialCourses.length}
                    </TabsTrigger>
                    <TabsTrigger
                      value="selling"
                      className="rounded-lg px-4 text-xs font-bold"
                    >
                      판매 중 {sellingCount}
                    </TabsTrigger>
                    <TabsTrigger
                      value="hidden"
                      className="rounded-lg px-4 text-xs font-bold"
                    >
                      숨김 {hiddenCount}
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                <div className="h-4 w-[1px] bg-zinc-200 dark:bg-zinc-800 mx-1 hidden md:block" />
                <Button
                  variant="outline"
                  className="h-9 gap-2 border-zinc-200 dark:border-zinc-800 font-bold px-4 text-xs rounded-xl"
                >
                  <Filter className="size-3.5" />
                  분류 필터
                </Button>
              </div>
            </div>
          </div>

          {/* Table Section */}
          <section>
            <CourseTable courses={filteredCourses} />
          </section>
        </div>
      </main>
    </div>
  );
}
