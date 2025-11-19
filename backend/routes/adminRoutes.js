import express from 'express';
import { adminOnly } from '../middleware/adminAuth.js';
import {
  getUsers,
  getUserById,
  updateUserRole,
  deactivateUser,
  getPendingWorkouts,
  approveWorkout,
  rejectWorkout,
  getPendingExercises,
  approveExercise,
  rejectExercise,
  getAnalytics
} from '../controllers/adminController.js';

const router = express.Router();

router.use(adminOnly);

router.route('/users')
  .get(getUsers);

router.route('/users/:id')
  .get(getUserById)
  .put(updateUserRole);

router.route('/users/:id/deactivate')
  .put(deactivateUser);

router.route('/workouts/pending')
  .get(getPendingWorkouts);

router.route('/workouts/:id/approve')
  .put(approveWorkout);

router.route('/workouts/:id/reject')
  .put(rejectWorkout);

router.route('/exercises/pending')
  .get(getPendingExercises);

router.route('/exercises/:id/approve')
  .put(approveExercise);

router.route('/exercises/:id/reject')
  .put(rejectExercise);

router.route('/analytics')
  .get(getAnalytics);

export default router;

