import { useProfile } from '../shop/wallet';
import { t } from '../i18n';
import Dialog from './Dialog';
import DailyPanel from './DailyPanel';

interface Props {
  onClose: () => void;
}

/** Boas-vindas do dia: aparece sozinha para quem volta e ainda não pegou a recompensa */
export default function DailyDialog({ onClose }: Props) {

  const profile = useProfile();

  return (
    <Dialog title={t.dailyReward.welcome} onClose={onClose} headerExtra={<span className="coin-balance">🪙 {profile.coins}</span>}>
      <DailyPanel />
      <button className="btn btn-ghost" onClick={onClose}>{t.dailyReward.play}</button>
    </Dialog>
  );

}
