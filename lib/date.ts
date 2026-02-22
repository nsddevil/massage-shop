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
    // 1. 입력 시점의 KST 기준 연, 월, 일 추출
    const kstTime = new Date(date.getTime() + KST_OFFSET);
    const y = kstTime.getUTCFullYear();
    const m = kstTime.getUTCMonth();
    const d = kstTime.getUTCDate();
    // 2. KST 00:00:00에 해당하는 UTC 시점 반환
    return new Date(Date.UTC(y, m, d) - KST_OFFSET);
  },

  /**
   * Prisma의 @db.Date 필드(시각 정보 없음)에 저장하기 적합한 Date 객체를 반환합니다.
   * KST 기준 날짜의 00:00 UTC 시점을 반환하여 시간대 혼선을 방지합니다.
   */
  toDateOnly: (date: Date) => {
    const kstTime = new Date(date.getTime() + KST_OFFSET);
    const y = kstTime.getUTCFullYear();
    const m = kstTime.getUTCMonth();
    const d = kstTime.getUTCDate();
    return new Date(Date.UTC(y, m, d));
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

  format: (date: Date, formatStr: string) => {
    const kstTime = new Date(date.getTime() + KST_OFFSET);
    const y = kstTime.getUTCFullYear();
    const m = kstTime.getUTCMonth() + 1;
    const d = kstTime.getUTCDate();
    const hh = kstTime.getUTCHours();
    const mm = kstTime.getUTCMinutes();

    return formatStr
      .replace("yyyy", String(y))
      .replace("MM", String(m).padStart(2, "0"))
      .replace("dd", String(d).padStart(2, "0"))
      .replace("HH", String(hh).padStart(2, "0"))
      .replace("mm", String(mm).padStart(2, "0"))
      .replace("MM월", String(m) + "월") // 추가: MM월 dd일 지원
      .replace("dd일", String(d).padStart(2, "0") + "일");
  },

  /**
   * input type="datetime-local" 에 사용할 수 있는 KST 기준 포맷(YYYY-MM-DDTHH:mm)을 반환합니다.
   */
  toInputString: (date: Date) => {
    const kstTime = new Date(date.getTime() + KST_OFFSET);
    const y = kstTime.getUTCFullYear();
    const m = String(kstTime.getUTCMonth() + 1).padStart(2, "0");
    const d = String(kstTime.getUTCDate()).padStart(2, "0");
    const hh = String(kstTime.getUTCHours()).padStart(2, "0");
    const mm = String(kstTime.getUTCMinutes()).padStart(2, "0");
    return `${y}-${m}-${d}T${hh}:${mm}`;
  },
};
