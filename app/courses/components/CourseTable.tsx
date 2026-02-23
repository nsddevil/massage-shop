"use client";

import { useState } from "react";
import {
  MoreHorizontal,
  Clock,
  Wallet,
  Edit2,
  Trash2,
  Loader2,
  EyeOff,
  Eye,
  BookOpen,
} from "lucide-react";
import { Course, COURSE_TYPE_LABELS, AuthUser } from "@/types";
import { deleteCourse, toggleCourseStatus } from "@/app/actions/course";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CourseEditDialog } from "./CourseEditDialog";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";

interface CourseTableProps {
  courses: Course[];
}

export function CourseTable({ courses }: CourseTableProps) {
  const { data: session } = authClient.useSession();
  const user = session?.user as AuthUser | undefined;
  const isOwner = user?.role === "admin" || user?.role === "OWNER";
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isPending, setIsPending] = useState<string | null>(null);

  const handleDelete = async (id: string, name: string) => {
    if (
      confirm(
        `${name} 코스를 삭제하시겠습니까? 매출 내역이 있는 경우 삭제가 제한될 수 있습니다.`,
      )
    ) {
      setIsPending(id);
      const result = await deleteCourse(id);
      setIsPending(null);
      if (!result.success) {
        alert(result.error);
      }
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    setIsPending(id);
    const result = await toggleCourseStatus(id, !currentStatus);
    setIsPending(null);
    if (!result.success) {
      alert(result.error);
    }
  };

  if (courses.length === 0) {
    return (
      <Card className="border-dashed border-2 bg-zinc-50/50 dark:bg-zinc-900/10 py-20">
        <CardContent className="flex flex-col items-center justify-center space-y-3">
          <div className="size-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
            <BookOpen className="size-6 text-zinc-400" />
          </div>
          <div className="text-zinc-500 font-medium">
            등록된 코스가 없습니다.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Mobile-only Card Layout */}
      <div className="md:hidden space-y-4">
        {courses.map((course) => {
          const isActive = course.isActive;
          return (
            <Card
              key={course.id}
              className={cn(
                "border-none shadow-sm bg-white dark:bg-zinc-900 shadow-zinc-200 dark:shadow-none overflow-hidden transition-all",
                !isActive && "opacity-60 grayscale-[0.5]",
              )}
            >
              <CardContent className="p-5 space-y-5">
                {/* Mobile Header: Info + Actions */}
                <div className="flex items-start justify-between">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-zinc-900 dark:text-zinc-100 text-lg tracking-tight">
                        {course.name}
                      </span>
                      {isActive ? (
                        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-100 border-none text-[9px] h-4 font-bold">
                          판매 중
                        </Badge>
                      ) : (
                        <Badge className="bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-zinc-100 border-none text-[9px] h-4 font-bold">
                          숨김
                        </Badge>
                      )}
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "w-fit font-bold text-[10px] px-2 py-0 border-none",
                        course.type === "SINGLE"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                          : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
                      )}
                    >
                      {COURSE_TYPE_LABELS[course.type]}
                    </Badge>
                  </div>

                  {isOwner && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="secondary"
                          size="icon"
                          disabled={isPending === course.id}
                          className="size-9 rounded-xl shadow-sm bg-zinc-50 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 border-none"
                        >
                          {isPending === course.id ? (
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
                          onClick={() => setEditingCourse(course)}
                        >
                          <Edit2 className="size-4 text-blue-600" />
                          정보 수정
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="gap-3 py-2.5 px-3 font-bold text-sm rounded-xl transition-all cursor-pointer"
                          onClick={() =>
                            handleToggleStatus(course.id, course.isActive)
                          }
                        >
                          {isActive ? (
                            <>
                              <EyeOff className="size-4 text-orange-500" />
                              <span className="text-orange-600">
                                판매 중지(숨김)
                              </span>
                            </>
                          ) : (
                            <>
                              <Eye className="size-4 text-emerald-500" />
                              <span className="text-emerald-600">
                                판매 재개(노출)
                              </span>
                            </>
                          )}
                        </DropdownMenuItem>
                        <div className="h-[1px] bg-zinc-100 dark:bg-zinc-800 my-1" />
                        <DropdownMenuItem
                          className="gap-3 py-2.5 px-3 font-bold text-sm text-red-600 focus:text-red-600 rounded-xl transition-all cursor-pointer"
                          onClick={() => handleDelete(course.id, course.name)}
                        >
                          <Trash2 className="size-4" />
                          영구 삭제
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>

                {/* Mobile Info Grid */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-4 pt-1">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">
                      소요 시간
                    </span>
                    <div className="text-zinc-700 dark:text-zinc-300 font-bold text-sm flex items-center gap-1.5">
                      <Clock className="size-3 text-zinc-300" />
                      {course.duration}분
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">
                      참여 인원
                    </span>
                    <div className="text-zinc-700 dark:text-zinc-300 font-bold text-sm">
                      {COURSE_TYPE_LABELS[course.type]}
                    </div>
                  </div>
                  <div className="col-span-2 space-y-1">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">
                      코스 금액
                    </span>
                    <div className="text-zinc-900 dark:text-zinc-100 font-black text-lg flex items-center gap-1.5">
                      <Wallet className="size-4 text-blue-600" />₩
                      {course.price.toLocaleString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Desktop Table Layout (md and up) */}
      <Card className="hidden md:block border-none shadow-sm shadow-zinc-200 dark:shadow-none bg-white dark:bg-zinc-900/50 overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-[800px] lg:min-w-full">
              <TableHeader>
                <TableRow className="bg-zinc-50/50 dark:bg-zinc-900/30 border-y border-zinc-100 dark:border-zinc-800">
                  <TableHead className="font-bold text-zinc-400 uppercase text-[10px] pl-6 tracking-wider">
                    코스명
                  </TableHead>
                  <TableHead className="font-bold text-zinc-400 uppercase text-[10px] tracking-wider">
                    관리사 인원
                  </TableHead>
                  <TableHead className="font-bold text-zinc-400 uppercase text-[10px] tracking-wider">
                    소요 시간
                  </TableHead>
                  <TableHead className="font-bold text-zinc-400 uppercase text-[10px] tracking-wider">
                    금액 (원)
                  </TableHead>
                  <TableHead className="font-bold text-zinc-400 uppercase text-[10px] tracking-wider">
                    상태
                  </TableHead>
                  <TableHead className="font-bold text-zinc-400 uppercase text-[10px] tracking-wider text-center pr-6">
                    관리
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map((course) => (
                  <TableRow
                    key={course.id}
                    className={cn(
                      "border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-colors",
                      !course.isActive && "opacity-60 grayscale-[0.5]",
                    )}
                  >
                    <TableCell className="pl-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-zinc-900 dark:text-zinc-100">
                          {course.name}
                        </span>
                        {/* ID hidden */}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "font-bold text-[10px] px-2.5 py-0.5 border-none",
                          course.type === "SINGLE"
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                            : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
                        )}
                      >
                        {COURSE_TYPE_LABELS[course.type]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 font-medium text-sm">
                        <Clock className="size-3.5 text-zinc-300" />
                        {course.duration}분
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 font-bold text-zinc-700 dark:text-zinc-300">
                        <Wallet className="size-3.5 text-zinc-300" />₩
                        {course.price.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      {course.isActive ? (
                        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-100 border-none text-[9px] h-5">
                          판매 중
                        </Badge>
                      ) : (
                        <Badge className="bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-zinc-100 border-none text-[9px] h-5">
                          숨김
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center pr-6">
                      {isOwner && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={isPending === course.id}
                              className="size-8 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                            >
                              {isPending === course.id ? (
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
                              onClick={() => setEditingCourse(course)}
                            >
                              <Edit2 className="size-3.5 text-zinc-500" />
                              정보 수정
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="gap-2 font-medium cursor-pointer"
                              onClick={() =>
                                handleToggleStatus(course.id, course.isActive)
                              }
                            >
                              {course.isActive ? (
                                <>
                                  <EyeOff className="size-3.5 text-orange-500" />
                                  <span className="text-orange-600">
                                    판매 중지(숨김)
                                  </span>
                                </>
                              ) : (
                                <>
                                  <Eye className="size-3.5 text-emerald-500" />
                                  <span className="text-emerald-600">
                                    판매 재개(노출)
                                  </span>
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="gap-2 font-medium text-red-600 focus:text-red-600 cursor-pointer"
                              onClick={() =>
                                handleDelete(course.id, course.name)
                              }
                            >
                              <Trash2 className="size-3.5" />
                              영구 삭제
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {editingCourse && (
        <CourseEditDialog
          course={editingCourse}
          open={!!editingCourse}
          onOpenChange={(open: boolean) => !open && setEditingCourse(null)}
        />
      )}
    </div>
  );
}
