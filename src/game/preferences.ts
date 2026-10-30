import type { Difficulty } from './ai';
import type { Player } from './logic';

/* ===========================
   Preferências de jogo (salvas no navegador)
   =========================== */

export type LocalMode = 'pvp' | 'ai' | 'daily';

export interface Preferences {
  mode: LocalMode;
  difficulty: Difficulty;
  /** Símbolo com que você prefere jogar contra a IA e ao criar sala online (X sempre começa) */
  symbol: Player;
}

const STORAGE_KEY = 'jogo-da-velha:modo-local';
const DEFAULT_PREFERENCES: Preferences = { mode: 'pvp', difficulty: 'medium', symbol: 'x' };

export function loadPreferences(): Preferences {

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? { ...DEFAULT_PREFERENCES, ...JSON.parse(saved) } : DEFAULT_PREFERENCES;
  } catch {
    return DEFAULT_PREFERENCES;
  }

}

export function savePreferences(changes: Partial<Preferences>): Preferences {

  const next = { ...loadPreferences(), ...changes };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Vale só para esta visita
  }

  return next;

}
