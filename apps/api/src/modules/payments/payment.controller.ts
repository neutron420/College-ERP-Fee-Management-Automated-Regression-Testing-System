import type { Request, Response, NextFunction } from 'express';
import { PaymentService } from './payment.service.js';
import { successResponse } from '@repo/shared';

const service = new PaymentService();

export class PaymentController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await service.listPayments(req.query as any);
      res.json(
        successResponse(result.items, {
          page: result.page,
          limit: result.limit,
          total: result.total,
        })
      );
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const payment = await service.getPaymentById(req.params.id as string);
      res.json(successResponse(payment));
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await service.recordPayment(req.body);
      res.status(201).json(successResponse(result));
    } catch (err) {
      next(err);
    }
  }
}
