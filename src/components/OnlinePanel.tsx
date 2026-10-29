import { useState } from 'react';
import type { Player } from '../game/logic';
import { copyText, shareLink } from '../share/shareLink';

interface Props {
  roomId: string;
  role: Player;
  nameOf: (player: Player) => string;
  opponentJoined: boolean;
  opponentOnline: boolean;
  opponentLeft: boolean;
  spectatorNames: string[];
  onLeave: () => void;
}

const COPIED_FEEDBACK_MS = 2000;
const SYMBOLS = { x: '✕', o: '◯' };

export default function OnlinePanel({
  roomId,
  role,
  nameOf,
  opponentJoined,
  opponentOnline,
  opponentLeft,
  spectatorNames,
  onLeave
}: Props) {

  const [copied, setCopied] = useState(false);

  const opponent: Player = role === 'x' ? 'o' : 'x';
  const inviteUrl = `${window.location.origin}/?sala=${roomId}`;
  const inviteText = `${nameOf(role)} te desafiou no Jogo da Velha 2.0 😏 Duvido você ganhar!`;

  const showCopied = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS);
  };

  const invite = async () => {
    if (await shareLink(inviteUrl, inviteText) === 'copied') showCopied();
  };

  const copy = async () => {
    await copyText(inviteUrl);
    showCopied();
  };

  let opponentStatus = opponentOnline ? 'Adversário online' : 'Adversário desconectado';

  if (opponentLeft) opponentStatus = 'Adversário saiu da partida';

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
      <div className="players">
        <span className={`role-chip ${role}`}>
          {SYMBOLS[role]} <span className="player-name">{nameOf(role)}</span> <small>(você)</small>
        </span>
        <span className="versus">vs</span>
        <span className={`role-chip ${opponent}`} title={opponentStatus}>
          <span className={opponentOnline && !opponentLeft ? 'status-dot online' : 'status-dot'} />
          {SYMBOLS[opponent]} <span className="player-name">{nameOf(opponent)}</span>
        </span>
      </div>
      <span className="opponent-status">{opponentStatus}</span>
      {spectatorNames.length > 0 && (
        <span className="spectators" title={spectatorNames.join(', ')}>
          👀 {spectatorNames.length} assistindo
        </span>
      )}
      <button className="link-button" onClick={onLeave}>Sair</button>
    </div>
  );

}
