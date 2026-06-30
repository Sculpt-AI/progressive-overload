import { setE1RM } from './rpe_progression';

export type E1RMItem = { id: string; weight: number; reps: number; rir: number | null };
export type E1RMResult = { id: string; e1rm: number };

export function runE1RMBatch(items: E1RMItem[]): E1RMResult[] {
  return items.map(({ id, weight, reps, rir }) => ({
    id,
    e1rm: weight > 0 && reps > 0 ? setE1RM(weight, reps, rir ?? null) : 0,
  }));
}
