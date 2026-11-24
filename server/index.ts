// Glyph's server: the only server file that knows it runs on Zero. Each handler reads rows,
// calls the shared rules, and writes. Players and sessions are Glyph's own (no Zero sign-in).
import { boolean, capsule, id, mutation, number, query, string, table } from "@spacefast/zero/server";
import { DAYS } from "./puzzles/index";
import { dayNumber, glyphDate, isDate } from "../shared/day";
import { GAMES, type GameId } from "../shared/types";
import { RULES, puzzleOf, stickersIn } from "../shared/games/index";
import { isCounted, streakFrom } from "../shared/rules";

const HOUR = 3600_000;

const idOf = (r: any): string => (typeof r === "string" ? r : r.id);

async function random(ctx: any): Promise<string> {
  return ctx.crypto.sha256(`${Date.now()}:${Math.random()}:${Math.random()}:${Math.random()}`);
}

async function hashPassword(ctx: any, salt: string, password: string): Promise<string> {
  let h = "";
  for (let i = 0; i < 400; i++) h = await ctx.crypto.sha256(`${salt}:${h}:${password}`);
  return h;
}

async function sessionOf(ctx: any, token: unknown) {
  if (typeof token !== "string" || token.length < 20) return null;
  const tokenHash = await ctx.crypto.sha256(token);
  return ctx.db.sessions.withIndex("by_token", (r: any) => r.eq("tokenHash", tokenHash)).first();
}

async function playerOf(ctx: any, token: unknown) {
  const s = await sessionOf(ctx, token);
  return s ? ctx.db.players.get(s.playerId) : null;
}

async function newSession(ctx: any, playerId: string): Promise<string> {
  const token = await random(ctx);
  await ctx.db.sessions.insert({ playerId, tokenHash: await ctx.crypto.sha256(token), lastSeenAt: new Date().toISOString() });
  return token;
}

/** The caller's player, creating a guest (and its session) when there is none. */
async function ensurePlayer(ctx: any, token: unknown): Promise<{ player: any; token: string }> {
  const p = await playerOf(ctx, token);
  if (p) return { player: p, token: token as string };
  const pid = idOf(await ctx.db.players.insert({ username: "", passwordHash: "", salt: "", avatar: "", failCount: 0, failAt: "" }));
  const t = await newSession(ctx, pid);
  return { player: await ctx.db.players.get(pid), token: t };
}

const pickPlay = (rows: any[]) =>
  rows.slice().sort((a, b) => (a.status === "playing" ? 1 : 0) - (b.status === "playing" ? 1 : 0) || a.createdAt.localeCompare(b.createdAt))[0] ?? null;

async function playsFor(ctx: any, playerId: string, date?: string): Promise<any[]> {
  return ctx.db.plays
    .withIndex("by_player_date", (r: any) => (date ? r.eq("playerId", playerId).eq("date", date) : r.eq("playerId", playerId)))
    .collect();
}

async function findPlay(ctx: any, playerId: string, date: string, game: string) {
  return pickPlay((await playsFor(ctx, playerId, date)).filter((p) => p.game === game));
}

function needGame(date: unknown, game: unknown): { date: string; game: GameId } {
  if (!isDate(date) || !DAYS[date]) throw new Error("There's no Glyph for that day.");
  if (date > glyphDate(Date.now())) throw new Error("That Glyph isn't out yet.");
  if (!GAMES.includes(game as GameId)) throw new Error("Unknown game.");
  return { date, game: game as GameId };
}

function parseState(json: unknown): any {
  if (typeof json !== "string" || json.length > 8000) throw new Error("That game state is too big.");
  return JSON.parse(json);
}

async function ensurePlay(ctx: any, playerId: string, date: string, game: string) {
  const found = await findPlay(ctx, playerId, date, game);
  if (found) return found;
  const live = date === glyphDate(Date.now());
  const pid = idOf(await ctx.db.plays.insert({ playerId, date, game, live, status: "playing", state: "", rev: 0, squares: "", finishedAt: "" }));
  return ctx.db.plays.get(pid);
}

function clientPlay(p: any) {
  return {
    game: p.game,
    status: p.status,
    state: p.state ? JSON.parse(p.state) : null,
    rev: p.rev,
    squares: p.squares,
    live: p.live,
    counted: isCounted(p),
  };
}

async function stickersOf(ctx: any, playerId: string): Promise<{ sticker: string; date: string }[]> {
  const rows = await ctx.db.stickers.withIndex("by_player", (r: any) => r.eq("playerId", playerId)).collect();
  const seen = new Set<string>();
  return rows.filter((r: any) => !seen.has(r.sticker) && seen.add(r.sticker)).map((r: any) => ({ sticker: r.sticker, date: r.date }));
}

function cleanName(v: unknown): string {
  const s = String(v ?? "").trim().toLowerCase();
  if (!/^[a-z0-9_]{3,20}$/.test(s)) throw new Error("Usernames are 3 to 20 letters, numbers or _.");
  return s;
}

/** Moves a guest's plays and stickers into an account. A finished play beats one in progress; of two finished, the first wins. */
async function mergeGuest(ctx: any, guest: any, account: any) {
  const theirs = await playsFor(ctx, account.id);
  for (const p of await playsFor(ctx, guest.id)) {
    const other = pickPlay(theirs.filter((t) => t.date === p.date && t.game === p.game));
    const keepGuest =
      !other ||
      (other.status === "playing" && p.status !== "playing") ||
      (other.status !== "playing" && p.status !== "playing" && p.finishedAt < other.finishedAt);
    if (keepGuest) {
      if (other) await ctx.db.plays.delete(other.id);
      await ctx.db.plays.update(p.id, { playerId: account.id });
    } else await ctx.db.plays.delete(p.id);
  }
  const owned = new Set((await stickersOf(ctx, account.id)).map((s) => s.sticker));
  for (const s of await ctx.db.stickers.withIndex("by_player", (r: any) => r.eq("playerId", guest.id)).collect()) {
    if (owned.has(s.sticker)) await ctx.db.stickers.delete(s.id);
    else await ctx.db.stickers.update(s.id, { playerId: account.id });
  }
  for (const s of await ctx.db.sessions.withIndex("by_player", (r: any) => r.eq("playerId", guest.id)).collect()) await ctx.db.sessions.delete(s.id);
  await ctx.db.players.delete(guest.id);
}

export default capsule({
  name: "Glyph",
  schema: {
    players: table({
      username: string(),
      passwordHash: string(),
      salt: string(),
      avatar: string().default(""),
      failCount: number().default(0),
      failAt: string().default(""),
    }).index("by_username", ["username"]),
    sessions: table({
      playerId: id("players"),
      tokenHash: string(),
      lastSeenAt: string(),
    })
      .index("by_token", ["tokenHash"])
      .index("by_player", ["playerId"]),
    plays: table({
      playerId: id("players"),
      date: string(),
      game: string(),
      live: boolean(),
      status: string(),
      state: string().default(""),
      rev: number().default(0),
      squares: string().default(""),
      finishedAt: string().default(""),
    }).index("by_player_date", ["playerId", "date"]),
    stickers: table({
      playerId: id("players"),
      sticker: string(),
      date: string(),
    }).index("by_player", ["playerId"]),
  },
  queries: {
    /** Everything the Today screen and the games need for one date. */
    today: query(async (ctx, token: string, date: string) => {
      const now = Date.now();
      const serverToday = glyphDate(now);
      const d = isDate(date) && date <= serverToday ? date : serverToday;
      const player = await playerOf(ctx, token);
      const all = player ? await playsFor(ctx, player.id) : [];
      const plays: Record<string, any> = {};
      for (const g of GAMES) {
        const p = pickPlay(all.filter((x: any) => x.date === d && x.game === g));
        if (p) plays[g] = clientPlay(p);
      }
      const { streak, best } = streakFrom(all, serverToday);
      return { now, today: serverToday, date: d, number: dayNumber(d), day: DAYS[d] ?? null, plays, streak, best, signedIn: !!player?.username };
    }),
    me: query(async (ctx, token: string) => {
      const player = await playerOf(ctx, token);
      if (!player) return { username: "", streak: 0, best: 0, days: 0, games: 0, stickers: [] };
      const all = await playsFor(ctx, player.id);
      const { streak, best } = streakFrom(all, glyphDate(Date.now()));
      const counted = all.filter(isCounted);
      return {
        username: player.username,
        streak,
        best,
        days: new Set(counted.map((p: any) => p.date)).size,
        games: all.filter((p: any) => p.status !== "playing").length,
        stickers: await stickersOf(ctx, player.id),
      };
    }),
  },
  mutations: {
    startGame: mutation(async (ctx, token: string, date: string, game: string) => {
      const g = needGame(date, game);
      const { player, token: t } = await ensurePlayer(ctx, token);
      await ensurePlay(ctx, player.id, g.date, g.game);
      ctx.invalidate();
      return { token: t };
    }),
    saveGame: mutation(async (ctx, token: string, date: string, game: string, state: string, rev: number) => {
      const g = needGame(date, game);
      const { player, token: t } = await ensurePlayer(ctx, token);
      const play = await ensurePlay(ctx, player.id, g.date, g.game);
      if (play.status !== "playing" || rev <= play.rev) return { token: t };
      parseState(state);
      await ctx.db.plays.update(play.id, { state, rev });
      return { token: t };
    }),
    finishGame: mutation(async (ctx, token: string, date: string, game: string, state: string, rev: number) => {
      const g = needGame(date, game);
      const { player, token: t } = await ensurePlayer(ctx, token);
      const play = await ensurePlay(ctx, player.id, g.date, g.game);
      if (play.status !== "playing") return { token: t };
      const s = parseState(state);
      const puzzle = puzzleOf(DAYS[g.date], g.game);
      const rules = RULES[g.game];
      const status = rules.status(puzzle, s);
      if (status === "playing") throw new Error("That game isn't finished.");
      const finishedAt = new Date().toISOString();
      const row = { ...play, status, finishedAt };
      await ctx.db.plays.update(play.id, { state, rev, status, squares: rules.squares(puzzle, s), finishedAt });
      if (isCounted(row)) {
        const allowed = new Set(stickersIn(DAYS[g.date], g.game));
        const owned = new Set((await stickersOf(ctx, player.id)).map((x) => x.sticker));
        for (const id of new Set<string>(Array.isArray(s.clean) ? s.clean : [])) {
          if (allowed.has(id) && !owned.has(id)) await ctx.db.stickers.insert({ playerId: player.id, sticker: id, date: g.date });
        }
      }
      ctx.invalidate();
      return { token: t };
    }),
    createAccount: mutation(async (ctx, token: string, username: string, password: string) => {
      const name = cleanName(username);
      if (typeof password !== "string" || password.length < 8) throw new Error("Passwords need at least 8 characters.");
      const taken = await ctx.db.players.withIndex("by_username", (r: any) => r.eq("username", name)).first();
      if (taken) throw new Error("That username is taken.");
      const { player, token: t } = await ensurePlayer(ctx, token);
      if (player.username) throw new Error("You're already signed in.");
      const salt = await random(ctx);
      await ctx.db.players.update(player.id, { username: name, salt, passwordHash: await hashPassword(ctx, salt, password) });
      ctx.invalidate();
      return { token: t };
    }),
    signIn: mutation(async (ctx, token: string, username: string, password: string) => {
      const name = String(username ?? "").trim().toLowerCase();
      const account = await ctx.db.players.withIndex("by_username", (r: any) => r.eq("username", name)).first();
      // Wrong answers return an error instead of throwing, so the failed-try count is saved.
      const wrong = { token: String(token ?? ""), error: "Wrong username or password." };
      if (!account) return wrong;
      const recent = account.failAt && Date.now() - Date.parse(account.failAt) < HOUR;
      if (recent && account.failCount >= 10) return { ...wrong, error: "Too many tries. Wait an hour, or ask Shaun." };
      if ((await hashPassword(ctx, account.salt, String(password ?? ""))) !== account.passwordHash) {
        await ctx.db.players.update(account.id, { failCount: recent ? account.failCount + 1 : 1, failAt: new Date().toISOString() });
        return wrong;
      }
      if (account.failCount) await ctx.db.players.update(account.id, { failCount: 0, failAt: "" });
      const current = await playerOf(ctx, token);
      if (current && current.id !== account.id && !current.username) await mergeGuest(ctx, current, account);
      const t = await newSession(ctx, account.id);
      ctx.invalidate();
      return { token: t };
    }),
    signOut: mutation(async (ctx, token: string) => {
      const s = await sessionOf(ctx, token);
      if (s) await ctx.db.sessions.delete(s.id);
      ctx.invalidate();
      return { token: "" };
    }),
  },
});
