import { pctForTarget } from './rpe_progression';

export type TrainingGoal = 'STRENGTH' | 'HYPERTROPHY' | 'ENDURANCE';

export interface GoalTarget {
  reps: number;
  rpe: number;
  pct: number;
}

const TARGET_REPS: Record<TrainingGoal, number> = {
  STRENGTH: 5,
  HYPERTROPHY: 8,
  ENDURANCE: 15,
};
const TARGET_RPE = 8;

export const GOAL_TARGETS: Record<TrainingGoal, GoalTarget> = {
  STRENGTH: { reps: TARGET_REPS.STRENGTH, rpe: TARGET_RPE, pct: pctForTarget(TARGET_REPS.STRENGTH, TARGET_RPE) },
  HYPERTROPHY: { reps: TARGET_REPS.HYPERTROPHY, rpe: TARGET_RPE, pct: pctForTarget(TARGET_REPS.HYPERTROPHY, TARGET_RPE) },
  ENDURANCE: { reps: TARGET_REPS.ENDURANCE, rpe: TARGET_RPE, pct: pctForTarget(TARGET_REPS.ENDURANCE, TARGET_RPE) },
};
