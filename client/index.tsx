// Glyph's client entry. The screens are in client/app.tsx; pages/ only maps URLs to it.
import type { ComponentChildren } from "preact";

export function Layout({ children }: { children: ComponentChildren }) {
  return <>{children}</>;
}
