import type { GameRecord } from '../stats/achievements';

/** Moedas ganhas por partida e por conquista */
export const COINS = {
  win: { easy: 5, medium: 10, hard: 25 },
  onlineWin: 20,
  dailyWin: 15,
  draw: 3,
  loss: 1,
  achievement: 10
};

export function coinsForGame(record: GameRecord): number {

  if (record.result === 'draw') return COINS.draw;
  if (record.result === 'loss') return COINS.loss;

  if (record.mode === 'online') return COINS.onlineWin;
  if (record.mode === 'daily') return COINS.dailyWin;

  return COINS.win[record.difficulty ?? 'easy'];

}

/** XP: só vitórias, online ou contra a IA (fica no perfil e vai para a nuvem) */
export const XP = {
  win: { easy: 1, medium: 3, hard: 6 },
  onlineWin: 10
};

export function xpForGame(record: GameRecord): number {

  if (record.result !== 'win') return 0;

  if (record.mode === 'online') return XP.onlineWin;
  if (record.mode === 'ai') return XP.win[record.difficulty ?? 'easy'];

  return 0;

}
