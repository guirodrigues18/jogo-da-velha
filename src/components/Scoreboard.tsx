import type { Player } from '../game/logic';

export interface ScoreInfo {
  names: Record<Player, string>;
  values: Record<Player, number>;
}

/** Placar da série: "Ana ✕ 2 × 1 ◯ Bruno" */
export default function Scoreboard({ names, values }: ScoreInfo) {

  return (
    <div className="scoreboard" aria-label={`Placar: ${names.x} ${values.x}, ${names.o} ${values.o}`}>
      <span className="score-side x">
        <span className="player-name">{names.x}</span> ✕
      </span>
      <span className="score-value">
        {values.x} <small>×</small> {values.o}
      </span>
      <span className="score-side o">
        ◯ <span className="player-name">{names.o}</span>
      </span>
    </div>
  );

}
