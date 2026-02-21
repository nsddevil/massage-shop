"use client";

import { Trophy, Medal, Crown } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface RankingItem {
  name: string;
  count?: number;
  amount?: number;
}

interface PopularityRankingsProps {
  data: {
    courses: RankingItem[];
    therapists: RankingItem[];
  } | null;
}

export function PopularityRankings({ data }: PopularityRankingsProps) {
  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown className="size-4 text-amber-500" />;
      case 1:
        return <Medal className="size-4 text-zinc-400" />;
      case 2:
        return <Medal className="size-4 text-orange-400" />;
      default:
        return null;
    }
  };

  const getRankColor = (index: number) => {
    switch (index) {
      case 0:
        return "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-800/50";
      case 1:
        return "bg-zinc-50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-400 border-zinc-100 dark:border-zinc-700";
      case 2:
        return "bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-orange-100 dark:border-orange-800/50";
      default:
        return "bg-gray-50 dark:bg-gray-900/20 text-gray-700 dark:text-gray-400 border-gray-100 dark:border-gray-800/50";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
      {/* Popular Courses */}
      <Card className="border-none shadow-sm shadow-zinc-200 dark:shadow-none bg-white dark:bg-zinc-900/50 overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-3 p-6">
          <div className="space-y-1">
            <CardTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <Trophy className="size-5 text-amber-500" />
              인기 코스 TOP 3
            </CardTitle>
            <CardDescription className="text-xs font-medium text-zinc-400">
              이번 달 가장 많이 판매된 코스
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-0">
          <div className="space-y-3">
            {data?.courses && data.courses.length > 0 ? (
              data.courses.map((course, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-xl border transition-all hover:scale-[1.02]",
                    getRankColor(idx),
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full flex items-center justify-center font-bold text-sm bg-white/50 dark:bg-black/20 shadow-sm border border-black/5">
                      {idx + 1}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-sm">{course.name}</span>
                      <span className="text-[10px] opacity-70 font-medium">
                        서비스 코스
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs font-bold">{course.count}건</span>
                    {getRankIcon(idx)}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-sm text-zinc-400 font-medium italic">
                데이터가 부족합니다.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Popular Therapists */}
      <Card className="border-none shadow-sm shadow-zinc-200 dark:shadow-none bg-white dark:bg-zinc-900/50 overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-3 p-6">
          <div className="space-y-1">
            <CardTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <Trophy className="size-5 text-blue-500" />
              인기 관리사 TOP 3
            </CardTitle>
            <CardDescription className="text-xs font-medium text-zinc-400">
              이번 달 초이스 수당 상위 3명
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-0">
          <div className="space-y-3">
            {data?.therapists && data.therapists.length > 0 ? (
              data.therapists.map((staff, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-xl border transition-all hover:scale-[1.02]",
                    idx === 0
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-800/50"
                      : getRankColor(idx),
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full flex items-center justify-center font-bold text-sm bg-white/50 dark:bg-black/20 shadow-sm border border-black/5">
                      {idx + 1}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-sm">{staff.name}</span>
                      <span className="text-[10px] opacity-70 font-medium">
                        관리사
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs font-bold">
                      ₩{(staff.amount || 0).toLocaleString()}
                    </span>
                    {getRankIcon(idx)}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-sm text-zinc-400 font-medium italic">
                데이터가 부족합니다.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
