import type { Day, GameId, Status } from "../types";
import * as flip from "./flip";
import * as pairs from "./pairs";
import * as ladder from "./ladder";
import * as chain from "./chain";

export { flip, pairs, ladder, chain };

type Rules = {
  init(): any;
  status(p: any, s: any): Status;
  squares(p: any, s: any): string;
  progress(p: any, s: any): string;
  isOver(p: any, s: any): boolean;
};
export const RULES: Record<GameId, Rules> = { flip, pairs, ladder, chain };

export const puzzleOf = (day: Day, game: GameId): any => day[game];

/** Every sticker id that appears in a game's puzzle, so a finish can only award stickers from it. */
export function stickersIn(day: Day, game: GameId): string[] {
  if (game === "flip") return day.flip.flatMap((r) => r.clues.map((c) => c.s));
  if (game === "pairs") return day.pairs.pairs.flatMap(([a, b]) => [a.s, b.s]);
  if (game === "ladder") return day.ladder.flatMap((l) => l.map((r) => r.s).filter(Boolean) as string[]);
  return day.chain.links.map((l) => l.s).filter(Boolean) as string[];
}

/** Size line on a fresh game card. */
export function sizeOf(day: Day, game: GameId): string {
  if (game === "flip") return `${day.flip.length} rounds`;
  if (game === "pairs") return `${day.pairs.pairs.length} pairs`;
  if (game === "ladder") return cap(day.ladder.map((l) => `${low(l[0].w)} to ${low(l[l.length - 1].w)}`).join(", "));
  return `${day.chain.links.length} words`;
}
const cap = (w: string) => w[0] + w.slice(1).toLowerCase();
const low = (w: string) => w.toLowerCase();
