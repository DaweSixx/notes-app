const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

export function formatRelativeDate(timestamp: number, locale: string, now = Date.now()): string {
  const diff = now - timestamp;
  const relative = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  if (diff < MINUTE) return relative.format(0, "second");
  if (diff < HOUR) return relative.format(-Math.floor(diff / MINUTE), "minute");
  if (diff < DAY) return relative.format(-Math.floor(diff / HOUR), "hour");
  if (diff < WEEK) return relative.format(-Math.floor(diff / DAY), "day");

  const sameYear = new Date(timestamp).getFullYear() === new Date(now).getFullYear();
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: sameYear ? undefined : "numeric",
  }).format(timestamp);
}
