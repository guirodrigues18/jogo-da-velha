import { useEffect, useRef, useState } from 'react';
import type { GameState, Player } from '../game/logic';
import { playSound, type SoundName } from '../audio/sounds';
import { vibrate, VIBRATION } from '../audio/haptics';
import { celebrate } from '../effects/confetti';
import { WARNING_SECONDS } from './useTurnTimer';
import { t } from '../i18n';

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
  /**
   * Se este jogador é "você" neste aparelho: tique do cronômetro, vibração,
   * confete e som de derrota. No modo 2 jogadores, os dois são "você".
   */
  isMe?: (player: Player) => boolean;
  /** Chamado uma vez quando uma partida termina com uma jogada feita agora */
  onGameEnd?: (game: GameState) => void;
}

const defaultTurnText = (player: Player) => t.turnOfPlayer(player.toUpperCase());
const everyone = () => true;
const opponentOf = (player: Player): Player => (player === 'x' ? 'o' : 'x');

/**
 * Sons, vibração, confete, avisos e tremidas a partir das mudanças de estado.
 * Funciona igual para jogadas locais, do computador e do adversário online.
 */
export function useGameFeedback(
  game: GameState,
  secondsLeft: number,
  timerActive: boolean,
  { turnText = defaultTurnText, isMe = everyone, onGameEnd }: Options = {}
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
      setNotice({ text: t.timeout(turnText(game.currentPlayer)), id: Date.now() });
      playSound('timeout');
      return;
    }

    const conquered = Boolean(game.boards[boardIndex].winner && !prev.boards[boardIndex].winner);

    if (conquered) setShake(n => n + 1);

    // Todas as jogadas tocam som; se quem venceu foi o seu adversário, toca o som de derrota
    const lost = game.winner === actor && !isMe(actor) && isMe(opponentOf(actor));

    playSound(lost ? 'lose' : moveSound(game, boardIndex, actor));

    if (isMe(actor)) {
      if (game.winner === actor) vibrate(VIBRATION.win);
      else vibrate(conquered ? VIBRATION.board : VIBRATION.move);
    } else if (!game.winner && isMe(game.currentPlayer)) {
      vibrate(VIBRATION.yourTurn); // o adversário jogou: agora é a sua vez
    }

    if (game.winner) {
      if (game.winner !== 'draw' && isMe(game.winner)) celebrate();
      onGameEnd?.(game);
    }

  }, [game]);

  // Tique nos últimos segundos, só para quem está com a vez
  useEffect(() => {

    if (!timerActive || !isMe(game.currentPlayer)) return;

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

  /** Mostra um aviso rápido no topo (ex.: "Você joga com ◯") */
  const announce = (text: string) => setNotice({ text, id: Date.now() });

  return { notice, nudge, shake, reject, announce };

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
