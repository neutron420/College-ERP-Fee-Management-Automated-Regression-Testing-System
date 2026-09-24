import { z } from 'zod';

export const createFeeStructureSchema = z.object({
  name: z.string().min(2).max(100),
  departmentId: z.string().min(1),
  academicYearId: z.string().min(1),
  dueDate: z.coerce.date(),
  finePerDay: z.number().min(0).default(0),
  graceDays: z.number().int().min(0).default(0),
  components: z
    .array(
      z.object({
        type: z.enum([
          'TUITION',
          'EXAMINATION',
          'LIBRARY',
          'LABORATORY',
          'DEVELOPMENT',
          'HOSTEL',
          'MISCELLANEOUS',
        ]),
        name: z.string().min(1),
        amount: z.number().min(0),
        isOptional: z.boolean().default(false),
      })
    )
    .min(1),
});

export const calculateFeePreviewSchema = z.object({
  components: z.array(
    z.object({
      type: z.enum([
        'TUITION',
        'EXAMINATION',
        'LIBRARY',
        'LABORATORY',
        'DEVELOPMENT',
        'HOSTEL',
        'MISCELLANEOUS',
      ]),
      name: z.string(),
      amount: z.number().min(0),
    })
  ),
  scholarships: z
    .array(
      z.object({
        code: z.string(),
        name: z.string(),
        type: z.enum(['PERCENTAGE', 'FIXED']),
        value: z.number().min(0),
      })
    )
    .optional(),
  discounts: z
    .array(
      z.object({
        code: z.string(),
        name: z.string(),
        type: z.enum(['PERCENTAGE', 'FIXED']),
        value: z.number().min(0),
      })
    )
    .optional(),
  dueDate: z.coerce.date(),
  calculationDate: z.coerce.date().optional(),
  graceDays: z.number().int().min(0).optional(),
  finePerDay: z.number().min(0).optional(),
  payments: z
    .array(
      z.object({
        amount: z.number().min(0),
        status: z.enum(['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED']),
        paymentDate: z.coerce.date().optional(),
      })
    )
    .optional(),
  refunds: z
    .array(
      z.object({
        amount: z.number().min(0),
        status: z.enum(['REQUESTED', 'APPROVED', 'PROCESSED', 'REJECTED']),
      })
    )
    .optional(),
  defectFlags: z
    .object({
      doubleCountLibraryFee: z.boolean().optional(),
      ignoreDiscounts: z.boolean().optional(),
      incorrectLateFineMultiplier: z.boolean().optional(),
    })
    .optional(),
});

export const assessStudentSchema = z.object({
  studentId: z.string().min(1),
  feeStructureId: z.string().min(1),
});
