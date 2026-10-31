import type { MiniBoard } from '../game/logic';
import type { MarkResult } from '../game/group';
import ShareVictoryButton from './ShareVictoryButton';
import { t } from '../i18n';

interface Props {
  winner: MarkResult;
  boards: MiniBoard[];
  /** Força o modal aberto mesmo sem vencedor (ex.: adversário saiu da sala) */
  open?: boolean;
  /** Substitui o título padrão (ex.: "Você venceu!" no modo online) */
  title?: string;
  subtitle?: string;
  /** Como a partida terminou (ex.: decidida por tempo) */
  note?: string;
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

/** Títulos padrão do 1x1 (os modos em grupo sempre passam o próprio título) */
const TITLES: Partial<Record<NonNullable<MarkResult>, string>> = {
  x: t.result.x,
  o: t.result.o,
  draw: t.result.draw
};

export default function GameOverModal({
  winner,
  boards,
  open = winner !== null,
  title,
  subtitle,
  note,
  winnerName,
  autoRestart,
  restartLabel = t.result.playAgain,
  restartDisabled = false,
  showShare,
  onShare,
  onRestart,
  secondaryLabel,
  onSecondary
}: Props) {

  const defaultTitle = winner ? TITLES[winner] ?? '' : '';

  return (
    <div className={open ? 'modal show' : 'modal'}>
      <div className="modal-card">
        <div className="modal-title">{open && (title ?? defaultTitle)}</div>
        {open && note && <div className="modal-subtitle">{note}</div>}
        {autoRestart ? (
          <div className="modal-subtitle">{t.result.autoRestart}</div>
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
