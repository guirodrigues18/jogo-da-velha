import { useEffect, useState } from 'react';
import { applyMove, createGame, passTurn } from '../game/logic';
import { useTurnTimer } from './useTurnTimer';
import { useGameFeedback } from './useGameFeedback';

const RESTART_DELAY_MS = 4000;

/** Partida com os dois jogadores no mesmo aparelho */
export function useLocalGame() {

  const [game, setGame] = useState(createGame);
  const [autoRestart, setAutoRestart] = useState(true);

  // O cronômetro só começa depois da primeira jogada
  const timerActive = game.turn > 0 && !game.winner;

  const secondsLeft = useTurnTimer(game.turn, timerActive, () => setGame(passTurn));

  const { notice, nudge, reject } = useGameFeedback(game, secondsLeft, timerActive);

  // Reinício automático; o cleanup cancela o timer se o jogo for reiniciado antes
  useEffect(() => {

    if (!game.winner || !autoRestart) return;

    const timer = setTimeout(() => setGame(createGame()), RESTART_DELAY_MS);

    return () => clearTimeout(timer);

  }, [game.winner, autoRestart]);

  const play = (boardIndex: number, cellIndex: number) => {

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
