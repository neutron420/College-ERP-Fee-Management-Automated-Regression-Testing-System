import { Router } from 'express';
import { DepartmentController } from './department.controller.js';
import { validate } from '../../middleware/validate.js';
import {
  createDepartmentSchema,
  updateDepartmentSchema,
  departmentIdParamSchema,
} from './department.schema.js';

const router = Router();
const controller = new DepartmentController();

router.get('/', controller.list);
router.get('/:id', validate({ params: departmentIdParamSchema }), controller.getById);
router.post('/', validate({ body: createDepartmentSchema }), controller.create);
router.patch(
  '/:id',
  validate({ params: departmentIdParamSchema, body: updateDepartmentSchema }),
  controller.update
);

export const departmentRoutes = router;
