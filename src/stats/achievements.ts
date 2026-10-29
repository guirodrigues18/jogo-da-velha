import type { Difficulty } from '../game/ai';
import type { GameState, Player } from '../game/logic';

/* ===========================
   Estatísticas e conquistas (salvas no navegador)
   Contam só partidas em que existe um "você": contra o computador e online.
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
  mode: 'ai' | 'online';
  difficulty?: Difficulty;
  result: 'win' | 'loss' | 'draw';
  /** Mini-tabuleiros conquistados por você */
  boardsWon: number;
  /** Mini-tabuleiros conquistados pelo adversário */
  boardsLost: number;
  /** Total de jogadas da partida (dos dois jogadores) */
  moves: number;
}

export type AchievementId =
  | 'first-win'
  | 'beat-easy'
  | 'beat-medium'
  | 'beat-hard'
  | 'online-win'
  | 'streak-3'
  | 'streak-5'
  | 'flawless'
  | 'quick'
  | 'conqueror'
  | 'veteran'
  | 'spectator'
  | 'sharer';

export interface Achievement {
  id: AchievementId;
  icon: string;
  title: string;
  description: string;
}

type Check = (stats: Stats, record: GameRecord) => boolean;

const win = (record: GameRecord) => record.result === 'win';

const DEFINITIONS: (Achievement & { check?: Check })[] = [
  { id: 'first-win', icon: '🥇', title: 'Primeira vitória', description: 'Vença sua primeira partida', check: (_, r) => win(r) },
  { id: 'beat-easy', icon: '🤖', title: 'Aquecimento', description: 'Vença o computador no Fácil', check: (_, r) => win(r) && r.difficulty === 'easy' },
  { id: 'beat-medium', icon: '🧠', title: 'Estrategista', description: 'Vença o computador no Médio', check: (_, r) => win(r) && r.difficulty === 'medium' },
  { id: 'beat-hard', icon: '👑', title: 'Mestre da velha', description: 'Vença o computador no Difícil', check: (_, r) => win(r) && r.difficulty === 'hard' },
  { id: 'online-win', icon: '🌐', title: 'Desafiante', description: 'Vença uma partida online', check: (_, r) => win(r) && r.mode === 'online' },
  { id: 'streak-3', icon: '🔥', title: 'Embalado', description: 'Vença 3 partidas seguidas', check: s => s.streak >= 3 },
  { id: 'streak-5', icon: '☄️', title: 'Imparável', description: 'Vença 5 partidas seguidas', check: s => s.streak >= 5 },
  { id: 'flawless', icon: '🛡️', title: 'Intocável', description: 'Vença sem o adversário conquistar nenhum tabuleiro', check: (_, r) => win(r) && r.boardsLost === 0 },
  { id: 'quick', icon: '⚡', title: 'Relâmpago', description: 'Vença uma partida com até 30 jogadas no total', check: (_, r) => win(r) && r.moves <= 30 },
  { id: 'conqueror', icon: '🎯', title: 'Conquistador', description: 'Conquiste 5 tabuleiros em uma partida', check: (_, r) => r.boardsWon >= 5 },
  { id: 'veteran', icon: '🎖️', title: 'Veterano', description: 'Jogue 10 partidas', check: s => s.played >= 10 },
  { id: 'spectator', icon: '👀', title: 'Comentarista', description: 'Assista a uma partida online' },
  { id: 'sharer', icon: '📸', title: 'Influencer', description: 'Compartilhe uma vitória' }
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
    moves: game.boards.reduce((total, b) => total + b.cells.filter(Boolean).length, 0)
  };

}

/* ===========================
   Armazenamento e avisos
   =========================== */

const STORAGE_KEY = 'jogo-da-velha:stats';

type Listener = (unlocked: Achievement[]) => void;

const listeners = new Set<Listener>();

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

}

function notify(unlocked: Achievement[]) {

  if (unlocked.length) listeners.forEach(listener => listener(unlocked));

}

/** Registra uma partida terminada e avisa as conquistas novas */
export function recordGame(record: GameRecord) {

  const { stats, unlocked } = applyRecord(loadStats(), record);

  save(stats);
  notify(unlocked);

}

/** Conquistas que não dependem de partida (assistir, compartilhar) */
export function unlockAchievement(id: AchievementId) {

  const stats = loadStats();

  if (stats.unlocked[id]) return;

  stats.unlocked[id] = Date.now();
  save(stats);
  notify(ACHIEVEMENTS.filter(a => a.id === id));

}

export function onAchievementsUnlocked(listener: Listener): () => void {

  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };

}
