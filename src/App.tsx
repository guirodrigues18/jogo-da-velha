import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { isOnlineConfigured, ROOM_PARAM, roomIdFromUrl } from './online/config';
import LocalGame from './components/LocalGame';
import HomeScreen from './components/HomeScreen';
import { savePreferences, type LocalMode } from './game/preferences';
import OnlineMessage from './components/OnlineMessage';
import AchievementToaster from './components/AchievementToaster';
import DailyDialog from './components/DailyDialog';
import CookieNotice from './components/CookieNotice';
import { t } from './i18n';
import { getAccountInfo } from './online/accountInfo';
import { acceptInviteFromUrl, REFERRAL_COINS, startReferralWatch } from './online/invite';
import { shouldGreet } from './shop/dailyReward';
import { loadStats } from './stats/achievements';
import { clearChallenge, onChallengeStart } from './stats/rivals';
import { showToast } from './effects/toasts';

// O SDK do Firebase só é baixado por quem entra no modo online
const OnlineGame = lazy(() => import('./components/OnlineGame'));

type Mode =
  | { kind: 'home' }
  | { kind: 'local' }
  | { kind: 'online'; roomId: string | null };

/** Marca no histórico: a partida local tem uma entrada própria, para o botão voltar levar ao início */
const LOCAL_STATE = 'local';

function modeFromUrl(): Mode {

  const roomId = roomIdFromUrl();

  if (roomId && isOnlineConfigured) return { kind: 'online', roomId };

  return window.history.state === LOCAL_STATE ? { kind: 'local' } : { kind: 'home' };

}

export default function App() {

  const [mode, setMode] = useState<Mode>(modeFromUrl);

  // Quem volta ao jogo (fora de uma sala online) recebe a recompensa do dia e vê as missões
  const [greeting, setGreeting] = useState(() => mode.kind !== 'online' && shouldGreet(loadStats().played > 0));

  // Desistência da sala atual, registrada pela partida online enquanto ela está aberta
  const leaveRoomRef = useRef<(() => void) | null>(null);

  // Quem entrou com Google antes: sincroniza o progresso com a nuvem ao abrir o jogo
  useEffect(() => {

    if (!isOnlineConfigured || !getAccountInfo()) return;

    import('./online/account').then(account => account.resumeAccount()).catch(() => {});

  }, []);

  // Convites: quem chegou por um link de amigo e quem já convidou alguém
  useEffect(() => {

    if (acceptInviteFromUrl(loadStats().played === 0)) {
      showToast({ icon: '🎁', label: t.invite.acceptedLabel, title: t.invite.accepted(REFERRAL_COINS), sound: true });
    }

    startReferralWatch();

  }, []);

  // Revanche pedida no ranking de rivais: abre a criação de uma sala nova
  useEffect(() => onChallengeStart(() => setMode({ kind: 'online', roomId: null })), []);

  // Botões voltar/avançar do navegador
  useEffect(() => {

    const onPopState = () => {
      // Sair da sala pelo botão voltar também conta como desistência. Precisa ser
      // avisado aqui, antes de trocar de tela: depois a partida já foi desmontada
      leaveRoomRef.current?.();
      const next = modeFromUrl();
      if (next.kind !== 'online') clearChallenge();
      setMode(next);
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
    clearChallenge();
    setMode({ kind: 'home' });
  };

  const playLocal = (localMode: LocalMode) => {
    savePreferences({ mode: localMode });
    window.history.pushState(LOCAL_STATE, '', window.location.pathname);
    setMode({ kind: 'local' });
  };

  // Volta pelo histórico quando dá, para o botão voltar do aparelho não levar de novo à partida
  const goHome = () => {
    if (window.history.state === LOCAL_STATE) window.history.back();
    else setMode({ kind: 'home' });
  };

  let screen;

  if (mode.kind === 'online') {
    screen = (
      <Suspense fallback={<OnlineMessage title={t.online.connecting} />}>
        <OnlineGame
          roomId={mode.roomId}
          leaveRoomRef={leaveRoomRef}
          onRoomCreated={handleRoomCreated}
          onLeave={leaveOnline}
        />
      </Suspense>
    );
  } else if (mode.kind === 'local') {
    screen = <LocalGame onHome={goHome} />;
  } else {
    screen = (
      <HomeScreen
        onPlay={playLocal}
        onPlayOnline={isOnlineConfigured ? () => setMode({ kind: 'online', roomId: null }) : undefined}
      />
    );
  }

  return (
    <>
      {screen}
      {greeting && <DailyDialog onClose={() => setGreeting(false)} />}
      <AchievementToaster />
      <CookieNotice />
    </>
  );

}
