import { useState, type RefObject } from 'react';
import type { Player } from '../game/logic';
import { hasJoined, loadNickname, saveNickname } from '../online/nickname';
import { loadPreferences } from '../game/preferences';
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

/** Pede o apelido (e, para quem cria a sala, o símbolo) e depois entra na sala */
export default function OnlineGame({ roomId, leaveRoomRef, onRoomCreated, onLeave }: Props) {

  // Ao recarregar a página de uma sala em que já entrou, não pergunta de novo
  const [nickname, setNickname] = useState<string | null>(() =>
    roomId && hasJoined(roomId) ? loadNickname() || null : null
  );
  const [hostRole, setHostRole] = useState<Player>(() => loadPreferences().symbol);

  if (!nickname) {
    return (
      <NicknameForm
        roomId={roomId}
        onCancel={onLeave}
        onSubmit={(name, symbol) => {
          saveNickname(name);
          setHostRole(symbol);
          setNickname(name);
        }}
      />
    );
  }

  return (
    <OnlineRoom
      roomId={roomId}
      nickname={nickname}
      hostRole={hostRole}
      leaveRoomRef={leaveRoomRef}
      onRoomCreated={onRoomCreated}
      onLeave={onLeave}
    />
  );

}
