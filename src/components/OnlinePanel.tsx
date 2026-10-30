import { useState } from 'react';
import type { Player } from '../game/logic';
import { copyText, shareLink } from '../share/shareLink';
import { ROOM_PARAM } from '../online/config';
import { REFERRAL_COINS } from '../online/invite';
import { track } from '../online/consent';
import { useChallenge } from '../stats/rivals';
import { t } from '../i18n';

interface Props {
  roomId: string;
  role: Player;
  nameOf: (player: Player) => string;
  opponentJoined: boolean;
  opponentOnline: boolean;
  opponentLeft: boolean;
  /** Segundos até a vitória por abandono (adversário desconectado); null se ele está online */
  abandonSecondsLeft: number | null;
  spectatorNames: string[];
  onLeave: () => void;
}

const COPIED_FEEDBACK_MS = 2000;

/** 237 → "3:57" */
const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
const SYMBOLS = { x: '✕', o: '◯' };

export default function OnlinePanel({
  roomId,
  role,
  nameOf,
  opponentJoined,
  opponentOnline,
  opponentLeft,
  abandonSecondsLeft,
  spectatorNames,
  onLeave
}: Props) {

  const [copied, setCopied] = useState(false);

  const opponent: Player = role === 'x' ? 'o' : 'x';
  // Mantém a página do idioma atual (/, /en/, /es/): o convidado provavelmente fala o mesmo idioma
  const inviteUrl = `${window.location.origin}${window.location.pathname}?${ROOM_PARAM}=${roomId}`;
  // Revanche pedida no ranking: o convite já leva o placar entre vocês
  const rival = useChallenge();
  const inviteText = rival
    ? t.rivals.inviteMessage(rival.name, nameOf(role), rival.wins, rival.losses)
    : t.online.inviteMessage(nameOf(role));

  const showCopied = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS);
  };

  const invite = async () => {
    const result = await shareLink(inviteUrl, inviteText);
    if (result !== 'cancelled') track('share', { content_type: 'room_invite', method: result });
    if (result === 'copied') showCopied();
  };

  const copy = async () => {
    await copyText(inviteUrl);
    track('share', { content_type: 'room_invite', method: 'copied' });
    showCopied();
  };

  let opponentStatus = opponentOnline ? t.online.opponentOnline : t.online.opponentOffline;

  if (opponentLeft) opponentStatus = t.online.opponentLeft;
  else if (abandonSecondsLeft !== null) opponentStatus = t.online.abandonCountdown(formatTime(abandonSecondsLeft));

  if (!opponentJoined) {
    return (
      <div className="online-panel">
        <div className="online-title">{t.online.inviteTitle}</div>
        <p className="online-text">
          {t.online.inviteBefore}<strong className={opponent}>{SYMBOLS[opponent]}</strong>{t.online.inviteAfter}
        </p>
        <button className="btn" onClick={invite}>{t.online.sendInvite}</button>
        <button className="btn btn-ghost" onClick={copy}>
          {copied ? t.online.copied : t.online.copyLink}
        </button>
        <p className="invite-bonus">{t.invite.roomHint(REFERRAL_COINS)}</p>
        <button className="link-button" onClick={onLeave}>{t.online.leaveRoom}</button>
      </div>
    );
  }

  return (
    <div className="online-panel online-status">
      <div className="players">
        <span className={`role-chip ${role}`}>
          {SYMBOLS[role]} <span className="player-name">{nameOf(role)}</span> <small>{t.online.youTag}</small>
        </span>
        <span className="versus">{t.online.versus}</span>
        <span className={`role-chip ${opponent}`} title={opponentStatus}>
          <span className={opponentOnline && !opponentLeft ? 'status-dot online' : 'status-dot'} />
          {SYMBOLS[opponent]} <span className="player-name">{nameOf(opponent)}</span>
        </span>
      </div>
      <span className={abandonSecondsLeft !== null && !opponentLeft ? 'opponent-status away' : 'opponent-status'}>
        {opponentStatus}
      </span>
      {spectatorNames.length > 0 && (
        <span className="spectators" title={spectatorNames.join(', ')}>
          {t.online.watchingCount(spectatorNames.length)}
        </span>
      )}
      <button className="link-button" onClick={onLeave}>{t.online.leave}</button>
    </div>
  );

}
