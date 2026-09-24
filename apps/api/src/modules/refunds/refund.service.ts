import { RefundRepository } from './refund.repository.js';
import { NotFoundError, BusinessRuleViolationError } from '../../errors/app-error.js';
import { addMoney, subtractMoney } from '@repo/shared';

export class RefundService {
  constructor(private repo = new RefundRepository()) {}

  async processRefund(data: { paymentId: string; amount: number; reason: string }) {
    const payment = await this.repo.findPaymentById(data.paymentId);
    if (!payment) throw new NotFoundError('Payment', data.paymentId);

    if (payment.status !== 'SUCCESS') {
      throw new BusinessRuleViolationError('Refunds can only be issued against successful payments');
    }

    const previousRefunds = payment.refunds.reduce((sum: number, r: any) => {
      if (r.status === 'PROCESSED' || r.status === 'APPROVED') {
        return sum + Number(r.amount);
      }
      return sum;
    }, 0);

    const availableToRefund = subtractMoney(Number(payment.amount), previousRefunds);
    if (data.amount > availableToRefund) {
      throw new BusinessRuleViolationError(
        `Refund amount ₹${data.amount} exceeds remaining refundable payment balance of ₹${availableToRefund}`
      );
    }

    const assessment = payment.feeAssessment;
    const currentPaid = Number(assessment.paidAmount);
    const netPayable = Number(assessment.netPayable);

    const newPaidAmount = Math.max(0, subtractMoney(currentPaid, data.amount));
    const newOutstandingAmount = Math.max(0, subtractMoney(netPayable, newPaidAmount));
    const newStatus = newPaidAmount === 0 ? 'UNPAID' : 'PARTIALLY_PAID';

    return this.repo.createRefundAndUpdateAssessment(
      {
        paymentId: data.paymentId,
        feeAssessmentId: payment.feeAssessmentId,
        amount: data.amount,
        reason: data.reason,
        status: 'PROCESSED',
      },
      {
        paidAmount: newPaidAmount,
        outstandingAmount: newOutstandingAmount,
        status: newStatus,
      }
    );
  }
}
