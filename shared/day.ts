// The Glyph day: one shared day for everyone, starting at midnight Eastern (America/New_York).
// US daylight-saving rules are written out here because the server (QuickJS) may have no Intl.
// tools/check-day.mjs checks this against Intl for ten years of dates.

export const FIRST_DAY = "2026-11-24"; // Glyph #1
const HOUR = 3600_000;

function nthSunday(year: number, month: number, n: number): number {
  const first = new Date(Date.UTC(year, month, 1)).getUTCDay();
  return 1 + ((7 - first) % 7) + (n - 1) * 7;
}

/** Eastern offset from UTC in hours at this instant: -4 in daylight time, -5 otherwise. */
export function easternOffset(ms: number): number {
  const year = new Date(ms).getUTCFullYear();
  const start = Date.UTC(year, 2, nthSunday(year, 2, 2), 7); // 2 am EST
  const end = Date.UTC(year, 10, nthSunday(year, 10, 1), 6); // 2 am EDT
  return ms >= start && ms < end ? -4 : -5;
}

/** The Glyph date (YYYY-MM-DD) at this instant. */
export function glyphDate(ms: number): string {
  return new Date(ms + easternOffset(ms) * HOUR).toISOString().slice(0, 10);
}

export function addDays(date: string, n: number): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

/** The instant this Glyph date starts (midnight Eastern). */
export function startOf(date: string): number {
  const [y, m, d] = date.split("-").map(Number);
  const utcMidnight = Date.UTC(y, m - 1, d);
  const guess = utcMidnight + 5 * HOUR;
  return easternOffset(guess) === -4 ? utcMidnight + 4 * HOUR : guess;
}

/** The instant the next Glyph starts. */
export function nextRollover(ms: number): number {
  return startOf(addDays(glyphDate(ms), 1));
}

export function dayNumber(date: string): number {
  return Math.round((startOf(date) - startOf(FIRST_DAY)) / (24 * HOUR)) + 1;
}

export function isDate(v: unknown): v is string {
  return typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);
}

export function weekday(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
}

/** A play counts (streak, stickers) when it started on its own day and finished by 3 am the next. */
export function countsBy(date: string): number {
  return startOf(addDays(date, 1)) + 3 * HOUR;
}
