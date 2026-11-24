// Glyph's own small router: the path is the state. Zero's pages/ files all render <App/>.
import { useEffect, useState } from "preact/hooks";

const listeners = new Set<() => void>();
export function go(path: string, replace = false) {
  if (path !== location.pathname) {
    if (replace) history.replaceState(null, "", path);
    else history.pushState(null, "", path);
  }
  window.scrollTo(0, 0);
  listeners.forEach((f) => f());
}
export function usePath(): string {
  const [p, set] = useState(typeof location === "undefined" ? "/" : location.pathname);
  useEffect(() => {
    const f = () => set(location.pathname + "#" + Math.random());
    listeners.add(f);
    addEventListener("popstate", f);
    return () => {
      listeners.delete(f);
      removeEventListener("popstate", f);
    };
  }, []);
  return p.split("#")[0];
}
