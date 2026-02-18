"use client";

import { useState, useEffect } from "react";
import { format, addMonths, subMonths } from "date-fns";
import { ko } from "date-fns/locale";
import {
  TrendingDown,
  Calendar as CalendarIcon,
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
import { Card, CardContent } from "@/components/ui/card";
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
import { getEmployees } from "@/app/actions/staff"; // 직원 목록 필요

const ROLE_MAP: Record<string, string> = {
  OWNER: "사장",
  MANAGER: "실장",
  THERAPIST: "관리사",
  STAFF: "직원",
};

export function ExpensesClient() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("shop");

  // Data States
  const [expenses, setExpenses] = useState<any[]>([]);
  const [extraPayments, setExtraPayments] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);

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

  useEffect(() => {
    fetchData();
    fetchEmployees();
  }, [currentDate]);

  const fetchData = async () => {
    setLoading(true);
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;

    const [expRes, extraRes] = await Promise.all([
      getExpenses(year, month),
      getExtraPayments(year, month),
    ]);

    if (expRes.success) setExpenses(expRes.data || []);
    if (extraRes.success) setExtraPayments(extraRes.data || []);

    setLoading(false);
  };

  const fetchEmployees = async () => {
    const res = await getEmployees({ includeResigned: false });
    if (res.success) setEmployees(res.data || []);
  };

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

  const handleEditExpense = (exp: any) => {
    setExpenseId(exp.id);
    setExpenseType(exp.type);
    setExpenseCategory(exp.category);
    setExpenseAmount(exp.amount.toString());
    setExpenseDate(format(new Date(exp.date), "yyyy-MM-dd"));
    setIsExpenseDialogOpen(true);
  };

  const handleSaveExpense = async () => {
    if (!expenseCategory || !expenseAmount) {
      toast.error("내역과 금액을 입력해주세요.");
      return;
    }

    const payload = {
      type: expenseType,
      category: expenseCategory,
      amount: parseInt(expenseAmount),
      date: new Date(expenseDate),
    };

    let res;
    if (expenseId) {
      res = await updateExpense(expenseId, payload);
    } else {
      res = await createExpense(payload);
    }

    if (res.success) {
      toast.success(expenseId ? "수정되었습니다." : "등록되었습니다.");
      setIsExpenseDialogOpen(false);
      fetchData();
    } else {
      toast.error(res.error);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    const res = await deleteExpense(id);
    if (res.success) {
      toast.success("삭제되었습니다.");
      fetchData();
    } else {
      toast.error(res.error);
    }
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

    const res = await createExtraPayment({
      employeeId: extraEmployeeId,
      type: extraType,
      amount: parseInt(extraAmount),
      date: new Date(extraDate),
    });

    if (res.success) {
      toast.success("등록되었습니다.");
      setIsExtraDialogOpen(false);
      fetchData();
    } else {
      toast.error(res.error);
    }
  };

  const handleDeleteExtra = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    const res = await deleteExtraPayment(id);
    if (res.success) {
      toast.success("삭제되었습니다.");
      fetchData();
    } else {
      toast.error(res.error);
    }
  };

  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-zinc-50 dark:bg-zinc-950">
      <Header />

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <TrendingDown className="size-6 text-red-600" />
                지출 관리
              </h1>
              <p className="text-sm text-zinc-500">
                매장 운영비와 직원 가불/보너스를 관리합니다.
              </p>
            </div>

            {/* Month Navigation */}
            <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 p-1 rounded-lg border shadow-sm">
              <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
                <ChevronLeft className="size-4" />
              </Button>
              <span className="text-lg font-bold min-w-[140px] text-center">
                {format(currentDate, "yyyy년 MM월")}
              </span>
              <Button variant="ghost" size="icon" onClick={handleNextMonth}>
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
              <TabsTrigger value="shop" className="gap-2">
                <Building2 className="size-4" /> 매장 지출
              </TabsTrigger>
              <TabsTrigger value="staff" className="gap-2">
                <Users className="size-4" /> 직원 지급 관리
              </TabsTrigger>
            </TabsList>

            {/* Tap 1: Shop Expenses */}
            <TabsContent value="shop" className="mt-6 space-y-4">
              <Card className="border-none shadow-sm">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                      <h2 className="text-lg font-bold">이번 달 총 지출</h2>
                      <p className="text-3xl font-black text-red-600 mt-1">
                        ₩{totalExpense.toLocaleString()}
                      </p>
                    </div>
                    <Button
                      onClick={handleAddExpense}
                      className="w-full sm:w-auto gap-2 bg-red-600 hover:bg-red-700"
                    >
                      <PlusCircle className="size-4" /> 새 지출 등록
                    </Button>
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden md:block rounded-lg border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-zinc-50/50">
                          <TableHead className="w-[120px]">날짜</TableHead>
                          <TableHead className="w-[100px]">구분</TableHead>
                          <TableHead>내역 (카테고리)</TableHead>
                          <TableHead className="text-right">금액</TableHead>
                          <TableHead className="w-[100px] text-center">
                            관리
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loading ? (
                          <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center">
                              로딩 중...
                            </TableCell>
                          </TableRow>
                        ) : expenses.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={5}
                              className="h-24 text-center text-zinc-500"
                            >
                              나가는 돈이 없네요! 🎉
                            </TableCell>
                          </TableRow>
                        ) : (
                          expenses.map((exp) => (
                            <TableRow key={exp.id}>
                              <TableCell className="text-zinc-500">
                                {format(new Date(exp.date), "MM-dd")}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    exp.type === "FIXED"
                                      ? "secondary"
                                      : "outline"
                                  }
                                >
                                  {exp.type === "FIXED"
                                    ? "고정 지출"
                                    : "일반 지출"}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-medium">
                                {exp.category}
                              </TableCell>
                              <TableCell className="text-right font-bold text-zinc-900">
                                ₩{exp.amount.toLocaleString()}
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-zinc-400 hover:text-blue-500"
                                    onClick={() => handleEditExpense(exp)}
                                  >
                                    <Pencil className="size-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-zinc-400 hover:text-red-500"
                                    onClick={() => handleDeleteExpense(exp.id)}
                                  >
                                    <Trash2 className="size-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="md:hidden space-y-3">
                    {loading ? (
                      <div className="text-center py-8 text-zinc-500">
                        로딩 중...
                      </div>
                    ) : expenses.length === 0 ? (
                      <div className="text-center py-8 text-zinc-500">
                        나가는 돈이 없네요! 🎉
                      </div>
                    ) : (
                      expenses.map((exp) => (
                        <div
                          key={exp.id}
                          className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 shadow-sm flex justify-between items-center"
                        >
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-zinc-500">
                                {format(new Date(exp.date), "MM.dd")}
                              </span>
                              <Badge
                                variant={
                                  exp.type === "FIXED" ? "secondary" : "outline"
                                }
                                className="text-[10px] px-1.5 py-0 h-5"
                              >
                                {exp.type === "FIXED" ? "고정" : "일반"}
                              </Badge>
                            </div>
                            <span className="font-bold text-zinc-900 dark:text-zinc-100">
                              {exp.category}
                            </span>
                            <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">
                              ₩{exp.amount.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 text-zinc-400 hover:text-blue-500"
                              onClick={() => handleEditExpense(exp)}
                            >
                              <Pencil className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 text-zinc-400 hover:text-red-500"
                              onClick={() => handleDeleteExpense(exp.id)}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tap 2: Staff Extra Payments */}
            <TabsContent value="staff" className="mt-6 space-y-4">
              <Card className="border-none shadow-sm">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                      <h2 className="text-lg font-bold">가불 및 보너스 현황</h2>
                      <p className="text-sm text-zinc-500">
                        여기서 등록한 내역은 급여 정산 시 자동 반영됩니다.
                      </p>
                    </div>
                    <Button onClick={handleAddExtra} className="gap-2">
                      <PlusCircle className="size-4" /> 지급 내역 등록
                    </Button>
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden md:block rounded-lg border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-zinc-50/50">
                          <TableHead className="w-[120px]">날짜</TableHead>
                          <TableHead>직원</TableHead>
                          <TableHead>구분</TableHead>
                          <TableHead className="text-right">금액</TableHead>
                          <TableHead className="text-center">
                            정산 여부
                          </TableHead>
                          <TableHead className="w-[80px] text-center">
                            삭제
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loading ? (
                          <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center">
                              로딩 중...
                            </TableCell>
                          </TableRow>
                        ) : extraPayments.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={6}
                              className="h-24 text-center text-zinc-500"
                            >
                              지급 내역이 없습니다.
                            </TableCell>
                          </TableRow>
                        ) : (
                          extraPayments.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell className="text-zinc-500">
                                {format(new Date(item.date), "MM-dd")}
                              </TableCell>
                              <TableCell className="font-bold">
                                {item.employee.name}
                                <span className="ml-2 text-xs font-normal text-zinc-400">
                                  {ROLE_MAP[item.employee.role] ||
                                    item.employee.role}
                                </span>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  className={cn(
                                    item.type === "ADVANCE"
                                      ? "bg-orange-100 text-orange-700 hover:bg-orange-100"
                                      : "bg-green-100 text-green-700 hover:bg-green-100",
                                  )}
                                >
                                  {item.type === "ADVANCE" ? "가불" : "보너스"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right font-bold text-zinc-900">
                                ₩{item.amount.toLocaleString()}
                              </TableCell>
                              <TableCell className="text-center">
                                {item.isSettled ? (
                                  <Badge
                                    variant="secondary"
                                    className="bg-zinc-100 text-zinc-500"
                                  >
                                    <Lock className="size-3 mr-1" /> 정산완료
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant="outline"
                                    className="text-zinc-400 border-zinc-200"
                                  >
                                    미정산
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-center">
                                {!item.isSettled && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-zinc-400 hover:text-red-500"
                                    onClick={() => handleDeleteExtra(item.id)}
                                  >
                                    <Trash2 className="size-4" />
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="md:hidden space-y-3">
                    {loading ? (
                      <div className="text-center py-8 text-zinc-500">
                        로딩 중...
                      </div>
                    ) : extraPayments.length === 0 ? (
                      <div className="text-center py-8 text-zinc-500">
                        지급 내역이 없습니다.
                      </div>
                    ) : (
                      extraPayments.map((item) => (
                        <div
                          key={item.id}
                          className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 shadow-sm flex justify-between items-center"
                        >
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-zinc-500">
                                {format(new Date(item.date), "MM.dd")}
                              </span>
                              <Badge
                                className={cn(
                                  "text-[10px] px-1.5 py-0 h-5",
                                  item.type === "ADVANCE"
                                    ? "bg-orange-100 text-orange-700"
                                    : "bg-green-100 text-green-700",
                                )}
                              >
                                {item.type === "ADVANCE" ? "가불" : "보너스"}
                              </Badge>
                              {item.isSettled && (
                                <Badge
                                  variant="secondary"
                                  className="text-[10px] px-1.5 py-0 h-5 bg-zinc-100 text-zinc-500"
                                >
                                  <Lock className="size-3 w-3 mr-0.5" /> 완료
                                </Badge>
                              )}
                            </div>
                            <span className="font-bold text-zinc-900 dark:text-zinc-100">
                              {item.employee.name}{" "}
                              <span className="text-xs font-normal text-zinc-500">
                                (
                                {ROLE_MAP[item.employee.role] ||
                                  item.employee.role}
                                )
                              </span>
                            </span>
                            <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">
                              ₩{item.amount.toLocaleString()}
                            </span>
                          </div>
                          <div>
                            {!item.isSettled && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 text-zinc-400 hover:text-red-500"
                                onClick={() => handleDeleteExtra(item.id)}
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Dialog 1: Shop Expense */}
      <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {expenseId ? "지출 수정" : "새 지출 등록"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <RadioGroup
              value={expenseType}
              onValueChange={(val: "FIXED" | "GENERAL") => setExpenseType(val)}
              className="flex gap-4 mb-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="GENERAL" id="r-general" />
                <Label htmlFor="r-general">일반 지출</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="FIXED" id="r-fixed" />
                <Label htmlFor="r-fixed">고정 지출</Label>
              </div>
            </RadioGroup>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>날짜</Label>
                <Input
                  type="date"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>내역 (카테고리)</Label>
                <Input
                  placeholder="예: 간식비, 월세"
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>금액</Label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="0"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  className="pl-8 font-bold"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
                  ₩
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveExpense}>
              {expenseId ? "수정" : "등록"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog 2: Extra Payment */}
      <Dialog open={isExtraDialogOpen} onOpenChange={setIsExtraDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>직원 지급 내역 등록</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <RadioGroup
              value={extraType}
              onValueChange={(val: "ADVANCE" | "BONUS") => setExtraType(val)}
              className="flex gap-4 mb-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="ADVANCE" id="r-advance" />
                <Label htmlFor="r-advance">가불금 (Advance)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="BONUS" id="r-bonus" />
                <Label htmlFor="r-bonus">보너스 (Bonus)</Label>
              </div>
            </RadioGroup>

            <div className="grid gap-2">
              <Label>직원 선택</Label>
              <Select
                value={extraEmployeeId}
                onValueChange={setExtraEmployeeId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="직원을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.name} ({ROLE_MAP[emp.role] || emp.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>날짜</Label>
                <Input
                  type="date"
                  value={extraDate}
                  onChange={(e) => setExtraDate(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>금액</Label>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="0"
                    value={extraAmount}
                    onChange={(e) => setExtraAmount(e.target.value)}
                    className="pl-8 font-bold"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
                    ₩
                  </span>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveExtra}>등록</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
