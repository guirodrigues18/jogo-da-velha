import { getAnalytics, isSupported, logEvent, type Analytics } from 'firebase/analytics';
import { app } from './app';

/**
 * Google Analytics (pelo Firebase): visitas, sessões, países, aparelhos e eventos do jogo.
 * Carregado depois que o jogo aparece, para não atrasar a abertura.
 * Alguns navegadores (ex.: webviews sem IndexedDB) não suportam: aí não faz nada.
 */
let analytics: Promise<Analytics | null> | null = null;

export function startAnalytics(): Promise<Analytics | null> {

  analytics ??= isSupported().then(supported => (supported ? getAnalytics(app) : null));

  return analytics;

}

export async function logAnalyticsEvent(name: string, params: Record<string, string | number>) {

  const instance = await startAnalytics();

  if (instance) logEvent(instance, name, params);

}
