/**
 * Glyph API Server
 * 
 * Lightweight API for the Glyph puzzle game.
 */

import { createServer } from 'http';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 4747;

// In-memory store (replace with SQLite)
const puzzles = [
  {
    id: 'demo-001',
    topic: '90s Movies',
    emojis: '😢🐢🔇',
    answer: 'The Fast and the Furious',
    wrongAnswers: [
      'Forrest Gump',
      'The Silence of the Lambs',
      'Pulp Fiction'
    ],
    scheduledDate: new Date().toISOString().split('T')[0],
  },
];

const solves = [];

/**
 * Shuffle array (Fisher-Yates)
 */
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Check if answer is correct
 */
function checkAnswer(puzzle, guess) {
  return guess === puzzle.answer;
}

/**
 * Handle API requests
 */
function handleRequest(req, res) {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const path = url.pathname;
  const method = req.method;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // API Routes
  if (path === '/api/puzzle/today' && method === 'GET') {
    const today = new Date().toISOString().split('T')[0];
    const puzzle = puzzles.find(p => p.scheduledDate === today);
    
    if (!puzzle) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'No puzzle today' }));
      return;
    }

    // Shuffle options (correct + wrong answers)
    const options = shuffle([puzzle.answer, ...puzzle.wrongAnswers]);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      id: puzzle.id,
      topic: puzzle.topic,
      emojis: puzzle.emojis,
      options: options,
      correctAnswer: puzzle.answer, // Frontend needs this to highlight correct answer
      date: puzzle.scheduledDate,
    }));
    return;
  }

  if (path.startsWith('/api/puzzle/') && path.endsWith('/solve') && method === 'POST') {
    const puzzleId = path.split('/')[3];
    const puzzle = puzzles.find(p => p.id === puzzleId);

    if (!puzzle) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Puzzle not found' }));
      return;
    }

    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { answer, playerId } = JSON.parse(body);
        const correct = checkAnswer(puzzle, answer);

        // Record solve
        const solve = {
          id: Date.now().toString(),
          puzzleId,
          playerId: playerId || null,
          answerSubmitted: answer,
          correct,
          createdAt: new Date().toISOString(),
        };
        solves.push(solve);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          correct,
          answer: puzzle.answer,
        }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid request' }));
      }
    });
    return;
  }

  // 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
}

const server = createServer(handleRequest);

server.listen(PORT, () => {
  console.log(`🎯 Glyph API running at http://localhost:${PORT}`);
});
