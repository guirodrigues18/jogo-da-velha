import { changeLanguage, lang, LANGS, LANGUAGE_NAMES, t } from '../i18n';
import Dialog from './Dialog';

interface Props {
  onClose: () => void;
}

export default function LanguageDialog({ onClose }: Props) {

  return (
    <Dialog title={t.language.title} onClose={onClose}>
      <div className="language-options">
        {LANGS.map(option => (
          <button
            key={option}
            className={option === lang ? 'language-option active' : 'language-option'}
            onClick={() => (option === lang ? onClose() : changeLanguage(option))}
            lang={option}
          >
            <span className="language-code">{option.toUpperCase()}</span>
            {LANGUAGE_NAMES[option]}
            {option === lang && <span className="language-check">✓</span>}
          </button>
        ))}
      </div>
    </Dialog>
  );

}
