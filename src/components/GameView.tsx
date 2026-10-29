import type { ReactNode } from 'react';
import { isBoardPlayable, type GameState } from '../game/logic';
import type { Notice, Nudge } from '../hooks/useGameFeedback';
import InfoBar from './InfoBar';
import MiniBoard from './MiniBoard';
import GameOverModal from './GameOverModal';
import SoundToggle from './SoundToggle';

interface Props {
  game: GameState;
  secondsLeft: number;
  timerActive: boolean;
  nudge: Nudge | null;
  notice: Notice | null;
  /** Substitui "Jogador X/O" no card de turno (ex.: "Sua vez") */
  turnLabel?: string;
  /** Conteúdo extra abaixo das informações (botão de jogar online, convite...) */
  panel?: ReactNode;
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

/** Tela do jogo, compartilhada pelos modos local e online */
export default function GameView({
  game,
  secondsLeft,
  timerActive,
  nudge,
  notice,
  turnLabel,
  panel,
  onCellClick,
  modal
}: Props) {

  return (
    <>
      <div className="container">

        <div className="top">
          <div className="top-row">
            <h1 className="title">Jogo da Velha<span> 2.0</span></h1>
            <SoundToggle />
          </div>

          <p className="subtitle">
            Ganhe mini-tabuleiros para dominar o tabuleiro principal.
            Cada jogada define onde o próximo jogador deverá jogar.
          </p>

          <InfoBar
            currentPlayer={game.currentPlayer}
            turnLabel={turnLabel}
            activeBoard={game.activeBoard}
            turn={game.turn}
            secondsLeft={secondsLeft}
            timerActive={timerActive}
          />

          {panel}
        </div>

        <div className="main-board">
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
    </>
  );

}
