import { useProfile } from '../shop/wallet';
import { t } from '../i18n';
import Dialog from './Dialog';
import DailyPanel from './DailyPanel';

interface Props {
  /** Padrão: boas-vindas do dia */
  title?: string;
  onClose: () => void;
}

/**
 * Recompensa diária, missões e convites. Aparece sozinha para quem volta e
 * ainda não pegou a recompensa, e pelo card de missões no início
 */
export default function DailyDialog({ title = t.dailyReward.welcome, onClose }: Props) {

  const profile = useProfile();

  return (
    <Dialog title={title} onClose={onClose} headerExtra={<span className="coin-balance">🪙 {profile.coins}</span>}>
      <DailyPanel />
      <button className="btn btn-ghost" onClick={onClose}>{t.dailyReward.play}</button>
    </Dialog>
  );

}
