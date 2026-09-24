import { Router } from 'express';
import { departmentRoutes } from '../modules/departments/department.routes.js';
import { academicYearRoutes } from '../modules/academic-years/academic-year.routes.js';
import { studentRoutes } from '../modules/students/student.routes.js';
import { feeRoutes } from '../modules/fees/fee.routes.js';
import { paymentRoutes } from '../modules/payments/payment.routes.js';
import { refundRoutes } from '../modules/refunds/refund.routes.js';
import { reportRoutes } from '../modules/reports/report.routes.js';
import { testingRoutes } from '../modules/testing/testing.routes.js';

const router = Router();

router.use('/departments', departmentRoutes);
router.use('/academic-years', academicYearRoutes);
router.use('/students', studentRoutes);
router.use('/fees', feeRoutes);
router.use('/payments', paymentRoutes);
router.use('/refunds', refundRoutes);
router.use('/reports', reportRoutes);
router.use('/testing', testingRoutes);

export const apiRouter = router;
