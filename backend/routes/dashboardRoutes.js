import express from 'express';
import { protect } from '../middleware/auth.js';
import { getDashboardStats, getCaloriesChart } from '../controllers/dashboardController.js';

const router = express.Router();

router.use(protect);

router.get('/', getDashboardStats);
router.get('/calories-chart', getCaloriesChart);

export default router;

