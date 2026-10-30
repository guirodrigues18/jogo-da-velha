import { useState } from 'react';
import { needsConsent, saveConsent, type Consent } from '../online/consent';
import { t } from '../i18n';

/** Aviso de cookies no rodapé da tela, uma vez só */
export default function CookieNotice() {

  const [open, setOpen] = useState(needsConsent);

  if (!open) return null;

  const answer = (value: Consent) => {
    saveConsent(value);
    setOpen(false);
  };

  return (
    <div className="cookie-notice" role="dialog" aria-label={t.cookies.text}>
      <p>🍪 {t.cookies.text}</p>
      <div className="cookie-actions">
        <button className="cookie-button" onClick={() => answer('declined')}>{t.cookies.decline}</button>
        <button className="cookie-button accept" onClick={() => answer('accepted')}>{t.cookies.accept}</button>
      </div>
    </div>
  );

}
