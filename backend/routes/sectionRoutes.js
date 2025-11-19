import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  createSection,
  getSections,
  getSectionById,
  updateSection,
  deleteSection,
  getSectionStats
} from '../controllers/sectionController.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .post(createSection)
  .get(getSections);

router.route('/stats')
  .get(getSectionStats);

router.route('/:id')
  .get(getSectionById)
  .put(updateSection)
  .delete(deleteSection);

export default router;

