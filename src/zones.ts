import { pctForTarget } from './rpe_progression';

export type TrainingGoal = 'STRENGTH' | 'HYPERTROPHY' | 'ENDURANCE';

export interface GoalTarget {
  sets: number;
  low: number;
  high: number;
  rpe: number;
  pct: number;
}

const TARGET_RPE = 8;

const RANGES: Record<TrainingGoal, { sets: number; low: number; high: number }> = {
  STRENGTH: { sets: 4, low: 4, high: 6 },
  HYPERTROPHY: { sets: 3, low: 8, high: 12 },
  ENDURANCE: { sets: 3, low: 12, high: 15 },
};

const goalTarget = (goal: TrainingGoal): GoalTarget => ({
  ...RANGES[goal],
  rpe: TARGET_RPE,
  pct: pctForTarget(RANGES[goal].low, TARGET_RPE),
});

export const GOAL_TARGETS: Record<TrainingGoal, GoalTarget> = {
  STRENGTH: goalTarget('STRENGTH'),
  HYPERTROPHY: goalTarget('HYPERTROPHY'),
  ENDURANCE: goalTarget('ENDURANCE'),
};
