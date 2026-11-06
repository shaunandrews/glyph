/**
 * Glyph — Game Logic
 */

// State
let puzzle = null;
let solved = false;
let isFirstLoad = true;

// DOM Elements
const topicEl = document.getElementById('topic');
const emojisEl = document.getElementById('emojis');
const optionsEl = document.getElementById('options');
const nextBtn = document.getElementById('next-btn');
const appEl = document.getElementById('app');

/**
 * Initialize the game
 */
async function init() {
  await loadPuzzle();
  nextBtn.addEventListener('click', handleNext);
}

/**
 * Show loading skeleton
 */
function showLoading() {
  topicEl.innerHTML = '<div class="skeleton skeleton-topic"></div>';
  emojisEl.innerHTML = '<div class="skeleton skeleton-emojis"></div>';
  optionsEl.innerHTML = `
    <div class="skeleton skeleton-option"></div>
    <div class="skeleton skeleton-option"></div>
    <div class="skeleton skeleton-option"></div>
    <div class="skeleton skeleton-option"></div>
  `;
}

/**
 * Load a puzzle
 */
async function loadPuzzle() {
  solved = false;
  nextBtn.classList.add('hidden');

  // Only show skeleton on first load
  if (isFirstLoad) {
    showLoading();
  }

  puzzle = await fetchPuzzle();

  if (!puzzle) {
    showError('Could not load puzzle');
    return;
  }

  renderPuzzle();
  isFirstLoad = false;
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
 * Render the puzzle with fade-in animation
 */
function renderPuzzle() {
  // Set content
  topicEl.textContent = puzzle.topic;
  emojisEl.textContent = puzzle.emojis;
  renderOptions();

  // Trigger fade-in animation
  appEl.classList.remove('fade-in');
  void appEl.offsetWidth; // Force reflow to restart animation
  appEl.classList.add('fade-in');
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

  solved = true;

  // Disable all buttons immediately
  const allButtons = document.querySelectorAll('.option-btn');
  allButtons.forEach(b => {
    b.disabled = true;
  });

  const result = await submitGuess(puzzle.id, answer);

  if (result.correct) {
    btn.classList.add('correct');
  } else {
    btn.classList.add('incorrect');
  }

  // Fade out other buttons
  allButtons.forEach(b => {
    if (b !== btn) {
      b.classList.add('fade-other');
    }
  });

  // Show next button after animation completes
  setTimeout(() => {
    nextBtn.classList.remove('hidden');
  }, 400);
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
 * Handle next puzzle with fade transition
 */
async function handleNext() {
  // Fade out current content
  appEl.classList.add('fade-out');

  // Wait for fade out
  await new Promise(resolve => setTimeout(resolve, 200));

  // Fetch new puzzle while still faded out
  solved = false;
  nextBtn.classList.add('hidden');
  puzzle = await fetchPuzzle();

  if (!puzzle) {
    appEl.classList.remove('fade-out');
    showError('Could not load puzzle');
    return;
  }

  // Render new content (still invisible due to fade-out)
  topicEl.textContent = puzzle.topic;
  emojisEl.textContent = puzzle.emojis;
  renderOptions();

  // Remove fade-out and trigger fade-in
  appEl.classList.remove('fade-out');
  appEl.classList.remove('fade-in');
  void appEl.offsetWidth;
  appEl.classList.add('fade-in');
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
