import { useEffect, type ReactNode } from 'react';

interface Props {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

/** Janela sobre o jogo (fecha no ✕, no Esc ou tocando fora) */
export default function Dialog({ title, onClose, children }: Props) {

  useEffect(() => {

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', onKeyDown);

    return () => window.removeEventListener('keydown', onKeyDown);

  }, [onClose]);

  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div className="dialog" role="dialog" aria-modal="true" aria-label={title} onClick={event => event.stopPropagation()}>
        <div className="dialog-header">
          <h2>{title}</h2>
          <button className="dialog-close" onClick={onClose} aria-label="Fechar">✕</button>
        </div>
        <div className="dialog-body">{children}</div>
      </div>
    </div>
  );

}
