import { ACHIEVEMENTS, loadStats } from '../stats/achievements';
import { t } from '../i18n';
import Dialog from './Dialog';

interface Props {
  onClose: () => void;
}

export default function StatsDialog({ onClose }: Props) {

  const stats = loadStats();
  const unlockedCount = ACHIEVEMENTS.filter(a => stats.unlocked[a.id]).length;

  const numbers = [
    [t.stats.played, stats.played],
    [t.stats.wins, stats.wins],
    [t.stats.losses, stats.losses],
    [t.stats.draws, stats.draws],
    [t.stats.streak, stats.streak],
    [t.stats.best, stats.bestStreak]
  ];

  return (
    <Dialog title={t.stats.title} onClose={onClose}>

      <div className="stats-grid">
        {numbers.map(([label, value]) => (
          <div className="stat" key={label}>
            <span className="stat-value">{value}</span>
            <span className="stat-label">{label}</span>
          </div>
        ))}
      </div>

      <p className="stats-note">{t.stats.note}</p>

      <div className="achievements-header">
        {t.stats.achievements} <span>{t.stats.progress(unlockedCount, ACHIEVEMENTS.length)}</span>
      </div>

      <ul className="achievements">
        {ACHIEVEMENTS.map(({ id, icon }) => {
          const unlocked = Boolean(stats.unlocked[id]);
          return (
            <li key={id} className={unlocked ? 'achievement unlocked' : 'achievement'}>
              <span className="achievement-icon">{unlocked ? icon : '🔒'}</span>
              <span>
                <strong>{t.achievements[id].title}</strong>
                <small>{t.achievements[id].description}</small>
              </span>
            </li>
          );
        })}
      </ul>

    </Dialog>
  );

}
