import crypto from 'crypto';
import mongoose from 'mongoose';
import User from '../models/User.js';
import University from '../models/University.js';
import Application from '../models/Application.js';
import Scholarship from '../models/Scholarship.js';
import Transaction from '../models/Transaction.js';
import PaymentOrder from '../models/PaymentOrder.js';
import CreditTransaction from '../models/CreditTransaction.js';
import AgencyServiceOrder from '../models/AgencyServiceOrder.js';
import Notification from '../models/Notification.js';
import AdminSeenItem from '../models/AdminSeenItem.js';
import AgencyProfile from '../models/AgencyProfile.js';
import AgentApplication from '../models/AgentApplication.js';
import UniversityRepresentativeApplication from '../models/UniversityRepresentativeApplication.js';
import UniversityAgencyConnection from '../models/UniversityAgencyConnection.js';
import Coupon from '../models/Coupon.js';
import Country from '../models/Country.js';
import Report from '../models/Report.js';
import AuditLog from '../models/AuditLog.js';
import PlatformSetting from '../models/PlatformSetting.js';
import ChatMessage from '../models/ChatMessage.js';
import Task from '../models/Task.js';
import devStore from '../utils/devStore.js';
import emailService from '../services/emailService.js';
import { getActiveCreditsBreakdown } from './walletController.js';

// ── Audit Logging Utility ───────────────────────────────────────────────────
export const recordAuditLog = async ({
  req,
  action,
  module,
  targetType,
  targetId,
  targetName = '',
  previousValue = null,
  newValue = null,
  reason = '',
}) => {
  try {
    const adminId = req?.user?._id;
    const adminName = req?.user?.name || 'Administrator';
    const adminEmail = req?.user?.email || 'admin@admify.world';
    const ipAddress = req?.ip || req?.headers?.['x-forwarded-for'] || req?.socket?.remoteAddress || '';
    const userAgent = req?.headers?.['user-agent'] || '';

    const logEntry = {
      adminId,
      adminName,
      adminEmail,
      action,
      module,
      targetType,
      targetId: targetId ? targetId.toString() : '',
      targetName,
      previousValue,
      newValue,
      reason,
      ipAddress,
      userAgent,
      createdAt: new Date().toISOString(),
    };

    if (mongoose.connection.readyState === 1) {
      await AuditLog.create(logEntry);
    } else {
      await devStore.createAuditLog(logEntry);
    }
  } catch (err) {
    console.warn('[Audit Log Record Warning]', err.message);
  }
};

// ── 1. Admin Dashboard Real-Time Metrics & Statistics ─────────────────────────
// @desc    Get aggregate platform metrics & live KPIs
// @route   GET /api/admin/stats or /api/admin/dashboard
// @access  Private (Admin)
export const getAdminStats = async (req, res, next) => {
  try {
    let users = [];
    let agencies = [];
    let agentApps = [];
    let uniRepApps = [];
    let universities = [];
    let applications = [];
    let scholarships = [];
    let paymentOrders = [];
    let creditTransactions = [];
    let reports = [];

    if (mongoose.connection.readyState === 1) {
      users = await User.find({}).select('role status accountStatus walletCredits freeCredits paidCredits createdAt');
      agencies = await AgencyProfile.find({});
      agentApps = await AgentApplication.find({});
      uniRepApps = await UniversityRepresentativeApplication.find({});
      universities = await University.find({});
      applications = await Application.find({});
      scholarships = await Scholarship.find({});
      paymentOrders = await PaymentOrder.find({});
      creditTransactions = await CreditTransaction.find({});
      reports = await Report.find({});
    } else {
      const db = devStore.read();
      users = db.users || [];
      agencies = db.agencyProfiles || [];
      agentApps = db.agentApplications || [];
      uniRepApps = db.universityRepApplications || [];
      universities = db.universities || [];
      applications = db.applications || [];
      scholarships = db.scholarships || [];
      paymentOrders = db.paymentOrders || [];
      creditTransactions = db.creditTransactions || [];
      reports = db.reports || [];
    }

    // Prepare seen items map for accurate unseen review queues
    let seenMap = new Map();
    if (mongoose.connection.readyState === 1) {
      const seenItems = await AdminSeenItem.find({}).lean();
      for (const item of seenItems) {
        seenMap.set(`${item.entityType}:${item.entityId}`, true);
      }
    } else {
      const dbSeen = (devStore.read()).adminSeenItems || [];
      for (const item of dbSeen) {
        seenMap.set(`${item.entityType}:${item.entityId}`, true);
      }
    }

    // Role-based counts
    const students = users.filter((u) => u.role === 'student');
    const totalStudents = students.length;
    const totalAgencies = users.filter((u) => u.role === 'agency').length;
    const verifiedAgencies = agencies.filter((a) => a.verificationStatus === 'VERIFIED').length;
    const pendingAgencyVerifications = agencies.filter(
      (a) => (a.verificationStatus === 'PENDING' || a.verificationStatus === 'UNDER_REVIEW') && !isEntityDocSeen('agency', a, seenMap)
    ).length;

    const totalAgents = users.filter((u) => u.role === 'agent').length;
    const pendingAgentApplications = agentApps.filter(
      (a) => (a.status === 'SUBMITTED' || a.status === 'UNDER_REVIEW' || a.status === 'PENDING') && !isEntityDocSeen('agent', a, seenMap)
    ).length;

    const totalUniReps = users.filter(
      (u) => u.role === 'university_rep' || u.role === 'university representative' || u.role === 'university'
    ).length;
    const pendingUniRepVerifications = uniRepApps.filter(
      (a) => (a.status === 'PENDING' || a.status === 'UNDER_REVIEW') && !isEntityDocSeen('university_rep', a, seenMap)
    ).length;

    const activeUniversities = universities.filter((u) => (u.status || 'active') === 'active').length;
    const totalApplications = applications.length;
    const pendingApplications = applications.filter(
      (a) => (a.stage === 'Submitted' || a.stage === 'In Review' || a.stage === 'Documents Pending') && !isEntityDocSeen('application', a, seenMap)
    ).length;

    const approvedPayments = paymentOrders.filter((p) => p.status === 'APPROVED');
    const pendingPayments = paymentOrders.filter(
      (p) => (p.status === 'PENDING_PAYMENT' || p.status === 'PENDING_VERIFICATION') && !isEntityDocSeen('payment', p, seenMap)
    ).length;

    const totalBdtRevenue = approvedPayments.reduce((acc, curr) => acc + (Number(curr.finalAmount) || 0), 0);
    const totalCreditsSold = approvedPayments.reduce((acc, curr) => acc + (Number(curr.credits) || 0), 0);

    const totalCreditsConsumed = creditTransactions
      .filter((tx) => tx.type === 'USAGE')
      .reduce((acc, curr) => acc + Math.abs(Number(curr.credits) || 0), 0);

    const openReports = reports.filter(
      (r) => (r.status === 'PENDING' || r.status === 'UNDER_INVESTIGATION' || r.status === 'OPEN') && !isEntityDocSeen('report', r, seenMap)
    ).length;

    // Monthly registration trend (last 6 months)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const monthlyRegistrations = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mIdx = d.getMonth();
      const yr = d.getFullYear();
      const count = users.filter((u) => {
        if (!u.createdAt) return false;
        const uDate = new Date(u.createdAt);
        return uDate.getMonth() === mIdx && uDate.getFullYear() === yr;
      }).length;

      monthlyRegistrations.push({
        month: `${monthNames[mIdx]} ${yr.toString().slice(-2)}`,
        students: users.filter((u) => {
          if (!u.createdAt || u.role !== 'student') return false;
          const uDate = new Date(u.createdAt);
          return uDate.getMonth() === mIdx && uDate.getFullYear() === yr;
        }).length,
        agencies: users.filter((u) => {
          if (!u.createdAt || u.role !== 'agency') return false;
          const uDate = new Date(u.createdAt);
          return uDate.getMonth() === mIdx && uDate.getFullYear() === yr;
        }).length,
        total: count,
      });
    }

    // Application stage breakdown
    const stageCounts = {
      Submitted: 0,
      'Documents Pending': 0,
      'In Review': 0,
      Accepted: 0,
      Rejected: 0,
      Waitlisted: 0,
    };
    applications.forEach((a) => {
      const stage = a.stage || 'Submitted';
      stageCounts[stage] = (stageCounts[stage] || 0) + 1;
    });

    // Recent real activities
    const recentActivities = [];
    const sortedUsers = [...users].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 5);
    sortedUsers.forEach((u) => {
      recentActivities.push({
        type: 'USER_REGISTRATION',
        title: `New ${u.role?.toUpperCase()} Registered`,
        desc: `${u.name} (${u.email}) joined the platform.`,
        createdAt: u.createdAt,
        time: getTimeAgo(u.createdAt),
      });
    });

    const sortedPayments = [...paymentOrders].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 3);
    sortedPayments.forEach((p) => {
      recentActivities.push({
        type: 'PAYMENT_ORDER',
        title: `Payment ${p.status}: ${p.orderId}`,
        desc: `৳${(p.finalAmount || 0).toLocaleString('en-BD')} for ${p.packageName} (${p.credits} CR).`,
        createdAt: p.createdAt,
        time: getTimeAgo(p.createdAt),
      });
    });

    recentActivities.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    return res.status(200).json({
      success: true,
      data: {
        summary: {
          totalStudents,
          totalAgencies,
          verifiedAgencies,
          totalAgents,
          totalUniReps,
          activeUniversities,
          totalUniversities: universities.length,
          totalApplications,
          pendingApplications,
          pendingAgencyVerifications,
          pendingAgentApplications,
          pendingUniRepVerifications,
          pendingPayments,
          totalCreditsSold,
          totalCreditsConsumed,
          platformRevenueBdt: totalBdtRevenue,
          openReports,
          totalScholarships: scholarships.length,
        },
        kpis: [
          { label: 'Total Students', value: totalStudents.toLocaleString(), rawValue: totalStudents },
          { label: 'Total Agencies', value: totalAgencies.toLocaleString(), subValue: `${verifiedAgencies} Verified` },
          { label: 'Total Agents', value: totalAgents.toLocaleString(), subValue: `${pendingAgentApplications} Pending` },
          { label: 'Uni Representatives', value: totalUniReps.toLocaleString(), subValue: `${pendingUniRepVerifications} Pending` },
          { label: 'Partner Universities', value: universities.length.toString(), subValue: `${activeUniversities} Active` },
          { label: 'Applications', value: totalApplications.toLocaleString(), subValue: `${pendingApplications} In Progress` },
          { label: 'Revenue (BDT)', value: `৳${totalBdtRevenue.toLocaleString('en-BD')}` },
          { label: 'Credits Sold', value: `${totalCreditsSold.toLocaleString()} CR` },
        ],
        charts: {
          monthlyRegistrations,
          stageCounts,
          roleDistribution: {
            students: totalStudents,
            agencies: totalAgencies,
            agents: totalAgents,
            universityReps: totalUniReps,
            admins: users.filter((u) => u.role === 'admin').length,
          },
        },
        recentActivities: recentActivities.slice(0, 8),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── Admin Seen / Actionable Tracking Helpers ─────────────────────────────────
export const isEntityDocSeen = (type, doc, seenItems = null) => {
  if (!doc) return false;
  if (doc.isSeenByAdmin === true) return true;
  const idStr = doc._id ? doc._id.toString() : (doc.id ? doc.id.toString() : '');
  const altId = doc.applicationId || doc.orderId || doc.reportId || doc.sessionId || '';
  if (seenItems instanceof Map) {
    if (idStr && seenItems.has(`${type}:${idStr}`)) return true;
    if (altId && seenItems.has(`${type}:${altId}`)) return true;
    return false;
  }
  if (Array.isArray(seenItems)) {
    return seenItems.some(
      (item) => item.entityType === type && (item.entityId === idStr || (altId && item.entityId === altId))
    );
  }
  return false;
};

export const markEntityAsSeenHelper = async (entityType, entityId, adminId = null) => {
  if (!entityType || !entityId) return false;
  const idStr = String(entityId).trim();
  const rawType = String(entityType).trim().toLowerCase();

  const typeMap = {
    agencies: 'agency',
    agency: 'agency',
    agents: 'agent',
    agent: 'agent',
    agent_application: 'agent',
    agent_applications: 'agent',
    agent_user: 'agent_user',
    unirepresentatives: 'university_rep',
    unirep: 'university_rep',
    university_rep: 'university_rep',
    university_representative: 'university_rep',
    applications: 'application',
    application: 'application',
    partnerships: 'partnership',
    partnership: 'partnership',
    payments: 'payment',
    payment: 'payment',
    scholarships: 'scholarship',
    scholarship: 'scholarship',
    reports: 'report',
    report: 'report',
    support: 'support',
    supportinbox: 'support',
    chat: 'support',
    notifications: 'notification',
    notification: 'notification',
  };

  const normType = typeMap[rawType] || rawType;
  const now = new Date();

  if (mongoose.connection.readyState === 1) {
    try {
      await AdminSeenItem.findOneAndUpdate(
        { entityType: normType, entityId: idStr },
        {
          $setOnInsert: {
            admin: adminId || null,
            seenAt: now,
          },
        },
        { upsert: true, new: true }
      );
    } catch {
      // Ignored for duplicate idempotency
    }

    if (normType === 'agency') {
      await AgencyProfile.updateOne(
        { $or: [{ _id: idStr }, { applicationId: idStr }] },
        { isSeenByAdmin: true, adminSeenAt: now }
      );
    } else if (normType === 'agent') {
      await AgentApplication.updateOne(
        { $or: [{ _id: idStr }, { applicationId: idStr }] },
        { isSeenByAdmin: true, adminSeenAt: now }
      );
    } else if (normType === 'agent_user') {
      await User.updateOne(
        { _id: idStr, role: 'agent' },
        { isSeenByAdmin: true, adminSeenAt: now }
      );
    } else if (normType === 'university_rep') {
      await UniversityRepresentativeApplication.updateOne(
        { $or: [{ _id: idStr }, { applicationId: idStr }] },
        { isSeenByAdmin: true, adminSeenAt: now }
      );
      await User.updateOne(
        { _id: idStr, role: { $in: ['university_rep', 'university representative'] } },
        { isSeenByAdmin: true, adminSeenAt: now }
      );
    } else if (normType === 'application') {
      await Application.updateOne(
        { _id: idStr },
        { isSeenByAdmin: true, adminSeenAt: now }
      );
    } else if (normType === 'partnership') {
      await UniversityAgencyConnection.updateOne(
        { _id: idStr },
        { isSeenByAdmin: true, adminSeenAt: now }
      );
    } else if (normType === 'payment') {
      await PaymentOrder.updateOne(
        { $or: [{ _id: idStr }, { orderId: idStr }] },
        { isSeenByAdmin: true, adminSeenAt: now }
      );
    } else if (normType === 'scholarship') {
      await Scholarship.updateOne(
        { _id: idStr },
        { isSeenByAdmin: true, adminSeenAt: now }
      );
    } else if (normType === 'report') {
      await Report.updateOne(
        { $or: [{ _id: idStr }, { reportId: idStr }] },
        { isSeenByAdmin: true, adminSeenAt: now }
      );
    } else if (normType === 'support') {
      await ChatMessage.updateMany(
        { $or: [{ sessionId: idStr }, { _id: idStr }] },
        { isSeenByAdmin: true, adminSeenAt: now }
      );
    } else if (normType === 'notification') {
      await Notification.updateOne(
        { _id: idStr },
        { read: true }
      );
    }

    try {
      await Notification.updateMany(
        {
          $or: [
            { relatedEntityId: idStr },
            { link: { $regex: idStr } },
          ],
          read: false,
        },
        { read: true }
      );
    } catch {
      // safe fallback
    }

    return true;
  } else {
    return devStore.markEntitySeen(normType, idStr, adminId);
  }
};

// @desc    Mark an admin actionable entity as seen
// @route   PUT /api/admin/seen/:entityType/:entityId or POST /api/admin/seen
// @access  Private (Admin)
export const markAdminEntityAsSeen = async (req, res, next) => {
  try {
    const entityType = (req.params.entityType || req.body.entityType || '').trim().toLowerCase();
    const entityId = (req.params.entityId || req.body.entityId || '').trim();

    if (!entityType || !entityId) {
      return res.status(400).json({
        success: false,
        message: 'entityType and entityId are required',
      });
    }

    const adminId = req.user?._id;
    await markEntityAsSeenHelper(entityType, entityId, adminId);

    return res.status(200).json({
      success: true,
      message: `Entity ${entityType}:${entityId} marked as seen by admin`,
      data: {
        entityType,
        entityId,
        isSeenByAdmin: true,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Calculate unified Admin sidebar and tab unseen counts
export const calculateAdminUnseenCounts = async (adminUserId) => {
  let seenMap = new Map();

  if (mongoose.connection.readyState === 1) {
    const seenItems = await AdminSeenItem.find({}).lean();
    for (const item of seenItems) {
      seenMap.set(`${item.entityType}:${item.entityId}`, true);
    }

    const [
      allAgencies,
      allAgentApps,
      allAgentUsers,
      allUniRepApps,
      allApplications,
      allConnections,
      allPaymentOrders,
      allReports,
      allScholarships,
      allMessages,
      unreadNotificationsList,
    ] = await Promise.all([
      AgencyProfile.find({}).lean(),
      AgentApplication.find({}).lean(),
      User.find({ role: 'agent' }).lean(),
      UniversityRepresentativeApplication.find({}).lean(),
      Application.find({}).lean(),
      UniversityAgencyConnection.find({}).lean(),
      PaymentOrder.find({}).lean(),
      Report.find({}).lean(),
      Scholarship.find({}).lean(),
      ChatMessage.find({}).sort({ createdAt: 1 }).lean(),
      Notification.find({
        $or: [{ user: adminUserId }, { user: { $exists: false } }, { user: null }],
        read: false,
      }).lean(),
    ]);

    // 1. Agencies
    const unseenAgencies = allAgencies.filter((a) => !isEntityDocSeen('agency', a, seenMap));
    const pendingAgenciesUnseen = unseenAgencies.filter(
      (a) => a.verificationStatus === 'PENDING' || a.verificationStatus === 'UNDER_REVIEW'
    ).length;

    // 2. Agents
    const unseenAgentApps = allAgentApps.filter((a) => !isEntityDocSeen('agent', a, seenMap));
    const unseenAgentUsers = allAgentUsers.filter((u) => !isEntityDocSeen('agent_user', u, seenMap));
    const pendingAgentsUnseen = unseenAgentApps.filter(
      (a) => a.status === 'SUBMITTED' || a.status === 'UNDER_REVIEW' || a.status === 'PENDING'
    ).length;

    // 3. Uni Reps
    const unseenUniRepApps = allUniRepApps.filter((a) => !isEntityDocSeen('university_rep', a, seenMap));
    const pendingUniRepsUnseen = unseenUniRepApps.filter(
      (a) => a.status === 'PENDING' || a.status === 'UNDER_REVIEW'
    ).length;

    // 4. Applications
    const unseenApplications = allApplications.filter((a) => !isEntityDocSeen('application', a, seenMap));
    const pendingApplicationsUnseen = unseenApplications.filter(
      (a) => a.stage === 'Submitted' || a.stage === 'In Review' || a.stage === 'Documents Pending'
    ).length;

    // 5. Partnerships
    const unseenPartnerships = allConnections.filter((c) => !isEntityDocSeen('partnership', c, seenMap));
    const pendingPartnershipsUnseen = unseenPartnerships.filter(
      (c) => (c.status || '').toUpperCase() === 'PENDING'
    ).length;

    // 6. Payments
    const unseenPayments = allPaymentOrders.filter((p) => !isEntityDocSeen('payment', p, seenMap));
    const pendingPaymentsUnseen = unseenPayments.filter(
      (p) => p.status === 'PENDING_PAYMENT' || p.status === 'PENDING_VERIFICATION'
    ).length;

    // 7. Reports
    const unseenReports = allReports.filter((r) => !isEntityDocSeen('report', r, seenMap));
    const openReportsUnseen = unseenReports.filter(
      (r) => r.status === 'PENDING' || r.status === 'UNDER_INVESTIGATION' || r.status === 'OPEN'
    ).length;

    // 8. Scholarships
    const unseenScholarships = allScholarships.filter((s) => !isEntityDocSeen('scholarship', s, seenMap));
    const pendingScholarshipsUnseen = unseenScholarships.filter(
      (s) => ['pending', 'in_review'].includes((s.status || '').toLowerCase())
    ).length;

    // 9. Support
    const sessionMap = new Map();
    for (const msg of allMessages) {
      const isMsgUnseen = !isEntityDocSeen('support', msg, seenMap) && !isEntityDocSeen('support', { _id: msg.sessionId }, seenMap);
      if (!sessionMap.has(msg.sessionId)) {
        sessionMap.set(msg.sessionId, {
          sessionId: msg.sessionId,
          status: msg.status || 'active',
          isLiveAgentRequest: msg.isLiveAgentRequest || false,
          lastSender: msg.sender,
          updatedAt: msg.createdAt,
          hasUnseen: isMsgUnseen,
        });
      } else {
        const item = sessionMap.get(msg.sessionId);
        if (msg.isLiveAgentRequest) item.isLiveAgentRequest = true;
        if (isMsgUnseen) item.hasUnseen = true;
        if (new Date(msg.createdAt) > new Date(item.updatedAt)) {
          item.lastSender = msg.sender;
          item.updatedAt = msg.createdAt;
        }
      }
    }

    const allSessions = Array.from(sessionMap.values());
    const unseenSupportSessions = allSessions.filter((s) => s.hasUnseen);
    const supportInboxUnseen = allSessions.filter(
      (s) => (s.status || 'active') === 'active' && (s.isLiveAgentRequest || s.lastSender === 'user') && s.hasUnseen
    ).length;

    // 10. Notifications
    const unreadNotifications = unreadNotificationsList.length;

    const statusCounts = {
      agencies: {
        all: unseenAgencies.length,
        PENDING: unseenAgencies.filter((a) => a.verificationStatus === 'PENDING').length,
        UNDER_REVIEW: unseenAgencies.filter((a) => a.verificationStatus === 'UNDER_REVIEW').length,
        VERIFIED: unseenAgencies.filter((a) => a.verificationStatus === 'VERIFIED' || a.verificationStatus === 'APPROVED').length,
        REJECTED: unseenAgencies.filter((a) => a.verificationStatus === 'REJECTED').length,
      },
      agents: {
        all: unseenAgentApps.length,
        pending: unseenAgentApps.filter((a) => a.status === 'PENDING' || a.status === 'UNDER_REVIEW' || a.status === 'SUBMITTED').length,
        approved: unseenAgentApps.filter((a) => a.status === 'APPROVED').length,
        registered: unseenAgentApps.filter((a) => a.status === 'REGISTERED' || a.status === 'COMPLETED').length,
        rejected: unseenAgentApps.filter((a) => a.status === 'REJECTED').length,
        active: unseenAgentUsers.filter((u) => (u.status || '').toLowerCase() === 'active').length,
        suspended: unseenAgentUsers.filter((u) => (u.status || '').toLowerCase() === 'suspended').length,
      },
      uniRepresentatives: {
        all: unseenUniRepApps.length,
        PENDING: unseenUniRepApps.filter((a) => a.status === 'PENDING').length,
        PROFILE_INCOMPLETE: unseenUniRepApps.filter((a) => !a.isProfileComplete || a.status === 'PROFILE_INCOMPLETE' || a.profileStatus === 'PROFILE_INCOMPLETE').length,
        UNDER_REVIEW: unseenUniRepApps.filter((a) => a.status === 'UNDER_REVIEW' || a.profileStatus === 'UNDER_REVIEW').length,
        APPROVED: unseenUniRepApps.filter((a) => a.status === 'APPROVED').length,
        ACTIVE: unseenUniRepApps.filter((a) => a.status === 'ACTIVE').length,
        REJECTED: unseenUniRepApps.filter((a) => a.status === 'REJECTED').length,
      },
      applications: {
        all: unseenApplications.length,
        Submitted: unseenApplications.filter((a) => a.stage === 'Submitted').length,
        'In Review': unseenApplications.filter((a) => a.stage === 'In Review').length,
        'Documents Pending': unseenApplications.filter((a) => a.stage === 'Documents Pending').length,
        Accepted: unseenApplications.filter((a) => a.stage === 'Accepted').length,
        'Visa Processing': unseenApplications.filter((a) => a.stage === 'Visa Processing').length,
        Enrolled: unseenApplications.filter((a) => a.stage === 'Enrolled').length,
        Rejected: unseenApplications.filter((a) => a.stage === 'Rejected').length,
      },
      partnerships: {
        all: unseenPartnerships.length,
        PENDING: unseenPartnerships.filter((c) => (c.status || '').toUpperCase() === 'PENDING').length,
        ACCEPTED: unseenPartnerships.filter((c) => (c.status || '').toUpperCase() === 'ACCEPTED').length,
        REJECTED: unseenPartnerships.filter((c) => (c.status || '').toUpperCase() === 'REJECTED').length,
        BLOCKED: unseenPartnerships.filter((c) => (c.status || '').toUpperCase() === 'BLOCKED').length,
        SUSPENDED: unseenPartnerships.filter((c) => (c.status || '').toUpperCase() === 'SUSPENDED').length,
      },
      payments: {
        all: unseenPayments.length,
        PENDING_VERIFICATION: unseenPayments.filter((p) => p.status === 'PENDING_PAYMENT' || p.status === 'PENDING_VERIFICATION').length,
        APPROVED: unseenPayments.filter((p) => p.status === 'APPROVED' || p.status === 'COMPLETED').length,
        REJECTED: unseenPayments.filter((p) => p.status === 'REJECTED').length,
      },
      reports: {
        all: unseenReports.length,
        OPEN: unseenReports.filter((r) => r.status === 'OPEN' || r.status === 'PENDING').length,
        INVESTIGATING: unseenReports.filter((r) => r.status === 'INVESTIGATING' || r.status === 'UNDER_INVESTIGATION').length,
        RESOLVED: unseenReports.filter((r) => r.status === 'RESOLVED').length,
        REJECTED: unseenReports.filter((r) => r.status === 'REJECTED').length,
        CLOSED: unseenReports.filter((r) => r.status === 'CLOSED').length,
      },
      supportInbox: {
        all: unseenSupportSessions.length,
        needs_agent: supportInboxUnseen,
        open: allSessions.filter((s) => (s.status || 'active') === 'active' && s.hasUnseen).length,
        resolved: allSessions.filter((s) => s.status === 'resolved' && s.hasUnseen).length,
      },
      notifications: {
        all: unreadNotifications,
        agents: unreadNotificationsList.filter((n) => n.type === 'agents' || n.relatedEntityType === 'agent' || n.link?.includes('agent')).length,
        students: unreadNotificationsList.filter((n) => n.type === 'students' || n.relatedEntityType === 'student' || n.link?.includes('student')).length,
        system: unreadNotificationsList.filter((n) => n.type === 'system' || n.type === 'alert' || n.type === 'warning').length,
      },
      scholarships: {
        all: unseenScholarships.length,
      },
    };

    return {
      agencies: pendingAgenciesUnseen,
      agents: pendingAgentsUnseen,
      uniRepresentatives: pendingUniRepsUnseen,
      applications: pendingApplicationsUnseen,
      partnerships: pendingPartnershipsUnseen,
      payments: pendingPaymentsUnseen,
      reports: openReportsUnseen,
      supportInbox: supportInboxUnseen,
      notifications: unreadNotifications,
      scholarships: pendingScholarshipsUnseen,
      statusCounts,
    };
  } else {
    const db = devStore.read();
    const seenList = db.adminSeenItems || [];
    for (const item of seenList) {
      seenMap.set(`${item.entityType}:${item.entityId}`, true);
    }

    const allAgencies = db.agencyProfiles || [];
    const allAgentApps = db.agentApplications || [];
    const allAgentUsers = (db.users || []).filter((u) => u.role === 'agent');
    const allUniRepApps = db.universityRepApplications || [];
    const allApplications = db.applications || [];
    const allConnections = db.universityAgencyConnections || [];
    const allPaymentOrders = db.paymentOrders || [];
    const allReports = db.reports || [];
    const allScholarships = db.scholarships || [];
    const allMessages = db.chatMessages || [];
    const unreadNotificationsList = (db.notifications || []).filter(
      (n) => (!n.user || n.user?.toString() === adminUserId?.toString()) && !n.read
    );

    // 1. Agencies
    const unseenAgencies = allAgencies.filter((a) => !isEntityDocSeen('agency', a, seenMap));
    const pendingAgenciesUnseen = unseenAgencies.filter(
      (a) => a.verificationStatus === 'PENDING' || a.verificationStatus === 'UNDER_REVIEW'
    ).length;

    // 2. Agents
    const unseenAgentApps = allAgentApps.filter((a) => !isEntityDocSeen('agent', a, seenMap));
    const unseenAgentUsers = allAgentUsers.filter((u) => !isEntityDocSeen('agent_user', u, seenMap));
    const pendingAgentsUnseen = unseenAgentApps.filter(
      (a) => a.status === 'SUBMITTED' || a.status === 'UNDER_REVIEW' || a.status === 'PENDING'
    ).length;

    // 3. Uni Reps
    const unseenUniRepApps = allUniRepApps.filter((a) => !isEntityDocSeen('university_rep', a, seenMap));
    const pendingUniRepsUnseen = unseenUniRepApps.filter(
      (a) => a.status === 'PENDING' || a.status === 'UNDER_REVIEW'
    ).length;

    // 4. Applications
    const unseenApplications = allApplications.filter((a) => !isEntityDocSeen('application', a, seenMap));
    const pendingApplicationsUnseen = unseenApplications.filter(
      (a) => a.stage === 'Submitted' || a.stage === 'In Review' || a.stage === 'Documents Pending'
    ).length;

    // 5. Partnerships
    const unseenPartnerships = allConnections.filter((c) => !isEntityDocSeen('partnership', c, seenMap));
    const pendingPartnershipsUnseen = unseenPartnerships.filter(
      (c) => (c.status || '').toUpperCase() === 'PENDING'
    ).length;

    // 6. Payments
    const unseenPayments = allPaymentOrders.filter((p) => !isEntityDocSeen('payment', p, seenMap));
    const pendingPaymentsUnseen = unseenPayments.filter(
      (p) => p.status === 'PENDING_PAYMENT' || p.status === 'PENDING_VERIFICATION'
    ).length;

    // 7. Reports
    const unseenReports = allReports.filter((r) => !isEntityDocSeen('report', r, seenMap));
    const openReportsUnseen = unseenReports.filter(
      (r) => r.status === 'PENDING' || r.status === 'UNDER_INVESTIGATION' || r.status === 'OPEN'
    ).length;

    // 8. Scholarships
    const unseenScholarships = allScholarships.filter((s) => !isEntityDocSeen('scholarship', s, seenMap));
    const pendingScholarshipsUnseen = unseenScholarships.filter(
      (s) => ['pending', 'in_review'].includes((s.status || '').toLowerCase())
    ).length;

    // 9. Support
    const sessionMap = new Map();
    for (const msg of allMessages) {
      const isMsgUnseen = !isEntityDocSeen('support', msg, seenMap) && !isEntityDocSeen('support', { _id: msg.sessionId }, seenMap);
      if (!sessionMap.has(msg.sessionId)) {
        sessionMap.set(msg.sessionId, {
          sessionId: msg.sessionId,
          status: msg.status || 'active',
          isLiveAgentRequest: msg.isLiveAgentRequest || false,
          lastSender: msg.sender,
          updatedAt: msg.createdAt,
          hasUnseen: isMsgUnseen,
        });
      } else {
        const item = sessionMap.get(msg.sessionId);
        if (msg.isLiveAgentRequest) item.isLiveAgentRequest = true;
        if (isMsgUnseen) item.hasUnseen = true;
        if (new Date(msg.createdAt) > new Date(item.updatedAt)) {
          item.lastSender = msg.sender;
          item.updatedAt = msg.createdAt;
        }
      }
    }

    const allSessions = Array.from(sessionMap.values());
    const unseenSupportSessions = allSessions.filter((s) => s.hasUnseen);
    const supportInboxUnseen = allSessions.filter(
      (s) => (s.status || 'active') === 'active' && (s.isLiveAgentRequest || s.lastSender === 'user') && s.hasUnseen
    ).length;

    // 10. Notifications
    const unreadNotifications = unreadNotificationsList.length;

    const statusCounts = {
      agencies: {
        all: unseenAgencies.length,
        PENDING: unseenAgencies.filter((a) => a.verificationStatus === 'PENDING').length,
        UNDER_REVIEW: unseenAgencies.filter((a) => a.verificationStatus === 'UNDER_REVIEW').length,
        VERIFIED: unseenAgencies.filter((a) => a.verificationStatus === 'VERIFIED' || a.verificationStatus === 'APPROVED').length,
        REJECTED: unseenAgencies.filter((a) => a.verificationStatus === 'REJECTED').length,
      },
      agents: {
        all: unseenAgentApps.length,
        pending: unseenAgentApps.filter((a) => a.status === 'PENDING' || a.status === 'UNDER_REVIEW' || a.status === 'SUBMITTED').length,
        approved: unseenAgentApps.filter((a) => a.status === 'APPROVED').length,
        registered: unseenAgentApps.filter((a) => a.status === 'REGISTERED' || a.status === 'COMPLETED').length,
        rejected: unseenAgentApps.filter((a) => a.status === 'REJECTED').length,
        active: unseenAgentUsers.filter((u) => (u.status || '').toLowerCase() === 'active').length,
        suspended: unseenAgentUsers.filter((u) => (u.status || '').toLowerCase() === 'suspended').length,
      },
      uniRepresentatives: {
        all: unseenUniRepApps.length,
        PENDING: unseenUniRepApps.filter((a) => a.status === 'PENDING').length,
        PROFILE_INCOMPLETE: unseenUniRepApps.filter((a) => !a.isProfileComplete || a.status === 'PROFILE_INCOMPLETE' || a.profileStatus === 'PROFILE_INCOMPLETE').length,
        UNDER_REVIEW: unseenUniRepApps.filter((a) => a.status === 'UNDER_REVIEW' || a.profileStatus === 'UNDER_REVIEW').length,
        APPROVED: unseenUniRepApps.filter((a) => a.status === 'APPROVED').length,
        ACTIVE: unseenUniRepApps.filter((a) => a.status === 'ACTIVE').length,
        REJECTED: unseenUniRepApps.filter((a) => a.status === 'REJECTED').length,
      },
      applications: {
        all: unseenApplications.length,
        Submitted: unseenApplications.filter((a) => a.stage === 'Submitted').length,
        'In Review': unseenApplications.filter((a) => a.stage === 'In Review').length,
        'Documents Pending': unseenApplications.filter((a) => a.stage === 'Documents Pending').length,
        Accepted: unseenApplications.filter((a) => a.stage === 'Accepted').length,
        'Visa Processing': unseenApplications.filter((a) => a.stage === 'Visa Processing').length,
        Enrolled: unseenApplications.filter((a) => a.stage === 'Enrolled').length,
        Rejected: unseenApplications.filter((a) => a.stage === 'Rejected').length,
      },
      partnerships: {
        all: unseenPartnerships.length,
        PENDING: unseenPartnerships.filter((c) => (c.status || '').toUpperCase() === 'PENDING').length,
        ACCEPTED: unseenPartnerships.filter((c) => (c.status || '').toUpperCase() === 'ACCEPTED').length,
        REJECTED: unseenPartnerships.filter((c) => (c.status || '').toUpperCase() === 'REJECTED').length,
        BLOCKED: unseenPartnerships.filter((c) => (c.status || '').toUpperCase() === 'BLOCKED').length,
        SUSPENDED: unseenPartnerships.filter((c) => (c.status || '').toUpperCase() === 'SUSPENDED').length,
      },
      payments: {
        all: unseenPayments.length,
        PENDING_VERIFICATION: unseenPayments.filter((p) => p.status === 'PENDING_PAYMENT' || p.status === 'PENDING_VERIFICATION').length,
        APPROVED: unseenPayments.filter((p) => p.status === 'APPROVED' || p.status === 'COMPLETED').length,
        REJECTED: unseenPayments.filter((p) => p.status === 'REJECTED').length,
      },
      reports: {
        all: unseenReports.length,
        OPEN: unseenReports.filter((r) => r.status === 'OPEN' || r.status === 'PENDING').length,
        INVESTIGATING: unseenReports.filter((r) => r.status === 'INVESTIGATING' || r.status === 'UNDER_INVESTIGATION').length,
        RESOLVED: unseenReports.filter((r) => r.status === 'RESOLVED').length,
        REJECTED: unseenReports.filter((r) => r.status === 'REJECTED').length,
        CLOSED: unseenReports.filter((r) => r.status === 'CLOSED').length,
      },
      supportInbox: {
        all: unseenSupportSessions.length,
        needs_agent: supportInboxUnseen,
        open: allSessions.filter((s) => (s.status || 'active') === 'active' && s.hasUnseen).length,
        resolved: allSessions.filter((s) => s.status === 'resolved' && s.hasUnseen).length,
      },
      notifications: {
        all: unreadNotifications,
        agents: unreadNotificationsList.filter((n) => n.type === 'agents' || n.relatedEntityType === 'agent' || n.link?.includes('agent')).length,
        students: unreadNotificationsList.filter((n) => n.type === 'students' || n.relatedEntityType === 'student' || n.link?.includes('student')).length,
        system: unreadNotificationsList.filter((n) => n.type === 'system' || n.type === 'alert' || n.type === 'warning').length,
      },
      scholarships: {
        all: unseenScholarships.length,
      },
    };

    return {
      agencies: pendingAgenciesUnseen,
      agents: pendingAgentsUnseen,
      uniRepresentatives: pendingUniRepsUnseen,
      applications: pendingApplicationsUnseen,
      partnerships: pendingPartnershipsUnseen,
      payments: pendingPaymentsUnseen,
      reports: openReportsUnseen,
      supportInbox: supportInboxUnseen,
      notifications: unreadNotifications,
      scholarships: pendingScholarshipsUnseen,
      statusCounts,
    };
  }
};

// @desc    Get dynamic sidebar badge counts
// @route   GET /api/admin/sidebar-counts
// @access  Private (Admin)
export const getAdminSidebarCounts = async (req, res, next) => {
  try {
    const counts = await calculateAdminUnseenCounts(req.user._id);
    return res.status(200).json({
      success: true,
      data: counts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get internal page/status/tab unseen counts
// @route   GET /api/admin/status-counts
// @access  Private (Admin)
export const getAdminStatusCounts = async (req, res, next) => {
  try {
    const counts = await calculateAdminUnseenCounts(req.user._id);
    return res.status(200).json({
      success: true,
      data: {
        ...counts.statusCounts,
        sidebarCounts: {
          agencies: counts.agencies,
          agents: counts.agents,
          uniRepresentatives: counts.uniRepresentatives,
          applications: counts.applications,
          partnerships: counts.partnerships,
          payments: counts.payments,
          reports: counts.reports,
          supportInbox: counts.supportInbox,
          notifications: counts.notifications,
          scholarships: counts.scholarships,
        },
        statusCounts: counts.statusCounts,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getTimeAgo = (dateStr) => {
  if (!dateStr) return 'Recently';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
};

// ── 2. Global Admin Search ────────────────────────────────────────────────────
// @desc    Search across all platform entities (Students, Agencies, Agents, Uni Reps, Universities, Applications, Payments, Reports)
// @route   GET /api/admin/search
// @access  Private (Admin)
export const globalAdminSearch = async (req, res, next) => {
  try {
    const { q = '' } = req.query;
    const queryStr = q.trim().toLowerCase();

    if (!queryStr || queryStr.length < 2) {
      return res.status(200).json({
        success: true,
        data: { results: [], total: 0 },
      });
    }

    const results = [];

    if (mongoose.connection.readyState === 1) {
      // Students
      const students = await User.find({
        role: 'student',
        $or: [
          { name: { $regex: queryStr, $options: 'i' } },
          { email: { $regex: queryStr, $options: 'i' } },
          { phone: { $regex: queryStr, $options: 'i' } },
        ],
      }).limit(5);
      students.forEach((s) => {
        results.push({
          type: 'student',
          id: s._id,
          title: s.name,
          subtitle: `${s.email} · Phone: ${s.phone}`,
          status: s.status,
          link: `/admin/students?search=${encodeURIComponent(s.email)}`,
        });
      });

      // Agencies
      const agencies = await AgencyProfile.find({
        $or: [
          { agencyName: { $regex: queryStr, $options: 'i' } },
          { officialBusinessEmail: { $regex: queryStr, $options: 'i' } },
          { applicationId: { $regex: queryStr, $options: 'i' } },
        ],
      }).limit(5);
      agencies.forEach((a) => {
        results.push({
          type: 'agency',
          id: a._id,
          title: a.agencyName,
          subtitle: `App ID: ${a.applicationId || 'N/A'} · ${a.officialBusinessEmail}`,
          status: a.verificationStatus,
          link: `/admin/agencies?search=${encodeURIComponent(a.agencyName)}`,
        });
      });

      // Agents
      const agents = await AgentApplication.find({
        $or: [
          { agentName: { $regex: queryStr, $options: 'i' } },
          { email: { $regex: queryStr, $options: 'i' } },
          { applicationId: { $regex: queryStr, $options: 'i' } },
          { activationCode: { $regex: queryStr, $options: 'i' } },
        ],
      }).limit(5);
      agents.forEach((ag) => {
        results.push({
          type: 'agent',
          id: ag._id,
          title: ag.agentName,
          subtitle: `App ID: ${ag.applicationId} · Code: ${ag.activationCode || 'None'}`,
          status: ag.status,
          link: `/admin/agents?search=${encodeURIComponent(ag.applicationId)}`,
        });
      });

      // Uni Reps
      const uniReps = await UniversityRepresentativeApplication.find({
        $or: [
          { 'representative.fullName': { $regex: queryStr, $options: 'i' } },
          { 'representative.officialEmail': { $regex: queryStr, $options: 'i' } },
          { 'university.name': { $regex: queryStr, $options: 'i' } },
          { applicationId: { $regex: queryStr, $options: 'i' } },
        ],
      }).limit(5);
      uniReps.forEach((ur) => {
        results.push({
          type: 'university_rep',
          id: ur._id,
          title: ur.representative?.fullName || 'Uni Representative',
          subtitle: `${ur.university?.name} · App ID: ${ur.applicationId}`,
          status: ur.status,
          link: `/admin/university-representatives?search=${encodeURIComponent(ur.applicationId)}`,
        });
      });

      // Universities
      const unis = await University.find({
        $or: [
          { name: { $regex: queryStr, $options: 'i' } },
          { location: { $regex: queryStr, $options: 'i' } },
          { country: { $regex: queryStr, $options: 'i' } },
        ],
      }).limit(5);
      unis.forEach((u) => {
        results.push({
          type: 'university',
          id: u._id,
          title: u.name,
          subtitle: `${u.location || u.country} · Rank #${u.rank || 'N/A'}`,
          status: u.status || 'active',
          link: `/admin/universities?search=${encodeURIComponent(u.name)}`,
        });
      });

      // Payment Orders
      const payments = await PaymentOrder.find({
        $or: [
          { orderId: { $regex: queryStr, $options: 'i' } },
          { transactionId: { $regex: queryStr, $options: 'i' } },
          { packageName: { $regex: queryStr, $options: 'i' } },
        ],
      }).limit(5);
      payments.forEach((p) => {
        results.push({
          type: 'payment',
          id: p._id,
          title: `Order: ${p.orderId}`,
          subtitle: `TxID: ${p.transactionId} · ৳${p.finalAmount} (${p.credits} CR)`,
          status: p.status,
          link: `/admin/payments?search=${encodeURIComponent(p.orderId)}`,
        });
      });

      // Applications
      const apps = await Application.find({
        $or: [
          { university: { $regex: queryStr, $options: 'i' } },
          { program: { $regex: queryStr, $options: 'i' } },
        ],
      }).limit(5);
      apps.forEach((ap) => {
        results.push({
          type: 'application',
          id: ap._id,
          title: `${ap.university} - ${ap.program}`,
          subtitle: `Stage: ${ap.stage}`,
          status: ap.stage,
          link: `/admin/applications?search=${encodeURIComponent(ap.university)}`,
        });
      });
    } else {
      // devStore search
      const db = devStore.read();

      // Users
      (db.users || [])
        .filter(
          (u) =>
            u.name?.toLowerCase().includes(queryStr) ||
            u.email?.toLowerCase().includes(queryStr) ||
            u.phone?.toLowerCase().includes(queryStr)
        )
        .slice(0, 5)
        .forEach((u) => {
          results.push({
            type: u.role,
            id: u._id,
            title: u.name,
            subtitle: `${u.role.toUpperCase()} · ${u.email}`,
            status: u.status,
            link: u.role === 'student' ? `/admin/students?search=${encodeURIComponent(u.email)}` : `/admin/users?search=${encodeURIComponent(u.email)}`,
          });
        });

      // Agencies
      (db.agencyProfiles || [])
        .filter(
          (a) =>
            a.agencyName?.toLowerCase().includes(queryStr) ||
            a.officialBusinessEmail?.toLowerCase().includes(queryStr) ||
            a.applicationId?.toLowerCase().includes(queryStr)
        )
        .slice(0, 5)
        .forEach((a) => {
          results.push({
            type: 'agency',
            id: a._id,
            title: a.agencyName,
            subtitle: `App ID: ${a.applicationId || 'N/A'} · ${a.officialBusinessEmail || ''}`,
            status: a.verificationStatus,
            link: `/admin/agencies?search=${encodeURIComponent(a.agencyName)}`,
          });
        });

      // Agents
      (db.agentApplications || [])
        .filter(
          (ag) =>
            ag.agentName?.toLowerCase().includes(queryStr) ||
            ag.email?.toLowerCase().includes(queryStr) ||
            ag.applicationId?.toLowerCase().includes(queryStr) ||
            ag.activationCode?.toLowerCase().includes(queryStr)
        )
        .slice(0, 5)
        .forEach((ag) => {
          results.push({
            type: 'agent',
            id: ag._id,
            title: ag.agentName,
            subtitle: `App ID: ${ag.applicationId} · Code: ${ag.activationCode || 'None'}`,
            status: ag.status,
            link: `/admin/agents?search=${encodeURIComponent(ag.applicationId)}`,
          });
        });

      // Uni Reps
      (db.universityRepApplications || [])
        .filter(
          (ur) =>
            ur.representative?.fullName?.toLowerCase().includes(queryStr) ||
            ur.representative?.officialEmail?.toLowerCase().includes(queryStr) ||
            ur.university?.name?.toLowerCase().includes(queryStr) ||
            ur.applicationId?.toLowerCase().includes(queryStr)
        )
        .slice(0, 5)
        .forEach((ur) => {
          results.push({
            type: 'university_rep',
            id: ur._id,
            title: ur.representative?.fullName || 'Uni Representative',
            subtitle: `${ur.university?.name} · App ID: ${ur.applicationId}`,
            status: ur.status,
            link: `/admin/university-representatives?search=${encodeURIComponent(ur.applicationId)}`,
          });
        });

      // Universities
      (db.universities || [])
        .filter(
          (u) =>
            u.name?.toLowerCase().includes(queryStr) ||
            u.location?.toLowerCase().includes(queryStr) ||
            u.country?.toLowerCase().includes(queryStr)
        )
        .slice(0, 5)
        .forEach((u) => {
          results.push({
            type: 'university',
            id: u._id,
            title: u.name,
            subtitle: `${u.location || u.country} · Rank #${u.rank || 'N/A'}`,
            status: u.status || 'active',
            link: `/admin/universities?search=${encodeURIComponent(u.name)}`,
          });
        });

      // Payments
      (db.paymentOrders || [])
        .filter(
          (p) =>
            p.orderId?.toLowerCase().includes(queryStr) ||
            p.transactionId?.toLowerCase().includes(queryStr) ||
            p.packageName?.toLowerCase().includes(queryStr)
        )
        .slice(0, 5)
        .forEach((p) => {
          results.push({
            type: 'payment',
            id: p._id,
            title: `Order: ${p.orderId}`,
            subtitle: `TxID: ${p.transactionId} · ৳${p.finalAmount} (${p.credits} CR)`,
            status: p.status,
            link: `/admin/payments?search=${encodeURIComponent(p.orderId)}`,
          });
        });
    }

    return res.status(200).json({
      success: true,
      data: {
        results,
        total: results.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── 3. Central User Management ────────────────────────────────────────────────
// @desc    Get all users with filtering, role, status, and search
// @route   GET /api/admin/users
// @access  Private (Admin)
export const getAdminUsers = async (req, res, next) => {
  try {
    const { role = 'all', status = 'all', search = '', page = 1, limit = 50 } = req.query;
    const conditions = [];

    if (role && role !== 'all') {
      const r = role.toLowerCase();
      if (r === 'unirep' || r === 'university_rep') {
        conditions.push({ role: { $in: ['university_rep', 'university representative', 'university'] } });
      } else {
        conditions.push({ role: r });
      }
    }

    if (status && status !== 'all') {
      conditions.push({
        $or: [{ status }, { accountStatus: status.toUpperCase() }],
      });
    }

    if (search && search.trim()) {
      const s = search.trim();
      conditions.push({
        $or: [
          { name: { $regex: s, $options: 'i' } },
          { email: { $regex: s, $options: 'i' } },
          { phone: { $regex: s, $options: 'i' } },
        ],
      });
    }

    const filter = conditions.length > 0 ? { $and: conditions } : {};

    let users = [];
    let total = 0;

    if (mongoose.connection.readyState === 1) {
      total = await User.countDocuments(filter);
      const rawUsers = await User.find(filter)
        .select('-password -activationTokenHash')
        .populate('agencyId', 'name email phone')
        .populate('universityId', 'name country location')
        .populate('agencyProfile', 'agencyName legalName agencyType country city website verificationStatus applicationId')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit));

      users = await Promise.all(
        rawUsers.map(async (doc) => {
          const u = doc.toObject ? doc.toObject() : { ...doc };
          if (u.role === 'agency' && !u.agencyProfile) {
            u.agencyProfile = await AgencyProfile.findOne({ user: u._id }).select('agencyName legalName agencyType country city website verificationStatus applicationId').lean();
          }
          if (u.role === 'agent' && !u.agencyId) {
            const app = await AgentApplication.findOne({ $or: [{ applicationId: u.agentApplicationId }, { email: u.email }] }).select('agency agencyName designation countrySpecialization').lean();
            if (app) {
              u.agentApplication = app;
              if (app.agencyName) u.agencyName = app.agencyName;
            }
          }
          if ((u.role === 'university_rep' || u.role === 'university' || u.role === 'university representative') && !u.universityId) {
            const app = await UniversityRepresentativeApplication.findOne({ user: u._id }).select('university applicationId status representative').lean();
            if (app) {
              u.uniRepApplication = app;
              if (app.university) u.universityDetails = app.university;
            }
          }
          if (u.role === 'student') {
            const breakdown = getActiveCreditsBreakdown(u);
            u.availableCredits = breakdown.availableCredits;
            u.walletCredits = breakdown.availableCredits;
            u.freeCredits = breakdown.freeCredits;
            u.paidCredits = breakdown.paidCredits;
            u.creditsBreakdown = breakdown;
          }
          return u;
        })
      );
    } else {
      const all = await devStore.findUsers({ role, status, search });
      total = all.length;
      const rawUsers = all.slice((page - 1) * limit, page * limit);
      const db = devStore.read();
      users = rawUsers.map((u) => {
        const item = { ...u };
        const uid = item._id ? item._id.toString() : '';
        if (item.role === 'agency') {
          item.agencyProfile = (db.agencyProfiles || []).find((p) => (
            p.user?.toString() === uid ||
            p.user?._id?.toString() === uid ||
            p.userId?.toString() === uid ||
            (p.officialBusinessEmail && p.officialBusinessEmail === item.email)
          ));
        } else if (item.role === 'agent') {
          if (item.agencyId) {
            const agIdStr = item.agencyId.toString();
            item.agencyId = (db.users || []).find((ag) => ag._id?.toString() === agIdStr);
          }
          const app = (db.agentApplications || []).find((a) => (
            (item.email && a.email === item.email) ||
            (item.agentApplicationId && a.applicationId === item.agentApplicationId)
          ));
          if (app) {
            item.agentApplication = app;
            if (app.agencyName) item.agencyName = app.agencyName;
          }
        } else if (item.role === 'university_rep' || item.role === 'university' || item.role === 'university representative') {
          if (item.universityId) {
            const uIdStr = item.universityId.toString();
            item.universityId = (db.universities || []).find((un) => un._id?.toString() === uIdStr);
          }
          const app = (db.universityRepApplications || []).find((a) => (
            a.user?.toString() === uid ||
            a.user?._id?.toString() === uid ||
            a.userId?.toString() === uid ||
            (item.email && a.email === item.email)
          ));
          if (app) {
            item.uniRepApplication = app;
            if (app.university) item.universityDetails = app.university;
          }
        }
        if (item.role === 'student') {
          const breakdown = getActiveCreditsBreakdown(item);
          item.availableCredits = breakdown.availableCredits;
          item.walletCredits = breakdown.availableCredits;
          item.freeCredits = breakdown.freeCredits;
          item.paidCredits = breakdown.paidCredits;
          item.creditsBreakdown = breakdown;
        }
        return item;
      });
    }

    return res.status(200).json({
      success: true,
      count: users.length,
      total,
      data: { users },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user full details
// @route   GET /api/admin/users/:id
// @access  Private (Admin)
export const getAdminUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let user = null;
    let related = {
      applications: [],
      agencyProfile: null,
      agentApplications: [],
      agentApplication: null,
      uniRepApplication: null,
      paymentOrders: [],
      creditTransactions: [],
      auditHistory: [],
    };

    if (mongoose.connection.readyState === 1) {
      user = await User.findById(id)
        .select('-password -activationTokenHash')
        .populate('agencyId', 'name email phone')
        .populate('universityId', 'name country location')
        .populate('agencyProfile');

      if (user) {
        if (user.role === 'student') {
          related.applications = await Application.find({ user: user._id }).sort({ createdAt: -1 });
          related.paymentOrders = await PaymentOrder.find({ user: user._id }).sort({ createdAt: -1 });
          related.creditTransactions = await CreditTransaction.find({ user: user._id })
            .populate('admin', 'name email')
            .sort({ createdAt: -1 });
          const breakdown = getActiveCreditsBreakdown(user);
          user = user.toObject ? user.toObject() : { ...user };
          user.availableCredits = breakdown.availableCredits;
          user.walletCredits = breakdown.availableCredits;
          user.freeCredits = breakdown.freeCredits;
          user.paidCredits = breakdown.paidCredits;
          user.creditsBreakdown = breakdown;
        } else if (user.role === 'agency') {
          related.agencyProfile = user.agencyProfile || await AgencyProfile.findOne({ user: user._id });
          related.agentApplications = await AgentApplication.find({ agency: user._id });
        } else if (user.role === 'agent') {
          related.agentApplication = await AgentApplication.findOne({
            $or: [{ applicationId: user.agentApplicationId }, { email: user.email }]
          });
        } else if (user.role === 'university_rep' || user.role === 'university' || user.role === 'university representative') {
          related.uniRepApplication = await UniversityRepresentativeApplication.findOne({ user: user._id });
        }
        related.auditHistory = await AuditLog.find({ targetId: user._id.toString() }).sort({ createdAt: -1 });
      }
    } else {
      user = await devStore.findUserById(id);
      if (user) {
        const db = devStore.read();
        const uid = user._id.toString();
        if (user.agencyId) {
          const agIdStr = user.agencyId.toString();
          user.agencyId = (db.users || []).find((ag) => ag._id?.toString() === agIdStr) || user.agencyId;
        }
        if (user.universityId) {
          const uIdStr = user.universityId.toString();
          user.universityId = (db.universities || []).find((un) => un._id?.toString() === uIdStr) || user.universityId;
        }
        if (user.role === 'student') {
          related.applications = (db.applications || [])
            .filter((a) => (a.user?._id || a.user)?.toString() === uid)
            .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
          related.paymentOrders = (db.paymentOrders || [])
            .filter((p) => (p.user?._id || p.user)?.toString() === uid)
            .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
          related.creditTransactions = (db.creditTransactions || [])
            .filter((c) => (c.user?._id || c.user)?.toString() === uid)
            .map((tx) => {
              const adminId = (tx.admin?._id || tx.admin)?.toString();
              const adminUser = adminId ? (db.users || []).find((u) => u._id === adminId) : null;
              return {
                ...tx,
                adminName: tx.adminName || adminUser?.name || '',
                adminEmail: tx.adminEmail || adminUser?.email || '',
              };
            })
            .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
          const breakdown = getActiveCreditsBreakdown(user);
          user = { ...user };
          user.availableCredits = breakdown.availableCredits;
          user.walletCredits = breakdown.availableCredits;
          user.freeCredits = breakdown.freeCredits;
          user.paidCredits = breakdown.paidCredits;
          user.creditsBreakdown = breakdown;
        } else if (user.role === 'agency') {
          related.agencyProfile = await devStore.findAgencyProfileByUserId(uid);
          related.agentApplications = await devStore.findAgentApplications({ agency: uid });
        } else if (user.role === 'agent') {
          related.agentApplication = (db.agentApplications || []).find((a) => a.email === user.email || a.applicationId === user.agentApplicationId);
        } else if (user.role === 'university_rep' || user.role === 'university' || user.role === 'university representative') {
          related.uniRepApplication = await devStore.findUniRepApplicationByUserId(uid);
        }
        related.auditHistory = (db.auditLogs || []).filter((l) => l.targetId === uid);
      }
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      data: { user, related },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile, status, or administrative notes
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
export const updateAdminUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      phone,
      status,
      accountStatus,
      targetCountry,
      targetCourse,
      gpa,
      ielts,
      adminNotes,
      emailVerified,
      reason = 'Admin updated user record',
    } = req.body;

    let previousUser = null;
    let updatedUser = null;

    if (mongoose.connection.readyState === 1) {
      previousUser = await User.findById(id);
      if (!previousUser) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const updates = {};
      if (name) updates.name = name.trim();
      if (phone) updates.phone = phone.trim();
      if (email && email.toLowerCase() !== previousUser.email) {
        // Prevent duplicate email
        const exist = await User.findOne({ email: email.toLowerCase().trim(), _id: { $ne: id } });
        if (exist) {
          return res.status(409).json({ success: false, message: 'Email address already in use.' });
        }
        updates.email = email.toLowerCase().trim();
      }
      if (status) {
        updates.status = status;
        if (status === 'suspended' && !accountStatus) {
          updates.accountStatus = 'SUSPENDED';
          updates.isActive = false;
        } else if (status === 'active' && !accountStatus) {
          updates.accountStatus = 'ACTIVE';
          updates.isActive = true;
        }
      }
      if (accountStatus) {
        updates.accountStatus = accountStatus;
        updates.isActive = accountStatus === 'ACTIVE' || accountStatus === 'APPROVED';
        if (accountStatus === 'SUSPENDED' && !status) {
          updates.status = 'suspended';
        } else if (accountStatus === 'ACTIVE' && !status) {
          updates.status = 'active';
        }
      }
      if (targetCountry !== undefined) updates.targetCountry = targetCountry;
      if (targetCourse !== undefined) updates.targetCourse = targetCourse;
      if (gpa !== undefined) updates.gpa = gpa;
      if (ielts !== undefined) updates.ielts = ielts;
      if (adminNotes !== undefined) updates.adminNotes = adminNotes;
      if (emailVerified !== undefined) updates.emailVerified = emailVerified;

      updatedUser = await User.findByIdAndUpdate(id, updates, { new: true }).select('-password -activationTokenHash');
    } else {
      previousUser = await devStore.findUserById(id);
      if (!previousUser) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const updates = {};
      if (name) updates.name = name.trim();
      if (phone) updates.phone = phone.trim();
      if (email && email.toLowerCase() !== previousUser.email) {
        const exist = await devStore.findUserByEmail(email);
        if (exist && exist._id !== id) {
          return res.status(409).json({ success: false, message: 'Email address already in use.' });
        }
        updates.email = email.toLowerCase().trim();
      }
      if (status) {
        updates.status = status;
        if (status === 'suspended' && !accountStatus) {
          updates.accountStatus = 'SUSPENDED';
          updates.isActive = false;
        } else if (status === 'active' && !accountStatus) {
          updates.accountStatus = 'ACTIVE';
          updates.isActive = true;
        }
      }
      if (accountStatus) {
        updates.accountStatus = accountStatus;
        updates.isActive = accountStatus === 'ACTIVE' || accountStatus === 'APPROVED';
        if (accountStatus === 'SUSPENDED' && !status) {
          updates.status = 'suspended';
        } else if (accountStatus === 'ACTIVE' && !status) {
          updates.status = 'active';
        }
      }
      if (targetCountry !== undefined) updates.targetCountry = targetCountry;
      if (targetCourse !== undefined) updates.targetCourse = targetCourse;
      if (gpa !== undefined) updates.gpa = gpa;
      if (ielts !== undefined) updates.ielts = ielts;
      if (adminNotes !== undefined) updates.adminNotes = adminNotes;
      if (emailVerified !== undefined) updates.emailVerified = emailVerified;

      updatedUser = await devStore.updateUser(id, updates);
    }

    // Record audit log
    await recordAuditLog({
      req,
      action: 'UPDATED_USER',
      module: 'users',
      targetType: 'User',
      targetId: id,
      targetName: updatedUser.name,
      previousValue: { status: previousUser.status, accountStatus: previousUser.accountStatus },
      newValue: { status: updatedUser.status, accountStatus: updatedUser.accountStatus },
      reason,
    });

    return res.status(200).json({
      success: true,
      message: 'User profile updated successfully',
      data: { user: updatedUser },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Permanently delete suspended user and their exclusive related records
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
export const deleteAdminUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ success: false, message: 'User ID is required.' });
    }

    let user = null;

    if (mongoose.connection.readyState === 1) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid user ID format.' });
      }
      user = await User.findById(id);
    } else {
      user = await devStore.findUserById(id);
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // 0. Cross-role verification for role-specific routes
    const isStudentRoute = req.originalUrl?.includes('/api/admin/students') || req.baseUrl?.includes('students');
    if (isStudentRoute && user.role !== 'student') {
      return res.status(400).json({
        success: false,
        message: 'Target user is not a student.',
      });
    }

    // 1. Protect Admin accounts
    // Cannot delete currently logged in admin
    const currentAdminId = req.user?._id?.toString();
    const currentAdminEmail = req.user?.email?.toLowerCase();
    if (currentAdminId && (currentAdminId === user._id.toString() || currentAdminEmail === user.email?.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own admin account.',
      });
    }

    // Cannot delete protected superadmin account
    const superAdminEmail = (process.env.ADMIN_EMAIL || 'admin@admify.world').toLowerCase();
    if (user.email?.toLowerCase() === superAdminEmail || user.email?.toLowerCase() === 'admin@admify.world') {
      return res.status(403).json({
        success: false,
        message: 'Protected superadmin account cannot be deleted.',
      });
    }

    // Cannot delete the last remaining admin account
    if (user.role === 'admin') {
      let adminCount = 0;
      if (mongoose.connection.readyState === 1) {
        adminCount = await User.countDocuments({ role: 'admin' });
      } else {
        const db = devStore.read();
        adminCount = (db.users || []).filter((u) => u.role === 'admin').length;
      }
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete the last remaining admin account.',
        });
      }
    }

    // 2. Enforce suspended status (HTTP 409 Conflict — not a client validation error)
    const isSuspended = user.status === 'suspended' || user.accountStatus === 'SUSPENDED';
    if (!isSuspended) {
      return res.status(409).json({
        success: false,
        message: `${user.role === 'student' ? 'Student' : 'User'} must be suspended before deletion.`,
      });
    }

    // 3. Record Audit Log before deletion (safe metadata only, no passwords/hashes/tokens)
    const auditAction = user.role === 'student' ? 'ADMIN_DELETE_STUDENT' : (user.role === 'agent' ? 'ADMIN_DELETE_AGENT' : 'USER_PERMANENT_DELETE');
    await recordAuditLog({
      req,
      action: auditAction,
      module: 'USERS',
      targetType: 'User',
      targetId: user._id.toString(),
      targetName: user.name,
      previousValue: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        accountStatus: user.accountStatus,
        status: user.status,
      },
      newValue: null,
      reason: req.body?.reason || `Admin permanently deleted suspended ${user.role || 'user'}`,
    });

    // 4. Permanent physical deletion of User and exclusive related records
    const uid = user._id.toString();

    if (mongoose.connection.readyState === 1) {
      // Delete user physically from database
      await User.deleteOne({ _id: user._id });

      // Clean up exclusive user data based on role
      if (user.role === 'student') {
        await Application.deleteMany({ user: user._id });
        await CreditTransaction.deleteMany({ user: user._id });
        await PaymentOrder.deleteMany({ user: user._id });
        await Notification.deleteMany({ user: user._id });
        await Report.deleteMany({ reportedBy: user._id });
        await ChatMessage.deleteMany({ user: user._id });
      } else if (user.role === 'agency') {
        await AgencyProfile.deleteOne({ user: user._id });
        await AgencyServiceOrder.deleteMany({ $or: [{ agency: user._id }, { user: user._id }] });
        await UniversityAgencyConnection.deleteMany({ agency: user._id });
        // Unbind any affiliated agents so they don't reference a deleted agency
        await User.updateMany({ agencyId: user._id }, { $unset: { agencyId: 1 } });
      } else if (user.role === 'agent') {
        await AgentApplication.deleteMany({
          $or: [{ user: user._id }, { email: user.email }, { applicationId: user.agentApplicationId }],
        });
        await Task.deleteMany({ agent: user._id });
      } else if (user.role === 'university_rep' || user.role === 'university' || user.role === 'university representative') {
        await UniversityRepresentativeApplication.deleteMany({
          $or: [{ user: user._id }, { email: user.email }],
        });
        // Note: Do NOT delete the University itself!
      }
    } else {
      // devStore mode physical deletion
      const db = devStore.read();
      db.users = (db.users || []).filter((u) => u._id?.toString() !== uid);

      if (user.role === 'student') {
        db.applications = (db.applications || []).filter((a) => a.user?.toString() !== uid);
        db.creditTransactions = (db.creditTransactions || []).filter((c) => c.user?.toString() !== uid);
        db.paymentOrders = (db.paymentOrders || []).filter((p) => p.user?.toString() !== uid);
        db.notifications = (db.notifications || []).filter((n) => n.user?.toString() !== uid);
        db.reports = (db.reports || []).filter((r) => r.reportedBy?.toString() !== uid);
        db.chatMessages = (db.chatMessages || []).filter((m) => m.user?.toString() !== uid);
      } else if (user.role === 'agency') {
        db.agencyProfiles = (db.agencyProfiles || []).filter((p) => p.user?.toString() !== uid && p._id?.toString() !== uid);
        db.agencyServiceOrders = (db.agencyServiceOrders || []).filter((o) => o.agency?.toString() !== uid && o.user?.toString() !== uid);
        db.universityAgencyConnections = (db.universityAgencyConnections || []).filter((c) => c.agency?.toString() !== uid);
        (db.users || []).forEach((u) => {
          if (u.agencyId?.toString() === uid) delete u.agencyId;
        });
      } else if (user.role === 'agent') {
        db.agentApplications = (db.agentApplications || []).filter((a) => a.user?.toString() !== uid && a.email !== user.email && a.applicationId !== user.agentApplicationId);
        db.tasks = (db.tasks || []).filter((t) => t.agent?.toString() !== uid);
      } else if (user.role === 'university_rep' || user.role === 'university' || user.role === 'university representative') {
        db.universityRepApplications = (db.universityRepApplications || []).filter((a) => a.user?.toString() !== uid && a.email !== user.email);
      }
      devStore.write(db);
    }

    return res.status(200).json({
      success: true,
      message: `${user.role === 'student' ? 'Student' : 'User'} permanently deleted.`,
    });
  } catch (error) {
    next(error);
  }
};

// In-memory cache for double-click / duplicate request protection (expires in 2.5s)
const recentAdjustmentsCache = new Map();

// ── 4. Controlled Wallet & Credit Adjustments ──────────────────────────────────
// @desc    Controlled manual credit adjustment (ADD / REMOVE) by Admin with strict reason and ledger entry
// @route   POST /api/admin/credits/adjust
// @access  Private (Admin)
export const adjustUserCredits = async (req, res, next) => {
  try {
    // 1. Role enforcement: Only Admin can perform manual adjustments
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Only administrators can adjust credit balances.',
      });
    }

    const userId = req.body.userId || req.params.id;
    const { amount, action, direction, creditType = 'paid', reason, note } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required.' });
    }

    // 2. Validate Amount: Must be a positive integer
    const rawAmount = amount;
    const parsedAmount = Number(rawAmount);
    if (
      rawAmount === undefined ||
      rawAmount === null ||
      rawAmount === '' ||
      isNaN(parsedAmount) ||
      !Number.isInteger(parsedAmount) ||
      parsedAmount === 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a positive integer.',
      });
    }

    const actionUpper = (action || '').toUpperCase();
    const directionUpper = (direction || '').toUpperCase();
    const isDebit = actionUpper === 'REMOVE' || directionUpper === 'DEBIT' || parsedAmount < 0;
    const absAmount = Math.abs(parsedAmount);

    if (!Number.isInteger(absAmount) || absAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a positive integer.',
      });
    }

    // 3. Validate Reason: Mandatory, min 5 chars
    if (!reason || typeof reason !== 'string' || reason.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: 'A detailed reason (at least 5 characters) is required for audit compliance.',
      });
    }

    // 4. Duplicate request / double-click protection (10 seconds window)
    const duplicateKey = `${req.user._id}:${userId}:${isDebit ? 'REMOVE' : 'ADD'}:${absAmount}:${reason.trim()}`;
    const lastRequestTime = recentAdjustmentsCache.get(duplicateKey);
    const nowTime = Date.now();
    if (lastRequestTime && nowTime - lastRequestTime < 10000) {
      return res.status(409).json({
        success: false,
        message: 'Duplicate adjustment request detected. Please wait a moment before resubmitting.',
      });
    }
    recentAdjustmentsCache.set(duplicateKey, nowTime);
    // Cleanup cache entries older than 30 seconds
    for (const [k, v] of recentAdjustmentsCache.entries()) {
      if (nowTime - v > 30000) recentAdjustmentsCache.delete(k);
    }

    let user = null;
    let balanceBefore = 0;
    let balanceAfter = 0;
    let ledgerTx = null;

    if (mongoose.connection.readyState === 1) {
      user = await User.findById(userId);
      if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

      if (user.role !== 'student') {
        return res.status(400).json({
          success: false,
          message: 'Admify Credit Wallet is strictly applicable to Student accounts only.',
        });
      }

      const breakdownBefore = getActiveCreditsBreakdown(user);
      balanceBefore = breakdownBefore.availableCredits;
      const prevPaid = breakdownBefore.paidCredits;
      const prevFree = breakdownBefore.freeCredits;

      // 5. REMOVE cannot make student's balance or sub-balance negative
      if (isDebit) {
        if (absAmount > balanceBefore) {
          return res.status(400).json({
            success: false,
            message: `Cannot remove ${absAmount} CR. Student only has ${balanceBefore} CR available.`,
          });
        }

        if (creditType === 'free') {
          if (absAmount > prevFree) {
            return res.status(400).json({
              success: false,
              message: `Cannot remove ${absAmount} Free Credits. Student only has ${prevFree} Free Credits available.`,
            });
          }
          user.freeCredits = prevFree - absAmount;
        } else {
          // creditType === 'paid'
          if (absAmount > prevPaid) {
            return res.status(400).json({
              success: false,
              message: `Cannot remove ${absAmount} Paid Credits. Student only has ${prevPaid} Paid Credits available.`,
            });
          }
          user.paidCredits = prevPaid - absAmount;
        }
      } else {
        if (creditType === 'free') {
          user.freeCredits = prevFree + absAmount;
        } else {
          user.paidCredits = prevPaid + absAmount;
        }
      }

      user.walletCredits = (user.paidCredits || 0) + (user.freeCredits || 0);
      const breakdownAfter = getActiveCreditsBreakdown(user);
      balanceAfter = breakdownAfter.availableCredits;
      await user.save();

      const delta = isDebit ? -absAmount : absAmount;
      const transactionId = `CTX-ADJ-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
      ledgerTx = await CreditTransaction.create({
        transactionId,
        user: user._id,
        type: 'ADMIN_ADJUSTMENT',
        direction: isDebit ? 'DEBIT' : 'CREDIT',
        credits: delta,
        balanceBefore,
        balanceAfter,
        referenceType: 'ADMIN_ADJUSTMENT',
        referenceId: req.user._id.toString(),
        admin: req.user._id,
        adminName: req.user.name || 'Admin',
        adminEmail: req.user.email || '',
        reason: reason.trim(),
        note: note ? note.trim() : '',
        desc: `Admin Adjustment (${delta > 0 ? '+' : ''}${delta} CR): ${reason.trim()}`,
        status: 'COMPLETED',
      });

      // Record audit log
      await recordAuditLog({
        req,
        action: 'ADMIN_CREDIT_ADJUSTMENT',
        module: 'credits',
        targetType: 'User',
        targetId: userId,
        targetName: user.name,
        previousValue: { balance: balanceBefore, paidCredits: prevPaid, freeCredits: prevFree },
        newValue: {
          balance: balanceAfter,
          adjustment: delta,
          direction: isDebit ? 'DEBIT' : 'CREDIT',
          amount: absAmount,
          creditType,
          paidCredits: user.paidCredits,
          freeCredits: user.freeCredits,
        },
        reason: reason.trim(),
      });
    } else {
      user = await devStore.findUserById(userId);
      if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

      if (user.role !== 'student') {
        return res.status(400).json({
          success: false,
          message: 'Admify Credit Wallet is strictly applicable to Student accounts only.',
        });
      }

      const breakdownBefore = getActiveCreditsBreakdown(user);
      balanceBefore = breakdownBefore.availableCredits;
      const prevPaid = breakdownBefore.paidCredits;
      const prevFree = breakdownBefore.freeCredits;
      let newPaid = prevPaid;
      let newFree = prevFree;

      if (isDebit) {
        if (absAmount > balanceBefore) {
          return res.status(400).json({
            success: false,
            message: `Cannot remove ${absAmount} CR. Student only has ${balanceBefore} CR available.`,
          });
        }

        if (creditType === 'free') {
          if (absAmount > prevFree) {
            return res.status(400).json({
              success: false,
              message: `Cannot remove ${absAmount} Free Credits. Student only has ${prevFree} Free Credits available.`,
            });
          }
          newFree = prevFree - absAmount;
        } else {
          if (absAmount > prevPaid) {
            return res.status(400).json({
              success: false,
              message: `Cannot remove ${absAmount} Paid Credits. Student only has ${prevPaid} Paid Credits available.`,
            });
          }
          newPaid = prevPaid - absAmount;
        }
      } else {
        if (creditType === 'free') {
          newFree = prevFree + absAmount;
        } else {
          newPaid = prevPaid + absAmount;
        }
      }

      const newWallet = newPaid + newFree;
      user = await devStore.updateUser(userId, {
        paidCredits: newPaid,
        freeCredits: newFree,
        walletCredits: newWallet,
      });

      const breakdownAfter = getActiveCreditsBreakdown(user);
      balanceAfter = breakdownAfter.availableCredits;

      const delta = isDebit ? -absAmount : absAmount;
      const transactionId = `CTX-ADJ-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
      ledgerTx = await devStore.createCreditTransaction({
        transactionId,
        user: userId,
        type: 'ADMIN_ADJUSTMENT',
        direction: isDebit ? 'DEBIT' : 'CREDIT',
        credits: delta,
        balanceBefore,
        balanceAfter,
        referenceType: 'ADMIN_ADJUSTMENT',
        referenceId: req.user._id.toString(),
        admin: req.user._id,
        adminName: req.user.name || 'Admin',
        adminEmail: req.user.email || '',
        reason: reason.trim(),
        note: note ? note.trim() : '',
        desc: `Admin Adjustment (${delta > 0 ? '+' : ''}${delta} CR): ${reason.trim()}`,
        status: 'COMPLETED',
      });

      // Record audit log
      await recordAuditLog({
        req,
        action: 'ADMIN_CREDIT_ADJUSTMENT',
        module: 'credits',
        targetType: 'User',
        targetId: userId,
        targetName: user.name,
        previousValue: { balance: balanceBefore, paidCredits: prevPaid, freeCredits: prevFree },
        newValue: {
          balance: balanceAfter,
          adjustment: delta,
          direction: isDebit ? 'DEBIT' : 'CREDIT',
          amount: absAmount,
          creditType,
          paidCredits: newPaid,
          freeCredits: newFree,
        },
        reason: reason.trim(),
      });
    }

    const delta = isDebit ? -absAmount : absAmount;
    const returnUser = user.toObject ? user.toObject() : { ...user };
    returnUser.availableCredits = balanceAfter;
    returnUser.walletCredits = balanceAfter;
    returnUser.creditsBreakdown = getActiveCreditsBreakdown(user);

    return res.status(200).json({
      success: true,
      message: `Adjusted ${delta > 0 ? '+' : ''}${delta} credits for ${user.name}. New balance: ${balanceAfter} CR.`,
      data: {
        user: returnUser,
        balanceBefore,
        balanceAfter,
        transaction: ledgerTx,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all credit transactions ledger
// @route   GET /api/admin/credits/transactions
// @access  Private (Admin)
export const getAdminCreditTransactions = async (req, res, next) => {
  try {
    const { type, search, user } = req.query;

    let transactions = [];
    if (mongoose.connection.readyState === 1) {
      const query = {};
      if (type && type !== 'all') query.type = type;
      if (user) query.user = user;
      if (search) {
        query.$or = [
          { transactionId: { $regex: search, $options: 'i' } },
          { desc: { $regex: search, $options: 'i' } },
          { reason: { $regex: search, $options: 'i' } },
          { adminName: { $regex: search, $options: 'i' } },
        ];
      }
      transactions = await CreditTransaction.find(query)
        .populate('user', 'name email phone role')
        .populate('admin', 'name email')
        .sort({ createdAt: -1 });
    } else {
      transactions = await devStore.findCreditTransactions({ type, search, user });
    }

    return res.status(200).json({
      success: true,
      count: transactions.length,
      data: { transactions },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Controlled safe one-time backfill/sync of missing welcome credit ledger entries for existing students
// @route   POST /api/admin/credits/sync-welcome-ledger
// @access  Private (Admin)
export const syncWelcomeCreditLedger = async (req, res, next) => {
  try {
    let backfilledCount = 0;
    let totalStudents = 0;

    if (mongoose.connection.readyState === 1) {
      const students = await User.find({ role: 'student' });
      totalStudents = students.length;

      for (const student of students) {
        // Check if student already has a WELCOME_CREDIT transaction
        const existingTx = await CreditTransaction.findOne({
          user: student._id,
          type: 'WELCOME_CREDIT',
        });

        if (!existingTx) {
          const createdAt = student.createdAt || new Date();
          const expiresAt = student.freeCreditExpiresAt || new Date(new Date(createdAt).getTime() + 30 * 24 * 60 * 60 * 1000);
          const randSuffix = student._id.toString().slice(-6).toUpperCase();
          const transactionId = `ADM-WELCOME-BF-${randSuffix}`;

          await CreditTransaction.create({
            transactionId,
            user: student._id,
            type: 'WELCOME_CREDIT',
            credits: 20,
            balanceBefore: 0,
            balanceAfter: 20,
            referenceType: 'WELCOME',
            referenceId: 'WELCOME_STARTER_20CR',
            desc: 'Welcome Starter Credits',
            status: 'COMPLETED',
            expiresAt,
            createdAt,
            updatedAt: createdAt,
          });
          backfilledCount++;
        }
      }
    } else {
      const result = devStore.syncWelcomeCreditLedger();
      backfilledCount = result.backfilledCount;
      totalStudents = result.totalStudents;
    }

    if (backfilledCount > 0) {
      await recordAuditLog({
        req,
        action: 'SYNC_WELCOME_CREDITS',
        module: 'credits',
        targetType: 'CreditTransaction',
        targetId: 'BULK_SYNC',
        targetName: 'Welcome Credit Ledger Sync',
        newValue: { backfilledCount, totalStudents },
        reason: 'Safe one-time backfill of missing welcome credit transactions for registered students.',
      });
    }

    return res.status(200).json({
      success: true,
      message: `Synchronized welcome credit ledger. ${backfilledCount} missing transactions backfilled out of ${totalStudents} students.`,
      data: {
        backfilledCount,
        totalStudents,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── 5. Applications Management ────────────────────────────────────────────────
// @desc    Get all applications for admin review
// @route   GET /api/admin/applications
// @access  Private (Admin)
export const getAdminApplications = async (req, res, next) => {
  try {
    const { stage, search } = req.query;

    let applications = [];
    if (mongoose.connection.readyState === 1) {
      const query = {};
      if (stage && stage !== 'all') query.stage = stage;
      if (search) {
        query.$or = [
          { university: { $regex: search, $options: 'i' } },
          { program: { $regex: search, $options: 'i' } },
        ];
      }
      applications = await Application.find(query)
        .populate('user', 'name email phone gpa ielts targetCountry')
        .populate('assignedAgent', 'name email phone')
        .sort({ createdAt: -1 });
      const seenItems = await AdminSeenItem.find({ entityType: 'application' }).lean();
      const seenMap = new Map();
      for (const s of seenItems) seenMap.set(s.entityId, true);

      applications = applications.map((a) => {
        const item = a.toObject ? a.toObject() : { ...a };
        item.isSeenByAdmin = Boolean(item.isSeenByAdmin || isEntityDocSeen('application', item, seenMap));
        return item;
      });
    } else {
      const rawApps = await devStore.findApplications({ stage, search });
      const dbSeen = (devStore.read()).adminSeenItems || [];
      applications = rawApps.map((a) => ({
        ...a,
        isSeenByAdmin: Boolean(a.isSeenByAdmin || isEntityDocSeen('application', a, dbSeen)),
      }));
    }

    return res.status(200).json({
      success: true,
      count: applications.length,
      data: { applications },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update application stage, progress, or assigned agent
// @route   PUT /api/admin/applications/:id
// @access  Private (Admin)
export const updateAdminApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { stage, progress, assignedAgent, notes, stepLabel } = req.body;

    let app = null;
    let prevStage = '';

    if (mongoose.connection.readyState === 1) {
      app = await Application.findById(id);
      if (!app) return res.status(404).json({ success: false, message: 'Application not found' });

      prevStage = app.stage;
      if (stage) app.stage = stage;
      if (progress !== undefined) app.progress = Number(progress);
      if (assignedAgent !== undefined) app.assignedAgent = assignedAgent;
      app.isSeenByAdmin = true;
      app.adminSeenAt = new Date();
      if (notes !== undefined) app.notes = notes;

      if (stepLabel) {
        if (!Array.isArray(app.steps)) app.steps = [];
        app.steps.push({
          label: stepLabel,
          date: new Date().toLocaleDateString(),
          status: 'completed',
        });
      }

      await app.save();
    } else {
      app = await devStore.findApplicationById(id);
      if (!app) return res.status(404).json({ success: false, message: 'Application not found' });

      prevStage = app.stage;
      const updates = {};
      if (stage) updates.stage = stage;
      if (progress !== undefined) updates.progress = Number(progress);
      if (assignedAgent !== undefined) updates.assignedAgent = assignedAgent;
      if (notes !== undefined) updates.notes = notes;

      if (stepLabel) {
        const steps = Array.isArray(app.steps) ? [...app.steps] : [];
        steps.push({
          label: stepLabel,
          date: new Date().toLocaleDateString(),
          status: 'completed',
        });
        updates.steps = steps;
      }

      app = await devStore.updateApplication(id, updates);
    }

    await recordAuditLog({
      req,
      action: 'UPDATED_APPLICATION',
      module: 'applications',
      targetType: 'Application',
      targetId: id,
      targetName: `${app.university} - ${app.program}`,
      previousValue: { stage: prevStage },
      newValue: { stage: app.stage, progress: app.progress },
      reason: notes || 'Admin updated application',
    });

    return res.status(200).json({
      success: true,
      message: 'Application updated successfully',
      data: { application: app },
    });
  } catch (error) {
    next(error);
  }
};

// ── 6. University ↔ Agency Partnerships ──────────────────────────────────────
// @desc    Get all University ↔ Agency partnership connections
// @route   GET /api/admin/partnerships
// @access  Private (Admin)
export const getAdminPartnerships = async (req, res, next) => {
  try {
    const { status } = req.query;
    let connections = [];

    if (mongoose.connection.readyState === 1) {
      const query = {};
      if (status && status !== 'all') query.status = status.toUpperCase();

      connections = await UniversityAgencyConnection.find(query)
        .populate('agencyId', 'name email phone')
        .populate('universityId', 'name location country logo website')
        .populate('universityRepresentativeId', 'name email phone designation')
        .sort({ createdAt: -1 });
      const seenItems = await AdminSeenItem.find({ entityType: 'partnership' }).lean();
      const seenMap = new Map();
      for (const s of seenItems) seenMap.set(s.entityId, true);

      connections = connections.map((c) => {
        const item = c.toObject ? c.toObject() : { ...c };
        item.isSeenByAdmin = Boolean(item.isSeenByAdmin || isEntityDocSeen('partnership', item, seenMap));
        return item;
      });
    } else {
      const filter = {};
      if (status && status !== 'all') filter.status = status.toUpperCase();
      connections = await devStore.findAgencyConnections(filter);

      // Populate details from devStore
      const populated = [];
      const dbSeen = (devStore.read()).adminSeenItems || [];
      for (const c of connections) {
        const agency = await devStore.findUserById(c.agencyId);
        const uni = await devStore.findUniversityById(c.universityId);
        const rep = await devStore.findUserById(c.universityRepresentativeId);
        populated.push({
          ...c,
          isSeenByAdmin: Boolean(c.isSeenByAdmin || isEntityDocSeen('partnership', c, dbSeen)),
          agencyId: agency ? { _id: agency._id, name: agency.name, email: agency.email, phone: agency.phone } : null,
          universityId: uni ? { _id: uni._id, name: uni.name, location: uni.location, country: uni.country } : null,
          universityRepresentativeId: rep ? { _id: rep._id, name: rep.name, email: rep.email, designation: rep.designation } : null,
        });
      }
      connections = populated;
    }

    return res.status(200).json({
      success: true,
      count: connections.length,
      data: { connections },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update partnership connection status (ACCEPTED, REJECTED, BLOCKED, SUSPENDED)
// @route   PUT /api/admin/partnerships/:id/status
// @access  Private (Admin)
export const updateAdminPartnershipStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes = '' } = req.body;

    const allowed = ['PENDING', 'ACCEPTED', 'REJECTED', 'BLOCKED', 'SUSPENDED'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${allowed.join(', ')}` });
    }

    let conn = null;

    if (mongoose.connection.readyState === 1) {
      conn = await UniversityAgencyConnection.findById(id);
      if (!conn) return res.status(404).json({ success: false, message: 'Partnership connection not found.' });

      conn.status = status;
      if (notes) conn.notes = notes;
      conn.respondedAt = new Date();
      conn.isSeenByAdmin = true;
      conn.adminSeenAt = new Date();
      conn.respondedBy = req.user._id;
      await conn.save();
    } else {
      conn = await devStore.findAgencyConnectionById(id);
      if (!conn) return res.status(404).json({ success: false, message: 'Partnership connection not found.' });

      conn = await devStore.updateAgencyConnection(id, {
        status,
        notes: notes || conn.notes,
        respondedAt: new Date().toISOString(),
        respondedBy: req.user._id,
      });
    }

    await recordAuditLog({
      req,
      action: 'UPDATED_PARTNERSHIP',
      module: 'partnerships',
      targetType: 'UniversityAgencyConnection',
      targetId: id,
      targetName: `Connection ${id}`,
      newValue: { status },
      reason: notes || 'Admin changed partnership status',
    });

    return res.status(200).json({
      success: true,
      message: `Partnership status updated to ${status}.`,
      data: { connection: conn },
    });
  } catch (error) {
    next(error);
  }
};

// ── 7. University Management CRUD ─────────────────────────────────────────────
// @desc    Get all universities for admin
// @route   GET /api/admin/universities
// @access  Private (Admin)
export const getAdminUniversities = async (req, res, next) => {
  try {
    const { search, country, status } = req.query;

    let universities = [];
    if (mongoose.connection.readyState === 1) {
      const query = {};
      if (country && country !== 'all') query.country = country.toLowerCase();
      if (status && status !== 'all') query.status = status;
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { location: { $regex: search, $options: 'i' } },
          { country: { $regex: search, $options: 'i' } },
        ];
      }
      universities = await University.find(query).sort({ rank: 1, createdAt: -1 });
    } else {
      universities = await devStore.findUniversities({ search, country, status });
    }

    return res.status(200).json({
      success: true,
      count: universities.length,
      data: { universities },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new University
// @route   POST /api/admin/universities
// @access  Private (Admin)
export const createAdminUniversity = async (req, res, next) => {
  try {
    const { name, country } = req.body;
    if (!name || !country) {
      return res.status(400).json({ success: false, message: 'University Name and Country are required.' });
    }

    let university = null;
    if (mongoose.connection.readyState === 1) {
      university = await University.create(req.body);
    } else {
      university = await devStore.createUniversity(req.body);
    }

    await recordAuditLog({
      req,
      action: 'CREATED_UNIVERSITY',
      module: 'universities',
      targetType: 'University',
      targetId: university._id,
      targetName: university.name,
      newValue: university,
      reason: 'Admin created university record',
    });

    return res.status(201).json({
      success: true,
      message: 'University record created successfully',
      data: { university },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update University
// @route   PUT /api/admin/universities/:id
// @access  Private (Admin)
export const updateAdminUniversity = async (req, res, next) => {
  try {
    const { id } = req.params;
    let university = null;

    if (mongoose.connection.readyState === 1) {
      university = await University.findByIdAndUpdate(id, req.body, { new: true });
    } else {
      university = await devStore.updateUniversity(id, req.body);
    }

    if (!university) {
      return res.status(404).json({ success: false, message: 'University not found.' });
    }

    await recordAuditLog({
      req,
      action: 'UPDATED_UNIVERSITY',
      module: 'universities',
      targetType: 'University',
      targetId: id,
      targetName: university.name,
      newValue: req.body,
      reason: 'Admin updated university record',
    });

    return res.status(200).json({
      success: true,
      message: 'University record updated successfully',
      data: { university },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete University (Soft/Hard safe)
// @route   DELETE /api/admin/universities/:id
// @access  Private (Admin)
export const deleteAdminUniversity = async (req, res, next) => {
  try {
    const { id } = req.params;
    let success = false;

    if (mongoose.connection.readyState === 1) {
      const resDel = await University.findByIdAndDelete(id);
      success = !!resDel;
    } else {
      success = await devStore.deleteUniversity(id);
    }

    if (!success) {
      return res.status(404).json({ success: false, message: 'University not found.' });
    }

    await recordAuditLog({
      req,
      action: 'DELETED_UNIVERSITY',
      module: 'universities',
      targetType: 'University',
      targetId: id,
      reason: 'Admin removed university catalog record',
    });

    return res.status(200).json({
      success: true,
      message: 'University removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

// ── 8. Scholarships Management CRUD ───────────────────────────────────────────
// @desc    Get all scholarships
// @route   GET /api/admin/scholarships
// @access  Private (Admin)
export const getAdminScholarships = async (req, res, next) => {
  try {
    const { search, country } = req.query;

    let scholarships = [];
    if (mongoose.connection.readyState === 1) {
      const query = {};
      if (country && country !== 'all') query.country = { $regex: country, $options: 'i' };
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { university: { $regex: search, $options: 'i' } },
        ];
      }
      const seenItems = await AdminSeenItem.find({ entityType: 'scholarship' }).lean();
      const seenMap = new Map();
      for (const s of seenItems) seenMap.set(s.entityId, true);

      scholarships = (await Scholarship.find(query).sort({ createdAt: -1 })).map((s) => {
        const item = s.toObject ? s.toObject() : { ...s };
        item.isSeenByAdmin = Boolean(item.isSeenByAdmin || isEntityDocSeen('scholarship', item, seenMap));
        return item;
      });
    } else {
      const rawScholarships = await devStore.findScholarships({ search, country });
      const dbSeen = (devStore.read()).adminSeenItems || [];
      scholarships = rawScholarships.map((s) => ({
        ...s,
        isSeenByAdmin: Boolean(s.isSeenByAdmin || isEntityDocSeen('scholarship', s, dbSeen)),
      }));
    }

    return res.status(200).json({
      success: true,
      count: scholarships.length,
      data: { scholarships },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create Scholarship
// @route   POST /api/admin/scholarships
// @access  Private (Admin)
export const createAdminScholarship = async (req, res, next) => {
  try {
    const name = req.body.name || req.body.title;
    req.body.name = name;
    if (!name) return res.status(400).json({ success: false, message: 'Scholarship Name is required.' });

    let scholarship = null;
    if (mongoose.connection.readyState === 1) {
      scholarship = await Scholarship.create(req.body);
    } else {
      scholarship = await devStore.createScholarship(req.body);
    }

    await recordAuditLog({
      req,
      action: 'CREATED_SCHOLARSHIP',
      module: 'scholarships',
      targetType: 'Scholarship',
      targetId: scholarship._id,
      targetName: scholarship.name,
      newValue: scholarship,
      reason: 'Admin added scholarship opportunity',
    });

    return res.status(201).json({
      success: true,
      message: 'Scholarship created successfully',
      data: { scholarship },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Scholarship
// @route   PUT /api/admin/scholarships/:id
// @access  Private (Admin)
export const updateAdminScholarship = async (req, res, next) => {
  try {
    const { id } = req.params;
    let scholarship = null;

    if (mongoose.connection.readyState === 1) {
      scholarship = await Scholarship.findByIdAndUpdate(id, req.body, { new: true });
    } else {
      scholarship = await devStore.updateScholarship(id, req.body);
    }

    if (!scholarship) return res.status(404).json({ success: false, message: 'Scholarship not found' });

    await recordAuditLog({
      req,
      action: 'UPDATED_SCHOLARSHIP',
      module: 'scholarships',
      targetType: 'Scholarship',
      targetId: id,
      targetName: scholarship.name,
      newValue: req.body,
    });

    return res.status(200).json({
      success: true,
      message: 'Scholarship updated successfully',
      data: { scholarship },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete Scholarship
// @route   DELETE /api/admin/scholarships/:id
// @access  Private (Admin)
export const deleteAdminScholarship = async (req, res, next) => {
  try {
    const { id } = req.params;
    let success = false;

    if (mongoose.connection.readyState === 1) {
      const resDel = await Scholarship.findByIdAndDelete(id);
      success = !!resDel;
    } else {
      success = await devStore.deleteScholarship(id);
    }

    if (!success) return res.status(404).json({ success: false, message: 'Scholarship not found' });

    await recordAuditLog({
      req,
      action: 'DELETED_SCHOLARSHIP',
      module: 'scholarships',
      targetType: 'Scholarship',
      targetId: id,
    });

    return res.status(200).json({ success: true, message: 'Scholarship deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// ── 9. Coupons Management CRUD ────────────────────────────────────────────────
// @desc    Get all discount coupons
// @route   GET /api/admin/coupons
// @access  Private (Admin)
export const getAdminCoupons = async (req, res, next) => {
  try {
    const { search, isActive } = req.query;

    let coupons = [];
    if (mongoose.connection.readyState === 1) {
      const query = {};
      if (isActive !== undefined) query.isActive = isActive === 'true';
      if (search) query.code = { $regex: search, $options: 'i' };
      coupons = await Coupon.find(query).sort({ createdAt: -1 });
    } else {
      coupons = await devStore.findCoupons({ search, isActive });
    }

    return res.status(200).json({
      success: true,
      count: coupons.length,
      data: { coupons },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create Coupon
// @route   POST /api/admin/coupons
// @access  Private (Admin)
export const createAdminCoupon = async (req, res, next) => {
  try {
    const code = req.body.code;
    const discountPercent = req.body.discountPercent || req.body.discountPercentage;
    req.body.discountPercent = discountPercent;
    if (!code || !discountPercent) {
      return res.status(400).json({ success: false, message: 'Coupon Code and Discount Percent are required.' });
    }

    let coupon = null;
    if (mongoose.connection.readyState === 1) {
      coupon = await Coupon.create(req.body);
    } else {
      coupon = await devStore.createCoupon(req.body);
    }

    await recordAuditLog({
      req,
      action: 'CREATED_COUPON',
      module: 'coupons',
      targetType: 'Coupon',
      targetId: coupon._id,
      targetName: coupon.code,
      newValue: coupon,
      reason: 'Admin issued new promotional coupon',
    });

    return res.status(201).json({
      success: true,
      message: `Coupon ${coupon.code} created successfully.`,
      data: { coupon },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'A coupon with this code already exists.' });
    }
    next(error);
  }
};

// @desc    Update Coupon
// @route   PUT /api/admin/coupons/:id
// @access  Private (Admin)
export const updateAdminCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;
    let coupon = null;

    if (mongoose.connection.readyState === 1) {
      coupon = await Coupon.findByIdAndUpdate(id, req.body, { new: true });
    } else {
      coupon = await devStore.updateCoupon(id, req.body);
    }

    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found.' });

    await recordAuditLog({
      req,
      action: 'UPDATED_COUPON',
      module: 'coupons',
      targetType: 'Coupon',
      targetId: id,
      targetName: coupon.code,
      newValue: req.body,
    });

    return res.status(200).json({
      success: true,
      message: 'Coupon updated successfully',
      data: { coupon },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete Coupon
// @route   DELETE /api/admin/coupons/:id
// @access  Private (Admin)
export const deleteAdminCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;
    let success = false;

    if (mongoose.connection.readyState === 1) {
      const resDel = await Coupon.findByIdAndDelete(id);
      success = !!resDel;
    } else {
      success = await devStore.deleteCoupon(id);
    }

    if (!success) return res.status(404).json({ success: false, message: 'Coupon not found.' });

    await recordAuditLog({
      req,
      action: 'DELETED_COUPON',
      module: 'coupons',
      targetType: 'Coupon',
      targetId: id,
    });

    return res.status(200).json({ success: true, message: 'Coupon deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

// ── 10. Countries Management CRUD ─────────────────────────────────────────────
// @desc    Get all supported destination countries
// @route   GET /api/admin/countries
// @access  Private (Admin)
export const getAdminCountries = async (req, res, next) => {
  try {
    const { search, status } = req.query;

    let countries = [];
    if (mongoose.connection.readyState === 1) {
      const query = {};
      if (status && status !== 'all') query.status = status;
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { code: { $regex: search, $options: 'i' } },
        ];
      }
      countries = await Country.find(query).sort({ name: 1 });
    } else {
      countries = await devStore.findCountries({ search, status });
    }

    return res.status(200).json({
      success: true,
      count: countries.length,
      data: { countries },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create Country
// @route   POST /api/admin/countries
// @access  Private (Admin)
export const createAdminCountry = async (req, res, next) => {
  try {
    const { name, code } = req.body;
    if (!name || !code) {
      return res.status(400).json({ success: false, message: 'Country Name and 2-letter Code are required.' });
    }

    let country = null;
    if (mongoose.connection.readyState === 1) {
      country = await Country.create(req.body);
    } else {
      country = await devStore.createCountry(req.body);
    }

    await recordAuditLog({
      req,
      action: 'CREATED_COUNTRY',
      module: 'countries',
      targetType: 'Country',
      targetId: country._id,
      targetName: country.name,
      newValue: country,
    });

    return res.status(201).json({
      success: true,
      message: `Destination country ${country.name} added successfully.`,
      data: { country },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'This country name or code already exists.' });
    }
    next(error);
  }
};

// @desc    Update Country
// @route   PUT /api/admin/countries/:id
// @access  Private (Admin)
export const updateAdminCountry = async (req, res, next) => {
  try {
    const { id } = req.params;
    let country = null;

    if (mongoose.connection.readyState === 1) {
      country = await Country.findByIdAndUpdate(id, req.body, { new: true });
    } else {
      country = await devStore.updateCountry(id, req.body);
    }

    if (!country) return res.status(404).json({ success: false, message: 'Country not found.' });

    await recordAuditLog({
      req,
      action: 'UPDATED_COUNTRY',
      module: 'countries',
      targetType: 'Country',
      targetId: id,
      targetName: country.name,
      newValue: req.body,
    });

    return res.status(200).json({
      success: true,
      message: 'Country profile updated successfully.',
      data: { country },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete Country
// @route   DELETE /api/admin/countries/:id
// @access  Private (Admin)
export const deleteAdminCountry = async (req, res, next) => {
  try {
    const { id } = req.params;
    let success = false;

    if (mongoose.connection.readyState === 1) {
      const resDel = await Country.findByIdAndDelete(id);
      success = !!resDel;
    } else {
      success = await devStore.deleteCountry(id);
    }

    if (!success) return res.status(404).json({ success: false, message: 'Country not found.' });

    await recordAuditLog({
      req,
      action: 'DELETED_COUNTRY',
      module: 'countries',
      targetType: 'Country',
      targetId: id,
    });

    return res.status(200).json({ success: true, message: 'Country removed successfully.' });
  } catch (error) {
    next(error);
  }
};

// ── 11. Reports & Complaints Management ───────────────────────────────────────
// @desc    Get all user reports and complaints
// @route   GET /api/admin/reports
// @access  Private (Admin)
export const getAdminReports = async (req, res, next) => {
  try {
    const { status, priority, targetType, search } = req.query;

    let reports = [];
    if (mongoose.connection.readyState === 1) {
      const query = {};
      if (status && status !== 'all') query.status = status;
      if (priority && priority !== 'all') query.priority = priority;
      if (targetType && targetType !== 'all') query.targetType = targetType;
      if (search) {
        query.$or = [
          { reportId: { $regex: search, $options: 'i' } },
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { reporterName: { $regex: search, $options: 'i' } },
        ];
      }
      reports = await Report.find(query)
        .populate('reportedBy', 'name email phone role')
        .populate('assignedReviewer', 'name email')
        .sort({ createdAt: -1 });
      const seenItems = await AdminSeenItem.find({ entityType: 'report' }).lean();
      const seenMap = new Map();
      for (const s of seenItems) seenMap.set(s.entityId, true);

      reports = reports.map((r) => {
        const item = r.toObject ? r.toObject() : { ...r };
        item.isSeenByAdmin = Boolean(item.isSeenByAdmin || isEntityDocSeen('report', item, seenMap));
        return item;
      });
    } else {
      const rawReports = await devStore.findReports({ status, priority, targetType, search });
      const dbSeen = (devStore.read()).adminSeenItems || [];
      reports = rawReports.map((r) => ({
        ...r,
        isSeenByAdmin: Boolean(r.isSeenByAdmin || isEntityDocSeen('report', r, dbSeen)),
      }));
    }

    return res.status(200).json({
      success: true,
      count: reports.length,
      data: { reports },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update report status or resolution
// @route   PUT /api/admin/reports/:id
// @access  Private (Admin)
export const updateAdminReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, priority, adminNotes, resolutionDetails, assignedReviewer } = req.body;

    let report = null;

    if (mongoose.connection.readyState === 1) {
      report = await Report.findById(id);
      if (!report) return res.status(404).json({ success: false, message: 'Report not found' });

      report.isSeenByAdmin = true;
      report.adminSeenAt = new Date();
      if (status) {
        report.status = status;
        if (status === 'RESOLVED' || status === 'CLOSED') {
          report.resolvedAt = new Date();
        }
        report.statusHistory.push({
          status,
          changedAt: new Date(),
          changedBy: req.user._id,
          note: adminNotes || `Status changed to ${status}`,
        });
      }
      if (priority) report.priority = priority;
      if (adminNotes !== undefined) report.adminNotes = adminNotes;
      if (resolutionDetails !== undefined) report.resolutionDetails = resolutionDetails;
      if (assignedReviewer !== undefined) report.assignedReviewer = assignedReviewer;
      report.isSeenByStudent = false;

      await report.save();

      if (report.reportedBy) {
        try {
          await Notification.create({
            user: report.reportedBy,
            title: `Report Update: ${report.reportId}`,
            message: `Your report has been updated to ${report.status}.`,
            type: 'info',
            link: '/student/reports',
            actionUrl: '/student/reports',
            relatedEntityType: 'report',
            relatedEntityId: report._id ? report._id.toString() : id,
          });
        } catch {}
      }
    } else {
      report = await devStore.findReportById(id);
      if (!report) return res.status(404).json({ success: false, message: 'Report not found' });

      const updates = {};
      if (status) {
        updates.status = status;
        if (status === 'RESOLVED' || status === 'CLOSED') updates.resolvedAt = new Date().toISOString();
        const history = Array.isArray(report.statusHistory) ? [...report.statusHistory] : [];
        history.push({
          status,
          changedAt: new Date().toISOString(),
          changedBy: req.user._id,
          note: adminNotes || `Status changed to ${status}`,
        });
        updates.statusHistory = history;
      }
      if (priority) updates.priority = priority;
      if (adminNotes !== undefined) updates.adminNotes = adminNotes;
      if (resolutionDetails !== undefined) updates.resolutionDetails = resolutionDetails;
      if (assignedReviewer !== undefined) updates.assignedReviewer = assignedReviewer;
      updates.isSeenByStudent = false;

      report = await devStore.updateReport(id, updates);
      if (report?.reportedBy) {
        try {
          await devStore.createNotification({
            userId: report.reportedBy,
            title: `Report Update: ${report.reportId}`,
            message: `Your report has been updated to ${report.status}.`,
            type: 'info',
            link: '/student/reports',
            actionUrl: '/student/reports',
            relatedEntityType: 'report',
            relatedEntityId: report._id ? report._id.toString() : id,
          });
        } catch {}
      }
    }

    await recordAuditLog({
      req,
      action: 'RESOLVED_REPORT',
      module: 'reports',
      targetType: 'Report',
      targetId: id,
      targetName: report.reportId || id,
      newValue: { status: report.status, resolutionDetails },
      reason: adminNotes || 'Admin updated complaint report',
    });

    return res.status(200).json({
      success: true,
      message: 'Report updated successfully.',
      data: { report },
    });
  } catch (error) {
    next(error);
  }
};

// ── 12. Support & Chatbot Handover Inbox ──────────────────────────────────────
// @desc    Get support chat conversations / live agent handover requests
// @route   GET /api/admin/support/conversations
// @access  Private (Admin)
export const getAdminSupportConversations = async (req, res, next) => {
  try {
    let sessions = [];

    if (mongoose.connection.readyState === 1) {
      const messages = await ChatMessage.find({}).populate('user', 'name email phone role').sort({ createdAt: 1 });
      const sessionMap = new Map();

      for (const msg of messages) {
        if (!sessionMap.has(msg.sessionId)) {
          sessionMap.set(msg.sessionId, {
            sessionId: msg.sessionId,
            user: msg.user,
            lastMessage: msg.text,
            lastSender: msg.sender,
            isLiveAgentRequest: msg.isLiveAgentRequest || false,
            status: msg.status || 'active',
            updatedAt: msg.createdAt,
            messageCount: 1,
          });
        } else {
          const item = sessionMap.get(msg.sessionId);
          item.messageCount += 1;
          if (msg.isLiveAgentRequest) item.isLiveAgentRequest = true;
          if (new Date(msg.createdAt) > new Date(item.updatedAt)) {
            item.lastMessage = msg.text;
            item.lastSender = msg.sender;
            item.updatedAt = msg.createdAt;
          }
        }
      }

      const seenItems = await AdminSeenItem.find({ entityType: 'support' }).lean();
      const seenMap = new Map();
      for (const s of seenItems) seenMap.set(s.entityId, true);

      sessions = Array.from(sessionMap.values())
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .map((s) => ({
          ...s,
          isSeenByAdmin: Boolean(seenMap.has(s.sessionId)),
        }));
    } else {
      const rawSessions = await devStore.findChatSessions();
      const dbSeen = (devStore.read()).adminSeenItems || [];
      sessions = rawSessions.map((s) => ({
        ...s,
        isSeenByAdmin: Boolean(dbSeen.some((item) => item.entityType === 'support' && item.entityId === s.sessionId)),
      }));
    }

    return res.status(200).json({
      success: true,
      count: sessions.length,
      data: { conversations: sessions },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get messages for a conversation session
// @route   GET /api/admin/support/conversations/:sessionId
// @access  Private (Admin)
export const getAdminSupportMessages = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    let messages = [];

    await markEntityAsSeenHelper('support', sessionId, req.user?._id);

    if (mongoose.connection.readyState === 1) {
      messages = await ChatMessage.find({ sessionId }).populate('user', 'name email').sort({ createdAt: 1 });
    } else {
      messages = await devStore.findChatMessagesBySession(sessionId);
    }

    return res.status(200).json({
      success: true,
      count: messages.length,
      data: { messages },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin reply to support session
// @route   POST /api/admin/support/conversations/:sessionId/reply
// @access  Private (Admin)
export const replyAdminSupportConversation = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const rawText = req.body.text || req.body.message;

    if (!rawText || !rawText.trim()) {
      return res.status(400).json({ success: false, message: 'Message text is required.' });
    }
    const text = rawText.trim();

    let saved = null;
    if (mongoose.connection.readyState === 1) {
      saved = await ChatMessage.create({
        sessionId,
        user: req.user._id,
        sender: 'agent',
        text: text.trim(),
        isLiveAgentRequest: false,
      });
    } else {
      saved = await devStore.addChatMessage({
        sessionId,
        user: req.user._id,
        sender: 'agent',
        text: text.trim(),
        isLiveAgentRequest: false,
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Support reply sent',
      data: { message: saved },
    });
  } catch (error) {
    next(error);
  }
};

// ── 13. Notifications Center ──────────────────────────────────────────────────
// @desc    Get administrative notifications
// @route   GET /api/admin/notifications
// @access  Private (Admin)
export const getAdminNotifications = async (req, res, next) => {
  try {
    let notifications = [];

    if (mongoose.connection.readyState === 1) {
      notifications = await Notification.find({
        $or: [{ user: req.user._id }, { user: { $exists: false } }],
      }).sort({ createdAt: -1 });
    } else {
      notifications = await devStore.findNotifications(req.user._id);
    }

    return res.status(200).json({
      success: true,
      count: notifications.length,
      data: { notifications },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Broadcast administrative notification to user, role, or all
// @route   POST /api/admin/notifications/broadcast
// @access  Private (Admin)
export const broadcastAdminNotification = async (req, res, next) => {
  try {
    const { title, message, targetRole = 'all', targetUserId = null, type = 'info', link = '' } = req.body;

    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Title and message are required.' });
    }

    let recipients = [];
    if (targetUserId) {
      recipients = [targetUserId];
    } else if (targetRole !== 'all') {
      if (mongoose.connection.readyState === 1) {
        const users = await User.find({ role: targetRole }).select('_id');
        recipients = users.map((u) => u._id);
      } else {
        const users = await devStore.findUsers({ role: targetRole });
        recipients = users.map((u) => u._id);
      }
    } else {
      // Platform wide
      if (mongoose.connection.readyState === 1) {
        const users = await User.find({}).select('_id');
        recipients = users.map((u) => u._id);
      } else {
        const users = await devStore.findUsers({});
        recipients = users.map((u) => u._id);
      }
    }

    const createdNotifications = [];
    if (mongoose.connection.readyState === 1) {
      for (const rId of recipients) {
        const notif = await Notification.create({
          user: rId,
          title,
          message,
          type,
          link: link || '/student/dashboard',
        });
        createdNotifications.push(notif);
      }
    } else {
      const db = devStore.read();
      if (!Array.isArray(db.notifications)) db.notifications = [];
      const nowStr = new Date().toISOString();
      for (const rId of recipients) {
        const notif = {
          _id: crypto.randomBytes(12).toString('hex'),
          user: rId,
          title,
          message,
          type,
          link: link || '/student/dashboard',
          read: false,
          createdAt: nowStr,
          updatedAt: nowStr,
        };
        db.notifications.push(notif);
        createdNotifications.push(notif);
      }
      devStore.write(db);
    }

    await recordAuditLog({
      req,
      action: 'BROADCAST_NOTIFICATION',
      module: 'notifications',
      targetType: 'Notification',
      targetId: 'BULK',
      targetName: title,
      newValue: { targetRole, recipientsCount: recipients.length },
    });

    return res.status(200).json({
      success: true,
      message: `Notification broadcast dispatched to ${recipients.length} recipients.`,
      count: recipients.length,
    });
  } catch (error) {
    next(error);
  }
};

// ── 14. AI Management & Engine Usage ──────────────────────────────────────────
// @desc    Get real AI engine usage metrics and service statuses
// @route   GET /api/admin/ai/usage
// @access  Private (Admin)
export const getAdminAIMetrics = async (req, res, next) => {
  try {
    let creditTransactions = [];
    if (mongoose.connection.readyState === 1) {
      creditTransactions = await CreditTransaction.find({ type: 'USAGE' });
    } else {
      const db = devStore.read();
      creditTransactions = (db.creditTransactions || []).filter((tx) => tx.type === 'USAGE');
    }

    const serviceCounts = {
      AI_SOP: { name: 'AI SOP Generator', requests: 0, credits: 0, status: 'Connected' },
      SOP_REWRITE: { name: 'SOP Re-writer & Polisher', requests: 0, credits: 0, status: 'Connected' },
      AI_LOR: { name: 'AI LOR Generator', requests: 0, credits: 0, status: 'Connected' },
      LOR_REWRITE: { name: 'LOR Re-writer & Polisher', requests: 0, credits: 0, status: 'Connected' },
      AI_RECOMMENDATION: { name: 'AI University Recommendations', requests: 0, credits: 0, status: 'Connected' },
      ADMISSION_PROBABILITY: { name: 'Admission Probability Engine', requests: 0, credits: 0, status: 'Connected' },
      AI_SCHOLARSHIP: { name: 'Scholarship Matcher AI', requests: 0, credits: 0, status: 'Connected' },
      DOCUMENT_REVIEW: { name: 'Document Analysis & Compliance', requests: 0, credits: 0, status: 'Connected' },
    };

    creditTransactions.forEach((tx) => {
      const key = tx.referenceType;
      if (serviceCounts[key]) {
        serviceCounts[key].requests += 1;
        serviceCounts[key].credits += Math.abs(tx.credits || 0);
      }
    });

    return res.status(200).json({
      success: true,
      data: {
        services: Object.values(serviceCounts),
        totalAiCreditsUsed: creditTransactions.reduce((acc, c) => acc + Math.abs(c.credits || 0), 0),
        totalAiInvocations: creditTransactions.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── 15. Audit Logs ────────────────────────────────────────────────────────────
// @desc    Get immutable admin audit log entries
// @route   GET /api/admin/audit-logs
// @access  Private (Admin)
export const getAdminAuditLogs = async (req, res, next) => {
  try {
    const { module, action, search } = req.query;

    let logs = [];
    if (mongoose.connection.readyState === 1) {
      const query = {};
      if (module && module !== 'all') query.module = module;
      if (action && action !== 'all') query.action = action;
      if (search) {
        query.$or = [
          { adminName: { $regex: search, $options: 'i' } },
          { adminEmail: { $regex: search, $options: 'i' } },
          { action: { $regex: search, $options: 'i' } },
          { targetName: { $regex: search, $options: 'i' } },
          { reason: { $regex: search, $options: 'i' } },
        ];
      }
      logs = await AuditLog.find(query).sort({ createdAt: -1 }).limit(100);
    } else {
      logs = await devStore.findAuditLogs({ module, action, search });
    }

    return res.status(200).json({
      success: true,
      count: logs.length,
      data: { logs },
    });
  } catch (error) {
    next(error);
  }
};

// ── 16. Platform Settings ─────────────────────────────────────────────────────
// @desc    Get dynamic platform settings
// @route   GET /api/admin/settings
// @access  Private (Admin)
export const getAdminPlatformSettings = async (req, res, next) => {
  try {
    const defaultSettings = await devStore.getPlatformSettings();
    let settings = { ...defaultSettings };
    if (mongoose.connection.readyState === 1) {
      const allSettings = await PlatformSetting.find({});
      allSettings.forEach((s) => {
        settings[s.category] = { ...(settings[s.category] || {}), [s.key]: s.value };
      });
    }

    return res.status(200).json({
      success: true,
      data: { settings },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update platform settings category
// @route   PUT /api/admin/settings
// @access  Private (Admin)
export const updateAdminPlatformSettings = async (req, res, next) => {
  try {
    let categoriesToUpdate = {};
    if (req.body.category && req.body.values) {
      categoriesToUpdate[req.body.category] = req.body.values;
    } else {
      for (const [cat, val] of Object.entries(req.body)) {
        if (val && typeof val === 'object' && !Array.isArray(val)) {
          categoriesToUpdate[cat] = val;
        }
      }
    }

    if (Object.keys(categoriesToUpdate).length === 0) {
      return res.status(400).json({ success: false, message: 'Settings values are required.' });
    }

    let updated = null;
    for (const [category, values] of Object.entries(categoriesToUpdate)) {
      if (mongoose.connection.readyState === 1) {
        for (const [key, val] of Object.entries(values)) {
          await PlatformSetting.findOneAndUpdate(
            { key, category },
            { key, category, value: val, updatedBy: req.user._id },
            { upsert: true, new: true }
          );
        }
      }
      updated = await devStore.updatePlatformSettingCategory(category, values, req.user._id);
    }

    await recordAuditLog({
      req,
      action: 'UPDATED_SETTINGS',
      module: 'settings',
      targetType: 'PlatformSetting',
      targetId: Object.keys(categoriesToUpdate).join(','),
      targetName: `Platform Settings (${Object.keys(categoriesToUpdate).join(', ')})`,
      newValue: categoriesToUpdate,
    });

    const defaultSettings = await devStore.getPlatformSettings();
    let finalSettings = { ...defaultSettings };
    if (mongoose.connection.readyState === 1) {
      const allSettings = await PlatformSetting.find({});
      allSettings.forEach((s) => {
        finalSettings[s.category] = { ...(finalSettings[s.category] || {}), [s.key]: s.value };
      });
    } else {
      finalSettings = updated || defaultSettings;
    }

    return res.status(200).json({
      success: true,
      message: 'Platform settings updated successfully.',
      data: { settings: finalSettings },
    });
  } catch (error) {
    next(error);
  }
};

// ── 17. Admin Accounts Management ─────────────────────────────────────────────
// @desc    Get all administrator users
// @route   GET /api/admin/admins
// @access  Private (Admin)
export const getAdminAccounts = async (req, res, next) => {
  try {
    let admins = [];
    if (mongoose.connection.readyState === 1) {
      admins = await User.find({ role: 'admin' }).select('-password -activationTokenHash').sort({ createdAt: -1 });
    } else {
      admins = await devStore.findAdmins();
    }

    return res.status(200).json({
      success: true,
      count: admins.length,
      data: { admins },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new administrator account
// @route   POST /api/admin/admins
// @access  Private (Admin)
export const createAdminAccount = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const phone = req.body.phone || '+8801700000000';
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    let admin = null;
    if (mongoose.connection.readyState === 1) {
      const exist = await User.findOne({ email: email.toLowerCase().trim() });
      if (exist) return res.status(409).json({ success: false, message: 'Email already exists.' });

      admin = await User.create({
        name,
        email: email.toLowerCase().trim(),
        password,
        phone,
        role: 'admin',
        status: 'active',
        accountStatus: 'ACTIVE',
        isActive: true,
        emailVerified: true,
      });
    } else {
      const exist = await devStore.findUserByEmail(email);
      if (exist) return res.status(409).json({ success: false, message: 'Email already exists.' });

      admin = await devStore.createUser({
        name,
        email: email.toLowerCase().trim(),
        password,
        phone,
        role: 'admin',
        status: 'active',
        accountStatus: 'ACTIVE',
        isActive: true,
        emailVerified: true,
      });
    }

    await recordAuditLog({
      req,
      action: 'CREATED_ADMIN',
      module: 'admins',
      targetType: 'User',
      targetId: admin._id,
      targetName: admin.name,
      reason: 'Platform admin created new administrator',
    });

    return res.status(201).json({
      success: true,
      message: 'Administrator account created successfully.',
      data: { admin },
    });
  } catch (error) {
    next(error);
  }
};

// ── 18. Payment Orders Handling (Existing Endpoints) ──────────────────────────
export const getAllPaymentOrders = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    let payments = [];

    if (mongoose.connection.readyState === 1) {
      const query = {};
      if (status && status !== 'all') query.status = status.toUpperCase();
      if (search) {
        query.$or = [
          { orderId: { $regex: search, $options: 'i' } },
          { transactionId: { $regex: search, $options: 'i' } },
        ];
      }
      const seenItems = await AdminSeenItem.find({ entityType: 'payment' }).lean();
      const seenMap = new Map();
      for (const s of seenItems) seenMap.set(s.entityId, true);

      payments = (await PaymentOrder.find(query)
        .populate('user', 'name email phone role')
        .populate('verifiedBy', 'name email')
        .sort({ createdAt: -1 })).map((p) => {
          const item = p.toObject ? p.toObject() : { ...p };
          item.isSeenByAdmin = Boolean(item.isSeenByAdmin || isEntityDocSeen('payment', item, seenMap));
          return item;
        });
    } else {
      const rawPayments = await devStore.findPaymentOrders({ status, search });
      const dbSeen = (devStore.read()).adminSeenItems || [];
      payments = rawPayments.map((p) => ({
        ...p,
        isSeenByAdmin: Boolean(p.isSeenByAdmin || isEntityDocSeen('payment', p, dbSeen)),
      }));
    }

    return res.status(200).json({
      success: true,
      count: payments.length,
      data: { payments },
    });
  } catch (error) {
    next(error);
  }
};

export const approvePaymentOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    let payment = null;
    let user = null;
    let ledgerTx = null;

    if (mongoose.connection.readyState === 1) {
      payment = await PaymentOrder.findById(id);
      if (!payment) return res.status(404).json({ success: false, message: 'Payment order not found' });

      if (payment.status === 'APPROVED') {
        return res.status(400).json({ success: false, message: 'This payment order has already been approved.' });
      }

      // Strict duplicate check
      const duplicateApproved = await PaymentOrder.findOne({
        transactionId: payment.transactionId,
        status: 'APPROVED',
        _id: { $ne: payment._id },
      });
      if (duplicateApproved) {
        return res.status(400).json({
          success: false,
          message: `Transaction ID ${payment.transactionId} already approved in order ${duplicateApproved.orderId}. Duplicate blocked.`,
        });
      }

      user = await User.findById(payment.user);
      if (!user) return res.status(404).json({ success: false, message: 'Associated student not found' });

      const breakdownBefore = getActiveCreditsBreakdown(user);
      const balanceBefore = breakdownBefore.availableCredits;

      user.paidCredits = (user.paidCredits ?? 0) + payment.credits;
      user.totalPurchasedCredits = (user.totalPurchasedCredits ?? 0) + payment.credits;
      user.freeCreditsForfeited = true;
      user.freeCredits = 0;
      user.walletCredits = user.paidCredits;
      await user.save();

      payment.status = 'APPROVED';
      payment.verifiedDate = new Date();
      payment.verifiedBy = req.user._id;
      await payment.save();

      const transactionId = `CTX-PUR-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
      ledgerTx = await CreditTransaction.create({
        transactionId,
        user: user._id,
        type: 'PURCHASE',
        credits: payment.credits,
        balanceBefore,
        balanceAfter: user.paidCredits,
        referenceType: 'PAYMENT',
        referenceId: payment.orderId,
        desc: `Credit Package Purchase: ${payment.packageName} (+${payment.credits} CR)`,
        status: 'COMPLETED',
      });

      await Notification.create({
        user: user._id,
        title: 'Payment Approved: Credits Deposited',
        message: `Your payment order ${payment.orderId} (৳${payment.finalAmount.toLocaleString('en-BD')}) has been approved! ${payment.credits} Paid Credits are now active in your wallet.`,
        type: 'success',
        link: '/student/wallet',
      });
    } else {
      payment = await devStore.findPaymentOrderById(id);
      if (!payment) return res.status(404).json({ success: false, message: 'Payment order not found' });

      if (payment.status === 'APPROVED') {
        return res.status(400).json({ success: false, message: 'This payment order has already been approved.' });
      }

      // Check duplicate
      const allPayments = await devStore.findPaymentOrders({});
      const dup = allPayments.find(
        (p) => p.transactionId === payment.transactionId && p.status === 'APPROVED' && p._id !== payment._id
      );
      if (dup) {
        return res.status(400).json({
          success: false,
          message: `Transaction ID ${payment.transactionId} already approved in order ${dup.orderId}. Duplicate blocked.`,
        });
      }

      const uid = payment.user?._id || payment.user;
      user = await devStore.findUserById(uid);
      if (!user) return res.status(404).json({ success: false, message: 'Associated student not found' });

      const balanceBefore = (user.paidCredits || 0) + (user.freeCredits || 0);
      const newPaidCredits = (user.paidCredits || 0) + payment.credits;

      await devStore.updateUser(uid, {
        paidCredits: newPaidCredits,
        totalPurchasedCredits: (user.totalPurchasedCredits || 0) + payment.credits,
        freeCreditsForfeited: true,
        freeCredits: 0,
        walletCredits: newPaidCredits,
      });

      payment = await devStore.updatePaymentOrder(id, {
        status: 'APPROVED',
        verifiedDate: new Date().toISOString(),
        verifiedBy: req.user._id,
      });

      const transactionId = `CTX-PUR-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
      ledgerTx = await devStore.createCreditTransaction({
        transactionId,
        user: uid,
        type: 'PURCHASE',
        credits: payment.credits,
        balanceBefore,
        balanceAfter: newPaidCredits,
        referenceType: 'PAYMENT',
        referenceId: payment.orderId,
        desc: `Credit Package Purchase: ${payment.packageName} (+${payment.credits} CR)`,
        status: 'COMPLETED',
      });

      await devStore.createNotification({
        user: uid,
        title: 'Payment Approved: Credits Deposited',
        message: `Your payment order ${payment.orderId} (৳${payment.finalAmount.toLocaleString('en-BD')}) has been approved! ${payment.credits} Paid Credits are now active in your wallet.`,
        type: 'success',
        link: '/student/wallet',
      });
    }

    await recordAuditLog({
      req,
      action: 'APPROVED_PAYMENT',
      module: 'payments',
      targetType: 'PaymentOrder',
      targetId: id,
      targetName: payment.orderId,
      newValue: { status: 'APPROVED', credits: payment.credits, finalAmount: payment.finalAmount },
    });

    return res.status(200).json({
      success: true,
      message: `Payment order ${payment.orderId} approved successfully. ${payment.credits} credits added to student.`,
      data: {
        payment,
        ledgerTx,
        newBalance: user.paidCredits,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const rejectPaymentOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason = 'Transaction ID or screenshot could not be verified.' } = req.body;

    let payment = null;

    if (mongoose.connection.readyState === 1) {
      payment = await PaymentOrder.findById(id);
      if (!payment) return res.status(404).json({ success: false, message: 'Payment order not found' });
      if (payment.status === 'APPROVED') {
        return res.status(400).json({ success: false, message: 'Cannot reject an already approved payment.' });
      }

      payment.status = 'REJECTED';
      payment.rejectionReason = reason;
      payment.verifiedDate = new Date();
      payment.verifiedBy = req.user._id;
      await payment.save();

      await Notification.create({
        user: payment.user,
        title: 'Payment Verification Unsuccessful',
        message: `Your payment order ${payment.orderId} was rejected. Reason: ${reason}.`,
        type: 'alert',
        link: '/student/wallet',
      });
    } else {
      payment = await devStore.findPaymentOrderById(id);
      if (!payment) return res.status(404).json({ success: false, message: 'Payment order not found' });
      if (payment.status === 'APPROVED') {
        return res.status(400).json({ success: false, message: 'Cannot reject an already approved payment.' });
      }

      payment = await devStore.updatePaymentOrder(id, {
        status: 'REJECTED',
        rejectionReason: reason,
        verifiedDate: new Date().toISOString(),
        verifiedBy: req.user._id,
      });

      const uid = payment.user?._id || payment.user;
      await devStore.createNotification({
        user: uid,
        title: 'Payment Verification Unsuccessful',
        message: `Your payment order ${payment.orderId} was rejected. Reason: ${reason}.`,
        type: 'alert',
        link: '/student/wallet',
      });
    }

    await recordAuditLog({
      req,
      action: 'REJECTED_PAYMENT',
      module: 'payments',
      targetType: 'PaymentOrder',
      targetId: id,
      targetName: payment.orderId,
      newValue: { status: 'REJECTED' },
      reason,
    });

    return res.status(200).json({
      success: true,
      message: `Payment order ${payment.orderId} marked as REJECTED.`,
      data: { payment },
    });
  } catch (error) {
    next(error);
  }
};

// ── Agency Service Orders ───────────────────────────────────────────────────
export const getAllAgencyOrders = async (req, res, next) => {
  try {
    let orders = [];
    if (mongoose.connection.readyState === 1) {
      orders = await AgencyServiceOrder.find({})
        .populate('user', 'name email phone gpa ielts targetCountry')
        .sort({ createdAt: -1 });
    }
    return res.status(200).json({
      success: true,
      count: orders.length,
      data: { orders },
    });
  } catch (error) {
    next(error);
  }
};

export const assignAgencyToOrder = async (req, res, next) => {
  try {
    const { agencyId, agencyName, agentName, agentRole = 'Senior Counselor' } = req.body;
    let order = null;

    if (mongoose.connection.readyState === 1) {
      order = await AgencyServiceOrder.findById(req.params.id);
      if (!order) return res.status(404).json({ success: false, message: 'Agency order not found' });

      order.assignedAgency = {
        agencyId,
        agencyName,
        agentName,
        agentRole,
        assignedAt: new Date(),
      };
      order.status = 'IN_PROGRESS';
      await order.save();
    }

    return res.status(200).json({
      success: true,
      message: `Assigned ${agencyName} to order ${order?.orderId}`,
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};

// ── Agency Verification Admin Review ──────────────────────────────────────────
export const getAllAgencyVerifications = async (req, res, next) => {
  try {
    const { status, search } = req.query;

    if (mongoose.connection.readyState === 1) {
      // 1. Auto-synchronize: Ensure every user with role 'agency' has a canonical AgencyProfile
      const agencyUsers = await User.find({ role: 'agency' });
      for (const u of agencyUsers) {
        let profile = await AgencyProfile.findOne({
          $or: [{ user: u._id }, { officialBusinessEmail: u.email }],
        });

        if (!profile) {
          const randomSuffix = Math.floor(1000 + Math.random() * 9000);
          const timeCode = Date.now().toString(36).toUpperCase().slice(-4);
          const applicationId = u.applicationId || `ADM-AGY-2026-${timeCode}${randomSuffix}`;
          profile = await AgencyProfile.create({
            user: u._id,
            agencyName: u.name || 'Agency ' + (u.email || '').split('@')[0],
            officialBusinessEmail: u.email,
            applicationId,
            verificationStatus: (u.agencyVerificationStatus || (u.accountStatus === 'APPROVED' ? 'VERIFIED' : 'PENDING')).toUpperCase(),
            isDraft: true,
            authorizedPerson: {
              fullName: u.name || '',
              phone: u.phone || '',
              email: u.email || '',
              designation: 'Managing Director',
            },
            createdAt: u.createdAt || new Date(),
          });
          u.agencyProfile = profile._id;
          await u.save();
        } else {
          let dirty = false;
          if (!profile.user || profile.user.toString() !== u._id.toString()) {
            profile.user = u._id;
            dirty = true;
          }
          if (!profile.officialBusinessEmail && u.email) {
            profile.officialBusinessEmail = u.email;
            dirty = true;
          }
          if (dirty) {
            await profile.save();
          }
          if (!u.agencyProfile || u.agencyProfile.toString() !== profile._id.toString()) {
            u.agencyProfile = profile._id;
            await u.save();
          }
        }
      }

      // 2. Build Query
      const query = {};
      if (status && status !== 'all') {
        const st = status.toUpperCase();
        if (st === 'VERIFIED' || st === 'APPROVED') {
          query.verificationStatus = { $in: ['VERIFIED', 'APPROVED'] };
        } else {
          query.verificationStatus = st;
        }
      }

      if (search && search.trim()) {
        const s = search.trim();
        const regex = new RegExp(s, 'i');
        const matchedUsers = await User.find({
          role: 'agency',
          $or: [{ name: regex }, { email: regex }, { phone: regex }],
        }).select('_id');
        const matchedUserIds = matchedUsers.map((mu) => mu._id);

        query.$or = [
          { agencyName: regex },
          { legalName: regex },
          { officialBusinessEmail: regex },
          { applicationId: regex },
          { 'authorizedPerson.fullName': regex },
          { 'authorizedPerson.email': regex },
          { 'authorizedPerson.phone': regex },
          { user: { $in: matchedUserIds } },
        ];
      }

      const verifications = await AgencyProfile.find(query)
        .populate('user', 'name email phone role status accountStatus agencyVerificationStatus createdAt')
        .populate('reviewedBy', 'name email')
        .sort({ createdAt: -1 });

      const seenItems = await AdminSeenItem.find({ entityType: 'agency' }).lean();
      const seenMap = new Map();
      for (const s of seenItems) seenMap.set(s.entityId, true);

      const formatted = verifications.map((v) => {
        const item = v.toObject ? v.toObject() : { ...v };
        item.isSeenByAdmin = Boolean(item.isSeenByAdmin || isEntityDocSeen('agency', item, seenMap));
        return item;
      });

      return res.status(200).json({
        success: true,
        count: formatted.length,
        data: { verifications: formatted },
        verifications: formatted,
      });
    } else {
      const verifications = await devStore.findAgencyProfiles({ verificationStatus: status, search });
      const dbSeen = (devStore.read()).adminSeenItems || [];
      const formatted = verifications.map((v) => ({
        ...v,
        isSeenByAdmin: Boolean(v.isSeenByAdmin || isEntityDocSeen('agency', v, dbSeen)),
      }));
      return res.status(200).json({
        success: true,
        count: formatted.length,
        data: { verifications: formatted },
        verifications: formatted,
      });
    }
  } catch (error) {
    next(error);
  }
};

export const getAgencyVerificationDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    let verification = null;

    if (mongoose.connection.readyState === 1) {
      if (mongoose.Types.ObjectId.isValid(id)) {
        verification = await AgencyProfile.findById(id)
          .populate('user', 'name email phone role status accountStatus agencyVerificationStatus createdAt')
          .populate('reviewedBy', 'name email');

        if (!verification) {
          verification = await AgencyProfile.findOne({ user: id })
            .populate('user', 'name email phone role status accountStatus agencyVerificationStatus createdAt')
            .populate('reviewedBy', 'name email');
        }
      }

      if (!verification) {
        verification = await AgencyProfile.findOne({ applicationId: id })
          .populate('user', 'name email phone role status accountStatus agencyVerificationStatus createdAt')
          .populate('reviewedBy', 'name email');
      }

      if (!verification && mongoose.Types.ObjectId.isValid(id)) {
        const agencyUser = await User.findById(id);
        if (agencyUser && agencyUser.role === 'agency') {
          const randomSuffix = Math.floor(1000 + Math.random() * 9000);
          const timeCode = Date.now().toString(36).toUpperCase().slice(-4);
          const applicationId = agencyUser.applicationId || `ADM-AGY-2026-${timeCode}${randomSuffix}`;
          verification = await AgencyProfile.create({
            user: agencyUser._id,
            agencyName: agencyUser.name || 'Agency ' + (agencyUser.email || '').split('@')[0],
            officialBusinessEmail: agencyUser.email,
            applicationId,
            verificationStatus: agencyUser.agencyVerificationStatus || 'PENDING',
            isDraft: true,
            authorizedPerson: {
              fullName: agencyUser.name || '',
              phone: agencyUser.phone || '',
              email: agencyUser.email || '',
              designation: 'Managing Director',
            },
            createdAt: agencyUser.createdAt || new Date(),
          });
          agencyUser.agencyProfile = verification._id;
          await agencyUser.save();
          verification = await AgencyProfile.findById(verification._id)
            .populate('user', 'name email phone role status accountStatus agencyVerificationStatus createdAt')
            .populate('reviewedBy', 'name email');
        }
      }
    } else {
      verification = await devStore.findAgencyProfileById(id);
      if (!verification) {
        verification = await devStore.findAgencyProfileByUserId(id);
      }
      if (!verification) {
        verification = await devStore.findAgencyProfileByApplicationId(id);
      }
    }

    if (!verification) {
      return res.status(404).json({ success: false, message: 'Agency verification profile not found' });
    }

    const agencyIdToMark = verification._id ? verification._id.toString() : id;
    await markEntityAsSeenHelper('agency', agencyIdToMark, req.user?._id);
    if (verification.applicationId) {
      await markEntityAsSeenHelper('agency', verification.applicationId, req.user?._id);
    }
    if (verification.toObject) verification = verification.toObject();
    verification.isSeenByAdmin = true;

    return res.status(200).json({
      success: true,
      data: { verification },
      verification,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAgencyVerificationStatus = async (req, res, next) => {
  try {
    const rawStatus = (req.body.status || '').toUpperCase();
    const { rejectionReason = '', adminNotes = '' } = req.body;
    const allowedStatuses = ['PENDING', 'UNDER_REVIEW', 'VERIFIED', 'APPROVED', 'REJECTED', 'SUSPENDED'];

    if (!allowedStatuses.includes(rawStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}`,
      });
    }

    const canonicalStatus = rawStatus === 'APPROVED' ? 'VERIFIED' : rawStatus;

    if (canonicalStatus === 'REJECTED' && !rejectionReason.trim()) {
      return res.status(400).json({
        success: false,
        message: 'A rejection reason is required when rejecting an agency verification application.',
      });
    }

    const now = new Date();
    let rawActivationToken = null;
    let emailResult = null;

    if (mongoose.connection.readyState === 1) {
      let verification = null;
      if (mongoose.Types.ObjectId.isValid(req.params.id)) {
        verification = await AgencyProfile.findById(req.params.id);
        if (!verification) {
          verification = await AgencyProfile.findOne({ user: req.params.id });
        }
      }
      if (!verification) {
        verification = await AgencyProfile.findOne({ applicationId: req.params.id });
      }

      if (!verification) {
        return res.status(404).json({ success: false, message: 'Agency verification profile not found' });
      }

      const agencyUser = await User.findById(verification.user);
      if (!agencyUser) {
        return res.status(404).json({ success: false, message: 'Associated agency user account not found' });
      }

      const prevStatus = verification.verificationStatus;
      verification.verificationStatus = canonicalStatus;
      verification.reviewedAt = now;
      verification.reviewedBy = req.user._id;
      if (adminNotes) verification.adminNotes = adminNotes;
      if (!Array.isArray(verification.statusHistory)) verification.statusHistory = [];

      let userUpdates = { agencyVerificationStatus: canonicalStatus };

      if (canonicalStatus === 'VERIFIED') {
        verification.rejectionReason = '';
        verification.statusHistory.push({
          status: 'VERIFIED',
          changedAt: now,
          changedBy: req.user._id,
          note: adminNotes || 'Agency application approved by Administrator.',
        });

        userUpdates = {
          ...userUpdates,
          role: 'agency',
          accountStatus: 'ACTIVE',
          status: 'active',
          isActive: true,
          emailVerified: true,
          agencyVerificationStatus: 'VERIFIED',
          agencyProfile: verification._id,
          agencyId: agencyUser._id,
          activationTokenHash: null,
          activationTokenExpires: null,
          activationTokenUsed: true,
          activatedAt: now,
          approvedAt: now,
          approvedBy: req.user._id,
        };

        if (!verification.user || verification.user.toString() !== agencyUser._id.toString()) {
          verification.user = agencyUser._id;
        }

        emailResult = await emailService.sendAgencyApprovalEmail({
          to: verification.officialBusinessEmail || agencyUser.email,
          agencyName: verification.agencyName,
          applicationId: verification.applicationId || 'ADM-AGY-2026',
        });
      } else if (canonicalStatus === 'REJECTED') {
        verification.rejectionReason = rejectionReason.trim();
        verification.statusHistory.push({
          status: 'REJECTED',
          changedAt: now,
          changedBy: req.user._id,
          note: `Rejected: ${rejectionReason.trim()}`,
        });

        userUpdates = {
          ...userUpdates,
          accountStatus: 'REJECTED',
          status: 'pending',
          isActive: false,
        };
      } else if (canonicalStatus === 'UNDER_REVIEW') {
        verification.statusHistory.push({
          status: 'UNDER_REVIEW',
          changedAt: now,
          changedBy: req.user._id,
          note: adminNotes || 'Agency under review by Administrator.',
        });
        userUpdates = { ...userUpdates, accountStatus: 'UNDER_REVIEW' };
      } else if (canonicalStatus === 'PENDING') {
        userUpdates = { ...userUpdates, accountStatus: 'PENDING' };
      } else if (canonicalStatus === 'SUSPENDED') {
        userUpdates = { ...userUpdates, accountStatus: 'SUSPENDED', status: 'suspended' };
      }

      await verification.save();
      Object.assign(agencyUser, userUpdates);
      await agencyUser.save();

      await recordAuditLog({
        req,
        action: canonicalStatus === 'VERIFIED' ? 'APPROVED_AGENCY' : canonicalStatus === 'REJECTED' ? 'REJECTED_AGENCY' : 'UPDATED_AGENCY_STATUS',
        module: 'agencies',
        targetType: 'AgencyProfile',
        targetId: verification._id,
        targetName: verification.agencyName,
        previousValue: { verificationStatus: prevStatus },
        newValue: { verificationStatus: canonicalStatus, rejectionReason, adminNotes },
        reason: rejectionReason || adminNotes || `Status updated from ${prevStatus} to ${canonicalStatus}`,
      });

      return res.status(200).json({
        success: true,
        message: `Agency verification status updated to ${canonicalStatus}.${canonicalStatus === 'VERIFIED' ? ' Approval notification email dispatched.' : ''}`,
        data: {
          verification,
          emailDispatched: emailResult?.delivered || false,
        },
        verification,
      });
    } else {
      let verification = await devStore.findAgencyProfileById(req.params.id);
      if (!verification) {
        verification = await devStore.findAgencyProfileByUserId(req.params.id);
      }
      if (!verification) {
        verification = await devStore.findAgencyProfileByApplicationId(req.params.id);
      }

      if (!verification) {
        return res.status(404).json({ success: false, message: 'Agency verification profile not found' });
      }

      const userId = verification.user?._id || verification.user;
      const agencyUser = await devStore.findUserById(userId);
      if (!agencyUser) {
        return res.status(404).json({ success: false, message: 'Associated agency user account not found' });
      }

      let userUpdates = { agencyVerificationStatus: canonicalStatus };
      let history = Array.isArray(verification.statusHistory) ? [...verification.statusHistory] : [];

      if (canonicalStatus === 'VERIFIED') {
        userUpdates = {
          ...userUpdates,
          role: 'agency',
          accountStatus: 'ACTIVE',
          status: 'active',
          isActive: true,
          emailVerified: true,
          agencyVerificationStatus: 'VERIFIED',
          agencyProfile: verification._id?.toString(),
          agencyId: userId?.toString(),
          activationTokenHash: null,
          activationTokenExpires: null,
          activationTokenUsed: true,
          activatedAt: now.toISOString(),
          approvedAt: now.toISOString(),
          approvedBy: req.user._id,
        };

        if (verification.user?.toString() !== userId?.toString()) {
          verification.user = userId?.toString();
        }

        history.push({
          status: 'VERIFIED',
          changedAt: now.toISOString(),
          changedBy: req.user._id,
          note: adminNotes || 'Agency application approved by Administrator.',
        });

        emailResult = await emailService.sendAgencyApprovalEmail({
          to: verification.officialBusinessEmail || agencyUser.email,
          agencyName: verification.agencyName,
          applicationId: verification.applicationId || 'ADM-AGY-2026',
        });
      } else if (canonicalStatus === 'REJECTED') {
        userUpdates = {
          ...userUpdates,
          accountStatus: 'REJECTED',
          status: 'pending',
          isActive: false,
        };

        history.push({
          status: 'REJECTED',
          changedAt: now.toISOString(),
          changedBy: req.user._id,
          note: `Rejected: ${rejectionReason.trim()}`,
        });
      } else if (canonicalStatus === 'UNDER_REVIEW') {
        userUpdates = { ...userUpdates, accountStatus: 'UNDER_REVIEW' };
      } else if (canonicalStatus === 'PENDING') {
        userUpdates = { ...userUpdates, accountStatus: 'PENDING' };
      } else if (canonicalStatus === 'SUSPENDED') {
        userUpdates = { ...userUpdates, accountStatus: 'SUSPENDED', status: 'suspended' };
      }

      verification = await devStore.saveAgencyProfile({
        ...verification,
        verificationStatus: canonicalStatus,
        reviewedAt: now.toISOString(),
        reviewedBy: req.user._id,
        adminNotes: adminNotes || verification.adminNotes || '',
        rejectionReason: canonicalStatus === 'REJECTED' ? rejectionReason.trim() : '',
        statusHistory: history,
      });

      await devStore.updateUser(userId, userUpdates);

      await recordAuditLog({
        req,
        action: canonicalStatus === 'VERIFIED' ? 'APPROVED_AGENCY' : canonicalStatus === 'REJECTED' ? 'REJECTED_AGENCY' : 'UPDATED_AGENCY',
        module: 'agencies',
        targetType: 'AgencyProfile',
        targetId: verification._id,
        targetName: verification.agencyName,
        newValue: { status: canonicalStatus },
        reason: rejectionReason || adminNotes,
      });

      return res.status(200).json({
        success: true,
        message: `Agency verification status updated to ${canonicalStatus}.${canonicalStatus === 'VERIFIED' ? ' Approval notification email dispatched.' : ''}`,
        data: {
          verification,
          emailDispatched: emailResult?.delivered || false,
        },
        verification,
      });
    }
  } catch (error) {
    next(error);
  }
};

// ── Accredited Agents Management & Directory ──────────────────────────────────
export const getAdminAgents = async (req, res, next) => {
  try {
    const { status, search = '', agencyId } = req.query;

    if (mongoose.connection.readyState === 1) {
      // 1. Auto-reconcile Agent users with AgentApplication and Agency User
      const agentUsers = await User.find({ role: 'agent' });
      for (const ag of agentUsers) {
        let app = null;
        if (ag.agentApplicationId) {
          app = await AgentApplication.findOne({ applicationId: ag.agentApplicationId });
        }
        if (!app) {
          app = await AgentApplication.findOne({ $or: [{ email: ag.email }, { agentUser: ag._id }] });
        }
        if (!app) {
          let targetAgencyId = ag.agencyId;
          let agencyName = 'Partner Agency';
          if (!targetAgencyId) {
            const defaultAgency = await User.findOne({ role: 'agency' });
            if (defaultAgency) {
              targetAgencyId = defaultAgency._id;
              agencyName = defaultAgency.name || 'Partner Agency';
            }
          } else {
            const agUser = await User.findById(targetAgencyId);
            if (agUser) agencyName = agUser.name;
          }

          const randomSuffix = Math.floor(1000 + Math.random() * 9000);
          const timeCode = Date.now().toString(36).toUpperCase().slice(-4);
          const applicationId = `ADM-AGT-2026-${timeCode}${randomSuffix}`;

          if (targetAgencyId) {
            app = await AgentApplication.create({
              applicationId,
              agency: targetAgencyId,
              agencyName,
              agentName: ag.name,
              email: ag.email,
              phone: ag.phone || '+8801700000000',
              designation: ag.designation || 'Educational Counselor',
              status: 'REGISTERED',
              activationCodeStatus: 'USED',
              agentUser: ag._id,
              registeredAt: ag.createdAt || new Date(),
            });
            ag.agencyId = targetAgencyId;
            ag.agentApplicationId = applicationId;
            await ag.save();
          }
        } else {
          let needsSave = false;
          if (!ag.agencyId && app.agency) {
            ag.agencyId = app.agency;
            needsSave = true;
          }
          if (!ag.agentApplicationId && app.applicationId) {
            ag.agentApplicationId = app.applicationId;
            needsSave = true;
          }
          if (!app.agentUser) {
            app.agentUser = ag._id;
            await app.save();
          }
          if (needsSave) await ag.save();
        }
      }

      // 2. Build Query
      const query = { role: 'agent' };
      if (status && status !== 'all') {
        const st = status.toUpperCase();
        query.accountStatus = st;
      }
      if (agencyId) {
        query.agencyId = agencyId;
      }

      if (search && search.trim()) {
        const s = search.trim();
        const regex = new RegExp(s, 'i');
        const matchedAgencies = await User.find({
          role: 'agency',
          $or: [{ name: regex }, { email: regex }],
        }).select('_id');
        const matchedAgencyIds = matchedAgencies.map((m) => m._id);

        query.$or = [
          { name: regex },
          { email: regex },
          { phone: regex },
          { agentApplicationId: regex },
          { designation: regex },
          { agencyId: { $in: matchedAgencyIds } },
        ];
      }

      const rawAgents = await User.find(query)
        .select('-password -activationTokenHash')
        .populate('agencyId', 'name email phone applicationId')
        .sort({ createdAt: -1 });

      const agents = await Promise.all(
        rawAgents.map(async (doc) => {
          const a = doc.toObject ? doc.toObject() : { ...doc };
          let app = null;
          if (a.agentApplicationId) {
            app = await AgentApplication.findOne({ applicationId: a.agentApplicationId })
              .populate('agency', 'name email phone applicationId')
              .lean();
          }
          if (!app) {
            app = await AgentApplication.findOne({ $or: [{ email: a.email }, { agentUser: a._id }] })
              .populate('agency', 'name email phone applicationId')
              .lean();
          }
          a.agentApplication = app;
          if (app && app.agencyName && !a.agencyId?.name) {
            a.agencyName = app.agencyName;
          } else if (a.agencyId?.name) {
            a.agencyName = a.agencyId.name;
          }
          a.walletCredits = 'N/A';
          a.availableCredits = 'N/A';
          return a;
        })
      );

      const seenItems = await AdminSeenItem.find({ entityType: 'agent_user' }).lean();
      const seenMap = new Map();
      for (const s of seenItems) seenMap.set(s.entityId, true);

      agents.forEach((ag) => {
        ag.isSeenByAdmin = Boolean(ag.isSeenByAdmin || isEntityDocSeen('agent_user', ag, seenMap));
      });

      return res.status(200).json({
        success: true,
        count: agents.length,
        data: { agents, applications: [] },
        agents,
      });
    } else {
      const rawAgents = await devStore.findAgents({ status, search, agencyId });
      const dbSeen = (devStore.read()).adminSeenItems || [];
      const agents = rawAgents.map((ag) => ({
        ...ag,
        isSeenByAdmin: Boolean(ag.isSeenByAdmin || isEntityDocSeen('agent_user', ag, dbSeen)),
      }));
      return res.status(200).json({
        success: true,
        count: agents.length,
        data: { agents, applications: [] },
        agents,
      });
    }
  } catch (error) {
    next(error);
  }
};

// ── Agent Applications Admin Review ───────────────────────────────────────────
export const getAdminAgentApplications = async (req, res, next) => {
  try {
    const { status, agencyId, search = '' } = req.query;

    if (mongoose.connection.readyState === 1) {
      // Auto-reconcile agent users so their application records exist
      const agentUsers = await User.find({ role: 'agent' });
      for (const ag of agentUsers) {
        let app = null;
        if (ag.agentApplicationId) {
          app = await AgentApplication.findOne({ applicationId: ag.agentApplicationId });
        }
        if (!app) {
          app = await AgentApplication.findOne({ $or: [{ email: ag.email }, { agentUser: ag._id }] });
        }
        if (!app) {
          let targetAgencyId = ag.agencyId;
          let agencyName = 'Partner Agency';
          if (!targetAgencyId) {
            const defaultAgency = await User.findOne({ role: 'agency' });
            if (defaultAgency) {
              targetAgencyId = defaultAgency._id;
              agencyName = defaultAgency.name || 'Partner Agency';
            }
          } else {
            const agUser = await User.findById(targetAgencyId);
            if (agUser) agencyName = agUser.name;
          }

          const randomSuffix = Math.floor(1000 + Math.random() * 9000);
          const timeCode = Date.now().toString(36).toUpperCase().slice(-4);
          const applicationId = ag.agentApplicationId || `ADM-AGT-2026-${timeCode}${randomSuffix}`;

          if (targetAgencyId) {
            app = await AgentApplication.create({
              applicationId,
              agency: targetAgencyId,
              agencyName,
              agentName: ag.name,
              email: ag.email,
              phone: ag.phone || '+8801700000000',
              designation: ag.designation || 'Educational Counselor',
              status: 'REGISTERED',
              activationCodeStatus: 'USED',
              agentUser: ag._id,
              registeredAt: ag.createdAt || new Date(),
            });
            ag.agencyId = targetAgencyId;
            ag.agentApplicationId = applicationId;
            await ag.save();
          }
        }
      }

      const filter = {};
      if (status && status !== 'all') filter.status = status.toUpperCase();
      if (agencyId) filter.agency = agencyId;

      let applications = await AgentApplication.find(filter)
        .populate('agency', 'name email phone applicationId')
        .sort({ createdAt: -1 });

      if (search && search.trim()) {
        const s = search.toLowerCase().trim();
        applications = applications.filter(
          (a) =>
            a.applicationId?.toLowerCase().includes(s) ||
            a.agentName?.toLowerCase().includes(s) ||
            a.email?.toLowerCase().includes(s) ||
            a.phone?.toLowerCase().includes(s) ||
            a.agencyName?.toLowerCase().includes(s)
        );
      }

      const seenItems = await AdminSeenItem.find({ entityType: 'agent' }).lean();
      const seenMap = new Map();
      for (const s of seenItems) seenMap.set(s.entityId, true);

      applications = applications.map((a) => {
        const item = a.toObject ? a.toObject() : { ...a };
        item.isSeenByAdmin = Boolean(item.isSeenByAdmin || isEntityDocSeen('agent', item, seenMap));
        return item;
      });

      return res.status(200).json({
        success: true,
        count: applications.length,
        data: { applications },
        applications,
      });
    } else {
      let rawApps = await devStore.findAgentApplications({ status, agencyId, search });
      const dbSeen = (devStore.read()).adminSeenItems || [];
      const applications = rawApps.map((a) => ({
        ...a,
        isSeenByAdmin: Boolean(a.isSeenByAdmin || isEntityDocSeen('agent', a, dbSeen)),
      }));
      return res.status(200).json({
        success: true,
        count: applications.length,
        data: { applications },
        applications,
      });
    }
  } catch (error) {
    next(error);
  }
};

export const getAdminAgentApplicationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let application = null;

    if (mongoose.connection.readyState === 1) {
      if (mongoose.Types.ObjectId.isValid(id)) {
        application = await AgentApplication.findById(id).populate('agency', 'name email phone applicationId');
      }
      if (!application) {
        application = await AgentApplication.findOne({ applicationId: id.toUpperCase() }).populate('agency', 'name email phone applicationId');
      }
    } else {
      application = await devStore.findAgentApplicationById(id);
    }

    if (!application) {
      return res.status(404).json({ success: false, message: 'Agent application not found' });
    }

    const agentIdToMark = application._id ? application._id.toString() : id;
    await markEntityAsSeenHelper('agent', agentIdToMark, req.user?._id);
    if (application.applicationId) {
      await markEntityAsSeenHelper('agent', application.applicationId, req.user?._id);
    }
    if (application.toObject) application = application.toObject();
    application.isSeenByAdmin = true;

    return res.status(200).json({
      success: true,
      data: { application },
    });
  } catch (error) {
    next(error);
  }
};

export const approveAgentApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
    const activationCode = `ADM-AGT-${randomHex}`;

    let updated = null;

    if (mongoose.connection.readyState === 1) {
      let application = null;
      if (mongoose.Types.ObjectId.isValid(id)) application = await AgentApplication.findById(id);
      if (!application) application = await AgentApplication.findOne({ applicationId: id.toUpperCase() });

      if (!application) return res.status(404).json({ success: false, message: 'Agent application not found' });

      application.status = 'APPROVED';
      application.activationCode = activationCode;
      application.activationCodeStatus = 'ISSUED';
      application.activationCodeExpires = expiresAt;
      application.reviewedAt = now;
      application.reviewedBy = req.user._id;
      application.rejectionReason = '';

      if (!Array.isArray(application.statusHistory)) application.statusHistory = [];
      application.statusHistory.push({
        status: 'APPROVED',
        changedAt: now,
        changedBy: req.user._id,
        note: `Approved by Admin. Activation code generated (${activationCode}).`,
      });

      await application.save();
      updated = application;
    } else {
      let application = await devStore.findAgentApplicationById(id);
      if (!application) return res.status(404).json({ success: false, message: 'Agent application not found' });

      const history = Array.isArray(application.statusHistory) ? [...application.statusHistory] : [];
      history.push({
        status: 'APPROVED',
        changedAt: now.toISOString(),
        changedBy: req.user._id,
        note: `Approved by Admin. Activation code generated (${activationCode}).`,
      });

      updated = await devStore.updateAgentApplication(application._id, {
        status: 'APPROVED',
        activationCode,
        activationCodeStatus: 'ISSUED',
        activationCodeExpires: expiresAt.toISOString(),
        reviewedAt: now.toISOString(),
        reviewedBy: req.user._id,
        rejectionReason: '',
        statusHistory: history,
      });
    }

    await recordAuditLog({
      req,
      action: 'APPROVED_AGENT',
      module: 'agents',
      targetType: 'AgentApplication',
      targetId: id,
      targetName: updated.agentName,
      newValue: { activationCode, status: 'APPROVED' },
    });

    return res.status(200).json({
      success: true,
      message: `Agent application approved! Activation code: ${activationCode}`,
      data: {
        application: updated,
        activationCode,
        activationCodeExpires: expiresAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const rejectAgentApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    if (!rejectionReason || !rejectionReason.trim()) {
      return res.status(400).json({ success: false, message: 'Rejection reason is required' });
    }

    const now = new Date();
    let updated = null;

    if (mongoose.connection.readyState === 1) {
      let application = null;
      if (mongoose.Types.ObjectId.isValid(id)) application = await AgentApplication.findById(id);
      if (!application) application = await AgentApplication.findOne({ applicationId: id.toUpperCase() });

      if (!application) return res.status(404).json({ success: false, message: 'Agent application not found' });

      application.status = 'REJECTED';
      application.rejectionReason = rejectionReason.trim();
      application.reviewedAt = now;
      application.reviewedBy = req.user._id;
      application.activationCodeStatus = 'REVOKED';

      if (!Array.isArray(application.statusHistory)) application.statusHistory = [];
      application.statusHistory.push({
        status: 'REJECTED',
        changedAt: now,
        changedBy: req.user._id,
        note: `Rejected by Admin: ${rejectionReason.trim()}`,
      });

      await application.save();
      updated = application;
    } else {
      let application = await devStore.findAgentApplicationById(id);
      if (!application) return res.status(404).json({ success: false, message: 'Agent application not found' });

      const history = Array.isArray(application.statusHistory) ? [...application.statusHistory] : [];
      history.push({
        status: 'REJECTED',
        changedAt: now.toISOString(),
        changedBy: req.user._id,
        note: `Rejected by Admin: ${rejectionReason.trim()}`,
      });

      updated = await devStore.updateAgentApplication(application._id, {
        status: 'REJECTED',
        rejectionReason: rejectionReason.trim(),
        reviewedAt: now.toISOString(),
        reviewedBy: req.user._id,
        activationCodeStatus: 'REVOKED',
        statusHistory: history,
      });
    }

    await recordAuditLog({
      req,
      action: 'REJECTED_AGENT',
      module: 'agents',
      targetType: 'AgentApplication',
      targetId: id,
      targetName: updated.agentName,
      newValue: { status: 'REJECTED' },
      reason: rejectionReason,
    });

    return res.status(200).json({
      success: true,
      message: 'Agent application rejected.',
      data: { application: updated },
    });
  } catch (error) {
    next(error);
  }
};

// ── Uni Rep Applications Admin Review ─────────────────────────────────────────
export const getAdminUniRepApplications = async (req, res, next) => {
  try {
    const { status, search = '' } = req.query;

    if (mongoose.connection.readyState === 1) {
      // 1. Fetch all real Uni Rep users (Identity Source of Truth)
      const uniRepUsers = await User.find({
        role: { $in: ['university_rep', 'universityRep', 'university', 'university representative'] },
      })
        .select('-password -activationTokenHash')
        .populate('universityId', 'name country location city website')
        .sort({ createdAt: -1 });

      // 2. Fetch existing submitted applications (READ-SAFE: NO writes on GET!)
      const existingApps = await UniversityRepresentativeApplication.find({})
        .populate('user', 'name email phone role status accountStatus uniRepVerificationStatus createdAt')
        .populate('reviewedBy', 'name email')
        .sort({ createdAt: -1 });

      const appByUserId = new Map();
      const appByAppId = new Map();
      for (const a of existingApps) {
        const uid = a.user?._id ? a.user._id.toString() : (a.user ? a.user.toString() : '');
        if (uid) appByUserId.set(uid, a);
        if (a.applicationId) appByAppId.set(a.applicationId.toUpperCase().trim(), a);
      }

      // 3. Build unified normalized list (combining existing complete apps and legacy incomplete users)
      const unifiedList = [];
      const processedUserIds = new Set();

      for (const u of uniRepUsers) {
        const uid = u._id.toString();
        processedUserIds.add(uid);

        let app = appByUserId.get(uid);
        if (!app && u.universityRepApplicationId) {
          app = appByAppId.get(u.universityRepApplicationId.toUpperCase().trim());
        }

        if (app) {
          const appObj = app.toObject ? app.toObject() : { ...app };
          if (appObj.user) {
            appObj.user.walletCredits = 'N/A';
            appObj.user.availableCredits = 'N/A';
          }
          appObj.representative = appObj.representative || {
            fullName: appObj.user?.name || null,
            officialEmail: appObj.user?.email || null,
            phone: appObj.user?.phone || null,
            designation: 'International Admissions Officer',
            employeeId: null,
          };
          appObj.university = appObj.university || {
            name: null,
            city: null,
            website: null,
            country: null,
          };
          const hasEmployeeId = Boolean(appObj.representative?.employeeId && appObj.representative.employeeId.trim());
          const hasCity = Boolean(appObj.university?.city && appObj.university.city.trim());
          const hasWebsite = Boolean(appObj.university?.website && appObj.university.website.trim());
          appObj.isProfileComplete = hasEmployeeId && hasCity && hasWebsite;

          const rawAppStatus = (appObj.status || '').toUpperCase();
          const rawUserStatus = (appObj.user?.uniRepVerificationStatus || appObj.user?.accountStatus || '').toUpperCase();
          const isExplicitRejected = rawAppStatus === 'REJECTED' || rawUserStatus === 'REJECTED' || appObj.user?.status === 'rejected';
          const isExplicitActive = rawAppStatus === 'ACTIVE' || rawUserStatus === 'ACTIVE' || appObj.user?.status === 'active';
          const isExplicitApproved = rawAppStatus === 'APPROVED' || rawAppStatus === 'VERIFIED' || rawUserStatus === 'VERIFIED' || rawUserStatus === 'APPROVED';
          const isUnderReview = rawAppStatus === 'UNDER_REVIEW' || rawUserStatus === 'UNDER_REVIEW';

          if (isExplicitRejected) {
            appObj.status = 'REJECTED';
            appObj.profileStatus = 'REJECTED';
          } else if (isExplicitActive) {
            appObj.status = 'ACTIVE';
            appObj.profileStatus = 'ACTIVE';
          } else if (isExplicitApproved) {
            appObj.status = 'APPROVED';
            appObj.profileStatus = 'APPROVED';
          } else if (isUnderReview) {
            appObj.status = 'UNDER_REVIEW';
            appObj.profileStatus = 'UNDER_REVIEW';
          } else if (!appObj.isProfileComplete) {
            appObj.status = 'PROFILE_INCOMPLETE';
            appObj.profileStatus = 'PROFILE_INCOMPLETE';
          } else {
            appObj.status = appObj.status || 'PENDING';
            appObj.profileStatus = appObj.status;
          }

          unifiedList.push(appObj);
        } else {
          // Legacy/incomplete user: DO NOT call Model.create(), DO NOT invent fake data
          const userObj = u.toObject ? u.toObject() : { ...u };
          userObj.walletCredits = 'N/A';
          userObj.availableCredits = 'N/A';

          const repName = u.name || null;
          const repEmail = u.email || null;
          const repPhone = u.phone || null;
          const repEmpId = u.employeeId || null;
          const uniName = u.universityName || u.universityId?.name || null;
          const uniCity = u.city || u.universityId?.city || null;
          const uniWeb = u.website || u.universityId?.website || null;
          const uniCountry = u.country || u.universityId?.country || null;

          const hasRequired = Boolean(repEmpId && uniCity && uniWeb);
          const rawStatus = (u.uniRepVerificationStatus || u.accountStatus || (u.status === 'rejected' ? 'REJECTED' : 'PENDING')).toUpperCase();
          const isExplicitRejected = rawStatus === 'REJECTED' || u.uniRepVerificationStatus === 'REJECTED' || u.accountStatus === 'REJECTED' || u.status === 'rejected';
          const isExplicitActive = rawStatus === 'ACTIVE' || u.accountStatus === 'ACTIVE' || u.status === 'active';
          const isExplicitApproved = rawStatus === 'APPROVED' || rawStatus === 'VERIFIED' || u.uniRepVerificationStatus === 'VERIFIED' || u.uniRepVerificationStatus === 'APPROVED';
          const isUnderReview = rawStatus === 'UNDER_REVIEW' || u.uniRepVerificationStatus === 'UNDER_REVIEW';

          let resolvedStatus = 'PENDING';
          if (isExplicitRejected) {
            resolvedStatus = 'REJECTED';
          } else if (isExplicitActive) {
            resolvedStatus = 'ACTIVE';
          } else if (isExplicitApproved) {
            resolvedStatus = 'APPROVED';
          } else if (isUnderReview) {
            resolvedStatus = 'UNDER_REVIEW';
          } else if (!hasRequired) {
            resolvedStatus = 'PROFILE_INCOMPLETE';
          } else {
            resolvedStatus = 'PENDING';
          }

          unifiedList.push({
            _id: u.universityRepApplication || u._id,
            user: userObj,
            applicationId: u.universityRepApplicationId || `UNIREP-${uid.slice(-6).toUpperCase()}`,
            university: {
              name: uniName,
              legalName: uniName,
              logo: '',
              website: uniWeb,
              country: uniCountry,
              city: uniCity,
              type: 'Public',
              domain: u.email && u.email.includes('@') ? u.email.split('@')[1] : null,
              matchedUniversityId: u.universityId || null,
            },
            representative: {
              fullName: repName,
              designation: u.designation || 'International Admissions Officer',
              officialEmail: repEmail,
              phone: repPhone,
              employeeId: repEmpId,
            },
            documents: u.documents || {},
            academicScope: u.academicScope || { studyLevels: [], programsDepartments: '', countriesRegionsHandled: [] },
            professional: u.professional || { yearsOfExperience: 0, previousExperience: '', languages: [], areasOfExpertise: [], certificationsMemberships: [] },
            status: resolvedStatus,
            profileStatus: resolvedStatus,
            isProfileComplete: hasRequired,
            isLegacyRecord: true,
            rejectionReason: u.rejectionReason || '',
            rejectedAt: u.rejectedAt || null,
            rejectedBy: u.rejectedBy || null,
            adminNotes: u.adminNotes || '',
            submittedAt: u.createdAt,
            createdAt: u.createdAt,
            updatedAt: u.updatedAt,
          });
        }
      }

      // Include any applications whose user wasn't in uniRepUsers
      for (const a of existingApps) {
        const uid = a.user?._id ? a.user._id.toString() : (a.user ? a.user.toString() : '');
        if (uid && !processedUserIds.has(uid)) {
          const appObj = a.toObject ? a.toObject() : { ...a };
          if (appObj.user) {
            appObj.user.walletCredits = 'N/A';
            appObj.user.availableCredits = 'N/A';
          }
          appObj.representative = appObj.representative || {
            fullName: appObj.user?.name || null,
            officialEmail: appObj.user?.email || null,
            phone: appObj.user?.phone || null,
            designation: 'International Admissions Officer',
            employeeId: null,
          };
          appObj.university = appObj.university || {
            name: null,
            city: null,
            website: null,
            country: null,
          };
          const hasEmployeeId = Boolean(appObj.representative?.employeeId && appObj.representative.employeeId.trim());
          const hasCity = Boolean(appObj.university?.city && appObj.university.city.trim());
          const hasWebsite = Boolean(appObj.university?.website && appObj.university.website.trim());
          appObj.isProfileComplete = hasEmployeeId && hasCity && hasWebsite;

          const rawAppStatus = (appObj.status || '').toUpperCase();
          const rawUserStatus = (appObj.user?.uniRepVerificationStatus || appObj.user?.accountStatus || '').toUpperCase();
          const isExplicitRejected = rawAppStatus === 'REJECTED' || rawUserStatus === 'REJECTED' || appObj.user?.status === 'rejected';
          const isExplicitActive = rawAppStatus === 'ACTIVE' || rawUserStatus === 'ACTIVE' || appObj.user?.status === 'active';
          const isExplicitApproved = rawAppStatus === 'APPROVED' || rawAppStatus === 'VERIFIED' || rawUserStatus === 'VERIFIED' || rawUserStatus === 'APPROVED';
          const isUnderReview = rawAppStatus === 'UNDER_REVIEW' || rawUserStatus === 'UNDER_REVIEW';

          if (isExplicitRejected) {
            appObj.status = 'REJECTED';
            appObj.profileStatus = 'REJECTED';
          } else if (isExplicitActive) {
            appObj.status = 'ACTIVE';
            appObj.profileStatus = 'ACTIVE';
          } else if (isExplicitApproved) {
            appObj.status = 'APPROVED';
            appObj.profileStatus = 'APPROVED';
          } else if (isUnderReview) {
            appObj.status = 'UNDER_REVIEW';
            appObj.profileStatus = 'UNDER_REVIEW';
          } else if (!appObj.isProfileComplete) {
            appObj.status = 'PROFILE_INCOMPLETE';
            appObj.profileStatus = 'PROFILE_INCOMPLETE';
          } else {
            appObj.status = appObj.status || 'PENDING';
            appObj.profileStatus = appObj.status;
          }

          unifiedList.push(appObj);
        }
      }

      // 4. In-memory Filter & Search
      let filtered = unifiedList;

      if (status && status !== 'all') {
        const st = status.toUpperCase();
        filtered = filtered.filter((app) => {
          if (st === 'REJECTED') {
            return app.status === 'REJECTED' || app.profileStatus === 'REJECTED';
          }
          if (st === 'APPROVED' || st === 'ACTIVE') {
            return (app.status === 'APPROVED' || app.status === 'ACTIVE' || app.user?.accountStatus === 'ACTIVE') && app.status !== 'REJECTED';
          }
          if (st === 'PROFILE_INCOMPLETE') {
            return (app.profileStatus === 'PROFILE_INCOMPLETE' || app.status === 'PROFILE_INCOMPLETE' || !app.isProfileComplete) && app.status !== 'REJECTED' && app.status !== 'APPROVED' && app.status !== 'ACTIVE';
          }
          if (st === 'PENDING') {
            return (app.status === 'PENDING' || app.profileStatus === 'PENDING') && app.status !== 'APPROVED' && app.status !== 'REJECTED' && app.status !== 'ACTIVE';
          }
          return app.status === st || app.profileStatus === st;
        });
      }

      if (search && search.trim()) {
        const s = search.toLowerCase().trim();
        filtered = filtered.filter((app) => {
          return (
            app.applicationId?.toLowerCase().includes(s) ||
            app.university?.name?.toLowerCase().includes(s) ||
            app.university?.city?.toLowerCase().includes(s) ||
            app.representative?.fullName?.toLowerCase().includes(s) ||
            app.representative?.officialEmail?.toLowerCase().includes(s) ||
            app.representative?.phone?.toLowerCase().includes(s) ||
            app.representative?.employeeId?.toLowerCase().includes(s) ||
            app.user?.name?.toLowerCase().includes(s) ||
            app.user?.email?.toLowerCase().includes(s)
          );
        });
      }

      const seenItems = await AdminSeenItem.find({ entityType: 'university_rep' }).lean();
      const seenMap = new Map();
      for (const s of seenItems) seenMap.set(s.entityId, true);

      filtered = filtered.map((app) => ({
        ...app,
        isSeenByAdmin: Boolean(app.isSeenByAdmin || isEntityDocSeen('university_rep', app, seenMap)),
      }));

      return res.status(200).json({
        success: true,
        count: filtered.length,
        data: { applications: filtered },
        applications: filtered,
      });
    } else {
      let apps = await devStore.findUniRepApplications({ status, search });
      const dbSeen = (devStore.read()).adminSeenItems || [];
      for (const app of apps) {
        if (!app.userObj && app.user) {
          const uid = app.user?._id ? app.user._id.toString() : app.user.toString();
          const found = await devStore.findUserById(uid);
          if (found) app.user = found;
        }
        if (app.user && typeof app.user === 'object') {
          app.user.walletCredits = 'N/A';
          app.user.availableCredits = 'N/A';
        }
        app.isSeenByAdmin = Boolean(app.isSeenByAdmin || isEntityDocSeen('university_rep', app, dbSeen));
      }

      return res.status(200).json({
        success: true,
        count: apps.length,
        data: { applications: apps },
        applications: apps,
      });
    }
  } catch (error) {
    next(error);
  }
};

export const getAdminUniRepApplicationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let application = null;

    if (mongoose.connection.readyState === 1) {
      if (mongoose.Types.ObjectId.isValid(id)) {
        application = await UniversityRepresentativeApplication.findById(id)
          .populate('user', 'name email phone role status accountStatus uniRepVerificationStatus createdAt')
          .populate('reviewedBy', 'name email');
        if (!application) {
          application = await UniversityRepresentativeApplication.findOne({ user: id })
            .populate('user', 'name email phone role status accountStatus uniRepVerificationStatus createdAt')
            .populate('reviewedBy', 'name email');
        }
      }
      if (!application) {
        application = await UniversityRepresentativeApplication.findOne({ applicationId: id.toUpperCase().trim() })
          .populate('user', 'name email phone role status accountStatus uniRepVerificationStatus createdAt')
          .populate('reviewedBy', 'name email');
      }

      if (application) {
        const appObj = application.toObject ? application.toObject() : { ...application };
        if (appObj.user) {
          appObj.user.walletCredits = 'N/A';
          appObj.user.availableCredits = 'N/A';
        }
        appObj.representative = appObj.representative || {
          fullName: appObj.user?.name || null,
          officialEmail: appObj.user?.email || null,
          phone: appObj.user?.phone || null,
          designation: 'International Admissions Officer',
          employeeId: null,
        };
        appObj.university = appObj.university || {
          name: null,
          city: null,
          website: null,
          country: null,
        };
        application = appObj;
      }

      // If not in UniversityRepresentativeApplication, check User collection for legacy account
      if (!application && mongoose.Types.ObjectId.isValid(id)) {
        const u = await User.findById(id).select('-password -activationTokenHash');
        if (u && (u.role === 'university_rep' || u.role === 'universityRep' || u.role === 'university' || u.role === 'university representative')) {
          const userObj = u.toObject ? u.toObject() : { ...u };
          userObj.walletCredits = 'N/A';
          userObj.availableCredits = 'N/A';
          const repEmpId = u.employeeId || null;
          const uniCity = u.city || null;
          const uniWeb = u.website || null;
          const hasRequired = Boolean(repEmpId && uniCity && uniWeb);
          const rawStatus = (u.uniRepVerificationStatus || u.accountStatus || (u.status === 'rejected' ? 'REJECTED' : 'PENDING')).toUpperCase();
          const isExplicitRejected = rawStatus === 'REJECTED' || u.uniRepVerificationStatus === 'REJECTED' || u.accountStatus === 'REJECTED' || u.status === 'rejected';
          const isExplicitActive = rawStatus === 'ACTIVE' || u.accountStatus === 'ACTIVE' || u.status === 'active';
          const isExplicitApproved = rawStatus === 'APPROVED' || rawStatus === 'VERIFIED' || u.uniRepVerificationStatus === 'VERIFIED' || u.uniRepVerificationStatus === 'APPROVED';
          const isUnderReview = rawStatus === 'UNDER_REVIEW' || u.uniRepVerificationStatus === 'UNDER_REVIEW';

          let resolvedStatus = 'PENDING';
          if (isExplicitRejected) {
            resolvedStatus = 'REJECTED';
          } else if (isExplicitActive) {
            resolvedStatus = 'ACTIVE';
          } else if (isExplicitApproved) {
            resolvedStatus = 'APPROVED';
          } else if (isUnderReview) {
            resolvedStatus = 'UNDER_REVIEW';
          } else if (!hasRequired) {
            resolvedStatus = 'PROFILE_INCOMPLETE';
          } else {
            resolvedStatus = 'PENDING';
          }

          application = {
            _id: u.universityRepApplication || u._id,
            user: userObj,
            applicationId: u.universityRepApplicationId || `UNIREP-${u._id.toString().slice(-6).toUpperCase()}`,
            university: {
              name: u.universityName || null,
              legalName: u.universityName || null,
              logo: '',
              website: uniWeb,
              country: u.country || null,
              city: uniCity,
              type: 'Public',
              domain: u.email && u.email.includes('@') ? u.email.split('@')[1] : null,
              matchedUniversityId: u.universityId || null,
            },
            representative: {
              fullName: u.name || null,
              designation: u.designation || 'International Admissions Officer',
              officialEmail: u.email || null,
              phone: u.phone || null,
              employeeId: repEmpId,
            },
            documents: u.documents || {},
            academicScope: u.academicScope || { studyLevels: [], programsDepartments: '', countriesRegionsHandled: [] },
            professional: u.professional || { yearsOfExperience: 0, previousExperience: '', languages: [], areasOfExpertise: [], certificationsMemberships: [] },
            status: resolvedStatus,
            profileStatus: resolvedStatus,
            isProfileComplete: hasRequired,
            isLegacyRecord: true,
            rejectionReason: u.rejectionReason || '',
            rejectedAt: u.rejectedAt || null,
            rejectedBy: u.rejectedBy || null,
            adminNotes: u.adminNotes || '',
            submittedAt: u.createdAt,
            createdAt: u.createdAt,
            updatedAt: u.updatedAt,
          };
        }
      }
    } else {
      application = await devStore.findUniRepApplicationById(id);
      if (!application) application = await devStore.findUniRepApplicationByUserId(id);
      if (!application) application = await devStore.findUniRepApplicationByAppId(id);
      if (application && application.user) {
        application.user = await devStore.findUserById(application.user);
        if (application.user) {
          application.user.walletCredits = 'N/A';
          application.user.availableCredits = 'N/A';
        }
      }
    }

    if (!application) {
      return res.status(404).json({ success: false, message: 'University Representative application not found.' });
    }

    const repIdToMark = application._id ? application._id.toString() : id;
    await markEntityAsSeenHelper('university_rep', repIdToMark, req.user?._id);
    if (application.applicationId) {
      await markEntityAsSeenHelper('university_rep', application.applicationId, req.user?._id);
    }
    application.isSeenByAdmin = true;

    return res.status(200).json({
      success: true,
      data: { application },
      application,
    });
  } catch (error) {
    next(error);
  }
};

export const approveUniRepApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { adminNotes = '' } = req.body;
    const now = new Date();

    let application = null;
    let repUser = null;
    let emailResult = null;

    if (mongoose.connection.readyState === 1) {
      if (mongoose.Types.ObjectId.isValid(id)) application = await UniversityRepresentativeApplication.findById(id);
      if (!application && mongoose.Types.ObjectId.isValid(id)) application = await UniversityRepresentativeApplication.findOne({ user: id });
      if (!application) application = await UniversityRepresentativeApplication.findOne({ applicationId: id.toUpperCase().trim() });

      if (application) {
        repUser = await User.findById(application.user);
        if (!repUser) return res.status(404).json({ success: false, message: 'Associated user account not found.' });

        application.status = 'APPROVED';
        application.profileStatus = 'APPROVED';
        application.reviewedAt = now;
        application.reviewedBy = req.user._id;
        application.rejectionReason = '';
        if (adminNotes) application.adminNotes = adminNotes;

        if (!Array.isArray(application.statusHistory)) application.statusHistory = [];
        application.statusHistory.push({
          status: 'APPROVED',
          changedAt: now,
          changedBy: req.user._id,
          note: adminNotes || 'Approved by Administrator.',
        });

        await application.save({ validateModifiedOnly: true });
      } else if (mongoose.Types.ObjectId.isValid(id)) {
        repUser = await User.findById(id);
        if (!repUser || (repUser.role !== 'university_rep' && repUser.role !== 'universityRep' && repUser.role !== 'university')) {
          return res.status(404).json({ success: false, message: 'University representative account not found.' });
        }
      } else {
        return res.status(404).json({ success: false, message: 'Application not found.' });
      }

      // Check or create University record
      const uniName = application?.university?.name || repUser.universityName || 'Verified University';
      let uni = null;
      if (application?.university?.matchedUniversityId) {
        uni = await University.findById(application.university.matchedUniversityId);
      }
      if (!uni) {
        uni = await University.findOne({ name: new RegExp(`^${uniName}$`, 'i') });
      }
      if (!uni) {
        const slug = uniName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `uni-${Date.now()}`;
        uni = await University.create({
          slug,
          name: uniName,
          location: application?.university?.city ? `${application.university.city}, ${application.university?.country || 'Global'}` : (application?.university?.country || 'Global'),
          country: (application?.university?.country || 'Global').toLowerCase(),
          type: application?.university?.type || 'Public',
          logo: application?.university?.logo || '',
          website: application?.university?.website || '',
        });
      }

      const userUpdates = {
        role: 'university_rep',
        accountStatus: 'ACTIVE',
        status: 'active',
        isActive: true,
        emailVerified: true,
        uniRepVerificationStatus: 'APPROVED',
        activationTokenHash: null,
        activationTokenExpires: null,
        activationTokenUsed: true,
        activatedAt: now,
        approvedAt: now,
        approvedBy: req.user._id,
      };
      if (uni?._id) {
        userUpdates.universityId = uni._id;
      }

      await User.findByIdAndUpdate(repUser._id, userUpdates);

      emailResult = await emailService.sendUniversityRepApprovalEmail({
        to: application?.representative?.officialEmail || repUser.email,
        representativeName: application?.representative?.fullName || repUser.name,
        universityName: application?.university?.name || repUser.universityName || 'Verified University',
        applicationId: application?.applicationId || repUser.universityRepApplicationId || 'ADM-REP-2026',
      });

      if (!application && repUser) {
        application = {
          _id: repUser.universityRepApplication || repUser._id,
          user: repUser,
          applicationId: repUser.universityRepApplicationId || `UNIREP-${repUser._id.toString().slice(-6).toUpperCase()}`,
          university: {
            name: repUser.universityName || null,
            city: repUser.city || null,
            website: repUser.website || null,
            country: repUser.country || null,
          },
          representative: {
            fullName: repUser.name || null,
            officialEmail: repUser.email || null,
            phone: repUser.phone || null,
            designation: repUser.designation || 'International Admissions Officer',
            employeeId: repUser.employeeId || null,
          },
          status: 'APPROVED',
          profileStatus: 'APPROVED',
          isProfileComplete: Boolean(repUser.employeeId && repUser.city && repUser.website),
          isLegacyRecord: true,
        };
      }
    } else {
      application = await devStore.findUniRepApplicationById(id);
      if (!application) application = await devStore.findUniRepApplicationByUserId(id);
      if (!application) application = await devStore.findUniRepApplicationByAppId(id);
      if (!application) return res.status(404).json({ success: false, message: 'Application not found.' });

      const userId = application.user?._id || application.user;
      repUser = await devStore.findUserById(userId);
      if (!repUser) return res.status(404).json({ success: false, message: 'Associated user account not found.' });

      const history = Array.isArray(application.statusHistory) ? [...application.statusHistory] : [];
      history.push({
        status: 'APPROVED',
        changedAt: now.toISOString(),
        changedBy: req.user._id,
        note: adminNotes || 'Approved by Administrator.',
      });

      application = await devStore.updateUniRepApplication(application._id, {
        status: 'APPROVED',
        profileStatus: 'APPROVED',
        reviewedAt: now.toISOString(),
        reviewedBy: req.user._id,
        rejectionReason: '',
        adminNotes: adminNotes || '',
        statusHistory: history,
      });

      const uniName = application.university?.name || repUser.universityName || 'Verified University';
      const uniRecord = await devStore.findOrCreateUniversity({
        name: uniName,
        country: application.university?.country || 'Global',
        city: application.university?.city || '',
        type: application.university?.type || 'Public',
        logo: application.university?.logo || '',
        website: application.university?.website || '',
      });

      await devStore.updateUser(userId, {
        role: 'university_rep',
        accountStatus: 'ACTIVE',
        status: 'active',
        isActive: true,
        emailVerified: true,
        uniRepVerificationStatus: 'APPROVED',
        activationTokenHash: null,
        activationTokenExpires: null,
        activationTokenUsed: true,
        activatedAt: now.toISOString(),
        approvedAt: now.toISOString(),
        approvedBy: req.user._id,
        universityId: uniRecord?._id || repUser.universityId,
      });

      emailResult = await emailService.sendUniversityRepApprovalEmail({
        to: application.representative?.officialEmail || repUser.email,
        representativeName: application.representative?.fullName || repUser.name,
        universityName: application.university?.name || 'Verified University',
        applicationId: application.applicationId,
      });
    }

    await recordAuditLog({
      req,
      action: 'APPROVED_UNI_REP',
      module: 'university-reps',
      targetType: 'UniversityRepresentativeApplication',
      targetId: id,
      targetName: application?.representative?.fullName || repUser?.name || 'University Representative',
      newValue: { status: 'APPROVED' },
    });

    return res.status(200).json({
      success: true,
      message: 'University representative approved and account activated.',
      data: {
        application,
        loginUrl: emailResult?.loginUrl || 'https://admify.world/login',
        emailDispatched: emailResult?.delivered || false,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const rejectUniRepApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rejectionReason = '', adminNotes = '' } = req.body;

    if (!rejectionReason.trim()) {
      return res.status(400).json({
        success: false,
        message: 'A rejection reason is required when rejecting a verification application.',
      });
    }

    const now = new Date();
    let application = null;
    let repUser = null;

    if (mongoose.connection.readyState === 1) {
      if (mongoose.Types.ObjectId.isValid(id)) application = await UniversityRepresentativeApplication.findById(id);
      if (!application && mongoose.Types.ObjectId.isValid(id)) application = await UniversityRepresentativeApplication.findOne({ user: id });
      if (!application) application = await UniversityRepresentativeApplication.findOne({ applicationId: id.toUpperCase().trim() });

      if (application) {
        repUser = await User.findById(application.user);
        application.status = 'REJECTED';
        application.reviewedAt = now;
        application.reviewedBy = req.user._id;
        application.rejectionReason = rejectionReason.trim();
        application.rejectedAt = now;
        application.rejectedBy = req.user._id;
        application.profileStatus = 'REJECTED';
        if (adminNotes) application.adminNotes = adminNotes;

        if (!Array.isArray(application.statusHistory)) application.statusHistory = [];
        application.statusHistory.push({
          status: 'REJECTED',
          changedAt: now,
          changedBy: req.user._id,
          note: `Rejected: ${rejectionReason.trim()}`,
        });

        await application.save({ validateModifiedOnly: true });

        await User.findByIdAndUpdate(application.user, {
          accountStatus: 'REJECTED',
          uniRepVerificationStatus: 'REJECTED',
          status: 'rejected',
          rejectionReason: rejectionReason.trim(),
          adminNotes: adminNotes ? adminNotes.trim() : '',
          rejectedAt: now,
          rejectedBy: req.user._id,
          isActive: false,
        });
      } else if (mongoose.Types.ObjectId.isValid(id)) {
        repUser = await User.findById(id);
        if (!repUser || (repUser.role !== 'university_rep' && repUser.role !== 'universityRep' && repUser.role !== 'university')) {
          return res.status(404).json({ success: false, message: 'University representative account not found.' });
        }
        await User.findByIdAndUpdate(repUser._id, {
          accountStatus: 'REJECTED',
          uniRepVerificationStatus: 'REJECTED',
          status: 'rejected',
          rejectionReason: rejectionReason.trim(),
          adminNotes: adminNotes ? adminNotes.trim() : '',
          rejectedAt: now,
          rejectedBy: req.user._id,
          isActive: false,
        });

        // Construct normalized application representation for return
        application = {
          _id: repUser.universityRepApplication || repUser._id,
          user: repUser,
          applicationId: repUser.universityRepApplicationId || `UNIREP-${repUser._id.toString().slice(-6).toUpperCase()}`,
          university: {
            name: repUser.universityName || null,
            city: repUser.city || null,
            website: repUser.website || null,
            country: repUser.country || null,
          },
          representative: {
            fullName: repUser.name || null,
            officialEmail: repUser.email || null,
            phone: repUser.phone || null,
            designation: repUser.designation || 'International Admissions Officer',
            employeeId: repUser.employeeId || null,
          },
          status: 'REJECTED',
          profileStatus: 'REJECTED',
          isProfileComplete: Boolean(repUser.employeeId && repUser.city && repUser.website),
          isLegacyRecord: true,
          rejectionReason: rejectionReason.trim(),
          rejectedAt: now,
          rejectedBy: req.user._id,
          adminNotes: adminNotes || '',
        };
      } else {
        return res.status(404).json({ success: false, message: 'Application not found.' });
      }
    } else {
      application = await devStore.findUniRepApplicationById(id);
      if (!application) application = await devStore.findUniRepApplicationByUserId(id);
      if (!application) application = await devStore.findUniRepApplicationByAppId(id);
      
      let userId = application?.user?._id || application?.user || (mongoose.Types.ObjectId.isValid(id) ? id : null);
      if (userId) {
        repUser = await devStore.findUserById(userId);
      }

      if (!application && !repUser) {
        return res.status(404).json({ success: false, message: 'Application not found.' });
      }

      if (application) {
        const history = Array.isArray(application.statusHistory) ? [...application.statusHistory] : [];
        history.push({
          status: 'REJECTED',
          changedAt: now.toISOString(),
          changedBy: req.user._id,
          note: `Rejected: ${rejectionReason.trim()}`,
        });

        application = await devStore.updateUniRepApplication(application._id, {
          status: 'REJECTED',
          profileStatus: 'REJECTED',
          reviewedAt: now.toISOString(),
          reviewedBy: req.user._id,
          rejectedAt: now.toISOString(),
          rejectedBy: req.user._id,
          rejectionReason: rejectionReason.trim(),
          adminNotes: adminNotes || '',
          statusHistory: history,
        });
      } else if (repUser) {
        application = {
          _id: repUser.universityRepApplication || repUser._id,
          user: repUser,
          applicationId: repUser.universityRepApplicationId || `UNIREP-${repUser._id.toString().slice(-6).toUpperCase()}`,
          university: {
            name: repUser.universityName || null,
            city: repUser.city || null,
            website: repUser.website || null,
            country: repUser.country || null,
          },
          representative: {
            fullName: repUser.name || null,
            officialEmail: repUser.email || null,
            phone: repUser.phone || null,
            designation: repUser.designation || 'International Admissions Officer',
            employeeId: repUser.employeeId || null,
          },
          status: 'REJECTED',
          profileStatus: 'REJECTED',
          isProfileComplete: Boolean(repUser.employeeId && repUser.city && repUser.website),
          isLegacyRecord: true,
          rejectionReason: rejectionReason.trim(),
          rejectedAt: now.toISOString(),
          rejectedBy: req.user._id,
          adminNotes: adminNotes || '',
        };
      }

      if (userId) {
        await devStore.updateUser(userId, {
          accountStatus: 'REJECTED',
          uniRepVerificationStatus: 'REJECTED',
          status: 'rejected',
          rejectionReason: rejectionReason.trim(),
          adminNotes: adminNotes ? adminNotes.trim() : '',
          rejectedAt: now.toISOString(),
          rejectedBy: req.user._id,
          isActive: false,
        });
      }
    }

    await recordAuditLog({
      req,
      action: 'REJECTED_UNI_REP',
      module: 'university-reps',
      targetType: 'UniversityRepresentativeApplication',
      targetId: id,
      targetName: application?.representative?.fullName || repUser?.name || 'University Representative',
      newValue: { status: 'REJECTED' },
      reason: rejectionReason,
    });

    return res.status(200).json({
      success: true,
      message: 'University Representative application rejected.',
      data: { application },
      application,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Permanently delete rejected university representative application and canonical account
// @route   DELETE /api/admin/university-rep-applications/:id
// @access  Private (Admin)
export const deleteUniRepApplication = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ success: false, message: 'Application or User ID is required.' });
    }

    let application = null;
    let repUser = null;

    if (mongoose.connection.readyState === 1) {
      // 1. Resolve application by _id, user ID, or applicationId
      if (mongoose.Types.ObjectId.isValid(id)) {
        application = await UniversityRepresentativeApplication.findById(id);
        if (!application) {
          application = await UniversityRepresentativeApplication.findOne({ user: id });
        }
      }
      if (!application) {
        application = await UniversityRepresentativeApplication.findOne({
          applicationId: id.toUpperCase().trim(),
        });
      }

      if (application) {
        if (application.user) {
          repUser = await User.findById(application.user);
        }
      } else if (mongoose.Types.ObjectId.isValid(id)) {
        repUser = await User.findById(id);
      }

      if (!application && !repUser) {
        return res.status(404).json({ success: false, message: 'University representative record not found.' });
      }

      // Security check: If target is only a User, ensure they are a university representative
      if (!application && repUser) {
        const isUniRep = ['university_rep', 'universityRep', 'university', 'university representative'].includes(repUser.role);
        if (!isUniRep) {
          return res.status(400).json({ success: false, message: 'Target user is not a university representative.' });
        }
      }

      // 2. Strict status rule: must be REJECTED before deletion
      const appStatus = (application?.status || '').toUpperCase();
      const userAccountStatus = (repUser?.accountStatus || '').toUpperCase();
      const userUniRepStatus = (repUser?.uniRepVerificationStatus || '').toUpperCase();

      const isRejected =
        appStatus === 'REJECTED' ||
        (application?.profileStatus || '').toUpperCase() === 'REJECTED' ||
        userAccountStatus === 'REJECTED' ||
        userUniRepStatus === 'REJECTED' ||
        (repUser?.status || '').toUpperCase() === 'REJECTED';

      if (!isRejected) {
        return res.status(409).json({
          success: false,
          message: 'University representative must be rejected before deletion.',
        });
      }

      const repName = application?.representative?.fullName || repUser?.name || 'University Representative';
      const uniName = application?.university?.name || repUser?.universityName || 'University Partner';
      const appId = application?.applicationId || repUser?.universityRepApplicationId || id;
      const userId = repUser?._id?.toString() || (application?.user ? application.user.toString() : null);

      // 3. Record Immutable Admin Audit Log
      await recordAuditLog({
        req,
        action: 'ADMIN_DELETE_UNIREP',
        module: 'university-reps',
        targetType: 'UniversityRepresentativeApplication',
        targetId: id,
        targetName: `${repName} (${uniName})`,
        previousValue: {
          applicationId: appId,
          userId,
          representativeName: repName,
          universityName: uniName,
          status: 'REJECTED',
        },
        newValue: null,
        reason: req.body?.reason || 'Administrator permanently deleted rejected university representative',
      });

      // 4. Permanent physical database deletion
      if (application) {
        await UniversityRepresentativeApplication.deleteOne({ _id: application._id });
      }
      if (userId) {
        await UniversityRepresentativeApplication.deleteMany({ user: userId });
        await User.deleteOne({ _id: userId });
      }

      return res.status(200).json({
        success: true,
        message: 'University representative permanently deleted from system.',
        data: {
          deletedId: id,
          deletedApplicationId: appId,
          deletedUserId: userId,
        },
      });
    } else {
      // devStore memory store fallback
      application = await devStore.findUniRepApplicationById(id);
      if (!application) application = await devStore.findUniRepApplicationByUserId(id);
      if (!application) application = await devStore.findUniRepApplicationByAppId(id);

      let userId = application?.user?._id || application?.user || (mongoose.Types.ObjectId.isValid(id) ? id : null);
      if (userId) {
        repUser = await devStore.findUserById(userId);
      }

      if (!application && !repUser) {
        return res.status(404).json({ success: false, message: 'University representative record not found.' });
      }

      const appStatus = (application?.status || '').toUpperCase();
      const userAccountStatus = (repUser?.accountStatus || '').toUpperCase();
      const userUniRepStatus = (repUser?.uniRepVerificationStatus || '').toUpperCase();

      const isRejected =
        appStatus === 'REJECTED' ||
        (application?.profileStatus || '').toUpperCase() === 'REJECTED' ||
        userAccountStatus === 'REJECTED' ||
        userUniRepStatus === 'REJECTED' ||
        (repUser?.status || '').toUpperCase() === 'REJECTED';

      if (!isRejected) {
        return res.status(409).json({
          success: false,
          message: 'University representative must be rejected before deletion.',
        });
      }

      const repName = application?.representative?.fullName || repUser?.name || 'University Representative';
      const uniName = application?.university?.name || repUser?.universityName || 'University Partner';
      const appId = application?.applicationId || repUser?.universityRepApplicationId || id;

      await recordAuditLog({
        req,
        action: 'ADMIN_DELETE_UNIREP',
        module: 'university-reps',
        targetType: 'UniversityRepresentativeApplication',
        targetId: id,
        targetName: `${repName} (${uniName})`,
        previousValue: {
          applicationId: appId,
          userId: userId?.toString(),
          representativeName: repName,
          universityName: uniName,
          status: 'REJECTED',
        },
        newValue: null,
        reason: req.body?.reason || 'Administrator permanently deleted rejected university representative',
      });

      if (application) {
        await devStore.deleteUniRepApplication(application._id);
      }
      if (userId) {
        await devStore.deleteUser(userId);
      }

      return res.status(200).json({
        success: true,
        message: 'University representative permanently deleted from system.',
        data: {
          deletedId: id,
          deletedApplicationId: appId,
          deletedUserId: userId?.toString(),
        },
      });
    }
  } catch (error) {
    next(error);
  }
};

// ── Agency Permanent Deletion (REJECTED lifecycle only) ───────────────────────
// @desc    Permanently delete a REJECTED agency (profile + user account).
//          Backend enforces REJECTED-status guard. Returns HTTP 409 if not rejected.
// @route   DELETE /api/admin/agencies/verifications/:id
// @access  Private (Admin)
export const deleteAgencyVerification = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ success: false, message: 'Agency ID is required.' });
    }

    let agencyProfile = null;
    let agencyUser = null;

    if (mongoose.connection.readyState === 1) {
      // 1. Resolve AgencyProfile by _id, userId, or applicationId
      if (mongoose.Types.ObjectId.isValid(id)) {
        agencyProfile = await AgencyProfile.findById(id);
        if (!agencyProfile) {
          agencyProfile = await AgencyProfile.findOne({ user: id });
        }
      }
      if (!agencyProfile) {
        agencyProfile = await AgencyProfile.findOne({ applicationId: id.trim() });
      }

      if (agencyProfile) {
        if (agencyProfile.user) {
          agencyUser = await User.findById(agencyProfile.user);
        }
      } else if (mongoose.Types.ObjectId.isValid(id)) {
        agencyUser = await User.findById(id);
        if (agencyUser && agencyUser.role === 'agency') {
          agencyProfile = await AgencyProfile.findOne({ user: agencyUser._id });
        } else {
          agencyUser = null;
        }
      }

      if (!agencyProfile && !agencyUser) {
        return res.status(404).json({ success: false, message: 'Agency record not found.' });
      }

      // 2. Strict REJECTED guard — backend is the final authority
      const profileStatus = (agencyProfile?.verificationStatus || '').toUpperCase();
      const userStatus = (agencyUser?.accountStatus || agencyUser?.agencyVerificationStatus || '').toUpperCase();
      const isRejected = profileStatus === 'REJECTED' || userStatus === 'REJECTED';

      if (!isRejected) {
        return res.status(409).json({
          success: false,
          message: 'Agency must be rejected before deletion. Current status: ' + (profileStatus || userStatus || 'UNKNOWN'),
        });
      }

      // 3. Prevent deleting another admin
      if (agencyUser?.role === 'admin') {
        return res.status(403).json({ success: false, message: 'Cannot delete an admin account through this endpoint.' });
      }

      const agencyName = agencyProfile?.agencyName || agencyUser?.name || 'Agency';
      const appId = agencyProfile?.applicationId || agencyUser?.applicationId || id;
      const userId = agencyUser?._id?.toString() || (agencyProfile?.user ? agencyProfile.user.toString() : null);

      // 4. Immutable audit log before physical deletion
      await recordAuditLog({
        req,
        action: 'ADMIN_DELETE_AGENCY',
        module: 'agencies',
        targetType: 'AgencyProfile',
        targetId: id,
        targetName: agencyName,
        previousValue: {
          applicationId: appId,
          userId,
          agencyName,
          verificationStatus: 'REJECTED',
        },
        newValue: null,
        reason: req.body?.reason || 'Administrator permanently deleted rejected agency',
      });

      // 5. Physical deletion — AgencyProfile + User account + owned records
      //    Agents belonging to this agency have their agencyId unlinked (NOT deleted)
      if (agencyProfile) {
        await AgencyProfile.deleteOne({ _id: agencyProfile._id });
      }
      if (userId) {
        // Unbind agents so they retain their account but lose the agency reference
        await User.updateMany({ agencyId: agencyUser._id }, { $unset: { agencyId: 1 } });
        // Clean up agency-owned orders
        await AgencyServiceOrder.deleteMany({ $or: [{ agency: agencyUser._id }, { user: agencyUser._id }] });
        // Clean up university-agency connections
        await UniversityAgencyConnection.deleteMany({ agency: agencyUser._id });
        // Delete the user account
        await User.deleteOne({ _id: agencyUser._id });
      }

      return res.status(200).json({
        success: true,
        message: 'Agency permanently deleted from the system.',
        data: { deletedId: id, deletedApplicationId: appId, deletedUserId: userId },
      });
    } else {
      // devStore fallback
      agencyProfile = await devStore.findAgencyProfileById(id);
      if (!agencyProfile) agencyProfile = await devStore.findAgencyProfileByUserId(id);
      if (!agencyProfile) agencyProfile = await devStore.findAgencyProfileByApplicationId(id);

      const userId = agencyProfile?.user?._id || agencyProfile?.user || (id !== agencyProfile?._id ? id : null);
      if (userId) {
        agencyUser = await devStore.findUserById(userId);
      }

      if (!agencyProfile && !agencyUser) {
        return res.status(404).json({ success: false, message: 'Agency record not found.' });
      }

      const profileStatus = (agencyProfile?.verificationStatus || '').toUpperCase();
      const userStatus = (agencyUser?.accountStatus || agencyUser?.agencyVerificationStatus || '').toUpperCase();
      const isRejected = profileStatus === 'REJECTED' || userStatus === 'REJECTED';

      if (!isRejected) {
        return res.status(409).json({
          success: false,
          message: 'Agency must be rejected before deletion. Current status: ' + (profileStatus || userStatus || 'UNKNOWN'),
        });
      }

      const agencyName = agencyProfile?.agencyName || agencyUser?.name || 'Agency';
      const appId = agencyProfile?.applicationId || agencyUser?.applicationId || id;

      await recordAuditLog({
        req,
        action: 'ADMIN_DELETE_AGENCY',
        module: 'agencies',
        targetType: 'AgencyProfile',
        targetId: id,
        targetName: agencyName,
        previousValue: { applicationId: appId, userId: userId?.toString(), agencyName, verificationStatus: 'REJECTED' },
        newValue: null,
        reason: req.body?.reason || 'Administrator permanently deleted rejected agency',
      });

      // Physical devStore deletion
      const db = devStore.read();
      if (agencyProfile) {
        db.agencyProfiles = (db.agencyProfiles || []).filter(
          (p) => p._id?.toString() !== agencyProfile._id?.toString()
        );
      }
      if (userId) {
        const uidStr = userId.toString();
        // Unbind agents
        (db.users || []).forEach((u) => {
          if (u.agencyId?.toString() === uidStr) delete u.agencyId;
        });
        db.agencyServiceOrders = (db.agencyServiceOrders || []).filter(
          (o) => o.agency?.toString() !== uidStr && o.user?.toString() !== uidStr
        );
        db.universityAgencyConnections = (db.universityAgencyConnections || []).filter(
          (c) => c.agency?.toString() !== uidStr
        );
        db.users = (db.users || []).filter((u) => u._id?.toString() !== uidStr);
      }
      devStore.write(db);

      return res.status(200).json({
        success: true,
        message: 'Agency permanently deleted from the system.',
        data: { deletedId: id, deletedApplicationId: appId, deletedUserId: userId?.toString() },
      });
    }
  } catch (error) {
    next(error);
  }
};
