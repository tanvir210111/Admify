import express from 'express';
import {
  getMyApplications,
  getAllApplications,
  createApplication,
  updateApplicationStatus,
} from '../controllers/applicationController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/my', protect, getMyApplications);
router.get('/', protect, authorize('admin', 'agent', 'agency', 'university'), getAllApplications);
router.post('/', protect, createApplication);
router.put('/:id/status', protect, authorize('admin', 'agent', 'agency', 'university'), updateApplicationStatus);

export default router;
