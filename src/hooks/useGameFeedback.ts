import { useEffect, useRef, useState } from 'react';
import type { GameState } from '../game/logic';
import { playSound, type SoundName } from '../audio/sounds';
import { WARNING_SECONDS } from './useTurnTimer';

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

/**
 * Sons, avisos e tremidas a partir das mudanças de estado. Funciona igual para
 * jogadas locais e para jogadas do adversário que chegam pela internet.
 */
export function useGameFeedback(game: GameState, secondsLeft: number, timerActive: boolean) {

  const [notice, setNotice] = useState<Notice | null>(null);
  const [nudge, setNudge] = useState<Nudge | null>(null);
  const previous = useRef(game);

  useEffect(() => {

    const prev = previous.current;

    previous.current = game;

    // Só reage a um turno por vez (ignora carga inicial e reinício de partida)
    if (game.turn !== prev.turn + 1) return;

    const boardIndex = findChangedBoard(prev, game);

    if (boardIndex === null) {
      setNotice({ text: `⏱ Tempo esgotado! Vez do Jogador ${game.currentPlayer.toUpperCase()}`, id: Date.now() });
      playSound('timeout');
      return;
    }

    playSound(moveSound(prev, game, boardIndex));

  }, [game]);

  // Tique nos últimos segundos do turno
  useEffect(() => {

    if (timerActive && secondsLeft > 0 && secondsLeft <= WARNING_SECONDS) playSound('tick');

  }, [secondsLeft, timerActive]);

  useEffect(() => {

    if (!notice) return;

    const timer = setTimeout(() => setNotice(null), NOTICE_DURATION_MS);

    return () => clearTimeout(timer);

  }, [notice]);

  /** Jogada inválida: som de erro e o tabuleiro obrigatório treme */
  const reject = () => {

    playSound('invalid');

    const { activeBoard } = game;

    if (activeBoard !== null) setNudge(n => ({ board: activeBoard, id: (n?.id ?? 0) + 1 }));

  };

  return { notice, nudge, reject };

}

function findChangedBoard(prev: GameState, next: GameState): number | null {

  const index = next.boards.findIndex((board, i) =>
    board.cells.some((cell, j) => cell !== prev.boards[i].cells[j])
  );

  return index === -1 ? null : index;

}

function moveSound(prev: GameState, next: GameState, boardIndex: number): SoundName {

  if (next.winner) return next.winner === 'draw' ? 'draw' : 'win';

  if (next.boards[boardIndex].winner) return 'board';

  return prev.currentPlayer;

}
