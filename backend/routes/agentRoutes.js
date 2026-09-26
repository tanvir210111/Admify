import express from 'express';
import {
  getAgentDashboard,
  getAgentStudents,
  getAgentStudentById,
  getAgentApplications,
  updateAgentApplication,
  getAgentDocuments,
  getAgentSopLor,
  updateAgentSopLor,
  getAgentUniversities,
  getAgentMessages,
  sendAgentMessage,
  getAgentTasks,
  createAgentTask,
  updateAgentTask,
  getAgentPerformance,
  getAgentNotifications,
  markAgentNotificationRead,
  getAgentReports,
  createAgentReport,
  getAgentAgency,
  getAgentProfile,
  updateAgentProfile,
  updateAgentSettings,
} from '../controllers/agentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Middleware to ensure user has agent role
const requireAgent = (req, res, next) => {
  if (req.user && req.user.role === 'agent') {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Access restricted to authorized Agent accounts.',
  });
};

// Middleware to ensure agent is active (not suspended)
const requireActiveAgent = (req, res, next) => {
  if (
    req.user &&
    req.user.role === 'agent' &&
    req.user.status !== 'suspended' &&
    req.user.accountStatus !== 'SUSPENDED'
  ) {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Your agent account has been suspended or deactivated by your Agency or Admin.',
  });
};

router.use(protect);
router.use(requireAgent);
router.use(requireActiveAgent);

// ── Agent Routes ─────────────────────────────────────────────────────────────
// Dashboard
router.get('/dashboard', getAgentDashboard);

// Students
router.get('/students', getAgentStudents);
router.get('/students/:id', getAgentStudentById);

// Applications
router.get('/applications', getAgentApplications);
router.put('/applications/:id', updateAgentApplication);

// Documents
router.get('/documents', getAgentDocuments);

// SOP / LOR Assistance
router.get('/sop-lor', getAgentSopLor);
router.put('/sop-lor/:id', updateAgentSopLor);

// Universities & Programs (Read-only for counseling)
router.get('/universities', getAgentUniversities);

// Messaging
router.get('/messages', getAgentMessages);
router.post('/messages', sendAgentMessage);

// Tasks & Deadlines
router.get('/tasks', getAgentTasks);
router.post('/tasks', createAgentTask);
router.put('/tasks/:id', updateAgentTask);

// Performance Analytics
router.get('/performance', getAgentPerformance);

// Notifications
router.get('/notifications', getAgentNotifications);
router.put('/notifications/:id/read', markAgentNotificationRead);

// Reports / Issues
router.get('/reports', getAgentReports);
router.post('/reports', createAgentReport);

// My Agency
router.get('/agency', getAgentAgency);

// My Profile & Settings
router.get('/profile', getAgentProfile);
router.put('/profile', updateAgentProfile);
router.put('/settings', updateAgentSettings);

export default router;
