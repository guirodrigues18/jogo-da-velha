import { useEffect, useState, type FormEvent } from 'react';
import { signIn } from '../online/firebase';
import { getRoomPreview, type RoomPreview } from '../online/rooms';
import { loadNickname, normalizeNickname, NICKNAME_MAX_LENGTH } from '../online/nickname';
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
  const host = preview?.hostName ?? 'Jogador X';
  const guest = preview?.guestName ?? 'Jogador O';

  let title = 'Jogar online';
  let subtitle = 'Como você quer ser chamado na partida?';
  let action = 'Criar sala';

  if (roomId && watching) {
    title = `${host} vs ${guest} 👀`;
    subtitle = 'A partida já tem dois jogadores, mas você pode assistir. Como quer ser chamado?';
    action = 'Assistir partida';
  } else if (roomId) {
    title = preview?.hostName ? `${preview.hostName} te desafiou! 🎮` : 'Você foi convidado! 🎮';
    action = 'Entrar na partida';
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
          placeholder="Seu apelido"
          aria-label="Seu apelido"
          autoComplete="nickname"
          enterKeyHint="go"
          autoFocus
        />
        <button className="btn" type="submit" disabled={!nickname}>
          {action}
        </button>
        <div className="form-links">
          <button className="link-button" type="button" onClick={() => setHelpOpen(true)}>
            ❔ Como jogar?
          </button>
          <button className="link-button" type="button" onClick={onCancel}>
            Voltar
          </button>
        </div>
      </form>

      {helpOpen && <HelpDialog onClose={() => setHelpOpen(false)} />}
    </div>
  );

}
