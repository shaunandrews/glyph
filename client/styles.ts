// Glyph's styles, from designs v3 and docs/design-system.md. Injected once at boot.
import { FREDOKA } from "./font";

const CSS = `
@font-face{font-family:GFredoka;src:url(data:font/woff2;base64,${FREDOKA}) format("woff2");font-weight:700}
:root{--canvas:#f6f1e7;--surface:#fffcf5;--ink:#22201c;--muted:#6f685d;--line:#e7e0d2;--accent:#7b61ff;--danger:#c8352a;--on-ink:#fff;--edge:#fff;
  --sq-g:#78b159;--sq-y:#fdcb58;--sq-o:#f4900c;--sq-x:#31373d;--sq-r:#dd2e44}
html,body{margin:0;background:var(--canvas);color:var(--ink);-webkit-font-smoothing:antialiased;-webkit-tap-highlight-color:transparent}
body{font:17px/1.4 ui-rounded,-apple-system,system-ui,sans-serif;overscroll-behavior:none}
body::before{content:"";position:fixed;inset:0;pointer-events:none;z-index:0;opacity:.5;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .45  0 0 0 0 .38  0 0 0 0 .25  0 0 0 .09 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")}
button{font:inherit;color:inherit;cursor:pointer}
*{box-sizing:border-box}
.g-app{position:relative;z-index:1;max-width:430px;margin:0 auto;min-height:100dvh;display:flex;flex-direction:column}
.g-screen{flex:1;display:flex;flex-direction:column;padding:4px 20px 20px;min-height:0}
.g-display{font-size:34px;line-height:1.1;font-weight:800;letter-spacing:-.02em;margin:0}
.g-body{font-size:17px;font-weight:600;margin:0}
.g-meta{font-size:14px;font-weight:500;color:var(--muted);margin:0}
.g-danger{color:var(--danger)}
.g-mark{font-family:GFredoka,ui-rounded,system-ui;font-weight:700;font-size:30px;line-height:1}
.g-grow{flex:1}
.g-stack{display:flex;flex-direction:column;gap:8px}
.g-between{display:flex;align-items:center;justify-content:space-between;gap:12px}
.g-center{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:12px}
.g-header{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:8px;padding:calc(env(safe-area-inset-top) + 10px) 20px 10px;min-height:64px}
.g-header .g-body{text-align:center}
.g-icon{width:44px;height:44px;border-radius:22px;background:var(--surface);box-shadow:inset 0 0 0 1.5px var(--line);display:grid;place-items:center;border:0;padding:0}
.g-icon svg{width:20px;height:20px;stroke:var(--ink);stroke-width:2;fill:none;stroke-linecap:round;stroke-linejoin:round}
.g-badge{height:36px;padding:0 14px;border-radius:18px;background:var(--surface);box-shadow:inset 0 0 0 1.5px var(--line);display:inline-flex;align-items:center;font-size:17px;font-weight:600}
.g-btn{height:58px;border-radius:12px;border:0;font-size:17px;font-weight:700;background:var(--ink);color:var(--on-ink);width:100%;flex:none}
.g-btn.quiet{background:transparent;color:var(--ink);box-shadow:inset 0 0 0 2px var(--line)}
.g-btn:disabled{opacity:.5}
.g-card{background:var(--surface);border-radius:12px;padding:16px;box-shadow:inset 0 0 0 1.5px var(--line)}
.g-list{display:flex;flex-direction:column;background:var(--surface);border-radius:12px;box-shadow:inset 0 0 0 1.5px var(--line)}
.g-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 16px;text-align:left;background:none;border:0;width:100%}
.g-list>.g-row+.g-row{box-shadow:inset 0 1.5px 0 var(--line)}
.g-row .g-stack{gap:2px}
/* stickers */
.g-st{display:inline-flex;flex-direction:column;align-items:center;gap:6px;--s:56px;--r:0deg;--e:3px;flex:none;background:none;border:0;padding:0;position:relative}
.g-st img{width:var(--s);height:var(--s);object-fit:contain;transform:rotate(var(--r));transition:transform .18s ease;
  filter:drop-shadow(var(--e) 0 0 var(--edge)) drop-shadow(calc(var(--e)*-1) 0 0 var(--edge)) drop-shadow(0 var(--e) 0 var(--edge)) drop-shadow(0 calc(var(--e)*-1) 0 var(--edge)) drop-shadow(0 5px 7px rgba(60,40,0,.2))}
.g-st.xs{--s:28px;--e:2px}.g-st.sm{--s:40px;--e:2px}.g-st.md{--s:64px}.g-st.lg{--s:104px;--e:4px}.g-st.xl{--s:150px;--e:6px}
.g-st.picked img{transform:rotate(0) scale(1.14) translateY(-6px);filter:drop-shadow(4px 0 0 var(--edge)) drop-shadow(-4px 0 0 var(--edge)) drop-shadow(0 4px 0 var(--edge)) drop-shadow(0 -4px 0 var(--edge)) drop-shadow(3px 0 0 var(--accent)) drop-shadow(-3px 0 0 var(--accent)) drop-shadow(0 3px 0 var(--accent)) drop-shadow(0 -3px 0 var(--accent)) drop-shadow(0 16px 14px rgba(60,40,0,.25))}
.g-st.wrong img{animation:g-shake .4s;filter:drop-shadow(4px 0 0 var(--edge)) drop-shadow(-4px 0 0 var(--edge)) drop-shadow(0 4px 0 var(--edge)) drop-shadow(0 -4px 0 var(--edge)) drop-shadow(3px 0 0 var(--danger)) drop-shadow(-3px 0 0 var(--danger)) drop-shadow(0 3px 0 var(--danger)) drop-shadow(0 -3px 0 var(--danger))}
.g-st.locked img{filter:brightness(0) opacity(.12)}
.g-st.faded{opacity:.25}
.g-st .g-meta{white-space:nowrap}
@keyframes g-shake{0%,100%{translate:0}25%{translate:-6px}75%{translate:6px}}
/* squares */
.g-sq{display:inline-flex;gap:3px;flex-wrap:wrap;justify-content:flex-end;max-width:calc(9 * 17px)}
.g-sq i{width:14px;height:14px;border-radius:3px;display:block}
.g-sq i.g{background:var(--sq-g)}.g-sq i.y{background:var(--sq-y)}.g-sq i.o{background:var(--sq-o)}.g-sq i.x{background:var(--sq-x)}.g-sq i.r{background:var(--sq-r)}
.g-sq i.gap{width:6px}
/* today */
.g-cards{flex:1;display:flex;flex-direction:column;gap:10px;min-height:0}
.g-gcard{flex:1;min-height:92px;display:grid;grid-template-columns:1fr auto;align-items:center;gap:12px;border:0;text-align:left;width:100%}
.g-gcard.done{flex:0 0 auto;min-height:0;display:block}
.g-gcard.going{box-shadow:inset 0 0 0 2px var(--ink)}
.g-peek{display:flex;align-items:center;gap:6px;padding-right:4px}
.g-peek.fan .g-st{--s:46px}.g-peek.fan .g-st+.g-st{margin-left:-12px}
.g-peek.col{flex-direction:column;gap:3px}
.g-dots3{display:flex;gap:4px}.g-dots3 i{width:5px;height:5px;border-radius:3px;background:var(--line)}
.g-mini{display:flex;gap:3px}
.g-mini b{width:20px;height:20px;border-radius:4px;background:var(--canvas);box-shadow:inset 0 0 0 1.5px var(--line);display:grid;place-items:center;font-size:12px;font-weight:800}
.g-mini b.blank{height:8px;opacity:.6}
.g-tabs{position:sticky;bottom:0;display:grid;grid-template-columns:repeat(3,1fr);padding:8px 12px calc(env(safe-area-inset-bottom) + 10px);box-shadow:inset 0 1.5px 0 var(--line);background:var(--surface);z-index:5}
.g-tabs button{display:flex;flex-direction:column;align-items:center;gap:4px;font-size:12px;font-weight:600;color:var(--muted);background:none;border:0}
.g-tabs .g-st{filter:grayscale(1);opacity:.55}
.g-tabs .on{color:var(--ink)}.g-tabs .on .g-st{filter:none;opacity:1}
/* games */
.g-progress{display:flex;align-items:center;justify-content:space-between;min-height:28px}
.g-tries{display:flex;gap:6px}.g-tries i{width:10px;height:10px;border-radius:5px;background:var(--ink)}.g-tries i.off{background:var(--line)}
.g-board{flex:1;display:flex;flex-wrap:wrap;justify-content:center;align-content:center;row-gap:22px;padding:12px 0}
.g-cell{width:25%;display:flex;justify-content:center}
.g-cell .g-st{--s:68px}
.g-shelf{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-bottom:16px}
.g-found{background:var(--surface);border-radius:12px;padding:10px 4px 8px;box-shadow:inset 0 0 0 1.5px var(--line);display:flex;flex-direction:column;align-items:center;gap:6px;min-height:64px}
.g-found .g-meta{font-size:12px;text-align:center;line-height:1.2}
.g-found.empty{background:transparent;box-shadow:inset 0 0 0 2px var(--line)}
.g-found .pics{display:flex;gap:2px}
.g-slots{position:relative;display:flex;flex-wrap:wrap;justify-content:center;column-gap:16px;row-gap:10px}
.g-slots .word{display:flex;gap:4px}
.g-slots b{width:36px;height:44px;border-radius:4px;background:var(--surface);box-shadow:inset 0 0 0 1.5px var(--line);display:grid;place-items:center;font-size:20px;font-weight:800}
.g-slots.small b{width:30px;height:38px;font-size:17px}
.g-slots b.cur{box-shadow:inset 0 0 0 2px var(--accent)}
.g-slots b.given{background:var(--line)}
.g-slots b.hint{color:var(--accent)}
.g-slots b.ok{background:var(--sq-g);color:#fff;box-shadow:none}
.g-slots.shake{animation:g-shake .4s}
.g-slots input{position:absolute;inset:0;opacity:0;font-size:16px;width:100%;height:100%;border:0;caret-color:transparent}
.g-choices{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.g-choice{height:52px;border-radius:12px;border:0;background:var(--surface);box-shadow:inset 0 0 0 1.5px var(--line);font-weight:600;font-size:15px;padding:0 8px}
.g-choice.wrong{color:var(--danger);text-decoration:line-through;opacity:.6}
.g-flipcard{display:flex;flex-direction:column;align-items:center;gap:6px;background:none;border:0;padding:0}
.g-rungs{display:flex;flex-direction:column;gap:10px;align-items:center}
.g-rung{display:grid;grid-template-columns:44px auto 14px;align-items:center;gap:12px}
.g-rung .g-slots b{width:40px;height:44px}
.g-chainends{display:flex;justify-content:space-between;align-items:center}
.g-mid{gap:24px;padding:12px 0 20px;justify-content:safe center;min-height:0}
/* keyboard up: the app shrinks to the space above the keyboard (html.kb, set from visualViewport) */
html.kb,html.kb body{overflow:hidden;height:100%}
html.kb .g-app{position:fixed;left:0;right:0;top:var(--vvt,0px);height:var(--vvh,100dvh);min-height:0;overflow:hidden}
html.kb .g-header{padding-top:calc(env(safe-area-inset-top) + 2px);padding-bottom:2px;min-height:52px}
html.kb .g-screen{padding-bottom:calc(8px + var(--kbpad,0px))}
html.kb .g-mid{gap:8px;padding:2px 0;overflow-y:auto}
html.kb .g-mid .g-st.lg{--s:76px;--e:3px}
html.kb .g-mid .g-st.md{--s:36px;--e:2px}
html.kb .g-mid .g-st.md .g-meta{display:none}
html.kb .g-mid .g-st.sm{--s:30px}
html.kb .g-rungs{gap:4px}
html.kb .g-rung{grid-template-columns:32px auto 14px}
html.kb .g-slots b,html.kb .g-rung .g-slots b,html.kb .g-slots.small b{height:32px;font-size:17px}
html.kb .g-screen{position:relative}
html.kb .g-screen>.g-btn.quiet{position:absolute;top:4px;right:20px;width:auto;height:30px;padding:0 12px;font-size:15px;border-radius:12px}
/* sheets */
.g-dim{position:fixed;inset:0;background:rgba(34,32,28,.38);z-index:20}
.g-sheet{position:fixed;left:0;right:0;bottom:0;max-width:430px;margin:0 auto;background:var(--canvas);border-radius:20px 20px 0 0;padding:14px 24px calc(env(safe-area-inset-bottom) + 24px);display:flex;flex-direction:column;gap:20px;z-index:21;max-height:90dvh;overflow:auto}
.g-grabber{width:40px;height:5px;border-radius:3px;background:var(--line);align-self:center}
/* done */
.g-pile{display:flex;justify-content:center;align-items:flex-start;gap:4px;flex-wrap:wrap}
.g-bar{height:8px;border-radius:4px;background:var(--line);overflow:hidden}
.g-bar b{display:block;height:100%;background:var(--accent);border-radius:4px}
.g-field{display:flex;flex-direction:column;gap:6px}
.g-field input{height:52px;border-radius:12px;border:0;box-shadow:inset 0 0 0 1.5px var(--line);background:var(--canvas);font:inherit;font-size:17px;font-weight:600;padding:0 14px;color:var(--ink);width:100%}
.g-field input:focus{outline:none;box-shadow:inset 0 0 0 2px var(--accent)}
.g-link{background:none;border:0;padding:0;font-weight:600;color:var(--ink);text-decoration:underline;text-underline-offset:3px}
.g-collage{position:relative;flex:1;min-height:360px;margin:16px -20px}
.g-collage .g-st{position:absolute}
.g-setgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px 4px;justify-items:center}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
`;

export function injectStyles() {
  if (typeof document === "undefined" || document.getElementById("glyph-css")) return;
  const s = document.createElement("style");
  s.id = "glyph-css";
  s.textContent = CSS;
  document.head.append(s);
  const meta = (name: string, content: string) => {
    const m = document.createElement("meta");
    m.name = name;
    m.content = content;
    document.head.append(m);
  };
  meta("theme-color", "#f6f1e7");
  meta("apple-mobile-web-app-capable", "yes");
  meta("apple-mobile-web-app-title", "Glyph");
  const v = document.querySelector('meta[name="viewport"]');
  if (v) v.setAttribute("content", "width=device-width, initial-scale=1, viewport-fit=cover");
  for (const l of document.querySelectorAll('link[rel~="icon"]')) l.remove();
  const icon = document.createElement("link");
  icon.rel = "icon";
  icon.type = "image/svg+xml";
  icon.href = ICON;
  const apple = document.createElement("link");
  apple.rel = "apple-touch-icon";
  apple.href = "https://glyph-art.space.fast/icon-180.png";
  document.head.append(icon, apple);
  document.title = "Glyph";
  watchKeyboard();
}

// When the on-screen keyboard is up, the visual viewport is shorter than the window.
// Size the app to what is left, so the board and the letter slots stay above the keyboard.
function watchKeyboard() {
  const vv = window.visualViewport;
  if (!vv) return;
  const root = document.documentElement;
  // Safari in a tab floats its address pill over the bottom of the page while typing; a home-screen app has none.
  const standalone = (navigator as any).standalone || matchMedia("(display-mode: standalone)").matches;
  const sync = () => {
    const up = window.innerHeight - vv.height > 120 && document.activeElement?.tagName === "INPUT";
    root.classList.toggle("kb", up);
    if (up) {
      root.style.setProperty("--vvh", `${vv.height}px`);
      root.style.setProperty("--vvt", `${vv.offsetTop}px`);
      root.style.setProperty("--kbpad", standalone ? "0px" : "52px");
      document.querySelector(".g-slots b.cur")?.scrollIntoView({ block: "nearest" });
    }
  };
  vv.addEventListener("resize", sync);
  vv.addEventListener("scroll", sync);
  document.addEventListener("focusin", () => setTimeout(sync, 60));
  document.addEventListener("focusout", () => setTimeout(sync, 60));
}

// The app icon: a white Fredoka G on purple.
export const ICON =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#7b61ff"/><text x="32" y="47" text-anchor="middle" font-family="Fredoka,ui-rounded,Arial Rounded MT Bold,system-ui" font-weight="700" font-size="44" fill="#fff">G</text></svg>`,
  );
