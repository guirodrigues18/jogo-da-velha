import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { isOnlineConfigured, ROOM_PARAM, roomIdFromUrl } from './online/config';
import LocalGame from './components/LocalGame';
import OnlineMessage from './components/OnlineMessage';
import AchievementToaster from './components/AchievementToaster';
import { t } from './i18n';

// O SDK do Firebase só é baixado por quem entra no modo online
const OnlineGame = lazy(() => import('./components/OnlineGame'));

type Mode =
  | { kind: 'local' }
  | { kind: 'online'; roomId: string | null };

function modeFromUrl(): Mode {

  const roomId = roomIdFromUrl();

  return roomId && isOnlineConfigured ? { kind: 'online', roomId } : { kind: 'local' };

}

export default function App() {

  const [mode, setMode] = useState<Mode>(modeFromUrl);

  // Desistência da sala atual, registrada pela partida online enquanto ela está aberta
  const leaveRoomRef = useRef<(() => void) | null>(null);

  // Botões voltar/avançar do navegador
  useEffect(() => {

    const onPopState = () => {
      // Sair da sala pelo botão voltar também conta como desistência. Precisa ser
      // avisado aqui, antes de trocar de tela: depois a partida já foi desmontada
      leaveRoomRef.current?.();
      setMode(modeFromUrl());
    };

    window.addEventListener('popstate', onPopState);

    return () => window.removeEventListener('popstate', onPopState);

  }, []);

  const handleRoomCreated = (roomId: string) => {
    window.history.pushState(null, '', `?${ROOM_PARAM}=${roomId}`);
    setMode({ kind: 'online', roomId });
  };

  const leaveOnline = () => {
    window.history.pushState(null, '', window.location.pathname);
    setMode({ kind: 'local' });
  };

  const screen = mode.kind === 'online'
    ? (
      <Suspense fallback={<OnlineMessage title={t.online.connecting} />}>
        <OnlineGame
          roomId={mode.roomId}
          leaveRoomRef={leaveRoomRef}
          onRoomCreated={handleRoomCreated}
          onLeave={leaveOnline}
        />
      </Suspense>
    )
    : <LocalGame onPlayOnline={isOnlineConfigured ? () => setMode({ kind: 'online', roomId: null }) : undefined} />;

  return (
    <>
      {screen}
      <AchievementToaster />
    </>
  );

}
