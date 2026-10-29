import { useEffect, useState, type FormEvent } from 'react';
import { signIn } from '../online/firebase';
import { getHostName } from '../online/rooms';
import { loadNickname, normalizeNickname, NICKNAME_MAX_LENGTH } from '../online/nickname';

interface Props {
  /** null = vai criar uma sala; com id = foi convidado para ela */
  roomId: string | null;
  onSubmit: (nickname: string) => void;
  onCancel: () => void;
}

export default function NicknameForm({ roomId, onSubmit, onCancel }: Props) {

  const [value, setValue] = useState(loadNickname);
  const [hostName, setHostName] = useState<string | null>(null);

  // Convidado: mostra quem fez o desafio (se não der, fica o título genérico)
  useEffect(() => {

    if (!roomId) return;

    let cancelled = false;

    signIn()
      .then(() => getHostName(roomId))
      .then(name => {
        if (!cancelled) setHostName(name);
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

  let title = 'Jogar online';

  if (roomId) title = hostName ? `${hostName} te desafiou! 🎮` : 'Você foi convidado! 🎮';

  return (
    <div className="container online-message">
      <form className="modal-card" onSubmit={submit}>
        <div className="modal-title">{title}</div>
        <div className="modal-subtitle">Como você quer ser chamado na partida?</div>
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
          {roomId ? 'Entrar na partida' : 'Criar sala'}
        </button>
        <button className="link-button" type="button" onClick={onCancel}>
          Voltar
        </button>
      </form>
    </div>
  );

}
