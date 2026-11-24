import { defineConfig } from "spacefast/config";

export default defineConfig({
  "name": "Glyph",
  "runtime": {
    "kind": "zero",
    "server": "server/index.ts",
    "client": "client/index.tsx"
  }
});
