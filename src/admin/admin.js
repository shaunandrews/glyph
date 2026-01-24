/**
 * Glyph Admin — Puzzle Creator
 */

// State
let puzzles = [];
let editingPuzzle = null;
let wrongAnswerCount = 3;

// DOM Elements
const puzzleTableBody = document.getElementById('puzzle-table-body');
const puzzleModal = document.getElementById('puzzle-modal');
const puzzleForm = document.getElementById('puzzle-form');
const modalTitle = document.getElementById('modal-title');
const newPuzzleBtn = document.getElementById('new-puzzle-btn');
const modalCloseBtn = document.getElementById('modal-close');
const cancelBtn = document.getElementById('cancel-btn');
const filterSearch = document.getElementById('filter-search');
const addWrongBtn = document.getElementById('add-wrong-btn');
const wrongAnswersList = document.getElementById('wrong-answers-list');

// Form fields
const topicInput = document.getElementById('puzzle-topic');
const emojisInput = document.getElementById('puzzle-emojis');
const answerInput = document.getElementById('puzzle-answer');

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
 * Render wrong answer inputs
 */
function renderWrongAnswerInputs(values = ['', '', '']) {
  wrongAnswerCount = Math.max(3, values.length);
  
  wrongAnswersList.innerHTML = values.map((val, i) => `
    <div class="wrong-answer-row">
      <input type="text" class="wrong-answer-input" placeholder="Wrong answer ${i + 1}" value="${val}" ${i < 3 ? 'required' : ''}>
      ${i >= 3 ? '<button type="button" class="btn btn-small remove-wrong-btn">×</button>' : ''}
    </div>
  `).join('');
  
  // Pad to minimum 3
  while (wrongAnswersList.children.length < 3) {
    addWrongAnswerInput();
  }
  
  // Add event listeners for remove buttons and preview updates
  wrongAnswersList.querySelectorAll('.remove-wrong-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.target.closest('.wrong-answer-row').remove();
      updatePreview();
    });
  });
  
  wrongAnswersList.querySelectorAll('.wrong-answer-input').forEach(input => {
    input.addEventListener('input', updatePreview);
  });
}

/**
 * Add a wrong answer input
 */
function addWrongAnswerInput() {
  const count = wrongAnswersList.children.length;
  const div = document.createElement('div');
  div.className = 'wrong-answer-row';
  div.innerHTML = `
    <input type="text" class="wrong-answer-input" placeholder="Wrong answer ${count + 1}">
    ${count >= 3 ? '<button type="button" class="btn btn-small remove-wrong-btn">×</button>' : ''}
  `;
  
  wrongAnswersList.appendChild(div);
  
  const removeBtn = div.querySelector('.remove-wrong-btn');
  if (removeBtn) {
    removeBtn.addEventListener('click', () => {
      div.remove();
      updatePreview();
    });
  }
  
  div.querySelector('.wrong-answer-input').addEventListener('input', updatePreview);
  div.querySelector('.wrong-answer-input').focus();
}

/**
 * Get wrong answers from inputs
 */
function getWrongAnswers() {
  return Array.from(wrongAnswersList.querySelectorAll('.wrong-answer-input'))
    .map(input => input.value.trim())
    .filter(Boolean);
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  newPuzzleBtn.addEventListener('click', () => openModal());
  modalCloseBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);
  addWrongBtn.addEventListener('click', addWrongAnswerInput);

  puzzleModal.addEventListener('click', (e) => {
    if (e.target === puzzleModal) closeModal();
  });

  puzzleForm.addEventListener('submit', handleSubmit);

  // Live preview
  topicInput.addEventListener('input', updatePreview);
  emojisInput.addEventListener('input', updatePreview);
  answerInput.addEventListener('input', updatePreview);

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
    renderWrongAnswerInputs(puzzle.wrongAnswers);
  } else {
    puzzleForm.reset();
    renderWrongAnswerInputs(['', '', '']);
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
  const wrong = getWrongAnswers();
  
  // Show up to 3 wrong answers in preview (shuffled)
  const wrongPreview = shuffle(wrong).slice(0, 3);
  while (wrongPreview.length < 3) {
    wrongPreview.push(`Wrong ${wrongPreview.length + 1}`);
  }
  
  const options = shuffle([correct, ...wrongPreview]);
  
  previewOptions.innerHTML = options.map(opt => `
    <div class="preview-option ${opt === correct ? 'correct' : ''}">${opt}</div>
  `).join('');
}

/**
 * Handle form submission
 */
async function handleSubmit(e) {
  e.preventDefault();

  const wrongAnswers = getWrongAnswers();
  
  if (wrongAnswers.length < 3) {
    alert('Please provide at least 3 wrong answers');
    return;
  }

  const puzzleData = {
    topic: topicInput.value.trim(),
    emojis: emojisInput.value.trim(),
    answer: answerInput.value.trim(),
    wrongAnswers,
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
