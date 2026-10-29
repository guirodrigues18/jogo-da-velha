import type { Player } from '../game/logic';

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
        <span className="versus">vs</span>
        <span className="role-chip o">◯ <span className="player-name">{nameOf('o')}</span></span>
      </div>
      <span className="opponent-status">
        👀 Você está assistindo{others > 0 && ` com mais ${others}`}
      </span>
      <button className="link-button" onClick={onLeave}>Sair</button>
    </div>
  );

}
