import { useSyncExternalStore } from 'react';

/* ===========================
   Rivais: placar contra cada pessoa que você já enfrentou online
   (salvo no navegador; com login, também na nuvem) e o ranking entre vocês
   =========================== */

export interface Rival {
  /** Último apelido usado por ela */
  name: string;
  /** Suas vitórias, derrotas e empates contra ela */
  wins: number;
  losses: number;
  draws: number;
  /** Última partida (ms) */
  last: number;
}

/** Id do adversário no Firebase → placar */
export type Rivals = Record<string, Rival>;

export interface RankingRow {
  /** null = você */
  id: string | null;
  name: string;
  wins: number;
  losses: number;
  draws: number;
  games: number;
  /** Aproveitamento: vitória vale 1, empate vale meio */
  rate: number;
}

/* ---------- Regras (funções puras) ---------- */

export function applyRivalGame(rivals: Rivals, id: string, name: string, result: 'win' | 'loss' | 'draw', now = Date.now()): Rivals {

  const current = rivals[id] ?? { name, wins: 0, losses: 0, draws: 0, last: 0 };

  return {
    ...rivals,
    [id]: {
      name,
      wins: current.wins + (result === 'win' ? 1 : 0),
      losses: current.losses + (result === 'loss' ? 1 : 0),
      draws: current.draws + (result === 'draw' ? 1 : 0),
      last: now
    }
  };

}

const rate = (wins: number, draws: number, games: number) => (games ? (wins + draws / 2) / games : 0);

/**
 * Ranking entre você e seus rivais, pelo aproveitamento nas partidas entre vocês.
 * O seu aproveitamento soma todas as partidas contra rivais.
 */
export function rivalRanking(rivals: Rivals, youName: string): RankingRow[] {

  const rows: RankingRow[] = Object.entries(rivals).map(([id, r]) => {
    const games = r.wins + r.losses + r.draws;
    // Do ponto de vista do rival: as suas derrotas são as vitórias dele
    return { id, name: r.name, wins: r.losses, losses: r.wins, draws: r.draws, games, rate: rate(r.losses, r.draws, games) };
  });

  const you = rows.reduce(
    (total, r) => ({ ...total, wins: total.wins + r.losses, losses: total.losses + r.wins, draws: total.draws + r.draws, games: total.games + r.games }),
    { id: null, name: youName, wins: 0, losses: 0, draws: 0, games: 0, rate: 0 } as RankingRow
  );

  you.rate = rate(you.wins, you.draws, you.games);

  // Empate no aproveitamento: quem jogou mais fica na frente
  return [you, ...rows].sort((a, b) => b.rate - a.rate || b.games - a.games);

}

/** Junta o placar do aparelho com o da nuvem: maiores números e o apelido mais recente */
export function mergeRivals(local: Rivals, cloud: Rivals | undefined): Rivals {

  const merged: Rivals = { ...cloud };

  for (const [id, mine] of Object.entries(local)) {
    const theirs = merged[id];
    merged[id] = theirs
      ? {
        name: mine.last >= theirs.last ? mine.name : theirs.name,
        wins: Math.max(mine.wins, theirs.wins),
        losses: Math.max(mine.losses, theirs.losses),
        draws: Math.max(mine.draws, theirs.draws),
        last: Math.max(mine.last, theirs.last)
      }
      : mine;
  }

  return merged;

}

/* ---------- Armazenamento ---------- */

const STORAGE_KEY = 'jogo-da-velha:rivais';

function load(): Rivals {

  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as Rivals;
  } catch {
    return {};
  }

}

let rivals = load();
const listeners = new Set<() => void>();

function save(next: Rivals) {

  rivals = next;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Vale só para esta visita
  }

  listeners.forEach(listener => listener());

}

export function getRivals(): Rivals {

  return rivals;

}

/** Avisa qualquer mudança no placar (para a tela e para sincronizar com a nuvem) */
export function onRivalsChange(listener: () => void): () => void {

  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };

}

export function useRivals(): Rivals {

  return useSyncExternalStore(onRivalsChange, getRivals);

}

/** Partida online terminada contra `id` */
export function recordRival(id: string, name: string, result: 'win' | 'loss' | 'draw') {

  save(applyRivalGame(rivals, id, name, result));

}

/** Usado pela sincronização com a nuvem */
export function replaceRivals(next: Rivals) {

  save(next);

}

/* ===========================
   Revanche: o botão do ranking abre uma sala nova para desafiar aquele rival
   =========================== */

let challenge: string | null = null;
const challengeListeners = new Set<() => void>();

function setChallenge(id: string | null) {

  challenge = id;
  challengeListeners.forEach(listener => listener());

}

function subscribeChallenge(listener: () => void): () => void {

  challengeListeners.add(listener);

  return () => {
    challengeListeners.delete(listener);
  };

}

/** Rival que você está desafiando agora (null fora de uma revanche) */
export function useChallenge(): Rival | null {

  const id = useSyncExternalStore(subscribeChallenge, () => challenge);

  return id ? rivals[id] ?? null : null;

}

export function startChallenge(id: string) {

  setChallenge(id);

}

export function clearChallenge() {

  setChallenge(null);

}

/** O App troca para o modo online quando uma revanche começa */
export function onChallengeStart(listener: () => void): () => void {

  return subscribeChallenge(() => {
    if (challenge) listener();
  });

}
