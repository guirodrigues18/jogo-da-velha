import type { Player, Result } from '../game/logic';
import { useOnlineGame, type OnlineError } from '../hooks/useOnlineGame';
import GameView from './GameView';
import OnlinePanel from './OnlinePanel';
import OnlineMessage from './OnlineMessage';

interface Props {
  /** null = criar uma sala nova */
  roomId: string | null;
  nickname: string;
  onRoomCreated: (roomId: string) => void;
  onLeave: () => void;
}

const ERRORS: Record<OnlineError, { title: string; text: string }> = {
  'not-found': {
    title: 'Sala não encontrada',
    text: 'O link pode estar errado ou a sala não existe mais.'
  },
  full: {
    title: 'Sala cheia',
    text: 'Essa partida já tem dois jogadores.'
  },
  unavailable: {
    title: 'Não foi possível conectar',
    text: 'Verifique sua internet e tente novamente.'
  }
};

export default function OnlineRoom({ roomId, nickname, onRoomCreated, onLeave }: Props) {

  const online = useOnlineGame(roomId, nickname, onRoomCreated);
  const { game, role, nameOf } = online;

  if (online.status === 'error' && online.error) {
    return <OnlineMessage {...ERRORS[online.error]} actionLabel="Jogar no modo local" onAction={onLeave} />;
  }

  if (online.status === 'connecting' || !role || !roomId) {
    return <OnlineMessage title={roomId ? 'Entrando na sala…' : 'Criando sala…'} />;
  }

  return (
    <GameView
      game={game}
      secondsLeft={online.secondsLeft}
      timerActive={online.timerActive}
      nudge={online.nudge}
      notice={online.notice}
      turnLabel={turnLabel(role, game.currentPlayer, online.opponentJoined, nameOf)}
      onCellClick={online.play}
      panel={(
        <OnlinePanel
          roomId={roomId}
          role={role}
          nameOf={nameOf}
          opponentJoined={online.opponentJoined}
          opponentOnline={online.opponentOnline}
          onLeave={onLeave}
        />
      )}
      modal={{
        title: resultTitle(role, game.winner, nameOf),
        winnerName: game.winner === 'x' || game.winner === 'o' ? nameOf(game.winner) : undefined,
        autoRestart: false,
        restartLabel: 'Revanche',
        showShare: game.winner === role,
        onShare: () => {},
        onRestart: online.rematch
      }}
    />
  );

}

function turnLabel(role: Player, current: Player, opponentJoined: boolean, nameOf: (p: Player) => string): string {

  if (!opponentJoined) return 'Aguardando adversário…';

  const symbol = current.toUpperCase();

  return role === current ? `Sua vez (${symbol})` : `Vez de ${nameOf(current)} (${symbol})`;

}

function resultTitle(role: Player, winner: Result, nameOf: (p: Player) => string): string | undefined {

  if (!winner || winner === 'draw') return undefined;

  return winner === role ? '🏆 Você venceu!' : `😢 ${nameOf(winner)} venceu`;

}
