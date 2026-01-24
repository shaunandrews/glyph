# Glyph

**Think opposite.**

A daily word puzzle where you decode emoji sequences by thinking in opposites. Each emoji represents a word — find the opposite of each word, and the opposites form a hidden phrase.

## How It Works

1. See today's **topic** (e.g., "80s Movies")
2. See the **emoji sequence**
3. Decode each emoji → find the **opposite**
4. The opposites form the **answer**

Example:
- Topic: **"Pixar"**
- Emoji: ⬇️
- You see: Down → Opposite: Up
- Answer: **"Up"**

## Project Structure

```
glyph/
├── src/
│   ├── game/       # Player-facing game UI
│   ├── admin/      # Puzzle creator/admin UI
│   ├── api/        # Backend API routes
│   └── db/         # Database schema & queries
├── public/         # Static assets
├── scripts/        # Build & utility scripts
└── puzzles/        # Puzzle data (dev/seed)
```

## Tech Stack

- **Frontend:** Vanilla HTML/CSS/JS (keeping it simple)
- **Backend:** Node.js + Hono (lightweight)
- **Database:** SQLite via Turso (or local SQLite for dev)
- **Hosting:** Vercel

## Getting Started

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Run admin (separate port)
npm run admin
```

## Documentation

Full project documentation in Obsidian: `~/Documents/Obsidian Vault/Projects/Glyph/`

- [1-Overview.md](~/Documents/Obsidian%20Vault/Projects/Glyph/1-Overview.md) — Concept & vision
- [2-Tasks.md](~/Documents/Obsidian%20Vault/Projects/Glyph/2-Tasks.md) — Todo list
- [5-Architecture.md](~/Documents/Obsidian%20Vault/Projects/Glyph/5-Architecture.md) — Technical plan
