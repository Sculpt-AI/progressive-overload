export const RPE_TABLE = new Map<number, Map<number, number>>([
  [
    1,
    new Map([
      [10, 100],
      [9.5, 97.8],
      [9, 95.5],
      [8.5, 93.9],
      [8, 92.2],
      [7.5, 90.7],
      [7, 89.2],
      [6.5, 87.8],
      [6, 86.3],
    ]),
  ],
  [
    2,
    new Map([
      [10, 95.5],
      [9.5, 93.9],
      [9, 92.2],
      [8.5, 90.7],
      [8, 89.2],
      [7.5, 87.8],
      [7, 86.3],
      [6.5, 85.0],
      [6, 83.7],
    ]),
  ],
  [
    3,
    new Map([
      [10, 92.2],
      [9.5, 90.7],
      [9, 89.2],
      [8.5, 87.8],
      [8, 86.3],
      [7.5, 85.0],
      [7, 83.7],
      [6.5, 82.4],
      [6, 81.1],
    ]),
  ],
  [
    4,
    new Map([
      [10, 89.2],
      [9.5, 87.8],
      [9, 86.3],
      [8.5, 85.0],
      [8, 83.7],
      [7.5, 82.4],
      [7, 81.1],
      [6.5, 79.9],
      [6, 78.6],
    ]),
  ],
  [
    5,
    new Map([
      [10, 86.3],
      [9.5, 85.0],
      [9, 83.7],
      [8.5, 82.4],
      [8, 81.1],
      [7.5, 79.9],
      [7, 78.6],
      [6.5, 77.4],
      [6, 76.2],
    ]),
  ],
  [
    6,
    new Map([
      [10, 83.7],
      [9.5, 82.4],
      [9, 81.1],
      [8.5, 79.9],
      [8, 78.6],
      [7.5, 77.4],
      [7, 76.2],
      [6.5, 75.1],
      [6, 73.9],
    ]),
  ],
  [
    7,
    new Map([
      [10, 81.1],
      [9.5, 79.9],
      [9, 78.6],
      [8.5, 77.4],
      [8, 76.2],
      [7.5, 75.1],
      [7, 73.9],
      [6.5, 72.3],
      [6, 70.7],
    ]),
  ],
  [
    8,
    new Map([
      [10, 78.6],
      [9.5, 77.4],
      [9, 76.2],
      [8.5, 75.1],
      [8, 73.9],
      [7.5, 72.3],
      [7, 70.7],
      [6.5, 69.4],
      [6, 68.0],
    ]),
  ],
  [
    9,
    new Map([
      [10, 76.2],
      [9.5, 75.1],
      [9, 73.9],
      [8.5, 72.3],
      [8, 70.7],
      [7.5, 69.4],
      [7, 68.0],
      [6.5, 66.7],
      [6, 65.3],
    ]),
  ],
  [
    10,
    new Map([
      [10, 73.9],
      [9.5, 72.3],
      [9, 70.7],
      [8.5, 69.4],
      [8, 68.0],
      [7.5, 66.7],
      [7, 65.3],
      [6.5, 64.0],
      [6, 62.6],
    ]),
  ],
  [
    11,
    new Map([
      [10, 70.7],
      [9.5, 69.4],
      [9, 68.0],
      [8.5, 66.7],
      [8, 65.3],
      [7.5, 64.0],
      [7, 62.6],
      [6.5, 61.3],
      [6, 59.9],
    ]),
  ],
  [
    12,
    new Map([
      [10, 68.0],
      [9.5, 66.7],
      [9, 65.3],
      [8.5, 64.0],
      [8, 62.6],
      [7.5, 61.3],
      [7, 59.9],
      [6.5, 58.6],
      [6, 57.2],
    ]),
  ],
]);

export function getPercentFromRPETable(reps: number, RPE: number): number {
  const clampedReps = Math.max(1, Math.min(12, Math.round(reps)));
  const clampedRPE = Math.max(6, Math.min(10, RPE));

  const repsMap = RPE_TABLE.get(clampedReps);
  if (!repsMap) return 75;

  const availableRPEs = Array.from(repsMap.keys()).sort((a, b) => b - a);
  let closestRPE = availableRPEs[0];
  let minDiff = Math.abs(clampedRPE - closestRPE);

  for (const rpeVal of availableRPEs) {
    const diff = Math.abs(clampedRPE - rpeVal);
    if (diff < minDiff) {
      minDiff = diff;
      closestRPE = rpeVal;
    }
  }

  return repsMap.get(closestRPE) ?? 75;
}

export function epley(weight: number, reps: number): number {
  return reps <= 1 ? weight : weight * (1 + reps / 30);
}

export function brzycki(weight: number, reps: number): number {
  return weight * (36 / (37 - reps));
}

export function pctForTarget(reps: number, rpe: number): number {
  if (reps > 12) return 1 / (1 + reps / 30);
  return getPercentFromRPETable(reps, rpe) / 100;
}

export const E1RM_REP_CAP = 12;

export function setE1RM(weight: number, reps: number, rir: number | null): number {
  const cappedReps = Math.min(reps, E1RM_REP_CAP);
  if (rir !== null) {
    const rpe = Math.max(6, Math.min(10, 10 - rir));
    const pct = getPercentFromRPETable(cappedReps, rpe) / 100;
    return weight / pct;
  }
  return cappedReps <= 5 ? brzycki(weight, cappedReps) : epley(weight, cappedReps);
}
