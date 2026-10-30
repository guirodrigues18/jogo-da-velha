import { useState, type FormEvent } from 'react';
import { firstName, useAccountInfo } from '../online/accountInfo';
import { normalizeNickname, NICKNAME_MAX_LENGTH, saveNickname, useNickname } from '../online/nickname';
import { t } from '../i18n';
import Dialog from './Dialog';
import AccountBox from './AccountBox';

interface Props {
  onClose: () => void;
}

const SAVED_FEEDBACK_MS = 2000;

/** Perfil (botão 👤): conta Google conectada e apelido usado no online */
export default function AccountDialog({ onClose }: Props) {

  const account = useAccountInfo();
  const saved = useNickname();
  const [value, setValue] = useState(() => saved || firstName(account));
  const [justSaved, setJustSaved] = useState(false);

  const nickname = normalizeNickname(value);
  const changed = Boolean(nickname) && nickname !== saved;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!changed) return;
    saveNickname(nickname);
    setValue(nickname);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), SAVED_FEEDBACK_MS);
  };

  return (
    <Dialog title={t.profile.title} onClose={onClose}>

      <AccountBox />

      <form className="nickname-section" onSubmit={submit}>
        <label htmlFor="profile-nickname">{t.profile.nicknameLabel}</label>
        <div className="nickname-row">
          <input
            id="profile-nickname"
            className="nickname-input"
            value={value}
            onChange={event => setValue(event.target.value)}
            maxLength={NICKNAME_MAX_LENGTH}
            placeholder={t.nickname.placeholder}
            autoComplete="nickname"
            enterKeyHint="done"
          />
          <button className="btn" type="submit" disabled={!changed}>
            {justSaved ? t.profile.saved : t.profile.save}
          </button>
        </div>
        <p className="daily-hint">{t.profile.nicknameHint}</p>
      </form>

    </Dialog>
  );

}
