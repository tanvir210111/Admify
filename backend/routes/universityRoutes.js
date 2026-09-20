import express from 'express';
import {
  getUniversities,
  getUniversityBySlug,
  createUniversity,
  updateUniversity,
  deleteUniversity,
} from '../controllers/universityController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getUniversities)
  .post(protect, authorize('admin'), createUniversity);

router.route('/:slug')
  .get(getUniversityBySlug)
  .put(protect, authorize('admin'), updateUniversity)
  .delete(protect, authorize('admin'), deleteUniversity);

export default router;
