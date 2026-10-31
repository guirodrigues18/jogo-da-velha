import { useEffect, useRef, useState } from 'react';
import {
  applyGroupMove,
  CHAMPS_MIN,
  createGroupGame,
  DUO_SIZE,
  MARK_SYMBOLS,
  markOf,
  passGroupTurn,
  skipLeftSeat,
  type GroupMode,
  type GroupState
} from '../game/group';
import { signIn } from '../online/firebase';
import {
  clearPartyRematch,
  createParty,
  joinParty,
  leaveParty,
  requestPartyRematch,
  saveGroupState,
  savePartyName,
  sendPartyReaction,
  startParty,
  startPartyRematch,
  subscribeParty,
  trackPartyPresence,
  watchPartyAsSpectator,
  type Party,
  type PartySeat
} from '../online/parties';
import type { OnlineError } from './useOnlineGame';
import { hasJoined, markJoined } from '../online/nickname';
import { track } from '../online/consent';
import { playSound } from '../audio/sounds';
import { recordGame, unlockAchievement, type GameRecord } from '../stats/achievements';
import { trackMission } from '../stats/missions';
import type { FloatingReaction } from '../components/ReactionLayer';
import { t } from '../i18n';
import { useTurnTimer } from './useTurnTimer';
import { useGroupFeedback } from './useGroupFeedback';

/** Se o jogador da vez sumir, os outros passam a vez dele depois deste tempo extra */
const OPPONENT_GRACE_MS = 3000;

/** Quem saiu no Champs: a vez dele é pulada logo (com uma pausa para todos verem) */
const SKIP_LEFT_DELAY_MS = 1200;

const CONNECT_TIMEOUT_MS = 20000;
const REACTION_COOLDOWN_MS = 700;

function withTimeout<T>(promise: Promise<T>): Promise<T> {

  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Tempo de conexão esgotado')), CONNECT_TIMEOUT_MS);
  });

  return Promise.race([promise, timeout]);

}

/** Seu resultado na partida em grupo, no formato das estatísticas (conta como online) */
function recordFromGroup(game: GroupState, mySeat: number): GameRecord {

  const mine = markOf(game.mode, mySeat);

  let result: GameRecord['result'] = 'loss';

  if (game.winner === mine) result = 'win';
  else if (game.winner === 'draw') result = 'draw';

  return {
    mode: 'online',
    group: game.mode,
    result,
    boardsWon: game.boards.filter(b => b.winner === mine).length,
    boardsLost: game.boards.filter(b => b.winner && b.winner !== 'draw' && b.winner !== mine).length,
    moves: game.boards.reduce((total, b) => total + b.cells.filter(Boolean).length, 0),
    symbol: mine === 'x' || mine === 'o' ? mine : undefined
  };

}

/** Quantos jogadores precisam estar no grupo para começar */
export function minPlayers(mode: GroupMode, max: number): number {

  return mode === 'duo' ? DUO_SIZE : Math.min(max, CHAMPS_MIN);

}

/**
 * Partida em grupo (2x2 Duplas ou Champs). Com `partyId` null, cria o grupo
 * (você fica no lugar 0) e avisa por `onPartyCreated`.
 */
export function usePartyGame(
  partyId: string | null,
  nickname: string,
  create: { mode: GroupMode; max: number; seconds: number },
  onPartyCreated: (partyId: string) => void
) {

  const [uid, setUid] = useState<string | null>(null);
  const [seat, setSeat] = useState<PartySeat | null>(null);
  const [party, setParty] = useState<Party | null>(null);
  const [error, setError] = useState<OnlineError | null>(null);
  const [floatingReactions, setFloatingReactions] = useState<FloatingReaction[]>([]);

  const onCreatedRef = useRef(onPartyCreated);

  useEffect(() => {
    onCreatedRef.current = onPartyCreated;
  });

  // Conecta: login anônimo, cria ou entra no grupo e acompanha as mudanças
  useEffect(() => {

    let cancelled = false;
    let disconnect = () => {};

    setSeat(null);
    setParty(null);
    setError(null);

    (async () => {

      try {

        const uid = await withTimeout(signIn());

        if (cancelled) return;

        if (!partyId) {
          const createdId = await withTimeout(createParty(uid, create.mode, create.max, create.seconds));
          track('party_created', { mode: create.mode, max: create.max, seconds: create.seconds });
          if (!cancelled) onCreatedRef.current(createdId);
          return;
        }

        const joined = await withTimeout(joinParty(partyId, uid));

        if (cancelled) return;

        if (typeof joined === 'string' && joined !== 'spectator') {
          setError(joined);
          return;
        }

        setUid(uid);
        setSeat(joined);

        if (!hasJoined(partyId)) track('party_joined', { seat: joined === 'spectator' ? joined : joined === 0 ? 'host' : 'guest' });

        markJoined(partyId);

        if (joined === 'spectator') unlockAchievement('spectator');
        else savePartyName(partyId, joined, nickname).catch(() => {});

        const unsubscribe = subscribeParty(partyId, data => {
          if (data) setParty(data);
          else setError('not-found');
        });
        const stopPresence = joined === 'spectator'
          ? watchPartyAsSpectator(partyId, uid, nickname)
          : trackPartyPresence(partyId, joined);

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

    // O apelido e o modo são definidos antes de entrar e não mudam
  }, [partyId]);

  const mode = party?.mode ?? create.mode;
  const max = party?.max ?? create.max;
  const mySeat = typeof seat === 'number' ? seat : null;
  const spectator = seat === 'spectator';
  const isHost = mySeat === 0;

  // Antes de começar, mostra um tabuleiro vazio com o tamanho do grupo
  const joinedCount = party ? party.seats.slice(0, max).filter(Boolean).length : 1;
  const game = party?.state ?? createGroupGame(mode, Math.max(joinedCount, mode === 'duo' ? DUO_SIZE : CHAMPS_MIN));
  const size = party?.started ? party.size : max;
  /** Segundos por jogada, escolhidos por quem criou o grupo */
  const seconds = party?.seconds ?? create.seconds;

  const nameOf = (s: number) => party?.names[s] ?? t.party.seatName(s + 1);

  const left = party?.left ?? [];
  // Quem sai é eliminado e a partida segue com quem ficou (no 2x2, o parceiro joga na vez dele)
  const someoneLeft = left.slice(0, size).some(Boolean);
  const matchClosed = Boolean(mySeat !== null && left[mySeat]);
  const hostLeft = Boolean(left[0] && !party?.started);

  const started = Boolean(party?.started && party.state);
  const inProgress = started && !game.winner && !matchClosed;
  const myTurn = inProgress && game.seat === mySeat;
  const timerActive = inProgress;

  const save = (next: GroupState) => {
    if (partyId) saveGroupState(partyId, next).catch(() => {});
  };

  const latestGame = useRef(game);

  useEffect(() => {
    latestGame.current = game;
  });

  const secondsLeft = useTurnTimer(game.turn, timerActive, () => {
    if (myTurn) save(passGroupTurn(latestGame.current));
  }, seconds);

  // Jogador da vez desconectado: os outros passam a vez dele após o tempo + tolerância
  const currentLeft = Boolean(left[game.seat]);

  useEffect(() => {

    if (!inProgress || myTurn || mySeat === null) return;

    // Quem saiu é pulado logo
    if (currentLeft) {
      const timer = setTimeout(() => save(skipLeftSeat(latestGame.current)), SKIP_LEFT_DELAY_MS);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => save(passGroupTurn(latestGame.current)), seconds * 1000 + OPPONENT_GRACE_MS);

    return () => clearTimeout(timer);

    // Depende só do turno, para mudanças de presença não reiniciarem a espera
  }, [game.turn, inProgress, myTurn, mySeat, currentLeft, seconds]);

  const { notice, nudge, shake, reject, announce } = useGroupFeedback(started ? game : null, secondsLeft, timerActive, {
    mySeat,
    nameOf,
    onGameEnd: finished => {
      if (mySeat !== null && !left[mySeat]) recordGame(recordFromGroup(finished, mySeat));
    }
  });

  // A partida começou: lembra com qual símbolo (e com quem) você joga
  const matchStarting = Boolean(started && mySeat !== null && game.turn === 0 && !game.winner);

  useEffect(() => {

    if (!matchStarting || mySeat === null) return;

    const symbol = MARK_SYMBOLS[markOf(mode, mySeat)];

    if (mode === 'duo') announce(t.party.duoStart(symbol, nameOf((mySeat + 2) % 4)));
    else announce(t.party.champsStart(symbol));

  }, [matchStarting]);

  // Aba em segundo plano: o título avisa que é a sua vez
  useEffect(() => {

    if (!myTurn) return;

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

  }, [myTurn]);

  const play = (boardIndex: number, cellIndex: number) => {

    if (!inProgress || mySeat === null) return;

    if (!myTurn) {
      playSound('invalid');
      return;
    }

    const next = applyGroupMove(game, boardIndex, cellIndex);

    if (next === game) {
      reject();
      return;
    }

    save(next);

  };

  /* ---------- Lobby ---------- */

  const canStart = isHost && !party?.started && !hostLeft && joinedCount >= minPlayers(mode, max)
    // Sem buracos: os lugares ocupados precisam ser os primeiros (as regras conferem)
    && Boolean(party?.seats.slice(0, joinedCount).every(Boolean));

  const start = () => {
    if (!partyId || !canStart) return;
    startParty(partyId, mode, joinedCount)
      .then(() => track('party_started', { mode, size: joinedCount }))
      .catch(() => {});
  };

  /* ---------- Revanche: começa quando todos pedem ---------- */

  const rematchRequests = party?.rematch ?? [];
  const rematchRequested = Boolean(mySeat !== null && rematchRequests[mySeat]);
  const rematchCount = rematchRequests.slice(0, size).filter(Boolean).length;
  const everyoneWantsRematch = started && rematchCount === size;
  const canRematch = started && Boolean(game.winner) && !someoneLeft;

  const rematch = () => {
    if (partyId && mySeat !== null && canRematch) requestPartyRematch(partyId, mySeat).catch(() => {});
  };

  const score = party?.score ?? {};

  useEffect(() => {

    if (partyId && mySeat !== null && game.winner && everyoneWantsRematch && !someoneLeft) {
      startPartyRematch(partyId, game, score).catch(() => {});
    }

  }, [mySeat, game.winner, everyoneWantsRematch, someoneLeft]);

  // Nova partida em andamento: limpa o próprio pedido para não valer na próxima
  useEffect(() => {

    if (started && !game.winner && rematchRequested && partyId && mySeat !== null) clearPartyRematch(partyId, mySeat).catch(() => {});

  }, [started, game.winner, rematchRequested, partyId, mySeat]);

  /* ---------- Reações ---------- */

  const lastReactionAt = useRef(0);
  const seenReactions = useRef<Record<string, number> | null>(null);

  const react = (emoji: string) => {

    const now = Date.now();

    if (!partyId || !uid || now - lastReactionAt.current < REACTION_COOLDOWN_MS) return;

    lastReactionAt.current = now;
    sendPartyReaction(partyId, uid, emoji, nickname).catch(() => {});
    trackMission({ kind: 'reaction' });

    setFloatingReactions(current => [...current, { id: `me-${now}`, emoji, name: t.online.you }]);

  };

  const reactions = party?.reactions;

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

  /** Sair: antes de começar libera o lugar; depois conta como desistência */
  const leave = () => {
    if (partyId && mySeat !== null) leaveParty(partyId, mySeat, Boolean(party?.started)).catch(() => {});
  };

  const status = error ? 'error' : party && seat !== null ? 'ready' : 'connecting';

  return {
    status,
    error,
    party,
    mode,
    max,
    size,
    seconds,
    mySeat,
    myMark: mySeat !== null ? markOf(mode, mySeat) : null,
    spectator,
    isHost,
    hostLeft,
    joinedCount,
    canStart,
    started,
    game,
    nameOf,
    left,
    someoneLeft,
    matchClosed,
    inProgress,
    myTurn,
    secondsLeft,
    timerActive,
    notice,
    nudge,
    shake,
    score,
    rematchRequested,
    rematchCount,
    canRematch,
    floatingReactions,
    spectatorNames: Object.values(party?.spectators ?? {}),
    play,
    start,
    rematch,
    leave,
    react,
    dismissReaction
  } as const;

}
