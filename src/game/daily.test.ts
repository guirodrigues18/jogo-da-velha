import { describe, expect, it } from 'vitest';
import { dailyChallenge, dailyRandom } from './daily';
import { chooseMove } from './ai';

describe('dailyChallenge', () => {

  it('gera a mesma posição para a mesma data', () => {

    const a = dailyChallenge(new Date(2026, 10, 5, 8));
    const b = dailyChallenge(new Date(2026, 10, 5, 22));

    expect(a.start).toEqual(b.start);
    expect(a.number).toBe(b.number);

  });

  it('gera posições diferentes em dias diferentes', () => {

    expect(dailyChallenge(new Date(2026, 10, 5)).start).not.toEqual(dailyChallenge(new Date(2026, 10, 6)).start);

  });

  it('numera a partir de 30/10/2026', () => {

    expect(dailyChallenge(new Date(2026, 9, 30)).number).toBe(1);
    expect(dailyChallenge(new Date(2026, 10, 1)).number).toBe(3);

  });

  it('começa com a vez do X, partida em andamento e algumas jogadas feitas', () => {

    for (let day = 1; day <= 30; day++) {
      const { start } = dailyChallenge(new Date(2026, 10, day));
      expect(start.currentPlayer).toBe('x');
      expect(start.winner).toBeNull();
      expect(start.turn).toBeGreaterThanOrEqual(6);
    }

  });

  it('o computador responde sempre igual à mesma posição', () => {

    const challenge = dailyChallenge(new Date(2026, 10, 5));
    const state = { ...challenge.start, currentPlayer: 'o' as const };

    const first = chooseMove(state, 'medium', undefined, dailyRandom(challenge, state));
    const second = chooseMove(state, 'medium', undefined, dailyRandom(challenge, state));

    expect(first).toEqual(second);

  });

});
