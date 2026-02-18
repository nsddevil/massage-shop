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
    <Card className="border-none shadow-sm shadow-zinc-200 dark:shadow-none bg-white dark:bg-zinc-900/50 overflow-hidden">
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
                              isDeleting === staff.id || isPending === staff.id
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
                              onClick={() => handleResign(staff.id, staff.name)}
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

      {editingEmployee && (
        <StaffEditDialog
          employee={editingEmployee}
          open={!!editingEmployee}
          onOpenChange={(open) => !open && setEditingEmployee(null)}
        />
      )}
    </Card>
  );
}
