import { REACTION_EMOJIS } from '../online/rooms';

interface Props {
  onReact: (emoji: string) => void;
}

/** Fileira de reações rápidas (aparecem flutuando na tela de todos da sala) */
export default function ReactionBar({ onReact }: Props) {

  return (
    <div className="reaction-bar" role="group" aria-label="Reações">
      {REACTION_EMOJIS.map(emoji => (
        <button key={emoji} className="reaction-option" onClick={() => onReact(emoji)} aria-label={`Reagir com ${emoji}`}>
          {emoji}
        </button>
      ))}
    </div>
  );

}
