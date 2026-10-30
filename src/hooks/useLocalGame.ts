import { useEffect, useState } from 'react';
import { applyMove, createGame, passTurn, type Player } from '../game/logic';
import { chooseMove, type Difficulty } from '../game/ai';
import { recordFromGame, recordGame } from '../stats/achievements';
import { t } from '../i18n';
import { useTurnTimer } from './useTurnTimer';
import { useGameFeedback } from './useGameFeedback';

const RESTART_DELAY_MS = 4000;

/** Pausa antes da jogada do computador, para dar tempo de ver a sua */
const COMPUTER_DELAY_MS = 450;

/** Contra o computador, você é sempre X (começa) e ele é O */
export const HUMAN: Player = 'x';
const COMPUTER: Player = 'o';

export type LocalMode = 'pvp' | 'ai';

export interface Score {
  x: number;
  o: number;
}

interface Preferences {
  mode: LocalMode;
  difficulty: Difficulty;
}

const PREFERENCES_KEY = 'jogo-da-velha:modo-local';
const DEFAULT_PREFERENCES: Preferences = { mode: 'pvp', difficulty: 'medium' };

function loadPreferences(): Preferences {

  try {
    const saved = localStorage.getItem(PREFERENCES_KEY);
    return saved ? { ...DEFAULT_PREFERENCES, ...JSON.parse(saved) } : DEFAULT_PREFERENCES;
  } catch {
    return DEFAULT_PREFERENCES;
  }

}

function savePreferences(preferences: Preferences) {

  try {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
  } catch {
    // Vale só para esta visita
  }

}

/** Partida no mesmo aparelho: dois jogadores ou contra o computador */
export function useLocalGame() {

  const [preferences, setPreferences] = useState(loadPreferences);
  const [game, setGame] = useState(createGame);
  const [score, setScore] = useState<Score>({ x: 0, o: 0 });
  const [autoRestart, setAutoRestart] = useState(true);

  const { mode, difficulty } = preferences;
  const vsComputer = mode === 'ai';
  const computerTurn = vsComputer && game.currentPlayer === COMPUTER && !game.winner;

  // O cronômetro só começa depois da primeira jogada (e não corre para o computador)
  const timerActive = game.turn > 0 && !game.winner && !computerTurn;

  const secondsLeft = useTurnTimer(game.turn, timerActive, () => setGame(passTurn));

  const { notice, nudge, shake, reject } = useGameFeedback(game, secondsLeft, timerActive, {
    turnText: vsComputer ? player => (player === HUMAN ? t.local.yourTurn : t.local.computerTurn) : undefined,
    celebrateFor: vsComputer ? player => player === HUMAN : undefined,
    onGameEnd: finished => {
      const winner = finished.winner;
      if (winner === 'x' || winner === 'o') setScore(s => ({ ...s, [winner]: s[winner] + 1 }));
      if (vsComputer) recordGame(recordFromGame(finished, HUMAN, 'ai', difficulty));
    }
  });

  // Vez do computador
  useEffect(() => {

    if (!computerTurn) return;

    const timer = setTimeout(() => setGame(applyMove(game, ...chooseMove(game, difficulty))), COMPUTER_DELAY_MS);

    return () => clearTimeout(timer);

  }, [game, computerTurn, difficulty]);

  // Reinício automático; o cleanup cancela o timer se o jogo for reiniciado antes
  useEffect(() => {

    if (!game.winner || !autoRestart) return;

    const timer = setTimeout(() => setGame(createGame()), RESTART_DELAY_MS);

    return () => clearTimeout(timer);

  }, [game.winner, autoRestart]);

  const play = (boardIndex: number, cellIndex: number) => {

    if (computerTurn) return;

    const next = applyMove(game, boardIndex, cellIndex);

    if (next === game) {
      if (!game.winner) reject();
      return;
    }

    setGame(next);

  };

  const restart = () => {
    setGame(createGame());
    setAutoRestart(true);
  };

  /** Trocar de modo ou de nível começa uma série nova */
  const changePreferences = (changes: Partial<Preferences>) => {
    const next = { ...preferences, ...changes };
    setPreferences(next);
    savePreferences(next);
    setScore({ x: 0, o: 0 });
    restart();
  };

  // Mantém o resultado na tela (ex.: enquanto o jogador compartilha a vitória)
  const cancelAutoRestart = () => setAutoRestart(false);

  return {
    game,
    mode,
    difficulty,
    vsComputer,
    computerTurn,
    score,
    autoRestart,
    secondsLeft,
    timerActive,
    nudge,
    notice,
    shake,
    play,
    restart,
    cancelAutoRestart,
    setMode: (value: LocalMode) => changePreferences({ mode: value }),
    setDifficulty: (value: Difficulty) => changePreferences({ difficulty: value })
  };

}
