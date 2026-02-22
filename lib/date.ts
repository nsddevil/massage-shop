import {
  // startOfDay, // No longer directly used from date-fns
  // endOfDay, // No longer directly used from date-fns
  // startOfWeek, // No longer directly used from date-fns
  // endOfWeek, // No longer directly used from date-fns
  // startOfMonth, // No longer directly used from date-fns
  // endOfMonth, // No longer directly used from date-fns
  addHours,
} from "date-fns";

const KST_OFFSET = 9 * 60 * 60 * 1000;

/**
 * 서버 환경(UTC)에서도 한국 시간(KST)을 기준으로 현재 시간을 반환합니다.
 */
export function getKSTDate() {
  return new Date(Date.now() + KST_OFFSET);
}

/**
 * KST 기준으로 날짜 처리를 수행하는 래퍼 함수들
 * 서버(UTC)에서 date-fns의 startOfWeek 등을 쓰면 날짜가 밀리는 문제를 해결합니다.
 */
export const kst = {
  now: () => new Date(), // 실제 DB 쿼리용 (new Date()는 항상 UTC 기준 timestamp를 가짐)

  // 현재 시각을 KST로 변환한 Date 객체 (화면 표시용)
  nowKST: () => new Date(Date.now() + KST_OFFSET),

  startOfDay: (date: Date) => {
    // 1. 입력 시간을 KST로 변환
    const kstTime = new Date(date.getTime() + KST_OFFSET);
    // 2. KST 기준의 연, 월, 일 추출
    const y = kstTime.getUTCFullYear();
    const m = kstTime.getUTCMonth();
    const d = kstTime.getUTCDate();
    // 3. KST 00:00:00에 해당하는 UTC 시점 계산하여 반환
    return new Date(Date.UTC(y, m, d) - KST_OFFSET);
  },

  endOfDay: (date: Date) => {
    const start = kst.startOfDay(date);
    return new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1);
  },

  startOfWeek: (date: Date) => {
    const start = kst.startOfDay(date);
    const kstTime = new Date(start.getTime() + KST_OFFSET);
    const day = kstTime.getUTCDay(); // 0(일) ~ 6(토)
    // 월요일(1) 기준 조정
    const diff = day === 0 ? 6 : day - 1;
    return new Date(start.getTime() - diff * 24 * 60 * 60 * 1000);
  },

  endOfWeek: (date: Date) => {
    const start = kst.startOfWeek(date);
    return new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000 - 1);
  },

  startOfMonth: (date: Date) => {
    const kstTime = new Date(date.getTime() + KST_OFFSET);
    const y = kstTime.getUTCFullYear();
    const m = kstTime.getUTCMonth();
    return new Date(Date.UTC(y, m, 1) - KST_OFFSET);
  },

  endOfMonth: (date: Date) => {
    const kstTime = new Date(date.getTime() + KST_OFFSET);
    const y = kstTime.getUTCFullYear();
    const m = kstTime.getUTCMonth();
    return new Date(Date.UTC(y, m + 1, 1) - KST_OFFSET - 1);
  },
};
