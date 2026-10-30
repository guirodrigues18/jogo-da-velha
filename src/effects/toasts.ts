/* ===========================
   Avisos rápidos no topo da tela (missões, convites...), mostrados pelo AchievementToaster
   =========================== */

export interface Toast {
  icon: string;
  label: string;
  title: string;
  /** Toca o som de conquista */
  sound?: boolean;
}

const listeners = new Set<(toast: Toast) => void>();

export function showToast(toast: Toast) {

  listeners.forEach(listener => listener(toast));

}

export function onToast(listener: (toast: Toast) => void): () => void {

  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };

}
