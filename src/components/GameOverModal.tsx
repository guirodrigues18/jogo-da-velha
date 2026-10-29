import type { MiniBoard, Result } from '../game/logic';
import ShareVictoryButton from './ShareVictoryButton';

interface Props {
  winner: Result;
  boards: MiniBoard[];
  /** Força o modal aberto mesmo sem vencedor (ex.: adversário saiu da sala) */
  open?: boolean;
  /** Substitui o título padrão (ex.: "Você venceu!" no modo online) */
  title?: string;
  subtitle?: string;
  /** Nome exibido na imagem de compartilhamento (padrão: "Jogador X") */
  winnerName?: string;
  autoRestart: boolean;
  restartLabel?: string;
  /** Ex.: revanche já pedida, aguardando o adversário */
  restartDisabled?: boolean;
  showShare: boolean;
  onShare: () => void;
  onRestart: () => void;
  /** Ação discreta abaixo do botão principal (ex.: "Sair da sala") */
  secondaryLabel?: string;
  onSecondary?: () => void;
}

const TITLES = {
  x: '✕ Jogador X venceu!',
  o: '◯ Jogador O venceu!',
  draw: 'Empate!'
};

export default function GameOverModal({
  winner,
  boards,
  open = winner !== null,
  title,
  subtitle,
  winnerName,
  autoRestart,
  restartLabel = 'Jogar novamente',
  restartDisabled = false,
  showShare,
  onShare,
  onRestart,
  secondaryLabel,
  onSecondary
}: Props) {

  const defaultTitle = winner ? TITLES[winner] : '';

  return (
    <div className={open ? 'modal show' : 'modal'}>
      <div className="modal-card">
        <div className="modal-title">{open && (title ?? defaultTitle)}</div>
        {autoRestart ? (
          <div className="modal-subtitle">
            O jogo será reiniciado automaticamente.
          </div>
        ) : subtitle && (
          <div className="modal-subtitle">{subtitle}</div>
        )}
        {showShare && (winner === 'x' || winner === 'o') && (
          <ShareVictoryButton boards={boards} winner={winner} winnerName={winnerName} onShare={onShare} />
        )}
        <button className="btn" onClick={onRestart} disabled={restartDisabled}>
          {restartLabel}
        </button>
        {secondaryLabel && (
          <button className="link-button modal-secondary" onClick={onSecondary}>
            {secondaryLabel}
          </button>
        )}
      </div>
    </div>
  );

}
