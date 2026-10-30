interface Props {
  /** Tema mostrado (valor de data-theme, ex.: "wood"); sem ele, usa o tema atual */
  theme?: string;
  className?: string;
}

const CELLS = ['x', 'o', '', '', 'x', 'o', 'o', '', 'x'];

const MARKS: Record<string, string> = { x: '✕', o: '◯' };

/** Mini tabuleiro decorativo nas cores de um tema (início e prévia da loja) */
export default function BoardPreview({ theme, className }: Props) {

  return (
    <div className={className ? `board-preview ${className}` : 'board-preview'} data-theme={theme} aria-hidden="true">
      {CELLS.map((mark, i) => (
        <span key={i} className={mark}>{MARKS[mark]}</span>
      ))}
    </div>
  );

}
