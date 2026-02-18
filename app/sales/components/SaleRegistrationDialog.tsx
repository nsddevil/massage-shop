"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Course, Employee, PAY_METHOD_LABELS } from "@/types";
import { createSale } from "@/app/actions/sales";
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
import { Loader2, Banknote, User, CheckCircle2 } from "lucide-react";

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
});

interface SaleRegistrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courses: Course[];
  employees: Employee[];
  onSuccess?: (data: any) => void;
}

export function SaleRegistrationDialog({
  open,
  onOpenChange,
  courses,
  employees,
  onSuccess,
}: SaleRegistrationDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const therapistsList = employees.filter(
    (e) => e.role === "THERAPIST" && !e.resignedAt,
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      payMethod: "CASH",
      totalPrice: 0,
      therapists: [{ employeeId: "", isChoice: false }],
    },
  });

  // 코스 선택 시 금액 및 관리사 슬롯 자동 조절
  const watchCourseId = form.watch("courseId");
  useEffect(() => {
    if (watchCourseId) {
      const selectedCourse = courses.find((c) => c.id === watchCourseId);
      if (selectedCourse) {
        form.setValue("totalPrice", selectedCourse.price);

        // 2인 코스면 관리사 슬롯 2개로 확장, 1인 코스면 1개로 축소
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
  }, [watchCourseId, courses, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    const result = await createSale(values);
    setIsLoading(false);

    if (result.success) {
      form.reset();
      onOpenChange(false);
      onSuccess?.(result.data);
    } else {
      alert(result.error);
    }
  }

  const selectedCourse = courses.find((c) => c.id === watchCourseId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border-none shadow-2xl max-h-[90vh] flex flex-col [&>button]:text-white">
        <div className="bg-emerald-600 p-8 text-white relative overflow-hidden">
          <DialogHeader className="relative z-10">
            <div className="size-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
              <Banknote className="size-6 text-white" />
            </div>
            <DialogTitle className="text-2xl font-black tracking-tight">
              신규 매출 등록
            </DialogTitle>
            <DialogDescription className="text-emerald-100 font-medium">
              코스와 관리사 정보를 입력하여 매출을 기록합니다.
            </DialogDescription>
          </DialogHeader>
          <CheckCircle2 className="size-32 text-white/10 absolute -right-8 -bottom-8 rotate-12" />
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="p-8 space-y-6 bg-white dark:bg-zinc-950"
          >
            <div className="grid grid-cols-1 gap-5">
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
                        <SelectTrigger className="h-12 rounded-xl border-zinc-200 dark:border-zinc-800 font-bold focus:ring-emerald-500">
                          <SelectValue placeholder="서비스 코스를 선택하세요" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl">
                        {courses
                          .filter((c) => c.isActive)
                          .map((course) => (
                            <SelectItem
                              key={course.id}
                              value={course.id}
                              className="font-bold"
                            >
                              {course.name} ({course.duration}분)
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
                          <SelectTrigger className="h-12 rounded-xl border-zinc-200 dark:border-zinc-800 font-bold focus:ring-emerald-500">
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
                          className="h-12 rounded-xl border-zinc-200 dark:border-zinc-800 font-bold focus-visible:ring-emerald-500"
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
                  {form.watch("therapists").map((_, index) => (
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
                                className="size-5 rounded-md border-zinc-300 dark:border-zinc-700 data-[state=checked]:bg-emerald-600"
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

            <DialogFooter className="pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black h-14 rounded-2xl text-lg shadow-xl shadow-emerald-200 dark:shadow-none transition-all active:scale-[0.98]"
              >
                {isLoading ? (
                  <Loader2 className="size-6 animate-spin" />
                ) : (
                  "매출 등록 완료"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
