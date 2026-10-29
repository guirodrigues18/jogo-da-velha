import { describe, expect, it } from 'vitest';
import {
  applyMove,
  createGame,
  getWinningLine,
  passTurn,
  type Cell,
  type GameState,
  type MiniBoard
} from './logic';

// Mini-tabuleiro cheio sem nenhuma linha: x o x / x o o / o x x
const DRAW_CELLS: Cell[] = ['x', 'o', 'x', 'x', 'o', 'o', 'o', 'x', 'x'];

/** Cria um estado a partir do inicial, sobrescrevendo campos e tabuleiros específicos */
function buildState(
  overrides: Partial<GameState>,
  boards: Record<number, Partial<MiniBoard>> = {}
): GameState {

  const state = { ...createGame(), ...overrides };

  state.boards = state.boards.map((board, i) => ({ ...board, ...boards[i] }));

  return state;

}

describe('createGame', () => {

  it('começa com X, tabuleiro livre e sem vencedor', () => {

    const game = createGame();

    expect(game.currentPlayer).toBe('x');
    expect(game.activeBoard).toBeNull();
    expect(game.winner).toBeNull();
    expect(game.boards).toHaveLength(9);
    expect(game.boards.every(b => b.cells.every(c => c === null))).toBe(true);

  });

});

describe('applyMove', () => {

  it('marca a célula, troca o jogador e define o próximo tabuleiro', () => {

    const game = applyMove(createGame(), 4, 7);

    expect(game.boards[4].cells[7]).toBe('x');
    expect(game.currentPlayer).toBe('o');
    expect(game.activeBoard).toBe(7);
    expect(game.turn).toBe(1);

  });

  it('não altera o estado original', () => {

    const initial = createGame();

    applyMove(initial, 0, 0);

    expect(initial.boards[0].cells[0]).toBeNull();

  });

  it('ignora jogada fora do tabuleiro obrigatório', () => {

    const game = applyMove(createGame(), 0, 3);

    expect(applyMove(game, 5, 0)).toBe(game);

  });

  it('ignora jogada em célula ocupada', () => {

    const game = buildState({ activeBoard: 0 }, { 0: { cells: ['o', ...Array(8).fill(null)] } });

    expect(applyMove(game, 0, 0)).toBe(game);

  });

  it('ignora jogada em mini-tabuleiro fechado', () => {

    const game = buildState({}, { 2: { winner: 'o' } });

    expect(applyMove(game, 2, 0)).toBe(game);

  });

  it('fecha o mini-tabuleiro quando alguém completa uma linha', () => {

    const game = buildState(
      { activeBoard: 0 },
      { 0: { cells: ['x', 'x', null, 'o', 'o', null, null, null, null] } }
    );

    const next = applyMove(game, 0, 2);

    expect(next.boards[0].winner).toBe('x');
    expect(next.winner).toBeNull();

  });

  it('marca empate no mini-tabuleiro cheio sem linha', () => {

    const game = buildState({ activeBoard: 0 }, { 0: { cells: [...DRAW_CELLS.slice(0, 8), null] } });

    expect(applyMove(game, 0, 8).boards[0].winner).toBe('draw');

  });

  it('libera qualquer tabuleiro quando o destino já está fechado', () => {

    const game = buildState({}, { 4: { winner: 'o' } });

    expect(applyMove(game, 0, 4).activeBoard).toBeNull();

  });

  it('declara vencedor ao fechar uma linha no tabuleiro principal', () => {

    const game = buildState(
      { activeBoard: 2 },
      {
        0: { winner: 'x' },
        1: { winner: 'x' },
        2: { cells: ['x', 'x', null, 'o', 'o', null, null, null, null] }
      }
    );

    const next = applyMove(game, 2, 2);

    expect(next.winner).toBe('x');
    expect(next.activeBoard).toBeNull();

  });

  it('declara empate geral quando todos os tabuleiros fecham sem linha', () => {

    const winners = DRAW_CELLS.slice(0, 8).map(winner => ({ winner }));

    const game = buildState(
      { activeBoard: 8 },
      { ...winners, 8: { cells: [...DRAW_CELLS.slice(0, 8), null] } }
    );

    expect(applyMove(game, 8, 8).winner).toBe('draw');

  });

  it('ignora jogadas depois do fim do jogo', () => {

    const game = buildState({ winner: 'x' });

    expect(applyMove(game, 0, 0)).toBe(game);

  });

});

describe('passTurn', () => {

  it('passa a vez ao adversário mantendo o tabuleiro obrigatório', () => {

    const game = passTurn(buildState({ activeBoard: 3, turn: 5 }));

    expect(game.currentPlayer).toBe('o');
    expect(game.activeBoard).toBe(3);
    expect(game.turn).toBe(6);

  });

  it('não faz nada depois do fim do jogo', () => {

    const game = buildState({ winner: 'x' });

    expect(passTurn(game)).toBe(game);

  });

});

describe('getWinningLine', () => {

  it('retorna os mini-tabuleiros da linha vencedora', () => {

    const game = buildState({}, { 2: { winner: 'o' }, 4: { winner: 'o' }, 6: { winner: 'o' } });

    expect(getWinningLine(game.boards)).toEqual([2, 4, 6]);

  });

  it('não considera empates como linha', () => {

    const game = buildState({}, { 0: { winner: 'draw' }, 1: { winner: 'draw' }, 2: { winner: 'draw' } });

    expect(getWinningLine(game.boards)).toBeNull();

  });

});
