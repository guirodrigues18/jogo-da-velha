import { useEffect, useRef, useState } from 'react';

export const TURN_SECONDS = 20;
export const WARNING_SECONDS = 5;

/**
 * Contagem regressiva do turno. Reinicia sempre que `turn` muda
 * e chama `onTimeout` quando o tempo acaba. Com `paused`, congela onde está
 * e continua dali ao despausar (no mesmo turno).
 */
export function useTurnTimer(turn: number, active: boolean, onTimeout: () => void, seconds = TURN_SECONDS, paused = false): number {

  const [secondsLeft, setSecondsLeft] = useState(seconds);
  const onTimeoutRef = useRef(onTimeout);
  const remainingMs = useRef(seconds * 1000);
  const lastTurn = useRef(turn);

  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  });

  useEffect(() => {

    // Turno novo (ou cronômetro parado): começa do tempo cheio; só a pausa guarda o que sobrou
    if (turn !== lastTurn.current || !active) remainingMs.current = seconds * 1000;

    lastTurn.current = turn;
    setSecondsLeft(Math.ceil(remainingMs.current / 1000));

    if (!active || paused) return;

    // Calcula pelo relógio em vez de contar ticks, para não acumular atraso
    const deadline = Date.now() + remainingMs.current;

    const interval = setInterval(() => {

      remainingMs.current = Math.max(0, deadline - Date.now());

      const left = Math.ceil(remainingMs.current / 1000);

      setSecondsLeft(left);

      if (left === 0) {
        clearInterval(interval);
        onTimeoutRef.current();
      }

    }, 200);

    return () => clearInterval(interval);

  }, [turn, active, seconds, paused]);

  return secondsLeft;

}
