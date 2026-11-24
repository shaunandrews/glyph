import { useState } from "preact/hooks";
import * as R from "../../shared/games/pairs";
import type { PairsPuzzle } from "../../shared/types";
import { Sticker } from "../components/ui";
import { Bottom, ProgressRow, useNotice, type BoardProps } from "./frame";

export function PairsBoard({ puzzle, state, update, over, onResults }: BoardProps<PairsPuzzle, R.PairsState>) {
  const [picked, setPicked] = useState<string | null>(null);
  const [wrong, setWrong] = useState<string[]>([]);
  const [peek, setPeek] = useState(false);
  const [notice, show] = useNotice();
  const foundIds = new Set(state.found.flatMap((i) => [puzzle.pairs[i][0].s, puzzle.pairs[i][1].s]));
  const board = puzzle.order.filter((id) => !foundIds.has(id));
  function tap(id: string) {
    if (over) return;
    if (peek) {
      setPeek(false);
      update(R.showWord(state, id));
      return;
    }
    if (!picked) return setPicked(id);
    if (picked === id) return setPicked(null);
    const res = R.tryPair(puzzle, state, picked, id);
    setPicked(null);
    if (!res.ok) {
      setWrong([picked, id]);
      show("Not a pair");
      setTimeout(() => setWrong([]), 600);
    }
    update(res.state);
  }
  const left = R.TRIES - state.misses.length;
  const options = [
    { label: "Show one word", meta: "Pick an emoji to see what it stands for", run: () => { setPeek(true); show("Tap an emoji"); } },
    { label: "Show one pair", meta: "That pair earns no sticker", run: () => update(R.showPair(puzzle, state)) },
    { label: "Give up", meta: "See every pair. Your streak still counts.", run: () => update(R.giveUp(puzzle, state)) },
  ];
  const statusText = over && state.misses.length >= R.TRIES ? "Out of tries" : R.progress(puzzle, state);
  return (
    <>
      <ProgressRow text={statusText} notice={notice} tries={{ left, total: R.TRIES }} />
      <div class="g-board">
        {(over ? [] : board).map((id) => (
          <div class="g-cell" key={id}>
            <Sticker
              id={id}
              word={state.words.includes(id) ? R.wordOf(puzzle, id) : undefined}
              state={wrong.includes(id) ? "wrong" : picked === id ? "picked" : ""}
              onClick={() => tap(id)}
            />
          </div>
        ))}
        {over && (
          <div class="g-shelf" style="width:100%;margin:0">
            {puzzle.pairs
              .map((p, i) => ({ p, i }))
              .filter(({ i }) => !state.found.includes(i))
              .map(({ p, i }) => (
                <div class="g-found" key={i}>
                  <div class="pics">
                    <Sticker id={p[0].s} size="sm" />
                    <Sticker id={p[1].s} size="sm" />
                  </div>
                  <span class="g-meta">
                    {p[0].w} · {p[1].w}
                  </span>
                </div>
              ))}
          </div>
        )}
      </div>
      <div class="g-shelf">
        {puzzle.pairs.map((_, k) => {
          const i = state.found[k];
          if (i === undefined) return <div class="g-found empty" key={k} />;
          const [a, b] = puzzle.pairs[i];
          return (
            <div class="g-found" key={k}>
              <div class="pics">
                <Sticker id={a.s} size="xs" />
                <Sticker id={b.s} size="xs" />
              </div>
              <span class="g-meta">
                {a.w} · {b.w}
              </span>
            </div>
          );
        })}
      </div>
      <Bottom over={over} onResults={onResults} options={options} />
    </>
  );
}
