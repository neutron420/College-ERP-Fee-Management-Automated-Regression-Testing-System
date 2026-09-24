import type { Request, Response, NextFunction } from 'express';
import { ReportService } from './report.service.js';
import { successResponse } from '@repo/shared';

const service = new ReportService();

export class ReportController {
  async getStudentReport(req: Request, res: Response, next: NextFunction) {
    try {
      const report = await service.getStudentFeeReport(req.params.id as string);
      res.json(successResponse(report));
    } catch (err) {
      next(err);
    }
  }

  async getDepartmentReport(req: Request, res: Response, next: NextFunction) {
    try {
      const report = await service.getDepartmentFeeReport(
        req.params.id as string,
        req.query.academicYearId as string | undefined
      );
      res.json(successResponse(report));
    } catch (err) {
      next(err);
    }
  }

  async getMonthlyReport(req: Request, res: Response, next: NextFunction) {
    try {
      const now = new Date();
      const year = req.query.year ? parseInt(req.query.year as string, 10) : now.getFullYear();
      const month = req.query.month ? parseInt(req.query.month as string, 10) : now.getMonth() + 1;

      const report = await service.getMonthlyCollectionReport(year, month);
      res.json(successResponse(report));
    } catch (err) {
      next(err);
    }
  }

  async getOutstandingReport(req: Request, res: Response, next: NextFunction) {
    try {
      const report = await service.getOutstandingFeeReport(
        req.query.departmentId as string | undefined,
        req.query.academicYearId as string | undefined
      );
      res.json(successResponse(report));
    } catch (err) {
      next(err);
    }
  }
}
