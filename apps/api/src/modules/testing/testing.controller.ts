import type { Request, Response, NextFunction } from 'express';
import { TestingService } from './testing.service.js';
import { successResponse } from '@repo/shared';

const service = new TestingService();

export class TestingController {
  async getSuites(_req: Request, res: Response, next: NextFunction) {
    try {
      const suites = await service.getSuites();
      res.json(successResponse(suites));
    } catch (err) {
      next(err);
    }
  }

  async getTestCases(req: Request, res: Response, next: NextFunction) {
    try {
      const cases = await service.getTestCases(req.query.suiteCode as string | undefined);
      res.json(successResponse(cases));
    } catch (err) {
      next(err);
    }
  }

  async runSuite(req: Request, res: Response, next: NextFunction) {
    try {
      const { suiteCode, triggerSource } = req.body;
      const run = await service.executeSuite(suiteCode, triggerSource);
      res.status(201).json(successResponse(run));
    } catch (err) {
      next(err);
    }
  }

  async listRuns(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const runs = await service.listRuns(limit);
      res.json(successResponse(runs));
    } catch (err) {
      next(err);
    }
  }

  async getRunById(req: Request, res: Response, next: NextFunction) {
    try {
      const run = await service.getRunById(req.params.id as string);
      res.json(successResponse(run));
    } catch (err) {
      next(err);
    }
  }

  async compareRuns(req: Request, res: Response, next: NextFunction) {
    try {
      const { baseRunId, candidateRunId } = req.query;
      if (!baseRunId || !candidateRunId) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'baseRunId and candidateRunId query parameters are required',
          },
        });
      }

      const comparison = await service.compareRuns(
        baseRunId as string,
        candidateRunId as string
      );
      res.json(successResponse(comparison));
    } catch (err) {
      next(err);
    }
  }

  async getDefectStatus(_req: Request, res: Response, next: NextFunction) {
    try {
      const defect = await service.getDefectStatus();
      res.json(successResponse(defect));
    } catch (err) {
      next(err);
    }
  }

  async toggleDefect(req: Request, res: Response, next: NextFunction) {
    try {
      const { defectKey = 'DOUBLE_LIBRARY_FEE', isActive } = req.body;
      const defect = await service.toggleDefect(defectKey, Boolean(isActive));
      res.json(successResponse(defect));
    } catch (err) {
      next(err);
    }
  }
}
