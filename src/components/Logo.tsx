import { t } from '../i18n';

interface Props {
  /** Versão grande e centralizada, da tela de início */
  hero?: boolean;
}

/** "Jogo da Velha 2.0": o nome nunca quebra de linha e o "2.0" vira um selo ao lado */
export default function Logo({ hero = false }: Props) {

  return (
    <h1 className={hero ? 'logo hero' : 'logo'}>
      <span className="logo-name">{t.title}</span>
      <span className="logo-version">2.0</span>
    </h1>
  );

}
