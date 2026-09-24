import { prisma } from '@repo/database';

export class PaymentRepository {
  async findMany(filter: { studentId?: string; feeAssessmentId?: string; page?: number; limit?: number }) {
    const { studentId, feeAssessmentId, page = 1, limit = 20 } = filter;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (studentId) where.studentId = studentId;
    if (feeAssessmentId) where.feeAssessmentId = feeAssessmentId;

    const [items, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: limit,
        include: {
          student: true,
          feeAssessment: true,
          refunds: true,
        },
        orderBy: { paymentDate: 'desc' },
      }),
      prisma.payment.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async findById(id: string) {
    return prisma.payment.findUnique({
      where: { id },
      include: {
        student: true,
        feeAssessment: true,
        refunds: true,
      },
    });
  }

  async findAssessmentById(id: string) {
    return prisma.feeAssessment.findUnique({
      where: { id },
    });
  }

  async createPaymentAndUpdateAssessment(
    paymentData: {
      feeAssessmentId: string;
      studentId: string;
      transactionRef: string;
      amount: number;
      paymentMethod: any;
      remarks?: string;
    },
    updatedAssessment: {
      paidAmount: number;
      outstandingAmount: number;
      status: any;
    }
  ) {
    return prisma.$transaction(async (tx: any) => {
      const payment = await tx.payment.create({
        data: paymentData,
      });

      const assessment = await tx.feeAssessment.update({
        where: { id: paymentData.feeAssessmentId },
        data: updatedAssessment,
      });

      return { payment, assessment };
    });
  }
}
