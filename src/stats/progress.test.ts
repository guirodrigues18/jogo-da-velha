import { describe, expect, it } from 'vitest';
import { mergeProgress, type Progress } from './progress';
import { emptyStats } from './achievements';
import { emptyProfile } from '../shop/wallet';

const local: Progress = {
  stats: { ...emptyStats(), played: 5, wins: 3, unlocked: { 'first-win': 200, 'beat-easy': 300 } },
  profile: { ...emptyProfile(), coins: 80, owned: [...emptyProfile().owned, 'symbol-star'] },
  rivals: { bruno: { name: 'Bruno', wins: 2, losses: 1, draws: 0, last: 500 } }
};

describe('mergeProgress', () => {

  it('sem nada na nuvem, mantém o do aparelho', () => {

    expect(mergeProgress(local, null)).toEqual(local);

  });

  it('fica com os maiores números e soma conquistas e itens', () => {

    const cloud: Partial<Progress> = {
      stats: { ...emptyStats(), played: 9, wins: 2, unlocked: { 'first-win': 100, 'online-win': 150 } },
      profile: { ...emptyProfile(), coins: 50, owned: [...emptyProfile().owned, 'theme-retro'] }
    };

    const merged = mergeProgress(local, cloud);

    expect(merged.stats).toMatchObject({ played: 9, wins: 3 });
    expect(merged.stats.unlocked).toEqual({ 'first-win': 100, 'beat-easy': 300, 'online-win': 150 });
    expect(merged.profile.coins).toBe(80);
    expect(merged.profile.owned).toEqual(expect.arrayContaining(['symbol-star', 'theme-retro']));

  });

  it('usa o item em uso da nuvem só se ele estiver comprado', () => {

    const cloud: Partial<Progress> = {
      profile: {
        ...emptyProfile(),
        owned: [...emptyProfile().owned, 'theme-retro'],
        equipped: { symbol: 'symbol-crown', theme: 'theme-retro', effect: 'effect-classic' }
      }
    };

    const merged = mergeProgress(local, cloud);

    expect(merged.profile.equipped.theme).toBe('theme-retro');
    expect(merged.profile.equipped.symbol).toBe('symbol-classic');

  });

  it('junta os rivais dos dois lados', () => {

    const cloud: Partial<Progress> = {
      rivals: {
        bruno: { name: 'Brunão', wins: 1, losses: 3, draws: 1, last: 100 },
        ana: { name: 'Ana', wins: 0, losses: 1, draws: 0, last: 50 }
      }
    };

    const merged = mergeProgress(local, cloud);

    expect(merged.rivals.bruno).toEqual({ name: 'Bruno', wins: 2, losses: 3, draws: 1, last: 500 });
    expect(merged.rivals.ana.name).toBe('Ana');

  });

});
