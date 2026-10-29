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
}

export interface Room {
  players: Players;
  state: GameState;
  online: PerPlayer<boolean>;
  names: PerPlayer<string>;
}

export type JoinError = 'not-found' | 'full';

/* ===========================
   Salas
   =========================== */

// Sem caracteres ambíguos (0/o, 1/l/i) para facilitar ditar o código da sala
const ROOM_ID_ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789';
const ROOM_ID_LENGTH = 6;

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

/** Entra na sala: devolve o papel do jogador (X, O) ou o motivo de não conseguir entrar */
export async function joinRoom(roomId: string, uid: string): Promise<Player | JoinError> {

  const snapshot = await get(roomRef(roomId, 'players'));

  if (!snapshot.exists()) return 'not-found';

  const players = snapshot.val() as Players;

  // Quem já faz parte da sala (ex.: recarregou a página) volta para o mesmo papel
  if (players.x === uid) return 'x';
  if (players.o === uid) return 'o';
  if (players.o) return 'full';

  // Transação: se duas pessoas abrirem o convite ao mesmo tempo, só uma vira O
  const result = await runTransaction(roomRef(roomId, 'players/o'), current => (current === null ? uid : undefined));

  return result.snapshot.val() === uid ? 'o' : 'full';

}

export function subscribeRoom(roomId: string, onChange: (room: Room | null) => void): () => void {

  return onValue(roomRef(roomId), snapshot => {

    const data = snapshot.val() as StoredRoom | null;

    onChange(data && {
      players: data.players,
      state: decodeState(data.state),
      online: data.online ?? {},
      names: data.names ?? {}
    });

  });

}

export function saveName(roomId: string, role: Player, name: string): Promise<void> {

  return set(roomRef(roomId, `names/${role}`), name);

}

/** Apelido de quem criou a sala, para o convite dizer "Fulano te desafiou" (requer login) */
export async function getHostName(roomId: string): Promise<string | null> {

  const snapshot = await get(roomRef(roomId, 'names/x'));

  return snapshot.val() as string | null;

}

/** Grava o novo estado. As regras do banco recusam jogadas fora da vez */
export function saveState(roomId: string, state: GameState): Promise<void> {

  return set(roomRef(roomId, 'state'), toStored(state));

}

/** Marca o jogador como online enquanto a conexão existir; devolve a função para sair */
export function trackPresence(roomId: string, role: Player): () => void {

  const presenceRef = roomRef(roomId, `online/${role}`);

  const unsubscribe = onValue(ref(db, '.info/connected'), snapshot => {

    if (!snapshot.val()) return;

    // Se a conexão cair (aba fechada, sem internet), o servidor remove a marcação sozinho
    onDisconnect(presenceRef).remove()
      .then(() => set(presenceRef, true))
      .catch(() => {});

  });

  return () => {
    unsubscribe();
    onDisconnect(presenceRef).cancel().catch(() => {});
    remove(presenceRef).catch(() => {});
  };

}
