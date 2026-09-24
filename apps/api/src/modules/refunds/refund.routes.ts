import { Router } from 'express';
import { RefundController } from './refund.controller.js';
import { validate } from '../../middleware/validate.js';
import { createRefundSchema } from './refund.schema.js';

const router = Router();
const controller = new RefundController();

router.post('/', validate({ body: createRefundSchema }), controller.create);

export const refundRoutes = router;
