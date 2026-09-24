import { prisma } from '@repo/database';

export class RefundRepository {
  async findPaymentById(paymentId: string) {
    return prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        feeAssessment: true,
        refunds: true,
      },
    });
  }

  async createRefundAndUpdateAssessment(
    refundData: {
      paymentId: string;
      feeAssessmentId: string;
      amount: number;
      reason: string;
      status: any;
    },
    updatedAssessment: {
      paidAmount: number;
      outstandingAmount: number;
      status: any;
    }
  ) {
    return prisma.$transaction(async (tx: any) => {
      const refund = await tx.refund.create({
        data: refundData,
      });

      const assessment = await tx.feeAssessment.update({
        where: { id: refundData.feeAssessmentId },
        data: updatedAssessment,
      });

      return { refund, assessment };
    });
  }
}
