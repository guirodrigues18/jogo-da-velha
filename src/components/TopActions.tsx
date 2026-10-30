import { useState } from 'react';
import { lang, t } from '../i18n';
import SoundToggle from './SoundToggle';
import HelpDialog from './HelpDialog';
import StatsDialog from './StatsDialog';
import LanguageDialog from './LanguageDialog';

/** Botões ao lado do título: idioma, conquistas, como jogar e som */
export default function TopActions() {

  const [dialog, setDialog] = useState<'help' | 'stats' | 'language' | null>(null);
  const close = () => setDialog(null);

  return (
    <div className="top-actions">
      <button
        className="icon-button language-button"
        onClick={() => setDialog('language')}
        aria-label={t.actions.language}
        title={t.actions.language}
      >
        {lang.toUpperCase()}
      </button>
      <button className="icon-button" onClick={() => setDialog('stats')} aria-label={t.actions.achievements} title={t.actions.achievements}>
        🏅
      </button>
      <button className="icon-button" onClick={() => setDialog('help')} aria-label={t.actions.help} title={t.actions.help}>
        ❔
      </button>
      <SoundToggle />

      {dialog === 'help' && <HelpDialog onClose={close} />}
      {dialog === 'stats' && <StatsDialog onClose={close} />}
      {dialog === 'language' && <LanguageDialog onClose={close} />}
    </div>
  );

}
