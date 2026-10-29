/* ===========================
   Tipos
   =========================== */

export type Player = 'x' | 'o';
export type Cell = Player | null;
export type Result = Player | 'draw' | null;

export interface MiniBoard {
  cells: Cell[];
  winner: Result;
}

export interface GameState {
  boards: MiniBoard[];
  currentPlayer: Player;
  /** Tabuleiro onde o jogador atual é obrigado a jogar; null = livre */
  activeBoard: number | null;
  winner: Result;
  /** Quantidade de turnos já encerrados (jogadas + tempos esgotados) */
  turn: number;
}

/* ===========================
   Estado inicial
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

export function createGame(): GameState {

  return {
    boards: Array.from({ length: 9 }, () => ({
      cells: Array(9).fill(null),
      winner: null
    })),
    currentPlayer: 'x',
    activeBoard: null,
    winner: null,
    turn: 0
  };

}

function opponent(player: Player): Player {

  return player === 'x' ? 'o' : 'x';

}

/* ===========================
   Verificação de vitória
   =========================== */

function findLine(cells: Cell[]): number[] | null {

  const line = WINNING.find(([a, b, c]) =>
    cells[a] &&
    cells[a] === cells[b] &&
    cells[a] === cells[c]
  );

  return line ?? null;

}

function checkLine(cells: Cell[]): Player | null {

  const line = findLine(cells);

  return line ? cells[line[0]] : null;

}

/** Tabuleiro principal visto como um jogo da velha comum (empate não conta para ninguém) */
function toBigCells(boards: MiniBoard[]): Cell[] {

  return boards.map(b => (b.winner === 'draw' ? null : b.winner));

}

/** Índices dos 3 mini-tabuleiros que formaram a linha vencedora */
export function getWinningLine(boards: MiniBoard[]): number[] | null {

  return findLine(toBigCells(boards));

}

function getBoardResult(cells: Cell[]): Result {

  return checkLine(cells) ?? (cells.every(c => c) ? 'draw' : null);

}

function getGameResult(boards: MiniBoard[]): Result {

  const winner = checkLine(toBigCells(boards));

  if (winner) return winner;

  // Todos os mini-tabuleiros fechados sem linha no tabuleiro grande
  return boards.every(b => b.winner) ? 'draw' : null;

}

/* ===========================
   Jogadas
   =========================== */

export function isBoardPlayable(state: GameState, boardIndex: number): boolean {

  if (state.winner || state.boards[boardIndex].winner) return false;

  return state.activeBoard === null || state.activeBoard === boardIndex;

}

/** Retorna o novo estado, ou o mesmo estado se a jogada for inválida */
export function applyMove(state: GameState, boardIndex: number, cellIndex: number): GameState {

  if (!isBoardPlayable(state, boardIndex)) return state;

  if (state.boards[boardIndex].cells[cellIndex]) return state;

  const boards = state.boards.map((board, i) => {

    if (i !== boardIndex) return board;

    const cells = board.cells.map((c, j) => (j === cellIndex ? state.currentPlayer : c));

    return { cells, winner: getBoardResult(cells) };

  });

  const winner = getGameResult(boards);

  const turn = state.turn + 1;

  if (winner) {
    return { ...state, boards, winner, activeBoard: null, turn };
  }

  return {
    boards,
    winner: null,
    // A posição clicada define o próximo tabuleiro; se ele estiver fechado, fica livre
    activeBoard: boards[cellIndex].winner ? null : cellIndex,
    currentPlayer: opponent(state.currentPlayer),
    turn
  };

}

/** Tempo esgotado: a vez passa ao adversário, que joga no mesmo tabuleiro obrigatório */
export function passTurn(state: GameState): GameState {

  if (state.winner) return state;

  return { ...state, currentPlayer: opponent(state.currentPlayer), turn: state.turn + 1 };

}
