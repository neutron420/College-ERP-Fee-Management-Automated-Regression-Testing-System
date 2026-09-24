import { Router } from 'express';
import { ReportController } from './report.controller.js';

const router = Router();
const controller = new ReportController();

router.get('/student/:id', controller.getStudentReport);
router.get('/department/:id', controller.getDepartmentReport);
router.get('/monthly', controller.getMonthlyReport);
router.get('/outstanding', controller.getOutstandingReport);

export const reportRoutes = router;
