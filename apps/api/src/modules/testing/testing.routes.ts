import { Router } from 'express';
import { TestingController } from './testing.controller.js';

const router = Router();
const controller = new TestingController();

router.get('/suites', controller.getSuites);
router.get('/test-cases', controller.getTestCases);
router.post('/runs', controller.runSuite);
router.get('/runs', controller.listRuns);
router.get('/runs/:id', controller.getRunById);
router.get('/compare', controller.compareRuns);
router.get('/defects', controller.getDefectStatus);
router.post('/defects/toggle', controller.toggleDefect);

export const testingRoutes = router;
