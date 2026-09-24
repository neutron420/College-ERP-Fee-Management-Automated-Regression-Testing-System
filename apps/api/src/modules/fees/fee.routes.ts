import { Router } from 'express';
import { FeeController } from './fee.controller.js';
import { validate } from '../../middleware/validate.js';
import {
  createFeeStructureSchema,
  calculateFeePreviewSchema,
  assessStudentSchema,
} from './fee.schema.js';

const router = Router();
const controller = new FeeController();

router.get('/structures', controller.listStructures);
router.get('/structures/:id', controller.getStructureById);
router.post('/structures', validate({ body: createFeeStructureSchema }), controller.createStructure);
router.post('/calculate', validate({ body: calculateFeePreviewSchema }), controller.calculatePreview);
router.post('/assess', validate({ body: assessStudentSchema }), controller.assessStudent);

export const feeRoutes = router;
