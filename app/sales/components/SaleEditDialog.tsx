"use client";

import { useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Course, Employee, SaleWithDetails, PAY_METHOD_LABELS } from "@/types";
import { updateSale } from "@/app/actions/sales";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import {
  Loader2,
  Banknote,
  User,
  CheckCircle2,
  CalendarIcon,
} from "lucide-react";

const formSchema = z.object({
  courseId: z.string().min(1, "코스를 선택해주세요."),
  payMethod: z.enum(["CASH", "TRANSFER", "CARD", "HEELY", "MATONG"]),
  totalPrice: z.number().min(0, "금액을 입력해주세요."),
  therapists: z
    .array(
      z.object({
        employeeId: z.string().min(1, "관리사를 선택해주세요."),
        isChoice: z.boolean(),
      }),
    )
    .min(1, "최소 한 명의 관리사를 선택해주세요."),
  createdAt: z.date(),
});

interface SaleEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sale: SaleWithDetails;
  courses: Course[];
  employees: Employee[];
  onSuccess?: () => void;
}

export function SaleEditDialog({
  open,
  onOpenChange,
  sale,
  courses,
  employees,
  onSuccess,
}: SaleEditDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const therapistsList = employees.filter(
    (e) => e.role === "THERAPIST" && !e.resignedAt,
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      courseId: sale.courseId,
      payMethod: sale.payMethod,
      totalPrice: sale.totalPrice,
      therapists: sale.therapists.map((t) => ({
        employeeId: t.employeeId,
        isChoice: t.isChoice,
      })),
      createdAt: new Date(sale.createdAt),
    },
  });

  // sale이 변경되면 폼 초기값 재설정
  useEffect(() => {
    if (open) {
      form.reset({
        courseId: sale.courseId,
        payMethod: sale.payMethod,
        totalPrice: sale.totalPrice,
        therapists: sale.therapists.map((t) => ({
          employeeId: t.employeeId,
          isChoice: t.isChoice,
        })),
        createdAt: new Date(sale.createdAt),
      });
    }
  }, [open, sale, form]);

  // 코스 선택 시 금액 및 관리사 슬롯 자동 조절
  const watchCourseId = useWatch({
    control: form.control,
    name: "courseId",
  });
  const watchTherapists = useWatch({
    control: form.control,
    name: "therapists",
  });
  useEffect(() => {
    if (watchCourseId && watchCourseId !== sale.courseId) {
      const selectedCourse = courses.find((c) => c.id === watchCourseId);
      if (selectedCourse) {
        form.setValue("totalPrice", selectedCourse.price);

        if (selectedCourse.type === "DOUBLE") {
          const currentTherapists = form.getValues("therapists");
          if (currentTherapists.length < 2) {
            form.setValue("therapists", [
              ...currentTherapists,
              { employeeId: "", isChoice: false },
            ]);
          }
        } else {
          form.setValue("therapists", [form.getValues("therapists")[0]]);
        }
      }
    }
  }, [watchCourseId, courses, form, sale.courseId]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    const result = await updateSale({
      id: sale.id,
      ...values,
    });
    setIsLoading(false);

    if (result.success) {
      onOpenChange(false);
      onSuccess?.();
    } else {
      alert(result.error);
    }
  }

  const selectedCourse = courses.find((c) => c.id === watchCourseId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] p-0 border-none shadow-2xl max-h-[85dvh] overflow-y-auto [&>button]:text-white">
        <div className="bg-blue-600 p-8 text-white relative overflow-hidden">
          <DialogHeader className="relative z-10">
            <div className="size-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
              <Banknote className="size-6 text-white" />
            </div>
            <DialogTitle className="text-2xl font-black tracking-tight">
              매출 내역 수정
            </DialogTitle>
            <DialogDescription className="text-blue-100 font-medium">
              기존 매출 내역의 정보를 수정합니다.
            </DialogDescription>
          </DialogHeader>
          <CheckCircle2 className="size-32 text-white/10 absolute -right-8 -bottom-8 rotate-12" />
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="p-8 space-y-6 bg-white dark:bg-zinc-950">
              <div className="grid grid-cols-1 gap-5">
                {/* 날짜 선택 */}
                <FormField
                  control={form.control}
                  name="createdAt"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="font-bold text-zinc-700 dark:text-zinc-300">
                        매출 일자
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "h-12 pl-3 text-left font-bold rounded-xl border-zinc-200 dark:border-zinc-800 focus:ring-blue-500",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP", { locale: ko })
                              ) : (
                                <span>날짜를 선택하세요</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                            locale={ko}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 코스 선택 */}
                <FormField
                  control={form.control}
                  name="courseId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-zinc-700 dark:text-zinc-300">
                        코스 선택
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-12 rounded-xl border-zinc-200 dark:border-zinc-800 font-bold focus:ring-blue-500">
                            <SelectValue placeholder="서비스 코스를 선택하세요" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-xl">
                          {courses.map((course) => (
                            <SelectItem
                              key={course.id}
                              value={course.id}
                              className="font-bold"
                            >
                              {course.name} ({course.duration}분){" "}
                              {!course.isActive && "(숨김)"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  {/* 결제 방법 */}
                  <FormField
                    control={form.control}
                    name="payMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold text-zinc-700 dark:text-zinc-300">
                          결제 방법
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-12 rounded-xl border-zinc-200 dark:border-zinc-800 font-bold focus:ring-blue-500">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-xl">
                            {Object.entries(PAY_METHOD_LABELS).map(
                              ([value, label]) => (
                                <SelectItem
                                  key={value}
                                  value={value}
                                  className="font-bold"
                                >
                                  {label}
                                </SelectItem>
                              ),
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* 결제 금액 */}
                  <FormField
                    control={form.control}
                    name="totalPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold text-zinc-700 dark:text-zinc-300">
                          실 결제금액 (원)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            className="h-12 rounded-xl border-zinc-200 dark:border-zinc-800 font-bold focus-visible:ring-blue-500"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* 관리사 선택 섹션 */}
                <div className="space-y-4">
                  <FormLabel className="font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                    <User className="size-4" />
                    관리사 지정 {selectedCourse?.type === "DOUBLE" && "(2명)"}
                  </FormLabel>

                  <div className="space-y-3">
                    {watchTherapists.map((_, index) => (
                      <div
                        key={index}
                        className="flex gap-3 items-end bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800"
                      >
                        <FormField
                          control={form.control}
                          name={`therapists.${index}.employeeId`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="h-10 rounded-lg border-zinc-200 dark:border-zinc-800 font-bold bg-white dark:bg-zinc-900">
                                    <SelectValue placeholder="관리사 선택" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {therapistsList.map((emp) => (
                                    <SelectItem
                                      key={emp.id}
                                      value={emp.id}
                                      className="font-bold"
                                    >
                                      {emp.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`therapists.${index}.isChoice`}
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2 space-y-0 pb-2">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  className="size-5 rounded-md border-zinc-300 dark:border-zinc-700 data-[state=checked]:bg-blue-600"
                                />
                              </FormControl>
                              <FormLabel className="text-xs font-bold text-zinc-500 cursor-pointer">
                                초이스
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="p-6 md:p-8 pt-4 pb-12 md:pb-12 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black h-14 rounded-2xl text-lg shadow-xl shadow-blue-200 dark:shadow-none transition-all active:scale-[0.98]"
              >
                {isLoading ? (
                  <Loader2 className="size-6 animate-spin" />
                ) : (
                  "매출 수정 완료"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
