import { HUMAN, useLocalGame } from '../hooks/useLocalGame';
import { t } from '../i18n';
import GameView from './GameView';
import ModeSwitch from './ModeSwitch';

interface Props {
  /** Ausente quando o modo online não está configurado */
  onPlayOnline?: () => void;
}

export default function LocalGame({ onPlayOnline }: Props) {

  const local = useLocalGame();
  const { game, vsComputer } = local;

  const names = vsComputer
    ? { x: t.local.you, o: t.local.computer }
    : { x: t.player('X'), o: t.player('O') };

  let turnLabel: string | undefined;

  if (vsComputer) turnLabel = local.computerTurn ? t.local.thinking : t.local.yourTurnX;

  let title: string | undefined;

  if (vsComputer && game.winner && game.winner !== 'draw') {
    title = game.winner === HUMAN ? t.result.youWon : t.result.computerWon;
  }

  return (
    <GameView
      game={game}
      secondsLeft={local.secondsLeft}
      timerActive={local.timerActive}
      nudge={local.nudge}
      notice={local.notice}
      shake={local.shake}
      turnLabel={turnLabel}
      onCellClick={local.play}
      controls={(
        <ModeSwitch
          mode={local.mode}
          difficulty={local.difficulty}
          onModeChange={local.setMode}
          onDifficultyChange={local.setDifficulty}
          onPlayOnline={onPlayOnline}
        />
      )}
      score={{ names, values: local.score }}
      modal={{
        title,
        autoRestart: local.autoRestart,
        // Contra o computador, só faz sentido compartilhar quando você vence
        showShare: !vsComputer || game.winner === HUMAN,
        onShare: local.cancelAutoRestart,
        onRestart: local.restart
      }}
    />
  );

}
