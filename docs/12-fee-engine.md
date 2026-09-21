# 12 - Fee Engine

## 1. Architectural Independence
The Fee Engine (`packages/fee-engine`) is deliberately isolated from:
- HTTP frameworks (Express, Koa, Fastify)
- Web presentation libraries (React, Next.js)
- Database clients or ORMs (Prisma, pg, TypeORM)

This design ensures:
1. Complete deterministic unit testability with sub-millisecond execution.
2. Portability across CLI runners, API servers, batch jobs, and browser client previews.
3. Invariant immutability: the engine takes pure data in and returns pure data out.

## 2. Input Contract (`FeeCalculationInput`)
```typescript
export interface FeeComponentInput {
  id?: string;
  type: 'TUITION' | 'EXAMINATION' | 'LIBRARY' | 'LABORATORY' | 'DEVELOPMENT' | 'HOSTEL' | 'MISCELLANEOUS';
  name: string;
  amount: number;
}

export interface ReductionInput {
  id?: string;
  code: string;
  name: string;
  type: 'PERCENTAGE' | 'FIXED';
  value: number; // e.g., 10 for 10%, or 2000 for ₹2,000
}

export interface PaymentRecordInput {
  id?: string;
  amount: number;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
  paymentDate: string | Date;
}

export interface RefundRecordInput {
  id?: string;
  paymentId?: string;
  amount: number;
  status: 'REQUESTED' | 'APPROVED' | 'PROCESSED' | 'REJECTED';
}

export interface DefectFlagsInput {
  doubleCountLibraryFee?: boolean;
  ignoreDiscounts?: boolean;
  incorrectLateFineMultiplier?: boolean;
}

export interface FeeCalculationInput {
  components: FeeComponentInput[];
  scholarships?: ReductionInput[];
  discounts?: ReductionInput[];
  dueDate: string | Date;
  calculationDate?: string | Date;
  graceDays?: number;
  finePerDay?: number;
  payments?: PaymentRecordInput[];
  refunds?: RefundRecordInput[];
  defectFlags?: DefectFlagsInput;
}
```

## 3. Output Contract (`FeeCalculationOutput`)
```typescript
export interface FeeCalculationOutput {
  baseAmount: number;
  breakdown: {
    tuition: number;
    examination: number;
    library: number;
    laboratory: number;
    development: number;
    hostel: number;
    miscellaneous: number;
  };
  scholarshipAmount: number;
  discountAmount: number;
  totalConcessions: number;
  lateDays: number;
  lateFineAmount: number;
  netPayable: number;
  grossPaidAmount: number;
  refundedAmount: number;
  netPaidAmount: number;
  outstandingAmount: number;
  status: 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE';
  isDefectSimulated: boolean;
}
```

## 4. Execution Pipeline
1. **Gross Base Computation**: Sum all `components.amount`.
   - *Defect simulation branch*: If `doubleCountLibraryFee` is active, duplicate the library component amount in the total.
2. **Scholarship Computation**: Evaluate scholarships against `baseAmount` (or eligible tuition head).
3. **Discount Computation**: Evaluate discounts against remaining base balance.
4. **Late Fine Computation**: If `calculationDate > (dueDate + graceDays)`, multiply overdue days by `finePerDay`.
5. **Net Payable**: $\max(0, \text{baseAmount} + \text{lateFineAmount} - \text{scholarshipAmount} - \text{discountAmount})$.
6. **Payment Reconciliation**: Sum payments with status `SUCCESS`.
7. **Refund Reconciliation**: Sum refunds with status `PROCESSED`.
8. **Net Paid**: $\text{grossPaidAmount} - \text{refundedAmount}$.
9. **Outstanding Amount**: $\max(0, \text{netPayable} - \text{netPaidAmount})$.
