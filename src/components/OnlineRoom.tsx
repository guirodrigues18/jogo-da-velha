import { useEffect, type ComponentProps, type RefObject } from 'react';
import type { Player, Result } from '../game/logic';
import { useOnlineGame } from '../hooks/useOnlineGame';
import { t } from '../i18n';
import GameView from './GameView';
import OnlinePanel from './OnlinePanel';
import OnlineMessage from './OnlineMessage';
import SpectatorPanel from './SpectatorPanel';
import ReactionBar from './ReactionBar';
import ReactionLayer from './ReactionLayer';

interface Props {
  /** null = criar uma sala nova */
  roomId: string | null;
  nickname: string;
  /** Onde registrar a função de desistência (usada pelo botão voltar) */
  leaveRoomRef: RefObject<(() => void) | null>;
  onRoomCreated: (roomId: string) => void;
  onLeave: () => void;
}

type Online = ReturnType<typeof useOnlineGame>;
type ModalProps = ComponentProps<typeof GameView>['modal'];
type NameOf = (player: Player) => string;

const noop = () => {};

export default function OnlineRoom({ roomId, nickname, leaveRoomRef, onRoomCreated, onLeave }: Props) {

  const online = useOnlineGame(roomId, nickname, onRoomCreated);
  const { game, role, nameOf } = online;

  useEffect(() => {

    leaveRoomRef.current = online.leave;

    return () => {
      leaveRoomRef.current = null;
    };

  });

  if (online.status === 'error' && online.error) {
    return <OnlineMessage {...t.online.errors[online.error]} actionLabel={t.online.playLocal} onAction={onLeave} />;
  }

  if (online.status === 'connecting' || !roomId) {
    return <OnlineMessage title={roomId ? t.online.joining : t.online.creating} />;
  }

  const leave = () => {
    online.leave();
    onLeave();
  };

  const current = game.currentPlayer;

  // Placar e reações só fazem sentido com os dois jogadores na sala
  const score = online.opponentJoined
    ? { names: { x: nameOf('x'), o: nameOf('o') }, values: online.score }
    : undefined;

  const reactionBar = online.opponentJoined && !online.opponentLeft && <ReactionBar onReact={online.react} />;
  const overlay = <ReactionLayer reactions={online.floatingReactions} onDone={online.dismissReaction} />;

  // Espectador: só assiste (sem jogar, sem revanche)
  if (!role) {

    const leftPlayer = online.left.x ? 'x' : online.left.o ? 'o' : null;

    return (
      <GameView
        game={game}
        secondsLeft={online.secondsLeft}
        timerActive={online.timerActive}
        nudge={null}
        notice={online.notice}
        shake={online.shake}
        score={score}
        overlay={overlay}
        turnLabel={leftPlayer ? t.online.matchOver : t.online.turnOf(nameOf(current))}
        onCellClick={noop}
        panel={(
          <>
            <SpectatorPanel nameOf={nameOf} spectatorCount={online.spectatorNames.length} onLeave={leave} />
            {reactionBar}
          </>
        )}
        modal={spectatorModal(game.winner, leftPlayer, nameOf, leave)}
      />
    );

  }

  let turnLabel = role === current ? t.online.yourTurn : t.online.turnOf(nameOf(current));

  if (!online.opponentJoined) turnLabel = t.online.waitingOpponent;
  else if (online.opponentLeft) turnLabel = t.online.matchOver;

  return (
    <GameView
      game={game}
      secondsLeft={online.secondsLeft}
      timerActive={online.timerActive}
      nudge={online.nudge}
      notice={online.notice}
      shake={online.shake}
      score={score}
      overlay={overlay}
      turnLabel={turnLabel}
      you={online.opponentJoined && !online.opponentLeft ? role : undefined}
      onCellClick={online.play}
      panel={(
        <>
          <OnlinePanel
            roomId={roomId}
            role={role}
            nameOf={nameOf}
            opponentJoined={online.opponentJoined}
            opponentOnline={online.opponentOnline}
            opponentLeft={online.opponentLeft}
            abandonSecondsLeft={online.abandonSecondsLeft}
            spectatorNames={online.spectatorNames}
            onLeave={leave}
          />
          {reactionBar}
        </>
      )}
      modal={playerModal(online, role, leave)}
    />
  );

}

/* ===========================
   Modal de fim de partida
   =========================== */

function playerModal(online: Online, role: Player, leave: () => void): ModalProps {

  const { game, nameOf } = online;
  const opponentName = nameOf(role === 'x' ? 'o' : 'x');
  const winnerName = game.winner === 'x' || game.winner === 'o' ? nameOf(game.winner) : undefined;

  const common = {
    winnerName,
    autoRestart: false,
    showShare: game.winner === role,
    onShare: noop
  };

  // Desistência ou abandono: quem ficou vence, a menos que a partida já tivesse terminado
  if (online.opponentLeft) {

    let title = t.online.opponentLeftWon(opponentName);
    let subtitle = t.online.matchEnded;

    if (game.winner) {
      title = resultTitle(game.winner, role, nameOf) ?? t.result.draw;
      subtitle = t.online.leftRoom(opponentName);
    } else if (online.opponentAbandoned) {
      title = t.online.opponentAbandonedWon(opponentName);
      subtitle = t.online.abandonedSubtitle;
    }

    return {
      ...common,
      open: true,
      title,
      subtitle,
      restartLabel: t.online.backHome,
      onRestart: leave
    };
  }

  let subtitle: string | undefined;
  let restartLabel = t.online.rematch;

  if (online.rematchRequested) {
    subtitle = t.online.waitingRematch(opponentName);
    restartLabel = t.online.waiting;
  } else if (online.opponentWantsRematch) {
    subtitle = t.online.wantsRematch(opponentName);
    restartLabel = t.online.acceptRematch;
  }

  return {
    ...common,
    title: resultTitle(game.winner, role, nameOf),
    subtitle,
    restartLabel,
    restartDisabled: online.rematchRequested,
    onRestart: online.rematch,
    secondaryLabel: t.online.leaveRoom,
    onSecondary: leave
  };

}

function spectatorModal(winner: Result, leftPlayer: Player | null, nameOf: NameOf, leave: () => void): ModalProps {

  let title: string | undefined;

  if (winner === 'draw') title = t.result.draw;
  else if (winner) title = t.result.someoneWon(nameOf(winner));
  else if (leftPlayer) title = t.online.playerLeft(nameOf(leftPlayer));

  return {
    open: Boolean(winner || leftPlayer),
    title,
    subtitle: leftPlayer ? t.online.matchEnded : t.online.nextMatchHere,
    autoRestart: false,
    restartLabel: t.online.leave,
    showShare: false,
    onShare: noop,
    onRestart: leave
  };

}

function resultTitle(winner: Result, role: Player, nameOf: NameOf): string | undefined {

  if (!winner || winner === 'draw') return undefined;

  return winner === role ? t.result.youWon : t.result.otherWon(nameOf(winner));

}
