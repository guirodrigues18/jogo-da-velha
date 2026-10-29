import { useEffect, useRef, useState } from 'react';
import type { GameState, Player } from '../game/logic';
import { playSound, type SoundName } from '../audio/sounds';
import { vibrate, VIBRATION } from '../audio/haptics';
import { celebrate } from '../effects/confetti';
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

interface Options {
  /** Descreve de quem é a vez no aviso de tempo esgotado (ex.: "Vez de Ana") */
  turnText?: (player: Player) => string;
  /** Se as jogadas deste jogador tocam som neste aparelho (online: só as próprias) */
  soundFor?: (player: Player) => boolean;
  /** Se este jogador é "você" neste aparelho: vibração e confete na vitória */
  celebrateFor?: (player: Player) => boolean;
  /** Chamado uma vez quando uma partida termina com uma jogada feita agora */
  onGameEnd?: (game: GameState) => void;
}

const defaultTurnText = (player: Player) => `Vez do Jogador ${player.toUpperCase()}`;
const everyone = () => true;

/**
 * Sons, vibração, confete, avisos e tremidas a partir das mudanças de estado.
 * Funciona igual para jogadas locais, do computador e do adversário online.
 */
export function useGameFeedback(
  game: GameState,
  secondsLeft: number,
  timerActive: boolean,
  { turnText = defaultTurnText, soundFor = everyone, celebrateFor = everyone, onGameEnd }: Options = {}
) {

  const [notice, setNotice] = useState<Notice | null>(null);
  const [nudge, setNudge] = useState<Nudge | null>(null);
  /** Muda a cada mini-tabuleiro conquistado: o tabuleiro principal treme */
  const [shake, setShake] = useState(0);
  const previous = useRef(game);

  useEffect(() => {

    const prev = previous.current;

    previous.current = game;

    // Só reage a um turno por vez (ignora carga inicial e reinício de partida)
    if (game.turn !== prev.turn + 1) return;

    // Quem jogou (ou deixou o tempo acabar) é quem estava com a vez
    const actor = prev.currentPlayer;
    const boardIndex = findChangedBoard(prev, game);

    if (boardIndex === null) {
      setNotice({ text: `⏱ Tempo esgotado! ${turnText(game.currentPlayer)}`, id: Date.now() });
      if (soundFor(actor)) playSound('timeout');
      return;
    }

    const conquered = Boolean(game.boards[boardIndex].winner && !prev.boards[boardIndex].winner);

    if (conquered) setShake(n => n + 1);

    if (soundFor(actor)) playSound(moveSound(game, boardIndex, actor));

    if (celebrateFor(actor)) {
      if (game.winner === actor) vibrate(VIBRATION.win);
      else vibrate(conquered ? VIBRATION.board : VIBRATION.move);
    }

    if (game.winner) {
      if (game.winner !== 'draw' && celebrateFor(game.winner)) celebrate();
      onGameEnd?.(game);
    }

  }, [game]);

  // Tique nos últimos segundos, só para quem está com a vez
  useEffect(() => {

    if (!timerActive || !soundFor(game.currentPlayer)) return;

    if (secondsLeft > 0 && secondsLeft <= WARNING_SECONDS) playSound('tick');

  }, [secondsLeft, timerActive]);

  useEffect(() => {

    if (!notice) return;

    const timer = setTimeout(() => setNotice(null), NOTICE_DURATION_MS);

    return () => clearTimeout(timer);

  }, [notice]);

  /** Jogada inválida: som de erro, vibração e o tabuleiro obrigatório treme */
  const reject = () => {

    playSound('invalid');
    vibrate(VIBRATION.invalid);

    const { activeBoard } = game;

    if (activeBoard !== null) setNudge(n => ({ board: activeBoard, id: (n?.id ?? 0) + 1 }));

  };

  return { notice, nudge, shake, reject };

}

function findChangedBoard(prev: GameState, next: GameState): number | null {

  const index = next.boards.findIndex((board, i) =>
    board.cells.some((cell, j) => cell !== prev.boards[i].cells[j])
  );

  return index === -1 ? null : index;

}

function moveSound(next: GameState, boardIndex: number, actor: Player): SoundName {

  if (next.winner) return next.winner === 'draw' ? 'draw' : 'win';

  if (next.boards[boardIndex].winner) return 'board';

  return actor;

}
