import express from 'express';
import {
  getAgencyVerification,
  saveAgencyDraft,
  submitAgencyVerification,
  resubmitAgencyVerification,
  createAgentApplication,
  getAgencyAgentApplications,
  createAgencyUniversityConnection,
  getAgencyUniversityConnections,
  getVerifiedUniversityReps,
  getAgencyDashboard,
  getAgencyAgents,
  updateAgencyAgentStatus,
  getAgencyStudents,
  getAgencyApplications,
  updateAgencyApplication,
  getAgencyServiceRequests,
  updateAgencyServiceRequest,
  cancelAgencyUniversityConnection,
  getAgencyMessages,
  sendAgencyMessage,
  getAgencyDocuments,
  uploadAgencyDocument,
  getAgencyPerformance,
  getAgencyNotifications,
  markAgencyNotificationRead,
  getAgencyReports,
  submitAgencyReportResponse,
  getAgencyServiceHistory,
  getAgencyProfile,
  updateAgencyProfile,
  updateAgencySettings,
  getAgencySidebarCounts,
  getAgencyStatusCounts,
  markAgencyEntityAsSeen,
  markAgencyEntityAsSeenPost,
} from '../controllers/agencyController.js';
import { protect } from '../middleware/authMiddleware.js';
import { resolveAuthenticatedAgency } from '../utils/agencyResolver.js';
import { handleAttachmentUpload } from '../middleware/attachmentMiddleware.js';

const router = express.Router();

// Middleware to ensure user has agency role and resolve agency context
const requireAgency = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    const agencyContext = await resolveAuthenticatedAgency(req.user);
    if (!agencyContext) {
      return res.status(403).json({
        success: false,
        message: 'Access restricted to registered Agency accounts.',
      });
    }

    req.agencyContext = agencyContext;
    return next();
  } catch (error) {
    console.error('[Agency Auth Error]', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to authorize agency account.',
      error: error.message,
    });
  }
};

// Middleware to ensure agency is verified/active for operational features
const requireVerifiedAgency = async (req, res, next) => {
  try {
    const agencyContext = req.agencyContext || (await resolveAuthenticatedAgency(req.user));
    if (!agencyContext) {
      return res.status(403).json({
        success: false,
        message: 'Access restricted to registered Agency accounts.',
      });
    }

    req.agencyContext = agencyContext;

    if (!agencyContext.isVerified || !agencyContext.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your agency account is pending verification or inactive. Operational access is restricted until approved by Admin.',
      });
    }

    return next();
  } catch (error) {
    console.error('[Agency Verification Gate Error]', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify operational agency status.',
      error: error.message,
    });
  }
};

router.use(protect);
router.use(requireAgency);

// ── Verification / Compliance Routes (Open to any registered Agency) ──
router.get('/verification', getAgencyVerification);
router.put('/verification/draft', saveAgencyDraft);
router.post('/verification', submitAgencyVerification);
router.post('/verification/resubmit', resubmitAgencyVerification);

// ── Seen / Unseen Tracking & Sidebar Badge Counts ──
router.get('/sidebar-counts', requireAgency, getAgencySidebarCounts);
router.get('/status-counts', requireAgency, getAgencyStatusCounts);
router.put('/seen/:entityType/:entityId', requireAgency, markAgencyEntityAsSeen);
router.post('/seen/:entityType/:entityId', requireAgency, markAgencyEntityAsSeen);
router.post('/seen', requireAgency, markAgencyEntityAsSeenPost);
router.put('/seen', requireAgency, markAgencyEntityAsSeenPost);

// ── Operational Routes (Require Verified & Active Agency) ──
// Dashboard
router.get('/dashboard', requireVerifiedAgency, getAgencyDashboard);

// Agents Management
router.get('/agents', requireVerifiedAgency, getAgencyAgents);
router.put('/agents/:id/status', requireVerifiedAgency, updateAgencyAgentStatus);
router.post('/agent-applications', requireVerifiedAgency, createAgentApplication);
router.get('/agent-applications', requireVerifiedAgency, getAgencyAgentApplications);

// Students Management
router.get('/students', requireVerifiedAgency, getAgencyStudents);

// Applications Management
router.get('/applications', requireVerifiedAgency, getAgencyApplications);
router.put('/applications/:id', requireVerifiedAgency, updateAgencyApplication);

// Service Requests (Credit-based: 800 CR Assistance, 1500 CR Full Managed)
router.get('/service-requests', requireVerifiedAgency, getAgencyServiceRequests);
router.put('/service-requests/:id', requireVerifiedAgency, updateAgencyServiceRequest);

// University Partnerships
router.get('/verified-universities', requireVerifiedAgency, getVerifiedUniversityReps);
router.post('/university-connections', requireVerifiedAgency, createAgencyUniversityConnection);
router.get('/university-connections', requireVerifiedAgency, getAgencyUniversityConnections);
router.delete('/university-connections/:id', requireVerifiedAgency, cancelAgencyUniversityConnection);

// Messaging
router.get('/messages', requireVerifiedAgency, getAgencyMessages);
router.post('/messages', requireVerifiedAgency, handleAttachmentUpload('attachment'), sendAgencyMessage);

// Documents
router.get('/documents', requireVerifiedAgency, getAgencyDocuments);
router.post('/documents', requireVerifiedAgency, uploadAgencyDocument);

// Performance Analytics
router.get('/performance', requireVerifiedAgency, getAgencyPerformance);

// Notifications
router.get('/notifications', requireVerifiedAgency, getAgencyNotifications);
router.put('/notifications/:id/read', requireVerifiedAgency, markAgencyNotificationRead);

// Reports / Issues
router.get('/reports', requireVerifiedAgency, getAgencyReports);
router.post('/reports/:id/respond', requireVerifiedAgency, submitAgencyReportResponse);

// Service History
router.get('/service-history', requireVerifiedAgency, getAgencyServiceHistory);

// Profile & Settings
router.get('/profile', requireVerifiedAgency, getAgencyProfile);
router.put('/profile', requireVerifiedAgency, updateAgencyProfile);
router.put('/settings', requireVerifiedAgency, updateAgencySettings);

export default router;

