/* ===========================
   Elementos da página
   =========================== */

const mainBoard = document.getElementById('mainBoard');
const turnText = document.getElementById('turnText');
const boardText = document.getElementById('boardText');

const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modalTitle');
const restartBtn = document.getElementById('restartBtn');

/* ===========================
   Estado do jogo
   =========================== */

const WINNING = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

let currentPlayer = 'x';
let activeBoard = null;
let boards = [];

/* ===========================
   Criação do tabuleiro
   =========================== */

function createGame() {

  boards = [];

  mainBoard.innerHTML = '';

  for (let i = 0; i < 9; i++) {

    const board = {
      cells: Array(9).fill(null),
      winner: null,
      element: null
    };

    const boardEl = document.createElement('div');
    boardEl.className = 'mini-board free';
    boardEl.dataset.board = i;

    for (let c = 0; c < 9; c++) {

      const cell = document.createElement('div');

      cell.className = 'cell';

      cell.dataset.board = i;
      cell.dataset.cell = c;

      cell.addEventListener('click', handleMove);

      boardEl.appendChild(cell);

    }

    board.element = boardEl;

    boards.push(board);

    mainBoard.appendChild(boardEl);

  }

  updateBoardHighlights();
  updateTexts();

}

/* ===========================
   Jogadas
   =========================== */

function handleMove(e) {

  const boardIndex = Number(e.target.dataset.board);
  const cellIndex = Number(e.target.dataset.cell);

  const board = boards[boardIndex];

  if (board.winner) return;

  if (activeBoard !== null && activeBoard !== boardIndex) {

    const forcedBoard = boards[activeBoard];

    if (!forcedBoard.winner) {
      return;
    }

  }

  if (board.cells[cellIndex]) return;

  board.cells[cellIndex] = currentPlayer;

  e.target.classList.add(currentPlayer);

  const winner = checkWinner(board.cells);

  if (winner) {

    board.winner = winner;

    finishMiniBoard(boardIndex, winner);

  } else if (board.cells.every(c => c)) {

    board.winner = 'draw';

    finishMiniBoard(boardIndex, 'draw');

  }

  const bigWinner = checkBigWinner();

  if (bigWinner) {

    finishGame(bigWinner);

    return;

  }

  activeBoard = cellIndex;

  if (boards[activeBoard].winner) {

    activeBoard = null;
  }

  currentPlayer = currentPlayer === 'x' ? 'o' : 'x';

  updateTexts();
  updateBoardHighlights();

}

function finishMiniBoard(index, winner) {

  const board = boards[index];

  board.element.classList.add('locked');

  const overlay = document.createElement('div');

  overlay.className = 'board-overlay';

  if (winner === 'x') {

    overlay.classList.add('x');
    overlay.innerText = 'X';

  } else if (winner === 'o') {

    overlay.classList.add('o');
    overlay.innerText = 'O';

  } else {

    overlay.classList.add('draw');
    overlay.innerText = 'EMPATE';

  }

  board.element.appendChild(overlay);

}

/* ===========================
   Verificação de vitória
   =========================== */

function checkWinner(cells) {

  for (const combo of WINNING) {

    const [a, b, c] = combo;

    if (
      cells[a] &&
      cells[a] === cells[b] &&
      cells[a] === cells[c]
    ) {
      return cells[a];
    }

  }

  return null;

}

function checkBigWinner() {

  const bigCells = boards.map(b => {

    if (b.winner === 'draw') {
      return null;
    }

    return b.winner;

  });

  return checkWinner(bigCells);

}

/* ===========================
   Interface
   =========================== */

function updateTexts() {

  turnText.innerText =
    currentPlayer === 'x' ?
    'Jogador X' :
    'Jogador O';

  if (activeBoard === null) {

    boardText.innerText =
      'Livre — qualquer tabuleiro';

  } else {

    boardText.innerText =
      `Tabuleiro ${activeBoard + 1}`;

  }

}

function updateBoardHighlights() {

  boards.forEach((board, index) => {

    board.element.classList.remove('active');
    board.element.classList.remove('free');
    board.element.classList.remove('x-turn');
    board.element.classList.remove('o-turn');

    if (board.winner) return;

    if (activeBoard === null) {

      board.element.classList.add('free');

    } else if (index === activeBoard) {

      board.element.classList.add('active');
      board.element.classList.add(currentPlayer === 'x' ? 'x-turn' : 'o-turn');

    }

  });

}

/* ===========================
   Fim de jogo / reinício
   =========================== */

function finishGame(winner) {

  modal.classList.add('show');

  modalTitle.innerText =
    winner === 'x' ?
    '✕ Jogador X venceu!' :
    '◯ Jogador O venceu!';

  setTimeout(() => {

    restartGame();

  }, 4000);

}

function restartGame() {

  modal.classList.remove('show');

  currentPlayer = 'x';

  activeBoard = null;

  createGame();

}

restartBtn.addEventListener('click', restartGame);

createGame();
