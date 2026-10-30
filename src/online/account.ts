import {
  GoogleAuthProvider,
  linkWithPopup,
  signInWithCredential,
  signInWithPopup,
  signOut,
  type User
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { get, ref, set } from 'firebase/database';
import { auth, db, resetSignIn } from './firebase';
import { loadStats, onStatsChange, replaceStats } from '../stats/achievements';
import { getProfile, replaceProfile, subscribeProfile } from '../shop/wallet';
import { mergeProgress, type Progress } from '../stats/progress';
import { saveAccountInfo, type AccountInfo } from './accountInfo';

/* ===========================
   Login com Google (opcional) e progresso salvo na nuvem
   =========================== */

const SYNC_DELAY_MS = 1500;

function toInfo(user: User): AccountInfo {

  return { name: user.displayName ?? user.email ?? 'Google', photo: user.photoURL };

}

/**
 * Entra com Google. Se a pessoa já jogava sem conta, o login anônimo é "promovido"
 * para a conta Google (mesmo id, então as salas online continuam valendo).
 */
export async function signInWithGoogle(): Promise<AccountInfo> {

  const provider = new GoogleAuthProvider();

  await auth.authStateReady();

  let user: User;

  try {
    user = auth.currentUser?.isAnonymous
      ? (await linkWithPopup(auth.currentUser, provider)).user
      : (await signInWithPopup(auth, provider)).user;
  } catch (error) {
    // Essa conta Google já tem progresso de outro aparelho: entra nela
    const credential = error instanceof FirebaseError && error.code === 'auth/credential-already-in-use'
      ? GoogleAuthProvider.credentialFromError(error)
      : null;
    if (!credential) throw error;
    user = (await signInWithCredential(auth, credential)).user;
  }

  resetSignIn();

  const info = toInfo(user);

  saveAccountInfo(info);
  await syncProgress(user.uid);

  return info;

}

export async function signOutOfGoogle() {

  stopAutoSync?.();
  await signOut(auth);
  resetSignIn();
  saveAccountInfo(null);

}

/** Conta Google atual (null se a pessoa joga sem conta) */
export async function currentAccount(): Promise<{ uid: string; info: AccountInfo } | null> {

  await auth.authStateReady();

  const user = auth.currentUser;

  return user && !user.isAnonymous ? { uid: user.uid, info: toInfo(user) } : null;

}

/* ---------- Sincronização ---------- */

const userRef = (uid: string) => ref(db, `users/${uid}`);

function localProgress(): Progress {

  return { stats: loadStats(), profile: getProfile() };

}

function push(uid: string): Promise<void> {

  return set(userRef(uid), { ...localProgress(), updatedAt: Date.now() });

}

let stopAutoSync: (() => void) | null = null;

/**
 * Junta o progresso do aparelho com o da nuvem e passa a enviar cada mudança.
 * Chamado ao entrar com Google e ao abrir o jogo já logado.
 */
export async function syncProgress(uid: string) {

  const cloud = (await get(userRef(uid))).val() as Partial<Progress> | null;
  const merged = mergeProgress(localProgress(), cloud);

  replaceStats(merged.stats);
  replaceProfile(merged.profile);

  await push(uid);

  stopAutoSync?.();

  let timer: ReturnType<typeof setTimeout> | undefined;

  const schedule = () => {
    clearTimeout(timer);
    timer = setTimeout(() => push(uid).catch(() => {}), SYNC_DELAY_MS);
  };

  const unsubscribeStats = onStatsChange(schedule);
  const unsubscribeProfile = subscribeProfile(schedule);

  stopAutoSync = () => {
    clearTimeout(timer);
    unsubscribeStats();
    unsubscribeProfile();
    stopAutoSync = null;
  };

}

/** Ao abrir o jogo: se a pessoa entrou com Google antes, sincroniza */
export async function resumeAccount(): Promise<AccountInfo | null> {

  const account = await currentAccount();

  if (!account) {
    saveAccountInfo(null);
    return null;
  }

  saveAccountInfo(account.info);
  await syncProgress(account.uid);

  return account.info;

}
