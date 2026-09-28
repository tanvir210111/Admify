import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getStudentSidebarCounts,
  getStudentStatusCounts,
  markStudentEntityAsSeen,
  markStudentEntityAsSeenPost,
} from '../controllers/studentController.js';

const router = express.Router();

// Strict RBAC: access restricted exclusively to authenticated Student accounts
const requireStudent = (req, res, next) => {
  if (req.user && req.user.role === 'student') {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Access restricted to authorized Student accounts.',
  });
};

router.use(protect);
router.use(requireStudent);

router.get('/sidebar-counts', getStudentSidebarCounts);
router.get('/status-counts', getStudentStatusCounts);
router.put('/seen/:entityType/:entityId', markStudentEntityAsSeen);
router.post('/seen', markStudentEntityAsSeenPost);

export default router;
