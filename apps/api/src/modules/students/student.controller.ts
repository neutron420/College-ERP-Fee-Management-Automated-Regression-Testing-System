import type { Request, Response, NextFunction } from 'express';
import { StudentService } from './student.service.js';
import { successResponse } from '@repo/shared';

const service = new StudentService();

export class StudentController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await service.getStudents(req.query as any);
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
      const student = await service.getStudentById(req.params.id as string);
      res.json(successResponse(student));
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const student = await service.createStudent(req.body);
      res.status(201).json(successResponse(student));
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const student = await service.updateStudent(req.params.id as string, req.body);
      res.json(successResponse(student));
    } catch (err) {
      next(err);
    }
  }
}
