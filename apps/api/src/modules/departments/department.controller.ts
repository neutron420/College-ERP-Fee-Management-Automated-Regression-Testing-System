import type { Request, Response, NextFunction } from 'express';
import { DepartmentService } from './department.service.js';
import { successResponse } from '@repo/shared';

const service = new DepartmentService();

export class DepartmentController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const departments = await service.getAllDepartments();
      res.json(successResponse(departments));
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const department = await service.getDepartmentById(req.params.id as string);
      res.json(successResponse(department));
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const department = await service.createDepartment(req.body);
      res.status(201).json(successResponse(department));
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const department = await service.updateDepartment(req.params.id as string, req.body);
      res.json(successResponse(department));
    } catch (err) {
      next(err);
    }
  }
}
