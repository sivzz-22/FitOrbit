import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getProfile,
  updateProfile,
  changePassword,
  exportData
} from '../controllers/userController.js';

const router = express.Router();

router.use(protect);

router.route('/profile')
  .get(getProfile)
  .put(updateProfile);

router.route('/change-password')
  .put(changePassword);

router.route('/export')
  .get(exportData);

export default router;

