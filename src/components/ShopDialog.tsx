import { useProfile } from '../shop/wallet';
import { t } from '../i18n';
import Dialog from './Dialog';
import ShopPanel from './ShopPanel';

interface Props {
  onClose: () => void;
}

/** Loja (aberta pelo card da loja no início), com o saldo de moedas */
export default function ShopDialog({ onClose }: Props) {

  const profile = useProfile();

  return (
    <Dialog title={t.shop.title} onClose={onClose} wide headerExtra={<span className="coin-balance">🪙 {profile.coins}</span>}>
      <ShopPanel />
    </Dialog>
  );

}
