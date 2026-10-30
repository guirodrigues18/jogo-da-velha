import { describe, expect, it } from 'vitest';
import {
  allDone,
  applyMissionEvent,
  findMission,
  missionsForDate,
  swapMission,
  TIERS,
  type MissionState
} from './missions';
import type { GameRecord } from './achievements';

const WIN: GameRecord = { mode: 'ai', difficulty: 'medium', result: 'win', boardsWon: 3, boardsLost: 1, moves: 50, symbol: 'x' };
const LOSS: GameRecord = { ...WIN, result: 'loss', boardsWon: 1, boardsLost: 3 };

const game = (record: GameRecord) => ({ kind: 'game', record }) as const;

function withMissions(ids: MissionState['ids']): MissionState {

  return { date: '2026-10-30', ids, progress: {}, swapped: false };

}

describe('missionsForDate', () => {

  it('sorteia uma missão de cada nível, igual para a mesma data', () => {

    const day = missionsForDate(new Date(2026, 9, 30));

    expect(day.ids.map(id => findMission(id).tier)).toEqual(TIERS);
    expect(missionsForDate(new Date(2026, 9, 30, 18)).ids).toEqual(day.ids);

  });

  it('muda as missões ao longo dos dias', () => {

    const days = Array.from({ length: 10 }, (_, i) => missionsForDate(new Date(2026, 10, i + 1)).ids.join());

    expect(new Set(days).size).toBeGreaterThan(1);

  });

});

describe('applyMissionEvent', () => {

  it('soma o progresso e conclui ao atingir a meta', () => {

    let state = withMissions(['play-2', 'win-3', 'win-5']);

    ({ state } = applyMissionEvent(state, game(WIN)));
    expect(state.progress).toEqual({ 'play-2': 1, 'win-3': 1, 'win-5': 1 });

    const result = applyMissionEvent(state, game(LOSS));

    expect(result.completed.map(m => m.id)).toEqual(['play-2']);
    expect(result.state.progress['play-2']).toBe(2);
    expect(result.state.progress['win-3']).toBe(1);

  });

  it('conta mini-tabuleiros conquistados sem passar da meta', () => {

    const { state, completed } = applyMissionEvent(withMissions(['boards-5']), game({ ...WIN, boardsWon: 7 }));

    expect(state.progress['boards-5']).toBe(5);
    expect(completed.map(m => m.id)).toEqual(['boards-5']);

  });

  it('zera vitórias seguidas numa derrota', () => {

    let state = withMissions(['streak-3']);

    ({ state } = applyMissionEvent(state, game(WIN)));
    ({ state } = applyMissionEvent(state, game(WIN)));
    ({ state } = applyMissionEvent(state, game(LOSS)));

    expect(state.progress['streak-3']).toBe(0);

  });

  it('reações e compartilhamentos só contam nas missões deles', () => {

    const state = withMissions(['react-3', 'share', 'win-1']);

    expect(applyMissionEvent(state, { kind: 'reaction' }).state.progress).toEqual({ 'react-3': 1 });
    expect(applyMissionEvent(state, { kind: 'share' }).completed.map(m => m.id)).toEqual(['share']);

  });

  it('respeita o modo, o nível e o símbolo', () => {

    const state = withMissions(['win-hard', 'win-as-o', 'daily-win']);

    expect(applyMissionEvent(state, game(WIN)).completed).toEqual([]);
    expect(applyMissionEvent(state, game({ ...WIN, difficulty: 'hard' })).completed.map(m => m.id)).toEqual(['win-hard']);
    expect(applyMissionEvent(state, game({ ...WIN, symbol: 'o' })).completed.map(m => m.id)).toEqual(['win-as-o']);
    expect(applyMissionEvent(state, game({ ...WIN, mode: 'daily', difficulty: undefined })).completed.map(m => m.id)).toEqual(['daily-win']);

  });

  it('devolve o mesmo estado quando nada muda e detecta todas concluídas', () => {

    const state = withMissions(['win-1', 'share', 'win-online']);

    expect(applyMissionEvent(state, game(LOSS)).state).toBe(state);

    const done = { ...state, progress: { 'win-1': 1, share: 1, 'win-online': 1 } };

    expect(allDone(done)).toBe(true);
    expect(allDone(state)).toBe(false);

  });

});

describe('swapMission', () => {

  it('troca por outra do mesmo nível uma vez por dia', () => {

    const state = withMissions(['play-2', 'win-3', 'win-hard']);
    const swapped = swapMission(state, 'win-hard', () => 0)!;

    expect(swapped.ids[2]).not.toBe('win-hard');
    expect(findMission(swapped.ids[2]).tier).toBe('hard');
    expect(swapped.swapped).toBe(true);
    expect(swapMission(swapped, 'play-2')).toBeNull();

  });

  it('não troca missão concluída', () => {

    const state = { ...withMissions(['play-2', 'win-3', 'win-hard']), progress: { 'play-2': 2 } };

    expect(swapMission(state, 'play-2')).toBeNull();

  });

});
