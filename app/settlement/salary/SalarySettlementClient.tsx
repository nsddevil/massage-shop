"use client";

import { useState } from "react";
import { Header } from "@/components/dashboard/header";
import {
  Wallet,
  Search,
  History,
  UserCircle2,
  ChevronRight,
  TrendingUp,
  CreditCard,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SettlementDialog } from "./_components/SettlementDialog";
import Link from "next/link";
import { format } from "date-fns";

interface SalarySettlementClientProps {
  employees: any[];
  stats: {
    settledCount: number;
    unpaidAdvanceAmount: number;
  };
}

export function SalarySettlementClient({
  employees,
  stats,
}: SalarySettlementClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "MANAGER":
        return "실장";
      case "THERAPIST":
        return "관리사";
      case "STAFF":
        return "직원";
      default:
        return role;
    }
  };

  const filteredEmployees =
    employees?.filter((emp) =>
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()),
    ) || [];

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-zinc-50 dark:bg-black">
      <Header />

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header & Search */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-200 dark:shadow-none">
                  <Wallet className="size-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                  월급 정산 관리
                </h1>
              </div>
              <p className="text-zinc-500 dark:text-zinc-400 font-medium">
                정규직 및 시급제 직원의 월 급여를 정산하고 내역을 관리합니다.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/settlement/salary/history">
                <Button
                  variant="outline"
                  className="h-12 px-6 rounded-xl font-bold gap-2"
                >
                  <History className="size-4" />
                  정산 히스토리
                </Button>
              </Link>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
                <Input
                  placeholder="직원 이름 검색..."
                  className="pl-10 h-12 w-[240px] md:w-[320px] rounded-xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm focus:ring-2 focus:ring-blue-500/20"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-none shadow-xl shadow-zinc-200/50 dark:shadow-none bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-2xl">
                    <UserCheck className="size-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-500">
                      총 직원 수
                    </p>
                    <p className="text-2xl font-black text-zinc-900 dark:text-zinc-50">
                      {employees.length}명
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl shadow-zinc-200/50 dark:shadow-none bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl">
                    <TrendingUp className="size-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-500">
                      이번 달 정산 완료
                    </p>
                    <p className="text-2xl font-black text-zinc-900 dark:text-zinc-50">
                      {stats.settledCount}건
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl shadow-zinc-200/50 dark:shadow-none bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-amber-50 dark:bg-amber-500/10 rounded-2xl">
                    <CreditCard className="size-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-500">
                      미지급 가불금
                    </p>
                    <p className="text-2xl font-black text-zinc-900 dark:text-zinc-50">
                      {stats.unpaidAdvanceAmount.toLocaleString()}원
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Employee Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEmployees.map((emp) => (
              <Card
                key={emp.id}
                className="group relative border-none shadow-xl shadow-zinc-200/50 dark:shadow-none bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all duration-300 flex flex-col"
              >
                <CardHeader className="p-6 pb-4">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4">
                      <div className="p-3 bg-zinc-100 dark:bg-black rounded-2xl group-hover:bg-blue-600 transition-colors duration-300">
                        <UserCircle2 className="size-6 text-zinc-400 group-hover:text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-black text-zinc-900 dark:text-zinc-50 group-hover:text-blue-600 transition-colors">
                          {emp.name}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant="secondary"
                            className="bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold px-2 py-0"
                          >
                            {getRoleBadge(emp.role)}
                          </Badge>
                          <span className="text-[10px] text-zinc-400 font-medium">
                            입사일: {format(new Date(emp.joinedAt), "yy.MM.dd")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6 pt-0 space-y-4 flex-grow flex flex-col">
                  <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

                  <div className="grid grid-cols-2 gap-4 py-2 flex-grow">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                        급여 조건
                      </p>
                      <p className="text-sm font-black text-zinc-700 dark:text-zinc-300">
                        {emp.role === "STAFF"
                          ? `시급 ₩${emp.hourlyRate?.toLocaleString()}`
                          : `기본급 ₩${emp.baseSalary?.toLocaleString()}`}
                      </p>
                    </div>
                    <div className="space-y-1 text-right">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                        최종 정산일
                      </p>
                      <p className="text-sm font-black text-zinc-700 dark:text-zinc-300">
                        {emp.lastSettlementAt
                          ? format(new Date(emp.lastSettlementAt), "MM.dd")
                          : "내역 없음"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-auto">
                    <Button
                      className="w-full h-12 rounded-2xl bg-zinc-900 hover:bg-blue-600 dark:bg-black dark:hover:bg-blue-600 text-white font-black text-sm transition-all duration-300 group-hover:shadow-lg group-hover:shadow-blue-200 dark:group-hover:shadow-none flex items-center justify-center gap-2"
                      onClick={() => setSelectedEmployee(emp)}
                    >
                      정산하기
                      <ChevronRight className="size-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      {/* Settlement Dialog */}
      {selectedEmployee && (
        <SettlementDialog
          employee={selectedEmployee}
          open={!!selectedEmployee}
          onOpenChange={(isOpen) => !isOpen && setSelectedEmployee(null)}
          onSuccess={() => {
            setSelectedEmployee(null);
            // Refresh logic if needed
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}
