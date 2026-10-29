import { isBoardPlayable } from './game/logic';
import { useGame } from './hooks/useGame';
import InfoBar from './components/InfoBar';
import MiniBoard from './components/MiniBoard';
import GameOverModal from './components/GameOverModal';
import SoundToggle from './components/SoundToggle';

export default function App() {

  const {
    game,
    autoRestart,
    secondsLeft,
    timerActive,
    nudge,
    notice,
    play,
    restart,
    cancelAutoRestart
  } = useGame();

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
            activeBoard={game.activeBoard}
            turn={game.turn}
            secondsLeft={secondsLeft}
            timerActive={timerActive}
          />
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
              onCellClick={cell => play(i, cell)}
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

      <GameOverModal
        winner={game.winner}
        boards={game.boards}
        autoRestart={autoRestart}
        onShare={cancelAutoRestart}
        onRestart={restart}
      />
    </>
  );

}
