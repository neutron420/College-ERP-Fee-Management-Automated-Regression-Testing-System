import { PaymentRepository } from './payment.repository.js';
import { NotFoundError, BusinessRuleViolationError } from '../../errors/app-error.js';
import { addMoney, subtractMoney } from '@repo/shared';
import crypto from 'node:crypto';

export class PaymentService {
  constructor(private repo = new PaymentRepository()) {}

  async listPayments(filter: { studentId?: string; feeAssessmentId?: string; page?: number; limit?: number }) {
    return this.repo.findMany(filter);
  }

  async getPaymentById(id: string) {
    const payment = await this.repo.findById(id);
    if (!payment) throw new NotFoundError('Payment', id);
    return payment;
  }

  async recordPayment(data: {
    feeAssessmentId: string;
    amount: number;
    paymentMethod: any;
    transactionRef?: string;
    remarks?: string;
  }) {
    const assessment = await this.repo.findAssessmentById(data.feeAssessmentId);
    if (!assessment) throw new NotFoundError('FeeAssessment', data.feeAssessmentId);

    const currentOutstanding = Number(assessment.outstandingAmount);
    if (currentOutstanding <= 0) {
      throw new BusinessRuleViolationError('Fee assessment is already fully paid');
    }

    const currentPaid = Number(assessment.paidAmount);
    const netPayable = Number(assessment.netPayable);

    const newPaidAmount = addMoney(currentPaid, data.amount);
    const newOutstandingAmount = Math.max(0, subtractMoney(netPayable, newPaidAmount));

    const status = newOutstandingAmount === 0 ? 'PAID' : 'PARTIALLY_PAID';

    const transactionRef =
      data.transactionRef || `TXN-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    return this.repo.createPaymentAndUpdateAssessment(
      {
        feeAssessmentId: data.feeAssessmentId,
        studentId: assessment.studentId,
        transactionRef,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        remarks: data.remarks,
      },
      {
        paidAmount: newPaidAmount,
        outstandingAmount: newOutstandingAmount,
        status,
      }
    );
  }
}
