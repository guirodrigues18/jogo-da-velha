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
import { createGame, type GameState, type Player } from '../game/logic';
import { db } from './firebase';
import { decodeState, encodeState, type StoredState } from './serialization';

/* ===========================
   Tipos
   =========================== */

/** Quem cria a sala escolhe X ou O; o convidado fica com o lugar livre */
type Players = Partial<Record<Player, string>>;

type PerPlayer<T> = Partial<Record<Player, T>>;

interface StoredRoom {
  players: Players;
  state: StoredState;
  online?: PerPlayer<boolean>;
  names?: PerPlayer<string>;
  /** Quem saiu: true = botão "Sair"; 'abandoned' = ficou desconectado tempo demais */
  left?: PerPlayer<LeftReason>;
  /** Quando cada jogador perdeu a conexão pela última vez (horário do servidor) */
  seen?: PerPlayer<number>;
  /** Pedidos de revanche; a nova partida começa quando os dois pedem */
  rematch?: PerPlayer<boolean>;
  /** Espectadores conectados: uid → apelido */
  spectators?: Record<string, string>;
  /** Vitórias de cada um nas partidas anteriores desta sala */
  score?: PerPlayer<number>;
  /** Última reação de cada pessoa: uid → emoji, apelido e horário */
  reactions?: Record<string, Reaction>;
  /** Símbolo da loja que cada jogador usa (o adversário vê) */
  skins?: PerPlayer<string>;
}

export interface Reaction {
  /** Emoji */
  e: string;
  /** Apelido de quem reagiu */
  n: string;
  /** Horário (servidor) */
  t: number;
}

export type LeftReason = true | 'abandoned';

export interface Room {
  players: Players;
  state: GameState;
  online: PerPlayer<boolean>;
  names: PerPlayer<string>;
  left: PerPlayer<LeftReason>;
  rematch: PerPlayer<boolean>;
  spectators: Record<string, string>;
  score: PerPlayer<number>;
  reactions: Record<string, Reaction>;
  skins: PerPlayer<string>;
}

/** Precisa ser igual à lista nas regras do banco (database.rules.json) */
export const REACTION_EMOJIS = ['😂', '🔥', '😱', '👏', '😎', '😭'];

/** Lugar de quem entrou: jogador (X, O) ou espectador */
export type Seat = Player | 'spectator';

export type JoinError = 'not-found' | 'full' | 'closed';

export interface Joined {
  seat: Seat;
  /** Quem criou a sala, quando você acabou de ocupar o lugar livre (foi convidado) */
  inviter?: string;
}

export interface RoomPreview {
  names: PerPlayer<string>;
  /** Lugar de quem criou a sala, enquanto ele ainda espera o convidado */
  hostRole: Player | null;
  /** Já tem dois jogadores: quem entrar agora vai assistir */
  full: boolean;
}

/* ===========================
   Salas
   =========================== */

// Sem caracteres ambíguos (0/o, 1/l/i) para facilitar ditar o código da sala
const ROOM_ID_ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789';
const ROOM_ID_LENGTH = 6;

/** Limite por sala, para uma partida não consumir todas as conexões do plano gratuito */
export const MAX_SPECTATORS = 10;

const roomRef = (roomId: string, path = '') => ref(db, `rooms/${roomId}${path && `/${path}`}`);

function generateRoomId(): string {

  const bytes = crypto.getRandomValues(new Uint8Array(ROOM_ID_LENGTH));

  return Array.from(bytes, b => ROOM_ID_ALPHABET[b % ROOM_ID_ALPHABET.length]).join('');

}

/** O horário de início do turno é definido pelo servidor (usado pelas regras do cronômetro) */
function toStored(state: GameState) {

  return { ...encodeState(state), turnStartedAt: serverTimestamp() };

}

/** Cria uma sala nova; quem cria joga com o símbolo escolhido (X sempre começa) */
export async function createRoom(uid: string, role: Player): Promise<string> {

  const roomId = generateRoomId();

  await set(roomRef(roomId), {
    players: { [role]: uid },
    state: toStored(createGame()),
    createdAt: serverTimestamp()
  });

  cleanupOldRooms();

  return roomId;

}

/** Entra na sala: devolve o lugar (X, O ou espectador) ou o motivo de não conseguir entrar */
export async function joinRoom(roomId: string, uid: string): Promise<Joined | JoinError> {

  const snapshot = await get(roomRef(roomId));

  if (!snapshot.exists()) return 'not-found';

  const { players, left = {}, spectators = {} } = snapshot.val() as StoredRoom;

  // Quem já faz parte da sala (ex.: recarregou a página) volta para o mesmo papel,
  // a menos que tenha saído dela
  if (players.x === uid) return left.x ? 'closed' : { seat: 'x' };
  if (players.o === uid) return left.o ? 'closed' : { seat: 'o' };

  const openSeat: Player | null = !players.x ? 'x' : !players.o ? 'o' : null;

  if (!openSeat) {
    const watching = Object.keys(spectators).filter(id => id !== uid).length;
    return watching < MAX_SPECTATORS ? { seat: 'spectator' } : 'full';
  }

  const host: Player = openSeat === 'x' ? 'o' : 'x';

  // Quem criou a sala desistiu antes de alguém entrar
  if (left[host]) return 'closed';

  // Transação: se duas pessoas abrirem o convite ao mesmo tempo, só uma entra (a outra assiste)
  const result = await runTransaction(
    roomRef(roomId, `players/${openSeat}`),
    current => (current === null ? uid : undefined)
  );

  return result.snapshot.val() === uid ? { seat: openSeat, inviter: players[host] } : { seat: 'spectator' };

}

export function subscribeRoom(roomId: string, onChange: (room: Room | null) => void): () => void {

  return onValue(roomRef(roomId), snapshot => {

    const data = snapshot.val() as StoredRoom | null;

    onChange(data && {
      players: data.players,
      state: decodeState(data.state),
      online: data.online ?? {},
      names: data.names ?? {},
      left: data.left ?? {},
      rematch: data.rematch ?? {},
      spectators: data.spectators ?? {},
      score: data.score ?? {},
      reactions: data.reactions ?? {},
      skins: data.skins ?? {}
    });

  });

}

/** Quem está na sala, para o convite dizer "Fulano te desafiou" ou "Fulano vs Ciclano" (requer login) */
export async function getRoomPreview(roomId: string): Promise<RoomPreview | null> {

  const snapshot = await get(roomRef(roomId));

  if (!snapshot.exists()) return null;

  const { players, names = {} } = snapshot.val() as StoredRoom;

  const full = Boolean(players.x && players.o);
  let hostRole: Player | null = null;

  if (!full) hostRole = players.x ? 'x' : 'o';

  return { names, hostRole, full };

}

export function saveSkin(roomId: string, role: Player, itemId: string): Promise<void> {

  return set(roomRef(roomId, `skins/${role}`), itemId);

}

/* ===========================
   Limpeza de salas antigas
   Sem servidor pago: quem cria uma sala apaga até 20 salas com mais de uma semana
   (as regras do banco só permitem apagar salas antigas).
   =========================== */

const ROOM_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
/** Margem para o relógio do aparelho estar adiantado em relação ao do servidor */
const CLOCK_MARGIN_MS = 60 * 60 * 1000;
const CLEANUP_BATCH = 20;
const CLEANUP_INTERVAL_MS = 12 * 60 * 60 * 1000;
const CLEANUP_KEY = 'jogo-da-velha:limpeza';

async function cleanupOldRooms() {

  try {

    // No máximo duas vezes por dia por aparelho
    const last = Number(localStorage.getItem(CLEANUP_KEY) ?? 0);

    if (Date.now() - last < CLEANUP_INTERVAL_MS) return;

    localStorage.setItem(CLEANUP_KEY, String(Date.now()));

    const oldRooms = await get(query(
      ref(db, 'rooms'),
      orderByChild('createdAt'),
      endAt(Date.now() - ROOM_MAX_AGE_MS - CLOCK_MARGIN_MS),
      limitToFirst(CLEANUP_BATCH)
    ));

    await Promise.all(Object.keys(oldRooms.val() ?? {}).map(id => remove(roomRef(id))));

  } catch {
    // Limpeza é só manutenção: se falhar, tenta de novo na próxima sala criada
  }

}

export function requestRematch(roomId: string, role: Player): Promise<void> {

  return set(roomRef(roomId, `rematch/${role}`), true);

}

export function clearRematch(roomId: string, role: Player): Promise<void> {

  return remove(roomRef(roomId, `rematch/${role}`));

}

/**
 * Começa a nova partida e, na mesma gravação, soma a vitória da partida que terminou
 * ao placar (as regras só aceitam o placar junto com o reinício).
 */
export function startRematch(roomId: string, finished: GameState, score: PerPlayer<number>): Promise<void> {

  const winner = finished.winner;
  const changes: Record<string, unknown> = { state: toStored(createGame()) };

  if (winner === 'x' || winner === 'o') changes[`score/${winner}`] = (score[winner] ?? 0) + 1;

  return update(roomRef(roomId), changes);

}

export function sendReaction(roomId: string, uid: string, emoji: string, nickname: string): Promise<void> {

  return set(roomRef(roomId, `reactions/${uid}`), { e: emoji, n: nickname, t: serverTimestamp() });

}

/** Sair da sala pelo botão "Sair": conta como desistência para o adversário */
export function leaveRoom(roomId: string, role: Player): Promise<void> {

  return set(roomRef(roomId, `left/${role}`), true);

}

/**
 * Declara que o adversário abandonou a partida. As regras do banco só aceitam
 * se ele estiver desconectado há mais de ABANDON_SECONDS (pelo relógio do servidor).
 */
export function claimAbandonment(roomId: string, opponent: Player): Promise<void> {

  return set(roomRef(roomId, `left/${opponent}`), 'abandoned');

}

/** Precisa ser igual ao valor nas regras do banco (database.rules.json) */
export const ABANDON_SECONDS = 240;

export function saveName(roomId: string, role: Player, name: string): Promise<void> {

  return set(roomRef(roomId, `names/${role}`), name);

}

/** Grava o novo estado. As regras do banco recusam jogadas fora da vez */
export function saveState(roomId: string, state: GameState): Promise<void> {

  return set(roomRef(roomId, 'state'), toStored(state));

}

/* ===========================
   Presença
   =========================== */

/** Mantém um valor gravado enquanto a conexão existir; devolve a função para remover */
function keepWhileConnected(roomId: string, path: string, value: unknown): () => void {

  const presenceRef = roomRef(roomId, path);

  const unsubscribe = onValue(ref(db, '.info/connected'), snapshot => {

    if (!snapshot.val()) return;

    // Se a conexão cair (aba fechada, sem internet), o servidor remove o valor sozinho
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

/**
 * Marca o jogador como online. Se a conexão cair, o servidor também anota a hora
 * (usada para decidir quando a partida pode ser dada como abandonada).
 */
export function trackPresence(roomId: string, role: Player): () => void {

  const seenRef = roomRef(roomId, `seen/${role}`);
  const unsubscribe = onValue(ref(db, '.info/connected'), snapshot => {
    if (snapshot.val()) onDisconnect(seenRef).set(serverTimestamp()).catch(() => {});
  });

  const stopOnline = keepWhileConnected(roomId, `online/${role}`, true);

  return () => {
    unsubscribe();
    onDisconnect(seenRef).cancel().catch(() => {});
    stopOnline();
  };

}

/** Registra o espectador (com apelido) enquanto ele estiver assistindo */
export function watchAsSpectator(roomId: string, uid: string, nickname: string): () => void {

  return keepWhileConnected(roomId, `spectators/${uid}`, nickname);

}
