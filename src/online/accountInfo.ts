import { useSyncExternalStore } from 'react';

/* ===========================
   Dados da conta Google guardados no navegador, para mostrar nome e foto
   sem precisar baixar o Firebase (que só carrega quando necessário)
   =========================== */

export interface AccountInfo {
  name: string;
  photo: string | null;
}

const STORAGE_KEY = 'jogo-da-velha:conta';

function load(): AccountInfo | null {

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) as AccountInfo : null;
  } catch {
    return null;
  }

}

let info = load();
const listeners = new Set<() => void>();

export function saveAccountInfo(next: AccountInfo | null) {

  info = next;

  try {
    if (next) localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Sem armazenamento, vale só para esta visita
  }

  listeners.forEach(listener => listener());

}

export function getAccountInfo(): AccountInfo | null {

  return info;

}

export function useAccountInfo(): AccountInfo | null {

  return useSyncExternalStore(
    listener => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getAccountInfo
  );

}

/** Primeiro nome, para sugerir como apelido */
export function firstName(account: AccountInfo | null): string {

  return account?.name.split(' ')[0] ?? '';

}
