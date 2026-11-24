import { useState } from "preact/hooks";
import { Button, Sticker } from "../components/ui";
import { go } from "../router";

const COLLAGE: [string, string, number, number, number][] = [
  ["sun", "lg", 4, 4, -10], ["turtle", "lg", 38, 0, 8], ["crescent_moon", "lg", 70, 6, -6],
  ["fire", "xl", 30, 26, -4], ["elephant", "lg", 2, 38, 12], ["snowflake", "lg", 72, 38, 9],
  ["smiling_face_with_halo", "lg", 8, 70, -8], ["ant", "", 44, 74, 14], ["balloon", "lg", 68, 68, -12],
];

export function WelcomeScreen() {
  const [step, setStep] = useState(0);
  const done = () => {
    localStorage.setItem("glyph.onboarded", "1");
    go("/", true);
  };
  if (step === 0)
    return (
      <div class="g-screen" style="padding-top:calc(env(safe-area-inset-top) + 40px)">
        <div class="g-center" style="gap:8px">
          <h1 class="g-mark" style="font-size:64px">Glyph</h1>
          <p class="g-body">Four emoji puzzles. New every day.</p>
        </div>
        <div class="g-collage">
          {COLLAGE.map(([id, size, x, y, r]) => (
            <Sticker key={id} id={id} size={size as any} r={r} style={{ left: `${x}%`, top: `${y}%` }} />
          ))}
        </div>
        <Button onClick={() => setStep(1)}>Start</Button>
      </div>
    );
  const row = (name: string, text: string, pics: any) => (
    <div class="g-card" style="display:grid;grid-template-columns:1fr 104px;align-items:center;gap:12px">
      <div class="g-stack" style="gap:2px"><p class="g-body">{name}</p><p class="g-meta">{text}</p></div>
      <div style="justify-self:center">{pics}</div>
    </div>
  );
  const mini = (w: string, hi: number) => <span class="g-mini">{[...w].map((c, i) => <b key={i} style={i === hi ? "background:var(--accent);color:#fff;box-shadow:none" : ""}>{c}</b>)}</span>;
  return (
    <div class="g-screen" style="padding-top:calc(env(safe-area-inset-top) + 24px)">
      <h1 class="g-display" style="text-align:center">Every emoji is a word</h1>
      <div class="g-stack g-grow" style="gap:10px;justify-content:center;padding:20px 0">
        {row("Flip", "Flip the emoji's word. Down becomes Pixar's Up.", <div style="display:flex;gap:6px"><Sticker id="down_arrow" size="sm" r={-6} /><Sticker id="down_arrow" size="sm" r={180} state="faded" /></div>)}
        {row("Pairs", "Match each emoji with its opposite.", <div style="display:flex;gap:6px"><Sticker id="elephant" size="sm" r={-6} /><Sticker id="ant" size="sm" r={8} /></div>)}
        {row("Ladder", "Change one letter at a time to climb from cold to warm.", <div class="g-stack" style="gap:3px">{mini("COLD", -1)}{mini("CORD", 2)}{mini("CARD", 1)}</div>)}
        {row("Chain", "Each word joins the next. Firework, workout, outside.", <div class="g-stack" style="gap:3px;align-items:center">{mini("FIRE", -1)}{mini("WORK", -1)}{mini("OUT", -1)}</div>)}
      </div>
      <Button onClick={done}>Play today's Glyph</Button>
    </div>
  );
}
