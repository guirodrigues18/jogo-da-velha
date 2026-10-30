import { DIFFICULTIES, type Difficulty } from '../game/ai';
import type { Player } from '../game/logic';
import type { LocalMode } from '../game/preferences';
import { t } from '../i18n';
import SymbolPicker from './SymbolPicker';

interface Props {
  mode: LocalMode;
  difficulty: Difficulty;
  symbol: Player;
  /** O desafio de hoje ainda não foi vencido: mostra um aviso no botão da IA */
  dailyPending: boolean;
  onModeChange: (mode: LocalMode) => void;
  onDifficultyChange: (difficulty: Difficulty) => void;
  onSymbolChange: (symbol: Player) => void;
  /** Ausente quando o modo online não está configurado */
  onPlayOnline?: () => void;
}

/** Escolha do modo de jogo e, contra a IA, do nível (ou desafio diário) e do símbolo */
export default function ModeSwitch({
  mode,
  difficulty,
  symbol,
  dailyPending,
  onModeChange,
  onDifficultyChange,
  onSymbolChange,
  onPlayOnline
}: Props) {

  const vsAI = mode !== 'pvp';

  return (
    <div className="mode-controls">

      <div className="segmented" role="group" aria-label={t.modes.label}>
        <button className={mode === 'pvp' ? 'active' : ''} onClick={() => onModeChange('pvp')} aria-pressed={mode === 'pvp'}>
          {t.modes.pvp}
        </button>
        <button className={vsAI ? 'active' : ''} onClick={() => onModeChange('ai')} aria-pressed={vsAI}>
          {t.modes.ai}
          {dailyPending && !vsAI && <span className="badge-dot" aria-hidden="true" />}
        </button>
        {onPlayOnline && (
          <button onClick={onPlayOnline}>{t.modes.online}</button>
        )}
      </div>

      {vsAI && (
        <div className="segmented small" role="group" aria-label={t.modes.levelLabel}>
          {DIFFICULTIES.map(level => (
            <button
              key={level}
              className={mode === 'ai' && level === difficulty ? 'active' : ''}
              onClick={() => onDifficultyChange(level)}
              aria-pressed={mode === 'ai' && level === difficulty}
            >
              {t.difficulty[level]}
            </button>
          ))}
          <button
            className={mode === 'daily' ? 'active daily' : 'daily'}
            onClick={() => onModeChange('daily')}
            aria-pressed={mode === 'daily'}
          >
            {t.modes.daily}
            {dailyPending && mode !== 'daily' && <span className="badge-dot" aria-hidden="true" />}
          </button>
        </div>
      )}

      {mode === 'ai' && <SymbolPicker value={symbol} onChange={onSymbolChange} />}

    </div>
  );

}
