import { DIFFICULTY_LABELS, type Difficulty } from '../game/ai';
import type { LocalMode } from '../hooks/useLocalGame';

interface Props {
  mode: LocalMode;
  difficulty: Difficulty;
  onModeChange: (mode: LocalMode) => void;
  onDifficultyChange: (difficulty: Difficulty) => void;
  /** Ausente quando o modo online não está configurado */
  onPlayOnline?: () => void;
}

const LEVELS = Object.keys(DIFFICULTY_LABELS) as Difficulty[];

/** Escolha do modo de jogo e, contra o computador, do nível */
export default function ModeSwitch({ mode, difficulty, onModeChange, onDifficultyChange, onPlayOnline }: Props) {

  return (
    <div className="mode-controls">

      <div className="segmented" role="group" aria-label="Modo de jogo">
        <button className={mode === 'pvp' ? 'active' : ''} onClick={() => onModeChange('pvp')} aria-pressed={mode === 'pvp'}>
          👥 2 jogadores
        </button>
        <button className={mode === 'ai' ? 'active' : ''} onClick={() => onModeChange('ai')} aria-pressed={mode === 'ai'}>
          🤖 Computador
        </button>
        {onPlayOnline && (
          <button onClick={onPlayOnline}>🌐 Online</button>
        )}
      </div>

      {mode === 'ai' && (
        <div className="segmented small" role="group" aria-label="Nível do computador">
          {LEVELS.map(level => (
            <button
              key={level}
              className={level === difficulty ? 'active' : ''}
              onClick={() => onDifficultyChange(level)}
              aria-pressed={level === difficulty}
            >
              {DIFFICULTY_LABELS[level]}
            </button>
          ))}
        </div>
      )}

    </div>
  );

}
