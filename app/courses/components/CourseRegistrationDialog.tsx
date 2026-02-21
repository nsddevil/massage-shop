"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Loader2, BookOpen, Clock, Wallet, Users } from "lucide-react";
import { CourseType, COURSE_TYPE_LABELS } from "@/types";
import { createCourse } from "@/app/actions/course";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  name: z.string().min(1, "코스 이름을 입력해주세요."),
  type: z.nativeEnum(CourseType),
  duration: z.coerce.number().min(1, "소요 시간을 입력해주세요."),
  price: z.coerce.number().min(0, "금액을 입력해주세요."),
});

type FormValues = z.infer<typeof formSchema>;

export function CourseRegistrationDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    defaultValues: {
      name: "",
      type: CourseType.SINGLE,
      duration: 60,
      price: 0,
    },
  });

  async function onSubmit(values: FormValues) {
    setIsPending(true);
    const result = await createCourse({
      name: values.name,
      type: values.type,
      duration: values.duration,
      price: values.price,
    });
    setIsPending(false);

    if (result.success) {
      setOpen(false);
      form.reset();
      router.refresh();
    } else {
      alert(result.error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 dark:shadow-none transition-all hover:scale-[1.02] active:scale-[0.98] gap-2">
          <Plus className="size-4" />
          신규 코스 등록
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-none rounded-3xl outline-none [&>button]:text-white">
        <DialogHeader className="p-8 bg-zinc-900 dark:bg-zinc-950 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <BookOpen className="size-24" />
          </div>
          <DialogTitle className="text-2xl font-bold tracking-tight">
            신규 코스 등록
          </DialogTitle>
          <p className="text-zinc-400 text-sm font-medium mt-1">
            새로운 마사지 프로그램의 정보를 입력해주세요.
          </p>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="p-8 space-y-6 bg-white dark:bg-zinc-900"
          >
            <div className="space-y-5">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                      <BookOpen className="size-3" />
                      코스명
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="예: 스포츠 마사지 A타입"
                        {...field}
                        className="h-12 bg-zinc-50 dark:bg-zinc-800 border-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-xl font-medium"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                        <Users className="size-3" />
                        관리사 인원
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-12 bg-zinc-50 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-blue-600 rounded-xl font-medium">
                            <SelectValue placeholder="인원 선택" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-xl border-zinc-100 dark:border-zinc-800">
                          {Object.values(CourseType).map((type) => (
                            <SelectItem
                              key={type}
                              value={type}
                              className="focus:bg-blue-50 dark:focus:bg-blue-900/30 font-medium"
                            >
                              {COURSE_TYPE_LABELS[type]}
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
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                        <Clock className="size-3" />
                        소요 시간 (분)
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="number"
                            placeholder="60"
                            {...field}
                            className="h-12 bg-zinc-50 dark:bg-zinc-800 border-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-xl font-medium pr-10"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">
                            분
                          </span>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                      <Wallet className="size-3" />
                      금액 (원)
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="number"
                          placeholder="0"
                          {...field}
                          className="h-12 bg-zinc-50 dark:bg-zinc-800 border-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-xl font-bold text-lg pr-10"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">
                          원
                        </span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
                className="flex-1 h-12 rounded-xl font-bold text-zinc-500"
              >
                취소
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="flex-[2] h-12 bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 rounded-xl font-bold shadow-lg transition-all active:scale-95"
              >
                {isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  "등록 완료"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
