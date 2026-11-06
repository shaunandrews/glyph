# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Glyph is a daily emoji puzzle game where players decode emoji clues by thinking in opposites. Each emoji represents a word — find the opposite, and you'll find the answer. For example: 😢🐢🔇 (sad→happy, slow→fast, quiet→loud) = "The Fast and the Furious".

## Commands

```bash
npm run dev      # Start dev server on port 4747 (game: /, admin: /admin)
npm start        # Run production API server
```

No build step, test framework, or linter is currently configured.

## Architecture

### Stack
- **Frontend:** Vanilla HTML/CSS/JS (no frameworks)
- **Backend:** Node.js native HTTP server (no Express)
- **Database:** Firebase Firestore with in-memory fallback

### Key Files
- `scripts/dev.js` - Development server with API routes and static file serving
- `src/db/firebase.js` - Firebase integration with graceful degradation
- `src/game/` - Player-facing game UI
- `src/admin/` - Puzzle management UI
- `src/api/index.js` - Production API server (simpler than dev server)

### Data Flow
1. Dev server initializes Firebase or falls back to in-memory store with 3 sample puzzles
2. Game fetches `GET /api/puzzle` → receives puzzle with shuffled options (correct + 3 random wrong answers)
3. Player submits `POST /api/puzzle/:id/solve` → server validates and records solve

### API Endpoints
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/puzzle` | Random puzzle for gameplay |
| GET | `/api/puzzles` | All puzzles (admin) |
| POST | `/api/puzzles` | Create puzzle (admin) |
| GET | `/api/puzzle/:id` | Specific puzzle |
| PUT | `/api/puzzle/:id` | Update puzzle (admin) |
| DELETE | `/api/puzzle/:id` | Delete puzzle (admin) |
| POST | `/api/puzzle/:id/solve` | Submit answer |

### Puzzle Data Model
```javascript
{
  id: string,
  topic: string,        // Category hint, e.g., "90s Movies"
  emojis: string,       // Clues, e.g., "😢🐢🔇"
  answer: string,       // Correct answer
  wrongAnswers: string[] // At least 3 alternatives
}
```

## Firebase Setup

The server works without Firebase (uses in-memory store). For persistence:
1. Download service account JSON from Firebase Console
2. Save as `serviceAccount.json` in project root (gitignored)
3. Or set `GOOGLE_APPLICATION_CREDENTIALS` env var

## Notes

- Port 4747 is default; override with `PORT` env var
- No authentication on admin endpoints
- ES Modules throughout (`"type": "module"`)
- Static files served directly from `src/` with no build step
