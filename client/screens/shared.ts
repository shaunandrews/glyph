import { RULES } from "../../shared/games/index";
import { GAME_NAMES, GAMES, SQUARE_EMOJI, type Day, type GameId, type Play } from "../../shared/types";

/** A one-line result for a finished game. */
export function headline(game: GameId, day: Day, play: { status: string; squares: string }): string {
  const sq = play.squares.replace(/ /g, "");
  const clean = sq.length > 0 && [...sq].every((c) => c === "g");
  if (game === "pairs") {
    if (play.status === "lost") return "Out of tries";
    if (sq.includes("x")) return "Gave up";
    const misses = [...sq].filter((c) => c === "r").length;
    return misses === 0 ? "All eight, no misses" : `All eight, ${misses} ${misses === 1 ? "miss" : "misses"}`;
  }
  if (clean) return game === "flip" ? "All three, no help" : game === "ladder" ? "Clean climb" : "Clean chain";
  const helped = [...sq].filter((c) => c !== "g" && c !== "x").length;
  const gave = [...sq].filter((c) => c === "x").length;
  const unit = game === "flip" ? "round" : game === "ladder" ? "rung" : "word";
  if (gave) return `${gave} ${unit}${gave === 1 ? "" : "s"} given up`;
  return `${helped} ${unit}${helped === 1 ? "" : "s"} with help`;
}

export function shareText(number: number, streak: number, plays: Partial<Record<GameId, Play>>, only?: GameId): string {
  const line = (g: GameId) => `${GAME_NAMES[g]} ${[...(plays[g]?.squares ?? "")].map((c) => SQUARE_EMOJI[c] ?? "").join("")}`;
  const games = only ? [only] : GAMES.filter((g) => plays[g] && plays[g]!.status !== "playing");
  return [`Glyph #${number}${streak ? ` 🔥${streak}` : ""}`, ...games.map(line), "glyph.space.fast"].join("\n");
}

export const isFinished = (p?: Play) => !!p && p.status !== "playing";
export const progressOf = (game: GameId, day: Day, play: Play) => RULES[game].progress(day[game], play.state);
