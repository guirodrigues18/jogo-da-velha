import type { CSSProperties } from 'react';
import { MAX_TIMEOUTS, type Player } from '../game/logic';
import { TURN_SECONDS, WARNING_SECONDS } from '../hooks/useTurnTimer';
import { t } from '../i18n';

interface Props {
  currentPlayer: Player;
  /** Substitui "Jogador X/O" (ex.: "Sua vez" no modo online) */
  turnLabel?: string;
  /** Símbolo de quem usa este aparelho; ausente no modo 2 jogadores e para espectadores */
  you?: Player;
  activeBoard: number | null;
  turn: number;
  secondsLeft: number;
  timerActive: boolean;
  /** Tempos esgotados que o jogador da vez ainda pode ter; ausente = não mostra */
  timeoutsLeft?: number;
}

const SYMBOLS: Record<Player, string> = { x: '✕', o: '◯' };

export default function InfoBar({ currentPlayer, turnLabel, you, activeBoard, turn, secondsLeft, timerActive, timeoutsLeft }: Props) {

  const warning = timerActive && secondsLeft <= WARNING_SECONDS;

  const fillClasses = ['timer-fill', currentPlayer];

  if (timerActive) fillClasses.push('running');
  if (warning) fillClasses.push('warning');

  // Na sua vez, o card brilha na sua cor; na vez do outro, fica discreto
  const cardClasses = ['info-card', 'turn-card', currentPlayer];

  if (you) cardClasses.push(you === currentPlayer ? 'my-turn' : 'their-turn');

  return (
    <div className="info-bar">

      <div className={cardClasses.join(' ')}>
        <div className="info-label">
          {t.info.turn}
          <span className="turn-extras">
            {/* Um ponto por chance: apaga a cada tempo esgotado; sem nenhum, a próxima é derrota */}
            {timeoutsLeft !== undefined && (
              <span
                className={timeoutsLeft === 0 ? 'timeout-pips last' : 'timeout-pips'}
                title={t.timeouts.pips(timeoutsLeft)}
                aria-label={t.timeouts.pips(timeoutsLeft)}
                role="img"
              >
                ⏱{Array.from({ length: MAX_TIMEOUTS }, (_, i) => (
                  <span key={i} className={i < timeoutsLeft ? 'pip' : 'pip used'} />
                ))}
              </span>
            )}
            {timerActive && (
              <span className={warning ? 'timer-seconds warning' : 'timer-seconds'}>
                {secondsLeft}s
              </span>
            )}
          </span>
        </div>
        {/* A key reinicia a animação de entrada a cada turno */}
        <div className="info-value pop-in" key={turn}>
          <span className={`turn-symbol ${currentPlayer}`}>{SYMBOLS[currentPlayer]}</span>
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
