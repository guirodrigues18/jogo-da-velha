import { useEffect, type ComponentProps, type RefObject } from 'react';
import type { Player, Result } from '../game/logic';
import { useOnlineGame, type OnlineError } from '../hooks/useOnlineGame';
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

const ERRORS: Record<OnlineError, { title: string; text: string }> = {
  'not-found': {
    title: 'Sala não encontrada',
    text: 'O link pode estar errado ou a sala não existe mais.'
  },
  full: {
    title: 'Sala lotada',
    text: 'Essa partida já tem o máximo de pessoas assistindo.'
  },
  closed: {
    title: 'Sala encerrada',
    text: 'Essa partida já terminou. Crie uma nova sala para jogar.'
  },
  unavailable: {
    title: 'Não foi possível conectar',
    text: 'Verifique sua internet e tente novamente.'
  }
};

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
    return <OnlineMessage {...ERRORS[online.error]} actionLabel="Jogar no modo local" onAction={onLeave} />;
  }

  if (online.status === 'connecting' || !roomId) {
    return <OnlineMessage title={roomId ? 'Entrando na sala…' : 'Criando sala…'} />;
  }

  const leave = () => {
    online.leave();
    onLeave();
  };

  const current = game.currentPlayer;
  const symbol = current.toUpperCase();

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
        turnLabel={leftPlayer ? 'Partida encerrada' : `Vez de ${nameOf(current)} (${symbol})`}
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

  let turnLabel = role === current ? `Sua vez (${symbol})` : `Vez de ${nameOf(current)} (${symbol})`;

  if (!online.opponentJoined) turnLabel = 'Aguardando adversário…';
  else if (online.opponentLeft) turnLabel = 'Partida encerrada';

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

  // Desistência: quem ficou vence, a menos que a partida já tivesse terminado
  if (online.opponentLeft) {
    return {
      ...common,
      open: true,
      title: game.winner ? resultTitle(game.winner, role, nameOf) : `🏆 ${opponentName} saiu, você venceu!`,
      subtitle: game.winner ? `${opponentName} saiu da sala.` : 'A partida foi encerrada.',
      restartLabel: 'Voltar ao início',
      onRestart: leave
    };
  }

  let subtitle: string | undefined;
  let restartLabel = 'Revanche';

  if (online.rematchRequested) {
    subtitle = `Aguardando ${opponentName} aceitar a revanche…`;
    restartLabel = 'Aguardando…';
  } else if (online.opponentWantsRematch) {
    subtitle = `🔁 ${opponentName} quer revanche!`;
    restartLabel = 'Aceitar revanche';
  }

  return {
    ...common,
    title: resultTitle(game.winner, role, nameOf),
    subtitle,
    restartLabel,
    restartDisabled: online.rematchRequested,
    onRestart: online.rematch,
    secondaryLabel: 'Sair da sala',
    onSecondary: leave
  };

}

function spectatorModal(winner: Result, leftPlayer: Player | null, nameOf: NameOf, leave: () => void): ModalProps {

  let title: string | undefined;

  if (winner === 'draw') title = 'Empate!';
  else if (winner) title = `🏆 ${nameOf(winner)} venceu!`;
  else if (leftPlayer) title = `${nameOf(leftPlayer)} saiu da partida`;

  return {
    open: Boolean(winner || leftPlayer),
    title,
    subtitle: leftPlayer ? 'A partida foi encerrada.' : 'Se rolar revanche, a próxima partida aparece aqui.',
    autoRestart: false,
    restartLabel: 'Sair',
    showShare: false,
    onShare: noop,
    onRestart: leave
  };

}

function resultTitle(winner: Result, role: Player, nameOf: NameOf): string | undefined {

  if (!winner || winner === 'draw') return undefined;

  return winner === role ? '🏆 Você venceu!' : `😢 ${nameOf(winner)} venceu`;

}
