import { useEffect, useRef, useState } from 'react';
import { applyMove, createGame, passTurn, type GameState, type Player } from '../game/logic';
import { signIn } from '../online/firebase';
import {
  clearRematch,
  createRoom,
  joinRoom,
  leaveRoom,
  requestRematch,
  saveName,
  saveState,
  subscribeRoom,
  trackPresence,
  watchAsSpectator,
  type JoinError,
  type Room,
  type Seat
} from '../online/rooms';
import { markJoined } from '../online/nickname';
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
export function useOnlineGame(roomId: string | null, nickname: string, onRoomCreated: (roomId: string) => void) {

  const [seat, setSeat] = useState<Seat | null>(null);
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

    setSeat(null);
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

        if (result !== 'x' && result !== 'o' && result !== 'spectator') {
          setError(result);
          return;
        }

        setSeat(result);
        markJoined(roomId);

        // Falhar ao salvar o apelido não impede a partida: aparece "Jogador X/O"
        if (result !== 'spectator') saveName(roomId, result, nickname).catch(() => {});

        const unsubscribe = subscribeRoom(roomId, data => {
          if (data) setRoom(data);
          else setError('not-found');
        });
        const stopPresence = result === 'spectator'
          ? watchAsSpectator(roomId, uid, nickname)
          : trackPresence(roomId, result);

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

    // O apelido é definido antes de entrar e não muda durante a partida
  }, [roomId]);

  const game = room?.state ?? INITIAL_GAME;

  // Jogador (X/O) ou null para espectador
  const role: Player | null = seat === 'spectator' ? null : seat;
  const spectator = seat === 'spectator';

  const opponent: Player = role === 'x' ? 'o' : 'x';
  const opponentJoined = Boolean(room?.players.o);
  const opponentOnline = Boolean(room?.online[opponent]);
  const left = room?.left ?? {};
  const opponentLeft = Boolean(role ? left[opponent] : left.x || left.o);
  const myTurn = role === game.currentPlayer;
  const spectatorNames = Object.values(room?.spectators ?? {});

  // Partida em andamento: dois jogadores presentes e ninguém venceu
  const inProgress = opponentJoined && !left.x && !left.o && !game.winner;

  const nameOf = (player: Player) => room?.names[player] ?? `Jogador ${player.toUpperCase()}`;

  // O cronômetro só começa depois da primeira jogada
  const timerActive = inProgress && game.turn > 0;

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

    if (!timerActive || myTurn || !role) return;

    const timer = setTimeout(
      () => save(passTurn(latestGame.current)),
      TURN_SECONDS * 1000 + OPPONENT_GRACE_MS
    );

    return () => clearTimeout(timer);

    // Depende só do turno (não do objeto `game`), para mudanças de presença não reiniciarem a espera
  }, [game.turn, timerActive, myTurn, role]);

  const { notice, nudge, reject } = useGameFeedback(game, secondsLeft, timerActive, {
    turnText: player => (player === role ? 'Sua vez' : `Vez de ${nameOf(player)}`),
    isMine: player => player === role
  });

  const play = (boardIndex: number, cellIndex: number) => {

    if (!inProgress || spectator) return;

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

  /* ---------- Revanche: só começa quando os dois pedem ---------- */

  const rematchRequests = room?.rematch ?? {};
  const rematchRequested = Boolean(role && rematchRequests[role]);
  const opponentWantsRematch = Boolean(rematchRequests[opponent]);
  const bothWantRematch = Boolean(rematchRequests.x && rematchRequests.o);

  const rematch = () => {
    if (roomId && role && game.winner && !opponentLeft) requestRematch(roomId, role).catch(() => {});
  };

  // Os dois aceitaram: qualquer jogador grava a nova partida (as regras aceitam só a primeira gravação)
  useEffect(() => {

    if (role && game.winner && bothWantRematch && !opponentLeft) save(createGame());

  }, [role, game.winner, bothWantRematch, opponentLeft]);

  // Nova partida em andamento: limpa o próprio pedido para não valer na próxima
  useEffect(() => {

    if (!game.winner && rematchRequested && roomId && role) clearRematch(roomId, role).catch(() => {});

  }, [game.winner, rematchRequested, roomId, role]);

  /** Desistência: o adversário é avisado de que você saiu */
  const leave = () => {
    if (roomId && role) leaveRoom(roomId, role).catch(() => {});
  };

  const status = error ? 'error' : room && seat ? 'ready' : 'connecting';

  return {
    status,
    error,
    role,
    spectator,
    spectatorNames,
    left,
    game,
    nameOf,
    opponentJoined,
    opponentOnline,
    opponentLeft,
    rematchRequested,
    opponentWantsRematch,
    myTurn,
    secondsLeft,
    timerActive,
    notice,
    nudge,
    play,
    rematch,
    leave
  } as const;

}
