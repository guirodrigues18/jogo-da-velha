import { describe, expect, it } from 'vitest';
import { applyMove, createGame } from '../game/logic';
import { decodeState, encodeState } from './serialization';

describe('serialization', () => {

  it('codifica o estado inicial em strings compactas', () => {

    const stored = encodeState(createGame());

    expect(stored.cells).toBe('-'.repeat(81));
    expect(stored.results).toBe('-'.repeat(9));
    expect(stored.activeBoard).toBe(-1);
    expect(stored.winner).toBe('-');

  });

  it('preserva o estado ao codificar e decodificar', () => {

    let game = createGame();

    // Partida real: X conquista o tabuleiro 4 e O joga no tabuleiro 2
    for (const [board, cell] of [[4, 0], [0, 4], [4, 1], [1, 4], [4, 2], [2, 0]]) {
      game = applyMove(game, board, cell);
    }

    expect(decodeState(encodeState(game))).toEqual(game);

  });

  it('representa empates com "d"', () => {

    const game = createGame();

    game.boards[3] = { ...game.boards[3], winner: 'draw' };

    const stored = encodeState({ ...game, winner: 'draw' });

    expect(stored.results[3]).toBe('d');
    expect(stored.winner).toBe('d');
    expect(decodeState(stored).boards[3].winner).toBe('draw');

  });

});
