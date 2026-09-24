import { prisma } from '@repo/database';
import { calculateStudentFee } from '@repo/fee-engine';
import { roundMoney, addMoney, subtractMoney } from '@repo/shared';
import type {
  DepartmentFeeReportDTO,
  StudentFeeReportDTO,
  MonthlyCollectionReportDTO,
  OutstandingFeeReportDTO,
  ReductionInput,
  PaymentMethod,
} from '@repo/types';
import { NotFoundError } from '../../errors/app-error.js';

export class ReportService {
  /**
   * Helper to fetch active defect flags from database
   */
  private async getDefectFlags() {
    const defect = await prisma.defectSimulation.findUnique({
      where: { defectKey: 'DOUBLE_LIBRARY_FEE' },
    });
    return defect?.isActive ? { doubleCountLibraryFee: true } : undefined;
  }

  /**
   * 1. Student Fee Report
   */
  async getStudentFeeReport(studentId: string): Promise<StudentFeeReportDTO> {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        department: true,
        academicYear: true,
        scholarships: { include: { scholarship: true } },
        discounts: { include: { discount: true } },
        feeAssessments: {
          include: {
            feeStructure: { include: { components: true } },
            payments: true,
            refunds: true,
          },
        },
        payments: true,
      },
    });

    if (!student) throw new NotFoundError('Student', studentId);

    const latestAssessment = student.feeAssessments[0];
    if (!latestAssessment) {
      throw new NotFoundError('Fee assessment for student', studentId);
    }

    const structure = latestAssessment.feeStructure;
    const defectFlags = await this.getDefectFlags();

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
      payments: latestAssessment.payments.map((p: any) => ({
        amount: Number(p.amount),
        status: p.status as any,
        paymentDate: p.paymentDate,
      })),
      refunds: latestAssessment.refunds.map((r: any) => ({
        amount: Number(r.amount),
        status: r.status as any,
      })),
      defectFlags,
    });

    return {
      student: {
        id: student.id,
        rollNumber: student.rollNumber,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        phone: student.phone,
        status: student.status as any,
        departmentId: student.departmentId,
        academicYearId: student.academicYearId,
        department: student.department as any,
        academicYear: student.academicYear as any,
        createdAt: student.createdAt.toISOString(),
        updatedAt: student.updatedAt.toISOString(),
      },
      assessment: {
        id: latestAssessment.id,
        studentId: latestAssessment.studentId,
        feeStructureId: latestAssessment.feeStructureId,
        academicYearId: latestAssessment.academicYearId,
        baseAmount: calculation.baseAmount,
        scholarshipAmount: calculation.scholarshipAmount,
        discountAmount: calculation.discountAmount,
        lateFineAmount: calculation.lateFineAmount,
        netPayable: calculation.netPayable,
        paidAmount: calculation.netPaidAmount,
        outstandingAmount: calculation.outstandingAmount,
        status: calculation.status,
        assessmentDate: latestAssessment.assessmentDate.toISOString(),
        dueDate: latestAssessment.dueDate.toISOString(),
      },
      components: structure.components.map((c: any) => ({
        type: c.type as any,
        name: c.name,
        amount: Number(c.amount),
      })),
      scholarships,
      discounts,
      payments: latestAssessment.payments.map((p: any) => ({
        id: p.id,
        feeAssessmentId: p.feeAssessmentId,
        studentId: p.studentId,
        transactionRef: p.transactionRef,
        amount: Number(p.amount),
        paymentMethod: p.paymentMethod as any,
        status: p.status as any,
        paymentDate: p.paymentDate.toISOString(),
      })),
      refunds: latestAssessment.refunds.map((r: any) => ({
        id: r.id,
        paymentId: r.paymentId,
        feeAssessmentId: r.feeAssessmentId,
        amount: Number(r.amount),
        reason: r.reason,
        status: r.status as any,
        processedAt: r.processedAt.toISOString(),
      })),
      calculation,
    };
  }

  /**
   * 2. Department Fee Report
   * Aggregates all students using the shared pure Fee Engine!
   */
  async getDepartmentFeeReport(
    departmentId: string,
    academicYearId?: string
  ): Promise<DepartmentFeeReportDTO> {
    const department = await prisma.department.findUnique({
      where: { id: departmentId },
    });
    if (!department) throw new NotFoundError('Department', departmentId);

    const year = academicYearId
      ? await prisma.academicYear.findUnique({ where: { id: academicYearId } })
      : await prisma.academicYear.findFirst({ where: { isCurrent: true } });

    if (!year) throw new NotFoundError('AcademicYear', academicYearId);

    const students = await prisma.student.findMany({
      where: {
        departmentId,
        academicYearId: year.id,
      },
      include: {
        scholarships: { include: { scholarship: true } },
        discounts: { include: { discount: true } },
        feeAssessments: {
          where: { academicYearId: year.id },
          include: {
            feeStructure: { include: { components: true } },
            payments: true,
            refunds: true,
          },
        },
      },
      orderBy: { rollNumber: 'asc' },
    });

    const defectFlags = await this.getDefectFlags();

    let totalGrossBilled = 0;
    let totalScholarships = 0;
    let totalDiscounts = 0;
    let totalLateFines = 0;
    let netReceivable = 0;
    let totalCollected = 0;
    let totalRefunded = 0;
    let netCollected = 0;
    let totalOutstanding = 0;

    const studentSummaries = [];

    for (const student of students) {
      const assessment = student.feeAssessments[0];
      if (!assessment) continue;

      const structure = assessment.feeStructure;

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

      // Invariant: Delegate math strictly to the Fee Engine
      const calc = calculateStudentFee({
        components: structure.components.map((c: any) => ({
          type: c.type as any,
          name: c.name,
          amount: Number(c.amount),
        })),
        scholarships,
        discounts,
        dueDate: structure.dueDate,
        graceDays: structure.graceDays,
        finePerDay: Number(structure.finePerDay),
        payments: assessment.payments.map((p: any) => ({
          amount: Number(p.amount),
          status: p.status as any,
          paymentDate: p.paymentDate,
        })),
        refunds: assessment.refunds.map((r: any) => ({
          amount: Number(r.amount),
          status: r.status as any,
        })),
        defectFlags,
      });

      totalGrossBilled = addMoney(totalGrossBilled, calc.baseAmount);
      totalScholarships = addMoney(totalScholarships, calc.scholarshipAmount);
      totalDiscounts = addMoney(totalDiscounts, calc.discountAmount);
      totalLateFines = addMoney(totalLateFines, calc.lateFineAmount);
      netReceivable = addMoney(netReceivable, calc.netPayable);
      totalCollected = addMoney(totalCollected, calc.grossPaidAmount);
      totalRefunded = addMoney(totalRefunded, calc.refundedAmount);
      netCollected = addMoney(netCollected, calc.netPaidAmount);
      totalOutstanding = addMoney(totalOutstanding, calc.outstandingAmount);

      studentSummaries.push({
        studentId: student.id,
        rollNumber: student.rollNumber,
        name: `${student.firstName} ${student.lastName}`,
        grossBilled: calc.baseAmount,
        concessions: calc.totalConcessions,
        fines: calc.lateFineAmount,
        netPayable: calc.netPayable,
        paid: calc.netPaidAmount,
        outstanding: calc.outstandingAmount,
        status: calc.status,
      });
    }

    const collectionPercentage =
      netReceivable > 0 ? roundMoney((netCollected / netReceivable) * 100) : 0;

    return {
      department: {
        id: department.id,
        code: department.code,
        name: department.name,
        description: department.description,
        status: department.status,
        createdAt: department.createdAt.toISOString(),
        updatedAt: department.updatedAt.toISOString(),
      },
      academicYear: {
        id: year.id,
        yearCode: year.yearCode,
        startDate: year.startDate.toISOString(),
        endDate: year.endDate.toISOString(),
        isCurrent: year.isCurrent,
        createdAt: year.createdAt.toISOString(),
        updatedAt: year.updatedAt.toISOString(),
      },
      summary: {
        totalStudents: studentSummaries.length,
        totalGrossBilled,
        totalScholarships,
        totalDiscounts,
        totalLateFines,
        netReceivable,
        totalCollected,
        totalRefunded,
        netCollected,
        totalOutstanding,
        collectionPercentage,
      },
      studentSummaries,
    };
  }

  /**
   * 3. Monthly Collection Report
   */
  async getMonthlyCollectionReport(year: number, month: number): Promise<MonthlyCollectionReportDTO> {
    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

    const [payments, refunds] = await Promise.all([
      prisma.payment.findMany({
        where: {
          status: 'SUCCESS',
          paymentDate: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
      prisma.refund.findMany({
        where: {
          status: 'PROCESSED',
          processedAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
    ]);

    let grossCollected = 0;
    const methodBreakdown: Record<PaymentMethod, number> = {
      CASH: 0,
      BANK_TRANSFER: 0,
      UPI: 0,
      CREDIT_CARD: 0,
      DEBIT_CARD: 0,
      DEMAND_DRAFT: 0,
    };

    for (const p of payments) {
      const amt = Number(p.amount);
      grossCollected = addMoney(grossCollected, amt);
      const method = p.paymentMethod as PaymentMethod;
      methodBreakdown[method] = addMoney(methodBreakdown[method] || 0, amt);
    }

    const totalRefunded = refunds.reduce((sum: number, r: any) => addMoney(sum, Number(r.amount)), 0);
    const netCollected = subtractMoney(grossCollected, totalRefunded);

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];

    return {
      year,
      month,
      monthName: monthNames[month - 1] || 'Unknown',
      totalTransactions: payments.length,
      grossCollected,
      totalRefunded,
      netCollected,
      methodBreakdown,
    };
  }

  /**
   * 4. Outstanding Fee Report
   */
  async getOutstandingFeeReport(departmentId?: string, academicYearId?: string): Promise<OutstandingFeeReportDTO> {
    const where: any = {};
    if (departmentId) where.departmentId = departmentId;
    if (academicYearId) where.academicYearId = academicYearId;

    const students = await prisma.student.findMany({
      where,
      include: {
        department: true,
        scholarships: { include: { scholarship: true } },
        discounts: { include: { discount: true } },
        feeAssessments: {
          include: {
            feeStructure: { include: { components: true } },
            payments: true,
            refunds: true,
          },
        },
      },
    });

    const defectFlags = await this.getDefectFlags();
    const records = [];
    let totalOutstandingAmount = 0;

    for (const student of students) {
      const assessment = student.feeAssessments[0];
      if (!assessment) continue;

      const structure = assessment.feeStructure;

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

      const calc = calculateStudentFee({
        components: structure.components.map((c: any) => ({
          type: c.type as any,
          name: c.name,
          amount: Number(c.amount),
        })),
        scholarships,
        discounts,
        dueDate: structure.dueDate,
        graceDays: structure.graceDays,
        finePerDay: Number(structure.finePerDay),
        payments: assessment.payments.map((p: any) => ({
          amount: Number(p.amount),
          status: p.status as any,
          paymentDate: p.paymentDate,
        })),
        refunds: assessment.refunds.map((r: any) => ({
          amount: Number(r.amount),
          status: r.status as any,
        })),
        defectFlags,
      });

      if (calc.outstandingAmount > 0) {
        totalOutstandingAmount = addMoney(totalOutstandingAmount, calc.outstandingAmount);
        records.push({
          studentId: student.id,
          rollNumber: student.rollNumber,
          name: `${student.firstName} ${student.lastName}`,
          departmentCode: student.department.code,
          netPayable: calc.netPayable,
          paidAmount: calc.netPaidAmount,
          outstandingAmount: calc.outstandingAmount,
          dueDate: structure.dueDate.toISOString(),
          overdueDays: calc.lateDays,
          status: calc.status,
        });
      }
    }

    return {
      totalDelinquentStudents: records.length,
      totalOutstandingAmount,
      records,
    };
  }
}
