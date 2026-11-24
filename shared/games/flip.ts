// Flip: each emoji is a word. Flip every word to its opposite and they spell a title.
import { letters, type FlipRound, type Status } from "../types";

export type FlipState = {
  round: number;
  flipped: number[]; // clue cards turned over this round (help: show a word)
  choices: boolean; // the four choices are showing (help)
  wrong: string[]; // choices tried and wrong this round
  solved: boolean; // this round is answered; waiting for Next
  results: string[];
  clean: string[];
};

export const init = (): FlipState => ({ round: 0, flipped: [], choices: false, wrong: [], solved: false, results: [], clean: [] });

function mark(s: FlipState): string {
  return s.choices ? "o" : s.flipped.length ? "y" : "g";
}

function finishRound(p: FlipRound[], s: FlipState, result: string): FlipState {
  const r = p[s.round];
  return {
    ...s,
    solved: true,
    results: [...s.results, result],
    clean: result === "g" ? [...s.clean, ...r.clues.map((c) => c.s)] : s.clean,
  };
}

export function guess(p: FlipRound[], s: FlipState, typed: string): { state: FlipState; ok: boolean } {
  if (s.solved || s.round >= p.length) return { state: s, ok: false };
  if (letters(typed) !== letters(p[s.round].answer)) return { state: s, ok: false };
  return { state: finishRound(p, s, mark(s)), ok: true };
}

export function pickChoice(p: FlipRound[], s: FlipState, choice: string): { state: FlipState; ok: boolean } {
  if (s.solved) return { state: s, ok: false };
  if (letters(choice) === letters(p[s.round].answer)) return { state: finishRound(p, s, "o"), ok: true };
  return { state: { ...s, wrong: [...s.wrong, choice] }, ok: false };
}

export const flipCard = (s: FlipState, i: number): FlipState => (s.solved || s.flipped.includes(i) ? s : { ...s, flipped: [...s.flipped, i] });
export const showChoices = (s: FlipState): FlipState => (s.solved ? s : { ...s, choices: true });
export const giveUp = (p: FlipRound[], s: FlipState): FlipState => (s.solved ? s : finishRound(p, s, "x"));
export const next = (s: FlipState): FlipState => ({ ...s, round: s.round + 1, flipped: [], choices: false, wrong: [], solved: false });

export const isOver = (p: FlipRound[], s: FlipState) => s.results.length >= p.length;
export const status = (p: FlipRound[], s: FlipState): Status => (isOver(p, s) ? "done" : "playing");
export const squares = (_p: FlipRound[], s: FlipState) => s.results.join("");
export const progress = (p: FlipRound[], s: FlipState) => `Round ${Math.min(s.round + 1, p.length)} of ${p.length}`;
