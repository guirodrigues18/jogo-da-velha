import { useState } from 'react';
import { lang, t } from '../i18n';
import { isOnlineConfigured } from '../online/config';
import { useAccountInfo } from '../online/accountInfo';
import SoundToggle from './SoundToggle';
import AccountDialog from './AccountDialog';
import HelpDialog from './HelpDialog';
import StatsDialog from './StatsDialog';
import LanguageDialog from './LanguageDialog';

/** Botões do topo: idioma, perfil (conta e apelido), conquistas, como jogar e som */
export default function TopActions() {

  const [dialog, setDialog] = useState<'help' | 'stats' | 'language' | 'account' | null>(null);
  const close = () => setDialog(null);

  // Conectado com Google: o botão do perfil mostra a foto da conta
  const account = useAccountInfo();

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
      {isOnlineConfigured && (
        <button className="icon-button account-button" onClick={() => setDialog('account')} aria-label={t.actions.account} title={t.actions.account}>
          {account?.photo
            ? <img src={account.photo} alt="" referrerPolicy="no-referrer" />
            : '👤'}
        </button>
      )}
      <button className="icon-button" onClick={() => setDialog('stats')} aria-label={t.actions.achievements} title={t.actions.achievements}>
        🏅
      </button>
      <button className="icon-button" onClick={() => setDialog('help')} aria-label={t.actions.help} title={t.actions.help}>
        ?
      </button>
      <SoundToggle />

      {dialog === 'help' && <HelpDialog onClose={close} />}
      {dialog === 'stats' && <StatsDialog onClose={close} />}
      {dialog === 'language' && <LanguageDialog onClose={close} />}
      {dialog === 'account' && <AccountDialog onClose={close} />}
    </div>
  );

}
