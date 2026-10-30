import { describe, expect, it } from 'vitest';
import { emptyProfile, equip, purchase, retroactiveCoins } from './wallet';
import { coinsForGame } from './rewards';

describe('loja', () => {

  it('começa com moedas de boas-vindas e os itens padrão', () => {

    const profile = emptyProfile();

    expect(profile.coins).toBe(30);
    expect(profile.owned).toContain('symbol-classic');
    expect(profile.equipped.theme).toBe('theme-neon');

  });

  it('compra quando há moedas suficientes', () => {

    const profile = purchase({ ...emptyProfile(), coins: 100 }, 'symbol-star');

    expect(profile?.coins).toBe(40);
    expect(profile?.owned).toContain('symbol-star');

  });

  it('não compra sem moedas, item repetido ou inexistente', () => {

    expect(purchase(emptyProfile(), 'theme-gold')).toBeNull();
    expect(purchase({ ...emptyProfile(), coins: 500 }, 'symbol-classic')).toBeNull();
    expect(purchase({ ...emptyProfile(), coins: 500 }, 'nao-existe')).toBeNull();

  });

  it('só usa itens comprados, no lugar certo', () => {

    expect(equip(emptyProfile(), 'symbol-star')).toBeNull();

    const bought = purchase({ ...emptyProfile(), coins: 200 }, 'theme-retro')!;

    expect(equip(bought, 'theme-retro')?.equipped).toMatchObject({ theme: 'theme-retro', symbol: 'symbol-classic' });

  });

});

describe('retroactiveCoins', () => {

  it('paga as partidas e conquistas de antes da loja', () => {

    expect(retroactiveCoins({ wins: 4, draws: 2, losses: 3, unlocked: { 'first-win': 1, 'beat-easy': 2 } })).toBe(40 + 6 + 3 + 20);

  });

  it('quem nunca jogou contra a IA ou online não recebe nada', () => {

    expect(retroactiveCoins(null)).toBe(0);

  });

});

describe('coinsForGame', () => {

  const base = { boardsWon: 3, boardsLost: 1, moves: 40 };

  it('paga mais pelas vitórias mais difíceis', () => {

    expect(coinsForGame({ ...base, mode: 'ai', difficulty: 'easy', result: 'win' })).toBe(5);
    expect(coinsForGame({ ...base, mode: 'ai', difficulty: 'hard', result: 'win' })).toBe(25);
    expect(coinsForGame({ ...base, mode: 'online', result: 'win' })).toBe(20);
    expect(coinsForGame({ ...base, mode: 'daily', result: 'win' })).toBe(15);

  });

  it('empate e derrota também rendem um pouco', () => {

    expect(coinsForGame({ ...base, mode: 'online', result: 'draw' })).toBe(3);
    expect(coinsForGame({ ...base, mode: 'ai', difficulty: 'hard', result: 'loss' })).toBe(1);

  });

});
