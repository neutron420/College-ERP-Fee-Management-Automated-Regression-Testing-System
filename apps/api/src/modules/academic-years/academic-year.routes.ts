import { Router } from 'express';
import { AcademicYearController } from './academic-year.controller.js';
import { validate } from '../../middleware/validate.js';
import {
  createAcademicYearSchema,
  academicYearIdParamSchema,
} from './academic-year.schema.js';

const router = Router();
const controller = new AcademicYearController();

router.get('/', controller.list);
router.get('/current', controller.getCurrent);
router.get('/:id', validate({ params: academicYearIdParamSchema }), controller.getById);
router.post('/', validate({ body: createAcademicYearSchema }), controller.create);
router.patch('/:id/current', validate({ params: academicYearIdParamSchema }), controller.setCurrent);

export const academicYearRoutes = router;
