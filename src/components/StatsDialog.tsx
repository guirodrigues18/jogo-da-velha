import { useState } from 'react';
import { ACHIEVEMENTS, loadStats } from '../stats/achievements';
import { useProfile } from '../shop/wallet';
import { t } from '../i18n';
import Dialog from './Dialog';
import DailyPanel from './DailyPanel';
import ShopPanel from './ShopPanel';
import AccountBox from './AccountBox';

interface Props {
  onClose: () => void;
}

type Tab = 'missions' | 'shop' | 'achievements';

const TABS: Tab[] = ['missions', 'shop', 'achievements'];

/** Missões, loja e conquistas (botão 🏅), com o saldo de moedas e o login */
export default function StatsDialog({ onClose }: Props) {

  const [tab, setTab] = useState<Tab>('missions');
  const profile = useProfile();

  return (
    <Dialog title={t.stats.title} onClose={onClose} headerExtra={<span className="coin-balance">🪙 {profile.coins}</span>}>

      <AccountBox />

      <div className="segmented tabs" role="tablist">
        {TABS.map(id => (
          <button key={id} role="tab" aria-selected={tab === id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)}>
            {t.shop.tabs[id]}
          </button>
        ))}
      </div>

      {tab === 'missions' && <DailyPanel />}
      {tab === 'shop' && <ShopPanel />}
      {tab === 'achievements' && <AchievementsPanel />}

    </Dialog>
  );

}

function AchievementsPanel() {

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
    <>
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
    </>
  );

}
