# @sculpt-ai/progressive-overload

Progressive overload & 1RM prescription engine — the math behind [Sculpt AI](https://github.com/Sculpt-AI)'s workout generation.

A pure, zero-dependency TypeScript module that turns a logged working set (weight × reps, optional RIR) into an updated one-rep-max estimate and the next prescribed working weight. It covers RPE/RIR percentage tables, Epley/Brzycki 1RM estimation, outlier containment, miss-streak readiness easing, and goal-based rep/percent targets (strength / hypertrophy / endurance).

## Install

```sh
npm i @sculpt-ai/progressive-overload
```

## Usage

```ts
import { setE1RM, nextPrescription, PrescriptionInput } from '@sculpt-ai/progressive-overload';

// Estimate a one-rep max from a working set (weight, reps, RIR).
const e1rm = setE1RM(100, 8, 2); // ≈ 135.3 (kg in, kg out)

// Given the last logged set, get the next prescription.
const input: PrescriptionInput = {
  progressionType: 'LoadRep',
  pr1RM: 135,
  capacity1RM: 135,
  prescribedWeight: 100,
  goal: 'HYPERTROPHY',
  roundIncrement: 2.5,
  displayUnit: 'metric',
  best: { weight: 100, reps: 10 },
  rir: 2,
  missStreak: 0,
};

const result = nextPrescription(input);
// result.action === 'NEW_PR'
// result.capacity1RM ≈ 147.1
// result.prescribedWeight  → next working weight, rounded to the display unit
```

All weights are in kilograms; `displayUnit: 'imperial'` only affects the rounding of `prescribedWeight` (to a clean lb plate, stored back in kg).

For batched calls (multiple exercises at once) use `runBatch` and `runE1RMBatch`.

## Live calculator

The interactive calculator and showcase for this engine is the **progoverloadcalc** web app. The source for this package lives in the Sculpt AI monorepo.

## License

MIT
