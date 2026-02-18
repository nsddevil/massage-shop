"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { CalendarIcon, Loader2, Edit2 } from "lucide-react";
import { Role, ROLE_LABELS, Employee } from "@/types";
import { updateEmployee } from "@/app/actions/staff";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  name: z.string().min(1, "이름을 입력해주세요."),
  phone: z.string().optional(),
  role: z.string().min(1, "역할을 선택해주세요."),
  joinedAt: z.date(),
  baseSalary: z.string(),
  hourlyRate: z.string(),
  mealAllowance: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

interface StaffEditDialogProps {
  employee: Employee;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StaffEditDialog({
  employee,
  open,
  onOpenChange,
}: StaffEditDialogProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: employee.name,
      phone: employee.phone || "",
      role: employee.role,
      joinedAt: new Date(employee.joinedAt),
      baseSalary: String(employee.baseSalary || 0),
      hourlyRate: String(employee.hourlyRate || 0),
      mealAllowance: String(employee.mealAllowance || 0),
    },
  });

  // Re-initialize form when employee changes
  useEffect(() => {
    if (open) {
      form.reset({
        name: employee.name,
        phone: employee.phone || "",
        role: employee.role,
        joinedAt: new Date(employee.joinedAt),
        baseSalary: String(employee.baseSalary || 0),
        hourlyRate: String(employee.hourlyRate || 0),
        mealAllowance: String(employee.mealAllowance || 0),
      });
    }
  }, [employee, open, form]);

  async function onSubmit(values: FormValues) {
    setIsPending(true);
    const result = await updateEmployee({
      id: employee.id,
      name: values.name,
      phone: values.phone,
      role: values.role as Role,
      joinedAt: values.joinedAt,
      baseSalary: Number(values.baseSalary) || 0,
      hourlyRate: Number(values.hourlyRate) || 0,
      mealAllowance: Number(values.mealAllowance) || 0,
    });
    setIsPending(false);

    if (result.success) {
      onOpenChange(false);
    } else {
      alert(result.error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden border-none shadow-2xl max-h-[90vh] flex flex-col [&>button]:text-zinc-500 dark:[&>button]:text-white">
        <DialogHeader className="p-6 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800">
          <DialogTitle className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Edit2 className="size-5 text-blue-600" />
            직원 정보 수정
          </DialogTitle>
          <DialogDescription className="text-sm font-medium text-zinc-500">
            직원의 기본 정보와 급여 조건을 수정합니다.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-1 overflow-y-auto">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="p-6 space-y-5"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                      이름
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="이름을 입력하세요"
                        {...field}
                        className="h-11 bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                      전화번호
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="010-0000-0000"
                        {...field}
                        className="h-11 bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                        역할
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-11 bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
                            <SelectValue placeholder="선택" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(ROLE_LABELS).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="joinedAt"
                  render={({ field }) => (
                    <FormItem className="flex flex-col mt-2">
                      <FormLabel className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                        입사일
                      </FormLabel>
                      <Popover
                        open={isCalendarOpen}
                        onOpenChange={setIsCalendarOpen}
                      >
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "h-11 pl-3 text-left font-normal bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP", { locale: ko })
                              ) : (
                                <span>입사일 선택</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => {
                              field.onChange(date);
                              setIsCalendarOpen(false);
                            }}
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
              </div>

              <div className="space-y-4 pt-2">
                <div className="text-xs font-bold text-blue-600 uppercase tracking-wider border-b border-blue-100 pb-1">
                  급여 조건
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="baseSalary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold text-zinc-500">
                          월 고정 기본급
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            className="h-11 bg-zinc-50 dark:bg-zinc-800"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="hourlyRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold text-zinc-500">
                          시간당 급여
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            className="h-11 bg-zinc-50 dark:bg-zinc-800"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="mealAllowance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold text-zinc-500">
                          일일 식대
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            className="h-11 bg-zinc-50 dark:bg-zinc-800"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <DialogFooter className="pt-4">
                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full h-12 bg-zinc-900 dark:bg-white dark:text-zinc-900 text-white font-bold rounded-xl"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      수정 중...
                    </>
                  ) : (
                    "수정 완료"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
