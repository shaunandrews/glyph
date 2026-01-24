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
  });
  
  if (result.correct) {
    btn.classList.add('correct');
    btn.textContent = '🎉 ' + btn.textContent;
  } else {
    btn.classList.add('incorrect');
  }
  
  nextBtn.classList.remove('hidden');
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
