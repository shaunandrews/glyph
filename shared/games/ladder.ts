// Ladder: climb from a word to its opposite, one letter at a time. Each middle rung has an emoji clue.
import { letters, type Rung, type Status } from "../types";

export type LadderState = {
  ladder: number;
  rung: number; // the middle rung being solved (1 .. length-2)
  help: Record<string, number>; // "ladder-rung": 1 letter shown, 2 rung shown
  results: string[][];
  clean: string[];
};

export const init = (): LadderState => ({ ladder: 0, rung: 1, help: {}, results: [], clean: [] });

const key = (s: LadderState) => `${s.ladder}-${s.rung}`;

/** The position of the letter that changes from the rung above. */
export function changed(above: string, word: string): number {
  for (let i = 0; i < word.length; i++) if (above[i] !== word[i]) return i;
  return -1;
}

function advance(p: Rung[][], s: LadderState, result: string): LadderState {
  const rungs = p[s.ladder];
  const r = rungs[s.rung];
  const results = s.results.map((x) => x.slice());
  (results[s.ladder] ||= []).push(result);
  const clean = result === "g" && r.s ? [...s.clean, r.s] : s.clean;
  if (s.rung + 1 < rungs.length - 1) return { ...s, rung: s.rung + 1, results, clean };
  return { ...s, ladder: s.ladder + 1, rung: 1, results, clean };
}

export function guess(p: Rung[][], s: LadderState, typed: string): { state: LadderState; ok: boolean } {
  if (isOver(p, s)) return { state: s, ok: false };
  if (letters(typed) !== letters(p[s.ladder][s.rung].w)) return { state: s, ok: false };
  const h = s.help[key(s)] || 0;
  return { state: advance(p, s, h === 0 ? "g" : "y"), ok: true };
}

export const showLetter = (s: LadderState): LadderState => ({ ...s, help: { ...s.help, [key(s)]: Math.max(1, s.help[key(s)] || 0) } });
export const showRung = (p: Rung[][], s: LadderState): LadderState => advance(p, s, "o");

export function giveUp(p: Rung[][], s: LadderState): LadderState {
  let t = s;
  const ladder = s.ladder;
  while (!isOver(p, t) && t.ladder === ladder) t = advance(p, t, "x");
  return t;
}

export const isOver = (p: Rung[][], s: LadderState) => s.ladder >= p.length;
export const status = (p: Rung[][], s: LadderState): Status => (isOver(p, s) ? "done" : "playing");
export const squares = (_p: Rung[][], s: LadderState) => s.results.map((r) => r.join("")).join(" ");
export const progress = (p: Rung[][], s: LadderState) =>
  isOver(p, s) ? "Done" : p.length > 1 ? `Ladder ${s.ladder + 1} of ${p.length}` : `Rung ${s.rung} of ${p[0].length - 2}`;
