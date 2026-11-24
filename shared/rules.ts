// Streak and counting rules: pure functions, rows in and answers out.
import { addDays, countsBy, FIRST_DAY } from "./day";

export type PlayRow = { date: string; live: boolean; status: string; finishedAt: string };

/** A play counts for streak and stickers when it was live and finished before 3 am the next day. */
export function isCounted(p: PlayRow): boolean {
  if (!p.live || p.status === "playing" || !p.finishedAt) return false;
  return Date.parse(p.finishedAt) <= countsBy(p.date);
}

/** Current and best streak from a player's plays. */
export function streakFrom(plays: PlayRow[], today: string): { streak: number; best: number } {
  const days = new Set(plays.filter(isCounted).map((p) => p.date));
  let streak = 0;
  let d = days.has(today) ? today : addDays(today, -1);
  while (d >= FIRST_DAY && days.has(d)) { streak++; d = addDays(d, -1); }
  let best = 0, run = 0;
  for (let x = FIRST_DAY; x <= today; x = addDays(x, 1)) {
    run = days.has(x) ? run + 1 : 0;
    best = Math.max(best, run);
  }
  return { streak, best };
}
