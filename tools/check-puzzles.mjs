// Checks every day file. Run: node tools/check-puzzles.mjs (part of npm run check).
import { readdirSync } from "node:fs";
const dir = new URL("../server/puzzles/days/", import.meta.url);
const DAYS = {};
for (const f of readdirSync(dir).filter((f) => f.endsWith(".ts")).sort()) DAYS[f.slice(0, 10)] = (await import(new URL(f, dir))).default;
import { BY_ID } from "../shared/stickers.ts";
import { letters } from "../shared/types.ts";
import { addDays } from "../shared/day.ts";
let errors = 0;
const err = (d, m) => { errors++; console.log(`${d}: ${m}`); };
const dates = Object.keys(DAYS).sort();
for (let i = 1; i < dates.length; i++) if (addDays(dates[i - 1], 1) !== dates[i]) err(dates[i], "a day is missing before this one");
for (const [date, day] of Object.entries(DAYS)) {
  if (day.date !== date) err(date, `file says ${day.date}`);
  const ids = [];
  for (const r of day.flip) {
    if (!r.choices.includes(r.answer)) err(date, `Flip: "${r.answer}" isn't among its choices`);
    if (new Set(r.choices).size !== 4) err(date, `Flip: "${r.answer}" needs four different choices`);
    for (const c of r.clues) { ids.push(c.s); if (!c.w || !c.o) err(date, "Flip: a clue lacks a word or opposite"); }
  }
  const pi = day.pairs.pairs.flatMap(([a, b]) => [a.s, b.s]);
  ids.push(...pi);
  if (day.pairs.pairs.length !== 8) err(date, "Pairs: needs 8 pairs");
  if (new Set(pi).size !== 16) err(date, "Pairs: needs 16 different stickers");
  if (day.pairs.order.length !== 16 || !day.pairs.order.every((s) => pi.includes(s))) err(date, "Pairs: order must hold exactly the 16 stickers");
  for (const [a, b] of day.pairs.herrings) if (day.pairs.pairs.some(([x, y]) => (x.s === a && y.s === b) || (x.s === b && y.s === a))) err(date, `Pairs: herring ${a}+${b} is a real pair`);
  for (const l of day.ladder) {
    for (let k = 1; k < l.length; k++) {
      const a = l[k - 1].w, b = l[k].w;
      if (a.length !== b.length || [...a].filter((c, j) => c !== b[j]).length !== 1) err(date, `Ladder: ${a} to ${b} isn't one letter`);
    }
    l.slice(1, -1).forEach((r) => (r.s ? ids.push(r.s) : err(date, `Ladder: ${r.w} has no sticker`)));
  }
  const links = day.chain.links;
  if (!links[0].s || !links[links.length - 1].s) err(date, "Chain: both ends need stickers");
  links.forEach((l) => l.s && ids.push(l.s));
  links.forEach((l) => { if (letters(l.w) !== l.w) err(date, `Chain: ${l.w} should be capital letters`); });
  for (const id of ids) if (!BY_ID[id]) err(date, `unknown sticker ${id}`);
}
console.log(errors ? `${errors} puzzle errors` : `${dates.length} days check out (${dates[0]} to ${dates.at(-1)})`);
process.exit(errors ? 1 : 0);
