import { describe, it, expect } from 'vitest';
import { runBatch, BatchItem } from '../batch';

describe('runBatch', () => {
  it('maps each item and echoes exerciseId, order preserved', () => {
    const items: BatchItem[] = [
      { exerciseId: 'a', progressionType: 'LoadRep', pr1RM: 135, capacity1RM: 135, prescribedWeight: 100, goal: 'HYPERTROPHY', roundIncrement: 2.5, displayUnit: 'imperial', best: { weight: 100, reps: 10 }, rir: 2, missStreak: 0 },
      { exerciseId: 'b', progressionType: 'LoadRep', pr1RM: 147, capacity1RM: 147, prescribedWeight: 110, goal: 'HYPERTROPHY', roundIncrement: 2.5, displayUnit: 'imperial', best: { weight: 80, reps: 8 }, rir: 5, missStreak: 0 },
    ];
    const out = runBatch(items);
    expect(out.map(r => r.exerciseId)).toEqual(['a', 'b']);
    expect(out[0].action).toBe('NEW_PR');
    expect(out[1].action).toBe('HOLD');
  });
});
