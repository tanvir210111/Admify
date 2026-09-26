import express from 'express';
import {
  submitUniRepVerification,
  getUniRepVerification,
  getUniRepProfile,
  updateUniRepProfile,
  getUniRepConnections,
  acceptAgencyConnection,
  rejectAgencyConnection,
  blockAgencyConnection,
  getUniRepDashboard,
  getUniRepUniversity,
  updateUniRepUniversity,
  getUniRepPrograms,
  createUniRepProgram,
  updateUniRepProgram,
  deleteUniRepProgram,
  getUniRepPartnerships,
  getUniRepAgencies,
  getUniRepApplications,
  getUniRepApplicationById,
  getUniRepDocuments,
  getUniRepMessages,
  sendUniRepMessage,
  getUniRepAnnouncements,
  createUniRepAnnouncement,
  updateUniRepAnnouncement,
  deleteUniRepAnnouncement,
  getUniRepScholarships,
  createUniRepScholarship,
  updateUniRepScholarship,
  deleteUniRepScholarship,
  getUniRepIntakes,
  createUniRepIntake,
  updateUniRepIntake,
  deleteUniRepIntake,
  getUniRepAnalytics,
  getUniRepNotifications,
  markUniRepNotificationRead,
  markAllUniRepNotificationsRead,
  getUniRepReports,
  createUniRepReport,
  updateUniRepSettings,
} from '../controllers/universityRepController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

// Middleware to ensure user has university representative role
const requireUniRep = (req, res, next) => {
  const allowedRoles = ['university_rep', 'university representative', 'university'];
  if (req.user && allowedRoles.includes(req.user.role)) {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Access restricted to authorized University Representative accounts.',
  });
};

// Middleware to ensure university representative is active/verified for operational features
const requireActiveUniRep = (req, res, next) => {
  const allowedRoles = ['university_rep', 'university representative', 'university'];
  const isRep = req.user && allowedRoles.includes(req.user.role);
  const isActive =
    req.user &&
    (req.user.accountStatus === 'ACTIVE' ||
     req.user.accountStatus === 'VERIFIED' ||
     req.user.uniRepVerificationStatus === 'ACTIVE' ||
     req.user.uniRepVerificationStatus === 'APPROVED' ||
     req.user.status === 'active' ||
     req.user.isActive === true);

  if (isRep && isActive) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Your University Representative account is pending verification or activation. Access to operational features is blocked until approved and activated.',
  });
};

router.use(requireUniRep);

// Verification routes (supports both pending representatives and scoped registration token)
router.post('/verification', submitUniRepVerification);
router.get('/verification', getUniRepVerification);

// Operational routes require an approved/active University Representative
router.use(requireActiveUniRep);

// Dashboard
router.get('/dashboard', getUniRepDashboard);

// University Profile
router.get('/university', getUniRepUniversity);
router.put('/university', updateUniRepUniversity);

// Programs & Departments (Academic Catalog)
router.get('/programs', getUniRepPrograms);
router.post('/programs', createUniRepProgram);
router.put('/programs/:id', updateUniRepProgram);
router.delete('/programs/:id', deleteUniRepProgram);

// Partnerships & Connected Agencies
router.get('/partnerships', getUniRepPartnerships);
router.post('/partnerships/:id/accept', acceptAgencyConnection);
router.post('/partnerships/:id/reject', rejectAgencyConnection);
router.post('/partnerships/:id/block', blockAgencyConnection);
router.get('/agencies', getUniRepAgencies);

// Connection routes (alias compatibility)
router.get('/connections', getUniRepConnections);
router.post('/connections/:id/accept', acceptAgencyConnection);
router.post('/connections/:id/reject', rejectAgencyConnection);
router.post('/connections/:id/block', blockAgencyConnection);

// Applications & Documents
router.get('/applications', getUniRepApplications);
router.get('/applications/:id', getUniRepApplicationById);
router.get('/documents', getUniRepDocuments);

// Messages
router.get('/messages', getUniRepMessages);
router.post('/messages', sendUniRepMessage);

// Announcements
router.get('/announcements', getUniRepAnnouncements);
router.post('/announcements', createUniRepAnnouncement);
router.put('/announcements/:id', updateUniRepAnnouncement);
router.delete('/announcements/:id', deleteUniRepAnnouncement);

// Scholarships
router.get('/scholarships', getUniRepScholarships);
router.post('/scholarships', createUniRepScholarship);
router.put('/scholarships/:id', updateUniRepScholarship);
router.delete('/scholarships/:id', deleteUniRepScholarship);

// Intakes & Deadlines
router.get('/intakes', getUniRepIntakes);
router.post('/intakes', createUniRepIntake);
router.put('/intakes/:id', updateUniRepIntake);
router.delete('/intakes/:id', deleteUniRepIntake);

// Analytics
router.get('/analytics', getUniRepAnalytics);

// Notifications
router.get('/notifications', getUniRepNotifications);
router.put('/notifications/read-all', markAllUniRepNotificationsRead);
router.put('/notifications/:id/read', markUniRepNotificationRead);

// Reports / Issues
router.get('/reports', getUniRepReports);
router.post('/reports', createUniRepReport);

// Profile & Settings
router.get('/profile', getUniRepProfile);
router.put('/profile', updateUniRepProfile);
router.put('/settings', updateUniRepSettings);

export default router;
