import { useEffect, useState } from 'react';
import { onAchievementsUnlocked, type Achievement } from '../stats/achievements';
import { playSound } from '../audio/sounds';

const TOAST_DURATION_MS = 3200;

/** Avisa as conquistas desbloqueadas, uma de cada vez */
export default function AchievementToaster() {

  const [queue, setQueue] = useState<Achievement[]>([]);
  const current = queue[0];

  useEffect(() => onAchievementsUnlocked(unlocked => setQueue(q => [...q, ...unlocked])), []);

  useEffect(() => {

    if (!current) return;

    playSound('achievement');

    const timer = setTimeout(() => setQueue(q => q.slice(1)), TOAST_DURATION_MS);

    return () => clearTimeout(timer);

  }, [current]);

  if (!current) return null;

  return (
    <div className="achievement-toast" key={current.id} role="status">
      <span className="achievement-toast-icon">{current.icon}</span>
      <span>
        <small>Conquista desbloqueada!</small>
        <strong>{current.title}</strong>
      </span>
    </div>
  );

}
