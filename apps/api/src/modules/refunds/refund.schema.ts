import { z } from 'zod';

export const createRefundSchema = z.object({
  paymentId: z.string().min(1),
  amount: z.number().positive('Refund amount must be greater than 0'),
  reason: z.string().min(3).max(255),
});
