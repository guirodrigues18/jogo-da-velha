import { useEffect, useState } from 'react';
import { onAchievementsUnlocked } from '../stats/achievements';
import { onCoinsEarned, takeRetroactiveBonus } from '../shop/wallet';
import { onToast } from '../effects/toasts';
import { playSound } from '../audio/sounds';
import { t } from '../i18n';

const TOAST_DURATION_MS = 3200;

interface Toast {
  id: string;
  icon: string;
  label: string;
  title: string;
  /** Conquistas tocam som; moedas, não (já tocou o som da vitória) */
  sound: boolean;
}

/** Avisos de conquistas, missões, convites e moedas ganhas, um de cada vez */
export default function AchievementToaster() {

  const [queue, setQueue] = useState<Toast[]>([]);
  const current = queue[0];

  useEffect(() => {

    const add = (toast: Toast) => setQueue(q => [...q, toast]);

    // Moedas pelas partidas de antes da loja (só na primeira visita depois dela)
    const bonus = takeRetroactiveBonus();

    if (bonus) add({ id: 'retro', icon: '🪙', label: t.coins.retroactive, title: `+${bonus}`, sound: true });

    const stopAchievements = onAchievementsUnlocked(unlocked => unlocked.forEach(achievement => add({
      id: achievement.id,
      icon: achievement.icon,
      label: t.stats.unlocked,
      title: t.achievements[achievement.id].title,
      sound: true
    })));

    const stopCoins = onCoinsEarned((amount, label) => add({
      id: `coins-${Date.now()}`,
      icon: '🪙',
      label: label ?? t.coins.earned,
      title: `+${amount}`,
      sound: false
    }));

    // Missões concluídas, convites...
    let count = 0;
    const stopToasts = onToast(toast => add({ ...toast, id: `toast-${++count}`, sound: Boolean(toast.sound) }));

    return () => {
      stopAchievements();
      stopCoins();
      stopToasts();
    };

  }, []);

  useEffect(() => {

    if (!current) return;

    if (current.sound) playSound('achievement');

    const timer = setTimeout(() => setQueue(q => q.slice(1)), TOAST_DURATION_MS);

    return () => clearTimeout(timer);

  }, [current]);

  if (!current) return null;

  return (
    <div className="achievement-toast" key={current.id} role="status">
      <span className="achievement-toast-icon">{current.icon}</span>
      <span>
        <small>{current.label}</small>
        <strong>{current.title}</strong>
      </span>
    </div>
  );

}
