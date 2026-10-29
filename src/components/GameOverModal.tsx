import type { MiniBoard, Result } from '../game/logic';
import ShareVictoryButton from './ShareVictoryButton';

interface Props {
  winner: Result;
  boards: MiniBoard[];
  autoRestart: boolean;
  onShare: () => void;
  onRestart: () => void;
}

const TITLES = {
  x: '✕ Jogador X venceu!',
  o: '◯ Jogador O venceu!',
  draw: 'Empate!'
};

export default function GameOverModal({ winner, boards, autoRestart, onShare, onRestart }: Props) {

  return (
    <div className={winner ? 'modal show' : 'modal'}>
      <div className="modal-card">
        <div className="modal-title">{winner && TITLES[winner]}</div>
        {autoRestart && (
          <div className="modal-subtitle">
            O jogo será reiniciado automaticamente.
          </div>
        )}
        {(winner === 'x' || winner === 'o') && (
          <ShareVictoryButton boards={boards} winner={winner} onShare={onShare} />
        )}
        <button className="btn" onClick={onRestart}>
          Jogar novamente
        </button>
      </div>
    </div>
  );

}
