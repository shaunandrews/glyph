/**
 * Glyph Development Server
 * 
 * Runs the API and serves static files for local development.
 * Uses Firebase if credentials available, otherwise falls back to in-memory.
 */

import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import { join, dirname, extname } from 'path';
import { fileURLToPath } from 'url';
import { 
  initFirebase, 
  getRandomPuzzle as fbGetRandomPuzzle,
  getPuzzle as fbGetPuzzle,
  getAllPuzzles as fbGetAllPuzzles,
  createPuzzle as fbCreatePuzzle,
  updatePuzzle as fbUpdatePuzzle,
  deletePuzzle as fbDeletePuzzle,
  recordSolve as fbRecordSolve,
} from '../src/db/firebase.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PORT = process.env.PORT || 4747;

// Initialize Firebase (will use mock mode if no credentials)
const db = initFirebase();
const useFirebase = db !== null;

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

// In-memory fallback store
let puzzles = [
  {
    id: 'puzzle-001',
    topic: '90s Movies',
    emojis: '😢🐢🔇',
    answer: 'The Fast and the Furious',
    wrongAnswers: ['Forrest Gump', 'The Silence of the Lambs', 'Pulp Fiction', 'Titanic', 'The Matrix', 'Fight Club'],
  },
  {
    id: 'puzzle-002',
    topic: 'Pixar',
    emojis: '⬇️',
    answer: 'Up',
    wrongAnswers: ['Cars', 'Brave', 'Coco', 'Wall-E', 'Ratatouille', 'Finding Nemo'],
  },
  {
    id: 'puzzle-003',
    topic: 'Classic Rock',
    emojis: '❄️🌶️',
    answer: 'Red Hot Chili Peppers',
    wrongAnswers: ['The Rolling Stones', 'Led Zeppelin', 'AC/DC', 'Guns N Roses', 'Aerosmith'],
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
 * Pick n random items from array
 */
function pickRandom(array, n) {
  const shuffled = shuffle(array);
  return shuffled.slice(0, n);
}

/**
 * Get a random puzzle (memory fallback)
 */
function getRandomPuzzleMem() {
  return puzzles[Math.floor(Math.random() * puzzles.length)];
}

/**
 * Format puzzle for API response
 */
function formatPuzzleResponse(puzzle) {
  const wrongThree = pickRandom(puzzle.wrongAnswers, 3);
  const options = shuffle([puzzle.answer, ...wrongThree]);
  
  return {
    id: puzzle.id,
    topic: puzzle.topic,
    emojis: puzzle.emojis,
    options,
    correctAnswer: puzzle.answer,
  };
}

async function handleRequest(req, res) {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  let path = url.pathname;

  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  // API: Get a puzzle (random)
  if (path === '/api/puzzle' && req.method === 'GET') {
    const puzzle = useFirebase 
      ? await fbGetRandomPuzzle() 
      : getRandomPuzzleMem();
    
    if (!puzzle) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'No puzzles available' }));
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify(formatPuzzleResponse(puzzle)));
  }

  // API: Get all puzzles (admin)
  if (path === '/api/puzzles' && req.method === 'GET') {
    const allPuzzles = useFirebase ? await fbGetAllPuzzles() : puzzles;
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify(allPuzzles));
  }

  // API: Create puzzle (admin)
  if (path === '/api/puzzles' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        
        let newPuzzle;
        if (useFirebase) {
          newPuzzle = await fbCreatePuzzle(data);
        } else {
          newPuzzle = { id: `puzzle-${Date.now()}`, ...data };
          puzzles.push(newPuzzle);
        }

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(newPuzzle));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid request' }));
      }
    });
    return;
  }

  // API: Get specific puzzle by ID
  if (path.match(/^\/api\/puzzle\/[\w-]+$/) && !path.endsWith('/solve') && req.method === 'GET') {
    const puzzleId = path.split('/')[3];
    const puzzle = useFirebase 
      ? await fbGetPuzzle(puzzleId)
      : puzzles.find(p => p.id === puzzleId);

    if (!puzzle) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Puzzle not found' }));
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify(formatPuzzleResponse(puzzle)));
  }

  // API: Update puzzle (admin)
  if (path.match(/^\/api\/puzzle\/[\w-]+$/) && req.method === 'PUT') {
    const puzzleId = path.split('/')[3];
    
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        
        let updated;
        if (useFirebase) {
          updated = await fbUpdatePuzzle(puzzleId, data);
        } else {
          const index = puzzles.findIndex(p => p.id === puzzleId);
          if (index === -1) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Puzzle not found' }));
          }
          puzzles[index] = { ...puzzles[index], ...data };
          updated = puzzles[index];
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(updated));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid request' }));
      }
    });
    return;
  }

  // API: Delete puzzle (admin)
  if (path.match(/^\/api\/puzzle\/[\w-]+$/) && req.method === 'DELETE') {
    const puzzleId = path.split('/')[3];
    
    if (useFirebase) {
      await fbDeletePuzzle(puzzleId);
    } else {
      puzzles = puzzles.filter(p => p.id !== puzzleId);
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ success: true }));
  }

  // API: Submit solve
  if (path.match(/^\/api\/puzzle\/[\w-]+\/solve$/) && req.method === 'POST') {
    const puzzleId = path.split('/')[3];
    const puzzle = useFirebase 
      ? await fbGetPuzzle(puzzleId)
      : puzzles.find(p => p.id === puzzleId);

    if (!puzzle) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Puzzle not found' }));
    }

    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { answer, playerId } = JSON.parse(body);
        const correct = answer === puzzle.answer;

        const solveData = {
          puzzleId,
          answerSubmitted: answer,
          correct,
        };
        if (playerId) solveData.playerId = playerId;

        if (useFirebase) {
          await fbRecordSolve(solveData);
        } else {
          solves.push({ id: Date.now().toString(), ...solveData });
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          correct,
          answer: puzzle.answer,
        }));
      } catch (e) {
        console.error('Solve error:', e);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid request' }));
      }
    });
    return;
  }

  // Static files
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

   API:   http://localhost:${PORT}/api/puzzle
   Mode:  ${useFirebase ? '🔥 Firebase' : '💾 In-memory (no credentials)'}
`);
});
