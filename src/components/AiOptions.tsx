import { DIFFICULTIES, type Difficulty } from '../game/ai';
import type { Player } from '../game/logic';
import { t } from '../i18n';
import SymbolPicker from './SymbolPicker';

interface Props {
  difficulty: Difficulty;
  symbol: Player;
  onDifficultyChange: (difficulty: Difficulty) => void;
  onSymbolChange: (symbol: Player) => void;
}

/** Contra a IA: escolha do nível e do símbolo (o modo de jogo se escolhe no início) */
export default function AiOptions({ difficulty, symbol, onDifficultyChange, onSymbolChange }: Props) {

  return (
    <div className="mode-controls">

      <div className="segmented small" role="group" aria-label={t.modes.levelLabel}>
        {DIFFICULTIES.map(level => (
          <button
            key={level}
            className={level === difficulty ? 'active' : ''}
            onClick={() => onDifficultyChange(level)}
            aria-pressed={level === difficulty}
          >
            {t.difficulty[level]}
          </button>
        ))}
      </div>

      <SymbolPicker value={symbol} onChange={onSymbolChange} />

    </div>
  );

}
