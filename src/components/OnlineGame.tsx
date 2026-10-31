import { useState, type RefObject } from 'react';
import type { Player } from '../game/logic';
import { GROUP_TURN_SECONDS, type GroupMode } from '../game/group';
import { hasJoined, loadNickname, saveNickname } from '../online/nickname';
import { loadPreferences } from '../game/preferences';
import { TURN_SECONDS } from '../hooks/useTurnTimer';
import NicknameForm from './NicknameForm';
import OnlineRoom from './OnlineRoom';
import PartyRoom from './PartyRoom';

interface Props {
  /** null = criar uma sala nova */
  roomId: string | null;
  /** Grupo (2x2 ou Champs) em que entrou pelo link ou que acabou de criar */
  partyId: string | null;
  /** Onde a sala registra sua função de desistência (usada pelo botão voltar) */
  leaveRoomRef: RefObject<(() => void) | null>;
  onRoomCreated: (roomId: string) => void;
  onPartyCreated: (partyId: string) => void;
  onLeave: () => void;
}

/** Pede o apelido (e, para quem cria, o modo e o símbolo) e depois entra na sala ou no grupo */
export default function OnlineGame({ roomId, partyId, leaveRoomRef, onRoomCreated, onPartyCreated, onLeave }: Props) {

  // Ao recarregar a página de uma sala em que já entrou, não pergunta de novo
  const [nickname, setNickname] = useState<string | null>(() => {
    const id = partyId ?? roomId;
    return id && hasJoined(id) ? loadNickname() || null : null;
  });
  const [hostRole, setHostRole] = useState<Player>(() => loadPreferences().symbol);
  /** Quem cria um grupo: o modo, o máximo de jogadores e os segundos (null = 1x1) */
  const [group, setGroup] = useState<{ mode: GroupMode; max: number; seconds: number } | null>(null);
  /** Segundos por jogada de quem cria a sala 1x1 */
  const [hostSeconds, setHostSeconds] = useState(TURN_SECONDS);

  if (!nickname) {
    return (
      <NicknameForm
        roomId={roomId}
        partyId={partyId}
        onCancel={onLeave}
        onSubmit={(name, choice) => {
          saveNickname(name);
          if (choice.kind === 'solo') {
            setHostRole(choice.symbol);
            setHostSeconds(choice.seconds);
          } else {
            setGroup({ mode: choice.kind, max: choice.kind === 'champs' ? choice.max : 4, seconds: choice.seconds });
          }
          setNickname(name);
        }}
      />
    );
  }

  if (partyId || group) {
    return (
      <PartyRoom
        partyId={partyId}
        nickname={nickname}
        create={group ?? { mode: 'duo', max: 4, seconds: GROUP_TURN_SECONDS }}
        leaveRoomRef={leaveRoomRef}
        onPartyCreated={onPartyCreated}
        onLeave={onLeave}
      />
    );
  }

  return (
    <OnlineRoom
      roomId={roomId}
      nickname={nickname}
      hostRole={hostRole}
      hostSeconds={hostSeconds}
      leaveRoomRef={leaveRoomRef}
      onRoomCreated={onRoomCreated}
      onLeave={onLeave}
    />
  );

}
