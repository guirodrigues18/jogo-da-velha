import { useState } from 'react';
import { isMuted, setMuted } from '../audio/sounds';

export default function SoundToggle() {

  const [muted, setMutedState] = useState(isMuted);

  const toggle = () => {
    setMuted(!muted);
    setMutedState(!muted);
  };

  const label = muted ? 'Ativar sons e vibração' : 'Desativar sons e vibração';

  return (
    <button className="icon-button" onClick={toggle} aria-label={label} title={label}>
      {muted ? '🔇' : '🔊'}
    </button>
  );

}
