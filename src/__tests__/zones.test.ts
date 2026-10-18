import { describe, it, expect } from 'vitest';
import { GOAL_TARGETS } from '../zones';

describe('GOAL_TARGETS', () => {
  it('prescribes a fixed set count and rep range per goal', () => {
    expect(GOAL_TARGETS.STRENGTH).toMatchObject({ sets: 4, low: 4, high: 6, rpe: 8 });
    expect(GOAL_TARGETS.HYPERTROPHY).toMatchObject({ sets: 3, low: 8, high: 12, rpe: 8 });
    expect(GOAL_TARGETS.ENDURANCE).toMatchObject({ sets: 3, low: 12, high: 15, rpe: 8 });
  });
  it('computes the load percentage for the low end of the range', () => {
    expect(GOAL_TARGETS.STRENGTH.pct).toBeCloseTo(0.837, 3);
    expect(GOAL_TARGETS.HYPERTROPHY.pct).toBeCloseTo(0.739, 3);
    expect(GOAL_TARGETS.ENDURANCE.pct).toBeCloseTo(0.626, 3);
  });
});
