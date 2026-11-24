// Glyph's components: one per job (docs/components.md).
import type { ComponentChildren } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import { img } from "../../shared/stickers";
import { go } from "../router";

const tilt = (id: string, i = 0) => {
  let h = i * 7;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) % 997;
  return (h % 15) - 7;
};

export function Sticker(props: {
  id: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  word?: string;
  state?: "picked" | "wrong" | "locked" | "faded" | "";
  r?: number;
  i?: number;
  style?: any;
  onClick?: () => void;
}) {
  const { id, size = "", word, state = "", r, i = 0, style, onClick } = props;
  const Tag: any = onClick ? "button" : "span";
  return (
    <Tag class={`g-st ${size} ${state}`} style={{ "--r": `${r ?? tilt(id, i)}deg`, ...style }} onClick={onClick} type={onClick ? "button" : undefined}>
      <img src={img(id)} alt={state === "locked" ? "" : id.replace(/_/g, " ")} draggable={false} />
      {word ? <span class="g-meta">{word}</span> : null}
    </Tag>
  );
}

const ICONS = {
  back: <path d="M13 4l-6 6 6 6" />,
  help: (
    <>
      <path d="M7.5 7.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5V12" />
      <circle cx="10" cy="15.5" r=".6" />
    </>
  ),
  share: <path d="M10 13V3M6 7l4-4 4 4M4 11v5h12v-5" />,
  close: <path d="M5 5l10 10M15 5L5 15" />,
};
export function IconButton(props: { icon: keyof typeof ICONS; label: string; onClick: () => void }) {
  return (
    <button class="g-icon" aria-label={props.label} onClick={props.onClick} type="button">
      <svg viewBox="0 0 20 20">{ICONS[props.icon]}</svg>
    </button>
  );
}

export function Header(props: { left?: ComponentChildren; title?: string; right?: ComponentChildren }) {
  return (
    <header class="g-header">
      <div>{props.left ?? <span style="width:44px;display:block" />}</div>
      <p class="g-body">{props.title ?? ""}</p>
      <div>{props.right ?? <span style="width:44px;display:block" />}</div>
    </header>
  );
}

export const Badge = (props: { children: ComponentChildren }) => <span class="g-badge">{props.children}</span>;

export function Button(props: { children: ComponentChildren; quiet?: boolean; onClick?: () => void; type?: "button" | "submit"; disabled?: boolean; style?: any }) {
  return (
    <button class={`g-btn ${props.quiet ? "quiet" : ""}`} type={props.type ?? "button"} onClick={props.onClick} disabled={props.disabled} style={props.style}>
      {props.children}
    </button>
  );
}

export function Squares(props: { s: string }) {
  return (
    <span class="g-sq" aria-label="result">
      {[...props.s].map((c, i) => (c === " " ? <i key={i} class="gap" /> : <i key={i} class={c} />))}
    </span>
  );
}

export function TabBar(props: { on: "today" | "stickers" | "me" }) {
  const tab = (id: "today" | "stickers" | "me", label: string, sticker: string, path: string) => (
    <button class={props.on === id ? "on" : ""} onClick={() => go(path)} type="button">
      <Sticker id={sticker} size="xs" />
      <span>{label}</span>
    </button>
  );
  return (
    <nav class="g-tabs">
      {tab("today", "Today", "sun", "/")}
      {tab("stickers", "Stickers", "balloon", "/stickers")}
      {tab("me", "Me", "owl", "/me")}
    </nav>
  );
}

export function Sheet(props: { children: ComponentChildren; onClose: () => void }) {
  useEffect(() => {
    const f = (e: KeyboardEvent) => e.key === "Escape" && props.onClose();
    addEventListener("keydown", f);
    return () => removeEventListener("keydown", f);
  }, []);
  return (
    <>
      <div class="g-dim" onClick={props.onClose} />
      <div class="g-sheet" role="dialog">
        <div class="g-grabber" />
        {props.children}
      </div>
    </>
  );
}

export function ProgressBar(props: { label: string; value: number }) {
  return (
    <div class="g-stack" style="gap:6px">
      <p class="g-meta">{props.label}</p>
      <div class="g-bar">
        <b style={{ width: `${Math.round(props.value * 100)}%` }} />
      </div>
    </div>
  );
}

/**
 * Letter slots with a real (invisible) input on top, so the phone keyboard works.
 * `answer` sets the shape (spaces split words). `fixed` letters are given; `hint` shows one letter.
 * Calls onFull when every slot is filled; the parent decides right or wrong.
 */
export function LetterSlots(props: {
  answer: string;
  fixed?: number; // leading letters given (Chain)
  hint?: { at: number; letter: string } | null;
  solved?: boolean;
  idle?: boolean; // shape only, not typeable yet
  given?: boolean; // shown as a given word, not an answer
  small?: boolean;
  autoFocus?: boolean;
  onFull?: (typed: string) => boolean; // returns true when right
  resetKey?: string;
}) {
  const shape = props.answer.toUpperCase().replace(/[^A-Z ]/g, "");
  const total = shape.replace(/ /g, "").length;
  const fixed = props.fixed ?? 0;
  const given = shape.replace(/ /g, "").slice(0, fixed);
  const [typed, setTyped] = useState("");
  const [shake, setShake] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    setTyped("");
    if (props.autoFocus && !props.solved) setTimeout(() => input.current?.focus(), 50);
  }, [props.resetKey, props.answer, fixed]);
  const value = (given + typed).slice(0, total);
  function onInput(e: any) {
    const t = String(e.currentTarget.value).toUpperCase().replace(/[^A-Z]/g, "").slice(0, total - fixed);
    setTyped(t);
    e.currentTarget.value = t;
    if (t.length === total - fixed && props.onFull) {
      const ok = props.onFull(given + t);
      if (!ok) {
        setShake(true);
        setTimeout(() => {
          setShake(false);
          setTyped("");
          if (input.current) input.current.value = "";
        }, 450);
      }
    }
  }
  let k = 0;
  const words = shape.split(" ").map((w) =>
    [...w].map(() => {
      const i = k++;
      const ch = props.idle ? "" : props.solved || props.given ? props.answer.replace(/[^A-Za-z]/g, "").toUpperCase()[i] : value[i];
      const isHint = !ch && props.hint && props.hint.at === i;
      const cls = props.given ? "given" : props.solved ? "ok" : props.idle ? "" : i < fixed ? "given" : isHint ? "hint" : i === value.length ? "cur" : "";
      return (
        <b key={i} class={cls}>
          {ch || (isHint ? props.hint!.letter : "")}
        </b>
      );
    }),
  );
  return (
    <div class={`g-slots ${props.small ? "small" : ""} ${shake ? "shake" : ""}`} onClick={() => input.current?.focus()}>
      {words.map((w, i) => (
        <span key={i} class="word">
          {w}
        </span>
      ))}
      {!props.solved && !props.idle && !props.given && (
        <input
          ref={input}
          onInput={onInput}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="characters"
          spellcheck={false}
          enterKeyHint="done"
          aria-label="Your answer"
        />
      )}
    </div>
  );
}

export function share(text: string) {
  if (navigator.share) return navigator.share({ text }).catch(() => {});
  return navigator.clipboard?.writeText(text);
}
