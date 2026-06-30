import { describe, it, expect } from 'vitest';
import { setE1RM, brzycki, epley, pctForTarget, E1RM_REP_CAP } from '../rpe_progression';

const approx = (a: number, b: number, tol = 0.2) => Math.abs(a - b) <= tol;

describe('estimator formulas', () => {
  it('brzycki ≤5 reps', () => {
    expect(approx(brzycki(110, 5), 123.75)).toBe(true);
  });
  it('epley ≥6 reps', () => {
    expect(approx(epley(100, 6), 120)).toBe(true);
    expect(approx(epley(100, 12), 140)).toBe(true);
  });
});

describe('setE1RM with RIR (table)', () => {
  it('reads via table', () => {
    expect(approx(setE1RM(100, 8, 2), 135.3)).toBe(true);
    expect(approx(setE1RM(100, 10, 2), 147.1)).toBe(true);
    expect(approx(setE1RM(110, 6, 0), 131.4)).toBe(true);
  });
  it('clamps RPE to [6,10] (RIR 5 → RPE6)', () => {
    expect(approx(setE1RM(80, 8, 5), 117.6)).toBe(true);
  });
  it('clamps reps>12 to 12 when RIR present (honors RIR)', () => {
    expect(approx(setE1RM(65, 15, 3), 108.5)).toBe(true);
    expect(approx(setE1RM(90, 15, 2), 143.8)).toBe(true);
  });
});

describe('setE1RM without RIR (monotonic formulas)', () => {
  it('≤5 reps uses Brzycki', () => {
    expect(approx(setE1RM(110, 5, null), 123.75)).toBe(true);
  });
  it('≥6 reps uses Epley', () => {
    expect(approx(setE1RM(120, 8, null), 152.0)).toBe(true);
  });
  it('is non-decreasing in reps across the whole no-RIR domain', () => {
    for (let r = 1; r < 14; r++) {
      expect(setE1RM(100, r + 1, null)).toBeGreaterThanOrEqual(setE1RM(100, r, null));
    }
    expect(approx(setE1RM(100, 5, null), 112.5)).toBe(true);
    expect(approx(setE1RM(100, 6, null), 120.0)).toBe(true);
    expect(approx(setE1RM(100, 12, null), 140.0)).toBe(true);
  });
});

describe('setE1RM rep cap (outlier containment)', () => {
  it('clamps reps beyond E1RM_REP_CAP on the no-RIR path', () => {
    expect(E1RM_REP_CAP).toBe(12);
    expect(setE1RM(100, 13, null)).toBe(setE1RM(100, 12, null));
    expect(setE1RM(100, 50, null)).toBe(setE1RM(100, 12, null));
  });
  it('neutralizes the 225-rep corruption (no-RIR): 5kg x 225 ~= epley(5,12), not 42.5', () => {
    expect(approx(setE1RM(5, 225, null), epley(5, 12), 0.01)).toBe(true);
    expect(setE1RM(5, 225, null)).toBeLessThan(8);
  });
  it('the RIR path was already capped; outlier reps stay bounded there too', () => {
    expect(setE1RM(5, 225, 0)).toBe(setE1RM(5, 12, 0));
    expect(setE1RM(5, 225, 0)).toBeLessThan(8);
  });
  it('leaves legit working sets untouched', () => {
    expect(approx(setE1RM(100, 8, 2), 135.3)).toBe(true);
    expect(approx(setE1RM(120, 8, null), 152.0)).toBe(true);
  });
});

describe('pctForTarget', () => {
  it('table for ≤12 reps', () => {
    expect(approx(pctForTarget(3, 8), 0.863, 0.001)).toBe(true);
    expect(approx(pctForTarget(8, 8), 0.739, 0.001)).toBe(true);
  });
  it('Epley-extended for >12 reps', () => {
    expect(approx(pctForTarget(15, 8), 0.6667, 0.001)).toBe(true);
  });
});
