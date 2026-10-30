import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { firebaseConfig } from './config';

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getDatabase(app);

let pendingSignIn: Promise<string> | null = null;

/**
 * Login anônimo: cada navegador recebe um id persistente, sem cadastro.
 * Chamadas simultâneas reaproveitam o mesmo login (evita criar dois usuários).
 * Se a pessoa entrou com Google, usa essa conta.
 */
export function signIn(): Promise<string> {

  // Trocou de conta (entrou ou saiu do Google) desde o último login: refaz
  if (auth.currentUser && pendingSignIn) {
    pendingSignIn = Promise.resolve(auth.currentUser.uid);
  }

  pendingSignIn ??= (async () => {

    await auth.authStateReady();

    if (auth.currentUser) return auth.currentUser.uid;

    const { user } = await signInAnonymously(auth);

    return user.uid;

  })().catch(error => {
    pendingSignIn = null;
    throw error;
  });

  return pendingSignIn;

}

/** Depois de sair da conta Google, o próximo signIn() cria um login anônimo novo */
export function resetSignIn() {

  pendingSignIn = null;

}
