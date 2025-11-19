import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getActiveSession,
  completeSet,
  updateProgress,
  completeSession
} from '../controllers/workoutSessionController.js';

const router = express.Router();

router.use(protect);

router.get('/active', getActiveSession);
router.post('/:id/complete-set', completeSet);
router.put('/:id/progress', updateProgress);
router.put('/:id/complete', completeSession);

export default router;

