// Glyph's data layer: the only client code (with live.ts) that knows the backend is Zero.
// Screens call these hooks and functions; every call carries Glyph's own session token.
import { useMutation, useQuery } from "@spacefast/zero/client";
import { useEffect, useState } from "preact/hooks";
import { startLive } from "./live";
import { glyphDate } from "../../shared/day";
import type { Day, GameId, Play } from "../../shared/types";

startLive();

const KEY = "glyph.session";
const listeners = new Set<() => void>();
export const getToken = () => (typeof localStorage === "undefined" ? "" : localStorage.getItem(KEY) || "");
function setToken(t: string) {
  if (t === getToken()) return;
  if (t) localStorage.setItem(KEY, t);
  else localStorage.removeItem(KEY);
  listeners.forEach((f) => f());
}
export function useToken(): string {
  const [t, set] = useState(getToken());
  useEffect(() => {
    const f = () => set(getToken());
    listeners.add(f);
    return () => void listeners.delete(f);
  }, []);
  return t;
}

// ---------- time ----------
let offset = 0; // server time minus this device's time, from the latest fresh answer
export const serverNow = () => Date.now() + offset;
export const clientToday = () => glyphDate(serverNow());

// ---------- queries ----------
export type TodayData = {
  now: number;
  today: string;
  date: string;
  number: number;
  day: Day | null;
  plays: Partial<Record<GameId, Play>>;
  streak: number;
  best: number;
  signedIn: boolean;
};

/** One date's puzzles and this player's plays. Shows the last cached answer while loading. */
export function useDay(date: string): TodayData | undefined {
  const token = useToken();
  const fresh = useQuery<TodayData>("today", token, date);
  const cacheKey = `glyph.day.${date}`;
  useEffect(() => {
    if (!fresh) return;
    offset = fresh.now - Date.now();
    try { localStorage.setItem(cacheKey, JSON.stringify(fresh)); } catch {}
  }, [fresh]);
  if (fresh) return fresh;
  try {
    const c = localStorage.getItem(cacheKey);
    return c ? JSON.parse(c) : undefined;
  } catch {
    return undefined;
  }
}

export type MeData = { username: string; streak: number; best: number; days: number; games: number; stickers: { sticker: string; date: string }[] };
export function useMe(): MeData | undefined {
  return useQuery<MeData>("me", useToken());
}

// ---------- mutations ----------
type Call = (...args: any[]) => Promise<{ token: string }>;
function useCall(name: string) {
  const m = useMutation<any[], { token: string }>(name) as Call;
  return async (...args: any[]) => {
    const r: any = await m(getToken(), ...args);
    if (r && typeof r.token === "string") setToken(r.token);
    if (r?.error) throw new Error(r.error);
    return r;
  };
}

export function useGameCalls() {
  const start = useCall("startGame");
  const save = useCall("saveGame");
  const finish = useCall("finishGame");
  return {
    start: (date: string, game: GameId) => start(date, game),
    save: (date: string, game: GameId, state: unknown, rev: number) => save(date, game, JSON.stringify(state), rev).catch(() => {}),
    finish: (date: string, game: GameId, state: unknown, rev: number) => finish(date, game, JSON.stringify(state), rev),
  };
}

export function useAccountCalls() {
  const create = useCall("createAccount");
  const signIn = useCall("signIn");
  const signOut = useCall("signOut");
  return {
    createAccount: (username: string, password: string) => create(username, password),
    signIn: (username: string, password: string) => signIn(username, password),
    signOut: async () => {
      await signOut().catch(() => {});
      // This device's copies of games and days belong to the account just signed out of.
      for (const k of Object.keys(localStorage)) if (k.startsWith("glyph.play.") || k.startsWith("glyph.day.")) localStorage.removeItem(k);
      setToken("");
    },
  };
}

/** Clean an error from the server into its message. */
export const errorText = (e: unknown) =>
  e instanceof Error ? e.message.replace(/^.*?Error:\s*/, "") : "Something went wrong. Try again.";
