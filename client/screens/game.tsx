// One game: the frame, the board, the help sheet, and Game done.
import { useEffect, useRef, useState } from "preact/hooks";
import { errorText, useDay, useGameCalls, useMe } from "../backend/index";
import { RULES } from "../../shared/games/index";
import { BY_ID } from "../../shared/stickers";
import { GAME_NAMES, GAMES, type GameId } from "../../shared/types";
import { Button, Header, IconButton, Sheet, Squares, Sticker, share } from "../components/ui";
import { go } from "../router";
import { FlipBoard } from "../games/flip";
import { PairsBoard } from "../games/pairs";
import { LadderBoard } from "../games/ladder";
import { ChainBoard } from "../games/chain";
import { headline, isFinished, shareText } from "./shared";

const BOARDS: Record<GameId, any> = { flip: FlipBoard, pairs: PairsBoard, ladder: LadderBoard, chain: ChainBoard };

const HELP: Record<GameId, { example: [string, string][]; lines: string[] }> = {
  flip: {
    example: [["down_arrow", "down → up"]],
    lines: ["Every emoji stands for a word. Flip each word to its opposite and they spell the answer.", "⬇️ is down, so the Pixar film is Up.", "Type the answer. Tap an emoji to see its word if you need it."],
  },
  pairs: {
    example: [["elephant", "big"], ["ant", "small"]],
    lines: ["Every emoji stands for a word. Find the eight pairs of opposites, like big and small.", "Tap an emoji, then its opposite. Some look like a pair and aren't.", "Four wrong pairs and the game ends."],
  },
  ladder: {
    example: [["electric_plug", "cold → cord"]],
    lines: ["Climb from the top word to the bottom one, changing one letter on each rung.", "Each rung's emoji is a clue to its word: 🔌 turns COLD into CORD."],
  },
  chain: {
    example: [["fire", "fire"], ["motorway", "way"]],
    lines: ["Each word joins the next to make a new word: fire + work, work + out, out + side.", "Fill in the words between the two ends. A wrong guess shows another letter."],
  },
};

function HelpSheet({ game, onClose }: { game: GameId; onClose: () => void }) {
  const h = HELP[game];
  return (
    <Sheet onClose={onClose}>
      <div style="display:flex;justify-content:center;gap:8px;padding-top:8px">
        {h.example.map(([s, w], i) => <Sticker key={i} id={s} size="lg" word={w} i={i} />)}
      </div>
      <div class="g-stack" style="gap:12px">
        <h1 class="g-display">{GAME_NAMES[game]}</h1>
        {h.lines.map((l, i) => <p key={i} class="g-body">{l}</p>)}
      </div>
      <Button onClick={onClose}>Play</Button>
    </Sheet>
  );
}

const localKey = (date: string, game: string) => `glyph.play.${date}.${game}`;

export function GameScreen({ date, game }: { date: string; game: GameId }) {
  const data = useDay(date);
  const me = useMe();
  const calls = useGameCalls();
  const [state, setState] = useState<any>(null);
  const [finished, setFinished] = useState(false);
  const [showDone, setShowDone] = useState(false);
  const [error, setError] = useState("");
  const [help, setHelp] = useState(false);
  const rev = useRef(0);
  const owned = useRef<Set<string> | null>(null);
  const day = data?.day ?? null;
  const puzzle = day ? day[game] : null;
  const rules = RULES[game];

  useEffect(() => { if (me && !owned.current) owned.current = new Set(me.stickers.map((s) => s.sticker)); }, [me]);

  // Pick up where this game was left: a finished play wins, then whichever copy has the higher rev.
  useEffect(() => {
    if (state || !data || !puzzle) return;
    const server = data.plays[game];
    let local: { state: any; rev: number } | null = null;
    try { local = JSON.parse(localStorage.getItem(localKey(date, game)) || "null"); } catch {}
    if (server && isFinished(server)) {
      setState(server.state);
      rev.current = server.rev;
      setFinished(true);
      setShowDone(true);
      return;
    }
    let s = rules.init();
    if (local && (!server || local.rev > server.rev)) { s = local.state; rev.current = local.rev; }
    else if (server?.state) { s = server.state; rev.current = server.rev; }
    setState(s);
    if (rules.isOver(puzzle, s)) {
      // Finished here but never reached the server (closed tab, lost connection): send it now.
      setFinished(true);
      calls.finish(date, game, s, rev.current).catch((e) => setError(errorText(e)));
      return;
    }
    if (!server) calls.start(date, game).catch(() => {});
    if (!localStorage.getItem(`glyph.help.${game}`)) { setHelp(true); localStorage.setItem(`glyph.help.${game}`, "1"); }
  }, [data, puzzle]);

  function update(s: any) {
    if (finished) return;
    setState(s);
    rev.current += 1;
    const r = rev.current;
    try { localStorage.setItem(localKey(date, game), JSON.stringify({ state: s, rev: r })); } catch {}
    if (rules.isOver(puzzle, s)) {
      setFinished(true);
      calls.finish(date, game, s, r).catch((e) => setError(errorText(e)));
    } else calls.save(date, game, s, r);
  }

  const back = <IconButton icon="back" label="Back" onClick={() => go(data && data.date !== data.today ? "/" : "/")} />;
  if (!data || !puzzle || !state)
    return (
      <>
        <Header left={back} title={GAME_NAMES[game]} />
        <div class="g-screen g-center">{data && !day ? <p class="g-body">There's no Glyph for that day.</p> : null}</div>
      </>
    );

  if (showDone) {
    const squares = rules.squares(puzzle, state);
    const status = rules.status(puzzle, state);
    const live = data.date === data.today;
    const fresh = live ? (state.clean as string[]).filter((id, i, a) => a.indexOf(id) === i && !(owned.current?.has(id))) : [];
    const words: Record<string, string> = {};
    collectWords(day!, game, words);
    const plays = { ...data.plays, [game]: { ...(data.plays[game] || {}), status, squares, state } as any };
    const next = GAMES.slice(GAMES.indexOf(game) + 1).concat(GAMES.slice(0, GAMES.indexOf(game))).find((g) => !isFinished(plays[g]));
    return (
      <>
        <Header left={back} title={GAME_NAMES[game]} right={<IconButton icon="share" label="Share" onClick={() => share(shareText(data.number, data.streak, plays, game))} />} />
        <div class="g-screen">
          <div class="g-stack" style="gap:8px;margin-top:8px">
            <h1 class="g-display">{headline(game, day!, { status, squares })}</h1>
            <div class="g-between"><p class="g-meta">{live ? `Glyph #${data.number}` : `Glyph #${data.number} · archive`}</p><Squares s={squares} /></div>
          </div>
          <div class="g-grow g-center">
            {fresh.length ? (
              <>
                <div class="g-pile">{fresh.slice(0, 6).map((id, i) => <Sticker key={id} id={id} size={fresh.length > 3 ? "md" : "lg"} word={words[id] || BY_ID[id]?.name.toLowerCase()} i={i} />)}</div>
                <p class="g-body">{fresh.length === 1 ? "1 new sticker" : `${fresh.length} new stickers`}</p>
              </>
            ) : (
              <p class="g-meta">{live ? "No new stickers this time" : "Archive days don't earn stickers"}</p>
            )}
          </div>
          {error && <p class="g-meta g-danger" style="margin-bottom:8px">{error}</p>}
          <div class="g-stack">
            {next ? <Button onClick={() => go(`/play/${data.date}/${next}`)}>Next: {GAME_NAMES[next]}</Button> : <Button onClick={() => go("/")}>See your day</Button>}
            <Button quiet onClick={() => setShowDone(false)}>See the board</Button>
          </div>
        </div>
      </>
    );
  }

  const Board = BOARDS[game];
  return (
    <>
      <Header left={back} title={GAME_NAMES[game]} right={<IconButton icon="help" label="How to play" onClick={() => setHelp(true)} />} />
      <div class="g-screen">
        <Board puzzle={puzzle} state={state} update={update} over={finished} onResults={() => setShowDone(true)} />
      </div>
      {help && <HelpSheet game={game} onClose={() => setHelp(false)} />}
    </>
  );
}

function collectWords(day: any, game: GameId, out: Record<string, string>) {
  if (game === "flip") for (const r of day.flip) for (const c of r.clues) out[c.s] = c.w;
  if (game === "pairs") for (const [a, b] of day.pairs.pairs) { out[a.s] = a.w; out[b.s] = b.w; }
  if (game === "ladder") for (const l of day.ladder) for (const r of l) if (r.s) out[r.s] = r.w.toLowerCase();
  if (game === "chain") for (const l of day.chain.links) if (l.s) out[l.s] = l.w.toLowerCase();
}
