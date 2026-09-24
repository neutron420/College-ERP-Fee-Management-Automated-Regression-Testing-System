import { prisma } from '@repo/database';
import type { StudentStatus } from '@repo/types';

export interface StudentFilterOptions {
  departmentId?: string;
  academicYearId?: string;
  status?: StudentStatus;
  search?: string;
  page?: number;
  limit?: number;
}

export class StudentRepository {
  async findMany(options: StudentFilterOptions = {}) {
    const { departmentId, academicYearId, status, search, page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (departmentId) where.departmentId = departmentId;
    if (academicYearId) where.academicYearId = academicYearId;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { rollNumber: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.student.findMany({
        where,
        skip,
        take: limit,
        include: {
          department: true,
          academicYear: true,
          feeAssessments: {
            include: {
              feeStructure: true,
            },
          },
        },
        orderBy: { rollNumber: 'asc' },
      }),
      prisma.student.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async findById(id: string) {
    return prisma.student.findUnique({
      where: { id },
      include: {
        department: true,
        academicYear: true,
        scholarships: {
          include: { scholarship: true },
        },
        discounts: {
          include: { discount: true },
        },
        feeAssessments: {
          include: {
            feeStructure: {
              include: { components: true },
            },
            payments: true,
            refunds: true,
          },
        },
        payments: {
          orderBy: { paymentDate: 'desc' },
        },
      },
    });
  }

  async findByRollNumber(rollNumber: string) {
    return prisma.student.findUnique({
      where: { rollNumber },
    });
  }

  async findByEmail(email: string) {
    return prisma.student.findUnique({
      where: { email },
    });
  }

  async create(data: {
    rollNumber: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    departmentId: string;
    academicYearId: string;
  }) {
    return prisma.student.create({
      data,
      include: {
        department: true,
        academicYear: true,
      },
    });
  }

  async update(id: string, data: { firstName?: string; lastName?: string; email?: string; phone?: string; status?: StudentStatus }) {
    return prisma.student.update({
      where: { id },
      data,
      include: {
        department: true,
        academicYear: true,
      },
    });
  }
}
