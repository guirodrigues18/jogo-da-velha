import { useEffect, useMemo, useState } from 'react';
import { applyMove, createGame, passTurn, type GameState, type Player } from '../game/logic';
import { chooseMove, type Difficulty } from '../game/ai';
import {
  dailyChallenge,
  dailyRandom,
  loadDailyProgress,
  recordDailyAttempt,
  type DailyProgress
} from '../game/daily';
import { loadPreferences, savePreferences, type LocalMode, type Preferences } from '../game/preferences';
import { recordFromGame, recordGame } from '../stats/achievements';
import { track } from '../online/consent';
import { t } from '../i18n';
import { TURN_SECONDS, useTurnTimer } from './useTurnTimer';
import { useGameFeedback } from './useGameFeedback';

const RESTART_DELAY_MS = 4000;

/** Pausa antes da jogada da IA, para dar tempo de ver a sua */
const AI_DELAY_MS = 450;

/** No desafio diário você é sempre X: a posição do dia começa na vez do X */
const DAILY_HUMAN: Player = 'x';
const DAILY_DIFFICULTY: Difficulty = 'medium';

export type { LocalMode };

export interface Score {
  x: number;
  o: number;
}

/** Partida no mesmo aparelho: dois jogadores, contra a IA ou o desafio diário */
export function useLocalGame() {

  const [preferences, setPreferences] = useState(loadPreferences);
  const { mode, difficulty } = preferences;

  const challenge = useMemo(() => dailyChallenge(), []);
  const [dailyProgress, setDailyProgress] = useState<DailyProgress>(() => loadDailyProgress(challenge.number));

  const startingGame = (forMode: LocalMode): GameState => (forMode === 'daily' ? challenge.start : createGame());

  const [game, setGame] = useState(() => startingGame(mode));
  const [score, setScore] = useState<Score>({ x: 0, o: 0 });
  const [autoRestart, setAutoRestart] = useState(mode !== 'daily');

  /** Nada anda (cronômetro, IA) até o jogador tocar em "Começar" */
  const [started, setStarted] = useState(false);

  /** Esta tentativa começou com o desafio de hoje já vencido (é só por diversão) */
  const [dailyReplay, setDailyReplay] = useState(dailyProgress.won);

  const vsAI = mode !== 'pvp';
  const human: Player = mode === 'daily' ? DAILY_HUMAN : preferences.symbol;
  const ai: Player = human === 'x' ? 'o' : 'x';
  const aiTurn = vsAI && game.currentPlayer === ai && !game.winner;

  // O cronômetro não corre para a IA
  const timerActive = started && !game.winner && !aiTurn;

  /** Modo 2 jogadores: o tempo pode ser pausado (e continua de onde parou) */
  const [paused, setPaused] = useState(false);
  const canPause = mode === 'pvp' && timerActive;
  const isPaused = paused && canPause;

  const secondsLeft = useTurnTimer(game.turn, timerActive, () => setGame(passTurn), TURN_SECONDS, isPaused);

  const { notice, nudge, shake, reject } = useGameFeedback(game, secondsLeft, timerActive, {
    turnText: vsAI ? player => (player === human ? t.local.yourTurn : t.local.aiTurn) : undefined,
    isMe: vsAI ? player => player === human : undefined,
    onGameEnd: finished => {

      const winner = finished.winner;

      if (winner === 'x' || winner === 'o') setScore(s => ({ ...s, [winner]: s[winner] + 1 }));

      // 2 jogadores não entra nas estatísticas (não tem um "você"), mas conta no Analytics
      if (mode === 'pvp') track('game_end', { mode, result: winner === 'draw' ? 'draw' : `${winner}_won` });

      if (mode === 'ai') recordGame(recordFromGame(finished, human, 'ai', difficulty));

      if (mode === 'daily') {
        // Depois de vencer o desafio do dia, jogar de novo é só por diversão
        if (!dailyProgress.won) recordGame(recordFromGame(finished, human, 'daily'));
        const moves = finished.boards.reduce((total, b) => total + b.cells.filter(Boolean).length, 0);
        setDailyProgress(recordDailyAttempt(challenge.number, winner === human, moves));
      }

    }
  });

  // Vez da IA (no desafio diário, a mesma jogada sua recebe sempre a mesma resposta)
  useEffect(() => {

    if (!aiTurn || !started) return;

    const timer = setTimeout(() => {
      const move = mode === 'daily'
        ? chooseMove(game, DAILY_DIFFICULTY, undefined, dailyRandom(challenge, game))
        : chooseMove(game, difficulty);
      setGame(applyMove(game, ...move));
    }, AI_DELAY_MS);

    return () => clearTimeout(timer);

  }, [game, aiTurn, started, difficulty, mode, challenge]);

  // Reinício automático; o cleanup cancela o timer se o jogo for reiniciado antes
  useEffect(() => {

    if (!game.winner || !autoRestart) return;

    const timer = setTimeout(() => setGame(startingGame(mode)), RESTART_DELAY_MS);

    return () => clearTimeout(timer);

  }, [game.winner, autoRestart]);

  const play = (boardIndex: number, cellIndex: number) => {

    if (aiTurn || !started || isPaused) return;

    const next = applyMove(game, boardIndex, cellIndex);

    if (next === game) {
      if (!game.winner) reject();
      return;
    }

    setGame(next);

  };

  const restart = (forMode = mode) => {
    setPaused(false);
    setGame(startingGame(forMode));
    setAutoRestart(forMode !== 'daily');
    setDailyReplay(loadDailyProgress(challenge.number).won);
  };

  /** Trocar de nível ou símbolo começa uma série nova (e espera o "Começar" de novo) */
  const changePreferences = (changes: Partial<Preferences>) => {
    const next = savePreferences(changes);
    setPreferences(next);
    setScore({ x: 0, o: 0 });
    setStarted(false);
    restart(next.mode);
  };

  // Mantém o resultado na tela (ex.: enquanto o jogador compartilha a vitória)
  const cancelAutoRestart = () => setAutoRestart(false);

  return {
    game,
    mode,
    difficulty,
    symbol: preferences.symbol,
    human,
    vsAI,
    aiTurn,
    score,
    challenge,
    dailyProgress,
    dailyReplay,
    autoRestart,
    started,
    secondsLeft,
    timerActive,
    paused: isPaused,
    canPause,
    togglePause: () => setPaused(value => !value),
    nudge,
    notice,
    shake,
    play,
    start: () => setStarted(true),
    restart: () => restart(),
    cancelAutoRestart,
    setDifficulty: (value: Difficulty) => changePreferences({ difficulty: value, mode: 'ai' }),
    setSymbol: (value: Player) => changePreferences({ symbol: value })
  };

}
