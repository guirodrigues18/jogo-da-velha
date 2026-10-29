import { useEffect, useState } from 'react';
import { applyMove, createGame, passTurn, type GameState } from '../game/logic';
import { playSound, type SoundName } from '../audio/sounds';
import { useTurnTimer, WARNING_SECONDS } from './useTurnTimer';

const RESTART_DELAY_MS = 4000;
const NOTICE_DURATION_MS = 2400;

/** Pedido para o tabuleiro obrigatório tremer (o id muda a cada jogada inválida) */
export interface Nudge {
  board: number;
  id: number;
}

export interface Notice {
  text: string;
  id: number;
}

export function useGame() {

  const [game, setGame] = useState(createGame);
  const [autoRestart, setAutoRestart] = useState(true);
  const [nudge, setNudge] = useState<Nudge | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);

  // O cronômetro só começa depois da primeira jogada
  const timerActive = game.turn > 0 && !game.winner;

  const secondsLeft = useTurnTimer(game.turn, timerActive, () => {

    const next = game.currentPlayer === 'x' ? 'O' : 'X';

    setGame(passTurn);
    setNotice({ text: `⏱ Tempo esgotado! Vez do Jogador ${next}`, id: Date.now() });
    playSound('timeout');

  });

  // Tique nos últimos segundos do turno
  useEffect(() => {

    if (timerActive && secondsLeft > 0 && secondsLeft <= WARNING_SECONDS) playSound('tick');

  }, [secondsLeft, timerActive]);

  // Reinício automático; o cleanup cancela o timer se o jogo for reiniciado antes
  useEffect(() => {

    if (!game.winner || !autoRestart) return;

    const timer = setTimeout(() => setGame(createGame()), RESTART_DELAY_MS);

    return () => clearTimeout(timer);

  }, [game.winner, autoRestart]);

  useEffect(() => {

    if (!notice) return;

    const timer = setTimeout(() => setNotice(null), NOTICE_DURATION_MS);

    return () => clearTimeout(timer);

  }, [notice]);

  const play = (boardIndex: number, cellIndex: number) => {

    const next = applyMove(game, boardIndex, cellIndex);

    if (next === game) {

      if (game.winner) return;

      playSound('invalid');

      const { activeBoard } = game;

      if (activeBoard !== null) setNudge(n => ({ board: activeBoard, id: (n?.id ?? 0) + 1 }));

      return;

    }

    setGame(next);
    playSound(moveSound(game, next, boardIndex));

  };

  const restart = () => {
    setGame(createGame());
    setAutoRestart(true);
  };

  // Mantém o resultado na tela (ex.: enquanto o jogador compartilha a vitória)
  const cancelAutoRestart = () => setAutoRestart(false);

  return {
    game,
    autoRestart,
    secondsLeft,
    timerActive,
    nudge,
    notice,
    play,
    restart,
    cancelAutoRestart
  };

}

function moveSound(prev: GameState, next: GameState, boardIndex: number): SoundName {

  if (next.winner) return next.winner === 'draw' ? 'draw' : 'win';

  if (next.boards[boardIndex].winner) return 'board';

  return prev.currentPlayer;

}
