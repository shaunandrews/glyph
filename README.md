# Glyph

A daily emoji puzzle game: four games (Flip, Pairs, Ladder, Chain), sticker-style tiles, one shared day starting at midnight Eastern. Live at https://glyph.space.fast.

Runs on Spacefast's Zero runtime, kept replaceable: only `server/index.ts` and `client/backend/` know about Zero. Game rules, the day clock and the streak are plain TypeScript in `shared/`.

- `npm run dev`: local server (`sf dev`, state kept in SQLite)
- `npm run check`: regenerate the puzzle index, check puzzles, check the day clock, type-check
- `npm run publish`: check, then publish to glyph.space.fast
- Puzzles: one file per day in `server/puzzles/days/`
- Sticker images, the app icon and the link preview live in `art/`, published separately to https://glyph-art.space.fast (`sf publish art --space glyph-art --target production --wait -y`)

The plan and designs are in Bond: `~/Bond/projects/glyph/docs/`. The 2021 version is on the `archive-2021` branch.
