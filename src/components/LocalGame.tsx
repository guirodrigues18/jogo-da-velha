import { useState, type ComponentProps } from 'react';
import { useLocalGame } from '../hooks/useLocalGame';
import { loadDailyStreak } from '../game/daily';
import { useProfile } from '../shop/wallet';
import { symbolGlyph } from '../shop/catalog';
import { shareLink } from '../share/shareLink';
import { trackMission } from '../stats/missions';
import { track } from '../online/consent';
import { t } from '../i18n';
import GameView from './GameView';
import AiOptions from './AiOptions';

interface Props {
  onHome: () => void;
}

type Local = ReturnType<typeof useLocalGame>;
type ModalProps = ComponentProps<typeof GameView>['modal'];

export default function LocalGame({ onHome }: Props) {

  const local = useLocalGame();
  const profile = useProfile();
  const [copied, setCopied] = useState(false);

  const { game, mode, vsAI, human } = local;
  const ai = human === 'x' ? 'o' : 'x';

  const names = vsAI
    ? { [human]: t.local.you, [ai]: t.local.ai } as Record<'x' | 'o', string>
    : { x: t.player('X'), o: t.player('O') };

  let turnLabel: string | undefined;

  if (vsAI && !local.aiTurn) turnLabel = t.local.yourTurn;
  else if (vsAI) turnLabel = local.started ? t.local.thinking : t.local.aiTurn;

  // Seu símbolo da loja aparece nas suas peças (no modo 2 jogadores, os dois usam o clássico)
  const glyphs = vsAI ? { [human]: symbolGlyph(profile.equipped.symbol) } : undefined;

  const shareDaily = async () => {
    const { number } = local.challenge;
    const { attempts, moves } = local.dailyProgress;
    const result = await shareLink(`${window.location.origin}${window.location.pathname}`, t.daily.shareText(number, attempts, moves));
    if (result !== 'cancelled') {
      trackMission({ kind: 'share' });
      track('share', { content_type: 'daily_result', method: result });
    }
    if (result === 'copied') {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const modal = mode === 'daily'
    ? dailyModal(local, shareDaily)
    : {
      title: vsAI && game.winner && game.winner !== 'draw'
        ? (game.winner === human ? t.result.youWon : t.result.aiWon)
        : undefined,
      autoRestart: local.autoRestart,
      // Contra a IA, só faz sentido compartilhar quando você vence
      showShare: !vsAI || game.winner === human,
      onShare: local.cancelAutoRestart,
      onRestart: local.restart
    };

  return (
    <GameView
      game={game}
      secondsLeft={local.secondsLeft}
      timerActive={local.timerActive}
      nudge={local.nudge}
      notice={copied ? { text: t.online.copied, id: 1 } : local.notice}
      shake={local.shake}
      turnLabel={turnLabel}
      you={vsAI ? human : undefined}
      glyphs={glyphs}
      onCellClick={local.play}
      onHome={onHome}
      onStart={local.started ? undefined : local.start}
      controls={(
        <>
          {mode === 'ai' && (
            <AiOptions
              difficulty={local.difficulty}
              symbol={local.symbol}
              onDifficultyChange={local.setDifficulty}
              onSymbolChange={local.setSymbol}
            />
          )}
          {mode === 'daily' && <DailyInfo local={local} />}
        </>
      )}
      score={mode === 'daily' ? undefined : { names, values: local.score }}
      modal={modal}
    />
  );

}

/** "📅 Desafio #3 · tentativa 2 · 🔥 4 dias" */
function DailyInfo({ local }: { local: Local }) {

  const { number } = local.challenge;
  const { attempts, won } = local.dailyProgress;
  const streak = loadDailyStreak();
  const activeStreak = streak.lastWon >= number - 1 ? streak.current : 0;

  const parts = [t.daily.title(number), won ? t.daily.doneToday : t.daily.attempt(attempts + 1)];

  if (activeStreak > 0) parts.push(t.daily.streak(activeStreak));

  return <div className="daily-info" title={t.daily.intro}>{parts.join(' · ')}</div>;

}

function dailyModal(local: Local, share: () => void): ModalProps {

  const { game, human, challenge, dailyProgress, dailyReplay } = local;
  const won = game.winner === human;

  const base = { autoRestart: false, showShare: false, onShare: () => {} };

  // Primeira vitória de hoje: resultado para compartilhar, estilo Wordle
  if (won && !dailyReplay) {
    return {
      ...base,
      title: t.daily.won(challenge.number),
      subtitle: t.daily.wonDetail(dailyProgress.attempts, dailyProgress.moves),
      restartLabel: t.daily.shareResult,
      onRestart: share,
      secondaryLabel: t.daily.playAgain,
      onSecondary: local.restart
    };
  }

  let title = t.daily.lost;

  if (won) title = t.result.youWon;
  else if (game.winner === 'draw') title = t.daily.drawn;

  return {
    ...base,
    title,
    subtitle: dailyReplay ? t.daily.replayDetail : t.daily.tryAgainDetail,
    restartLabel: won ? t.daily.playAgain : t.daily.tryAgain,
    onRestart: local.restart
  };

}
