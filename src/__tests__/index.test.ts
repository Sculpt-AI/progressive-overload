import { describe, it, expect } from 'vitest';
import { runE1RMBatch, setE1RM, nextPrescription, runBatch, GOAL_TARGETS } from '../index';

describe('public barrel', () => {
  it('re-exports the engine functions and constants', () => {
    expect(typeof setE1RM).toBe('function');
    expect(typeof nextPrescription).toBe('function');
    expect(typeof runBatch).toBe('function');
    expect(GOAL_TARGETS.HYPERTROPHY.low).toBe(8);
  });

  it('runE1RMBatch echoes ids, zeroes empty sets, and matches setE1RM', () => {
    const out = runE1RMBatch([
      { id: 'a', weight: 100, reps: 8, rir: 2 },
      { id: 'b', weight: 0, reps: 0, rir: null },
    ]);
    expect(out.map((r) => r.id)).toEqual(['a', 'b']);
    expect(out[0].e1rm).toBe(setE1RM(100, 8, 2));
    expect(out[1].e1rm).toBe(0);
  });
});
