import * as R from "../../shared/games/chain";
import type { ChainPuzzle } from "../../shared/types";
import { LetterSlots, Squares, Sticker } from "../components/ui";
import { Bottom, Middle, ProgressRow, useNotice, type BoardProps } from "./frame";

export function ChainBoard({ puzzle, state, update, over, onResults }: BoardProps<ChainPuzzle, R.ChainState>) {
  const [notice, show] = useNotice();
  const links = puzzle.links;
  const first = links[0], last = links[links.length - 1];
  const options = [
    { label: "Show the next letter", meta: "The same as a wrong guess", run: () => update(R.showLetter(puzzle, state)) },
    { label: "Give up this word", meta: "See it and move on. Your streak still counts.", run: () => update(R.giveUpWord(puzzle, state)) },
  ];
  return (
    <>
      <ProgressRow text={R.progress(puzzle, state)} notice={notice} />
      <Middle>
        <Sticker id={first.s!} size="md" word={first.w.toLowerCase()} />
        <div class="g-rungs">
          {links.slice(1, -1).map((l, j) => {
            const k = j + 1;
            const res = state.results[j];
            const current = !over && k === state.link;
            return (
              <div key={k} style={{ display: "grid", gridTemplateColumns: "14px auto 14px", alignItems: "center", gap: "10px", opacity: !res && !current ? 0.45 : 1 }}>
                <span />
                {current ? (
                  <LetterSlots
                    answer={l.w}
                    fixed={R.shownCount(state, k)}
                    autoFocus
                    resetKey={`${k}-${R.shownCount(state, k)}`}
                    onFull={(t) => {
                      const g = R.guess(puzzle, state, t);
                      update(g.state);
                      if (!g.ok) show(g.lost ? `It was ${l.w.toLowerCase()}` : "Not it. Here's a letter.");
                      return g.ok;
                    }}
                  />
                ) : res ? (
                  <LetterSlots answer={l.w} solved />
                ) : (
                  <LetterSlots answer={l.w} idle />
                )}
                {res ? <Squares s={res} /> : <span />}
              </div>
            );
          })}
        </div>
        <Sticker id={last.s!} size="md" word={last.w.toLowerCase()} />
      </Middle>
      <Bottom over={over} onResults={onResults} options={options} />
    </>
  );
}
