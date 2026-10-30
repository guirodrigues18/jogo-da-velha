import { onValue, ref, runTransaction, set } from 'firebase/database';
import { db, signIn } from './firebase';

/* ===========================
   Convites no banco: referrals/{quem convidou}/{amigo} = apelido do amigo.
   O amigo grava uma vez; quem convidou lê, recebe as moedas e apaga.
   =========================== */

export function myUid(): Promise<string> {

  return signIn();

}

/** Avisa quem convidou que você terminou a primeira partida ('self': o link era seu) */
export async function reportReferral(inviter: string, name: string): Promise<'sent' | 'self'> {

  const uid = await signIn();

  if (uid === inviter) return 'self';

  await set(ref(db, `referrals/${inviter}/${uid}`), name);

  return 'sent';

}

/** Acompanha os amigos que chegaram pelo seu convite; cada um é entregue uma vez só */
export async function watchReferrals(onFriend: (name: string) => void): Promise<() => void> {

  const uid = await signIn();

  return onValue(ref(db, `referrals/${uid}`), snapshot => {

    snapshot.forEach(child => {

      const name = String(child.val());

      // Apaga numa transação: com o jogo aberto em duas abas, só uma recebe as moedas
      runTransaction(child.ref, current => (current === null ? undefined : null), { applyLocally: false })
        .then(result => {
          if (result.committed) onFriend(name);
        })
        .catch(() => {});

    });

  });

}
