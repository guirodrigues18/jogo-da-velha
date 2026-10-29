import { useEffect, useRef, useState } from 'react';
import { applyMove, createGame, passTurn, type GameState, type Player } from '../game/logic';
import { signIn } from '../online/firebase';
import {
  createRoom,
  joinRoom,
  saveState,
  subscribeRoom,
  trackPresence,
  type JoinError,
  type Room
} from '../online/rooms';
import { playSound } from '../audio/sounds';
import { TURN_SECONDS, useTurnTimer } from './useTurnTimer';
import { useGameFeedback } from './useGameFeedback';

/** Se o jogador da vez sumir, o adversário pode passar a vez depois deste tempo extra */
const OPPONENT_GRACE_MS = 3000;

/** Sem resposta do Firebase nesse tempo, mostra erro em vez de carregar para sempre */
const CONNECT_TIMEOUT_MS = 20000;

function withTimeout<T>(promise: Promise<T>): Promise<T> {

  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Tempo de conexão esgotado')), CONNECT_TIMEOUT_MS);
  });

  return Promise.race([promise, timeout]);

}

export type OnlineError = JoinError | 'unavailable';

const INITIAL_GAME = createGame();

/**
 * Partida online. Com `roomId` null, cria uma sala nova e avisa por `onRoomCreated`.
 */
export function useOnlineGame(roomId: string | null, onRoomCreated: (roomId: string) => void) {

  const [role, setRole] = useState<Player | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [error, setError] = useState<OnlineError | null>(null);

  const onRoomCreatedRef = useRef(onRoomCreated);

  useEffect(() => {
    onRoomCreatedRef.current = onRoomCreated;
  });

  // Conecta: login anônimo, cria ou entra na sala e acompanha as mudanças
  useEffect(() => {

    let cancelled = false;
    let disconnect = () => {};

    setRole(null);
    setRoom(null);
    setError(null);

    (async () => {

      try {

        const uid = await withTimeout(signIn());

        if (cancelled) return;

        if (!roomId) {
          const createdId = await withTimeout(createRoom(uid));
          if (!cancelled) onRoomCreatedRef.current(createdId);
          return;
        }

        const result = await withTimeout(joinRoom(roomId, uid));

        if (cancelled) return;

        if (result !== 'x' && result !== 'o') {
          setError(result);
          return;
        }

        setRole(result);

        const unsubscribe = subscribeRoom(roomId, data => {
          if (data) setRoom(data);
          else setError('not-found');
        });
        const stopPresence = trackPresence(roomId, result);

        disconnect = () => {
          unsubscribe();
          stopPresence();
        };

      } catch {
        if (!cancelled) setError('unavailable');
      }

    })();

    return () => {
      cancelled = true;
      disconnect();
    };

  }, [roomId]);

  const game = room?.state ?? INITIAL_GAME;
  const opponent: Player = role === 'x' ? 'o' : 'x';
  const opponentJoined = Boolean(room?.players.o);
  const opponentOnline = Boolean(room?.online[opponent]);
  const myTurn = role === game.currentPlayer;

  // O cronômetro só começa depois da primeira jogada
  const timerActive = opponentJoined && game.turn > 0 && !game.winner;

  // As regras do banco recusam jogadas inválidas; nesse caso o estado do servidor prevalece
  const save = (next: GameState) => {
    if (roomId) saveState(roomId, next).catch(() => {});
  };

  const latestGame = useRef(game);

  useEffect(() => {
    latestGame.current = game;
  });

  const secondsLeft = useTurnTimer(game.turn, timerActive, () => {
    if (myTurn) save(passTurn(latestGame.current));
  });

  // Jogador da vez desconectado: o adversário reivindica a vez após o tempo + tolerância
  useEffect(() => {

    if (!timerActive || myTurn) return;

    const timer = setTimeout(
      () => save(passTurn(latestGame.current)),
      TURN_SECONDS * 1000 + OPPONENT_GRACE_MS
    );

    return () => clearTimeout(timer);

    // Depende só do turno (não do objeto `game`), para mudanças de presença não reiniciarem a espera
  }, [game.turn, timerActive, myTurn]);

  const { notice, nudge, reject } = useGameFeedback(game, secondsLeft, timerActive);

  const play = (boardIndex: number, cellIndex: number) => {

    if (!opponentJoined || game.winner) return;

    if (!myTurn) {
      playSound('invalid');
      return;
    }

    const next = applyMove(game, boardIndex, cellIndex);

    if (next === game) {
      reject();
      return;
    }

    save(next);

  };

  const rematch = () => save(createGame());

  const status = error ? 'error' : room && role ? 'ready' : 'connecting';

  return {
    status,
    error,
    role,
    game,
    opponentJoined,
    opponentOnline,
    myTurn,
    secondsLeft,
    timerActive,
    notice,
    nudge,
    play,
    rematch
  } as const;

}
