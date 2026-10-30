import { useSyncExternalStore } from 'react';
import { dateKey } from '../game/daily';
import { hashString, seededRandom } from '../game/random';
import { addCoins } from '../shop/wallet';
import { showToast } from '../effects/toasts';
import { track } from '../online/consent';
import { t } from '../i18n';
import type { GameRecord } from './achievements';

/* ===========================
   Missões diárias
   Todo dia, três missões (uma fácil, uma média e uma difícil) sorteadas pela data,
   iguais para todo mundo. Dá para trocar uma por dia.
   Contam as partidas contra a IA, o desafio diário e as online.
   =========================== */

export type MissionTier = 'easy' | 'medium' | 'hard';

export type MissionId =
  | 'play-2'
  | 'win-1'
  | 'boards-5'
  | 'daily-play'
  | 'ai-medium'
  | 'win-3'
  | 'win-medium'
  | 'win-as-o'
  | 'boards-12'
  | 'daily-win'
  | 'play-online'
  | 'quick-40'
  | 'react-3'
  | 'share'
  | 'win-hard'
  | 'win-online'
  | 'flawless'
  | 'streak-3'
  | 'win-5'
  | 'conquer-5';

export type MissionEvent =
  | { kind: 'game'; record: GameRecord }
  | { kind: 'reaction' }
  | { kind: 'share' };

/** O texto de cada missão fica nos textos de cada idioma (i18n), pelo id */
export interface Mission {
  id: MissionId;
  icon: string;
  tier: MissionTier;
  goal: number;
}

interface Definition extends Mission {
  /** Quanto o evento faz a missão avançar */
  advance: (event: MissionEvent) => number;
  /** Vitórias seguidas: uma derrota ou empate zera o progresso */
  streak?: boolean;
}

export const TIERS: MissionTier[] = ['easy', 'medium', 'hard'];

export const MISSION_COINS: Record<MissionTier, number> = { easy: 15, medium: 25, hard: 40 };

/** Bônus por completar as três missões do dia */
export const ALL_DONE_BONUS = 30;

const fromGame = (count: (record: GameRecord) => number) =>
  (event: MissionEvent) => (event.kind === 'game' ? count(event.record) : 0);

const won = (record: GameRecord) => record.result === 'win';
const vsAI = (record: GameRecord, difficulty: GameRecord['difficulty']) => record.mode === 'ai' && record.difficulty === difficulty;
const one = (condition: boolean) => (condition ? 1 : 0);

const DEFINITIONS: Definition[] = [
  { id: 'play-2', icon: '🎮', tier: 'easy', goal: 2, advance: fromGame(() => 1) },
  { id: 'win-1', icon: '🏆', tier: 'easy', goal: 1, advance: fromGame(r => one(won(r))) },
  { id: 'boards-5', icon: '🧩', tier: 'easy', goal: 5, advance: fromGame(r => r.boardsWon) },
  { id: 'daily-play', icon: '📅', tier: 'easy', goal: 1, advance: fromGame(r => one(r.mode === 'daily')) },
  { id: 'ai-medium', icon: '🤖', tier: 'easy', goal: 1, advance: fromGame(r => one(vsAI(r, 'medium'))) },

  { id: 'win-3', icon: '🏆', tier: 'medium', goal: 3, advance: fromGame(r => one(won(r))) },
  { id: 'win-medium', icon: '🧠', tier: 'medium', goal: 1, advance: fromGame(r => one(won(r) && vsAI(r, 'medium'))) },
  { id: 'win-as-o', icon: '⭕', tier: 'medium', goal: 1, advance: fromGame(r => one(won(r) && r.symbol === 'o')) },
  { id: 'boards-12', icon: '🧩', tier: 'medium', goal: 12, advance: fromGame(r => r.boardsWon) },
  { id: 'daily-win', icon: '📅', tier: 'medium', goal: 1, advance: fromGame(r => one(won(r) && r.mode === 'daily')) },
  { id: 'play-online', icon: '🌐', tier: 'medium', goal: 1, advance: fromGame(r => one(r.mode === 'online')) },
  { id: 'quick-40', icon: '⚡', tier: 'medium', goal: 1, advance: fromGame(r => one(won(r) && r.moves <= 40)) },
  { id: 'react-3', icon: '😂', tier: 'medium', goal: 3, advance: event => one(event.kind === 'reaction') },
  { id: 'share', icon: '📸', tier: 'medium', goal: 1, advance: event => one(event.kind === 'share') },

  { id: 'win-hard', icon: '👑', tier: 'hard', goal: 1, advance: fromGame(r => one(won(r) && vsAI(r, 'hard'))) },
  { id: 'win-online', icon: '⚔️', tier: 'hard', goal: 1, advance: fromGame(r => one(won(r) && r.mode === 'online')) },
  { id: 'flawless', icon: '🛡️', tier: 'hard', goal: 1, advance: fromGame(r => one(won(r) && r.boardsLost === 0)) },
  { id: 'streak-3', icon: '🔥', tier: 'hard', goal: 3, streak: true, advance: fromGame(r => one(won(r))) },
  { id: 'win-5', icon: '🏅', tier: 'hard', goal: 5, advance: fromGame(r => one(won(r))) },
  { id: 'conquer-5', icon: '🎯', tier: 'hard', goal: 1, advance: fromGame(r => one(r.boardsWon >= 5)) }
];

export const MISSIONS: Mission[] = DEFINITIONS.map(({ advance: _advance, streak: _streak, ...mission }) => mission);

export interface MissionState {
  /** Dia das missões (AAAA-MM-DD) */
  date: string;
  /** Uma missão de cada nível: fácil, média e difícil */
  ids: MissionId[];
  progress: Partial<Record<MissionId, number>>;
  /** Já trocou uma missão hoje */
  swapped: boolean;
}

/* ===========================
   Regras (funções puras)
   =========================== */

function definition(id: MissionId): Definition {

  return DEFINITIONS.find(d => d.id === id)!;

}

export function findMission(id: MissionId): Mission {

  return MISSIONS.find(m => m.id === id)!;

}

/** Missões do dia, sorteadas pela data (iguais para todo mundo) */
export function missionsForDate(date: Date): MissionState {

  const random = seededRandom(hashString(`jogo-da-velha:missoes:${dateKey(date)}`));

  const ids = TIERS.map(tier => {
    const pool = DEFINITIONS.filter(d => d.tier === tier);
    return pool[Math.floor(random() * pool.length)].id;
  });

  return { date: dateKey(date), ids, progress: {}, swapped: false };

}

export function isDone(state: MissionState, id: MissionId): boolean {

  return (state.progress[id] ?? 0) >= definition(id).goal;

}

export function allDone(state: MissionState): boolean {

  return state.ids.every(id => isDone(state, id));

}

/**
 * Avança as missões com o evento; devolve as que acabaram de ser concluídas.
 * Se nada mudou, devolve o mesmo estado.
 */
export function applyMissionEvent(state: MissionState, event: MissionEvent): { state: MissionState; completed: Mission[] } {

  const progress = { ...state.progress };
  const completed: Mission[] = [];
  let changed = false;

  for (const id of state.ids) {

    const mission = definition(id);
    const before = progress[id] ?? 0;

    if (before >= mission.goal) continue;

    const step = mission.advance(event);
    const brokeStreak = mission.streak && event.kind === 'game' && step === 0;
    const after = brokeStreak ? 0 : Math.min(before + step, mission.goal);

    if (after === before) continue;

    progress[id] = after;
    changed = true;

    if (after >= mission.goal) completed.push(findMission(id));

  }

  return { state: changed ? { ...state, progress } : state, completed };

}

/** Troca uma missão não concluída por outra do mesmo nível (uma vez por dia); null se não puder */
export function swapMission(state: MissionState, id: MissionId, random = Math.random): MissionState | null {

  if (state.swapped || !state.ids.includes(id) || isDone(state, id)) return null;

  const { tier } = definition(id);
  const options = DEFINITIONS.filter(d => d.tier === tier && !state.ids.includes(d.id));
  const replacement = options[Math.floor(random() * options.length)];

  const progress = { ...state.progress };
  delete progress[id];

  return {
    ...state,
    ids: state.ids.map(current => (current === id ? replacement.id : current)),
    progress,
    swapped: true
  };

}

/* ===========================
   Armazenamento
   =========================== */

const STORAGE_KEY = 'jogo-da-velha:missoes';

function load(): MissionState {

  const now = new Date();

  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') as MissionState | null;
    const valid = saved?.date === dateKey(now) && saved.ids.every(id => DEFINITIONS.some(d => d.id === id));
    if (saved && valid) return saved;
  } catch {
    // Armazenamento indisponível ou corrompido: começa as missões de hoje do zero
  }

  return missionsForDate(now);

}

let state = load();

const listeners = new Set<() => void>();

/** Missões de hoje (passou da meia-noite: troca pelas do novo dia) */
export function getMissions(): MissionState {

  if (state.date !== dateKey(new Date())) state = load();

  return state;

}

function save(next: MissionState) {

  state = next;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Vale só para esta visita
  }

  listeners.forEach(listener => listener());

}

function subscribe(listener: () => void): () => void {

  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };

}

export function useMissions(): MissionState {

  return useSyncExternalStore(subscribe, getMissions);

}

/** Registra um evento (partida, reação, compartilhamento) e paga as missões concluídas */
export function trackMission(event: MissionEvent) {

  const before = getMissions();
  const { state: next, completed } = applyMissionEvent(before, event);

  if (next === before) return;

  save(next);

  for (const mission of completed) {
    const coins = MISSION_COINS[mission.tier];
    addCoins(coins, { quiet: true });
    showToast({ icon: mission.icon, label: t.missions.completed(coins), title: t.missions.items[mission.id], sound: true });
    track('mission_complete', { mission_id: mission.id, tier: mission.tier });
  }

  if (completed.length && allDone(next)) {
    addCoins(ALL_DONE_BONUS, { label: t.missions.allDone });
    track('missions_all_done');
  }

}

export function swapTodayMission(id: MissionId) {

  const next = swapMission(getMissions(), id);

  if (next) {
    save(next);
    track('mission_swap', { mission_id: id });
  }

}
