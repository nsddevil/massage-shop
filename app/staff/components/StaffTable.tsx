"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import {
  MoreHorizontal,
  User,
  Calendar,
  Wallet,
  Coins,
  Edit2,
  Trash2,
  Loader2,
  UserMinus,
  UserPlus,
} from "lucide-react";
import { Employee, ROLE_LABELS } from "@/types";
import {
  deleteEmployee,
  resignEmployee,
  restoreEmployee,
} from "@/app/actions/staff";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StaffEditDialog } from "./StaffEditDialog";
import { cn } from "@/lib/utils";

interface StaffTableProps {
  employees: Employee[];
}

export function StaffTable({ employees }: StaffTableProps) {
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isPending, setIsPending] = useState<string | null>(null);

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`${name} 직원의 모든 정보를 삭제하시겠습니까?`)) {
      setIsDeleting(id);
      const result = await deleteEmployee(id);
      setIsDeleting(null);
      if (!result.success) {
        alert(result.error);
      }
    }
  };

  const handleResign = async (id: string, name: string) => {
    if (confirm(`${name} 직원을 오늘 날짜로 퇴사 처리하시겠습니까?`)) {
      setIsPending(id);
      const result = await resignEmployee(id, new Date());
      setIsPending(null);
      if (!result.success) {
        alert(result.error);
      }
    }
  };

  const handleRestore = async (id: string, name: string) => {
    if (confirm(`${name} 직원을 재직 상태로 복구하시겠습니까?`)) {
      setIsPending(id);
      const result = await restoreEmployee(id);
      setIsPending(null);
      if (!result.success) {
        alert(result.error);
      }
    }
  };

  if (employees.length === 0) {
    return (
      <Card className="border-dashed border-2 bg-zinc-50/50 dark:bg-zinc-900/10 py-20">
        <CardContent className="flex flex-col items-center justify-center space-y-3">
          <div className="size-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
            <User className="size-6 text-zinc-400" />
          </div>
          <div className="text-zinc-500 font-medium">
            등록된 직원이 없습니다.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Mobile-only Card Layout */}
      <div className="md:hidden space-y-4">
        {employees.map((staff) => {
          const isResigned = !!staff.resignedAt;
          return (
            <Card
              key={staff.id}
              className={cn(
                "border-none shadow-sm bg-white dark:bg-zinc-900 shadow-zinc-200 dark:shadow-none overflow-hidden transition-all",
                isResigned && "opacity-60 grayscale-[0.5]",
              )}
            >
              <CardContent className="p-5 space-y-5">
                {/* Mobile Header: Avatar + Info + Actions */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-11 border border-zinc-100 dark:border-zinc-800 shadow-sm">
                      <AvatarImage
                        src={`https://i.pravatar.cc/150?u=${staff.id}`}
                      />
                      <AvatarFallback>{staff.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-zinc-900 dark:text-zinc-100 text-lg tracking-tight">
                          {staff.name}
                        </span>
                        {isResigned && (
                          <Badge className="bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-zinc-100 border-none text-[9px] h-4 font-bold">
                            퇴사
                          </Badge>
                        )}
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          "w-fit font-bold text-[10px] px-2 py-0 border-none",
                          staff.role === "OWNER"
                            ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                            : staff.role === "MANAGER"
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                              : staff.role === "THERAPIST"
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400",
                        )}
                      >
                        {ROLE_LABELS[staff.role]}
                      </Badge>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="secondary"
                        size="icon"
                        disabled={
                          isDeleting === staff.id || isPending === staff.id
                        }
                        className="size-9 rounded-xl shadow-sm bg-zinc-50 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 border-none"
                      >
                        {isDeleting === staff.id || isPending === staff.id ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <MoreHorizontal className="size-5" />
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-48 rounded-2xl p-2 border-zinc-100 dark:border-zinc-800 shadow-xl"
                    >
                      <DropdownMenuItem
                        className="gap-3 py-2.5 px-3 font-bold text-sm rounded-xl transition-all cursor-pointer"
                        onClick={() => setEditingEmployee(staff)}
                      >
                        <Edit2 className="size-4 text-blue-600" />
                        정보 수정
                      </DropdownMenuItem>
                      <div className="h-[1px] bg-zinc-100 dark:bg-zinc-800 my-1" />
                      {!isResigned ? (
                        <DropdownMenuItem
                          className="gap-3 py-2.5 px-3 font-bold text-sm text-orange-600 focus:text-orange-600 rounded-xl transition-all cursor-pointer"
                          onClick={() => handleResign(staff.id, staff.name)}
                        >
                          <UserMinus className="size-4" />
                          퇴사 처리
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          className="gap-3 py-2.5 px-3 font-bold text-sm text-emerald-600 focus:text-emerald-600 rounded-xl transition-all cursor-pointer"
                          onClick={() => handleRestore(staff.id, staff.name)}
                        >
                          <UserPlus className="size-4" />
                          재직으로 복구
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        className="gap-3 py-2.5 px-3 font-bold text-sm text-red-600 focus:text-red-600 rounded-xl transition-all cursor-pointer"
                        onClick={() => handleDelete(staff.id, staff.name)}
                      >
                        <Trash2 className="size-4" />
                        데이터 삭제
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Mobile Info Grid */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-4 pt-1">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">
                      전화번호
                    </span>
                    <div className="text-zinc-700 dark:text-zinc-300 font-bold text-sm">
                      {staff.phone || "-"}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">
                      입사일
                    </span>
                    <div className="text-zinc-700 dark:text-zinc-300 font-bold text-sm flex items-center gap-1.5">
                      <Calendar className="size-3 text-zinc-300" />
                      {format(new Date(staff.joinedAt), "yyyy-MM-dd", {
                        locale: ko,
                      })}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">
                      기본급 (월)
                    </span>
                    <div className="text-zinc-900 dark:text-zinc-100 font-black text-sm flex items-center gap-1">
                      <Wallet className="size-3 text-zinc-300" />₩
                      {(staff.baseSalary || 0).toLocaleString()}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">
                      시급
                    </span>
                    <div className="text-zinc-900 dark:text-zinc-100 font-black text-sm flex items-center gap-1">
                      <Coins className="size-3 text-zinc-300" />₩
                      {(staff.hourlyRate || 0).toLocaleString()}
                    </div>
                  </div>
                </div>

                {isResigned && staff.resignedAt && (
                  <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-700">
                    <p className="text-[11px] font-bold text-zinc-500 flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-orange-500 animate-pulse" />
                      퇴거 정보:{" "}
                      {format(new Date(staff.resignedAt), "yyyy-MM-dd")} 퇴사
                      처리됨
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Desktop Table Layout (md and up) */}
      <Card className="hidden md:block border-none shadow-sm shadow-zinc-200 dark:shadow-none bg-white dark:bg-zinc-900/50 overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-[1000px] lg:min-w-full">
              <TableHeader>
                <TableRow className="bg-zinc-50/50 dark:bg-zinc-900/30 border-y border-zinc-100 dark:border-zinc-800">
                  <TableHead className="font-bold text-zinc-400 uppercase text-[10px] pl-6 tracking-wider">
                    이름
                  </TableHead>
                  <TableHead className="font-bold text-zinc-400 uppercase text-[10px] tracking-wider">
                    역할
                  </TableHead>
                  <TableHead className="font-bold text-zinc-400 uppercase text-[10px] tracking-wider">
                    전화번호
                  </TableHead>
                  <TableHead className="font-bold text-zinc-400 uppercase text-[10px] tracking-wider">
                    입사일
                  </TableHead>
                  <TableHead className="font-bold text-zinc-400 uppercase text-[10px] tracking-wider">
                    기본급 (월)
                  </TableHead>
                  <TableHead className="font-bold text-zinc-400 uppercase text-[10px] tracking-wider">
                    시급
                  </TableHead>
                  <TableHead className="font-bold text-zinc-400 uppercase text-[10px] tracking-wider">
                    일일 식대
                  </TableHead>
                  <TableHead className="font-bold text-zinc-400 uppercase text-[10px] tracking-wider text-center pr-6">
                    관리
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((staff) => {
                  const isResigned = !!staff.resignedAt;
                  return (
                    <TableRow
                      key={staff.id}
                      className={cn(
                        "border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-colors",
                        isResigned && "opacity-60 grayscale-[0.5]",
                      )}
                    >
                      <TableCell className="pl-6">
                        <div className="flex items-center gap-3 py-1">
                          <Avatar className="size-9 border border-zinc-100 dark:border-zinc-800 shadow-sm">
                            <AvatarImage
                              src={`https://i.pravatar.cc/150?u=${staff.id}`}
                            />
                            <AvatarFallback>{staff.name[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-zinc-900 dark:text-zinc-100">
                                {staff.name}
                              </span>
                              {isResigned && (
                                <Badge className="bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-zinc-200 border-none text-[9px] h-4">
                                  퇴사
                                </Badge>
                              )}
                            </div>
                            <span className="text-[10px] text-zinc-400 font-medium tracking-tight">
                              {isResigned && staff.resignedAt
                                ? `퇴사일: ${format(new Date(staff.resignedAt), "yy-MM-dd")}`
                                : `ID: ${staff.id.slice(0, 8)}`}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "font-bold text-[10px] px-2.5 py-0.5 border-none",
                            staff.role === "OWNER"
                              ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                              : staff.role === "MANAGER"
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                : staff.role === "THERAPIST"
                                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                  : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400",
                          )}
                        >
                          {ROLE_LABELS[staff.role]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-zinc-600 dark:text-zinc-400 font-medium text-sm">
                          {staff.phone || "-"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 font-medium text-sm">
                          <Calendar className="size-3.5 text-zinc-300" />
                          {format(new Date(staff.joinedAt), "yyyy-MM-dd", {
                            locale: ko,
                          })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 font-bold text-zinc-700 dark:text-zinc-300">
                          <Wallet className="size-3.5 text-zinc-300" />₩
                          {(staff.baseSalary || 0).toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 font-bold text-zinc-700 dark:text-zinc-300">
                          <Coins className="size-3.5 text-zinc-300" />₩
                          {(staff.hourlyRate || 0).toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-zinc-500 text-sm">
                          ₩{(staff.mealAllowance || 0).toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-center pr-6">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={
                                isDeleting === staff.id ||
                                isPending === staff.id
                              }
                              className="size-8 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                            >
                              {isDeleting === staff.id ||
                              isPending === staff.id ? (
                                <Loader2 className="size-4 animate-spin" />
                              ) : (
                                <MoreHorizontal className="size-4" />
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-40 rounded-xl"
                          >
                            <DropdownMenuItem
                              className="gap-2 font-medium cursor-pointer"
                              onClick={() => setEditingEmployee(staff)}
                            >
                              <Edit2 className="size-3.5 text-zinc-500" />
                              정보 수정
                            </DropdownMenuItem>
                            {!isResigned ? (
                              <DropdownMenuItem
                                className="gap-2 font-medium text-orange-600 focus:text-orange-600 cursor-pointer"
                                onClick={() =>
                                  handleResign(staff.id, staff.name)
                                }
                              >
                                <UserMinus className="size-3.5" />
                                퇴사 처리
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                className="gap-2 font-medium text-emerald-600 focus:text-emerald-600 cursor-pointer"
                                onClick={() =>
                                  handleRestore(staff.id, staff.name)
                                }
                              >
                                <UserPlus className="size-3.5" />
                                재직으로 복구
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              className="gap-2 font-medium text-red-600 focus:text-red-600 cursor-pointer"
                              onClick={() => handleDelete(staff.id, staff.name)}
                            >
                              <Trash2 className="size-3.5" />
                              데이터 삭제
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {editingEmployee && (
        <StaffEditDialog
          employee={editingEmployee}
          open={!!editingEmployee}
          onOpenChange={(open) => !open && setEditingEmployee(null)}
        />
      )}
    </div>
  );
}
