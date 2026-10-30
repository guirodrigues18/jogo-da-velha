import { useEffect, useState, type FormEvent } from 'react';
import { signIn } from '../online/firebase';
import { getRoomPreview, type RoomPreview } from '../online/rooms';
import { loadNickname, normalizeNickname, NICKNAME_MAX_LENGTH } from '../online/nickname';
import { t } from '../i18n';
import HelpDialog from './HelpDialog';

interface Props {
  /** null = vai criar uma sala; com id = foi convidado para ela */
  roomId: string | null;
  onSubmit: (nickname: string) => void;
  onCancel: () => void;
}

export default function NicknameForm({ roomId, onSubmit, onCancel }: Props) {

  const [value, setValue] = useState(loadNickname);
  const [preview, setPreview] = useState<RoomPreview | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);

  // Convidado: mostra quem fez o desafio, ou quem está jogando (se não der, fica o título genérico)
  useEffect(() => {

    if (!roomId) return;

    let cancelled = false;

    signIn()
      .then(() => getRoomPreview(roomId))
      .then(result => {
        if (!cancelled) setPreview(result);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };

  }, [roomId]);

  const nickname = normalizeNickname(value);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (nickname) onSubmit(nickname);
  };

  const watching = Boolean(preview?.full);
  const host = preview?.hostName ?? t.player('X');
  const guest = preview?.guestName ?? t.player('O');

  let title = t.nickname.playOnline;
  let subtitle = t.nickname.ask;
  let action = t.nickname.create;

  if (roomId && watching) {
    title = t.nickname.watchTitle(host, guest);
    subtitle = t.nickname.watchAsk;
    action = t.nickname.watch;
  } else if (roomId) {
    title = preview?.hostName ? t.nickname.challenged(preview.hostName) : t.nickname.invited;
    action = t.nickname.join;
  }

  return (
    <div className="container online-message">
      <form className="modal-card" onSubmit={submit}>
        <div className="modal-title">{title}</div>
        <div className="modal-subtitle">{subtitle}</div>
        <input
          className="nickname-input"
          value={value}
          onChange={event => setValue(event.target.value)}
          maxLength={NICKNAME_MAX_LENGTH}
          placeholder={t.nickname.placeholder}
          aria-label={t.nickname.placeholder}
          autoComplete="nickname"
          enterKeyHint="go"
          autoFocus
        />
        <button className="btn" type="submit" disabled={!nickname}>
          {action}
        </button>
        <div className="form-links">
          <button className="link-button" type="button" onClick={() => setHelpOpen(true)}>
            {t.nickname.howToPlay}
          </button>
          <button className="link-button" type="button" onClick={onCancel}>
            {t.nickname.back}
          </button>
        </div>
      </form>

      {helpOpen && <HelpDialog onClose={() => setHelpOpen(false)} />}
    </div>
  );

}
