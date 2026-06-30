import { describe, it, expect } from 'vitest';
import { GOAL_TARGETS } from '../zones';

describe('GOAL_TARGETS', () => {
  it('matches the spec §4.4 targets', () => {
    expect(GOAL_TARGETS.STRENGTH.reps).toBe(3);
    expect(Math.abs(GOAL_TARGETS.STRENGTH.pct - 0.863)).toBeLessThan(0.001);
    expect(GOAL_TARGETS.HYPERTROPHY.reps).toBe(8);
    expect(Math.abs(GOAL_TARGETS.HYPERTROPHY.pct - 0.739)).toBeLessThan(0.001);
    expect(GOAL_TARGETS.ENDURANCE.reps).toBe(15);
    expect(Math.abs(GOAL_TARGETS.ENDURANCE.pct - 0.6667)).toBeLessThan(0.001);
  });
});
