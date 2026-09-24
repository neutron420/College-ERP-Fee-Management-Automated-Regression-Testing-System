import { z } from 'zod';

export const createPaymentSchema = z.object({
  feeAssessmentId: z.string().min(1),
  amount: z.number().positive('Payment amount must be greater than 0'),
  paymentMethod: z.enum([
    'CASH',
    'BANK_TRANSFER',
    'UPI',
    'CREDIT_CARD',
    'DEBIT_CARD',
    'DEMAND_DRAFT',
  ]),
  transactionRef: z.string().optional(),
  remarks: z.string().optional(),
});

export const paymentQuerySchema = z.object({
  studentId: z.string().optional(),
  feeAssessmentId: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});
