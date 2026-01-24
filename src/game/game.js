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
const resultStatus = document.getElementById('result-status');
const resultAnswer = document.getElementById('result-answer');
const shareBtn = document.getElementById('share-btn');
const nextBtn = document.getElementById('next-btn');

/**
 * Initialize the game
 */
async function init() {
  await loadPuzzle();
  shareBtn.addEventListener('click', handleShare);
  nextBtn.addEventListener('click', handleNext);
}

/**
 * Load a puzzle
 */
async function loadPuzzle() {
  solved = false;
  resultEl.classList.add('hidden');
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
  
  solved = result.correct;
  
  // Mark buttons
  document.querySelectorAll('.option-btn').forEach(b => {
    b.disabled = true;
    if (b.textContent === puzzle.correctAnswer) {
      b.classList.add('correct');
    } else if (b === btn && !result.correct) {
      b.classList.add('incorrect');
    }
  });
  
  showResult(result);
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
    return { correct: false, answer: 'Error' };
  }
}

/**
 * Show the result
 */
function showResult(result) {
  resultEl.classList.remove('hidden');

  if (result.correct) {
    resultStatus.textContent = '🎉 Correct!';
    resultStatus.className = 'result-status correct';
  } else {
    resultStatus.textContent = '❌ Not quite';
    resultStatus.className = 'result-status incorrect';
  }

  resultAnswer.textContent = result.answer;
}

/**
 * Handle next puzzle
 */
function handleNext() {
  loadPuzzle();
}

/**
 * Handle share button
 */
function handleShare() {
  const shareText = generateShareText();
  
  if (navigator.share) {
    navigator.share({ text: shareText });
  } else {
    navigator.clipboard.writeText(shareText);
    shareBtn.textContent = 'Copied!';
    setTimeout(() => shareBtn.textContent = 'Share', 2000);
  }
}

/**
 * Generate share card text
 */
function generateShareText() {
  return `Glyph — ${puzzle.topic}
${puzzle.emojis}

${solved ? '🟩 Solved!' : '🟥 Stumped'}

playglyph.com`;
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
