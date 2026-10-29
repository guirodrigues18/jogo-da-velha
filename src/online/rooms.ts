import {
  get,
  onDisconnect,
  onValue,
  ref,
  remove,
  runTransaction,
  serverTimestamp,
  set
} from 'firebase/database';
import { createGame, type GameState, type Player } from '../game/logic';
import { db } from './firebase';
import { decodeState, encodeState, type StoredState } from './serialization';

/* ===========================
   Tipos
   =========================== */

interface Players {
  x: string;
  o?: string;
}

type PerPlayer<T> = Partial<Record<Player, T>>;

interface StoredRoom {
  players: Players;
  state: StoredState;
  online?: PerPlayer<boolean>;
  names?: PerPlayer<string>;
  /** Quem saiu da sala pelo botão "Sair" (desistência) */
  left?: PerPlayer<boolean>;
  /** Pedidos de revanche; a nova partida começa quando os dois pedem */
  rematch?: PerPlayer<boolean>;
  /** Espectadores conectados: uid → apelido */
  spectators?: Record<string, string>;
}

export interface Room {
  players: Players;
  state: GameState;
  online: PerPlayer<boolean>;
  names: PerPlayer<string>;
  left: PerPlayer<boolean>;
  rematch: PerPlayer<boolean>;
  spectators: Record<string, string>;
}

/** Lugar de quem entrou: jogador (X, O) ou espectador */
export type Seat = Player | 'spectator';

export type JoinError = 'not-found' | 'full' | 'closed';

export interface RoomPreview {
  hostName: string | null;
  guestName: string | null;
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

/** Cria uma sala nova; quem cria joga com X */
export async function createRoom(uid: string): Promise<string> {

  const roomId = generateRoomId();

  await set(roomRef(roomId), {
    players: { x: uid },
    state: toStored(createGame()),
    createdAt: serverTimestamp()
  });

  return roomId;

}

/** Entra na sala: devolve o lugar (X, O ou espectador) ou o motivo de não conseguir entrar */
export async function joinRoom(roomId: string, uid: string): Promise<Seat | JoinError> {

  const snapshot = await get(roomRef(roomId));

  if (!snapshot.exists()) return 'not-found';

  const { players, left = {}, spectators = {} } = snapshot.val() as StoredRoom;

  // Quem já faz parte da sala (ex.: recarregou a página) volta para o mesmo papel,
  // a menos que tenha saído dela
  if (players.x === uid) return left.x ? 'closed' : 'x';
  if (players.o === uid) return left.o ? 'closed' : 'o';

  // Quem criou a sala desistiu antes de alguém entrar
  if (left.x) return 'closed';

  if (players.o) {
    const watching = Object.keys(spectators).filter(id => id !== uid).length;
    return watching < MAX_SPECTATORS ? 'spectator' : 'full';
  }

  // Transação: se duas pessoas abrirem o convite ao mesmo tempo, só uma vira O (a outra assiste)
  const result = await runTransaction(roomRef(roomId, 'players/o'), current => (current === null ? uid : undefined));

  return result.snapshot.val() === uid ? 'o' : 'spectator';

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
      spectators: data.spectators ?? {}
    });

  });

}

/** Quem está na sala, para o convite dizer "Fulano te desafiou" ou "Fulano vs Ciclano" (requer login) */
export async function getRoomPreview(roomId: string): Promise<RoomPreview | null> {

  const snapshot = await get(roomRef(roomId));

  if (!snapshot.exists()) return null;

  const { players, names = {} } = snapshot.val() as StoredRoom;

  return {
    hostName: names.x ?? null,
    guestName: names.o ?? null,
    full: Boolean(players.o)
  };

}

export function requestRematch(roomId: string, role: Player): Promise<void> {

  return set(roomRef(roomId, `rematch/${role}`), true);

}

export function clearRematch(roomId: string, role: Player): Promise<void> {

  return remove(roomRef(roomId, `rematch/${role}`));

}

/** Sair da sala pelo botão "Sair": conta como desistência para o adversário */
export function leaveRoom(roomId: string, role: Player): Promise<void> {

  return set(roomRef(roomId, `left/${role}`), true);

}

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

/** Marca o jogador como online */
export function trackPresence(roomId: string, role: Player): () => void {

  return keepWhileConnected(roomId, `online/${role}`, true);

}

/** Registra o espectador (com apelido) enquanto ele estiver assistindo */
export function watchAsSpectator(roomId: string, uid: string, nickname: string): () => void {

  return keepWhileConnected(roomId, `spectators/${uid}`, nickname);

}
