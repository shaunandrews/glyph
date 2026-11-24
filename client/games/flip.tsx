import * as R from "../../shared/games/flip";
import type { FlipRound } from "../../shared/types";
import { LetterSlots, Sticker } from "../components/ui";
import { Bottom, Middle, ProgressRow, useNotice, type BoardProps } from "./frame";

export function FlipBoard({ puzzle, state, update, over, onResults }: BoardProps<FlipRound[], R.FlipState>) {
  const [notice, show] = useNotice();
  const i = Math.min(state.round, puzzle.length - 1);
  const r = puzzle[i];
  const solved = state.solved || over;
  const options = [
    ...(state.flipped.length < r.clues.length
      ? [{ label: "Show a word", meta: "Turn over an emoji. Its sticker isn't earned.", run: () => update(R.flipCard(state, r.clues.findIndex((_, k) => !state.flipped.includes(k)))) }]
      : []),
    ...(!state.choices ? [{ label: "Show the choices", meta: "Pick from four answers", run: () => update(R.showChoices(state)) }] : []),
    { label: "Give up this round", meta: "See the answer. Your streak still counts.", run: () => update(R.giveUp(puzzle, state)) },
  ];
  return (
    <>
      <ProgressRow text={R.progress(puzzle, state)} notice={notice} />
      <Middle>
        <p class="g-meta">{r.topic}</p>
        <div style="display:flex;gap:20px;justify-content:center">
          {r.clues.map((c, k) => {
            const shown = solved || state.flipped.includes(k);
            return (
              <button key={`${i}-${k}`} class="g-flipcard" type="button" onClick={() => !shown && update(R.flipCard(state, k))}>
                <Sticker id={c.s} size="lg" />
                {shown ? <span class="g-meta">{solved ? `${c.w} → ${c.o}` : c.w}</span> : null}
              </button>
            );
          })}
        </div>
        <LetterSlots
          answer={r.answer}
          solved={solved}
          small={r.answer.length > 10}
          autoFocus={!state.choices}
          resetKey={`flip-${i}`}
          onFull={(t) => {
            const res = R.guess(puzzle, state, t);
            if (res.ok) update(res.state);
            else show("Not it");
            return res.ok;
          }}
        />
        {state.choices && !solved && (
          <div class="g-choices" style="width:100%">
            {r.choices.map((c) => (
              <button
                key={c}
                type="button"
                class={`g-choice ${state.wrong.includes(c) ? "wrong" : ""}`}
                onClick={() => {
                  const res = R.pickChoice(puzzle, state, c);
                  update(res.state);
                  if (!res.ok) show("Not it");
                }}
              >
                {c}
              </button>
            ))}
          </div>
        )}
      </Middle>
      <Bottom over={over} onResults={onResults} options={options} next={state.solved && !over ? { label: "Next round", run: () => update(R.next(state)) } : null} />
    </>
  );
}
