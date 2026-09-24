import type { Request, Response, NextFunction } from 'express';
import { RefundService } from './refund.service.js';
import { successResponse } from '@repo/shared';

const service = new RefundService();

export class RefundController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await service.processRefund(req.body);
      res.status(201).json(successResponse(result));
    } catch (err) {
      next(err);
    }
  }
}
