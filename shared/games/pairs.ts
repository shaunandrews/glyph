// Pairs: sixteen emoji make eight pairs of opposites. Four wrong pairs end the game.
import type { PairsPuzzle, Status } from "../types";

export const TRIES = 4;

export type PairsState = {
  found: number[]; // pair indexes found, in order
  misses: [string, string][];
  words: string[]; // sticker ids whose word was shown (help)
  shown: number[]; // pairs shown by help
  log: string; // squares, one per guess
  clean: string[];
  gaveUp: boolean;
};

export const init = (): PairsState => ({ found: [], misses: [], words: [], shown: [], log: "", clean: [], gaveUp: false });

export const pairOf = (p: PairsPuzzle, id: string) => p.pairs.findIndex(([a, b]) => a.s === id || b.s === id);
export const wordOf = (p: PairsPuzzle, id: string) => {
  const pair = p.pairs[pairOf(p, id)];
  return pair ? (pair[0].s === id ? pair[0].w : pair[1].w) : "";
};

export function tryPair(p: PairsPuzzle, s: PairsState, a: string, b: string): { state: PairsState; ok: boolean } {
  if (isOver(p, s) || a === b) return { state: s, ok: false };
  const i = pairOf(p, a);
  if (i >= 0 && i === pairOf(p, b) && !s.found.includes(i)) {
    const [x, y] = p.pairs[i];
    const spoiled = s.words.includes(x.s) || s.words.includes(y.s);
    return {
      ok: true,
      state: { ...s, found: [...s.found, i], log: s.log + (spoiled ? "y" : "g"), clean: spoiled ? s.clean : [...s.clean, x.s, y.s] },
    };
  }
  return { ok: false, state: { ...s, misses: [...s.misses, [a, b]], log: s.log + "r" } };
}

export const showWord = (s: PairsState, id: string): PairsState => (s.words.includes(id) ? s : { ...s, words: [...s.words, id] });

export function showPair(p: PairsPuzzle, s: PairsState): PairsState {
  const i = p.pairs.findIndex((_, k) => !s.found.includes(k));
  if (i < 0) return s;
  return { ...s, found: [...s.found, i], shown: [...s.shown, i], log: s.log + "o" };
}

export function giveUp(p: PairsPuzzle, s: PairsState): PairsState {
  const left = p.pairs.length - s.found.length;
  return { ...s, gaveUp: true, log: s.log + "x".repeat(left) };
}

export const isOver = (p: PairsPuzzle, s: PairsState) => s.gaveUp || s.found.length >= p.pairs.length || s.misses.length >= TRIES;
export const status = (p: PairsPuzzle, s: PairsState): Status =>
  s.found.length >= p.pairs.length || s.gaveUp ? "done" : s.misses.length >= TRIES ? "lost" : "playing";
export const squares = (_p: PairsPuzzle, s: PairsState) => s.log;
export const progress = (p: PairsPuzzle, s: PairsState) => `${s.found.length} of ${p.pairs.length}`;
