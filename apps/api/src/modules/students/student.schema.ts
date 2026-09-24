import { z } from 'zod';

export const createStudentSchema = z.object({
  rollNumber: z.string().min(3).max(30),
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  email: z.string().email(),
  phone: z.string().optional(),
  departmentId: z.string().min(1),
  academicYearId: z.string().min(1),
});

export const updateStudentSchema = z.object({
  firstName: z.string().min(2).max(50).optional(),
  lastName: z.string().min(2).max(50).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'GRADUATED']).optional(),
});

export const studentQuerySchema = z.object({
  departmentId: z.string().optional(),
  academicYearId: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'GRADUATED']).optional(),
  search: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export const studentIdParamSchema = z.object({
  id: z.string().min(1),
});
