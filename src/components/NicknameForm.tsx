import { useEffect, useState, type FormEvent } from 'react';
import type { Player } from '../game/logic';
import { signIn } from '../online/firebase';
import { getRoomPreview, type RoomPreview } from '../online/rooms';
import { loadNickname, normalizeNickname, NICKNAME_MAX_LENGTH } from '../online/nickname';
import { firstName, getAccountInfo } from '../online/accountInfo';
import { loadPreferences, savePreferences } from '../game/preferences';
import { useChallenge } from '../stats/rivals';
import { t } from '../i18n';
import HelpDialog from './HelpDialog';
import SymbolPicker from './SymbolPicker';

interface Props {
  /** null = vai criar uma sala; com id = foi convidado para ela */
  roomId: string | null;
  /** `symbol`: com quem joga quem cria a sala (ignorado para quem foi convidado) */
  onSubmit: (nickname: string, symbol: Player) => void;
  onCancel: () => void;
}

export default function NicknameForm({ roomId, onSubmit, onCancel }: Props) {

  // Sugere o último apelido usado ou, para quem entrou com Google, o primeiro nome
  const [value, setValue] = useState(() => loadNickname() || firstName(getAccountInfo()));
  const [symbol, setSymbol] = useState(() => loadPreferences().symbol);
  const [preview, setPreview] = useState<RoomPreview | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  // Revanche pedida no ranking de rivais
  const rival = useChallenge();

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
    if (!nickname) return;
    if (!roomId) savePreferences({ symbol });
    onSubmit(nickname, symbol);
  };

  const watching = Boolean(preview?.full);
  const hostName = preview?.hostRole ? preview.names[preview.hostRole] : undefined;

  let title = rival && !roomId ? t.rivals.challengeTitle(rival.name) : t.nickname.playOnline;
  let subtitle = t.nickname.ask;
  let action = t.nickname.create;

  if (roomId && watching) {
    title = t.nickname.watchTitle(preview?.names.x ?? t.player('X'), preview?.names.o ?? t.player('O'));
    subtitle = t.nickname.watchAsk;
    action = t.nickname.watch;
  } else if (roomId) {
    title = hostName ? t.nickname.challenged(hostName) : t.nickname.invited;
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
        {!roomId && <SymbolPicker value={symbol} onChange={setSymbol} />}
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
