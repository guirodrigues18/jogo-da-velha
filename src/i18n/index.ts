import pt, { type Messages } from './pt';
import en from './en';
import es from './es';

/* ===========================
   Idiomas
   Cada idioma tem sua própria página (/, /en/, /es/) com <html lang> e textos
   de SEO próprios; o idioma da interface é lido dessa página.
   =========================== */

export type Lang = 'pt' | 'en' | 'es';

export const LANGS: Lang[] = ['pt', 'en', 'es'];

export const LANGUAGE_NAMES: Record<Lang, string> = {
  pt: 'Português',
  en: 'English',
  es: 'Español'
};

const PATHS: Record<Lang, string> = { pt: '/', en: '/en/', es: '/es/' };
const DICTIONARIES: Record<Lang, Messages> = { pt, en, es };
const STORAGE_KEY = 'jogo-da-velha:idioma';

function langFromHtml(): Lang {

  const value = typeof document === 'undefined' ? '' : document.documentElement.lang;

  if (value.startsWith('en')) return 'en';
  if (value.startsWith('es')) return 'es';

  return 'pt';

}

export const lang: Lang = langFromHtml();

/** Textos da interface no idioma da página */
export const t: Messages = DICTIONARIES[lang];

function savedLang(): Lang | null {

  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return LANGS.includes(value as Lang) ? (value as Lang) : null;
  } catch {
    return null;
  }

}

/** Troca de idioma: lembra a escolha e abre a página do idioma, mantendo a sala (?sala=) */
export function changeLanguage(next: Lang) {

  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // Sem armazenamento, a escolha vale só para esta visita
  }

  window.location.assign(PATHS[next] + window.location.search);

}

/**
 * Quem já escolheu um idioma antes abre direto nele.
 * Só usa a escolha explícita (nunca o idioma do navegador), para o Google
 * sempre ver cada página no próprio idioma. Retorna true se for redirecionar.
 */
export function redirectToSavedLanguage(): boolean {

  const saved = savedLang();

  if (!saved || saved === lang) return false;

  window.location.replace(PATHS[saved] + window.location.search);

  return true;

}

export type { Messages };
