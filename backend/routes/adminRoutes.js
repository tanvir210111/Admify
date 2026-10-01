import express from 'express';
import {
  getAdminStats,
  getAdminSidebarCounts,
  getAdminStatusCounts,
  markAdminEntityAsSeen,
  globalAdminSearch,
  getAdminUsers,
  getAdminUserById,
  updateAdminUser,
  deleteAdminUser,
  adjustUserCredits,
  getAdminCreditTransactions,
  syncWelcomeCreditLedger,
  getAdminApplications,
  updateAdminApplication,
  getAdminPartnerships,
  updateAdminPartnershipStatus,
  getAdminUniversities,
  createAdminUniversity,
  updateAdminUniversity,
  deleteAdminUniversity,
  getAdminScholarships,
  createAdminScholarship,
  updateAdminScholarship,
  deleteAdminScholarship,
  getAdminCoupons,
  createAdminCoupon,
  updateAdminCoupon,
  deleteAdminCoupon,
  getAdminCountries,
  createAdminCountry,
  updateAdminCountry,
  deleteAdminCountry,
  getAdminReports,
  updateAdminReport,
  getAdminSupportConversations,
  getAdminSupportMessages,
  replyAdminSupportConversation,
  getAdminNotifications,
  broadcastAdminNotification,
  getAdminAIMetrics,
  getAdminAuditLogs,
  getAdminPlatformSettings,
  updateAdminPlatformSettings,
  getAdminAccounts,
  createAdminAccount,
  getAllPaymentOrders,
  approvePaymentOrder,
  rejectPaymentOrder,
  getAllAgencyOrders,
  assignAgencyToOrder,
  getAllAgencyVerifications,
  getAgencyVerificationDetails,
  updateAgencyVerificationStatus,
  deleteAgencyVerification,
  getAdminAgents,
  getAdminAgentApplications,
  getAdminAgentApplicationById,
  approveAgentApplication,
  rejectAgentApplication,
  getAdminUniRepApplications,
  getAdminUniRepApplicationById,
  approveUniRepApplication,
  rejectUniRepApplication,
  deleteUniRepApplication,
  getAdminSupervisoryConversations,
  getAdminSupervisoryConversationTimeline,
  getAdminSupervisoryAttachment,
} from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Strict Admin Gate: Valid JWT + Active User + Admin Role
router.use(protect, authorize('admin'));

// Dashboard Metrics & Global Search
router.get('/stats', getAdminStats);
router.get('/dashboard', getAdminStats);
router.get('/sidebar-counts', getAdminSidebarCounts);
router.get('/status-counts', getAdminStatusCounts);
router.put('/seen/:entityType/:entityId', markAdminEntityAsSeen);
router.post('/seen', markAdminEntityAsSeen);
router.get('/search', globalAdminSearch);

// Central User Management
router.get('/users', getAdminUsers);
router.get('/users/:id', getAdminUserById);
router.put('/users/:id', updateAdminUser);
router.delete('/users/:id', deleteAdminUser);
router.delete('/students/:id', deleteAdminUser);

// FIX: Agent suspend/reactivate - frontend calls PUT /api/admin/users/:id/status
// updateAdminUser handles status + accountStatus fields, so this alias resolves the 404.
router.put('/users/:id/status', updateAdminUser);

// Credit & Wallet Management
router.post('/credits/adjust', adjustUserCredits);
router.get('/credits/transactions', getAdminCreditTransactions);
router.post('/credits/sync-welcome-ledger', syncWelcomeCreditLedger);

// Applications Management
router.get('/applications', getAdminApplications);
router.put('/applications/:id', updateAdminApplication);

// Agency <-> University Partnerships
router.get('/partnerships', getAdminPartnerships);
router.put('/partnerships/:id/status', updateAdminPartnershipStatus);

// University Catalog Management (CRUD)
router.get('/universities', getAdminUniversities);
router.post('/universities', createAdminUniversity);
router.put('/universities/:id', updateAdminUniversity);
router.delete('/universities/:id', deleteAdminUniversity);

// Scholarship Opportunities Management (CRUD)
router.get('/scholarships', getAdminScholarships);
router.post('/scholarships', createAdminScholarship);
router.put('/scholarships/:id', updateAdminScholarship);
router.delete('/scholarships/:id', deleteAdminScholarship);

// Promotional Coupons Management (CRUD)
router.get('/coupons', getAdminCoupons);
router.post('/coupons', createAdminCoupon);
router.put('/coupons/:id', updateAdminCoupon);
router.delete('/coupons/:id', deleteAdminCoupon);

// Destination Countries Management (CRUD)
router.get('/countries', getAdminCountries);
router.post('/countries', createAdminCountry);
router.put('/countries/:id', updateAdminCountry);
router.delete('/countries/:id', deleteAdminCountry);

// Reports & Complaints
router.get('/reports', getAdminReports);
router.put('/reports/:id', updateAdminReport);

// Support & Chatbot Handover Inbox
router.get('/support/conversations', getAdminSupportConversations);
router.get('/support/conversations/:sessionId', getAdminSupportMessages);
router.get('/support/conversations/:sessionId/messages', getAdminSupportMessages);
router.post('/support/conversations/:sessionId/reply', replyAdminSupportConversation);

// Notifications Center
router.get('/notifications', getAdminNotifications);
router.post('/notifications/broadcast', broadcastAdminNotification);

// AI Engine Management
router.get('/ai/usage', getAdminAIMetrics);

// Audit Logs
router.get('/audit-logs', getAdminAuditLogs);

// Platform Settings
router.get('/settings', getAdminPlatformSettings);
router.put('/settings', updateAdminPlatformSettings);

// Admin Accounts Management
router.get('/admins', getAdminAccounts);
router.post('/admins', createAdminAccount);

// Manual Payment Orders (Approvals & Rejections)
router.get('/payments', getAllPaymentOrders);
router.post('/payments/:id/approve', approvePaymentOrder);
router.post('/payments/:id/reject', rejectPaymentOrder);
router.get('/agency-orders', getAllAgencyOrders);
router.put('/agency-orders/:id/assign', assignAgencyToOrder);

// Agency Verifications Admin Review
router.get('/agencies/verifications', getAllAgencyVerifications);
router.get('/agencies/verifications/:id', getAgencyVerificationDetails);
router.put('/agencies/verifications/:id/status', updateAgencyVerificationStatus);
// DELETE only allowed when verificationStatus === REJECTED (backend enforces guard, returns 409 otherwise)
router.delete('/agencies/verifications/:id', deleteAgencyVerification);

// Agent Applications Admin Review
router.get('/agent-applications', getAdminAgentApplications);
router.get('/agent-applications/:id', getAdminAgentApplicationById);
router.post('/agent-applications/:id/approve', approveAgentApplication);
router.post('/agent-applications/:id/reject', rejectAgentApplication);

// University Representative Applications Admin Review
router.get('/university-rep-applications', getAdminUniRepApplications);
router.get('/university-rep-applications/:id', getAdminUniRepApplicationById);
router.post('/university-rep-applications/:id/approve', approveUniRepApplication);
router.post('/university-rep-applications/:id/reject', rejectUniRepApplication);
router.delete('/university-rep-applications/:id', deleteUniRepApplication);

// Backward Compatible Route Aliases
router.get('/uni-rep-applications', getAdminUniRepApplications);
router.get('/uni-rep-applications/:id', getAdminUniRepApplicationById);
router.post('/uni-rep-applications/:id/approve', approveUniRepApplication);
router.post('/uni-rep-applications/:id/reject', rejectUniRepApplication);
router.delete('/uni-rep-applications/:id', deleteUniRepApplication);

// Route Aliases for Admin Panel Flexibility
router.get('/agencies', getAllAgencyVerifications);
router.put('/agencies/:id/verification', updateAgencyVerificationStatus);
// Agency delete alias (same REJECTED guard enforced by deleteAgencyVerification)
router.delete('/agencies/:id', deleteAgencyVerification);
router.get('/agents', getAdminAgents);
router.get('/agents/applications', getAdminAgentApplications);
router.put('/agents/:id/status', approveAgentApplication);
router.post('/agents/:id/generate-code', approveAgentApplication);
router.get('/university-representatives', getAdminUniRepApplications);
router.get('/university-representatives/:id', getAdminUniRepApplicationById);
router.post('/university-representatives/:id/approve', approveUniRepApplication);
router.post('/university-representatives/:id/reject', rejectUniRepApplication);
router.put('/university-representatives/:id/status', approveUniRepApplication);
router.get('/ai/metrics', getAdminAIMetrics);
router.post('/users/:id/adjust-credits', adjustUserCredits);
router.patch('/reports/:id', updateAdminReport);

// ── Supervisory Messaging Monitoring (Read-Only) ───────────────────────────
router.get('/conversations', getAdminSupervisoryConversations);
router.get('/conversations/:conversationId', getAdminSupervisoryConversationTimeline);
router.get('/conversations/:conversationId/attachments/:filename', getAdminSupervisoryAttachment);

export default router;
