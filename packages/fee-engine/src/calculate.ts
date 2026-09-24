import type {
  FeeCalculationInput,
  FeeCalculationOutput,
  AssessmentStatus,
} from '@repo/types';
import { roundMoney, addMoney, subtractMoney } from '@repo/shared';
import { calculateComponentBreakdown } from './breakdown.js';
import { calculateScholarships, calculateDiscounts } from './concessions.js';
import { calculateLateFine } from './late-fine.js';

/**
 * Pure, deterministic Fee Calculation Function
 *
 * Implements the Core Case Study:
 * Base Fee = Tuition + Examination + Library + Laboratory
 * Baseline CSE: ₹40,000 + ₹5,000 + ₹2,000 + ₹3,000 = ₹50,000
 *
 * In Defect Mode (doubleCountLibraryFee):
 * Accidentally adds Library component twice: ₹50,000 + ₹2,000 = ₹52,000.
 */
export function calculateStudentFee(
  input: FeeCalculationInput
): FeeCalculationOutput {
  const {
    components = [],
    scholarships = [],
    discounts = [],
    dueDate,
    calculationDate = new Date(),
    graceDays = 0,
    finePerDay = 0,
    payments = [],
    refunds = [],
    defectFlags = {},
  } = input;

  // 1. Calculate Component Breakdown
  const breakdown = calculateComponentBreakdown(components);

  // 2. Calculate Base Amount (Sum of all components)
  let baseAmount = roundMoney(
    components.reduce((sum, c) => sum + roundMoney(c.amount), 0)
  );

  // -------------------------------------------------------------
  // SIMULATED DEFECT HOOK (The Core Case Study)
  // Demonstrates: Developer accidentally duplicates the library fee!
  // -------------------------------------------------------------
  let isDefectSimulated = false;
  if (defectFlags.doubleCountLibraryFee) {
    const libraryComponent = components.find((c) => c.type === 'LIBRARY');
    if (libraryComponent) {
      baseAmount = addMoney(baseAmount, libraryComponent.amount);
      isDefectSimulated = true;
    }
  }

  // 3. Concessions: Scholarships take precedence over Discounts
  const scholarshipAmount = calculateScholarships(baseAmount, scholarships);
  const remainingAfterScholarship = Math.max(0, subtractMoney(baseAmount, scholarshipAmount));
  const discountAmount = calculateDiscounts(remainingAfterScholarship, discounts, defectFlags);
  const totalConcessions = addMoney(scholarshipAmount, discountAmount);

  // 4. Late Fine Calculation
  const { lateDays, lateFineAmount } = calculateLateFine(
    dueDate,
    graceDays,
    finePerDay,
    calculationDate,
    defectFlags
  );

  // 5. Net Payable
  // Net Payable = max(0, Base Fee + Late Fine - Scholarships - Discounts)
  const grossPayable = addMoney(baseAmount, lateFineAmount);
  const netPayable = Math.max(0, subtractMoney(grossPayable, totalConcessions));

  // 6. Payments & Refunds Reconciliation
  let grossPaidAmount = 0;
  for (const payment of payments) {
    if (payment.status === 'SUCCESS') {
      grossPaidAmount = addMoney(grossPaidAmount, payment.amount);
    }
  }

  let refundedAmount = 0;
  for (const refund of refunds) {
    if (refund.status === 'PROCESSED' || refund.status === 'APPROVED') {
      refundedAmount = addMoney(refundedAmount, refund.amount);
    }
  }

  const netPaidAmount = Math.max(0, subtractMoney(grossPaidAmount, refundedAmount));
  const outstandingAmount = Math.max(0, subtractMoney(netPayable, netPaidAmount));

  // 7. Status Resolution
  let status: AssessmentStatus = 'UNPAID';
  if (netPayable === 0 || netPaidAmount >= netPayable) {
    status = 'PAID';
  } else if (netPaidAmount > 0 && netPaidAmount < netPayable) {
    status = 'PARTIALLY_PAID';
  } else if (lateDays > 0) {
    status = 'OVERDUE';
  } else {
    status = 'UNPAID';
  }

  return {
    baseAmount,
    breakdown,
    scholarshipAmount,
    discountAmount,
    totalConcessions,
    lateDays,
    lateFineAmount,
    netPayable,
    grossPaidAmount,
    refundedAmount,
    netPaidAmount,
    outstandingAmount,
    status,
    isDefectSimulated,
  };
}
