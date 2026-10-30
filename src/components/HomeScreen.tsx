import { useMemo } from 'react';
import { dailyChallenge, loadDailyProgress, loadDailyStreak } from '../game/daily';
import type { LocalMode } from '../game/preferences';
import { useProfile } from '../shop/wallet';
import { loadStats } from '../stats/achievements';
import { t } from '../i18n';
import Logo from './Logo';
import TopActions from './TopActions';

interface Props {
  onPlay: (mode: LocalMode) => void;
  /** Ausente quando o modo online não está configurado */
  onPlayOnline?: () => void;
}

/** Mini tabuleiro decorativo acima do logo */
const HERO_CELLS = ['x', 'o', '', '', 'x', 'o', 'o', '', 'x'];

const MARKS: Record<string, string> = { x: '✕', o: '◯' };

/** Tela de início: escolha do modo de jogo */
export default function HomeScreen({ onPlay, onPlayOnline }: Props) {

  const profile = useProfile();
  const stats = useMemo(loadStats, []);

  const challenge = useMemo(() => dailyChallenge(), []);
  const dailyWon = loadDailyProgress(challenge.number).won;
  const streak = loadDailyStreak();
  const activeStreak = streak.lastWon >= challenge.number - 1 ? streak.current : 0;

  const dailyParts = [dailyWon ? t.daily.doneToday : t.home.daily.text];

  if (activeStreak > 0) dailyParts.push(t.daily.streak(activeStreak));

  return (
    <div className="container home">

      <div className="top-bar">
        <TopActions />
      </div>

      <header className="home-hero">
        <div className="hero-board" aria-hidden="true">
          {HERO_CELLS.map((mark, i) => (
            <span key={i} className={mark}>{MARKS[mark]}</span>
          ))}
        </div>

        <Logo hero />

        <p className="subtitle">{t.subtitle}</p>

        <div className="home-stats">
          <span className="home-stat">🪙 {profile.coins}</span>
          {stats.wins > 0 && <span className="home-stat">{t.home.wins(stats.wins)}</span>}
        </div>
      </header>

      <nav className="mode-grid" aria-label={t.home.label}>
        <ModeCard icon="👥" title={t.home.pvp.title} text={t.home.pvp.text} onClick={() => onPlay('pvp')} />
        <ModeCard icon="🤖" title={t.home.ai.title} text={t.home.ai.text} onClick={() => onPlay('ai')} />
        <ModeCard
          icon="📅"
          title={t.home.daily.title(challenge.number)}
          text={dailyParts.join(' · ')}
          badge={!dailyWon}
          onClick={() => onPlay('daily')}
        />
        {onPlayOnline && (
          <ModeCard icon="🌐" title={t.home.online.title} text={t.home.online.text} onClick={onPlayOnline} />
        )}
      </nav>

    </div>
  );

}

interface ModeCardProps {
  icon: string;
  title: string;
  text: string;
  /** Ponto de aviso (ex.: desafio de hoje ainda não vencido) */
  badge?: boolean;
  onClick: () => void;
}

function ModeCard({ icon, title, text, badge = false, onClick }: ModeCardProps) {

  return (
    <button className={badge ? 'mode-card pending' : 'mode-card'} onClick={onClick}>
      <span className="mode-icon" aria-hidden="true">{icon}</span>
      <strong>{title}</strong>
      <small>{text}</small>
      {badge && <span className="badge-dot" aria-hidden="true" />}
    </button>
  );

}
