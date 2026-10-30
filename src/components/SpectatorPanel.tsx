import type { Player } from '../game/logic';
import { t } from '../i18n';

interface Props {
  nameOf: (player: Player) => string;
  /** Quantos estão assistindo, incluindo você */
  spectatorCount: number;
  onLeave: () => void;
}

export default function SpectatorPanel({ nameOf, spectatorCount, onLeave }: Props) {

  const others = spectatorCount - 1;

  return (
    <div className="online-panel online-status">
      <div className="players">
        <span className="role-chip x">✕ <span className="player-name">{nameOf('x')}</span></span>
        <span className="versus">{t.online.versus}</span>
        <span className="role-chip o">◯ <span className="player-name">{nameOf('o')}</span></span>
      </div>
      <span className="opponent-status">
        {t.online.youAreWatching}{others > 0 && t.online.withMore(others)}
      </span>
      <button className="link-button" onClick={onLeave}>{t.online.leave}</button>
    </div>
  );

}
