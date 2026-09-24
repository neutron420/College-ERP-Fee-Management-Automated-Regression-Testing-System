import type { DefectFlagsInput } from '@repo/types';
import { calculateOverdueDays, roundMoney, multiplyMoney } from '@repo/shared';

export interface LateFineResult {
  lateDays: number;
  lateFineAmount: number;
}

export function calculateLateFine(
  dueDate: Date | string,
  graceDays = 0,
  finePerDay = 0,
  calculationDate: Date | string = new Date(),
  defectFlags?: DefectFlagsInput
): LateFineResult {
  if (finePerDay <= 0) {
    return { lateDays: 0, lateFineAmount: 0 };
  }

  const overdueDays = calculateOverdueDays(dueDate, graceDays, calculationDate);

  if (overdueDays <= 0) {
    return { lateDays: 0, lateFineAmount: 0 };
  }

  const multiplier = defectFlags?.incorrectLateFineMultiplier ? 2 : 1;
  const fineAmount = multiplyMoney(overdueDays * finePerDay, multiplier);

  return {
    lateDays: overdueDays,
    lateFineAmount: roundMoney(fineAmount),
  };
}
