import { useEffect, useRef, useState } from 'react';

export const TURN_SECONDS = 20;
export const WARNING_SECONDS = 5;

/**
 * Contagem regressiva do turno. Reinicia sempre que `turn` muda
 * e chama `onTimeout` quando o tempo acaba.
 */
export function useTurnTimer(turn: number, active: boolean, onTimeout: () => void): number {

  const [secondsLeft, setSecondsLeft] = useState(TURN_SECONDS);
  const onTimeoutRef = useRef(onTimeout);

  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  });

  useEffect(() => {

    setSecondsLeft(TURN_SECONDS);

    if (!active) return;

    // Calcula pelo relógio em vez de contar ticks, para não acumular atraso
    const deadline = Date.now() + TURN_SECONDS * 1000;

    const interval = setInterval(() => {

      const left = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));

      setSecondsLeft(left);

      if (left === 0) {
        clearInterval(interval);
        onTimeoutRef.current();
      }

    }, 200);

    return () => clearInterval(interval);

  }, [turn, active]);

  return secondsLeft;

}
