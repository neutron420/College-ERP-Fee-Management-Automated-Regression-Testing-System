import { z } from 'zod';

export const createAcademicYearSchema = z.object({
  yearCode: z.string().min(4).max(15), // e.g. 2024-25
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  isCurrent: z.boolean().default(false),
});

export const academicYearIdParamSchema = z.object({
  id: z.string().min(1),
});
