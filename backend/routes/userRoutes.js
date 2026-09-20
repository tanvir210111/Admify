import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  getStudents,
  getAgents,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.get('/students', protect, authorize('admin', 'agent', 'agency'), getStudents);
router.get('/agents', protect, authorize('admin'), getAgents);

export default router;
