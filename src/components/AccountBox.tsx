import { useState } from 'react';
import { isOnlineConfigured } from '../online/config';
import { useAccountInfo } from '../online/accountInfo';
import { track } from '../online/consent';
import { t } from '../i18n';

/** Entrar com Google para salvar o progresso na nuvem (opcional) */
export default function AccountBox() {

  const account = useAccountInfo();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOnlineConfigured) return null;

  const signIn = async () => {

    setBusy(true);
    setError(null);

    try {
      // O Firebase só é baixado quando a pessoa decide entrar
      const { signInWithGoogle } = await import('../online/account');
      await signInWithGoogle();
      track('login', { method: 'Google' });
    } catch (reason) {
      const code = (reason as { code?: string }).code ?? '';
      // Fechar a janela do Google não é erro
      if (code !== 'auth/popup-closed-by-user' && code !== 'auth/cancelled-popup-request') {
        setError(code === 'auth/popup-blocked' || code === 'auth/operation-not-supported-in-this-environment'
          ? t.account.blocked
          : t.account.error);
      }
    } finally {
      setBusy(false);
    }

  };

  const signOut = async () => {
    const { signOutOfGoogle } = await import('../online/account');
    await signOutOfGoogle();
  };

  if (account) {
    return (
      <div className="account-box signed-in">
        {account.photo && <img className="account-photo" src={account.photo} alt="" referrerPolicy="no-referrer" />}
        <span className="account-text">
          <strong>{t.account.signedIn(account.name)}</strong>
          <small>{t.account.synced}</small>
        </span>
        <button className="link-button" onClick={signOut}>{t.account.signOut}</button>
      </div>
    );
  }

  return (
    <div className="account-box">
      <p>{t.account.benefit}</p>
      <button className="btn google-button" onClick={signIn} disabled={busy}>
        <span className="google-logo" aria-hidden="true">G</span> {t.account.cta}
      </button>
      {error && <p className="account-error">{error}</p>}
    </div>
  );

}
