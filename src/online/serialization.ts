import type { Cell, GameState, Player, Result } from '../game/logic';

/**
 * Formato salvo no banco. Usa strings compactas porque o Realtime Database
 * não guarda null dentro de arrays, e strings são fáceis de validar nas regras.
 */
export interface StoredState {
  /** 81 caracteres (9 tabuleiros × 9 células): x, o ou - */
  cells: string;
  /** 9 caracteres: x, o, d (empate) ou - */
  results: string;
  currentPlayer: Player;
  /** -1 = livre */
  activeBoard: number;
  /** x, o, d (empate) ou - */
  winner: string;
  turn: number;
  /** 2 dígitos: tempos esgotados do X e do O (ausente em salas antigas) */
  timeouts?: string;
}

const EMPTY = '-';
const DRAW = 'd';

const cellToChar = (cell: Cell) => cell ?? EMPTY;
const charToCell = (char: string): Cell => (char === EMPTY ? null : (char as Player));

const resultToChar = (result: Result) => (result === 'draw' ? DRAW : result ?? EMPTY);
const charToResult = (char: string): Result => {
  if (char === DRAW) return 'draw';
  return char === EMPTY ? null : (char as Player);
};

export function encodeState(state: GameState): StoredState {

  return {
    cells: state.boards.map(b => b.cells.map(cellToChar).join('')).join(''),
    results: state.boards.map(b => resultToChar(b.winner)).join(''),
    currentPlayer: state.currentPlayer,
    activeBoard: state.activeBoard ?? -1,
    winner: resultToChar(state.winner),
    turn: state.turn,
    timeouts: `${state.timeouts.x}${state.timeouts.o}`
  };

}

export function decodeState(stored: StoredState): GameState {

  return {
    boards: Array.from({ length: 9 }, (_, i) => ({
      cells: [...stored.cells.slice(i * 9, i * 9 + 9)].map(charToCell),
      winner: charToResult(stored.results[i])
    })),
    currentPlayer: stored.currentPlayer,
    activeBoard: stored.activeBoard === -1 ? null : stored.activeBoard,
    winner: charToResult(stored.winner),
    turn: stored.turn,
    timeouts: { x: Number(stored.timeouts?.[0] ?? 0), o: Number(stored.timeouts?.[1] ?? 0) }
  };

}
