import { describe, expect, it } from 'vitest';
import { chooseMove, type Difficulty } from './ai';
import { applyMove, createGame, getValidMoves, type GameState } from './logic';

const LEVELS: Difficulty[] = ['easy', 'medium', 'hard'];

/** X tem os tabuleiros 0 e 1 e falta uma célula para fechar o tabuleiro 2 (e a partida) */
function almostWon(): GameState {

  const game = createGame();

  game.boards[0] = { ...game.boards[0], winner: 'x' };
  game.boards[1] = { ...game.boards[1], winner: 'x' };
  game.boards[2] = { cells: ['x', 'x', null, 'o', 'o', null, null, null, null], winner: null };

  return { ...game, activeBoard: 2 };

}

describe('chooseMove', () => {

  it.each(LEVELS)('sempre devolve uma jogada válida (%s)', level => {

    let game = createGame();

    // Algumas jogadas para sair do estado inicial
    for (let i = 0; i < 6; i++) game = applyMove(game, ...chooseMove(game, 'easy'));

    const move = chooseMove(game, level, 50);
    const valid = getValidMoves(game).map(m => m.join(','));

    expect(valid).toContain(move.join(','));

  });

  it.each(LEVELS)('aproveita a vitória imediata da partida (%s)', level => {

    expect(chooseMove(almostWon(), level, 50)).toEqual([2, 2]);

  });

  it('no médio, bloqueia o adversário que fecharia o mini-tabuleiro', () => {

    const game = createGame();

    // Vez do O, obrigado no tabuleiro 4, onde X ameaça fechar a coluna do meio
    game.boards[4] = { cells: [null, 'x', null, null, 'x', null, null, null, null], winner: null };

    const move = chooseMove({ ...game, currentPlayer: 'o', activeBoard: 4, turn: 2 }, 'medium');

    expect(move).toEqual([4, 7]);

  });

});

describe('getValidMoves', () => {

  it('lista as 81 células no início e só o tabuleiro obrigatório depois', () => {

    expect(getValidMoves(createGame())).toHaveLength(81);

    const game = applyMove(createGame(), 0, 4);

    expect(getValidMoves(game).every(([board]) => board === 4)).toBe(true);
    expect(getValidMoves(game)).toHaveLength(9);

  });

});
