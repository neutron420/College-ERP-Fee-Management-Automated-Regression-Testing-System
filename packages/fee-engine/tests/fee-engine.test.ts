import { describe, it, expect } from 'vitest';
import { calculateStudentFee } from '../src/calculate.js';
import type { FeeComponentInput, ReductionInput, PaymentRecordInput, RefundRecordInput } from '@repo/types';

describe('Fee Calculation Engine', () => {
  const canonicalComponents: FeeComponentInput[] = [
    { type: 'TUITION', name: 'Tuition Fee', amount: 40000 },
    { type: 'EXAMINATION', name: 'Examination Fee', amount: 5000 },
    { type: 'LIBRARY', name: 'Library Fee', amount: 2000 },
    { type: 'LABORATORY', name: 'Laboratory Fee', amount: 3000 },
  ];

  const standardDueDate = new Date('2024-09-30T00:00:00.000Z');

  // =========================================================================
  // 1. Core Case Study: Normal vs Defect Injected
  // =========================================================================
  describe('Case Study: Baseline vs Simulated Defect', () => {
    it('TC-CALC-001: Should compute exact ₹50,000 for standard 4-component fee structure in baseline mode', () => {
      const result = calculateStudentFee({
        components: canonicalComponents,
        dueDate: standardDueDate,
        calculationDate: standardDueDate,
      });

      expect(result.baseAmount).toBe(50000);
      expect(result.breakdown.tuition).toBe(40000);
      expect(result.breakdown.examination).toBe(5000);
      expect(result.breakdown.library).toBe(2000);
      expect(result.breakdown.laboratory).toBe(3000);
      expect(result.netPayable).toBe(50000);
      expect(result.outstandingAmount).toBe(50000);
      expect(result.status).toBe('UNPAID');
      expect(result.isDefectSimulated).toBe(false);
    });

    it('TC-REG-DOUBLE-LIBRARY: Should reproduce ₹52,000 when doubleCountLibraryFee defect is enabled', () => {
      const result = calculateStudentFee({
        components: canonicalComponents,
        dueDate: standardDueDate,
        calculationDate: standardDueDate,
        defectFlags: { doubleCountLibraryFee: true },
      });

      // Defect duplicates the 2,000 library fee: 50,000 + 2,000 = 52,000
      expect(result.baseAmount).toBe(52000);
      expect(result.netPayable).toBe(52000);
      expect(result.outstandingAmount).toBe(52000);
      expect(result.isDefectSimulated).toBe(true);
    });
  });

  // =========================================================================
  // 2. Concessions: Scholarships and Discounts
  // =========================================================================
  describe('Concessions (Scholarships & Discounts)', () => {
    it('TC-CALC-002: Should apply a 10% percentage scholarship (₹5,000 reduction)', () => {
      const scholarships: ReductionInput[] = [
        { code: 'MERIT10', name: 'Merit Scholarship', type: 'PERCENTAGE', value: 10 },
      ];

      const result = calculateStudentFee({
        components: canonicalComponents,
        scholarships,
        dueDate: standardDueDate,
        calculationDate: standardDueDate,
      });

      expect(result.baseAmount).toBe(50000);
      expect(result.scholarshipAmount).toBe(5000);
      expect(result.discountAmount).toBe(0);
      expect(result.totalConcessions).toBe(5000);
      expect(result.netPayable).toBe(45000);
      expect(result.outstandingAmount).toBe(45000);
    });

    it('TC-CALC-003: Should apply a ₹2,000 fixed discount', () => {
      const discounts: ReductionInput[] = [
        { code: 'SIBLING2000', name: 'Sibling Discount', type: 'FIXED', value: 2000 },
      ];

      const result = calculateStudentFee({
        components: canonicalComponents,
        discounts,
        dueDate: standardDueDate,
        calculationDate: standardDueDate,
      });

      expect(result.baseAmount).toBe(50000);
      expect(result.scholarshipAmount).toBe(0);
      expect(result.discountAmount).toBe(2000);
      expect(result.totalConcessions).toBe(2000);
      expect(result.netPayable).toBe(48000);
    });

    it('TC-CALC-004: Should apply combined scholarship (10% = ₹5k) and discount (₹2k) yielding net ₹43k', () => {
      const scholarships: ReductionInput[] = [
        { code: 'MERIT10', name: 'Merit Scholarship', type: 'PERCENTAGE', value: 10 },
      ];
      const discounts: ReductionInput[] = [
        { code: 'SIBLING2000', name: 'Sibling Discount', type: 'FIXED', value: 2000 },
      ];

      const result = calculateStudentFee({
        components: canonicalComponents,
        scholarships,
        discounts,
        dueDate: standardDueDate,
        calculationDate: standardDueDate,
      });

      expect(result.baseAmount).toBe(50000);
      expect(result.scholarshipAmount).toBe(5000);
      expect(result.discountAmount).toBe(2000);
      expect(result.totalConcessions).toBe(7000);
      expect(result.netPayable).toBe(43000);
    });

    it('Should cap concessions so net payable never becomes negative', () => {
      const scholarships: ReductionInput[] = [
        { code: 'FULL_RIDE', name: 'Full Ride', type: 'PERCENTAGE', value: 150 }, // Exceeds 100%
      ];
      const discounts: ReductionInput[] = [
        { code: 'EXTRA', name: 'Extra', type: 'FIXED', value: 10000 },
      ];

      const result = calculateStudentFee({
        components: canonicalComponents,
        scholarships,
        discounts,
        dueDate: standardDueDate,
        calculationDate: standardDueDate,
      });

      expect(result.scholarshipAmount).toBe(50000); // Capped at base fee
      expect(result.discountAmount).toBe(0); // Remaining was 0
      expect(result.netPayable).toBe(0);
      expect(result.status).toBe('PAID');
    });
  });

  // =========================================================================
  // 3. Late Fines & Overdue Calculations
  // =========================================================================
  describe('Late Fines', () => {
    it('Should charge 0 fine if paid within grace period (7 days grace, 5 days late)', () => {
      const calculationDate = new Date('2024-10-05T00:00:00.000Z'); // 5 days past Sept 30

      const result = calculateStudentFee({
        components: canonicalComponents,
        dueDate: standardDueDate,
        graceDays: 7,
        finePerDay: 50,
        calculationDate,
      });

      expect(result.lateDays).toBe(0);
      expect(result.lateFineAmount).toBe(0);
      expect(result.netPayable).toBe(50000);
    });

    it('TC-CALC-005: Should charge fine for full overdue duration once grace period is exceeded (10 days @ ₹50/day = ₹500)', () => {
      const calculationDate = new Date('2024-10-10T00:00:00.000Z'); // 10 days past Sept 30

      const result = calculateStudentFee({
        components: canonicalComponents,
        dueDate: standardDueDate,
        graceDays: 0,
        finePerDay: 50,
        calculationDate,
      });

      expect(result.lateDays).toBe(10);
      expect(result.lateFineAmount).toBe(500);
      expect(result.netPayable).toBe(50500);
      expect(result.status).toBe('OVERDUE');
    });
  });

  // =========================================================================
  // 4. Payments, Refunds, and Outstanding Balances
  // =========================================================================
  describe('Payments & Refunds', () => {
    it('TC-CALC-006: Partial payment should reduce outstanding and set status to PARTIALLY_PAID', () => {
      const payments: PaymentRecordInput[] = [
        { amount: 30000, status: 'SUCCESS' },
      ];

      const result = calculateStudentFee({
        components: canonicalComponents,
        payments,
        dueDate: standardDueDate,
        calculationDate: standardDueDate,
      });

      expect(result.grossPaidAmount).toBe(30000);
      expect(result.netPaidAmount).toBe(30000);
      expect(result.outstandingAmount).toBe(20000);
      expect(result.status).toBe('PARTIALLY_PAID');
    });

    it('TC-CALC-007: Full payment should clear outstanding balance and set status to PAID', () => {
      const payments: PaymentRecordInput[] = [
        { amount: 50000, status: 'SUCCESS' },
      ];

      const result = calculateStudentFee({
        components: canonicalComponents,
        payments,
        dueDate: standardDueDate,
        calculationDate: standardDueDate,
      });

      expect(result.netPaidAmount).toBe(50000);
      expect(result.outstandingAmount).toBe(0);
      expect(result.status).toBe('PAID');
    });

    it('TC-CALC-008: Processed refund should subtract from net paid and restore outstanding balance', () => {
      const payments: PaymentRecordInput[] = [
        { amount: 50000, status: 'SUCCESS' },
      ];
      const refunds: RefundRecordInput[] = [
        { amount: 10000, status: 'PROCESSED' },
      ];

      const result = calculateStudentFee({
        components: canonicalComponents,
        payments,
        refunds,
        dueDate: standardDueDate,
        calculationDate: standardDueDate,
      });

      expect(result.grossPaidAmount).toBe(50000);
      expect(result.refundedAmount).toBe(10000);
      expect(result.netPaidAmount).toBe(40000);
      expect(result.outstandingAmount).toBe(10000);
      expect(result.status).toBe('PARTIALLY_PAID');
    });

    it('Should ignore failed payments and non-processed refunds', () => {
      const payments: PaymentRecordInput[] = [
        { amount: 20000, status: 'SUCCESS' },
        { amount: 30000, status: 'FAILED' },
        { amount: 10000, status: 'PENDING' },
      ];
      const refunds: RefundRecordInput[] = [
        { amount: 5000, status: 'REJECTED' },
        { amount: 5000, status: 'REQUESTED' },
      ];

      const result = calculateStudentFee({
        components: canonicalComponents,
        payments,
        refunds,
        dueDate: standardDueDate,
        calculationDate: standardDueDate,
      });

      expect(result.grossPaidAmount).toBe(20000);
      expect(result.refundedAmount).toBe(0);
      expect(result.netPaidAmount).toBe(20000);
      expect(result.outstandingAmount).toBe(30000);
    });
  });

  // =========================================================================
  // 5. Edge & Boundary Cases
  // =========================================================================
  describe('Boundary Conditions', () => {
    it('TC-CALC-009: Should handle zero components gracefully', () => {
      const result = calculateStudentFee({
        components: [],
        dueDate: standardDueDate,
      });

      expect(result.baseAmount).toBe(0);
      expect(result.netPayable).toBe(0);
      expect(result.outstandingAmount).toBe(0);
      expect(result.status).toBe('PAID');
    });

    it('Should handle multiple components of same type', () => {
      const components: FeeComponentInput[] = [
        { type: 'TUITION', name: 'Semester 1 Tuition', amount: 20000 },
        { type: 'TUITION', name: 'Semester 2 Tuition', amount: 20000 },
      ];

      const result = calculateStudentFee({
        components,
        dueDate: standardDueDate,
      });

      expect(result.baseAmount).toBe(40000);
      expect(result.breakdown.tuition).toBe(40000);
    });
  });
});
