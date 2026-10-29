import { useLocalGame } from '../hooks/useLocalGame';
import GameView from './GameView';

interface Props {
  /** Ausente quando o modo online não está configurado */
  onPlayOnline?: () => void;
}

export default function LocalGame({ onPlayOnline }: Props) {

  const { game, autoRestart, secondsLeft, timerActive, nudge, notice, play, restart, cancelAutoRestart } = useLocalGame();

  return (
    <GameView
      game={game}
      secondsLeft={secondsLeft}
      timerActive={timerActive}
      nudge={nudge}
      notice={notice}
      onCellClick={play}
      panel={onPlayOnline && (
        <button className="btn btn-online" onClick={onPlayOnline}>
          🌐 Jogar online com um amigo
        </button>
      )}
      modal={{
        autoRestart,
        showShare: true,
        onShare: cancelAutoRestart,
        onRestart: restart
      }}
    />
  );

}
