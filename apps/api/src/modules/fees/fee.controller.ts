import type { Request, Response, NextFunction } from 'express';
import { FeeService } from './fee.service.js';
import { successResponse } from '@repo/shared';

const service = new FeeService();

export class FeeController {
  async listStructures(req: Request, res: Response, next: NextFunction) {
    try {
      const structures = await service.listFeeStructures({
        departmentId: req.query.departmentId as string | undefined,
        academicYearId: req.query.academicYearId as string | undefined,
      });
      res.json(successResponse(structures));
    } catch (err) {
      next(err);
    }
  }

  async getStructureById(req: Request, res: Response, next: NextFunction) {
    try {
      const structure = await service.getFeeStructureById(req.params.id as string);
      res.json(successResponse(structure));
    } catch (err) {
      next(err);
    }
  }

  async createStructure(req: Request, res: Response, next: NextFunction) {
    try {
      const structure = await service.createFeeStructure(req.body);
      res.status(201).json(successResponse(structure));
    } catch (err) {
      next(err);
    }
  }

  async calculatePreview(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await service.calculatePreview(req.body);
      res.json(successResponse(result));
    } catch (err) {
      next(err);
    }
  }

  async assessStudent(req: Request, res: Response, next: NextFunction) {
    try {
      const { studentId, feeStructureId } = req.body;
      const result = await service.assessStudent(studentId, feeStructureId);
      res.json(successResponse(result));
    } catch (err) {
      next(err);
    }
  }
}
