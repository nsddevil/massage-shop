"use client";

import { useState, useEffect, useCallback } from "react";
import { format, addMonths, subMonths } from "date-fns";
import {
  TrendingDown,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Building2,
  Users,
  Pencil,
  Trash2,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Header } from "@/components/dashboard/header";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

import {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
} from "@/app/actions/expense";
import {
  getExtraPayments,
  createExtraPayment,
  deleteExtraPayment,
} from "@/app/actions/extra-payment";
import { getEmployees } from "@/app/actions/staff";
import { AuthUser, Expense, ExtraPayment, Employee } from "@/types";

const ROLE_MAP: Record<string, string> = {
  OWNER: "사장",
  MANAGER: "실장",
  THERAPIST: "관리사",
  STAFF: "직원",
};

export function ExpensesClient() {
  const { data: session } = authClient.useSession();
  const user = session?.user as AuthUser | undefined;
  const isOwner = user?.role === "admin" || user?.role === "OWNER";

  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("shop");

  // Data States
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [extraPayments, setExtraPayments] = useState<ExtraPayment[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  // Dialog States
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [isExtraDialogOpen, setIsExtraDialogOpen] = useState(false);

  // Form States (Expense)
  const [expenseId, setExpenseId] = useState<string | null>(null); // For Edit
  const [expenseType, setExpenseType] = useState<"FIXED" | "GENERAL">(
    "GENERAL",
  );
  const [expenseCategory, setExpenseCategory] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseDate, setExpenseDate] = useState(
    format(new Date(), "yyyy-MM-dd"),
  );

  // Form States (Extra Payment)
  const [extraEmployeeId, setExtraEmployeeId] = useState("");
  const [extraType, setExtraType] = useState<"ADVANCE" | "BONUS">("ADVANCE");
  const [extraAmount, setExtraAmount] = useState("");
  const [extraDate, setExtraDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const fetchData = useCallback(
    async (showLoading = true) => {
      if (showLoading) setLoading(true);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;

      try {
        const [expRes, extraRes] = await Promise.all([
          getExpenses(year, month),
          getExtraPayments(year, month),
        ]);

        if (expRes.success && expRes.data) setExpenses(expRes.data);
        if (extraRes.success && extraRes.data) setExtraPayments(extraRes.data);
      } catch (error) {
        console.error(error);
        toast.error("데이터를 불러오는데 실패했습니다.");
      } finally {
        if (showLoading) setLoading(false);
      }
    },
    [currentDate],
  );

  const fetchEmployeesList = useCallback(async () => {
    try {
      const res = await getEmployees({ includeResigned: false });
      if (res.success && res.data) setEmployees(res.data);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    fetchData(true);
    fetchEmployeesList();
  }, [fetchData, fetchEmployeesList]);

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  // --- Shop Expense Handlers ---
  const handleAddExpense = () => {
    setExpenseId(null);
    setExpenseType("GENERAL");
    setExpenseCategory("");
    setExpenseAmount("");
    setExpenseDate(format(new Date(), "yyyy-MM-dd"));
    setIsExpenseDialogOpen(true);
  };

  const handleEditExpense = (exp: Expense) => {
    setExpenseId(exp.id);
    setExpenseType(exp.type);
    setExpenseCategory(exp.category);
    setExpenseAmount(exp.amount.toString());
    setExpenseDate(format(new Date(exp.date), "yyyy-MM-dd"));
    setIsExpenseDialogOpen(true);
  };

  const handleSaveExpense = async () => {
    if (!expenseCategory || !expenseAmount) {
      toast.error("모든 필드를 입력해주세요.");
      return;
    }

    const data = {
      type: expenseType,
      category: expenseCategory,
      amount: parseInt(expenseAmount),
      date: new Date(expenseDate),
    };

    setLoading(true);
    const res = expenseId
      ? await updateExpense(expenseId, data)
      : await createExpense(data);

    if (res.success) {
      toast.success(expenseId ? "수정되었습니다." : "등록되었습니다.");
      setIsExpenseDialogOpen(false);
      await fetchData(false);
    } else {
      toast.error(res.error || "실패했습니다.");
    }
    setLoading(false);
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm("정말로 삭제하시겠습니까?")) return;

    setLoading(true);
    const res = await deleteExpense(id);
    if (res.success) {
      toast.success("삭제되었습니다.");
      await fetchData(false);
    } else {
      toast.error(res.error || "삭제에 실패했습니다.");
    }
    setLoading(false);
  };

  // --- Extra Payment Handlers ---
  const handleAddExtra = () => {
    setExtraEmployeeId("");
    setExtraType("ADVANCE");
    setExtraAmount("");
    setExtraDate(format(new Date(), "yyyy-MM-dd"));
    setIsExtraDialogOpen(true);
  };

  const handleSaveExtra = async () => {
    if (!extraEmployeeId || !extraAmount) {
      toast.error("직원과 금액을 입력해주세요.");
      return;
    }

    setLoading(true);
    const res = await createExtraPayment({
      employeeId: extraEmployeeId,
      type: extraType,
      amount: parseInt(extraAmount),
      date: new Date(extraDate),
    });

    if (res.success) {
      toast.success("등록되었습니다.");
      setIsExtraDialogOpen(false);
      await fetchData(false);
    } else {
      toast.error(res.error || "실패했습니다.");
    }
    setLoading(false);
  };

  const handleDeleteExtra = async (id: string) => {
    if (!confirm("정말로 삭제하시겠습니까?")) return;

    setLoading(true);
    const res = await deleteExtraPayment(id);
    if (res.success) {
      toast.success("삭제되었습니다.");
      await fetchData(false);
    } else {
      toast.error(res.error || "삭제에 실패했습니다.");
    }
    setLoading(false);
  };

  // 통계 계산
  const totalShopExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalExtraPayment = extraPayments.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-zinc-50 dark:bg-black overflow-hidden h-screen">
      <Header />

      <main className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
          {/* Page Title & Month Selector */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-zinc-900 dark:bg-zinc-800 rounded-xl">
                  <TrendingDown className="size-6 text-white" />
                </div>
                <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
                  지출 및 수당 관리
                </h1>
              </div>
              <p className="text-sm text-zinc-500 font-medium pl-14">
                매장 지출과 직원 가불금/보너스 내역을 관리합니다.
              </p>
            </div>

            <div className="flex items-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-1 shadow-sm">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrevMonth}
                className="rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <ChevronLeft className="size-5" />
              </Button>
              <div className="px-4 flex items-center gap-2 min-w-[140px] justify-center">
                <span className="text-lg font-black text-zinc-900 dark:text-zinc-50">
                  {format(currentDate, "yyyy년 MM월")}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNextMonth}
                className="rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <ChevronRight className="size-5" />
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-none shadow-lg bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden p-6">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                  <Building2 className="size-6 text-zinc-600 dark:text-zinc-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    총 매장 지출
                  </p>
                  <p className="text-2xl font-black text-zinc-900 dark:text-zinc-50">
                    {totalShopExpense.toLocaleString()}원
                  </p>
                </div>
              </div>
            </Card>
            <Card className="border-none shadow-lg bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden p-6">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                  <Users className="size-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                    가불/보너스 합계
                  </p>
                  <p className="text-2xl font-black text-zinc-900 dark:text-zinc-50">
                    {totalExtraPayment.toLocaleString()}원
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Tabs Section */}
          <Tabs
            defaultValue="shop"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full space-y-4"
          >
            <div className="flex items-center justify-between gap-4">
              <TabsList className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-1 rounded-2xl h-12">
                <TabsTrigger
                  value="shop"
                  className="rounded-xl px-6 font-bold data-[state=active]:bg-zinc-900 data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-zinc-900"
                >
                  매장 지출
                </TabsTrigger>
                <TabsTrigger
                  value="extra"
                  className="rounded-xl px-6 font-bold data-[state=active]:bg-zinc-900 data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-zinc-900"
                >
                  보너스/가불금
                </TabsTrigger>
              </TabsList>

              <Button
                onClick={
                  activeTab === "shop" ? handleAddExpense : handleAddExtra
                }
                className="bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl h-12 px-6 gap-2 shadow-lg shadow-blue-500/20"
              >
                <PlusCircle className="size-5" />
                {activeTab === "shop" ? "지출 등록" : "수당 등록"}
              </Button>
            </div>

            <TabsContent value="shop" className="space-y-4 outline-none">
              <Card className="border-none shadow-xl bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent border-zinc-100 dark:border-zinc-800">
                        <TableHead className="w-[120px] font-bold">
                          날짜
                        </TableHead>
                        <TableHead className="w-[100px] font-bold">
                          구분
                        </TableHead>
                        <TableHead className="font-bold">내용</TableHead>
                        <TableHead className="text-right font-bold w-[120px]">
                          금액
                        </TableHead>
                        <TableHead className="w-[100px] text-center font-bold">
                          관리
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="h-32 text-center text-zinc-500"
                          >
                            로딩 중...
                          </TableCell>
                        </TableRow>
                      ) : expenses.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="h-32 text-center text-zinc-500"
                          >
                            등록된 지출 내역이 없습니다.
                          </TableCell>
                        </TableRow>
                      ) : (
                        expenses.map((exp) => (
                          <TableRow
                            key={exp.id}
                            className="border-zinc-50 dark:border-zinc-800"
                          >
                            <TableCell className="font-medium text-zinc-500">
                              {format(new Date(exp.date), "MM.dd")}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className="rounded-lg font-bold border-zinc-200 dark:border-zinc-700"
                              >
                                {exp.type === "FIXED" ? "고정" : "변동"}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-black text-zinc-900 dark:text-zinc-100">
                              {exp.category}
                            </TableCell>
                            <TableCell className="text-right font-black text-rose-500">
                              {exp.amount.toLocaleString()}원
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEditExpense(exp)}
                                  className="size-8 rounded-lg hover:bg-zinc-100"
                                >
                                  <Pencil className="size-4 text-zinc-500" />
                                </Button>
                                {isOwner ? (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteExpense(exp.id)}
                                    className="size-8 rounded-lg hover:bg-red-50 hover:text-red-500"
                                  >
                                    <Trash2 className="size-4" />
                                  </Button>
                                ) : (
                                  <Lock className="size-3 text-zinc-300" />
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="extra" className="space-y-4 outline-none">
              <Card className="border-none shadow-xl bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent border-zinc-100 dark:border-zinc-800">
                        <TableHead className="w-[120px] font-bold">
                          날짜
                        </TableHead>
                        <TableHead className="w-[120px] font-bold">
                          직원명
                        </TableHead>
                        <TableHead className="w-[100px] font-bold">
                          구분
                        </TableHead>
                        <TableHead className="text-right font-bold w-[120px]">
                          금액
                        </TableHead>
                        <TableHead className="w-[100px] text-center font-bold">
                          관리
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="h-32 text-center text-zinc-500"
                          >
                            로딩 중...
                          </TableCell>
                        </TableRow>
                      ) : extraPayments.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="h-32 text-center text-zinc-500"
                          >
                            등록된 내역이 없습니다.
                          </TableCell>
                        </TableRow>
                      ) : (
                        extraPayments.map((p) => (
                          <TableRow
                            key={p.id}
                            className="border-zinc-50 dark:border-zinc-800"
                          >
                            <TableCell className="font-medium text-zinc-500">
                              {format(new Date(p.date), "MM.dd")}
                            </TableCell>
                            <TableCell className="font-black text-zinc-900 dark:text-zinc-100">
                              {p.employee?.name || "알수없음"}
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={cn(
                                  "rounded-lg font-bold border-none",
                                  p.type === "ADVANCE"
                                    ? "bg-amber-100 text-amber-600"
                                    : "bg-blue-100 text-blue-600 shadow-none",
                                )}
                              >
                                {p.type === "ADVANCE" ? "가불" : "보너스"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-black text-zinc-900 dark:text-zinc-100">
                              {p.amount.toLocaleString()}원
                            </TableCell>
                            <TableCell className="text-center">
                              {isOwner ? (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteExtra(p.id)}
                                  className="size-8 rounded-lg hover:bg-red-50 hover:text-red-500"
                                >
                                  <Trash2 className="size-4" />
                                </Button>
                              ) : (
                                <Lock className="size-3 text-zinc-300" />
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Expense Dialog */}
      <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-3xl border-none shadow-2xl overflow-hidden p-0 bg-white dark:bg-zinc-900">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-xl font-black">
              {expenseId ? "지출 수정" : "지출 등록"}
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <Label className="font-bold text-zinc-500">지출 구분</Label>
              <RadioGroup
                value={expenseType}
                onValueChange={(val: any) => setExpenseType(val)}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="GENERAL" id="general" />
                  <Label htmlFor="general" className="font-bold">
                    변동 지출
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="FIXED" id="fixed" />
                  <Label htmlFor="fixed" className="font-bold">
                    고정 지출
                  </Label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label className="font-bold text-zinc-500">항목/내용</Label>
              <Input
                value={expenseCategory}
                onChange={(e) => setExpenseCategory(e.target.value)}
                placeholder="예: 식대, 수도광열비 등"
                className="h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-bold text-zinc-500">금액</Label>
              <Input
                type="number"
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(e.target.value)}
                placeholder="숫자만 입력"
                className="h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-bold text-zinc-500">날짜</Label>
              <Input
                type="date"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                className="h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200"
              />
            </div>
          </div>
          <DialogFooter className="p-6 pt-0 flex gap-2">
            <Button
              variant="ghost"
              onClick={() => setIsExpenseDialogOpen(false)}
              className="flex-1 h-12 rounded-2xl font-bold"
            >
              취소
            </Button>
            <Button
              onClick={handleSaveExpense}
              className="flex-1 h-12 rounded-2xl font-black bg-zinc-900 text-white hover:bg-zinc-800"
            >
              {expenseId ? "수정완료" : "등록하기"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Extra Payment Dialog */}
      <Dialog open={isExtraDialogOpen} onOpenChange={setIsExtraDialogOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-3xl border-none shadow-2xl overflow-hidden p-0 bg-white dark:bg-zinc-900">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-xl font-black">
              수당 및 가불금 등록
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <Label className="font-bold text-zinc-500">대상 직원</Label>
              <Select
                value={extraEmployeeId}
                onValueChange={setExtraEmployeeId}
              >
                <SelectTrigger className="h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 font-bold">
                  <SelectValue placeholder="직원 선택" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  {employees.map((emp) => (
                    <SelectItem
                      key={emp.id}
                      value={emp.id}
                      className="font-bold rounded-xl"
                    >
                      {emp.name} ({ROLE_MAP[emp.role] || emp.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="font-bold text-zinc-500">지급 구분</Label>
              <RadioGroup
                value={extraType}
                onValueChange={(val: any) => setExtraType(val)}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ADVANCE" id="advance" />
                  <Label htmlFor="advance" className="font-bold">
                    가불금
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="BONUS" id="bonus" />
                  <Label htmlFor="bonus" className="font-bold">
                    보너스
                  </Label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label className="font-bold text-zinc-500">금액</Label>
              <Input
                type="number"
                value={extraAmount}
                onChange={(e) => setExtraAmount(e.target.value)}
                placeholder="금액 입력"
                className="h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-bold text-zinc-500">날짜</Label>
              <Input
                type="date"
                value={extraDate}
                onChange={(e) => setExtraDate(e.target.value)}
                className="h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200"
              />
            </div>
          </div>
          <DialogFooter className="p-6 pt-0 flex gap-2">
            <Button
              variant="ghost"
              onClick={() => setIsExtraDialogOpen(false)}
              className="flex-1 h-12 rounded-2xl font-bold"
            >
              취소
            </Button>
            <Button
              onClick={handleSaveExtra}
              className="flex-1 h-12 rounded-2xl font-black bg-blue-600 text-white hover:bg-blue-700"
            >
              등록하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
