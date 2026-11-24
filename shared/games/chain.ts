// Chain: each word makes a new word with the one after it. The two ends are given.
import { letters, type ChainPuzzle, type Status } from "../types";

export type ChainState = {
  link: number; // the hidden word being solved (1 .. length-2)
  shown: Record<string, number>; // letters showing per link (starts at 1)
  results: string[];
  clean: string[];
};

export const init = (): ChainState => ({ link: 1, shown: {}, results: [], clean: [] });

export const shownCount = (s: ChainState, i: number) => s.shown[i] || 1;

function advance(p: ChainPuzzle, s: ChainState, result: string): ChainState {
  const results = [...s.results, result];
  const link = s.link + 1;
  const over = link >= p.links.length - 1;
  const clean = over && results.every((r) => r === "g") ? [p.links[0].s, p.links[p.links.length - 1].s].filter(Boolean) as string[] : s.clean;
  return { ...s, link, results, clean };
}

function reveal(p: ChainPuzzle, s: ChainState): { state: ChainState; lost: boolean } {
  const word = p.links[s.link].w;
  const n = shownCount(s, s.link);
  if (n >= word.length - 1) return { state: advance(p, s, "x"), lost: true };
  return { state: { ...s, shown: { ...s.shown, [s.link]: n + 1 } }, lost: false };
}

export function guess(p: ChainPuzzle, s: ChainState, typed: string): { state: ChainState; ok: boolean; lost: boolean } {
  if (isOver(p, s)) return { state: s, ok: false, lost: false };
  if (letters(typed) === letters(p.links[s.link].w)) {
    const extra = shownCount(s, s.link) - 1;
    return { state: advance(p, s, extra === 0 ? "g" : extra === 1 ? "y" : "o"), ok: true, lost: false };
  }
  const r = reveal(p, s);
  return { state: r.state, ok: false, lost: r.lost };
}

export const showLetter = (p: ChainPuzzle, s: ChainState) => reveal(p, s).state;
export const giveUpWord = (p: ChainPuzzle, s: ChainState) => advance(p, s, "x");

export const isOver = (p: ChainPuzzle, s: ChainState) => s.link >= p.links.length - 1;
export const status = (p: ChainPuzzle, s: ChainState): Status => (isOver(p, s) ? "done" : "playing");
export const squares = (_p: ChainPuzzle, s: ChainState) => s.results.join("");
export const progress = (p: ChainPuzzle, s: ChainState) => `Word ${Math.min(s.link, p.links.length - 2)} of ${p.links.length - 2}`;
