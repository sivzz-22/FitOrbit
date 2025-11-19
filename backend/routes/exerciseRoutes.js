import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  createExercise,
  getExercises,
  getExerciseById,
  updateExercise,
  deleteExercise
} from '../controllers/exerciseController.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .post(createExercise)
  .get(getExercises);

router.route('/:id')
  .get(getExerciseById)
  .put(updateExercise)
  .delete(deleteExercise);

export default router;

