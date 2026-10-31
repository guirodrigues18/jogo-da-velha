import { describe, expect, it } from 'vitest';
import { applyRecord, emptyStats, recordFromGame, type GameRecord } from './achievements';
import { createGame } from '../game/logic';

const WIN: GameRecord = { mode: 'ai', difficulty: 'easy', result: 'win', boardsWon: 3, boardsLost: 1, moves: 40 };

const ids = (record: GameRecord, stats = emptyStats()) => applyRecord(stats, record).unlocked.map(a => a.id);

describe('applyRecord', () => {

  it('conta vitórias e sequência', () => {

    let stats = emptyStats();

    stats = applyRecord(stats, WIN).stats;
    stats = applyRecord(stats, WIN).stats;
    stats = applyRecord(stats, { ...WIN, result: 'loss' }).stats;

    expect(stats).toMatchObject({ played: 3, wins: 2, losses: 1, streak: 0, bestStreak: 2 });

  });

  it('soma XP só nas vitórias online e contra a IA', () => {

    let stats = emptyStats();

    stats = applyRecord(stats, { ...WIN, mode: 'online', difficulty: undefined }).stats;
    stats = applyRecord(stats, { ...WIN, difficulty: 'hard' }).stats;
    stats = applyRecord(stats, { ...WIN, difficulty: 'medium' }).stats;
    stats = applyRecord(stats, WIN).stats;
    stats = applyRecord(stats, { ...WIN, difficulty: 'hard', result: 'loss' }).stats;
    stats = applyRecord(stats, { ...WIN, mode: 'online', difficulty: undefined, result: 'draw' }).stats;
    stats = applyRecord(stats, { ...WIN, mode: 'daily', difficulty: undefined }).stats;

    expect(stats.xp).toBe(10 + 6 + 3 + 1);

  });

  it('desbloqueia primeira vitória e a do nível do computador', () => {

    expect(ids(WIN)).toEqual(['first-win', 'beat-easy']);

  });

  it('não desbloqueia a mesma conquista duas vezes', () => {

    const { stats } = applyRecord(emptyStats(), WIN);

    expect(ids(WIN, stats)).toEqual([]);

  });

  it('vitória online, intocável, relâmpago e conquistador', () => {

    const record: GameRecord = { mode: 'online', result: 'win', boardsWon: 5, boardsLost: 0, moves: 28 };

    expect(ids(record)).toEqual(['first-win', 'online-win', 'flawless', 'quick', 'conqueror']);

  });

  it('sequência de 3 vitórias', () => {

    const stats = { ...emptyStats(), streak: 2, unlocked: { 'first-win': 1, 'beat-easy': 1 } };

    expect(ids(WIN, stats)).toContain('streak-3');

  });

  it('derrota não desbloqueia conquistas de vitória', () => {

    expect(ids({ ...WIN, result: 'loss', boardsWon: 1 })).toEqual([]);

  });

});

describe('recordFromGame', () => {

  it('resume a partida do ponto de vista do jogador', () => {

    const game = createGame();

    game.boards[0] = { ...game.boards[0], winner: 'x' };
    game.boards[1] = { ...game.boards[1], winner: 'o' };
    game.boards[2] = { cells: ['x', 'o', ...Array(7).fill(null)], winner: null };

    const record = recordFromGame({ ...game, winner: 'o' }, 'o', 'online');

    expect(record).toEqual({ mode: 'online', difficulty: undefined, result: 'win', boardsWon: 1, boardsLost: 1, moves: 2, symbol: 'o' });

  });

});
