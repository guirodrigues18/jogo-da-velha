import type { Difficulty } from '../game/ai';
import type { GameState, Player } from '../game/logic';
import { addCoins } from '../shop/wallet';
import { COINS, coinsForGame } from '../shop/rewards';
import { trackMission } from './missions';
import { rewardInvitedPlayer } from '../online/invite';

/* ===========================
   Estatísticas e conquistas (salvas no navegador; com login, também na nuvem)
   Contam só partidas em que existe um "você": contra a IA, desafio diário e online.
   =========================== */

export interface Stats {
  played: number;
  wins: number;
  losses: number;
  draws: number;
  streak: number;
  bestStreak: number;
  /** Conquistas desbloqueadas: id → data (ms) */
  unlocked: Partial<Record<AchievementId, number>>;
}

export interface GameRecord {
  mode: 'ai' | 'daily' | 'online';
  difficulty?: Difficulty;
  result: 'win' | 'loss' | 'draw';
  /** Mini-tabuleiros conquistados por você */
  boardsWon: number;
  /** Mini-tabuleiros conquistados pelo adversário */
  boardsLost: number;
  /** Total de jogadas da partida (dos dois jogadores) */
  moves: number;
  /** Com qual símbolo você jogou */
  symbol?: Player;
}

export type AchievementId =
  | 'first-win'
  | 'beat-easy'
  | 'beat-medium'
  | 'beat-hard'
  | 'online-win'
  | 'daily-win'
  | 'streak-3'
  | 'streak-5'
  | 'flawless'
  | 'quick'
  | 'conqueror'
  | 'veteran'
  | 'spectator'
  | 'sharer';

/** Título e descrição ficam nos textos de cada idioma (i18n), pelo id */
export interface Achievement {
  id: AchievementId;
  icon: string;
}

type Check = (stats: Stats, record: GameRecord) => boolean;

const win = (record: GameRecord) => record.result === 'win';

const DEFINITIONS: (Achievement & { check?: Check })[] = [
  { id: 'first-win', icon: '🥇', check: (_, r) => win(r) },
  { id: 'beat-easy', icon: '🤖', check: (_, r) => win(r) && r.difficulty === 'easy' },
  { id: 'beat-medium', icon: '🧠', check: (_, r) => win(r) && r.difficulty === 'medium' },
  { id: 'beat-hard', icon: '👑', check: (_, r) => win(r) && r.difficulty === 'hard' },
  { id: 'online-win', icon: '🌐', check: (_, r) => win(r) && r.mode === 'online' },
  { id: 'daily-win', icon: '📅', check: (_, r) => win(r) && r.mode === 'daily' },
  { id: 'streak-3', icon: '🔥', check: s => s.streak >= 3 },
  { id: 'streak-5', icon: '☄️', check: s => s.streak >= 5 },
  { id: 'flawless', icon: '🛡️', check: (_, r) => win(r) && r.boardsLost === 0 },
  { id: 'quick', icon: '⚡', check: (_, r) => win(r) && r.moves <= 30 },
  { id: 'conqueror', icon: '🎯', check: (_, r) => r.boardsWon >= 5 },
  { id: 'veteran', icon: '🎖️', check: s => s.played >= 10 },
  { id: 'spectator', icon: '👀' },
  { id: 'sharer', icon: '📸' }
];

export const ACHIEVEMENTS: Achievement[] = DEFINITIONS.map(({ check: _check, ...achievement }) => achievement);

/* ===========================
   Regras (funções puras)
   =========================== */

export function emptyStats(): Stats {

  return { played: 0, wins: 0, losses: 0, draws: 0, streak: 0, bestStreak: 0, unlocked: {} };

}

/** Novo estado das estatísticas e conquistas desbloqueadas por esta partida */
export function applyRecord(stats: Stats, record: GameRecord, now = Date.now()): { stats: Stats; unlocked: Achievement[] } {

  const streak = record.result === 'win' ? stats.streak + 1 : 0;

  const next: Stats = {
    ...stats,
    played: stats.played + 1,
    wins: stats.wins + (record.result === 'win' ? 1 : 0),
    losses: stats.losses + (record.result === 'loss' ? 1 : 0),
    draws: stats.draws + (record.result === 'draw' ? 1 : 0),
    streak,
    bestStreak: Math.max(stats.bestStreak, streak),
    unlocked: { ...stats.unlocked }
  };

  const unlocked = DEFINITIONS.filter(a => !next.unlocked[a.id] && a.check?.(next, record));

  for (const achievement of unlocked) next.unlocked[achievement.id] = now;

  return { stats: next, unlocked: unlocked.map(({ check: _check, ...a }) => a) };

}

/** Resumo da partida do ponto de vista de `me` */
export function recordFromGame(game: GameState, me: Player, mode: GameRecord['mode'], difficulty?: Difficulty): GameRecord {

  const opponent: Player = me === 'x' ? 'o' : 'x';

  let result: GameRecord['result'] = 'draw';

  if (game.winner === me) result = 'win';
  else if (game.winner === opponent) result = 'loss';

  return {
    mode,
    difficulty,
    result,
    boardsWon: game.boards.filter(b => b.winner === me).length,
    boardsLost: game.boards.filter(b => b.winner === opponent).length,
    moves: game.boards.reduce((total, b) => total + b.cells.filter(Boolean).length, 0),
    symbol: me
  };

}

/* ===========================
   Armazenamento e avisos
   =========================== */

const STORAGE_KEY = 'jogo-da-velha:stats';

type Listener = (unlocked: Achievement[]) => void;

const listeners = new Set<Listener>();
const changeListeners = new Set<() => void>();

export function loadStats(): Stats {

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? { ...emptyStats(), ...JSON.parse(saved) } : emptyStats();
  } catch {
    return emptyStats();
  }

}

function save(stats: Stats) {

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch {
    // Armazenamento indisponível: as estatísticas valem só para esta visita
  }

  changeListeners.forEach(listener => listener());

}

function notify(unlocked: Achievement[]) {

  if (unlocked.length) listeners.forEach(listener => listener(unlocked));

}

/** Registra uma partida terminada, paga as moedas, avisa as conquistas novas e avança as missões */
export function recordGame(record: GameRecord) {

  const { stats, unlocked } = applyRecord(loadStats(), record);

  save(stats);
  notify(unlocked);
  addCoins(coinsForGame(record) + unlocked.length * COINS.achievement);
  trackMission({ kind: 'game', record });
  rewardInvitedPlayer();

}

/** Conquistas que não dependem de partida (assistir, compartilhar) */
export function unlockAchievement(id: AchievementId) {

  const stats = loadStats();

  if (stats.unlocked[id]) return;

  stats.unlocked[id] = Date.now();
  save(stats);
  notify(ACHIEVEMENTS.filter(a => a.id === id));
  addCoins(COINS.achievement);

}

/** Usado pela sincronização com a nuvem */
export function replaceStats(stats: Stats) {

  save(stats);

}

/** Avisa qualquer mudança nas estatísticas (para sincronizar com a nuvem) */
export function onStatsChange(listener: () => void): () => void {

  changeListeners.add(listener);

  return () => {
    changeListeners.delete(listener);
  };

}

export function onAchievementsUnlocked(listener: Listener): () => void {

  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };

}
