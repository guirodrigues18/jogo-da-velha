import { useState, type RefObject } from 'react';
import { hasJoined, loadNickname, saveNickname } from '../online/nickname';
import NicknameForm from './NicknameForm';
import OnlineRoom from './OnlineRoom';

interface Props {
  /** null = criar uma sala nova */
  roomId: string | null;
  /** Onde a sala registra sua função de desistência (usada pelo botão voltar) */
  leaveRoomRef: RefObject<(() => void) | null>;
  onRoomCreated: (roomId: string) => void;
  onLeave: () => void;
}

/** Pede o apelido e depois entra na sala (ou cria uma) */
export default function OnlineGame({ roomId, leaveRoomRef, onRoomCreated, onLeave }: Props) {

  // Ao recarregar a página de uma sala em que já entrou, não pergunta de novo
  const [nickname, setNickname] = useState<string | null>(() =>
    roomId && hasJoined(roomId) ? loadNickname() || null : null
  );

  if (!nickname) {
    return (
      <NicknameForm
        roomId={roomId}
        onCancel={onLeave}
        onSubmit={name => {
          saveNickname(name);
          setNickname(name);
        }}
      />
    );
  }

  return (
    <OnlineRoom
      roomId={roomId}
      nickname={nickname}
      leaveRoomRef={leaveRoomRef}
      onRoomCreated={onRoomCreated}
      onLeave={onLeave}
    />
  );

}
