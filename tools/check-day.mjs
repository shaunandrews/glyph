// Checks shared/day.ts against Intl for every hour from 2026 to 2036. Run: node tools/check-day.mjs
import { glyphDate } from "../shared/day.ts";
const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit" });
let bad = 0;
for (let t = Date.UTC(2026, 0, 1); t < Date.UTC(2036, 0, 1); t += 15 * 60_000) {
  if (glyphDate(t) !== fmt.format(t)) { bad++; if (bad < 5) console.log("mismatch", new Date(t).toISOString(), glyphDate(t), fmt.format(t)); }
}
console.log(bad ? `${bad} mismatches` : "day.ts matches Intl, 2026-2035");
process.exit(bad ? 1 : 0);
