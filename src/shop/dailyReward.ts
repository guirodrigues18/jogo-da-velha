import { useSyncExternalStore } from 'react';
import { dateKey } from '../game/daily';
import { addCoins } from './wallet';

/* ===========================
   Recompensa diária
   Entrar em dias seguidos aumenta a recompensa até o dia 7 (depois recomeça);
   pular um dia volta ao dia 1.
   =========================== */

export const DAILY_REWARDS = [10, 15, 20, 25, 30, 40, 80];

export interface LoginState {
  /** Último dia em que pegou a recompensa (AAAA-MM-DD) */
  last: string | null;
  /** Dia do ciclo (1 a 7) pego por último */
  day: number;
  /** Dias seguidos pegando a recompensa */
  streak: number;
}

export interface DailyRewardInfo {
  /** Já pegou a de hoje */
  claimed: boolean;
  /** Dia do ciclo de hoje (1 a 7) */
  day: number;
  coins: number;
  /** Dias seguidos contando hoje */
  streak: number;
  /** Moedas de amanhã, se continuar a sequência */
  tomorrow: number;
}

/* ---------- Regras (funções puras) ---------- */

function yesterdayKey(date: Date): string {

  return dateKey(new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1));

}

export function rewardInfo(state: LoginState, now = new Date()): DailyRewardInfo {

  const coinsOf = (day: number) => DAILY_REWARDS[day - 1];
  const nextDay = (day: number) => (day % DAILY_REWARDS.length) + 1;

  if (state.last === dateKey(now)) {
    return { claimed: true, day: state.day, coins: coinsOf(state.day), streak: state.streak, tomorrow: coinsOf(nextDay(state.day)) };
  }

  const continues = state.last === yesterdayKey(now);
  const day = continues ? nextDay(state.day) : 1;

  return {
    claimed: false,
    day,
    coins: coinsOf(day),
    streak: continues ? state.streak + 1 : 1,
    tomorrow: coinsOf(nextDay(day))
  };

}

/** Estado depois de pegar a recompensa de hoje, ou null se já pegou */
export function claimReward(state: LoginState, now = new Date()): LoginState | null {

  const info = rewardInfo(state, now);

  if (info.claimed) return null;

  return { last: dateKey(now), day: info.day, streak: info.streak };

}

/* ---------- Armazenamento ---------- */

const STORAGE_KEY = 'jogo-da-velha:recompensa';

function load(): LoginState {

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved) as LoginState;
  } catch {
    // Sem armazenamento: começa do dia 1
  }

  return { last: null, day: 0, streak: 0 };

}

let state = load();
let info = rewardInfo(state);

const listeners = new Set<() => void>();

function getInfo(): DailyRewardInfo {

  // Virou o dia com o jogo aberto
  const fresh = rewardInfo(state);

  if (fresh.claimed !== info.claimed || fresh.day !== info.day) info = fresh;

  return info;

}

function subscribe(listener: () => void): () => void {

  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };

}

export function useDailyReward(): DailyRewardInfo {

  return useSyncExternalStore(subscribe, getInfo);

}

/** Pega a recompensa de hoje; devolve as moedas ganhas (0 se já tinha pegado) */
export function claimDailyReward(label?: string): number {

  const next = claimReward(state);

  if (!next) return 0;

  state = next;
  info = rewardInfo(state);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Vale só para esta visita
  }

  addCoins(info.coins, { label });
  listeners.forEach(listener => listener());

  return info.coins;

}

/**
 * Abre a recompensa sozinha ao entrar? Só para quem já conhece o jogo
 * (quem chega pela primeira vez vê o jogo direto; a recompensa fica no botão 🏅).
 */
export function shouldGreet(hasPlayed: boolean): boolean {

  return !getInfo().claimed && (state.last !== null || hasPlayed);

}
