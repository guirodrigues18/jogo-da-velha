import { isOnlineConfigured, measurementId } from './config';

/* ===========================
   Aviso de cookies: o Google Analytics só é carregado depois que a pessoa aceita.
   (O Vercel Analytics não usa cookies e funciona sempre.)
   =========================== */

export type Consent = 'accepted' | 'declined';

const STORAGE_KEY = 'jogo-da-velha:cookies';

export function getConsent(): Consent | null {

  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === 'accepted' || value === 'declined' ? value : null;
  } catch {
    return null;
  }

}

/** Só pergunta quando o Analytics está configurado e a pessoa ainda não respondeu */
export function needsConsent(): boolean {

  return isOnlineConfigured && Boolean(measurementId) && getConsent() === null;

}

export function startAnalyticsIfAllowed() {

  if (!isOnlineConfigured || !measurementId || getConsent() !== 'accepted') return;

  import('./analytics').then(analytics => analytics.startAnalytics()).catch(() => {});

}

export function saveConsent(value: Consent) {

  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // Sem armazenamento, vale só para esta visita
  }

  startAnalyticsIfAllowed();

}
