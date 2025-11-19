import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  createMetrics,
  getMetrics,
  getMetricsHistory,
  getMetricsDashboard,
  updateMetrics,
  deleteMetrics
} from '../controllers/metricsController.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .post(createMetrics)
  .get(getMetrics);

router.route('/history')
  .get(getMetricsHistory);

router.route('/dashboard')
  .get(getMetricsDashboard);

router.route('/:id')
  .put(updateMetrics)
  .delete(deleteMetrics);

export default router;

