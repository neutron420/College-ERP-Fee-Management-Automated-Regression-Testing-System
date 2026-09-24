import { Router } from 'express';
import { StudentController } from './student.controller.js';
import { validate } from '../../middleware/validate.js';
import {
  createStudentSchema,
  updateStudentSchema,
  studentQuerySchema,
  studentIdParamSchema,
} from './student.schema.js';

const router = Router();
const controller = new StudentController();

router.get('/', validate({ query: studentQuerySchema }), controller.list);
router.get('/:id', validate({ params: studentIdParamSchema }), controller.getById);
router.get('/:id/ledger', validate({ params: studentIdParamSchema }), controller.getLedger);
router.post('/', validate({ body: createStudentSchema }), controller.create);
router.patch(
  '/:id',
  validate({ params: studentIdParamSchema, body: updateStudentSchema }),
  controller.update
);

export const studentRoutes = router;
