/* ===========================
   Itens da loja (os nomes ficam nos textos de cada idioma, pelo id)
   =========================== */

export type ItemType = 'symbol' | 'theme' | 'effect';

export interface ShopItem {
  id: string;
  type: ItemType;
  price: number;
  /** Emoji (símbolos e efeitos) ou cor de destaque (temas) mostrado na loja */
  preview: string;
}

export const ITEM_TYPES: ItemType[] = ['symbol', 'theme', 'effect'];

export const ITEMS: ShopItem[] = [
  { id: 'symbol-classic', type: 'symbol', price: 0, preview: '✕' },
  { id: 'symbol-star', type: 'symbol', price: 60, preview: '⭐' },
  { id: 'symbol-fire', type: 'symbol', price: 80, preview: '🔥' },
  { id: 'symbol-heart', type: 'symbol', price: 80, preview: '❤️' },
  { id: 'symbol-cat', type: 'symbol', price: 100, preview: '🐱' },
  { id: 'symbol-skull', type: 'symbol', price: 120, preview: '💀' },
  { id: 'symbol-alien', type: 'symbol', price: 150, preview: '👽' },
  { id: 'symbol-crown', type: 'symbol', price: 200, preview: '👑' },
  { id: 'symbol-pumpkin', type: 'symbol', price: 100, preview: '🎃' },
  { id: 'symbol-ghost', type: 'symbol', price: 100, preview: '👻' },
  { id: 'symbol-zombie', type: 'symbol', price: 100, preview: '🧟' },
  { id: 'symbol-coffin', type: 'symbol', price: 100, preview: '⚰️' },
  { id: 'symbol-christmas', type: 'symbol', price: 100, preview: '🎄' },

  { id: 'theme-neon', type: 'theme', price: 0, preview: '#8b5cf6' },
  { id: 'theme-retro', type: 'theme', price: 150, preview: '#39ff14' },
  { id: 'theme-ocean', type: 'theme', price: 150, preview: '#2ec4b6' },
  { id: 'theme-sunset', type: 'theme', price: 200, preview: '#ff8c42' },
  { id: 'theme-gold', type: 'theme', price: 300, preview: '#ffd166' },
  // Temas sem neon (mudam também as peças e as casas)
  { id: 'theme-notebook', type: 'theme', price: 150, preview: 'repeating-linear-gradient(180deg, #fbf8ee 0 5px, #9db8e8 5px 6px)' },
  { id: 'theme-ice', type: 'theme', price: 150, preview: 'linear-gradient(135deg, #ffffff 0 50%, #7fb3d4 50%)' },
  { id: 'theme-blocks', type: 'theme', price: 200, preview: 'linear-gradient(135deg, #ff5a5f 0 50%, #34c964 50%)' },
  { id: 'theme-wood', type: 'theme', price: 200, preview: 'linear-gradient(135deg, #f3dcb2 0 50%, #8c5a2e 50%)' },
  { id: 'theme-military', type: 'theme', price: 200, preview: 'radial-gradient(circle at 30% 35%, #2a3320 0 22%, transparent 24%), radial-gradient(circle at 70% 70%, #6b5a3a 0 20%, transparent 22%), #5f6a34' },
  { id: 'theme-pitaya', type: 'theme', price: 250, preview: 'radial-gradient(circle, #fff8fb 0 45%, #e0287a 47%)' },
  { id: 'theme-donut', type: 'theme', price: 250, preview: 'radial-gradient(circle, transparent 0 22%, #ff6fa8 24% 60%, #e8a35f 62%)' },

  { id: 'effect-classic', type: 'effect', price: 0, preview: '🎉' },
  { id: 'effect-stars', type: 'effect', price: 100, preview: '⭐' },
  { id: 'effect-hearts', type: 'effect', price: 100, preview: '💖' },
  { id: 'effect-fireworks', type: 'effect', price: 200, preview: '🎆' }
];

export type ItemId = string;

export const DEFAULT_EQUIPPED: Record<ItemType, ItemId> = {
  symbol: 'symbol-classic',
  theme: 'theme-neon',
  effect: 'effect-classic'
};

export function findItem(id: ItemId): ShopItem | undefined {

  return ITEMS.find(item => item.id === id);

}

/** Emoji usado no lugar do X/O; null para o símbolo clássico (desenhado em neon) */
export function symbolGlyph(id: ItemId | undefined): string | null {

  if (!id || id === DEFAULT_EQUIPPED.symbol) return null;

  const item = findItem(id);

  return item?.type === 'symbol' ? item.preview : null;

}
