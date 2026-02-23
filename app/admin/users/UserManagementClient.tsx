"use client";

import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/dashboard/header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getUsers, updateUserRole } from "@/app/actions/admin";
import { toast } from "sonner";
import { ShieldCheck, User as UserIcon, Loader2, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import Image from "next/image";
import { UserData } from "@/types";

const ROLE_OPTIONS = [
  { label: "사장 (OWNER)", value: "OWNER" },
  { label: "실장 (MANAGER)", value: "MANAGER" },
  { label: "관리사 (THERAPIST)", value: "THERAPIST" },
  { label: "직원 (STAFF)", value: "STAFF" },
  { label: "일반유저 (user)", value: "user" },
];

export function UserManagementClient() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchUsers = useCallback(async (showLoadingIndicator = true) => {
    if (showLoadingIndicator) setLoading(true);
    try {
      const res = await getUsers();
      if (res.success && res.data) {
        setUsers(res.data);
      } else {
        toast.error(res.error || "사용자 목록을 불러오는데 실패했습니다.");
      }
    } catch (error) {
      console.error(error);
      toast.error("사용자 목록을 불러오는데 실패했습니다.");
    } finally {
      if (showLoadingIndicator) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers(false).finally(() => setLoading(false));
  }, [fetchUsers]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdatingId(userId);
    try {
      const res = await updateUserRole(userId, newRole);
      if (res.success) {
        toast.success("권한이 업데이트되었습니다.");
        await fetchUsers(false);
      } else {
        toast.error(res.error || "권한 업데이트에 실패했습니다.");
      }
    } catch (error) {
      console.error(error);
      toast.error("권한 업데이트 중 오류가 발생했습니다.");
    } finally {
      setUpdatingId(null);
    }
  };

  const getRoleBadgeStyle = (role: string | null) => {
    switch (role) {
      case "OWNER":
      case "admin":
        return "bg-zinc-900 text-white";
      case "MANAGER":
        return "bg-blue-600 text-white";
      case "THERAPIST":
        return "bg-rose-500 text-white";
      case "STAFF":
        return "bg-slate-500 text-white";
      default:
        return "bg-zinc-100 text-zinc-500";
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-zinc-50 dark:bg-black">
      <Header />

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-zinc-900 dark:bg-zinc-800 rounded-xl">
                <ShieldCheck className="size-6 text-white" />
              </div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
                사용자 권한 관리
              </h1>
            </div>
            <p className="text-sm md:text-base text-zinc-500 font-medium pl-14">
              시스템에 가입된 사용자들의 직급과 권한을 관리합니다.
            </p>
          </div>

          <Card className="border-none shadow-xl bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="size-5 text-zinc-400" />
                <span className="font-bold text-zinc-900 dark:text-zinc-100">
                  전체 사용자 ({users.length}명)
                </span>
              </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-zinc-100 dark:border-zinc-800">
                    <TableHead className="w-[250px] font-bold">
                      사용자 정보
                    </TableHead>
                    <TableHead className="font-bold">현재 권한</TableHead>
                    <TableHead className="w-[200px] font-bold">
                      권한 변경
                    </TableHead>
                    <TableHead className="w-[180px] font-bold">
                      가입 일자
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="h-32 text-center text-zinc-500 font-medium"
                      >
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="size-4 animate-spin" />
                          데이터를 불러오는 중...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="h-32 text-center text-zinc-500 font-medium"
                      >
                        가입된 사용자가 없습니다.
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow
                        key={user.id}
                        className="group border-zinc-100 dark:border-zinc-800"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="size-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 overflow-hidden shadow-sm relative">
                              {user.image ? (
                                <Image
                                  src={user.image}
                                  alt={user.name}
                                  fill
                                  className="object-cover"
                                  unoptimized
                                />
                              ) : (
                                <UserIcon className="size-5" />
                              )}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-black text-zinc-900 dark:text-zinc-100">
                                {user.name}
                              </span>
                              <span className="text-xs text-zinc-500 font-medium">
                                {user.email}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={cn(
                              "rounded-lg border-none px-3 py-1 font-bold",
                              getRoleBadgeStyle(user.role),
                            )}
                          >
                            {user.role === "OWNER" || user.role === "admin"
                              ? "사장님"
                              : user.role === "MANAGER"
                                ? "실장님"
                                : user.role === "THERAPIST"
                                  ? "관리사"
                                  : user.role === "STAFF"
                                    ? "직원"
                                    : "일반유저"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Select
                            disabled={updatingId === user.id}
                            value={user.role || "user"}
                            onValueChange={(val) =>
                              handleRoleChange(user.id, val)
                            }
                          >
                            <SelectTrigger className="h-10 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 font-bold focus:ring-zinc-900 transition-all">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-zinc-100 dark:border-zinc-800 shadow-2xl p-2">
                              {ROLE_OPTIONS.map((opt) => (
                                <SelectItem
                                  key={opt.value}
                                  value={opt.value}
                                  className="rounded-xl font-bold py-2 px-3 focus:bg-zinc-100 dark:focus:bg-zinc-800 transition-colors"
                                >
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-zinc-500 font-medium">
                          {format(new Date(user.createdAt), "yyyy.MM.dd")}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-zinc-100 dark:divide-zinc-800">
              {loading ? (
                <div className="h-32 flex items-center justify-center text-zinc-500 font-medium">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="size-4 animate-spin" />
                    데이터를 불러오는 중...
                  </div>
                </div>
              ) : users.length === 0 ? (
                <div className="h-32 flex items-center justify-center text-zinc-500 font-medium">
                  가입된 사용자가 없습니다.
                </div>
              ) : (
                users.map((user) => (
                  <div key={user.id} className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 overflow-hidden shadow-sm relative">
                          {user.image ? (
                            <Image
                              src={user.image}
                              alt={user.name}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <UserIcon className="size-5" />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-black text-zinc-900 dark:text-zinc-100">
                            {user.name}
                          </span>
                          <span className="text-xs text-zinc-500 font-medium max-w-[150px] truncate">
                            {user.email}
                          </span>
                        </div>
                      </div>
                      <Badge
                        className={cn(
                          "rounded-lg border-none px-2 py-0.5 text-[10px] font-bold",
                          getRoleBadgeStyle(user.role),
                        )}
                      >
                        {user.role === "OWNER" || user.role === "admin"
                          ? "사장님"
                          : user.role === "MANAGER"
                            ? "실장님"
                            : user.role === "THERAPIST"
                              ? "관리사"
                              : user.role === "STAFF"
                                ? "직원"
                                : "일반유저"}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">
                          가입 일자
                        </span>
                        <span className="text-sm font-bold text-zinc-600">
                          {format(new Date(user.createdAt), "yyyy.MM.dd")}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">
                          권한 변경
                        </span>
                        <Select
                          disabled={updatingId === user.id}
                          value={user.role || "user"}
                          onValueChange={(val) =>
                            handleRoleChange(user.id, val)
                          }
                        >
                          <SelectTrigger className="h-9 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 font-bold focus:ring-zinc-900 text-xs text-left px-3">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl border-zinc-100 dark:border-zinc-800 shadow-2xl p-2">
                            {ROLE_OPTIONS.map((opt) => (
                              <SelectItem
                                key={opt.value}
                                value={opt.value}
                                className="rounded-xl font-bold py-2 px-3 focus:bg-zinc-100 dark:focus:bg-zinc-800 transition-colors text-xs"
                              >
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
