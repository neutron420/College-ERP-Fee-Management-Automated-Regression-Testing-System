import type { ReductionInput, DefectFlagsInput } from '@repo/types';
import { roundMoney, multiplyMoney, subtractMoney } from '@repo/shared';

/**
 * Calculates scholarships against base amount.
 * Scholarships take strict precedence over discounts.
 */
export function calculateScholarships(
  baseAmount: number,
  scholarships: ReductionInput[] = []
): number {
  if (baseAmount <= 0 || scholarships.length === 0) return 0;

  let totalScholarship = 0;
  for (const scholarship of scholarships) {
    if (scholarship.type === 'PERCENTAGE') {
      const amount = multiplyMoney(baseAmount, scholarship.value / 100);
      totalScholarship += amount;
    } else {
      totalScholarship += roundMoney(scholarship.value);
    }
  }

  // Scholarships cannot exceed the base fee
  return Math.min(roundMoney(baseAmount), roundMoney(totalScholarship));
}

/**
 * Calculates discounts applied against the remaining balance after scholarships.
 */
export function calculateDiscounts(
  remainingBase: number,
  discounts: ReductionInput[] = [],
  defectFlags?: DefectFlagsInput
): number {
  if (defectFlags?.ignoreDiscounts) {
    return 0;
  }

  if (remainingBase <= 0 || discounts.length === 0) return 0;

  let totalDiscount = 0;
  for (const discount of discounts) {
    if (discount.type === 'PERCENTAGE') {
      const amount = multiplyMoney(remainingBase, discount.value / 100);
      totalDiscount += amount;
    } else {
      totalDiscount += roundMoney(discount.value);
    }
  }

  // Discounts cannot exceed the remaining balance
  return Math.min(roundMoney(remainingBase), roundMoney(totalDiscount));
}
