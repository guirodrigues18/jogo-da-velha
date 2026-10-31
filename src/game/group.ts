import { MAX_TIMEOUTS, WINNING_LINES } from './logic';

/* ===========================
   Partidas em grupo (online)
   - Duplas 2x2: 4 jogadores, ✕ contra ◯, com as regras do 1x1. A vez gira
     ✕ (lugar 0) → ◯ (1) → ✕ (2) → ◯ (3); cada dupla joga com um símbolo.
   - Champs: 3 ou 4 jogadores, todos contra todos, cada um com um símbolo.
     Vence quem conquistar 3 mini-tabuleiros primeiro; mini-tabuleiro cheio sem
     3 em linha fica com quem tem mais casas nele (empate: ninguém leva).
   =========================== */

export type GroupMode = 'duo' | 'champs';

/** Símbolos: ✕, ◯, △ (t) e □ (s) */
export type Mark = 'x' | 'o' | 't' | 's';

export const MARKS: Mark[] = ['x', 'o', 't', 's'];

/** Como cada símbolo aparece nos textos e painéis */
export const MARK_SYMBOLS: Record<Mark, string> = { x: '✕', o: '◯', t: '△', s: '□' };

export type MarkResult = Mark | 'draw' | null;

export interface GroupBoard {
  cells: (Mark | null)[];
  winner: MarkResult;
}

export interface GroupState {
  mode: GroupMode;
  /** Quantos jogadores (lugares 0 a size - 1) */
  size: number;
  boards: GroupBoard[];
  /** Lugar de quem está com a vez */
  seat: number;
  /** Tabuleiro onde o jogador da vez é obrigado a jogar; null = livre */
  activeBoard: number | null;
  /** Símbolo vencedor (no 2x2, a dupla), 'draw' ou null */
  winner: MarkResult;
  /** Turnos encerrados (jogadas, tempos esgotados e vezes puladas) */
  turn: number;
  /** Tempos esgotados de cada lugar */
  timeouts: number[];
  /** Champs: lugares eliminados (tempo esgotado demais ou saiu da partida) */
  out: boolean[];
}

/** Tempo por jogada nos modos em grupo (precisa ser igual ao das regras do banco) */
export const GROUP_TURN_SECONDS = 15;

/** Champs: mini-tabuleiros para vencer */
export const BOARDS_TO_WIN = 3;

export const DUO_SIZE = 4;
export const CHAMPS_MIN = 3;

export function markOf(mode: GroupMode, seat: number): Mark {

  return mode === 'duo' ? (seat % 2 === 0 ? 'x' : 'o') : MARKS[seat];

}

export function createGroupGame(mode: GroupMode, size: number): GroupState {

  return {
    mode,
    size,
    boards: Array.from({ length: 9 }, () => ({ cells: Array(9).fill(null), winner: null })),
    seat: 0,
    activeBoard: null,
    winner: null,
    turn: 0,
    timeouts: Array(size).fill(0),
    out: Array(size).fill(false)
  };

}

export function currentMark(state: GroupState): Mark {

  return markOf(state.mode, state.seat);

}

export function isGroupBoardPlayable(state: GroupState, boardIndex: number): boolean {

  if (state.winner || state.boards[boardIndex].winner) return false;

  return state.activeBoard === null || state.activeBoard === boardIndex;

}

export function boardsWonBy(state: GroupState, mark: Mark): number {

  return state.boards.filter(b => b.winner === mark).length;

}

export function groupTimeoutsLeft(state: GroupState, seat: number): number {

  return Math.max(0, MAX_TIMEOUTS - state.timeouts[seat]);

}

/** Lugares ainda na disputa */
export function activeSeats(state: GroupState): number[] {

  return state.out.flatMap((out, seat) => (out ? [] : [seat]));

}

/* ---------- Resultado ---------- */

function lineWinner(cells: (Mark | null)[]): Mark | null {

  const line = WINNING_LINES.find(([a, b, c]) => cells[a] && cells[a] === cells[b] && cells[a] === cells[c]);

  return line ? cells[line[0]] : null;

}

/** Símbolo que aparece mais vezes, ou null se houver empate no topo */
function majority(marks: Mark[]): Mark | null {

  const counts = new Map<Mark, number>();

  marks.forEach(mark => counts.set(mark, (counts.get(mark) ?? 0) + 1));

  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);

  if (!sorted.length || sorted[1]?.[1] === sorted[0][1]) return null;

  return sorted[0][0];

}

function boardResult(mode: GroupMode, cells: (Mark | null)[]): MarkResult {

  const line = lineWinner(cells);

  if (line) return line;

  if (!cells.every(Boolean)) return null;

  return mode === 'champs' ? majority(cells as Mark[]) ?? 'draw' : 'draw';

}

function gameResult(state: GroupState, boards: GroupBoard[]): MarkResult {

  const closed = boards.every(b => b.winner);

  if (state.mode === 'duo') {
    const big = boards.map(b => (b.winner === 'draw' ? null : b.winner));
    return lineWinner(big) ?? (closed ? 'draw' : null);
  }

  const players = activeSeats(state).map(seat => markOf('champs', seat));
  const champion = players.find(mark => boards.filter(b => b.winner === mark).length >= BOARDS_TO_WIN);

  if (champion) return champion;

  if (!closed) return null;

  // Todos os tabuleiros fechados: vence quem tem mais (eliminados não contam)
  const won = boards.flatMap(b => (b.winner && b.winner !== 'draw' && players.includes(b.winner) ? [b.winner] : []));

  return majority(won) ?? 'draw';

}

/* ---------- Turnos ---------- */

/**
 * Próximo lugar que ainda está na disputa. No 2x2 a vez sempre alterna entre as duplas:
 * se quem vem a seguir está fora, o parceiro dele joga no lugar.
 */
function nextSeat(state: GroupState, out = state.out): number {

  if (state.mode === 'duo') {
    const next = (state.seat + 1) % DUO_SIZE;
    const partner = (next + 2) % DUO_SIZE;
    if (!out[next]) return next;
    return out[partner] ? state.seat : partner;
  }

  for (let step = 1; step <= state.size; step++) {
    const seat = (state.seat + step) % state.size;
    if (!out[seat]) return seat;
  }

  return state.seat;

}

/** Retorna o novo estado, ou o mesmo estado se a jogada for inválida */
export function applyGroupMove(state: GroupState, boardIndex: number, cellIndex: number): GroupState {

  if (!isGroupBoardPlayable(state, boardIndex) || state.boards[boardIndex].cells[cellIndex]) return state;

  const mark = currentMark(state);

  const boards = state.boards.map((board, i) => {

    if (i !== boardIndex) return board;

    const cells = board.cells.map((c, j) => (j === cellIndex ? mark : c));

    return { cells, winner: boardResult(state.mode, cells) };

  });

  const winner = gameResult(state, boards);
  const turn = state.turn + 1;

  if (winner) return { ...state, boards, winner, activeBoard: null, turn };

  return {
    ...state,
    boards,
    // A posição clicada define o próximo tabuleiro; se ele estiver fechado, fica livre
    activeBoard: boards[cellIndex].winner ? null : cellIndex,
    seat: nextSeat(state),
    turn
  };

}

/** Vencedor quando só sobra um na disputa (no 2x2, uma dupla), ou null */
function lastStanding(mode: GroupMode, out: boolean[]): Mark | null {

  const active = out.flatMap((value, seat) => (value ? [] : [seat]));
  const marks = [...new Set(active.map(seat => markOf(mode, seat)))];

  return marks.length === 1 ? marks[0] : null;

}

/**
 * Tira um lugar da disputa (as peças ficam no tabuleiro); se sobrar um só, ele vence.
 * Com `handOver`, no 2x2 a vez fica com o parceiro (quem saiu não faz a dupla perder a jogada).
 */
function eliminate(state: GroupState, seat: number, timeouts = state.timeouts, handOver = false): GroupState {

  const out = state.out.map((value, i) => value || i === seat);
  const winner = lastStanding(state.mode, out);
  const turn = state.turn + 1;

  if (winner) return { ...state, out, timeouts, winner, activeBoard: null, turn };

  const partner = (seat + 2) % DUO_SIZE;
  const next = handOver && state.mode === 'duo' && !out[partner] ? partner : nextSeat(state, out);

  return { ...state, out, timeouts, seat: next, turn };

}

/**
 * Tempo esgotado: a vez passa ao próximo, no mesmo tabuleiro obrigatório.
 * No tempo esgotado seguinte ao limite, o jogador é eliminado (no 2x2, o parceiro continua).
 */
export function passGroupTurn(state: GroupState): GroupState {

  if (state.winner) return state;

  const timeouts = state.timeouts.map((n, i) => (i === state.seat ? n + 1 : n));

  if (timeouts[state.seat] > MAX_TIMEOUTS) return eliminate(state, state.seat, timeouts);

  return { ...state, timeouts, seat: nextSeat(state), turn: state.turn + 1 };

}

/**
 * Quem está com a vez saiu da partida: é eliminado na hora e a partida segue com quem ficou
 * (no 2x2, o parceiro joga esta vez; no Champs, passa para o próximo)
 */
export function skipLeftSeat(state: GroupState): GroupState {

  if (state.winner) return state;

  return eliminate(state, state.seat, state.timeouts, true);

}

/** A partida acabou porque só sobrou um na disputa (os outros saíram ou foram eliminados) */
export function wonByElimination(state: GroupState): boolean {

  if (!state.winner || state.winner === 'draw') return false;

  return lastStanding(state.mode, state.out) === state.winner && state.out.some(Boolean);

}
