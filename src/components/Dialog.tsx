import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface Props {
  title: string;
  onClose: () => void;
  /** Ao lado do título (ex.: saldo de moedas) */
  headerExtra?: ReactNode;
  children: ReactNode;
}

/** Janela sobre o jogo (fecha no ✕, no Esc ou tocando fora) */
export default function Dialog({ title, onClose, headerExtra, children }: Props) {

  useEffect(() => {

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', onKeyDown);

    return () => window.removeEventListener('keydown', onKeyDown);

  }, [onClose]);

  // Direto no <body>: fica por cima de tudo, inclusive do rodapé fora do app
  return createPortal(
    <div className="dialog-backdrop" onClick={onClose}>
      <div className="dialog" role="dialog" aria-modal="true" aria-label={title} onClick={event => event.stopPropagation()}>
        <div className="dialog-header">
          <h2>{title}</h2>
          {headerExtra}
          <button className="dialog-close" onClick={onClose} aria-label="✕">✕</button>
        </div>
        <div className="dialog-body">{children}</div>
      </div>
    </div>,
    document.body
  );

}
