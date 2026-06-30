import { TrainingGoal, GOAL_TARGETS } from './zones';
import { setE1RM } from './rpe_progression';

export type ProgressionType = 'LoadRep' | 'Duration' | 'Distance' | 'Bodyweight';
export interface BestSet { weight: number; reps: number; }

export interface PrescriptionInput {
  progressionType: ProgressionType;
  pr1RM: number | null;
  capacity1RM: number | null;
  prescribedWeight: number;
  goal: TrainingGoal;
  roundIncrement: number;
  displayUnit: 'imperial' | 'metric';
  best: BestSet | null;
  rir: number | null;
  missStreak: number;
}
export interface PrescriptionResult {
  pr1RM: number | null;
  capacity1RM: number | null;
  prescribedWeight: number;
  action: string;
  missStreak: number;
}

export const TESTED_BAND = 0.9;
export const GENUINE_RIR = 2;
export const PR_TRUST_RIR = 3;
export const EPS = 0.015;
export const MAX_STEP = 0.2;
export const MISS_LIMIT = 2;
export const MAX_BELIEVABLE_JUMP = 0.5;

const LB_PER_KG = 2.20462;

function roundTo(value: number, increment: number): number {
  return Math.round(value / increment) * increment;
}
function clamp(value: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, value));
}
function roundToDisplay(kg: number, displayUnit: 'imperial' | 'metric', increment: number): number {
  if (displayUnit === 'imperial') return roundTo(kg * LB_PER_KG, increment) / LB_PER_KG;
  return roundTo(kg, increment);
}

export function nextPrescription(input: PrescriptionInput): PrescriptionResult {
  const { goal, roundIncrement, best, rir, prescribedWeight, displayUnit } = input;
  const prevPr = input.pr1RM ?? 0;

  const prevMiss = input.missStreak ?? 0;

  if (input.progressionType !== 'LoadRep') {
    return { pr1RM: input.pr1RM, capacity1RM: input.capacity1RM, prescribedWeight, action: 'PASSTHROUGH', missStreak: prevMiss };
  }

  const pct = GOAL_TARGETS[goal].pct;
  const targetReps = GOAL_TARGETS[goal].reps;

  if (input.capacity1RM == null) {
    if (!best) return { pr1RM: input.pr1RM, capacity1RM: input.capacity1RM, prescribedWeight, action: 'HOLD_NO_DATA', missStreak: prevMiss };
    const seed = input.pr1RM ?? setE1RM(best.weight, best.reps, rir);
    return { pr1RM: Math.max(prevPr, seed), capacity1RM: seed, prescribedWeight: roundToDisplay(seed * pct, displayUnit, roundIncrement), action: 'SEED', missStreak: 0 };
  }

  const cap = input.capacity1RM;
  if (!best) return { pr1RM: prevPr, capacity1RM: cap, prescribedWeight, action: 'HOLD_NO_DATA', missStreak: prevMiss };

  const s = setE1RM(best.weight, best.reps, rir);
  const hasRIR = rir !== null;
  const tested = best.weight >= TESTED_BAND * prescribedWeight;
  const trusted = hasRIR ? (rir as number) <= PR_TRUST_RIR : tested;

  let target = cap;
  let action = 'HOLD';
  let resultMissStreak = 0;

  if (trusted && s > cap * (1 + EPS)) {
    if (s > Math.max(prevPr, cap) * (1 + MAX_BELIEVABLE_JUMP)) {
      target = cap;
      action = 'IGNORED_OUTLIER';
      resultMissStreak = prevMiss;
    } else {
      target = s;
      action = 'RAISE';
      resultMissStreak = 0;
    }
  } else if (tested && (hasRIR ? ((rir as number) <= GENUINE_RIR && s < cap * (1 - EPS)) : (best.reps < targetReps && s < cap))) {
    const newStreak = prevMiss + 1;
    if (newStreak >= MISS_LIMIT) {
      target = s;
      action = 'EASE_READINESS';
      resultMissStreak = 0;
    } else {
      target = cap;
      action = 'HOLD';
      resultMissStreak = newStreak;
    }
  }

  const capacity1RM = clamp(target, cap * (1 - MAX_STEP), cap * (1 + MAX_STEP));
  const pr1RM = Math.max(prevPr, capacity1RM);
  if (action === 'RAISE' && capacity1RM > prevPr) action = 'NEW_PR';

  return { pr1RM, capacity1RM, prescribedWeight: roundToDisplay(capacity1RM * pct, displayUnit, roundIncrement), action, missStreak: resultMissStreak };
}
