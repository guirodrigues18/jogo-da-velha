import { useEffect, useState } from 'react';
import { onAchievementsUnlocked, type Achievement } from '../stats/achievements';
import { playSound } from '../audio/sounds';
import { t } from '../i18n';

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
        <small>{t.stats.unlocked}</small>
        <strong>{t.achievements[current.id].title}</strong>
      </span>
    </div>
  );

}
