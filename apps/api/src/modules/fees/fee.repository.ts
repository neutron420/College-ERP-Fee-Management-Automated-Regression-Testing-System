import { prisma } from '@repo/database';

export class FeeRepository {
  async findFeeStructures(filter: { departmentId?: string; academicYearId?: string } = {}) {
    return prisma.feeStructure.findMany({
      where: filter,
      include: {
        department: true,
        academicYear: true,
        components: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async findFeeStructureById(id: string) {
    return prisma.feeStructure.findUnique({
      where: { id },
      include: {
        department: true,
        academicYear: true,
        components: true,
      },
    });
  }

  async createFeeStructure(data: {
    name: string;
    departmentId: string;
    academicYearId: string;
    dueDate: Date;
    finePerDay?: number;
    graceDays?: number;
    components: {
      type: any;
      name: string;
      amount: number;
      isOptional?: boolean;
    }[];
  }) {
    const { components, ...structureData } = data;
    return prisma.feeStructure.create({
      data: {
        ...structureData,
        components: {
          create: components.map((c) => ({
            type: c.type,
            name: c.name,
            amount: c.amount,
            isOptional: c.isOptional ?? false,
          })),
        },
      },
      include: {
        components: true,
        department: true,
        academicYear: true,
      },
    });
  }

  async findAssessment(studentId: string, feeStructureId: string) {
    return prisma.feeAssessment.findUnique({
      where: {
        studentId_feeStructureId: {
          studentId,
          feeStructureId,
        },
      },
      include: {
        feeStructure: {
          include: { components: true },
        },
        payments: true,
        refunds: true,
      },
    });
  }

  async upsertAssessment(data: {
    studentId: string;
    feeStructureId: string;
    academicYearId: string;
    baseAmount: number;
    scholarshipAmount: number;
    discountAmount: number;
    lateFineAmount: number;
    netPayable: number;
    paidAmount: number;
    outstandingAmount: number;
    status: any;
    dueDate: Date;
  }) {
    return prisma.feeAssessment.upsert({
      where: {
        studentId_feeStructureId: {
          studentId: data.studentId,
          feeStructureId: data.feeStructureId,
        },
      },
      create: data,
      update: {
        baseAmount: data.baseAmount,
        scholarshipAmount: data.scholarshipAmount,
        discountAmount: data.discountAmount,
        lateFineAmount: data.lateFineAmount,
        netPayable: data.netPayable,
        paidAmount: data.paidAmount,
        outstandingAmount: data.outstandingAmount,
        status: data.status,
      },
      include: {
        feeStructure: {
          include: { components: true },
        },
      },
    });
  }

  async findDefectConfig(defectKey: string) {
    return prisma.defectSimulation.findUnique({
      where: { defectKey },
    });
  }
}
