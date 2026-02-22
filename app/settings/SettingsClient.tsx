"use client";

import { useState } from "react";
import { Header } from "@/components/dashboard/header";
import {
  Settings,
  Trash2,
  AlertTriangle,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { resetBusinessData } from "@/app/actions/admin";
import { toast } from "sonner";

export function SettingsClient() {
  const [resetConfirmText, setResetConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const targetText = "데이터 초기화";

  const handleReset = async () => {
    if (resetConfirmText !== targetText) return;

    if (
      !confirm(
        "정말 모든 영업 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.",
      )
    ) {
      return;
    }

    setLoading(true);
    const result = await resetBusinessData();
    setLoading(false);

    if (result.success) {
      toast.success("모든 영업 데이터가 초기화되었습니다.");
      setResetConfirmText("");
    } else {
      toast.error(result.error || "초기화에 실패했습니다.");
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-zinc-50 dark:bg-black">
      <Header />

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-zinc-900 dark:bg-zinc-800 rounded-xl">
                <Settings className="size-6 text-white" />
              </div>
              <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
                시스템 설정
              </h1>
            </div>
            <p className="text-zinc-500 font-medium pl-14">
              매장 관리 시스템의 환경을 설정하고 데이터를 관리합니다.
            </p>
          </div>

          <div className="grid gap-8">
            {/* Danger Zone */}
            <Card className="border-none shadow-xl shadow-red-200/20 dark:shadow-none bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden overflow-hidden p-8 border border-red-100 dark:border-red-900/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-xl">
                  <AlertTriangle className="size-5 text-red-600" />
                </div>
                <h2 className="text-xl font-black text-red-600">
                  위험 구역 (테스트용)
                </h2>
              </div>

              <div className="space-y-6">
                <div className="p-6 bg-red-50 dark:bg-red-900/10 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-bold italic">
                    <CheckCircle2 className="size-4" />
                    <span>유지되는 데이터: 직원 정보, 코스 정보</span>
                  </div>
                  <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-bold italic">
                    <Trash2 className="size-4" />
                    <span>
                      삭제되는 데이터: 매출, 정산, 가불금, 근태, 지출 내역 전체
                    </span>
                  </div>
                  <p className="text-sm text-red-600/70 font-medium mt-4">
                    ※ 현재는 테스트 기간이므로 제공되는 기능입니다. 프로덕션
                    전환 시 삭제될 예정입니다.
                  </p>
                </div>

                <div className="space-y-4">
                  <p className="text-sm font-bold text-zinc-600 dark:text-zinc-400">
                    실수를 방지하기 위해 아래에{" "}
                    <span className="text-red-600">"{targetText}"</span>라고
                    입력해 주세요.
                  </p>
                  <div className="flex flex-col md:flex-row gap-4">
                    <Input
                      placeholder={targetText}
                      value={resetConfirmText}
                      onChange={(e) => setResetConfirmText(e.target.value)}
                      className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 font-bold text-lg"
                    />
                    <Button
                      variant="destructive"
                      onClick={handleReset}
                      disabled={resetConfirmText !== targetText || loading}
                      className="h-12 px-8 rounded-xl font-black text-lg shadow-lg shadow-red-500/20"
                    >
                      {loading ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      ) : (
                        <Trash2 className="mr-2 h-5 w-5" />
                      )}
                      영업 데이터 전체 초기화
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
