import { useEffect, useRef } from 'react';
import type { Mark, MarkResult } from '../game/group';
import { t } from '../i18n';

/** Emoji da loja usado no lugar do X/O de cada jogador (ausente = símbolo clássico) */
export type Glyphs = Partial<Record<Mark, string | null>>;

/** Mini-tabuleiro de qualquer modo: ✕ e ◯ no 1x1 e no 2x2; também △ e □ no Champs */
export interface BoardCells {
  cells: (Mark | null)[];
  winner: MarkResult;
}

interface Props {
  board: BoardCells;
  /** O jogador atual pode jogar neste tabuleiro */
  playable: boolean;
  /** Nenhum tabuleiro obrigatório: destaca todos os abertos */
  free: boolean;
  currentPlayer: Mark;
  glyphs?: Glyphs;
  /** Muda de valor quando o tabuleiro deve tremer (jogada inválida em outro lugar) */
  nudgeId?: number;
  onCellClick: (cellIndex: number) => void;
}

const OVERLAY_TEXT = { x: 'X', o: 'O', t: '△', s: '□', draw: t.boardDraw };

const SHAKE: Keyframe[] = [
  { transform: 'translateX(0)' },
  { transform: 'translateX(-8px)' },
  { transform: 'translateX(8px)' },
  { transform: 'translateX(-5px)' },
  { transform: 'translateX(5px)' },
  { transform: 'translateX(0)' }
];

export default function MiniBoard({ board, playable, free, currentPlayer, glyphs = {}, nudgeId, onCellClick }: Props) {

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

  const overlayGlyph = board.winner && board.winner !== 'draw' ? glyphs[board.winner] : null;

  return (
    <div className={classes.join(' ')} ref={ref}>

      {board.cells.map((cell, i) => {

        const glyph = cell ? glyphs[cell] : null;

        return (
          <div
            key={i}
            className={['cell', cell, glyph && 'glyph'].filter(Boolean).join(' ')}
            onClick={() => onCellClick(i)}
          >
            {glyph && <span className="glyph-mark">{glyph}</span>}
          </div>
        );

      })}

      {board.winner && (
        <div className={`board-overlay ${board.winner}${overlayGlyph ? ' glyph' : ''}`}>
          {overlayGlyph ?? OVERLAY_TEXT[board.winner]}
        </div>
      )}

    </div>
  );

}
