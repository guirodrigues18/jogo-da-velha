import { useEffect, useState } from 'react';
import { claimDailyReward, DAILY_REWARDS, useDailyReward } from '../shop/dailyReward';
import {
  ALL_DONE_BONUS,
  allDone,
  findMission,
  isDone,
  MISSION_COINS,
  swapTodayMission,
  useMissions
} from '../stats/missions';
import { invitedFriends, inviteLink, markInviteSent, REFERRAL_COINS } from '../online/invite';
import { isOnlineConfigured } from '../online/config';
import { track } from '../online/consent';
import { shareLink } from '../share/shareLink';
import { playSound } from '../audio/sounds';
import { t } from '../i18n';

const COPIED_FEEDBACK_MS = 2000;

/** Recompensa diária, missões de hoje e convite (aba Missões e boas-vindas do dia) */
export default function DailyPanel() {

  return (
    <div className="daily-panel">
      <RewardDays />
      <MissionList />
      <InviteCard />
    </div>
  );

}

function RewardDays() {

  const reward = useDailyReward();

  const claim = () => {
    if (claimDailyReward(t.dailyReward.toast)) playSound('achievement');
  };

  return (
    <section className="daily-section">
      <h3>{t.dailyReward.title}</h3>

      <ol className="reward-days">
        {DAILY_REWARDS.map((coins, i) => {

          const day = i + 1;
          const taken = day < reward.day || (reward.claimed && day === reward.day);
          const classes = ['reward-day'];

          if (taken) classes.push('taken');
          if (day === reward.day && !reward.claimed) classes.push('today');
          if (day === DAILY_REWARDS.length) classes.push('jackpot');

          return (
            <li key={day} className={classes.join(' ')}>
              <small>{t.dailyReward.day(day)}</small>
              <span className="reward-icon">{taken ? '✓' : day === DAILY_REWARDS.length ? '🎁' : '🪙'}</span>
              <strong>{coins}</strong>
            </li>
          );

        })}
      </ol>

      {reward.claimed
        ? <p className="daily-note">{t.dailyReward.streak(reward.streak)} · {t.dailyReward.tomorrow(reward.tomorrow)}</p>
        : <button className="btn" onClick={claim}>{t.dailyReward.claim(reward.coins)}</button>}

      <p className="daily-hint">{t.dailyReward.hint}</p>
    </section>
  );

}

/** Horas até a meia-noite, quando as missões mudam */
function hoursUntilTomorrow(): number {

  const now = new Date();
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  return Math.max(1, Math.ceil((midnight.getTime() - now.getTime()) / 3_600_000));

}

function MissionList() {

  const missions = useMissions();

  return (
    <section className="daily-section">
      <div className="daily-section-header">
        <h3>{t.missions.title}</h3>
        <small>{t.missions.renews(hoursUntilTomorrow())}</small>
      </div>

      <ul className="missions">
        {missions.ids.map(id => {

          const mission = findMission(id);
          const progress = missions.progress[id] ?? 0;
          const done = isDone(missions, id);

          return (
            <li key={id} className={done ? 'mission done' : 'mission'}>
              <span className="mission-icon">{mission.icon}</span>
              <span className="mission-body">
                <strong>{t.missions.items[id]}</strong>
                <span className="mission-bar" aria-hidden="true">
                  <span style={{ width: `${(progress / mission.goal) * 100}%` }} />
                </span>
              </span>
              <span className="mission-side">
                <span className="mission-reward">{done ? '✓' : `+${MISSION_COINS[mission.tier]} 🪙`}</span>
                <small>{progress}/{mission.goal}</small>
              </span>
              {!done && !missions.swapped && (
                <button
                  className="mission-swap"
                  onClick={() => swapTodayMission(id)}
                  aria-label={t.missions.swap}
                  title={t.missions.swapHint}
                >
                  🔄
                </button>
              )}
            </li>
          );

        })}
      </ul>

      <p className="daily-note">
        {allDone(missions) ? t.missions.bonusDone(ALL_DONE_BONUS) : t.missions.bonus(ALL_DONE_BONUS)}
      </p>
      <p className="daily-hint">{missions.swapped ? t.missions.note : `${t.missions.swapHint}. ${t.missions.note}`}</p>
    </section>
  );

}

function InviteCard() {

  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // O link é preparado antes do clique: o navegador só abre o menu de
  // compartilhar logo depois de uma ação da pessoa
  useEffect(() => {

    if (!isOnlineConfigured) return;

    let cancelled = false;

    inviteLink()
      .then(url => {
        if (!cancelled) setLink(url);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };

  }, []);

  if (!isOnlineConfigured) return null;

  const invite = async () => {

    if (!link) return;

    markInviteSent();

    const result = await shareLink(link, t.invite.message(REFERRAL_COINS));

    if (result !== 'cancelled') track('share', { content_type: 'invite_link', method: result });

    if (result === 'copied') {
      setCopied(true);
      setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS);
    }

  };

  const friends = invitedFriends();

  let label = t.invite.loading;

  if (copied) label = t.online.copied;
  else if (link) label = t.invite.button;

  return (
    <section className="daily-section invite-card">
      <h3>{t.invite.title}</h3>
      <p className="invite-text">{t.invite.text(REFERRAL_COINS)}</p>
      <button className="btn btn-invite" disabled={!link} onClick={invite}>{label}</button>
      {friends > 0 && <p className="daily-note">{t.invite.count(friends)}</p>}
    </section>
  );

}
