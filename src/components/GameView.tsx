import { useEffect, useRef, type ReactNode } from 'react';
import { isBoardPlayable, type GameState } from '../game/logic';
import type { Notice, Nudge } from '../hooks/useGameFeedback';
import InfoBar from './InfoBar';
import MiniBoard from './MiniBoard';
import GameOverModal from './GameOverModal';
import TopActions from './TopActions';
import Scoreboard, { type ScoreInfo } from './Scoreboard';
import { t } from '../i18n';

interface Props {
  game: GameState;
  secondsLeft: number;
  timerActive: boolean;
  nudge: Nudge | null;
  notice: Notice | null;
  /** Muda a cada mini-tabuleiro conquistado: o tabuleiro principal treme */
  shake?: number;
  /** Substitui "Jogador X/O" no card de turno (ex.: "Sua vez") */
  turnLabel?: string;
  /** Acima das informações (ex.: escolha do modo de jogo) */
  controls?: ReactNode;
  /** Placar da série; ausente antes de existir uma série */
  score?: ScoreInfo;
  /** Abaixo das informações (convite, status online...) */
  panel?: ReactNode;
  /** Elementos flutuantes por cima do jogo (reações) */
  overlay?: ReactNode;
  onCellClick: (boardIndex: number, cellIndex: number) => void;
  modal: {
    /** Força o modal aberto mesmo sem vencedor (ex.: adversário saiu da sala) */
    open?: boolean;
    title?: string;
    subtitle?: string;
    /** Nome exibido na imagem de compartilhamento (padrão: "Jogador X") */
    winnerName?: string;
    autoRestart: boolean;
    restartLabel?: string;
    restartDisabled?: boolean;
    showShare: boolean;
    onShare: () => void;
    onRestart: () => void;
    secondaryLabel?: string;
    onSecondary?: () => void;
  };
}

const SHAKE: Keyframe[] = [
  { transform: 'translate(0, 0)' },
  { transform: 'translate(-4px, 2px)' },
  { transform: 'translate(4px, -2px)' },
  { transform: 'translate(-3px, -1px)' },
  { transform: 'translate(2px, 1px)' },
  { transform: 'translate(0, 0)' }
];

/** Tela do jogo, compartilhada pelos modos local, contra o computador e online */
export default function GameView({
  game,
  secondsLeft,
  timerActive,
  nudge,
  notice,
  shake = 0,
  turnLabel,
  controls,
  score,
  panel,
  overlay,
  onCellClick,
  modal
}: Props) {

  const boardRef = useRef<HTMLDivElement>(null);

  // Tremida ao conquistar um mini-tabuleiro
  useEffect(() => {

    if (!shake || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    boardRef.current?.animate(SHAKE, { duration: 350, easing: 'ease-out' });

  }, [shake]);

  return (
    <>
      <div className="container">

        <div className="top">
          <div className="top-row">
            <h1 className="title">{t.title}<span> 2.0</span></h1>
            <TopActions />
          </div>

          <p className="subtitle">{t.subtitle}</p>

          {controls}

          <InfoBar
            currentPlayer={game.currentPlayer}
            turnLabel={turnLabel}
            activeBoard={game.activeBoard}
            turn={game.turn}
            secondsLeft={secondsLeft}
            timerActive={timerActive}
          />

          {score && <Scoreboard {...score} />}

          {panel}
        </div>

        <div className="main-board" ref={boardRef}>
          {game.boards.map((board, i) => (
            <MiniBoard
              key={i}
              board={board}
              playable={isBoardPlayable(game, i)}
              free={game.activeBoard === null}
              currentPlayer={game.currentPlayer}
              nudgeId={nudge?.board === i ? nudge.id : undefined}
              onCellClick={cell => onCellClick(i, cell)}
            />
          ))}
        </div>

        <div className="legend">
          {/* 🔥 A posição clicada define o próximo mini-tabuleiro do adversário.<br /> */}
          {/* ⚡ Se o tabuleiro estiver fechado, o próximo jogador pode jogar em qualquer um aberto. */}
        </div>

      </div>

      {notice && (
        <div className="toast" key={notice.id} role="status">
          {notice.text}
        </div>
      )}

      <GameOverModal winner={game.winner} boards={game.boards} {...modal} />

      {overlay}
    </>
  );

}
