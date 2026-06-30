export {
  setE1RM,
  epley,
  brzycki,
  pctForTarget,
  getPercentFromRPETable,
  RPE_TABLE,
  E1RM_REP_CAP,
} from './rpe_progression';

export {
  nextPrescription,
  TESTED_BAND,
  GENUINE_RIR,
  PR_TRUST_RIR,
  EPS,
  MAX_STEP,
  MISS_LIMIT,
  MAX_BELIEVABLE_JUMP,
} from './nextPrescription';
export type {
  PrescriptionInput,
  PrescriptionResult,
  ProgressionType,
  BestSet,
} from './nextPrescription';

export { runE1RMBatch } from './e1rmBatch';
export type { E1RMItem, E1RMResult } from './e1rmBatch';

export { runBatch } from './batch';
export type { BatchItem, BatchResult } from './batch';

export { GOAL_TARGETS } from './zones';
export type { TrainingGoal, GoalTarget } from './zones';
