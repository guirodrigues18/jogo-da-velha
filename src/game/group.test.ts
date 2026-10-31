import { describe, expect, it } from 'vitest';
import {
  applyGroupMove,
  createGroupGame,
  currentMark,
  markOf,
  passGroupTurn,
  skipLeftSeat,
  wonByElimination,
  type GroupState,
  type Mark
} from './group';
import { MAX_TIMEOUTS } from './logic';

/** Mini-tabuleiro com as casas dadas (o resto vazio) */
function board(cells: (Mark | null)[], winner: GroupState['boards'][number]['winner'] = null) {

  return { cells: [...cells, ...Array(9 - cells.length).fill(null)], winner };

}

describe('markOf', () => {

  it('2x2: lugares pares são ✕ e ímpares são ◯', () => {

    expect([0, 1, 2, 3].map(seat => markOf('duo', seat))).toEqual(['x', 'o', 'x', 'o']);

  });

  it('Champs: cada lugar tem o seu símbolo', () => {

    expect([0, 1, 2, 3].map(seat => markOf('champs', seat))).toEqual(['x', 'o', 't', 's']);

  });

});

describe('applyGroupMove', () => {

  it('2x2: a vez gira pelos 4 lugares e a casa define o próximo tabuleiro', () => {

    let game = createGroupGame('duo', 4);

    game = applyGroupMove(game, 0, 4);
    expect(game.seat).toBe(1);
    expect(game.activeBoard).toBe(4);

    game = applyGroupMove(game, 4, 2);
    game = applyGroupMove(game, 2, 0);
    expect(game.seat).toBe(3);
    expect(currentMark(game)).toBe('o');

    game = applyGroupMove(game, 0, 1);
    expect(game.seat).toBe(0);
    expect(game.boards[0].cells.slice(0, 5)).toEqual([null, 'o', null, null, 'x']);

  });

  it('recusa jogada fora do tabuleiro obrigatório', () => {

    const game = applyGroupMove(createGroupGame('champs', 3), 0, 4);

    expect(applyGroupMove(game, 0, 0)).toBe(game);

  });

  it('Champs: tabuleiro cheio sem linha fica com quem tem mais casas', () => {

    const game: GroupState = {
      ...createGroupGame('champs', 3),
      // x o t / t x o / o t _  → falta uma casa; o △ completa e fica com 4 casas
      boards: Array.from({ length: 9 }, (_, i) => (i === 0 ? board(['x', 'o', 't', 't', 'x', 'o', 'o', 't', null]) : board([]))),
      seat: 2,
      activeBoard: 0
    };

    const next = applyGroupMove(game, 0, 8);

    expect(next.boards[0].winner).toBe('t');

  });

  it('Champs: empate no número de casas não dá o tabuleiro para ninguém', () => {

    const game: GroupState = {
      ...createGroupGame('champs', 3),
      // x o t / t o x / o t _  → com um ✕, ficam 3 de cada símbolo: ninguém leva
      boards: Array.from({ length: 9 }, (_, i) => (i === 0 ? board(['x', 'o', 't', 't', 'o', 'x', 'o', 't', null]) : board([]))),
      seat: 0,
      activeBoard: 0
    };

    expect(applyGroupMove(game, 0, 8).boards[0].winner).toBe('draw');

  });

  it('Champs: vence quem conquista 3 mini-tabuleiros, em qualquer posição', () => {

    const game: GroupState = {
      ...createGroupGame('champs', 4),
      boards: Array.from({ length: 9 }, (_, i) => {
        if (i === 0 || i === 5) return board(['s', 's', 's'], 's');
        if (i === 8) return board(['s', 's']);
        return board([]);
      }),
      seat: 3,
      activeBoard: 8
    };

    expect(applyGroupMove(game, 8, 2).winner).toBe('s');

  });

  it('2x2: 3 tabuleiros em linha, como no 1x1', () => {

    const game: GroupState = {
      ...createGroupGame('duo', 4),
      boards: Array.from({ length: 9 }, (_, i) => {
        if (i === 0 || i === 1) return board(['o', 'o', 'o'], 'o');
        if (i === 2) return board(['o', 'o']);
        return board([]);
      }),
      seat: 3,
      activeBoard: 2
    };

    expect(applyGroupMove(game, 2, 2).winner).toBe('o');

  });

});

describe('passGroupTurn', () => {

  it('conta o tempo esgotado e passa a vez para o próximo lugar', () => {

    const game = passGroupTurn({ ...createGroupGame('champs', 3), activeBoard: 5 });

    expect(game.timeouts).toEqual([1, 0, 0]);
    expect(game.seat).toBe(1);
    expect(game.activeBoard).toBe(5);

  });

  it('2x2: no 4º tempo esgotado, o jogador sai e o parceiro joga na vez dele', () => {

    let game = passGroupTurn({ ...createGroupGame('duo', 4), seat: 2, timeouts: [0, 0, MAX_TIMEOUTS, 0] });

    expect(game.winner).toBeNull();
    expect(game.out).toEqual([false, false, true, false]);
    expect(game.seat).toBe(3);

    // 3 (◯) → 0 (✕) → 1 (◯) → no lugar do 2, joga o parceiro 0 (✕)
    game = applyGroupMove(game, 4, 0);
    expect(game.seat).toBe(0);
    game = applyGroupMove(game, 0, 1);
    expect(game.seat).toBe(1);
    game = applyGroupMove(game, 1, 2);
    expect(game.seat).toBe(0);
    expect(currentMark(game)).toBe('x');

  });

  it('2x2: quem sai na própria vez passa a vez para o parceiro', () => {

    const game = skipLeftSeat({ ...createGroupGame('duo', 4), seat: 3, activeBoard: 6 });

    expect(game.out).toEqual([false, false, false, true]);
    expect(game.seat).toBe(1);
    expect(currentMark(game)).toBe('o');
    expect(game.activeBoard).toBe(6);

  });

  it('2x2: a dupla só perde quando os dois estão fora', () => {

    const game = skipLeftSeat({ ...createGroupGame('duo', 4), seat: 3, out: [false, true, false, false] });

    expect(game.winner).toBe('x');
    expect(wonByElimination(game)).toBe(true);

  });

  it('Champs: no 4º tempo esgotado, o jogador é eliminado e a vez pula ele', () => {

    let game = passGroupTurn({ ...createGroupGame('champs', 3), seat: 1, timeouts: [0, MAX_TIMEOUTS, 0] });

    expect(game.out).toEqual([false, true, false]);
    expect(game.winner).toBeNull();
    expect(game.seat).toBe(2);

    game = applyGroupMove(game, 0, 0);

    expect(game.seat).toBe(0);

  });

  it('Champs: quando sobra um só, ele vence', () => {

    const game = skipLeftSeat({ ...createGroupGame('champs', 3), seat: 2, out: [false, true, false] });

    expect(game.winner).toBe('x');
    expect(wonByElimination(game)).toBe(true);

  });

});
