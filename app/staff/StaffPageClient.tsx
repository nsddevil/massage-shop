"use client";

import { useState } from "react";
import { Search, Filter, Users } from "lucide-react";
import { Employee } from "@/types";
import { Header } from "@/components/dashboard/header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StaffTable } from "./components/StaffTable";
import { StaffRegistrationDialog } from "./components/StaffRegistrationDialog";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface StaffPageClientProps {
  initialEmployees: Employee[];
}

export function StaffPageClient({ initialEmployees }: StaffPageClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("active");

  const filteredEmployees = initialEmployees.filter((emp) => {
    const matchesSearch = emp.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const isResigned = !!emp.resignedAt;
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "active" && !isResigned) ||
      (activeTab === "resigned" && isResigned);

    return matchesSearch && matchesTab;
  });

  const activeCount = initialEmployees.filter((e) => !e.resignedAt).length;
  const resignedCount = initialEmployees.filter((e) => e.resignedAt).length;

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
      <Header />

      <main className="flex-1 overflow-y-auto bg-zinc-50/50 dark:bg-zinc-950 p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 pb-12">
          {/* Top Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-3">
                <Users className="size-6 text-blue-600" />
                직원 관리
              </h1>
              <p className="text-sm font-medium text-zinc-500">
                매장 직원의 정보를 관리하고 신규 인력을 등록합니다.
              </p>
            </div>
            <StaffRegistrationDialog />
          </div>

          {/* Filters & Actions */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row items-center gap-4 bg-white dark:bg-zinc-900/50 p-2 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
                <Input
                  placeholder="직원 이름으로 검색..."
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
                      전체 {initialEmployees.length}
                    </TabsTrigger>
                    <TabsTrigger
                      value="active"
                      className="rounded-lg px-4 text-xs font-bold"
                    >
                      재직 중 {activeCount}
                    </TabsTrigger>
                    <TabsTrigger
                      value="resigned"
                      className="rounded-lg px-4 text-xs font-bold"
                    >
                      퇴사자 {resignedCount}
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                <div className="h-4 w-[1px] bg-zinc-200 dark:bg-zinc-800 mx-1 hidden md:block" />
                <Button
                  variant="outline"
                  className="h-9 gap-2 border-zinc-200 dark:border-zinc-800 font-bold px-4 text-xs rounded-xl"
                >
                  <Filter className="size-3.5" />
                  상세 필터
                </Button>
              </div>
            </div>
          </div>

          {/* Table Section */}
          <section>
            <StaffTable employees={filteredEmployees} />
          </section>
        </div>
      </main>
    </div>
  );
}
