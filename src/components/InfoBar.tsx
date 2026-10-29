import type { CSSProperties } from 'react';
import type { Player } from '../game/logic';
import { TURN_SECONDS, WARNING_SECONDS } from '../hooks/useTurnTimer';

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
          Turno atual
          {timerActive && (
            <span className={warning ? 'timer-seconds warning' : 'timer-seconds'}>
              {secondsLeft}s
            </span>
          )}
        </div>
        {/* A key reinicia a animação de entrada a cada turno */}
        <div className="info-value pop-in" key={turn}>
          {turnLabel ?? (currentPlayer === 'x' ? 'Jogador X' : 'Jogador O')}
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
        <div className="info-label">Próximo tabuleiro</div>
        <div className="info-value pop-in" key={activeBoard ?? 'free'}>
          {activeBoard === null ? 'Livre — qualquer tabuleiro' : `Tabuleiro ${activeBoard + 1}`}
        </div>
      </div>

    </div>
  );

}
