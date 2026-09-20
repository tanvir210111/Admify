import express from 'express';
import {
  getScholarships,
  getScholarshipById,
  createScholarship,
  updateScholarship,
  deleteScholarship,
} from '../controllers/scholarshipController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getScholarships)
  .post(protect, authorize('admin'), createScholarship);

router.route('/:id')
  .get(getScholarshipById)
  .put(protect, authorize('admin'), updateScholarship)
  .delete(protect, authorize('admin'), deleteScholarship);

export default router;
