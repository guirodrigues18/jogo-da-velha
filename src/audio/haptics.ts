import { isMuted } from './sounds';

/** Padrões de vibração (ms vibrando, ms parado, ...) */
export const VIBRATION = {
  move: 15,
  board: [40, 40, 60],
  win: [80, 60, 80, 60, 160],
  invalid: 50
};

/**
 * Vibra o aparelho (Android; o iPhone não permite em sites).
 * Desligar o som também desliga a vibração.
 */
export function vibrate(pattern: number | number[]) {

  if (isMuted() || !('vibrate' in navigator)) return;

  try {
    navigator.vibrate(pattern);
  } catch {
    // Alguns navegadores bloqueiam vibração sem interação recente
  }

}
