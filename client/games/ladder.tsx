import * as R from "../../shared/games/ladder";
import type { Rung } from "../../shared/types";
import { LetterSlots, Squares, Sticker } from "../components/ui";
import { Bottom, Middle, ProgressRow, useNotice, type BoardProps } from "./frame";

export function LadderBoard({ puzzle, state, update, over, onResults }: BoardProps<Rung[][], R.LadderState>) {
  const [notice, show] = useNotice();
  const li = Math.min(state.ladder, puzzle.length - 1);
  const rungs = puzzle[li];
  const done = over || state.ladder > li;
  const results = state.results[li] || [];
  const key = `${state.ladder}-${state.rung}`;
  const help = state.help[key] || 0;
  const options = [
    ...(help < 1 ? [{ label: "Show the letter that changes", meta: "That rung's sticker isn't earned", run: () => update(R.showLetter(state)) }] : []),
    { label: "Show the rung", meta: "Fill in this word", run: () => update(R.showRung(puzzle, state)) },
    { label: "Give up this ladder", meta: "See the rest. Your streak still counts.", run: () => update(R.giveUp(puzzle, state)) },
  ];
  return (
    <>
      <ProgressRow text={R.progress(puzzle, state)} notice={notice} />
      <Middle>
        <div class="g-rungs">
          {rungs.map((r, k) => {
            const end = k === 0 || k === rungs.length - 1;
            const solvedHere = end || done || k < state.rung;
            const current = !done && k === state.rung;
            const res = k > 0 && k < rungs.length - 1 ? results[k - 1] : undefined;
            const at = current && help >= 1 ? R.changed(rungs[k - 1].w, r.w) : -1;
            return (
              <div class="g-rung" key={`${li}-${k}`} style={{ opacity: !solvedHere && !current ? 0.45 : 1 }}>
                {r.s ? <Sticker id={r.s} size="sm" /> : <span />}
                <div>
                  {end ? (
                    <LetterSlots answer={r.w} given />
                  ) : current ? (
                    <LetterSlots
                      answer={r.w}
                      autoFocus
                      resetKey={key}
                      hint={at >= 0 ? { at, letter: r.w[at] } : null}
                      onFull={(t) => {
                        const g = R.guess(puzzle, state, t);
                        if (g.ok) update(g.state);
                        else show("Not it");
                        return g.ok;
                      }}
                    />
                  ) : solvedHere ? (
                    <LetterSlots answer={r.w} solved />
                  ) : (
                    <LetterSlots answer={r.w} idle />
                  )}
                </div>
                {res ? <Squares s={res} /> : <span />}
              </div>
            );
          })}
        </div>
      </Middle>
      <Bottom over={over} onResults={onResults} options={options} />
    </>
  );
}
