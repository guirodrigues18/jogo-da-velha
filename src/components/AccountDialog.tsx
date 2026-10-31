import { useEffect, useState, type FormEvent } from 'react';
import { firstName, useAccountInfo } from '../online/accountInfo';
import { loadStats, onStatsChange } from '../stats/achievements';
import { XP } from '../shop/rewards';
import { normalizeNickname, NICKNAME_MAX_LENGTH, saveNickname, useNickname } from '../online/nickname';
import { t } from '../i18n';
import Dialog from './Dialog';
import AccountBox from './AccountBox';

interface Props {
  onClose: () => void;
}

const SAVED_FEEDBACK_MS = 2000;

/** Perfil (botão 👤): conta Google conectada, XP total e apelido usado no online */
export default function AccountDialog({ onClose }: Props) {

  const account = useAccountInfo();
  const saved = useNickname();
  const [value, setValue] = useState(() => saved || firstName(account));
  const [justSaved, setJustSaved] = useState(false);
  const [xp, setXp] = useState(() => loadStats().xp);

  // Atualiza se o XP mudar com o perfil aberto (ex.: sincronização com a nuvem)
  useEffect(() => onStatsChange(() => setXp(loadStats().xp)), []);

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

      <div className="xp-section">
        <span className="xp-label">{t.xp.label}</span>
        <strong className="xp-total">⭐ {t.xp.total(xp)}</strong>
        <p className="daily-hint">{t.xp.hint(XP.groupWin.champs, XP.groupWin.duo, XP.onlineWin, XP.win.hard, XP.win.medium, XP.win.easy)}</p>
      </div>

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
