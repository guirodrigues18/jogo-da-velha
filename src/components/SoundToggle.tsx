import { useState } from 'react';
import { isMuted, setMuted } from '../audio/sounds';
import { t } from '../i18n';

export default function SoundToggle() {

  const [muted, setMutedState] = useState(isMuted);

  const toggle = () => {
    setMuted(!muted);
    setMutedState(!muted);
  };

  const label = muted ? t.actions.soundOn : t.actions.soundOff;

  return (
    <button className="icon-button" onClick={toggle} aria-label={label} title={label}>
      {muted ? '🔇' : '🔊'}
    </button>
  );

}
