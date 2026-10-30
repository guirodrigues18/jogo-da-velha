import { isOnlineConfigured, measurementId } from './config';

/* ===========================
   Aviso de cookies: o Google Analytics (visitas e eventos do jogo) só é carregado
   depois que a pessoa aceita. (O Vercel Analytics não usa cookies e funciona sempre.)
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

function analyticsAllowed(): boolean {

  return isOnlineConfigured && Boolean(measurementId) && getConsent() === 'accepted';

}

export function startAnalyticsIfAllowed() {

  if (!analyticsAllowed()) return;

  import('./analytics').then(analytics => analytics.startAnalytics()).catch(() => {});

}

type EventParams = Record<string, string | number | undefined>;

/**
 * Registra um evento do jogo no Google Analytics (partida, compra, missão...).
 * Só para quem aceitou os cookies; sem isso, não faz nada.
 */
export function track(name: string, params: EventParams = {}) {

  if (!analyticsAllowed()) return;

  // O Analytics não aceita valores vazios
  const defined = Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined)) as Record<string, string | number>;

  import('./analytics').then(analytics => analytics.logAnalyticsEvent(name, defined)).catch(() => {});

}

export function saveConsent(value: Consent) {

  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // Sem armazenamento, vale só para esta visita
  }

  startAnalyticsIfAllowed();

}
