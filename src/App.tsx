import { lazy, Suspense, useEffect, useState } from 'react';
import { isOnlineConfigured } from './online/config';
import LocalGame from './components/LocalGame';
import OnlineMessage from './components/OnlineMessage';

// O SDK do Firebase só é baixado por quem entra no modo online
const OnlineGame = lazy(() => import('./components/OnlineGame'));

type Mode =
  | { kind: 'local' }
  | { kind: 'online'; roomId: string | null };

const ROOM_PARAM = 'sala';

function modeFromUrl(): Mode {

  const roomId = new URLSearchParams(window.location.search).get(ROOM_PARAM);

  return roomId && isOnlineConfigured ? { kind: 'online', roomId } : { kind: 'local' };

}

export default function App() {

  const [mode, setMode] = useState<Mode>(modeFromUrl);

  // Botões voltar/avançar do navegador
  useEffect(() => {

    const onPopState = () => setMode(modeFromUrl());

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

  if (mode.kind === 'online') {
    return (
      <Suspense fallback={<OnlineMessage title="Conectando…" />}>
        <OnlineGame roomId={mode.roomId} onRoomCreated={handleRoomCreated} onLeave={leaveOnline} />
      </Suspense>
    );
  }

  return (
    <LocalGame onPlayOnline={isOnlineConfigured ? () => setMode({ kind: 'online', roomId: null }) : undefined} />
  );

}
