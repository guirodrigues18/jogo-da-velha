import { useEffect, useRef, useState } from 'react';
import { groupTimeoutsLeft, markOf, type GroupState } from '../game/group';
import { MAX_TIMEOUTS } from '../game/logic';
import { playSound } from '../audio/sounds';
import { vibrate, VIBRATION } from '../audio/haptics';
import { celebrate } from '../effects/confetti';
import { WARNING_SECONDS } from './useTurnTimer';
import type { Notice, Nudge } from './useGameFeedback';
import { t } from '../i18n';

const NOTICE_DURATION_MS = 2400;

interface Options {
  /** Seu lugar (null = espectador) */
  mySeat: number | null;
  nameOf: (seat: number) => string;
  /** Chamado uma vez quando a partida termina com uma jogada feita agora */
  onGameEnd?: (game: GroupState) => void;
}

/**
 * Sons, vibração, confete e avisos dos modos em grupo (2x2 e Champs),
 * no mesmo estilo do 1x1 (useGameFeedback), contados por lugar em vez de por símbolo.
 */
export function useGroupFeedback(
  game: GroupState | null,
  secondsLeft: number,
  timerActive: boolean,
  { mySeat, nameOf, onGameEnd }: Options
) {

  const [notice, setNotice] = useState<Notice | null>(null);
  const [nudge, setNudge] = useState<Nudge | null>(null);
  const [shake, setShake] = useState(0);
  const previous = useRef(game);

  const myMark = game && mySeat !== null ? markOf(game.mode, mySeat) : null;

  useEffect(() => {

    const prev = previous.current;

    previous.current = game;

    // Só reage a um turno por vez (ignora carga inicial e reinício de partida)
    if (!game || !prev || game.turn !== prev.turn + 1) return;

    const actor = prev.seat;
    const actorMark = markOf(game.mode, actor);
    const boardIndex = game.boards.findIndex((board, i) => board.cells.some((cell, j) => cell !== prev.boards[i].cells[j]));
    const ended = Boolean(game.winner);
    const iWon = Boolean(myMark && game.winner === myMark);

    if (ended) {
      if (iWon) {
        celebrate();
        vibrate(VIBRATION.win);
      }
      playSound(game.winner === 'draw' ? 'draw' : iWon ? 'win' : 'lose');
      onGameEnd?.(game);
    }

    // Tempo esgotado ou vez pulada (alguém saiu): ninguém jogou
    if (boardIndex === -1) {

      const eliminated = game.out[actor] && !prev.out[actor];
      let text = t.timeout(t.online.turnOf(nameOf(game.seat)), groupTimeoutsLeft(game, actor));

      // Eliminado por tempo ou porque saiu; se só sobrou um, a partida acaba aqui
      if (eliminated) text = game.timeouts[actor] > MAX_TIMEOUTS ? t.party.eliminated(nameOf(actor)) : t.party.leftOut(nameOf(actor));

      setNotice({ text, id: Date.now() });
      if (!ended) playSound('timeout');
      return;

    }

    if (ended) return;

    const conquered = Boolean(game.boards[boardIndex].winner && !prev.boards[boardIndex].winner);

    if (conquered) setShake(n => n + 1);

    playSound(conquered ? 'board' : actorMark === 'o' || actorMark === 's' ? 'o' : 'x');

    if (actor === mySeat) vibrate(conquered ? VIBRATION.board : VIBRATION.move);
    else if (game.seat === mySeat) vibrate(VIBRATION.yourTurn);

  }, [game]);

  // Tique nos últimos segundos, só para quem está com a vez
  useEffect(() => {

    if (!timerActive || !game || game.seat !== mySeat) return;

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

    const activeBoard = game?.activeBoard ?? null;

    if (activeBoard !== null) setNudge(n => ({ board: activeBoard, id: (n?.id ?? 0) + 1 }));

  };

  const announce = (text: string) => setNotice({ text, id: Date.now() });

  return { notice, nudge, shake, reject, announce };

}
