import { defineConfig } from "spacefast/config";

export default defineConfig({
  name: "Glyph",
  runtime: {
    kind: "zero",
    server: "server/index.ts",
    client: "client/index.tsx",
  },
  meta: {
    title: "Glyph",
    description: "Four emoji puzzles. New every day.",
    image: "https://glyph-art.space.fast/og.png",
    favicon: "https://glyph-art.space.fast/icon-192.png",
  },
});
