export function getKSTDate(year?: number, month?: number, day?: number) {
  const now =
    year !== undefined && month !== undefined
      ? new Date(year, month, day ?? 1)
      : new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  // Korea is UTC+9
  const KR_TIME_DIFF = 9 * 60 * 60 * 1000;
  return new Date(utc + KR_TIME_DIFF);
}
