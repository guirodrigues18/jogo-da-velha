import {
  endAt,
  get,
  limitToFirst,
  onDisconnect,
  onValue,
  orderByChild,
  query,
  ref,
  remove,
  runTransaction,
  serverTimestamp,
  set,
  update
} from 'firebase/database';
import {
  createGroupGame,
  DUO_SIZE,
  type GroupMode,
  type GroupState,
  type Mark,
  type MarkResult
} from '../game/group';
import { db } from './firebase';
import type { JoinError, Reaction } from './rooms';

/* ===========================
   Grupos online (2x2 Duplas e Champs), em parties/{id}.
   Ficam separados das salas 1x1 (rooms/), com regras próprias no banco.
   Lugares: 0 é quem criou; os outros entram pelo link, em ordem.
   =========================== */

type PerSeat<T> = Partial<Record<string, T>>;

interface StoredGroupState {
  /** 81 caracteres: x, o, t, s ou - */
  cells: string;
  /** 9 caracteres: x, o, t, s, d (empate) ou - */
  results: string;
  /** Lugar da vez: '0' a '3' */
  seat: string;
  activeBoard: number;
  winner: string;
  turn: number;
  /** Um dígito por lugar */
  timeouts: string;
  /** Um caractere por lugar: 1 = eliminado */
  out: string;
}

interface StoredParty {
  host: string;
  mode: GroupMode;
  /** Máximo de jogadores: 4 no 2x2; 3 ou 4 no Champs */
  max: number;
  seats?: PerSeat<string>;
  names?: PerSeat<string>;
  online?: PerSeat<boolean>;
  started?: boolean;
  /** Jogadores da partida, definido ao começar */
  size?: number;
  state?: StoredGroupState;
  left?: PerSeat<boolean>;
  rematch?: PerSeat<boolean>;
  /** Vitórias de cada símbolo nas partidas anteriores */
  score?: Partial<Record<Mark, number>>;
  spectators?: Record<string, string>;
  reactions?: Record<string, Reaction>;
}

export interface Party {
  host: string;
  mode: GroupMode;
  max: number;
  /** uid de cada lugar ocupado (índice = lugar) */
  seats: (string | null)[];
  names: (string | null)[];
  online: boolean[];
  left: boolean[];
  rematch: boolean[];
  started: boolean;
  size: number;
  state: GroupState | null;
  score: Partial<Record<Mark, number>>;
  spectators: Record<string, string>;
  reactions: Record<string, Reaction>;
}

export type PartySeat = number | 'spectator';

export interface PartyPreview {
  mode: GroupMode;
  max: number;
  hostName: string | null;
  /** Já começou ou está cheio: quem entrar vai assistir */
  watching: boolean;
}

const MAX_SEATS = 4;
const MAX_SPECTATORS = 10;

const PARTY_ID_ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789';
const PARTY_ID_LENGTH = 6;

const partyRef = (partyId: string, path = '') => ref(db, `parties/${partyId}${path && `/${path}`}`);

function generatePartyId(): string {

  const bytes = crypto.getRandomValues(new Uint8Array(PARTY_ID_LENGTH));

  return Array.from(bytes, b => PARTY_ID_ALPHABET[b % PARTY_ID_ALPHABET.length]).join('');

}

/* ---------- Formato salvo ---------- */

const EMPTY = '-';
const DRAW = 'd';

const resultToChar = (result: MarkResult) => (result === 'draw' ? DRAW : result ?? EMPTY);
const charToResult = (char: string): MarkResult => {
  if (char === DRAW) return 'draw';
  return char === EMPTY ? null : (char as Mark);
};

export function encodeGroupState(state: GroupState): StoredGroupState {

  return {
    cells: state.boards.map(b => b.cells.map(c => c ?? EMPTY).join('')).join(''),
    results: state.boards.map(b => resultToChar(b.winner)).join(''),
    seat: String(state.seat),
    activeBoard: state.activeBoard ?? -1,
    winner: resultToChar(state.winner),
    turn: state.turn,
    timeouts: state.timeouts.join(''),
    out: state.out.map(out => (out ? '1' : '0')).join('')
  };

}

export function decodeGroupState(stored: StoredGroupState, mode: GroupMode, size: number): GroupState {

  return {
    mode,
    size,
    boards: Array.from({ length: 9 }, (_, i) => ({
      cells: [...stored.cells.slice(i * 9, i * 9 + 9)].map(c => (c === EMPTY ? null : (c as Mark))),
      winner: charToResult(stored.results[i])
    })),
    seat: Number(stored.seat),
    activeBoard: stored.activeBoard === -1 ? null : stored.activeBoard,
    winner: charToResult(stored.winner),
    turn: stored.turn,
    timeouts: [...stored.timeouts].map(Number),
    out: [...stored.out].map(c => c === '1')
  };

}

/** O horário de início do turno é definido pelo servidor (usado pelas regras do cronômetro) */
function toStored(state: GroupState) {

  return { ...encodeGroupState(state), turnStartedAt: serverTimestamp() };

}

const perSeat = <T>(values: PerSeat<T> | undefined, fallback: T): T[] =>
  Array.from({ length: MAX_SEATS }, (_, i) => values?.[i] ?? fallback);

/* ---------- Grupo ---------- */

export async function createParty(uid: string, mode: GroupMode, max: number): Promise<string> {

  const partyId = generatePartyId();

  await set(partyRef(partyId), {
    host: uid,
    mode,
    max: mode === 'duo' ? DUO_SIZE : max,
    seats: { 0: uid },
    createdAt: serverTimestamp()
  });

  cleanupOldParties();

  return partyId;

}

/** Entra no grupo: devolve o lugar (ou espectador) ou o motivo de não conseguir */
export async function joinParty(partyId: string, uid: string): Promise<PartySeat | JoinError> {

  const snapshot = await get(partyRef(partyId));

  if (!snapshot.exists()) return 'not-found';

  const party = snapshot.val() as StoredParty;
  const seats = perSeat(party.seats, null as string | null);
  const left = perSeat(party.left, false);

  // Quem já faz parte (ex.: recarregou a página) volta para o mesmo lugar, a menos que tenha saído
  const mine = seats.indexOf(uid);

  if (mine !== -1) return left[mine] ? 'closed' : mine;

  // Quem criou o grupo saiu antes de começar
  if (left[0]) return 'closed';

  const watch = (): PartySeat | JoinError => {
    const watching = Object.keys(party.spectators ?? {}).filter(id => id !== uid).length;
    return watching < MAX_SPECTATORS ? 'spectator' : 'full';
  };

  if (party.started) return watch();

  // Transação no primeiro lugar livre: se duas pessoas entrarem juntas, a outra tenta o seguinte
  for (let seat = 1; seat < party.max; seat++) {

    if (seats[seat]) continue;

    const result = await runTransaction(partyRef(partyId, `seats/${seat}`), current => (current === null ? uid : undefined));

    if (result.snapshot.val() === uid) return seat;

  }

  return watch();

}

export function subscribeParty(partyId: string, onChange: (party: Party | null) => void): () => void {

  return onValue(partyRef(partyId), snapshot => {

    const data = snapshot.val() as StoredParty | null;

    if (!data) {
      onChange(null);
      return;
    }

    const size = data.size ?? 0;

    onChange({
      host: data.host,
      mode: data.mode,
      max: data.max,
      seats: perSeat(data.seats, null),
      names: perSeat(data.names, null),
      online: perSeat(data.online, false),
      left: perSeat(data.left, false),
      rematch: perSeat(data.rematch, false),
      started: Boolean(data.started),
      size,
      state: data.state && size ? decodeGroupState(data.state, data.mode, size) : null,
      score: data.score ?? {},
      spectators: data.spectators ?? {},
      reactions: data.reactions ?? {}
    });

  });

}

/** Para o convite dizer "Fulano te chamou para o Champs" (requer login) */
export async function getPartyPreview(partyId: string): Promise<PartyPreview | null> {

  const snapshot = await get(partyRef(partyId));

  if (!snapshot.exists()) return null;

  const party = snapshot.val() as StoredParty;
  const seats = perSeat(party.seats, null as string | null);

  return {
    mode: party.mode,
    max: party.max,
    hostName: party.names?.[0] ?? null,
    watching: Boolean(party.started) || seats.slice(0, party.max).every(Boolean)
  };

}

export function savePartyName(partyId: string, seat: number, name: string): Promise<void> {

  return set(partyRef(partyId, `names/${seat}`), name);

}

/** Quem criou começa a partida com quem já entrou (as regras conferem o mínimo de jogadores) */
export function startParty(partyId: string, mode: GroupMode, size: number): Promise<void> {

  return update(partyRef(partyId), {
    started: true,
    size,
    state: toStored(createGroupGame(mode, size))
  });

}

/** Grava o novo estado. As regras do banco recusam jogadas fora da vez */
export function saveGroupState(partyId: string, state: GroupState): Promise<void> {

  return set(partyRef(partyId, 'state'), toStored(state));

}

/**
 * Sair do grupo. Antes de começar, quem foi convidado libera o lugar; quem criou encerra o grupo.
 * Depois de começar: no 2x2 a partida acaba; no Champs, quem saiu é eliminado e a vez pula ele.
 */
export function leaveParty(partyId: string, seat: number, started: boolean): Promise<void> {

  if (!started && seat > 0) return update(partyRef(partyId), { [`names/${seat}`]: null, [`seats/${seat}`]: null });

  return set(partyRef(partyId, `left/${seat}`), true);

}

export function requestPartyRematch(partyId: string, seat: number): Promise<void> {

  return set(partyRef(partyId, `rematch/${seat}`), true);

}

export function clearPartyRematch(partyId: string, seat: number): Promise<void> {

  return remove(partyRef(partyId, `rematch/${seat}`));

}

/** Nova partida e, na mesma gravação, a vitória da que terminou no placar */
export function startPartyRematch(partyId: string, finished: GroupState, score: Party['score']): Promise<void> {

  const winner = finished.winner;
  const changes: Record<string, unknown> = { state: toStored(createGroupGame(finished.mode, finished.size)) };

  if (winner && winner !== 'draw') changes[`score/${winner}`] = (score[winner] ?? 0) + 1;

  return update(partyRef(partyId), changes);

}

export function sendPartyReaction(partyId: string, uid: string, emoji: string, nickname: string): Promise<void> {

  return set(partyRef(partyId, `reactions/${uid}`), { e: emoji, n: nickname, t: serverTimestamp() });

}

/* ---------- Presença ---------- */

/** Mantém um valor gravado enquanto a conexão existir; devolve a função para remover */
function keepWhileConnected(partyId: string, path: string, value: unknown): () => void {

  const presenceRef = partyRef(partyId, path);

  const unsubscribe = onValue(ref(db, '.info/connected'), snapshot => {

    if (!snapshot.val()) return;

    onDisconnect(presenceRef).remove()
      .then(() => set(presenceRef, value))
      .catch(() => {});

  });

  return () => {
    unsubscribe();
    onDisconnect(presenceRef).cancel().catch(() => {});
    remove(presenceRef).catch(() => {});
  };

}

export function trackPartyPresence(partyId: string, seat: number): () => void {

  return keepWhileConnected(partyId, `online/${seat}`, true);

}

export function watchPartyAsSpectator(partyId: string, uid: string, nickname: string): () => void {

  return keepWhileConnected(partyId, `spectators/${uid}`, nickname);

}

/* ---------- Limpeza de grupos antigos (igual às salas: só os com mais de uma semana) ---------- */

const PARTY_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const CLOCK_MARGIN_MS = 60 * 60 * 1000;
const CLEANUP_BATCH = 20;
const CLEANUP_INTERVAL_MS = 12 * 60 * 60 * 1000;
const CLEANUP_KEY = 'jogo-da-velha:limpeza-grupos';

async function cleanupOldParties() {

  try {

    const last = Number(localStorage.getItem(CLEANUP_KEY) ?? 0);

    if (Date.now() - last < CLEANUP_INTERVAL_MS) return;

    localStorage.setItem(CLEANUP_KEY, String(Date.now()));

    const old = await get(query(
      ref(db, 'parties'),
      orderByChild('createdAt'),
      endAt(Date.now() - PARTY_MAX_AGE_MS - CLOCK_MARGIN_MS),
      limitToFirst(CLEANUP_BATCH)
    ));

    await Promise.all(Object.keys(old.val() ?? {}).map(id => remove(partyRef(id))));

  } catch {
    // Só manutenção: se falhar, tenta de novo no próximo grupo criado
  }

}
