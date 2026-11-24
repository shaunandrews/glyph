export type GameId = "flip" | "pairs" | "ladder" | "chain";
export const GAMES: GameId[] = ["flip", "pairs", "ladder", "chain"];
export const GAME_NAMES: Record<GameId, string> = { flip: "Flip", pairs: "Pairs", ladder: "Ladder", chain: "Chain" };

/** An emoji in a puzzle: its sticker id and the word it stands for here. */
export type Emo = { s: string; w: string };
export type FlipRound = { topic: string; clues: { s: string; w: string; o: string }[]; answer: string; choices: string[] };
export type PairsPuzzle = { pairs: [Emo, Emo][]; order: string[]; herrings: [string, string][] };
export type Rung = { w: string; s?: string };
export type ChainPuzzle = { links: { w: string; s?: string }[] };

export type Day = {
  date: string;
  flip: FlipRound[];
  pairs: PairsPuzzle;
  ladder: Rung[][];
  chain: ChainPuzzle;
};

export type Status = "playing" | "done" | "lost";

/** A player's play of one game on one day, as the client sees it. */
export type Play = {
  game: GameId;
  status: Status;
  state: any;
  rev: number;
  squares: string;
  live: boolean;
  counted: boolean;
};

/** Squares are letters: g no help, y a little help, o more help, x gave up, r a miss. Spaces separate parts. */
export const SQUARE_EMOJI: Record<string, string> = { g: "🟩", y: "🟨", o: "🟧", x: "⬛", r: "🟥", " ": " " };

/** Letters only, upper case: how typed answers are compared. */
export function letters(s: string): string {
  return s.toUpperCase().replace(/[^A-Z]/g, "");
}
