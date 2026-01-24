-- Glyph Database Schema

-- Puzzles
CREATE TABLE IF NOT EXISTS puzzles (
  id TEXT PRIMARY KEY,
  topic TEXT NOT NULL,
  emojis TEXT NOT NULL,
  answer TEXT NOT NULL,
  accepted_answers TEXT, -- JSON array of accepted variations
  scheduled_date DATE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index for fetching today's puzzle
CREATE INDEX IF NOT EXISTS idx_puzzles_scheduled_date ON puzzles(scheduled_date);

-- Players (optional accounts)
CREATE TABLE IF NOT EXISTS players (
  id TEXT PRIMARY KEY,
  display_name TEXT,
  email TEXT UNIQUE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  total_solves INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Solves
CREATE TABLE IF NOT EXISTS solves (
  id TEXT PRIMARY KEY,
  puzzle_id TEXT NOT NULL,
  player_id TEXT, -- nullable for anonymous players
  anonymous_id TEXT, -- for tracking anonymous players
  answer_submitted TEXT NOT NULL,
  correct INTEGER NOT NULL, -- 0 or 1
  solve_time_ms INTEGER,
  attempts INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (puzzle_id) REFERENCES puzzles(id),
  FOREIGN KEY (player_id) REFERENCES players(id)
);

-- Index for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_solves_puzzle_time ON solves(puzzle_id, correct, solve_time_ms);
CREATE INDEX IF NOT EXISTS idx_solves_player ON solves(player_id);

-- Admin users
CREATE TABLE IF NOT EXISTS admins (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Daily stats (optional, for quick lookups)
CREATE TABLE IF NOT EXISTS daily_stats (
  puzzle_id TEXT PRIMARY KEY,
  total_plays INTEGER DEFAULT 0,
  total_solves INTEGER DEFAULT 0,
  avg_solve_time_ms INTEGER,
  fastest_solve_ms INTEGER,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (puzzle_id) REFERENCES puzzles(id)
);
