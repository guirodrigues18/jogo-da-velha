export interface FloatingReaction {
  id: string;
  emoji: string;
  name: string;
}

interface Props {
  reactions: FloatingReaction[];
  onDone: (id: string) => void;
}

/** Emojis subindo pela tela, com o nome de quem reagiu */
export default function ReactionLayer({ reactions, onDone }: Props) {

  return (
    <div className="reaction-layer" aria-live="polite">
      {reactions.map(reaction => (
        <div
          key={reaction.id}
          className="floating-reaction"
          style={{ left: `${horizontalPosition(reaction.id)}%` }}
          onAnimationEnd={() => onDone(reaction.id)}
        >
          <span className="floating-emoji">{reaction.emoji}</span>
          <span className="floating-name">{reaction.name}</span>
        </div>
      ))}
    </div>
  );

}

/** Posição horizontal estável por reação (entre 15% e 75% da largura) */
function horizontalPosition(id: string): number {

  let hash = 0;

  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) % 997;

  return 15 + (hash % 60);

}
