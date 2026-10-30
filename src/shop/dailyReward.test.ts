import { describe, expect, it } from 'vitest';
import { claimReward, DAILY_REWARDS, rewardInfo, type LoginState } from './dailyReward';

const NEVER: LoginState = { last: null, day: 0, streak: 0 };

const day = (d: number, hour = 12) => new Date(2026, 9, d, hour);

describe('recompensa diária', () => {

  it('primeira vez: dia 1', () => {

    expect(rewardInfo(NEVER, day(30))).toMatchObject({ claimed: false, day: 1, coins: DAILY_REWARDS[0], streak: 1 });

  });

  it('não paga duas vezes no mesmo dia', () => {

    const claimed = claimReward(NEVER, day(30, 9))!;

    expect(claimReward(claimed, day(30, 23))).toBeNull();
    expect(rewardInfo(claimed, day(30, 23))).toMatchObject({ claimed: true, day: 1, tomorrow: DAILY_REWARDS[1] });

  });

  it('dias seguidos avançam e recomeçam depois do dia 7', () => {

    let state = NEVER;

    for (let d = 1; d <= 8; d++) state = claimReward(state, day(d))!;

    expect(state).toMatchObject({ day: 1, streak: 8 });

  });

  it('pular um dia volta para o dia 1', () => {

    let state = claimReward(NEVER, day(1))!;
    state = claimReward(state, day(2))!;
    state = claimReward(state, day(4))!;

    expect(state).toMatchObject({ day: 1, streak: 1 });

  });

  it('vale a virada de mês', () => {

    const lastDayOfOctober = claimReward(NEVER, new Date(2026, 9, 31))!;

    expect(rewardInfo(lastDayOfOctober, new Date(2026, 10, 1))).toMatchObject({ day: 2, streak: 2 });

  });

});
