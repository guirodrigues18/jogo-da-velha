import { applyMove, createGame, getValidMoves, type GameState } from './logic';
import { hashString, seededRandom } from './random';

/* ===========================
   Desafio diário
   Todo dia, uma partida contra o computador (nível Médio) que começa numa posição
   sorteada a partir da data: igual para todo mundo, como o Wordle.
   =========================== */

export interface DailyChallenge {
  /** Número do desafio (#1 foi em 30/10/2026) */
  number: number;
  seed: number;
  start: GameState;
}

export interface DailyProgress {
  number: number;
  attempts: number;
  won: boolean;
  /** Jogadas da partida vencedora (as suas e as do computador) */
  moves: number;
}

export interface DailyStreak {
  /** Último desafio vencido */
  lastWon: number;
  current: number;
  best: number;
}

const FIRST_DAY = new Date(2026, 9, 30);
const DAY_MS = 24 * 60 * 60 * 1000;

/** Data local no formato AAAA-MM-DD (o desafio vira à meia-noite de cada pessoa) */
export function dateKey(date: Date): string {

  const pad = (n: number) => String(n).padStart(2, '0');

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

}

function challengeNumber(date: Date): number {

  const day = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  return Math.round((day.getTime() - FIRST_DAY.getTime()) / DAY_MS) + 1;

}

export function dailyChallenge(date = new Date()): DailyChallenge {

  const seed = hashString(`jogo-da-velha:${dateKey(date)}`);
  const random = seededRandom(seed);

  // Abertura de 6, 8 ou 10 jogadas aleatórias (número par: a vez é sempre sua, com X)
  const openingMoves = 6 + Math.floor(random() * 3) * 2;

  let start = createGame();

  for (let i = 0; i < openingMoves && !start.winner; i++) {
    const moves = getValidMoves(start);
    start = applyMove(start, ...moves[Math.floor(random() * moves.length)]);
  }

  return { number: challengeNumber(date), seed, start };

}

/** Gerador das respostas do computador: a mesma posição recebe sempre a mesma resposta */
export function dailyRandom(challenge: DailyChallenge, state: GameState): () => number {

  return seededRandom(challenge.seed + state.turn);

}

/* ===========================
   Progresso (salvo no navegador)
   =========================== */

const PROGRESS_KEY = 'jogo-da-velha:desafio';
const STREAK_KEY = 'jogo-da-velha:desafio-sequencia';

function read<T>(key: string): T | null {

  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) as T : null;
  } catch {
    return null;
  }

}

function write(key: string, value: unknown) {

  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Sem armazenamento, o progresso vale só para esta visita
  }

}

export function loadDailyProgress(number: number): DailyProgress {

  const saved = read<DailyProgress>(PROGRESS_KEY);

  return saved?.number === number ? saved : { number, attempts: 0, won: false, moves: 0 };

}

export function loadDailyStreak(): DailyStreak {

  return read<DailyStreak>(STREAK_KEY) ?? { lastWon: 0, current: 0, best: 0 };

}

/** Registra uma tentativa terminada; vitórias depois da primeira não mudam nada */
export function recordDailyAttempt(number: number, won: boolean, moves: number): DailyProgress {

  const progress = loadDailyProgress(number);

  if (progress.won) return progress;

  const next = { number, attempts: progress.attempts + 1, won, moves: won ? moves : 0 };

  write(PROGRESS_KEY, next);

  if (won) {
    const streak = loadDailyStreak();
    const current = streak.lastWon === number - 1 ? streak.current + 1 : 1;
    write(STREAK_KEY, { lastWon: number, current, best: Math.max(streak.best, current) });
  }

  return next;

}
