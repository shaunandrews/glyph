import { useEffect, useState } from "preact/hooks";
import { clientToday, serverNow, useDay, useMe } from "../backend/index";
import { nextRollover, weekday } from "../../shared/day";
import { sizeOf, stickersIn } from "../../shared/games/index";
import { img } from "../../shared/stickers";
import { GAME_NAMES, GAMES, type Day, type GameId, type Play } from "../../shared/types";
import { Badge, Button, Header, Squares, Sticker, TabBar, share } from "../components/ui";
import { go } from "../router";
import { SignIn } from "./signin";
import { headline, isFinished, progressOf, shareText } from "./shared";

/** Re-renders at the rollover and when the app comes back to the front. */
export function useClock() {
  const [, tick] = useState(0);
  useEffect(() => {
    const f = () => tick((n) => n + 1);
    const t = setTimeout(f, Math.max(1000, nextRollover(serverNow()) - serverNow() + 500));
    const v = () => !document.hidden && f();
    document.addEventListener("visibilitychange", v);
    return () => {
      clearTimeout(t);
      document.removeEventListener("visibilitychange", v);
    };
  });
}

function Peek({ game, day }: { game: GameId; day: Day }) {
  if (game === "flip") return <div class="g-peek">{day.flip[0].clues.map((c, i) => <Sticker key={i} id={c.s} i={i} />)}</div>;
  if (game === "pairs") return <div class="g-peek fan">{day.pairs.order.slice(0, 4).map((id, i) => <Sticker key={id} id={id} i={i} />)}</div>;
  if (game === "ladder") {
    const l = day.ladder[0];
    const mini = (w: string, blank = false) => <span class="g-mini">{[...w].map((c, i) => <b key={i} class={blank ? "blank" : ""}>{blank ? "" : c}</b>)}</span>;
    return <div class="g-peek col">{mini(l[0].w)}{l.slice(1, -1).map((r, i) => <span key={i}>{mini(r.w, true)}</span>)}{mini(l[l.length - 1].w)}</div>;
  }
  const links = day.chain.links;
  return (
    <div class="g-peek">
      <Sticker id={links[0].s!} />
      <span class="g-dots3"><i /><i /><i /></span>
      <Sticker id={links[links.length - 1].s!} />
    </div>
  );
}

function GameCard({ game, day, play, date }: { game: GameId; day: Day; play?: Play; date: string }) {
  const open = () => go(`/play/${date}/${game}`);
  if (isFinished(play))
    return (
      <button class="g-card g-gcard done" onClick={open} type="button">
        <span class="g-stack" style="gap:6px">
          <span class="g-between"><span class="g-body">{GAME_NAMES[game]}</span><Squares s={play!.squares} /></span>
          <span class="g-meta">{headline(game, day, play!)}</span>
        </span>
      </button>
    );
  const going = !!play?.state;
  let meta = sizeOf(day, game);
  if (going) {
    meta = progressOf(game, day, play!);
    if (game === "pairs" && play!.state.misses?.length) meta += ` · ${play!.state.misses.length} ${play!.state.misses.length === 1 ? "miss" : "misses"}`;
  }
  return (
    <button class={`g-card g-gcard ${going ? "going" : ""}`} onClick={open} type="button">
      <span class="g-stack" style="gap:2px">
        <span class="g-body">{GAME_NAMES[game]}</span>
        <span class="g-meta">{meta}</span>
      </span>
      <Peek game={game} day={day} />
    </button>
  );
}

const loaded = new Set<string>();
/** Fetch every sticker in the day's puzzles, so boards draw at once. */
function preload(day: Day) {
  for (const g of GAMES)
    for (const id of stickersIn(day, g))
      if (!loaded.has(id)) {
        loaded.add(id);
        new Image().src = img(id);
      }
}

function Countdown() {
  const [, tick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => !document.hidden && tick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);
  const ms = Math.max(0, nextRollover(serverNow()) - serverNow());
  const s = Math.floor(ms / 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return <p class="g-meta">Next Glyph in {Math.floor(s / 3600)}:{pad(Math.floor(s / 60) % 60)}:{pad(s % 60)}</p>;
}

export function TodayScreen() {
  useClock();
  const date = clientToday();
  const data = useDay(date);
  const me = useMe();
  const streak = data?.streak ?? 0;
  const header = <Header left={<span class="g-mark">Glyph</span>} right={streak ? <Badge>🔥 {streak}</Badge> : undefined} />;
  if (!data) {
    return (
      <>
        {header}
        <div class="g-screen"><div class="g-cards">{GAMES.map((g) => <div key={g} class="g-card g-gcard"><span class="g-body">{GAME_NAMES[g]}</span></div>)}</div></div>
        <TabBar on="today" />
      </>
    );
  }
  const day = data.day;
  if (!day) {
    return (
      <>
        {header}
        <div class="g-screen g-center"><p class="g-body">Today's Glyph isn't ready yet.</p></div>
        <TabBar on="today" />
      </>
    );
  }
  preload(day);
  const all = GAMES.every((g) => isFinished(data.plays[g]));
  if (all) {
    const today = (me?.stickers ?? []).filter((s) => s.date === data.date).map((s) => s.sticker);
    return (
      <>
        {header}
        <div class="g-screen" style="gap:12px">
          <div class="g-center" style="gap:4px;margin:4px 0 8px">
            <Sticker id="fire" size="xl" r={-6} />
            <h1 class="g-display" style="margin-top:10px">{streak === 1 ? "1 day" : `${streak} days`}</h1>
            <p class="g-meta">{data.best > streak ? `Your longest is ${data.best}` : `Glyph #${data.number} · ${weekday(data.date)}`}</p>
          </div>
          <div class="g-list">
            {GAMES.map((g) => (
              <button key={g} class="g-row" type="button" onClick={() => go(`/play/${data.date}/${g}`)}>
                <span class="g-body">{GAME_NAMES[g]}</span>
                <Squares s={data.plays[g]!.squares} />
              </button>
            ))}
          </div>
          {today.length > 0 && (
            <div class="g-card g-between">
              <p class="g-body">{today.length === 1 ? "1 new sticker" : `${today.length} new stickers`}</p>
              <div style="display:flex">{today.slice(0, 7).map((id, i) => <Sticker key={id} id={id} size="xs" i={i} style={i ? { marginLeft: "-8px" } : undefined} />)}</div>
            </div>
          )}
          <Button onClick={() => share(shareText(data.number, streak, data.plays))}>Share</Button>
          {!data.signedIn && <SignIn />}
          <div class="g-between" style="padding:4px 4px 0"><Countdown /></div>
        </div>
        <TabBar on="today" />
      </>
    );
  }
  return (
    <>
      {header}
      <div class="g-screen">
        <div class="g-stack" style="gap:2px;margin:2px 0 16px">
          <h1 class="g-display">{weekday(data.date)}</h1>
          <p class="g-meta">Glyph #{data.number}</p>
        </div>
        <div class="g-cards">{GAMES.map((g) => <GameCard key={g} game={g} day={day} play={data.plays[g]} date={data.date} />)}</div>
      </div>
      <TabBar on="today" />
    </>
  );
}
