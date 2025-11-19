import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  createWorkout,
  getWorkouts,
  getWorkoutById,
  updateWorkout,
  deleteWorkout,
  completeWorkout,
  getTodaysWorkouts,
  startWorkout
} from '../controllers/workoutController.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .post(createWorkout)
  .get(getWorkouts);

router.route('/today')
  .get(getTodaysWorkouts);

router.route('/:id')
  .get(getWorkoutById)
  .put(updateWorkout)
  .delete(deleteWorkout);

router.route('/:id/complete')
  .put(completeWorkout);

router.route('/:id/start')
  .post(startWorkout);

export default router;

