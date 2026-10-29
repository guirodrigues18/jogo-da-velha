import { ACHIEVEMENTS, loadStats } from '../stats/achievements';
import Dialog from './Dialog';

interface Props {
  onClose: () => void;
}

export default function StatsDialog({ onClose }: Props) {

  const stats = loadStats();
  const unlockedCount = ACHIEVEMENTS.filter(a => stats.unlocked[a.id]).length;

  const numbers = [
    ['Partidas', stats.played],
    ['Vitórias', stats.wins],
    ['Derrotas', stats.losses],
    ['Empates', stats.draws],
    ['Sequência', stats.streak],
    ['Recorde', stats.bestStreak]
  ];

  return (
    <Dialog title="Suas conquistas" onClose={onClose}>

      <div className="stats-grid">
        {numbers.map(([label, value]) => (
          <div className="stat" key={label}>
            <span className="stat-value">{value}</span>
            <span className="stat-label">{label}</span>
          </div>
        ))}
      </div>

      <p className="stats-note">Contam as partidas contra o computador e online, salvas neste aparelho.</p>

      <div className="achievements-header">
        Conquistas <span>{unlockedCount} de {ACHIEVEMENTS.length}</span>
      </div>

      <ul className="achievements">
        {ACHIEVEMENTS.map(achievement => {
          const unlocked = Boolean(stats.unlocked[achievement.id]);
          return (
            <li key={achievement.id} className={unlocked ? 'achievement unlocked' : 'achievement'}>
              <span className="achievement-icon">{unlocked ? achievement.icon : '🔒'}</span>
              <span>
                <strong>{achievement.title}</strong>
                <small>{achievement.description}</small>
              </span>
            </li>
          );
        })}
      </ul>

    </Dialog>
  );

}
