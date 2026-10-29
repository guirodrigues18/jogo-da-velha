import { useState } from 'react';
import SoundToggle from './SoundToggle';
import HelpDialog from './HelpDialog';
import StatsDialog from './StatsDialog';

/** Botões ao lado do título: conquistas, como jogar e som */
export default function TopActions() {

  const [dialog, setDialog] = useState<'help' | 'stats' | null>(null);
  const close = () => setDialog(null);

  return (
    <div className="top-actions">
      <button className="icon-button" onClick={() => setDialog('stats')} aria-label="Conquistas" title="Conquistas">
        🏅
      </button>
      <button className="icon-button" onClick={() => setDialog('help')} aria-label="Como jogar" title="Como jogar">
        ❔
      </button>
      <SoundToggle />

      {dialog === 'help' && <HelpDialog onClose={close} />}
      {dialog === 'stats' && <StatsDialog onClose={close} />}
    </div>
  );

}
