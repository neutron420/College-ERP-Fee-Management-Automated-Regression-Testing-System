import { FeeRepository } from './fee.repository.js';
import { calculateStudentFee } from '@repo/fee-engine';
import type { FeeCalculationInput, ReductionInput } from '@repo/types';
import { NotFoundError } from '../../errors/app-error.js';
import { prisma } from '@repo/database';

export class FeeService {
  constructor(private repo = new FeeRepository()) {}

  async listFeeStructures(filter: { departmentId?: string; academicYearId?: string }) {
    return this.repo.findFeeStructures(filter);
  }

  async getFeeStructureById(id: string) {
    const structure = await this.repo.findFeeStructureById(id);
    if (!structure) {
      throw new NotFoundError('FeeStructure', id);
    }
    return structure;
  }

  async createFeeStructure(data: Parameters<FeeRepository['createFeeStructure']>[0]) {
    return this.repo.createFeeStructure(data);
  }

  /**
   * Preview fee calculation using pure @repo/fee-engine
   */
  async calculatePreview(input: FeeCalculationInput) {
    // If defect flags are not explicitly passed, check database state
    if (!input.defectFlags) {
      const activeDefect = await this.repo.findDefectConfig('DOUBLE_LIBRARY_FEE');
      if (activeDefect?.isActive) {
        input.defectFlags = { doubleCountLibraryFee: true };
      }
    }
    return calculateStudentFee(input);
  }

  /**
   * Generates or re-evaluates student fee assessment and persists to database
   */
  async assessStudent(studentId: string, feeStructureId: string) {
    const [student, structure, activeDefect] = await Promise.all([
      prisma.student.findUnique({
        where: { id: studentId },
        include: {
          scholarships: { include: { scholarship: true } },
          discounts: { include: { discount: true } },
          payments: true,
        },
      }),
      this.repo.findFeeStructureById(feeStructureId),
      this.repo.findDefectConfig('DOUBLE_LIBRARY_FEE'),
    ]);

    if (!student) throw new NotFoundError('Student', studentId);
    if (!structure) throw new NotFoundError('FeeStructure', feeStructureId);

    // Fetch existing refunds if any
    const existingAssessment = await this.repo.findAssessment(studentId, feeStructureId);
    const refunds = existingAssessment?.refunds ?? [];

    const scholarships: ReductionInput[] = student.scholarships.map((s: any) => ({
      code: s.scholarship.code,
      name: s.scholarship.name,
      type: s.scholarship.type as any,
      value: Number(s.scholarship.value),
    }));

    const discounts: ReductionInput[] = student.discounts.map((d: any) => ({
      code: d.discount.code,
      name: d.discount.name,
      type: d.discount.type as any,
      value: Number(d.discount.value),
    }));

    const calculation = calculateStudentFee({
      components: structure.components.map((c: any) => ({
        type: c.type as any,
        name: c.name,
        amount: Number(c.amount),
        isOptional: c.isOptional,
      })),
      scholarships,
      discounts,
      dueDate: structure.dueDate,
      graceDays: structure.graceDays,
      finePerDay: Number(structure.finePerDay),
      payments: student.payments.map((p: any) => ({
        amount: Number(p.amount),
        status: p.status as any,
        paymentDate: p.paymentDate,
      })),
      refunds: refunds.map((r: any) => ({
        amount: Number(r.amount),
        status: r.status as any,
      })),
      defectFlags: activeDefect?.isActive
        ? { doubleCountLibraryFee: true }
        : undefined,
    });

    const assessment = await this.repo.upsertAssessment({
      studentId,
      feeStructureId,
      academicYearId: structure.academicYearId,
      baseAmount: calculation.baseAmount,
      scholarshipAmount: calculation.scholarshipAmount,
      discountAmount: calculation.discountAmount,
      lateFineAmount: calculation.lateFineAmount,
      netPayable: calculation.netPayable,
      paidAmount: calculation.netPaidAmount,
      outstandingAmount: calculation.outstandingAmount,
      status: calculation.status as any,
      dueDate: structure.dueDate,
    });

    return {
      assessment,
      calculation,
    };
  }
}
