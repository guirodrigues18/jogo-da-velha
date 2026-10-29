import { useState } from 'react';
import type { Player } from '../game/logic';
import { copyText, shareLink } from '../share/shareLink';

interface Props {
  roomId: string;
  role: Player;
  opponentJoined: boolean;
  opponentOnline: boolean;
  onLeave: () => void;
}

const INVITE_TEXT = 'Duvido você me vencer no Jogo da Velha 2.0 😏';
const COPIED_FEEDBACK_MS = 2000;

export default function OnlinePanel({ roomId, role, opponentJoined, opponentOnline, onLeave }: Props) {

  const [copied, setCopied] = useState(false);

  const inviteUrl = `${window.location.origin}/?sala=${roomId}`;

  const showCopied = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS);
  };

  const invite = async () => {
    if (await shareLink(inviteUrl, INVITE_TEXT) === 'copied') showCopied();
  };

  const copy = async () => {
    await copyText(inviteUrl);
    showCopied();
  };

  if (!opponentJoined) {
    return (
      <div className="online-panel">
        <div className="online-title">Convide um amigo</div>
        <p className="online-text">
          Envie o link: quem abrir joga com <strong className="o">O</strong>.
          A partida começa quando ele entrar.
        </p>
        <button className="btn" onClick={invite}>Enviar convite</button>
        <button className="btn btn-ghost" onClick={copy}>
          {copied ? '✓ Link copiado!' : 'Copiar link'}
        </button>
        <button className="link-button" onClick={onLeave}>Sair da sala</button>
      </div>
    );
  }

  return (
    <div className="online-panel online-status">
      <span className={`role-chip ${role}`}>Você é {role.toUpperCase()}</span>
      <span className="opponent-status">
        <span className={opponentOnline ? 'status-dot online' : 'status-dot'} />
        Adversário {opponentOnline ? 'online' : 'desconectado'}
      </span>
      <button className="link-button" onClick={onLeave}>Sair</button>
    </div>
  );

}
