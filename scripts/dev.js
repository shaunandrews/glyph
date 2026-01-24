/**
 * Glyph Development Server
 * 
 * Runs the API and serves static files for local development.
 */

import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import { join, dirname, extname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PORT = process.env.PORT || 4747;

// MIME types
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

// In-memory puzzle store
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

function handleRequest(req, res) {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  let path = url.pathname;

  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  // API: Today's puzzle
  if (path === '/api/puzzle/today' && req.method === 'GET') {
    const today = new Date().toISOString().split('T')[0];
    const puzzle = puzzles.find(p => p.scheduledDate === today);
    
    if (!puzzle) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'No puzzle today' }));
    }

    // Shuffle options (correct + wrong answers)
    const options = shuffle([puzzle.answer, ...puzzle.wrongAnswers]);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      id: puzzle.id,
      topic: puzzle.topic,
      emojis: puzzle.emojis,
      options: options,
      correctAnswer: puzzle.answer,
      date: puzzle.scheduledDate,
    }));
  }

  // API: Submit solve
  if (path.match(/^\/api\/puzzle\/[\w-]+\/solve$/) && req.method === 'POST') {
    const puzzleId = path.split('/')[3];
    const puzzle = puzzles.find(p => p.id === puzzleId);

    if (!puzzle) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Puzzle not found' }));
    }

    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { answer, playerId } = JSON.parse(body);
        const correct = answer === puzzle.answer;

        solves.push({
          id: Date.now().toString(),
          puzzleId,
          playerId,
          answerSubmitted: answer,
          correct,
          createdAt: new Date().toISOString(),
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          correct,
          answer: puzzle.answer,
        }));
      } catch {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid request' }));
      }
    });
    return;
  }

  // Static files
  // Route / to game, /admin to admin
  if (path === '/') path = '/game/index.html';
  else if (path === '/admin') path = '/admin/index.html';
  else if (!extname(path)) path = path + '/index.html';

  const filePath = join(ROOT, 'src', path);
  
  if (existsSync(filePath)) {
    const ext = extname(filePath);
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    
    try {
      const content = readFileSync(filePath);
      res.writeHead(200, { 'Content-Type': contentType });
      return res.end(content);
    } catch {
      // Fall through to 404
    }
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not found');
}

createServer(handleRequest).listen(PORT, () => {
  console.log(`
🎯 Glyph Dev Server

   Game:  http://localhost:${PORT}/
   Admin: http://localhost:${PORT}/admin

   API:   http://localhost:${PORT}/api/puzzle/today
`);
});
