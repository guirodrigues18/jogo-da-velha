import { DIFFICULTIES, type Difficulty } from '../game/ai';
import type { LocalMode } from '../hooks/useLocalGame';
import { t } from '../i18n';

interface Props {
  mode: LocalMode;
  difficulty: Difficulty;
  onModeChange: (mode: LocalMode) => void;
  onDifficultyChange: (difficulty: Difficulty) => void;
  /** Ausente quando o modo online não está configurado */
  onPlayOnline?: () => void;
}

/** Escolha do modo de jogo e, contra o computador, do nível */
export default function ModeSwitch({ mode, difficulty, onModeChange, onDifficultyChange, onPlayOnline }: Props) {

  return (
    <div className="mode-controls">

      <div className="segmented" role="group" aria-label={t.modes.label}>
        <button className={mode === 'pvp' ? 'active' : ''} onClick={() => onModeChange('pvp')} aria-pressed={mode === 'pvp'}>
          {t.modes.pvp}
        </button>
        <button className={mode === 'ai' ? 'active' : ''} onClick={() => onModeChange('ai')} aria-pressed={mode === 'ai'}>
          {t.modes.ai}
        </button>
        {onPlayOnline && (
          <button onClick={onPlayOnline}>{t.modes.online}</button>
        )}
      </div>

      {mode === 'ai' && (
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
      )}

    </div>
  );

}
