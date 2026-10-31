import { useEffect, useRef, type ReactNode } from 'react';
import { lostOnTime, timeoutsLeft, type GameState, type MiniBoard as ClassicBoard } from '../game/logic';
import type { Mark, MarkResult } from '../game/group';
import type { Notice, Nudge } from '../hooks/useGameFeedback';
import InfoBar from './InfoBar';
import MiniBoard, { type BoardCells, type Glyphs } from './MiniBoard';
import GameOverModal from './GameOverModal';
import TopActions from './TopActions';
import Logo from './Logo';
import Scoreboard, { type ScoreInfo } from './Scoreboard';
import { t } from '../i18n';

/** O que a tela precisa de uma partida (1x1, 2x2 ou Champs) */
export interface BoardView {
  boards: BoardCells[];
  currentPlayer: Mark;
  activeBoard: number | null;
  winner: MarkResult;
  turn: number;
}

/** Chances de tempo esgotado e aviso de fim por tempo no 1x1 (local e online) */
export function classicTimeouts(game: GameState) {

  return {
    timeoutsLeft: game.winner ? undefined : timeoutsLeft(game, game.currentPlayer),
    endNote: lostOnTime(game) ? t.timeouts.endedNote : undefined
  };

}

function isPlayable(game: BoardView, boardIndex: number): boolean {

  if (game.winner || game.boards[boardIndex].winner) return false;

  return game.activeBoard === null || game.activeBoard === boardIndex;

}

interface Props {
  game: BoardView;
  secondsLeft: number;
  timerActive: boolean;
  /** Segundos por jogada (padrão: os do 1x1) */
  turnSeconds?: number;
  /** Tempos esgotados que o jogador da vez ainda pode ter; ausente = não mostra */
  timeoutsLeft?: number;
  /** Como a partida terminou, no modal (ex.: decidida por tempo) */
  endNote?: string;
  /** Modo 2 jogadores: tempo pausado (cobre o tabuleiro) e o botão de pausar/continuar */
  paused?: boolean;
  onTogglePause?: () => void;
  nudge: Nudge | null;
  notice: Notice | null;
  /** Muda a cada mini-tabuleiro conquistado: o tabuleiro principal treme */
  shake?: number;
  /** Substitui "Jogador X/O" no card de turno (ex.: "Sua vez") */
  turnLabel?: string;
  /** Símbolo de quem usa este aparelho (contra a IA e online): destaca a sua vez */
  you?: Mark;
  /** Se é a sua vez, quando o símbolo não basta (no 2x2, o parceiro tem o mesmo) */
  myTurn?: boolean;
  /** Símbolos da loja no lugar do X/O */
  glyphs?: Glyphs;
  /** Acima das informações (ex.: escolha do modo de jogo) */
  controls?: ReactNode;
  /** Placar da série; ausente antes de existir uma série */
  score?: ScoreInfo;
  /** Abaixo das informações (convite, status online...) */
  panel?: ReactNode;
  /** Elementos flutuantes por cima do jogo (reações) */
  overlay?: ReactNode;
  onCellClick: (boardIndex: number, cellIndex: number) => void;
  /** Botão "← Início" (partidas locais; o online tem o próprio "Sair") */
  onHome?: () => void;
  /** Presente enquanto a partida espera o "Começar": cobre o tabuleiro */
  onStart?: () => void;
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
  turnSeconds,
  timeoutsLeft: chancesLeft,
  endNote,
  paused = false,
  onTogglePause,
  nudge,
  notice,
  shake = 0,
  turnLabel,
  you,
  myTurn,
  glyphs,
  controls,
  score,
  panel,
  overlay,
  onCellClick,
  onHome,
  onStart,
  modal
}: Props) {

  const boardRef = useRef<HTMLDivElement>(null);

  const notMine = myTurn !== undefined ? !myTurn : Boolean(you && you !== game.currentPlayer);
  const waiting = !onStart && notMine && !game.winner;

  // Tremida ao conquistar um mini-tabuleiro
  useEffect(() => {

    if (!shake || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    boardRef.current?.animate(SHAKE, { duration: 350, easing: 'ease-out' });

  }, [shake]);

  return (
    <>
      <div className="container game">

        <div className="top">
          <div className="top-bar">
            {onHome && (
              <button className="back-button" onClick={onHome} aria-label={t.home.back}>
                <span aria-hidden="true">←</span> <span className="back-label">{t.home.back}</span>
              </button>
            )}
            <TopActions />
          </div>

          <Logo />

          <p className="subtitle">{t.subtitle}</p>

          {controls}

          <InfoBar
            currentPlayer={game.currentPlayer}
            turnLabel={turnLabel}
            you={you}
            myTurn={myTurn}
            turnSeconds={turnSeconds}
            activeBoard={game.activeBoard}
            turn={game.turn}
            secondsLeft={secondsLeft}
            timerActive={timerActive}
            timeoutsLeft={chancesLeft}
            paused={paused}
            onTogglePause={onTogglePause}
          />

          {score && <Scoreboard {...score} />}

          {panel}
        </div>

        {/* Ocupa o espaço que sobra na tela; o tabuleiro é o maior quadrado que cabe nele */}
        <div className="board-area">
          {/* Na vez do outro, o tabuleiro fica levemente apagado */}
          <div className={waiting ? 'main-board waiting' : 'main-board'} ref={boardRef}>
            {game.boards.map((board, i) => (
              <MiniBoard
                key={i}
                board={board}
                playable={isPlayable(game, i)}
                free={game.activeBoard === null}
                currentPlayer={game.currentPlayer}
                glyphs={glyphs}
                nudgeId={nudge?.board === i ? nudge.id : undefined}
                onCellClick={cell => onCellClick(i, cell)}
              />
            ))}

            {paused && onTogglePause && (
              <div className="start-overlay">
                <div className="start-card">
                  <strong>{t.local.pausedTitle}</strong>
                  <button className="btn start-button" onClick={onTogglePause}>
                    {t.local.resumeButton}
                  </button>
                  <small>{t.local.pausedHint}</small>
                </div>
              </div>
            )}

            {onStart && (
              <div className="start-overlay">
                <div className="start-card">
                  <strong>{t.home.ready}</strong>
                  <button className="btn start-button" onClick={onStart}>
                    {t.home.start}
                  </button>
                  <small>{t.home.readyHint}</small>
                </div>
              </div>
            )}
          </div>
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

      {/* A imagem de compartilhar só existe no 1x1 (✕ e ◯): os outros modos não mostram o botão */}
      <GameOverModal
        winner={game.winner}
        boards={game.boards as ClassicBoard[]}
        note={endNote}
        {...modal}
      />

      {overlay}
    </>
  );

}
