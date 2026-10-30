import { t } from '../i18n';
import Dialog from './Dialog';

interface Props {
  onClose: () => void;
}

/** Explicação das regras, com um exemplo visual da regra principal */
export default function HelpDialog({ onClose }: Props) {

  return (
    <Dialog title={t.help.title} onClose={onClose}>

      {t.help.steps.map(step => (
        <section className="help-step" key={step.icon}>
          <span className="help-icon">{step.icon}</span>
          <div>
            <p><strong>{step.strong}</strong> {step.text}</p>
            {step.example && <RuleExample />}
          </div>
        </section>
      ))}

      <button className="btn" onClick={onClose}>{t.help.ok}</button>

      <nav className="help-links">
        <a href={t.pages.rules}>{t.help.rulesLink}</a>
        <a href={t.pages.strategy}>{t.help.strategyLink}</a>
      </nav>

    </Dialog>
  );

}

/** Casa do canto de cima à direita → tabuleiro do canto de cima à direita */
function RuleExample() {

  return (
    <>
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
      <p className="help-caption">{t.help.caption}</p>
    </>
  );

}
