import { getAnalytics, isSupported } from 'firebase/analytics';
import { app } from './app';

/**
 * Google Analytics (pelo Firebase): visitas, sessões, países e aparelhos.
 * Carregado depois que o jogo aparece, para não atrasar a abertura.
 * Alguns navegadores (ex.: webviews sem IndexedDB) não suportam: aí não faz nada.
 */
export async function startAnalytics() {

  if (await isSupported()) getAnalytics(app);

}
