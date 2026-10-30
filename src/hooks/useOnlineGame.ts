import { useEffect, useRef, useState } from 'react';
import { applyMove, createGame, passTurn, type GameState, type Player } from '../game/logic';
import { signIn } from '../online/firebase';
import {
  ABANDON_SECONDS,
  claimAbandonment,
  clearRematch,
  createRoom,
  joinRoom,
  leaveRoom,
  requestRematch,
  saveName,
  saveSkin,
  saveState,
  sendReaction,
  startRematch,
  subscribeRoom,
  trackPresence,
  watchAsSpectator,
  type JoinError,
  type Room,
  type Seat
} from '../online/rooms';
import { markJoined } from '../online/nickname';
import { acceptInvite, markInviteSent } from '../online/invite';
import { getProfile } from '../shop/wallet';
import { playSound } from '../audio/sounds';
import { loadStats, recordFromGame, recordGame, unlockAchievement } from '../stats/achievements';
import { trackMission } from '../stats/missions';
import type { FloatingReaction } from '../components/ReactionLayer';
import { t } from '../i18n';
import { TURN_SECONDS, useTurnTimer } from './useTurnTimer';
import { useGameFeedback } from './useGameFeedback';

/** Se o jogador da vez sumir, o adversário pode passar a vez depois deste tempo extra */
const OPPONENT_GRACE_MS = 3000;

/** Sem resposta do Firebase nesse tempo, mostra erro em vez de carregar para sempre */
const CONNECT_TIMEOUT_MS = 20000;

/** Folga depois do prazo de abandono, para o relógio do aparelho não se adiantar ao do servidor */
const ABANDON_GRACE_MS = 2000;

/** Intervalo mínimo entre reações da mesma pessoa (as regras do banco exigem 500 ms) */
const REACTION_COOLDOWN_MS = 700;

const SYMBOLS: Record<Player, string> = { x: '✕', o: '◯' };

function withTimeout<T>(promise: Promise<T>): Promise<T> {

  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Tempo de conexão esgotado')), CONNECT_TIMEOUT_MS);
  });

  return Promise.race([promise, timeout]);

}

export type OnlineError = JoinError | 'unavailable';

const INITIAL_GAME = createGame();

/**
 * Partida online. Com `roomId` null, cria uma sala nova (você joga com `hostRole`)
 * e avisa por `onRoomCreated`.
 */
export function useOnlineGame(
  roomId: string | null,
  nickname: string,
  hostRole: Player,
  onRoomCreated: (roomId: string) => void
) {

  const [uid, setUid] = useState<string | null>(null);
  const [seat, setSeat] = useState<Seat | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [error, setError] = useState<OnlineError | null>(null);
  const [floatingReactions, setFloatingReactions] = useState<FloatingReaction[]>([]);

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
          const createdId = await withTimeout(createRoom(uid, hostRole));
          markInviteSent();
          if (!cancelled) onRoomCreatedRef.current(createdId);
          return;
        }

        const joined = await withTimeout(joinRoom(roomId, uid));

        if (cancelled) return;

        if (typeof joined === 'string') {
          setError(joined);
          return;
        }

        const result = joined.seat;

        // Primeira vez no jogo, convidado por quem criou a sala: os dois ganham o bônus de convite
        if (joined.inviter) acceptInvite(joined.inviter, loadStats().played === 0);

        setUid(uid);
        setSeat(result);
        markJoined(roomId);

        // Falhar ao salvar o apelido ou a skin não impede a partida
        if (result !== 'spectator') {
          saveName(roomId, result, nickname).catch(() => {});
          saveSkin(roomId, result, getProfile().equipped.symbol).catch(() => {});
        } else {
          unlockAchievement('spectator');
        }

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
  const opponentJoined = Boolean(room?.players.x && room?.players.o);
  const opponentOnline = Boolean(room?.online[opponent]);
  const left = room?.left ?? {};
  const opponentLeft = Boolean(role ? left[opponent] : left.x || left.o);
  const myTurn = role === game.currentPlayer;
  const spectatorNames = Object.values(room?.spectators ?? {});

  // Partida em andamento: dois jogadores presentes e ninguém venceu
  const inProgress = opponentJoined && !left.x && !left.o && !game.winner;

  const nameOf = (player: Player) => room?.names[player] ?? t.player(player.toUpperCase());

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

  // Todas as jogadas tocam som; tique, vibração e confete são só seus (espectador: nenhum)
  const isMe = (player: Player) => player === role;

  const { notice, nudge, shake, reject, announce } = useGameFeedback(game, secondsLeft, timerActive, {
    turnText: player => (isMe(player) ? t.online.yourTurn : t.online.turnOf(nameOf(player))),
    isMe,
    onGameEnd: finished => {
      if (role) recordGame(recordFromGame(finished, role, 'online'));
    }
  });

  // Quando o adversário entra (ou começa uma revanche), lembra com qual símbolo você joga
  const matchStarting = Boolean(role && opponentJoined && game.turn === 0 && !game.winner);

  useEffect(() => {

    if (!matchStarting || !role) return;

    const symbol = SYMBOLS[role];

    announce(role === 'x' ? t.online.youStart(symbol) : t.online.opponentStarts(symbol, nameOf('x')));

  }, [matchStarting]);

  // Aba em segundo plano (ex.: foi ao WhatsApp mandar o convite): o título avisa que é a sua vez
  useEffect(() => {

    if (!myTurn || !inProgress) return;

    const original = document.title;

    const update = () => {
      document.title = document.hidden ? `● ${t.online.yourTurn}! – ${original}` : original;
    };

    update();
    document.addEventListener('visibilitychange', update);

    return () => {
      document.removeEventListener('visibilitychange', update);
      document.title = original;
    };

  }, [myTurn, inProgress]);

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

  const storedScore = room?.score ?? {};

  // Os dois aceitaram: qualquer jogador grava a nova partida (as regras aceitam só a primeira gravação)
  useEffect(() => {

    if (roomId && role && game.winner && bothWantRematch && !opponentLeft) {
      startRematch(roomId, game, storedScore).catch(() => {});
    }

  }, [role, game.winner, bothWantRematch, opponentLeft]);

  // O placar salvo conta as partidas anteriores; a vitória da partida atual entra na hora
  const score = {
    x: (storedScore.x ?? 0) + (game.winner === 'x' ? 1 : 0),
    o: (storedScore.o ?? 0) + (game.winner === 'o' ? 1 : 0)
  };

  /* ---------- Reações ---------- */

  const lastReactionAt = useRef(0);
  const seenReactions = useRef<Record<string, number> | null>(null);

  const react = (emoji: string) => {

    const now = Date.now();

    if (!roomId || !uid || now - lastReactionAt.current < REACTION_COOLDOWN_MS) return;

    lastReactionAt.current = now;
    sendReaction(roomId, uid, emoji, nickname).catch(() => {});
    trackMission({ kind: 'reaction' });

    // A própria reação aparece na hora (o eco que volta do banco é ignorado abaixo)
    setFloatingReactions(current => [...current, { id: `me-${now}`, emoji, name: t.online.you }]);

  };

  // Mostra as reações novas dos outros (as que já existiam ao entrar na sala são ignoradas)
  const reactions = room?.reactions;

  useEffect(() => {

    if (!reactions) return;

    const seen = seenReactions.current;

    seenReactions.current = Object.fromEntries(Object.entries(reactions).map(([id, r]) => [id, r.t]));

    if (!seen) return;

    const fresh = Object.entries(reactions)
      .filter(([id, r]) => id !== uid && seen[id] !== r.t)
      .map(([id, r]) => ({ id: `${id}-${r.t}`, emoji: r.e, name: r.n }));

    if (fresh.length) setFloatingReactions(current => [...current, ...fresh]);

  }, [reactions, uid]);

  const dismissReaction = (id: string) => setFloatingReactions(current => current.filter(r => r.id !== id));

  // Nova partida em andamento: limpa o próprio pedido para não valer na próxima
  useEffect(() => {

    if (!game.winner && rematchRequested && roomId && role) clearRematch(roomId, role).catch(() => {});

  }, [game.winner, rematchRequested, roomId, role]);

  /** Desistência: o adversário é avisado de que você saiu */
  const leave = () => {
    if (roomId && role) leaveRoom(roomId, role).catch(() => {});
  };

  /* ---------- Abandono: adversário desconectado por tempo demais ---------- */

  const opponentAway = Boolean(role && inProgress && !opponentOnline);
  const [abandonDeadline, setAbandonDeadline] = useState<number | null>(null);
  const [clock, setClock] = useState(() => Date.now());

  // A contagem começa quando ele some e é cancelada se ele voltar
  useEffect(() => {

    setAbandonDeadline(opponentAway ? Date.now() + ABANDON_SECONDS * 1000 : null);

  }, [opponentAway]);

  useEffect(() => {

    if (!abandonDeadline || !roomId) return;

    const interval = setInterval(() => {

      const now = Date.now();

      setClock(now);

      // Tenta a cada segundo depois do prazo: o servidor só aceita quando o tempo dele também passou
      if (now >= abandonDeadline + ABANDON_GRACE_MS) claimAbandonment(roomId, opponent).catch(() => {});

    }, 1000);

    return () => clearInterval(interval);

  }, [abandonDeadline, roomId, opponent]);

  // Só aparece depois de alguns segundos, para não piscar em quedas rápidas de conexão
  const abandonRemaining = abandonDeadline ? Math.max(0, Math.ceil((abandonDeadline - clock) / 1000)) : null;
  const abandonSecondsLeft = abandonRemaining !== null && abandonRemaining <= ABANDON_SECONDS - 3
    ? abandonRemaining
    : null;

  const opponentAbandoned = role ? left[opponent] === 'abandoned' : false;

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
    opponentAbandoned,
    abandonSecondsLeft,
    rematchRequested,
    opponentWantsRematch,
    myTurn,
    score,
    secondsLeft,
    timerActive,
    notice,
    nudge,
    shake,
    floatingReactions,
    skins: room?.skins ?? {},
    play,
    rematch,
    leave,
    react,
    dismissReaction
  } as const;

}
