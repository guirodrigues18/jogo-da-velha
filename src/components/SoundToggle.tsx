import { useState } from 'react';
import { isMuted, setMuted } from '../audio/sounds';

export default function SoundToggle() {

  const [muted, setMutedState] = useState(isMuted);

  const toggle = () => {
    setMuted(!muted);
    setMutedState(!muted);
  };

  return (
    <button
      className="sound-toggle"
      onClick={toggle}
      aria-label={muted ? 'Ativar sons' : 'Desativar sons'}
      title={muted ? 'Ativar sons' : 'Desativar sons'}
    >
      {muted ? '🔇' : '🔊'}
    </button>
  );

}
