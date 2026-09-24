import type { Request, Response, NextFunction } from 'express';
import { AcademicYearService } from './academic-year.service.js';
import { successResponse } from '@repo/shared';

const service = new AcademicYearService();

export class AcademicYearController {
  async list(_req: Request, res: Response, next: NextFunction) {
    try {
      const years = await service.getAllAcademicYears();
      res.json(successResponse(years));
    } catch (err) {
      next(err);
    }
  }

  async getCurrent(_req: Request, res: Response, next: NextFunction) {
    try {
      const year = await service.getCurrentAcademicYear();
      res.json(successResponse(year));
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const year = await service.getAcademicYearById(req.params.id as string);
      res.json(successResponse(year));
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const year = await service.createAcademicYear(req.body);
      res.status(201).json(successResponse(year));
    } catch (err) {
      next(err);
    }
  }

  async setCurrent(req: Request, res: Response, next: NextFunction) {
    try {
      const year = await service.setCurrentAcademicYear(req.params.id as string);
      res.json(successResponse(year));
    } catch (err) {
      next(err);
    }
  }
}
