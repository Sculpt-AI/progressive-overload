import { describe, it, expect } from 'vitest';
import { nextPrescription, PrescriptionInput } from '../nextPrescription';

const base = (over: Partial<PrescriptionInput>): PrescriptionInput => ({
  progressionType: 'LoadRep',
  pr1RM: 147, capacity1RM: 147, prescribedWeight: 110,
  goal: 'HYPERTROPHY', roundIncrement: 2.5, displayUnit: 'metric', best: null, rir: null, missStreak: 0, ...over,
});
const near = (a: number | null, b: number, tol = 0.3) => { expect(a).not.toBeNull(); expect(Math.abs((a as number) - b)).toBeLessThanOrEqual(tol); };

describe('nextPrescription §9a', () => {
  it('row1 on-target HOLD (EPS guards phantom PR)', () => {
    const r = nextPrescription(base({ capacity1RM: 135, pr1RM: 135, prescribedWeight: 100, best: { weight: 100, reps: 8 }, rir: 2 }));
    expect(r.action).toBe('HOLD'); near(r.capacity1RM, 135); near(r.pr1RM, 135);
  });
  it('row2 more reps → NEW_PR', () => {
    const r = nextPrescription(base({ capacity1RM: 135, pr1RM: 135, prescribedWeight: 100, best: { weight: 100, reps: 10 }, rir: 2 }));
    expect(r.action).toBe('NEW_PR'); near(r.capacity1RM, 147.1);
  });
  it('row3 easy light day HOLD (not tested)', () => {
    const r = nextPrescription(base({ best: { weight: 80, reps: 8 }, rir: 5 }));
    expect(r.action).toBe('HOLD'); near(r.capacity1RM, 147);
  });
  it('row4 genuine grind-miss at weight (first miss) → HOLD, missStreak 1, capacity unchanged', () => {
    const r = nextPrescription(base({ best: { weight: 110, reps: 6 }, rir: 0 }));
    expect(r.action).toBe('HOLD'); near(r.capacity1RM, 147); near(r.pr1RM, 147); expect(r.missStreak).toBe(1);
  });
  it('row4b genuine grind-miss at weight (second miss) → EASE_READINESS, missStreak reset to 0', () => {
    const r = nextPrescription(base({ best: { weight: 110, reps: 6 }, rir: 0, missStreak: 1 }));
    expect(r.action).toBe('EASE_READINESS'); near(r.capacity1RM, 131.4); near(r.pr1RM, 147); expect(r.missStreak).toBe(0);
  });
  it('row4c genuine miss → RAISE resets missStreak to 0', () => {
    const r = nextPrescription(base({ best: { weight: 120, reps: 10 }, rir: 1, missStreak: 1 }));
    expect(r.action).toBe('NEW_PR'); expect(r.missStreak).toBe(0);
  });
  it('row6 genuine but light (not tested) HOLD', () => {
    const r = nextPrescription(base({ best: { weight: 70, reps: 8 }, rir: 2 }));
    expect(r.action).toBe('HOLD'); near(r.capacity1RM, 147);
  });
  it('row8 no-RIR heavier tested → NEW_PR', () => {
    const r = nextPrescription(base({ best: { weight: 120, reps: 8 }, rir: null }));
    expect(r.action).toBe('NEW_PR'); near(r.capacity1RM, 152.0);
  });
  it('row9 no-RIR miss at weight (first miss) → HOLD, missStreak 1', () => {
    const r = nextPrescription(base({ best: { weight: 110, reps: 5 }, rir: null }));
    expect(r.action).toBe('HOLD'); near(r.capacity1RM, 147); expect(r.missStreak).toBe(1);
  });
  it('row9b no-RIR miss at weight (second miss) → EASE_READINESS (Brzycki)', () => {
    const r = nextPrescription(base({ best: { weight: 110, reps: 5 }, rir: null, missStreak: 1 }));
    expect(r.action).toBe('EASE_READINESS'); near(r.capacity1RM, 123.75); expect(r.missStreak).toBe(0);
  });
  it('no-RIR miss counts only below the range low', () => {
    const strength = (reps: number) => nextPrescription(base({ goal: 'STRENGTH', best: { weight: 110, reps }, rir: null }));
    expect(strength(4).missStreak).toBe(0);
    expect(strength(3).missStreak).toBe(1);
  });
  it('row10 no-RIR tested but reps≥target → HOLD', () => {
    const r = nextPrescription(base({ best: { weight: 100, reps: 8 }, rir: null }));
    expect(r.action).toBe('HOLD'); near(r.capacity1RM, 147);
  });
  it('row11 cold start seeds from pr', () => {
    const r = nextPrescription(base({ capacity1RM: null, pr1RM: 180, best: { weight: 100, reps: 8 }, rir: 2 }));
    expect(r.action).toBe('SEED'); near(r.capacity1RM, 180); near(r.pr1RM, 180);
  });
  it('row13 no working set → HOLD_NO_DATA', () => {
    const r = nextPrescription(base({ best: null }));
    expect(r.action).toBe('HOLD_NO_DATA'); expect(r.prescribedWeight).toBe(110);
  });
  it('row14 STR on-target → HOLD (not PR)', () => {
    const r = nextPrescription(base({ goal: 'STRENGTH', capacity1RM: 150, pr1RM: 150, prescribedWeight: 130, best: { weight: 130, reps: 3 }, rir: 2 }));
    expect(r.action).toBe('HOLD'); near(r.capacity1RM, 150);
  });
  it('row15 END >12 honors RIR → NEW_PR', () => {
    const r = nextPrescription(base({ goal: 'ENDURANCE', capacity1RM: 100, pr1RM: 100, prescribedWeight: 65, best: { weight: 65, reps: 15 }, rir: 3 }));
    expect(r.action).toBe('NEW_PR'); near(r.capacity1RM, 108.5);
  });
  it('row17 grossly mis-logged set is ignored (not inflated to +20% and stuck)', () => {
    const r = nextPrescription(base({ capacity1RM: 100, pr1RM: 100, prescribedWeight: 74, best: { weight: 300, reps: 8 }, rir: 2 }));
    expect(r.action).toBe('IGNORED_OUTLIER'); near(r.capacity1RM, 100); expect(r.pr1RM).toBe(100);
  });
  it('row5a RIR-underperformance at target reps (first miss) → HOLD, missStreak 1, capacity unchanged', () => {
    const r = nextPrescription(base({ capacity1RM: 140, pr1RM: 140, prescribedWeight: 105, best: { weight: 100, reps: 8 }, rir: 0 }));
    expect(r.action).toBe('HOLD'); near(r.capacity1RM, 140); near(r.pr1RM, 140); expect(r.missStreak).toBe(1);
  });
  it('row5b RIR-underperformance at target reps (second miss) → EASE_READINESS, missStreak reset to 0', () => {
    const r = nextPrescription(base({ capacity1RM: 140, pr1RM: 140, prescribedWeight: 105, best: { weight: 100, reps: 8 }, rir: 0, missStreak: 1 }));
    expect(r.action).toBe('EASE_READINESS');
    near(r.capacity1RM, 127.23);
    near(r.pr1RM, 140);
    expect(r.missStreak).toBe(0);
  });
});

describe('invariants §9d', () => {
  it('EASE clamps to the −20% floor in one session', () => {
    const r = nextPrescription(base({ capacity1RM: 100, pr1RM: 100, prescribedWeight: 80, best: { weight: 72, reps: 1 }, rir: 0, missStreak: 1 }));
    expect(r.action).toBe('EASE_READINESS');
    near(r.capacity1RM, 80);
  });
  it('pr1RM never decreases', () => {
    const r = nextPrescription(base({ capacity1RM: 147, pr1RM: 160, best: { weight: 110, reps: 6 }, rir: 0, missStreak: 1 }));
    expect(r.pr1RM).toBe(160);
  });
  it('non-LoadRep passes through unchanged', () => {
    const r = nextPrescription(base({ progressionType: 'Duration', best: { weight: 0, reps: 0 } }));
    expect(r.action).toBe('PASSTHROUGH'); expect(r.prescribedWeight).toBe(110);
  });
  it('round-to-nearest prescription (metric)', () => {
    const r = nextPrescription(base({ displayUnit: 'metric', capacity1RM: 135, pr1RM: 135, prescribedWeight: 100, best: { weight: 100, reps: 8 }, rir: 2 }));
    expect(r.prescribedWeight).toBe(100);
  });
  it('rounds to a clean lb plate for imperial, stores kg', () => {
    const r = nextPrescription(base({ displayUnit: 'imperial', capacity1RM: 135, pr1RM: 135, prescribedWeight: 100, best: { weight: 100, reps: 8 }, rir: 2 }));
    near(r.prescribedWeight, 99.79);
    near(r.prescribedWeight * 2.20462, 220, 0.05);
  });
  it('RAISE: capacity rises toward an existing higher PR without setting a new PR', () => {
    const r = nextPrescription(base({ capacity1RM: 100, pr1RM: 160, best: { weight: 110, reps: 10 }, rir: 1 }));
    expect(r.action).toBe('RAISE');
    near(r.capacity1RM, 120);
    expect(r.pr1RM).toBe(160);
  });
  it('cold start with no working set stays unseeded (null), never pinned to 0', () => {
    const r = nextPrescription(base({ capacity1RM: null, pr1RM: null, best: null }));
    expect(r.action).toBe('HOLD_NO_DATA');
    expect(r.capacity1RM).toBeNull();
    expect(r.pr1RM).toBeNull();
  });
});

describe('nextPrescription outlier containment (RAISE ceiling)', () => {
  it('ignores an implausible trusted reading (>50% over capacity), leaving capacity & PR unchanged', () => {
    const r = nextPrescription(base({ capacity1RM: 147, pr1RM: 147, prescribedWeight: 110, missStreak: 1, best: { weight: 1100, reps: 8 }, rir: 2 }));
    expect(r.action).toBe('IGNORED_OUTLIER');
    near(r.capacity1RM, 147);
    expect(r.pr1RM).toBe(147);
    expect(r.missStreak).toBe(1);
  });

  it('still RAISEs a believable big PR that sits within the ceiling', () => {
    const r = nextPrescription(base({ capacity1RM: 100, pr1RM: 160, best: { weight: 110, reps: 10 }, rir: 1 }));
    expect(r.action).toBe('RAISE');
    near(r.capacity1RM, 120);
  });

  it('garbage session does NOT inflate capacity, so the next normal session is not stuck (the monotonic-PR trap)', () => {
    const garbage = nextPrescription(base({ capacity1RM: 100, pr1RM: 100, prescribedWeight: 74, best: { weight: 1000, reps: 8 }, rir: 2 }));
    expect(garbage.action).toBe('IGNORED_OUTLIER');
    near(garbage.capacity1RM, 100);
    expect(garbage.pr1RM).toBe(100);

    const normal = nextPrescription(base({
      capacity1RM: garbage.capacity1RM, pr1RM: garbage.pr1RM, prescribedWeight: garbage.prescribedWeight,
      best: { weight: 74, reps: 8 }, rir: 2,
    }));
    expect(normal.action).toBe('HOLD');
    near(normal.capacity1RM, 100);
  });
});
