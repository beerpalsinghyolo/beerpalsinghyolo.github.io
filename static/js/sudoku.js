/* ===== SUDOKU ENGINE ===== */

function generateSolution() {
  const board = Array.from({ length: 9 }, () => Array(9).fill(0));
  solve(board);
  return board;
}

function isValid(board, row, col, num) {
  for (let i = 0; i < 9; i++) {
    if (board[row][i] === num) return false;
    if (board[i][col] === num) return false;
    const br = 3 * Math.floor(row / 3) + Math.floor(i / 3);
    const bc = 3 * Math.floor(col / 3) + (i % 3);
    if (board[br][bc] === num) return false;
  }
  return true;
}

function solve(board) {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] === 0) {
        const nums = shuffle([1,2,3,4,5,6,7,8,9]);
        for (const n of nums) {
          if (isValid(board, r, c, n)) {
            board[r][c] = n;
            if (solve(board)) return true;
            board[r][c] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function createPuzzle(solution, difficulty) {
  const removals = { easy: 30, medium: 46, hard: 56 };
  const puzzle = solution.map(r => [...r]);
  let toRemove = removals[difficulty] || 40;
  const cells = shuffle(Array.from({ length: 81 }, (_, i) => i));
  for (const idx of cells) {
    if (toRemove <= 0) break;
    const r = Math.floor(idx / 9), c = idx % 9;
    puzzle[r][c] = 0;
    toRemove--;
  }
  return puzzle;
}

/* ===== LEADERBOARD (localStorage) ===== */
const LB_KEY = 'sudoku_leaderboard';

function lbLoad() {
  try { return JSON.parse(localStorage.getItem(LB_KEY) || '[]'); } catch { return []; }
}

function lbSave(entries) {
  localStorage.setItem(LB_KEY, JSON.stringify(entries));
}

function lbAdd(entry) {
  const all = lbLoad();
  all.push(entry);
  // Keep top 50 overall by time per difficulty
  lbSave(all);
}

/* ===== GAME STATE ===== */
let solution = [], puzzle = [], playerBoard = [], given = [];
let selectedCell = null;
let mistakes = 0, timerSec = 0, timerInterval = null;
let currentDiff = 'easy', gameActive = false;
let streak = parseInt(localStorage.getItem('sudoku_streak') || '0');
let bestStreak = parseInt(localStorage.getItem('sudoku_best_streak') || '0');
let lastWinDate = localStorage.getItem('sudoku_last_win') || '';
let currentLbDiff = 'easy';

/* ===== DOM ===== */
const boardEl = document.getElementById('sudokuBoard');
const timerEl = document.getElementById('timerDisplay');
const mistakesEl = document.getElementById('mistakesCount');
const streakEl = document.getElementById('streakNum');
const bestStreakEl = document.getElementById('bestStreakNum');
const winModal = document.getElementById('winModal');
const loseModal = document.getElementById('loseModal');
const lbList = document.getElementById('lbList');

/* ===== STREAK ===== */
function updateStreakDisplay() {
  streakEl.textContent = streak;
  bestStreakEl.textContent = bestStreak;
}
updateStreakDisplay();

function recordWin() {
  const today = new Date().toISOString().slice(0, 10);
  if (lastWinDate === today) return;
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (lastWinDate === yesterday) {
    streak++;
  } else {
    streak = 1;
  }
  if (streak > bestStreak) bestStreak = streak;
  lastWinDate = today;
  localStorage.setItem('sudoku_streak', streak);
  localStorage.setItem('sudoku_best_streak', bestStreak);
  localStorage.setItem('sudoku_last_win', lastWinDate);
  updateStreakDisplay();
}

function recordLoss() {
  streak = 0;
  localStorage.setItem('sudoku_streak', streak);
  updateStreakDisplay();
}

/* ===== TIMER ===== */
function startTimer() {
  stopTimer();
  timerSec = 0;
  timerInterval = setInterval(() => {
    timerSec++;
    const m = String(Math.floor(timerSec / 60)).padStart(2, '0');
    const s = String(timerSec % 60).padStart(2, '0');
    timerEl.textContent = `${m}:${s}`;
  }, 1000);
}
function stopTimer() { clearInterval(timerInterval); }

function formatTime(sec) {
  const m = String(Math.floor(sec / 60)).padStart(2, '0');
  const s = String(sec % 60).padStart(2, '0');
  return `${m}:${s}`;
}

/* ===== BOARD RENDER ===== */
function renderBoard() {
  boardEl.innerHTML = '';
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const cell = document.createElement('div');
      cell.className = 'sudoku-cell';
      const box = Math.floor(r / 3) * 3 + Math.floor(c / 3);
      cell.dataset.box = box;
      cell.dataset.row = r;
      cell.dataset.col = c;
      const val = playerBoard[r][c];
      if (given[r][c]) {
        cell.classList.add('given');
        cell.textContent = val;
      } else if (val !== 0) {
        cell.classList.add('player');
        cell.textContent = val;
      }
      cell.addEventListener('click', () => selectCell(r, c));
      boardEl.appendChild(cell);
    }
  }
  applySeparators();
}

function applySeparators() {
  const cells = boardEl.querySelectorAll('.sudoku-cell');
  cells.forEach((cell, idx) => {
    const r = Math.floor(idx / 9);
    const c = idx % 9;
    cell.style.borderTop = r % 3 === 0 && r !== 0 ? '2px solid #1a1714' : '';
    cell.style.borderLeft = c % 3 === 0 && c !== 0 ? '2px solid #1a1714' : '';
  });
}

function selectCell(r, c) {
  if (!gameActive) return;
  selectedCell = { r, c };
  highlightBoard(r, c);
}

function highlightBoard(sr, sc) {
  const cells = boardEl.querySelectorAll('.sudoku-cell');
  cells.forEach(cell => {
    cell.classList.remove('selected', 'highlight');
    const r = +cell.dataset.row, c = +cell.dataset.col;
    if (r === sr && c === sc) cell.classList.add('selected');
    else if (r === sr || c === sc || (Math.floor(r/3) === Math.floor(sr/3) && Math.floor(c/3) === Math.floor(sc/3)))
      cell.classList.add('highlight');
  });
}

/* ===== INPUT ===== */
function placeNumber(num) {
  if (!gameActive || !selectedCell) return;
  const { r, c } = selectedCell;
  if (given[r][c]) return;

  if (num === 0) {
    playerBoard[r][c] = 0;
    getCellEl(r, c).textContent = '';
    getCellEl(r, c).classList.remove('player', 'error');
    return;
  }

  const cellEl = getCellEl(r, c);
  playerBoard[r][c] = num;
  cellEl.textContent = num;
  cellEl.classList.add('player');

  if (solution[r][c] !== num) {
    mistakes++;
    mistakesEl.textContent = mistakes;
    cellEl.classList.add('error');
    setTimeout(() => cellEl.classList.remove('error'), 700);
    if (mistakes >= 3) {
      stopTimer();
      gameActive = false;
      recordLoss();
      setTimeout(() => loseModal.classList.remove('hidden'), 400);
    }
  } else {
    cellEl.classList.remove('error');
    cellEl.classList.add('correct-flash');
    setTimeout(() => cellEl.classList.remove('correct-flash'), 500);
    if (checkWin()) {
      stopTimer();
      gameActive = false;
      recordWin();
      showWin();
    }
  }
}

function getCellEl(r, c) {
  return boardEl.querySelector(`[data-row="${r}"][data-col="${c}"]`);
}

function checkWin() {
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 9; c++)
      if (playerBoard[r][c] !== solution[r][c]) return false;
  return true;
}

/* ===== HINT ===== */
document.getElementById('hintBtn').addEventListener('click', () => {
  if (!gameActive || !selectedCell) return;
  const { r, c } = selectedCell;
  if (given[r][c] || playerBoard[r][c] === solution[r][c]) return;
  placeNumber(solution[r][c]);
});

/* ===== WIN / LOSE ===== */
function showWin() {
  document.getElementById('winTime').textContent = formatTime(timerSec);
  document.getElementById('winStreak').textContent = `Streak: ${streak} day${streak !== 1 ? 's' : ''}`;
  winModal.classList.remove('hidden');
  loadLeaderboard(currentDiff);
}

document.getElementById('saveScore').addEventListener('click', () => {
  const name = document.getElementById('playerName').value.trim() || 'Anonymous';
  lbAdd({
    name,
    time: timerSec,
    difficulty: currentDiff,
    streak,
    date: new Date().toISOString().slice(0, 10)
  });
  winModal.classList.add('hidden');
  loadLeaderboard(currentDiff);
});

document.getElementById('playAgain').addEventListener('click', () => {
  winModal.classList.add('hidden');
  newGame();
});
document.getElementById('tryAgain').addEventListener('click', () => {
  loseModal.classList.add('hidden');
  newGame();
});

/* ===== NEW GAME ===== */
function newGame() {
  solution = generateSolution();
  puzzle = createPuzzle(solution, currentDiff);
  playerBoard = puzzle.map(r => [...r]);
  given = puzzle.map(r => r.map(v => v !== 0));
  mistakes = 0;
  mistakesEl.textContent = '0';
  selectedCell = null;
  gameActive = true;
  renderBoard();
  startTimer();
}

/* ===== NUMPAD ===== */
document.querySelectorAll('.numpad-btn').forEach(btn => {
  btn.addEventListener('click', () => placeNumber(+btn.dataset.num));
});

/* ===== KEYBOARD ===== */
document.addEventListener('keydown', (e) => {
  if (!gameActive) return;
  if (e.key >= '1' && e.key <= '9') placeNumber(+e.key);
  if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') placeNumber(0);
  if (!selectedCell) return;
  const { r, c } = selectedCell;
  if (e.key === 'ArrowUp' && r > 0) selectCell(r - 1, c);
  if (e.key === 'ArrowDown' && r < 8) selectCell(r + 1, c);
  if (e.key === 'ArrowLeft' && c > 0) selectCell(r, c - 1);
  if (e.key === 'ArrowRight' && c < 8) selectCell(r, c + 1);
});

/* ===== DIFFICULTY ===== */
document.querySelectorAll('.diff-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentDiff = btn.dataset.diff;
    newGame();
  });
});

document.getElementById('newGameBtn').addEventListener('click', newGame);

/* ===== LEADERBOARD RENDER ===== */
function loadLeaderboard(diff) {
  currentLbDiff = diff;
  const all = lbLoad();
  const filtered = all.filter(e => e.difficulty === diff);
  filtered.sort((a, b) => a.time - b.time);
  const top = filtered.slice(0, 10);

  lbList.innerHTML = '';
  if (!top.length) {
    lbList.innerHTML = '<p class="lb-empty">No scores yet. Be the first!</p>';
    return;
  }
  top.forEach((entry, i) => {
    const div = document.createElement('div');
    div.className = 'lb-entry';
    const rankClasses = ['gold', 'silver', 'bronze'];
    div.innerHTML = `
      <span class="lb-rank ${rankClasses[i] || ''}">${i + 1}</span>
      <div>
        <span class="lb-name">${escapeHtml(entry.name)}</span>
        ${entry.streak > 1 ? `<span class="lb-streak-badge">&#128293; ${entry.streak} streak</span>` : ''}
      </div>
      <span class="lb-time">${formatTime(entry.time)}</span>
    `;
    lbList.appendChild(div);
  });
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

document.querySelectorAll('.lb-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.lb-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    loadLeaderboard(tab.dataset.diff);
  });
});

/* ===== INIT ===== */
loadLeaderboard('easy');
newGame();
