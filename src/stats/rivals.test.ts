import { describe, expect, it } from 'vitest';
import { applyRivalGame, mergeRivals, rivalRanking, type Rivals } from './rivals';

describe('rivais', () => {

  it('soma o placar e guarda o apelido mais recente', () => {

    let rivals: Rivals = {};

    rivals = applyRivalGame(rivals, 'b', 'Bruno', 'win', 1);
    rivals = applyRivalGame(rivals, 'b', 'Brunão', 'loss', 2);
    rivals = applyRivalGame(rivals, 'b', 'Brunão', 'draw', 3);

    expect(rivals.b).toEqual({ name: 'Brunão', wins: 1, losses: 1, draws: 1, last: 3 });

  });

  it('ranqueia você e os rivais pelo aproveitamento entre vocês', () => {

    const rivals: Rivals = {
      bruno: { name: 'Bruno', wins: 1, losses: 3, draws: 0, last: 1 },
      ana: { name: 'Ana', wins: 3, losses: 0, draws: 1, last: 2 }
    };

    const ranking = rivalRanking(rivals, 'Você');

    expect(ranking.map(r => r.name)).toEqual(['Bruno', 'Você', 'Ana']);
    // Bruno ganhou 3 de 4 contra você
    expect(ranking[0]).toMatchObject({ wins: 3, losses: 1, games: 4, rate: .75 });
    // Você: 4 vitórias, 1 empate e 3 derrotas em 8 partidas
    expect(ranking[1]).toMatchObject({ id: null, wins: 4, draws: 1, losses: 3, games: 8, rate: 4.5 / 8 });

  });

  it('junta o placar do aparelho com o da nuvem', () => {

    const local: Rivals = { b: { name: 'Bruno', wins: 2, losses: 0, draws: 0, last: 10 } };
    const cloud: Rivals = {
      b: { name: 'Bru', wins: 1, losses: 2, draws: 0, last: 5 },
      a: { name: 'Ana', wins: 0, losses: 1, draws: 0, last: 3 }
    };

    expect(mergeRivals(local, cloud)).toEqual({
      b: { name: 'Bruno', wins: 2, losses: 2, draws: 0, last: 10 },
      a: { name: 'Ana', wins: 0, losses: 1, draws: 0, last: 3 }
    });

  });

});
