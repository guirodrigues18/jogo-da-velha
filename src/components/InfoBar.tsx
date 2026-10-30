import type { CSSProperties } from 'react';
import type { Player } from '../game/logic';
import { TURN_SECONDS, WARNING_SECONDS } from '../hooks/useTurnTimer';
import { t } from '../i18n';

interface Props {
  currentPlayer: Player;
  /** Substitui "Jogador X/O" (ex.: "Sua vez" no modo online) */
  turnLabel?: string;
  activeBoard: number | null;
  turn: number;
  secondsLeft: number;
  timerActive: boolean;
}

export default function InfoBar({ currentPlayer, turnLabel, activeBoard, turn, secondsLeft, timerActive }: Props) {

  const warning = timerActive && secondsLeft <= WARNING_SECONDS;

  const fillClasses = ['timer-fill', currentPlayer];

  if (timerActive) fillClasses.push('running');
  if (warning) fillClasses.push('warning');

  return (
    <div className="info-bar">

      <div className="info-card">
        <div className="info-label">
          {t.info.turn}
          {timerActive && (
            <span className={warning ? 'timer-seconds warning' : 'timer-seconds'}>
              {secondsLeft}s
            </span>
          )}
        </div>
        {/* A key reinicia a animação de entrada a cada turno */}
        <div className="info-value pop-in" key={turn}>
          {turnLabel ?? t.player(currentPlayer.toUpperCase())}
        </div>
        <div className="timer">
          <div
            key={turn}
            className={fillClasses.join(' ')}
            style={{ '--turn-seconds': `${TURN_SECONDS}s` } as CSSProperties}
          />
        </div>
      </div>

      <div className="info-card">
        <div className="info-label">{t.info.nextBoard}</div>
        <div className="info-value pop-in" key={activeBoard ?? 'free'}>
          {activeBoard === null ? t.info.free : t.info.board(activeBoard + 1)}
        </div>
      </div>

    </div>
  );

}
