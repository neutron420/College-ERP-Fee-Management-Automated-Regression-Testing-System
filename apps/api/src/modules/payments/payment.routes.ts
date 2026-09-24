import { Router } from 'express';
import { PaymentController } from './payment.controller.js';
import { validate } from '../../middleware/validate.js';
import { createPaymentSchema, paymentQuerySchema } from './payment.schema.js';

const router = Router();
const controller = new PaymentController();

router.get('/', validate({ query: paymentQuerySchema }), controller.list);
router.get('/:id', controller.getById);
router.post('/', validate({ body: createPaymentSchema }), controller.create);

export const paymentRoutes = router;
