// What every game board shares: the progress row, the Stuck sheet and the bottom button.
import type { ComponentChildren } from "preact";
import { useState } from "preact/hooks";
import { Button, Sheet } from "../components/ui";

export type BoardProps<P, S> = {
  puzzle: P;
  state: S;
  update: (s: S) => void;
  over: boolean;
  onResults: () => void;
};

export function ProgressRow(props: { text: string; notice?: string | null; tries?: { left: number; total: number } }) {
  return (
    <div class="g-progress">
      {props.notice ? <p class="g-body g-danger">{props.notice}</p> : <p class="g-body">{props.text}</p>}
      {props.tries ? (
        <div class="g-tries" aria-label={`${props.tries.left} tries left`}>
          {Array.from({ length: props.tries.total }, (_, i) => (
            <i key={i} class={i < props.tries!.left ? "" : "off"} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export type StuckOption = { label: string; meta: string; run: () => void };

export function Bottom(props: { over: boolean; onResults: () => void; options: StuckOption[]; next?: { label: string; run: () => void } | null }) {
  const [open, setOpen] = useState(false);
  if (props.over) return <Button onClick={props.onResults}>See results</Button>;
  if (props.next) return <Button onClick={props.next.run}>{props.next.label}</Button>;
  return (
    <>
      <Button quiet onClick={() => setOpen(true)}>
        I'm stuck
      </Button>
      {open && (
        <Sheet onClose={() => setOpen(false)}>
          <h1 class="g-display">Stuck?</h1>
          <div class="g-list">
            {props.options.map((o) => (
              <button
                key={o.label}
                class="g-row"
                type="button"
                onClick={() => {
                  setOpen(false);
                  o.run();
                }}
              >
                <span class="g-stack">
                  <span class="g-body">{o.label}</span>
                  <span class="g-meta">{o.meta}</span>
                </span>
              </button>
            ))}
          </div>
          <Button onClick={() => setOpen(false)}>Keep trying</Button>
        </Sheet>
      )}
    </>
  );
}

export function useNotice(): [string | null, (s: string) => void] {
  const [n, set] = useState<string | null>(null);
  const [timer, setTimer] = useState<any>(null);
  return [
    n,
    (s: string) => {
      clearTimeout(timer);
      set(s);
      setTimer(setTimeout(() => set(null), 1600));
    },
  ];
}

export const Middle = (props: { children: ComponentChildren }) => (
  <div class="g-grow g-center" style="gap:24px;padding:12px 0 20px">
    {props.children}
  </div>
);
