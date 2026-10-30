import { ITEM_TYPES, ITEMS, type ShopItem } from '../shop/catalog';
import { buyItem, equipItem, useProfile } from '../shop/wallet';
import { playSound } from '../audio/sounds';
import { t } from '../i18n';

/** Loja: comprar e usar símbolos, temas e efeitos de vitória */
export default function ShopPanel() {

  const profile = useProfile();

  const buy = (item: ShopItem) => {
    if (buyItem(item.id)) {
      playSound('achievement');
      equipItem(item.id);
    }
  };

  return (
    <div className="shop">

      <p className="stats-note">{t.shop.howToEarn}</p>

      {ITEM_TYPES.map(type => (
        <section key={type} className="shop-section">
          <h3>{t.shop.types[type]}</h3>
          <p className="shop-hint">{t.shop.hints[type]}</p>

          <div className="shop-grid">
            {ITEMS.filter(item => item.type === type).map(item => {

              const owned = profile.owned.includes(item.id);
              const inUse = profile.equipped[type] === item.id;
              const affordable = profile.coins >= item.price;

              let action = <button className="shop-action" disabled={!affordable} onClick={() => buy(item)}>🪙 {item.price}</button>;

              if (inUse) action = <span className="shop-action in-use">{t.shop.inUse}</span>;
              else if (owned) action = <button className="shop-action" onClick={() => equipItem(item.id)}>{t.shop.use}</button>;

              return (
                <div key={item.id} className={inUse ? 'shop-item in-use' : 'shop-item'}>
                  {type === 'theme'
                    ? <span className="shop-swatch" style={{ background: item.preview }} />
                    : <span className="shop-preview">{item.preview}</span>}
                  <span className="shop-name">{t.shop.items[item.id]}</span>
                  {action}
                </div>
              );

            })}
          </div>
        </section>
      ))}

    </div>
  );

}
