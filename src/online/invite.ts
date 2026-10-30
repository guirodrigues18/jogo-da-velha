import { addCoins } from '../shop/wallet';
import { showToast } from '../effects/toasts';
import { t } from '../i18n';
import { isOnlineConfigured } from './config';
import { track } from './consent';
import { loadNickname, normalizeNickname } from './nickname';
import { firstName, getAccountInfo } from './accountInfo';

/* ===========================
   Convide e ganhe
   Quando um amigo chega por um convite (link ?amigo=id ou sala online) e termina a
   primeira partida, os dois ganham moedas. Sem servidor: o amigo avisa no banco
   e quem convidou recebe as moedas ao ver o aviso (src/online/referrals.ts, carregado sob demanda).
   =========================== */

export const INVITE_PARAM = 'amigo';
export const REFERRAL_COINS = 50;

/** Convite recebido: quem convidou e se o aviso já foi entregue */
const INVITED_KEY = 'jogo-da-velha:convidado-por';
/** Existe depois do primeiro convite enviado; guarda quantos amigos vieram */
const INVITER_KEY = 'jogo-da-velha:convites';

interface Invitation {
  by: string;
  done: boolean;
}

// Ids do Firebase: letras e números
const VALID_ID = /^[A-Za-z0-9]{10,64}$/;

function read(key: string): string | null {

  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }

}

function write(key: string, value: string) {

  try {
    localStorage.setItem(key, value);
  } catch {
    // Sem armazenamento, o convite vale só para esta visita
  }

}

function invitation(): Invitation | null {

  try {
    return JSON.parse(read(INVITED_KEY) ?? 'null') as Invitation | null;
  } catch {
    return null;
  }

}

/* ---------- Quem foi convidado ---------- */

/** Guarda o convite (só vale para quem nunca jogou e nunca aceitou outro); true se aceitou */
export function acceptInvite(by: string, newPlayer: boolean): boolean {

  if (!isOnlineConfigured || !newPlayer || !VALID_ID.test(by) || invitation()) return false;

  write(INVITED_KEY, JSON.stringify({ by, done: false }));
  track('invite_accepted');

  return true;

}

/** Lê o convite do link (?amigo=id) e tira o parâmetro da barra de endereço; true se aceitou */
export function acceptInviteFromUrl(newPlayer: boolean): boolean {

  const url = new URL(window.location.href);
  const by = url.searchParams.get(INVITE_PARAM);

  if (!by) return false;

  url.searchParams.delete(INVITE_PARAM);
  window.history.replaceState(null, '', url.pathname + url.search);

  return acceptInvite(by, newPlayer);

}

let reporting = false;

/** Depois de cada partida: na primeira, avisa quem convidou e paga o bônus de boas-vindas */
export async function rewardInvitedPlayer() {

  const pending = invitation();

  if (!pending || pending.done || reporting) return;

  reporting = true;

  try {

    const name = normalizeNickname(loadNickname() || firstName(getAccountInfo())) || '?';
    const { reportReferral } = await import('./referrals');
    const result = await reportReferral(pending.by, name);

    write(INVITED_KEY, JSON.stringify({ ...pending, done: true }));

    if (result === 'sent') {
      addCoins(REFERRAL_COINS, { label: t.invite.welcomeBonus });
      track('referral_reward', { side: 'invited' });
    }

  } catch {
    // Sem conexão: tenta de novo ao fim da próxima partida
  } finally {
    reporting = false;
  }

}

/* ---------- Quem convidou ---------- */

export function invitedFriends(): number {

  return Number(read(INVITER_KEY) ?? 0);

}

let watching = false;

/** Passa a receber as moedas dos amigos que chegarem (só para quem já convidou alguém) */
export function startReferralWatch() {

  if (!isOnlineConfigured || watching || read(INVITER_KEY) === null) return;

  watching = true;

  import('./referrals')
    .then(({ watchReferrals }) => watchReferrals(name => {
      write(INVITER_KEY, String(invitedFriends() + 1));
      addCoins(REFERRAL_COINS, { quiet: true });
      track('referral_reward', { side: 'inviter' });
      showToast({
        icon: '🎁',
        label: t.invite.friendJoinedLabel(REFERRAL_COINS),
        title: t.invite.friendJoined(name === '?' ? t.invite.someone : name),
        sound: true
      });
    }))
    .catch(() => {
      watching = false;
    });

}

/** Convite enviado (link ou sala criada) */
export function markInviteSent() {

  if (read(INVITER_KEY) === null) write(INVITER_KEY, '0');

  startReferralWatch();

}

/** Link de convite com o seu id (faz o login anônimo, se ainda não fez) */
export async function inviteLink(): Promise<string> {

  const { myUid } = await import('./referrals');
  const uid = await myUid();

  return `${window.location.origin}${window.location.pathname}?${INVITE_PARAM}=${uid}`;

}
