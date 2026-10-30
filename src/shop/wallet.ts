import { useSyncExternalStore } from 'react';
import { DEFAULT_EQUIPPED, findItem, type ItemId, type ItemType } from './catalog';

/* ===========================
   Moedas, itens comprados e itens em uso (salvos no navegador;
   com login, também na nuvem)
   =========================== */

export interface Profile {
  coins: number;
  owned: ItemId[];
  equipped: Record<ItemType, ItemId>;
}

/** Presente de boas-vindas, para dar para comprar algo logo nas primeiras vitórias */
const WELCOME_COINS = 30;
const STORAGE_KEY = 'jogo-da-velha:perfil';

export function emptyProfile(): Profile {

  return {
    coins: WELCOME_COINS,
    owned: Object.values(DEFAULT_EQUIPPED),
    equipped: { ...DEFAULT_EQUIPPED }
  };

}

/* ---------- Regras (funções puras) ---------- */

/** Novo perfil depois da compra, ou null se não der para comprar */
export function purchase(profile: Profile, id: ItemId): Profile | null {

  const item = findItem(id);

  if (!item || profile.owned.includes(id) || profile.coins < item.price) return null;

  return { ...profile, coins: profile.coins - item.price, owned: [...profile.owned, id] };

}

export function equip(profile: Profile, id: ItemId): Profile | null {

  const item = findItem(id);

  if (!item || !profile.owned.includes(id)) return null;

  return { ...profile, equipped: { ...profile.equipped, [item.type]: id } };

}

/** Tira itens que saíram da loja; o que estava em uso volta para o padrão */
export function withoutRemovedItems(profile: Profile): Profile {

  const owned = profile.owned.filter(id => findItem(id));
  const equipped = { ...DEFAULT_EQUIPPED };

  for (const [type, id] of Object.entries(profile.equipped) as [ItemType, ItemId][]) {
    if (findItem(id)?.type === type && owned.includes(id)) equipped[type] = id;
  }

  return { ...profile, owned, equipped };

}

/* ---------- Estado e armazenamento ---------- */

/**
 * Moedas pelas partidas jogadas antes de a loja existir, calculadas pelas
 * estatísticas já salvas (o nível das vitórias antigas não foi guardado, então usa a média).
 */
export function retroactiveCoins(stats: { wins?: number; draws?: number; losses?: number; unlocked?: object } | null): number {

  if (!stats) return 0;

  const achievements = Object.keys(stats.unlocked ?? {}).length;

  return (stats.wins ?? 0) * 10 + (stats.draws ?? 0) * 3 + (stats.losses ?? 0) + achievements * 10;

}

/** Moedas retroativas dadas nesta visita (para avisar uma vez) */
let retroactiveBonus = 0;

function load(): Profile {

  try {

    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      // Primeira visita com a loja: dá as boas-vindas e paga as partidas anteriores
      const stats = localStorage.getItem('jogo-da-velha:stats');
      retroactiveBonus = retroactiveCoins(stats ? JSON.parse(stats) : null);
      const first = { ...emptyProfile(), coins: WELCOME_COINS + retroactiveBonus };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(first));
      return first;
    }

    const parsed = JSON.parse(saved) as Profile;

    return withoutRemovedItems({ ...emptyProfile(), ...parsed, equipped: { ...DEFAULT_EQUIPPED, ...parsed.equipped } });

  } catch {
    return emptyProfile();
  }

}

let profile = load();

/** Moedas retroativas ainda não avisadas (devolve uma vez só) */
export function takeRetroactiveBonus(): number {

  const bonus = retroactiveBonus;

  retroactiveBonus = 0;

  return bonus;

}

const listeners = new Set<() => void>();
const coinListeners = new Set<(amount: number, label?: string) => void>();

function update(next: Profile) {

  profile = next;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // Sem armazenamento, vale só para esta visita
  }

  applyTheme();
  listeners.forEach(listener => listener());

}

export function getProfile(): Profile {

  return profile;

}

export function subscribeProfile(listener: () => void): () => void {

  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };

}

export function useProfile(): Profile {

  return useSyncExternalStore(subscribeProfile, getProfile);

}

interface CoinOptions {
  /** Motivo mostrado no aviso (padrão: "Moedas ganhas") */
  label?: string;
  /** Sem aviso de moedas (quem chamou já mostrou o próprio aviso) */
  quiet?: boolean;
}

export function addCoins(amount: number, { label, quiet = false }: CoinOptions = {}) {

  if (amount <= 0) return;

  update({ ...profile, coins: profile.coins + amount });

  if (!quiet) coinListeners.forEach(listener => listener(amount, label));

}

/** Avisa quando moedas são ganhas (para mostrar "+10 🪙") */
export function onCoinsEarned(listener: (amount: number, label?: string) => void): () => void {

  coinListeners.add(listener);

  return () => {
    coinListeners.delete(listener);
  };

}

export function buyItem(id: ItemId): boolean {

  const next = purchase(profile, id);

  if (next) update(next);

  return Boolean(next);

}

export function equipItem(id: ItemId) {

  const next = equip(profile, id);

  if (next) update(next);

}

/** Usado pela sincronização com a nuvem */
export function replaceProfile(next: Profile) {

  update(next);

}

/** Aplica o tema em uso (cores do tabuleiro e do fundo) */
export function applyTheme() {

  if (typeof document === 'undefined') return;

  const theme = profile.equipped.theme.replace('theme-', '');

  if (theme === 'neon') delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = theme;

}
