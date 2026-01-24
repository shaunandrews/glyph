/**
 * Glyph — Game Logic
 */

// State
let puzzle = null;
let solved = false;

// DOM Elements
const topicEl = document.getElementById('topic');
const emojisEl = document.getElementById('emojis');
const optionsEl = document.getElementById('options');
const resultEl = document.getElementById('result');
const resultEmoji = document.getElementById('result-emoji');
const nextBtn = document.getElementById('next-btn');

/**
 * Initialize the game
 */
async function init() {
  await loadPuzzle();
  nextBtn.addEventListener('click', handleNext);
}

/**
 * Load a puzzle
 */
async function loadPuzzle() {
  solved = false;
  resultEl.classList.add('hidden');
  nextBtn.classList.add('hidden');
  optionsEl.innerHTML = '';
  
  puzzle = await fetchPuzzle();
  
  if (!puzzle) {
    showError('Could not load puzzle');
    return;
  }

  renderPuzzle();
}

/**
 * Fetch a puzzle from API
 */
async function fetchPuzzle() {
  try {
    const res = await fetch('/api/puzzle');
    if (!res.ok) throw new Error('No puzzle');
    return await res.json();
  } catch (e) {
    console.error('Failed to fetch puzzle:', e);
    return null;
  }
}

/**
 * Render the puzzle
 */
function renderPuzzle() {
  topicEl.textContent = puzzle.topic;
  emojisEl.textContent = puzzle.emojis;
  renderOptions();
}

/**
 * Render answer options
 */
function renderOptions() {
  optionsEl.innerHTML = '';
  
  puzzle.options.forEach(option => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = option;
    btn.addEventListener('click', () => handleOptionClick(option, btn));
    optionsEl.appendChild(btn);
  });
}

/**
 * Handle option button click
 */
async function handleOptionClick(answer, btn) {
  if (solved) return;
  
  const result = await submitGuess(puzzle.id, answer);
  
  solved = true;
  
  // Mark buttons
  document.querySelectorAll('.option-btn').forEach(b => {
    b.disabled = true;
    if (b.textContent === puzzle.correctAnswer) {
      b.classList.add('correct');
    } else if (b === btn && !result.correct) {
      b.classList.add('incorrect');
    }
  });
  
  showResult(result.correct);
}

/**
 * Submit guess to API
 */
async function submitGuess(puzzleId, guess) {
  try {
    const res = await fetch(`/api/puzzle/${puzzleId}/solve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answer: guess }),
    });
    return await res.json();
  } catch (e) {
    console.error('Failed to submit:', e);
    return { correct: false };
  }
}

/**
 * Show the result
 */
function showResult(correct) {
  resultEmoji.textContent = correct ? '🎉' : '😔';
  resultEl.classList.remove('hidden');
  nextBtn.classList.remove('hidden');
}

/**
 * Handle next puzzle
 */
function handleNext() {
  loadPuzzle();
}

/**
 * Show error message
 */
function showError(message) {
  emojisEl.textContent = '😵';
  topicEl.textContent = message;
}

// Start the game
init();
