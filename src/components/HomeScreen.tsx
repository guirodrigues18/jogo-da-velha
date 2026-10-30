import { useMemo, useState } from 'react';
import { dailyChallenge, loadDailyProgress, loadDailyStreak } from '../game/daily';
import type { LocalMode } from '../game/preferences';
import { useProfile } from '../shop/wallet';
import { useDailyReward } from '../shop/dailyReward';
import { isDone, useMissions } from '../stats/missions';
import { t } from '../i18n';
import Logo from './Logo';
import TopActions from './TopActions';
import BoardPreview from './BoardPreview';
import DailyDialog from './DailyDialog';
import ShopDialog from './ShopDialog';

interface Props {
  onPlay: (mode: LocalMode) => void;
  /** Ausente quando o modo online não está configurado */
  onPlayOnline?: () => void;
}

/** Tela de início: escolha do modo de jogo, missões do dia e loja */
export default function HomeScreen({ onPlay, onPlayOnline }: Props) {

  const [dialog, setDialog] = useState<'missions' | 'shop' | null>(null);
  const close = () => setDialog(null);

  const profile = useProfile();
  const reward = useDailyReward();
  const missions = useMissions();
  const missionsDone = missions.ids.filter(id => isDone(missions, id)).length;

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
        <BoardPreview className="hero-board" />
        <Logo hero />
        <p className="subtitle">{t.subtitle}</p>
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

      <div className="home-extras">
        <button className={reward.claimed ? 'extra-card' : 'extra-card pending'} onClick={() => setDialog('missions')}>
          <span className="extra-icon" aria-hidden="true">🎯</span>
          <span className="extra-body">
            <strong>{t.home.missions.title}</strong>
            <small>{reward.claimed ? t.home.missions.progress(missionsDone, missions.ids.length) : t.home.missions.reward}</small>
          </span>
          {!reward.claimed && <span className="badge-dot" aria-hidden="true" />}
        </button>

        <button className="extra-card" onClick={() => setDialog('shop')}>
          <span className="extra-icon" aria-hidden="true">🛒</span>
          <span className="extra-body">
            <strong>{t.home.shop.title}</strong>
            <small>{t.home.shop.text}</small>
          </span>
          <span className="extra-coins">🪙 {profile.coins}</span>
        </button>
      </div>

      {dialog === 'missions' && <DailyDialog title={t.home.missions.dialogTitle} onClose={close} />}
      {dialog === 'shop' && <ShopDialog onClose={close} />}

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
