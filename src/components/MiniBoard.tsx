import { useEffect, useRef } from 'react';
import type { MiniBoard as MiniBoardState, Player } from '../game/logic';
import { t } from '../i18n';

interface Props {
  board: MiniBoardState;
  /** O jogador atual pode jogar neste tabuleiro */
  playable: boolean;
  /** Nenhum tabuleiro obrigatório: destaca todos os abertos */
  free: boolean;
  currentPlayer: Player;
  /** Muda de valor quando o tabuleiro deve tremer (jogada inválida em outro lugar) */
  nudgeId?: number;
  onCellClick: (cellIndex: number) => void;
}

const OVERLAY_TEXT = { x: 'X', o: 'O', draw: t.boardDraw };

const SHAKE: Keyframe[] = [
  { transform: 'translateX(0)' },
  { transform: 'translateX(-8px)' },
  { transform: 'translateX(8px)' },
  { transform: 'translateX(-5px)' },
  { transform: 'translateX(5px)' },
  { transform: 'translateX(0)' }
];

export default function MiniBoard({ board, playable, free, currentPlayer, nudgeId, onCellClick }: Props) {

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {

    if (nudgeId === undefined) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    ref.current?.animate(SHAKE, { duration: 400, easing: 'ease-out' });

  }, [nudgeId]);

  const classes = ['mini-board'];

  if (board.winner) {
    classes.push('locked');
  } else if (playable) {
    classes.push(free ? 'free' : `active ${currentPlayer}-turn`);
  }

  return (
    <div className={classes.join(' ')} ref={ref}>

      {board.cells.map((cell, i) => (
        <div
          key={i}
          className={cell ? `cell ${cell}` : 'cell'}
          onClick={() => onCellClick(i)}
        />
      ))}

      {board.winner && (
        <div className={`board-overlay ${board.winner}`}>
          {OVERLAY_TEXT[board.winner]}
        </div>
      )}

    </div>
  );

}
