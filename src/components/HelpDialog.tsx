import Dialog from './Dialog';

interface Props {
  onClose: () => void;
}

/** Explicação das regras, com um exemplo visual da regra principal */
export default function HelpDialog({ onClose }: Props) {

  return (
    <Dialog title="Como jogar" onClose={onClose}>

      <section className="help-step">
        <span className="help-icon">🎯</span>
        <p><strong>Objetivo:</strong> conquiste 3 mini-tabuleiros em linha no tabuleiro grande.</p>
      </section>

      <section className="help-step">
        <span className="help-icon">✕</span>
        <p><strong>Para conquistar um mini-tabuleiro,</strong> faça 3 em linha dentro dele, como no jogo da velha comum.</p>
      </section>

      <section className="help-step">
        <span className="help-icon">➡️</span>
        <div>
          <p>
            <strong>A regra de ouro:</strong> a casa em que você joga decide em qual tabuleiro o adversário joga depois.
          </p>
          <div className="help-example" aria-hidden="true">
            <div className="help-grid">
              {Array.from({ length: 9 }, (_, i) => (
                <span key={i} className={i === 2 ? 'help-cell played' : 'help-cell'}>{i === 2 ? '✕' : ''}</span>
              ))}
            </div>
            <span className="help-arrow">→</span>
            <div className="help-grid big">
              {Array.from({ length: 9 }, (_, i) => (
                <span key={i} className={i === 2 ? 'help-cell target' : 'help-cell'} />
              ))}
            </div>
          </div>
          <p className="help-caption">
            Jogou no canto de cima à direita? O adversário joga no tabuleiro do canto de cima à direita.
          </p>
        </div>
      </section>

      <section className="help-step">
        <span className="help-icon">🔓</span>
        <p>Se o tabuleiro de destino já estiver fechado, o adversário pode jogar em <strong>qualquer</strong> um aberto.</p>
      </section>

      <section className="help-step">
        <span className="help-icon">⏱</span>
        <p>Cada jogada tem <strong>20 segundos</strong>. Se o tempo acabar, a vez passa para o adversário.</p>
      </section>

      <section className="help-step">
        <span className="help-icon">🌐</span>
        <p>
          <strong>Online:</strong> crie uma sala e envie o link. Quem abrir joga com O; se a sala já tiver
          dois jogadores, a pessoa assiste. Sair no meio da partida conta como desistência.
        </p>
      </section>

      <button className="btn" onClick={onClose}>Entendi, bora jogar!</button>

    </Dialog>
  );

}
