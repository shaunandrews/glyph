/**
 * Glyph Admin — Puzzle Creator
 */

// State
let puzzles = [];
let editingPuzzle = null;

// DOM Elements
const puzzleTableBody = document.getElementById('puzzle-table-body');
const puzzleModal = document.getElementById('puzzle-modal');
const puzzleForm = document.getElementById('puzzle-form');
const modalTitle = document.getElementById('modal-title');
const newPuzzleBtn = document.getElementById('new-puzzle-btn');
const modalCloseBtn = document.getElementById('modal-close');
const cancelBtn = document.getElementById('cancel-btn');
const filterSearch = document.getElementById('filter-search');

// Form fields
const topicInput = document.getElementById('puzzle-topic');
const emojisInput = document.getElementById('puzzle-emojis');
const answerInput = document.getElementById('puzzle-answer');
const wrong1Input = document.getElementById('puzzle-wrong-1');
const wrong2Input = document.getElementById('puzzle-wrong-2');
const wrong3Input = document.getElementById('puzzle-wrong-3');

// Preview
const previewTopic = document.getElementById('preview-topic');
const previewEmojis = document.getElementById('preview-emojis');
const previewOptions = document.getElementById('preview-options');

/**
 * Initialize admin
 */
async function init() {
  await loadPuzzles();
  renderPuzzleTable();
  setupEventListeners();
}

/**
 * Load puzzles from API
 */
async function loadPuzzles() {
  // TODO: Replace with actual API call
  puzzles = [
    {
      id: 'puzzle-001',
      topic: '90s Movies',
      emojis: '😢🐢🔇',
      answer: 'The Fast and the Furious',
      wrongAnswers: ['Forrest Gump', 'The Silence of the Lambs', 'Pulp Fiction'],
    },
    {
      id: 'puzzle-002',
      topic: 'Pixar',
      emojis: '⬇️',
      answer: 'Up',
      wrongAnswers: ['Cars', 'Brave', 'Coco'],
    },
    {
      id: 'puzzle-003',
      topic: 'Classic Rock',
      emojis: '❄️🌶️',
      answer: 'Red Hot Chili Peppers',
      wrongAnswers: ['The Rolling Stones', 'Led Zeppelin', 'AC/DC'],
    },
  ];
}

/**
 * Render puzzle table
 */
function renderPuzzleTable(filter = '') {
  const filtered = filter 
    ? puzzles.filter(p => 
        p.topic.toLowerCase().includes(filter) ||
        p.answer.toLowerCase().includes(filter) ||
        p.emojis.includes(filter)
      )
    : puzzles;

  puzzleTableBody.innerHTML = filtered.map(puzzle => `
    <tr data-id="${puzzle.id}">
      <td>${puzzle.topic}</td>
      <td class="emojis">${puzzle.emojis}</td>
      <td>${puzzle.answer}</td>
      <td>
        <button class="btn btn-small edit-btn" data-id="${puzzle.id}">Edit</button>
        <button class="btn btn-small delete-btn" data-id="${puzzle.id}">Delete</button>
      </td>
    </tr>
  `).join('');
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  newPuzzleBtn.addEventListener('click', () => openModal());
  modalCloseBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);

  puzzleModal.addEventListener('click', (e) => {
    if (e.target === puzzleModal) closeModal();
  });

  puzzleForm.addEventListener('submit', handleSubmit);

  // Live preview
  topicInput.addEventListener('input', updatePreview);
  emojisInput.addEventListener('input', updatePreview);
  answerInput.addEventListener('input', updatePreview);
  wrong1Input.addEventListener('input', updatePreview);
  wrong2Input.addEventListener('input', updatePreview);
  wrong3Input.addEventListener('input', updatePreview);

  // Search filter
  filterSearch.addEventListener('input', (e) => {
    renderPuzzleTable(e.target.value.toLowerCase());
  });

  // Table actions
  puzzleTableBody.addEventListener('click', (e) => {
    const editBtn = e.target.closest('.edit-btn');
    const deleteBtn = e.target.closest('.delete-btn');

    if (editBtn) {
      const puzzle = puzzles.find(p => p.id === editBtn.dataset.id);
      openModal(puzzle);
    }

    if (deleteBtn) {
      handleDelete(deleteBtn.dataset.id);
    }
  });
}

/**
 * Open puzzle modal
 */
function openModal(puzzle = null) {
  editingPuzzle = puzzle;
  modalTitle.textContent = puzzle ? 'Edit Puzzle' : 'New Puzzle';

  if (puzzle) {
    topicInput.value = puzzle.topic;
    emojisInput.value = puzzle.emojis;
    answerInput.value = puzzle.answer;
    wrong1Input.value = puzzle.wrongAnswers[0] || '';
    wrong2Input.value = puzzle.wrongAnswers[1] || '';
    wrong3Input.value = puzzle.wrongAnswers[2] || '';
  } else {
    puzzleForm.reset();
  }

  updatePreview();
  puzzleModal.classList.remove('hidden');
  topicInput.focus();
}

/**
 * Close puzzle modal
 */
function closeModal() {
  puzzleModal.classList.add('hidden');
  editingPuzzle = null;
  puzzleForm.reset();
}

/**
 * Shuffle array
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
 * Update live preview
 */
function updatePreview() {
  previewTopic.textContent = topicInput.value || 'Topic';
  previewEmojis.textContent = emojisInput.value || '🎯';
  
  const correct = answerInput.value || 'Correct Answer';
  const wrong = [
    wrong1Input.value || 'Wrong 1',
    wrong2Input.value || 'Wrong 2',
    wrong3Input.value || 'Wrong 3',
  ];
  
  const options = shuffle([correct, ...wrong]);
  
  previewOptions.innerHTML = options.map(opt => `
    <div class="preview-option ${opt === correct ? 'correct' : ''}">${opt}</div>
  `).join('');
}

/**
 * Handle form submission
 */
async function handleSubmit(e) {
  e.preventDefault();

  const puzzleData = {
    topic: topicInput.value.trim(),
    emojis: emojisInput.value.trim(),
    answer: answerInput.value.trim(),
    wrongAnswers: [
      wrong1Input.value.trim(),
      wrong2Input.value.trim(),
      wrong3Input.value.trim(),
    ],
  };

  if (editingPuzzle) {
    await updatePuzzle(editingPuzzle.id, puzzleData);
  } else {
    await createPuzzle(puzzleData);
  }

  closeModal();
  await loadPuzzles();
  renderPuzzleTable();
}

/**
 * Create puzzle via API
 */
async function createPuzzle(data) {
  // TODO: Replace with actual API call
  console.log('Creating puzzle:', data);
  puzzles.push({ id: `puzzle-${Date.now()}`, ...data });
}

/**
 * Update puzzle via API
 */
async function updatePuzzle(id, data) {
  // TODO: Replace with actual API call
  console.log('Updating puzzle:', id, data);
  const index = puzzles.findIndex(p => p.id === id);
  if (index !== -1) {
    puzzles[index] = { ...puzzles[index], ...data };
  }
}

/**
 * Handle puzzle deletion
 */
async function handleDelete(id) {
  if (!confirm('Delete this puzzle?')) return;

  // TODO: Replace with actual API call
  console.log('Deleting puzzle:', id);
  puzzles = puzzles.filter(p => p.id !== id);
  renderPuzzleTable();
}

// Initialize
init();
