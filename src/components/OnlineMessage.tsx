interface Props {
  title: string;
  text?: string;
  actionLabel?: string;
  onAction?: () => void;
}

/** Tela de carregamento ou erro do modo online */
export default function OnlineMessage({ title, text, actionLabel, onAction }: Props) {

  return (
    <div className="container online-message">
      <div className="modal-card">
        <div className="modal-title">{title}</div>
        {text && <div className="modal-subtitle">{text}</div>}
        {actionLabel && (
          <button className="btn" onClick={onAction}>{actionLabel}</button>
        )}
      </div>
    </div>
  );

}
