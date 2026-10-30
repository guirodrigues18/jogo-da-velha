import type { Player } from '../game/logic';
import { t } from '../i18n';

interface Props {
  value: Player;
  onChange: (symbol: Player) => void;
}

const SYMBOLS: Record<Player, string> = { x: '✕', o: '◯' };

/** "Você joga com ✕ ◯" (o X sempre começa) */
export default function SymbolPicker({ value, onChange }: Props) {

  return (
    <div className="symbol-picker" role="group" aria-label={t.modes.symbolLabel}>
      <span className="symbol-picker-label">{t.modes.symbolLabel}</span>
      {(['x', 'o'] as Player[]).map(symbol => (
        <button
          key={symbol}
          type="button"
          className={symbol === value ? `symbol-option ${symbol} active` : `symbol-option ${symbol}`}
          onClick={() => onChange(symbol)}
          aria-pressed={symbol === value}
        >
          {SYMBOLS[symbol]}
        </button>
      ))}
      <span className="symbol-picker-hint">{t.modes.startsHint}</span>
    </div>
  );

}
