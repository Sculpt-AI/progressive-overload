import { nextPrescription, PrescriptionInput, PrescriptionResult } from './nextPrescription';

export type BatchItem = PrescriptionInput & { exerciseId: string };
export type BatchResult = PrescriptionResult & { exerciseId: string };

export function runBatch(items: BatchItem[]): BatchResult[] {
  return items.map(({ exerciseId, ...input }) => ({ exerciseId, ...nextPrescription(input) }));
}
