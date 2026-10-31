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
  /** Seção da loja de cada tema: clássicos, estilizados, especiais ou times */
  group?: ThemeGroup;
}

export type ThemeGroup = 'classic' | 'styled' | 'special' | 'team';

/** Seções da loja, na ordem em que aparecem */
export type ShopSection = Exclude<ItemType, 'theme'> | ThemeGroup;

export const SHOP_SECTIONS: ShopSection[] = ['symbol', 'classic', 'styled', 'special', 'team', 'effect'];

export function sectionOf(item: ShopItem): ShopSection {

  return item.group ?? (item.type as Exclude<ItemType, 'theme'>);

}

const THEME_PRICES: Record<Exclude<ThemeGroup, 'team'>, number> = { classic: 100, styled: 200, special: 300 };

/** Tema comum; o preview é a cor de destaque guardada no catálogo */
const theme = (id: string, group: Exclude<ThemeGroup, 'team'>, preview: string): ShopItem =>
  ({ id: `theme-${id}`, type: 'theme', price: id === 'neon' ? 0 : THEME_PRICES[group], preview, group });

const TEAM_PRICE = 400;

/** Tema de time: listras/fundo para a prévia da loja */
const team = (id: string, preview: string): ShopItem => ({ id: `theme-team-${id}`, type: 'theme', price: TEAM_PRICE, preview, group: 'team' });

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
  { id: 'symbol-panda', type: 'symbol', price: 100, preview: '🐼' },
  { id: 'symbol-rocket', type: 'symbol', price: 120, preview: '🚀' },
  { id: 'symbol-dino', type: 'symbol', price: 120, preview: '🦖' },
  { id: 'symbol-unicorn', type: 'symbol', price: 150, preview: '🦄' },
  { id: 'symbol-ninja', type: 'symbol', price: 150, preview: '🥷' },

  // Clássicos (o Cyberpunk é o tema padrão; o id continua "neon")
  theme('neon', 'classic', '#8b5cf6'),
  theme('blocks', 'classic', '#3b6bff'),
  theme('notebook', 'classic', '#fbf8ee'),
  theme('wood', 'classic', '#8c5a2e'),
  theme('chess', 'classic', '#c9a24a'),

  // Estilizados
  theme('pitaya', 'styled', '#ff2e9a'),
  theme('donut', 'styled', '#ff8fbf'),
  theme('galaxy', 'styled', '#3b6dff'),
  theme('volcano', 'styled', '#ff6a1a'),
  theme('oriental', 'styled', '#b8282e'),
  theme('graffiti', 'styled', '#ff2e88'),
  theme('origami', 'styled', '#f07a5a'),

  // Especiais (o Fliperama usa o id do antigo Retrô)
  theme('military', 'special', '#6b7a3a'),
  theme('medieval', 'special', '#c9a24a'),
  theme('retro', 'special', '#39ff14'),
  theme('storm', 'special', '#6fb6ff'),
  theme('casino', 'special', '#d4af37'),
  theme('jeans', 'special', '#2f5d8f'),
  theme('comic', 'special', '#ffd21f'),

  // Times (só cores e detalhes genéricos, sem escudos; o nome na loja é o apelido)
  team('mengao', 'repeating-linear-gradient(180deg, #c8102e 0 6px, #111 6px 12px)'),
  team('verdao', 'linear-gradient(135deg, #0e6b3c 0 60%, #fff 60% 68%, #0e6b3c 68%)'),
  team('raposa', 'radial-gradient(circle at 35% 35%, #fff 0 7%, transparent 8%), radial-gradient(circle at 65% 62%, #fff 0 6%, transparent 7%), #0d3aa8'),
  team('flu', 'repeating-linear-gradient(90deg, #7a1f3d 0 6px, #fff 6px 8px, #0a6b3a 8px 14px, #fff 14px 16px)'),
  team('furacao', 'repeating-linear-gradient(135deg, #111 0 6px, #d0021b 6px 12px)'),
  team('esquadrao', 'linear-gradient(180deg, #0b4ea2 0 40%, #fff 40% 46%, #d71920 46% 54%, #fff 54% 60%, #0b4ea2 60%)'),
  team('galo', 'repeating-linear-gradient(90deg, #111 0 6px, #f2f2f2 6px 12px)'),
  team('peixe', 'linear-gradient(90deg, #f5f5f5 0 70%, #111 70%)'),
  team('massa-bruta', 'linear-gradient(135deg, #fff 0 50%, #d7182a 50%)'),
  team('tricolor-paulista', 'linear-gradient(180deg, #fff 0 40%, #d0021b 40% 53%, #111 53% 66%, #fff 66%)'),
  team('fogao', 'radial-gradient(circle at 50% 50%, #fff 0 14%, transparent 15%), #111'),
  team('coxa', 'linear-gradient(180deg, #fff 0 42%, #00693e 42% 58%, #fff 58%)'),
  team('vascao', 'linear-gradient(135deg, #111 0 42%, #f2f2f2 42% 58%, #111 58%)'),
  team('leao-da-barra', 'repeating-linear-gradient(180deg, #d0021b 0 6px, #111 6px 12px)'),
  team('imortal', 'repeating-linear-gradient(90deg, #0d80bf 0 6px, #111 6px 12px, #fff 12px 14px)'),
  team('colorado', 'linear-gradient(135deg, #c8102e 0 70%, #fff 70%)'),
  team('timao', 'linear-gradient(135deg, #111 0 50%, #f2f2f2 50%)'),
  team('leao-azul', 'linear-gradient(135deg, #0b1f4b 0 70%, #fff 70%)'),
  team('verdao-do-oeste', 'repeating-linear-gradient(135deg, #0f8a44 0 7px, #fff 7px 10px)'),
  team('leao-caipira', 'repeating-linear-gradient(90deg, #f5c800 0 8px, #0b6b3a 8px 11px)'),

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
