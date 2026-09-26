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

    // Role-based counts
    const students = users.filter((u) => u.role === 'student');
    const totalStudents = students.length;
    const totalAgencies = users.filter((u) => u.role === 'agency').length;
    const verifiedAgencies = agencies.filter((a) => a.verificationStatus === 'VERIFIED').length;
    const pendingAgencyVerifications = agencies.filter(
      (a) => a.verificationStatus === 'PENDING' || a.verificationStatus === 'UNDER_REVIEW'
    ).length;

    const totalAgents = users.filter((u) => u.role === 'agent').length;
    const pendingAgentApplications = agentApps.filter(
      (a) => a.status === 'SUBMITTED' || a.status === 'UNDER_REVIEW' || a.status === 'PENDING'
    ).length;

    const totalUniReps = users.filter(
      (u) => u.role === 'university_rep' || u.role === 'university representative' || u.role === 'university'
    ).length;
    const pendingUniRepVerifications = uniRepApps.filter(
      (a) => a.status === 'PENDING' || a.status === 'UNDER_REVIEW'
    ).length;

    const activeUniversities = universities.filter((u) => (u.status || 'active') === 'active').length;
    const totalApplications = applications.length;
    const pendingApplications = applications.filter(
      (a) => a.stage === 'Submitted' || a.stage === 'In Review' || a.stage === 'Documents Pending'
    ).length;

    const approvedPayments = paymentOrders.filter((p) => p.status === 'APPROVED');
    const pendingPayments = paymentOrders.filter(
      (p) => p.status === 'PENDING_PAYMENT' || p.status === 'PENDING_VERIFICATION'
    ).length;

    const totalBdtRevenue = approvedPayments.reduce((acc, curr) => acc + (Number(curr.finalAmount) || 0), 0);
    const totalCreditsSold = approvedPayments.reduce((acc, curr) => acc + (Number(curr.credits) || 0), 0);

    const totalCreditsConsumed = creditTransactions
      .filter((tx) => tx.type === 'USAGE')
      .reduce((acc, curr) => acc + Math.abs(Number(curr.credits) || 0), 0);

    const openReports = reports.filter(
      (r) => r.status === 'PENDING' || r.status === 'UNDER_INVESTIGATION'
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
      users = await User.find(filter)
        .select('-password -activationTokenHash')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit));
    } else {
      const all = await devStore.findUsers({ role, status, search });
      total = all.length;
      users = all.slice((page - 1) * limit, page * limit);
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
      uniRepApplication: null,
      paymentOrders: [],
      creditTransactions: [],
      auditHistory: [],
    };

    if (mongoose.connection.readyState === 1) {
      user = await User.findById(id).select('-password -activationTokenHash');
      if (user) {
        related.applications = await Application.find({ user: user._id }).sort({ createdAt: -1 });
        related.paymentOrders = await PaymentOrder.find({ user: user._id }).sort({ createdAt: -1 });
        related.creditTransactions = await CreditTransaction.find({ user: user._id }).sort({ createdAt: -1 });
        related.auditHistory = await AuditLog.find({ targetId: user._id.toString() }).sort({ createdAt: -1 });

        if (user.role === 'agency') {
          related.agencyProfile = await AgencyProfile.findOne({ user: user._id });
          related.agentApplications = await AgentApplication.find({ agency: user._id });
        } else if (user.role === 'university_rep' || user.role === 'university') {
          related.uniRepApplication = await UniversityRepresentativeApplication.findOne({ user: user._id });
        }
      }
    } else {
      user = await devStore.findUserById(id);
      if (user) {
        const db = devStore.read();
        const uid = user._id.toString();
        related.applications = (db.applications || []).filter((a) => a.user === uid);
        related.paymentOrders = (db.paymentOrders || []).filter((p) => p.user === uid);
        related.creditTransactions = (db.creditTransactions || []).filter((c) => c.user === uid);
        related.auditHistory = (db.auditLogs || []).filter((l) => l.targetId === uid);

        if (user.role === 'agency') {
          related.agencyProfile = await devStore.findAgencyProfileByUserId(uid);
          related.agentApplications = await devStore.findAgentApplications({ agency: uid });
        } else if (user.role === 'university_rep' || user.role === 'university') {
          related.uniRepApplication = await devStore.findUniRepApplicationByUserId(uid);
        }
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
      if (status) updates.status = status;
      if (accountStatus) {
        updates.accountStatus = accountStatus;
        updates.isActive = accountStatus === 'ACTIVE' || accountStatus === 'APPROVED';
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
      if (status) updates.status = status;
      if (accountStatus) {
        updates.accountStatus = accountStatus;
        updates.isActive = accountStatus === 'ACTIVE' || accountStatus === 'APPROVED';
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

// ── 4. Controlled Wallet & Credit Adjustments ──────────────────────────────────
// @desc    Controlled manual credit adjustment by Admin with strict reason and ledger entry
// @route   POST /api/admin/credits/adjust
// @access  Private (Admin)
export const adjustUserCredits = async (req, res, next) => {
  try {
    const userId = req.body.userId || req.params.id;
    const { amount, creditType = 'paid', reason } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required.' });
    }

    const delta = Number(amount);
    if (isNaN(delta) || delta === 0) {
      return res.status(400).json({ success: false, message: 'Amount must be a non-zero number.' });
    }

    if (!reason || reason.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: 'A detailed reason (at least 5 characters) is required for audit compliance.',
      });
    }

    let user = null;
    let balanceBefore = 0;
    let balanceAfter = 0;
    let ledgerTx = null;

    if (mongoose.connection.readyState === 1) {
      user = await User.findById(userId);
      if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

      balanceBefore = (user.paidCredits || 0) + (user.freeCredits || 0);

      if (creditType === 'paid') {
        user.paidCredits = Math.max(0, (user.paidCredits || 0) + delta);
      } else {
        user.freeCredits = Math.max(0, (user.freeCredits || 0) + delta);
      }

      user.walletCredits = (user.paidCredits || 0) + (user.freeCredits || 0);
      balanceAfter = user.walletCredits;
      await user.save();

      const transactionId = `CTX-ADJ-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
      ledgerTx = await CreditTransaction.create({
        transactionId,
        user: user._id,
        type: 'ADMIN_ADJUSTMENT',
        credits: delta,
        balanceBefore,
        balanceAfter,
        referenceType: 'ADMIN_ADJUSTMENT',
        referenceId: req.user._id.toString(),
        desc: `Admin Adjustment (${delta > 0 ? '+' : ''}${delta} CR): ${reason.trim()}`,
        status: 'COMPLETED',
      });
    } else {
      user = await devStore.findUserById(userId);
      if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

      balanceBefore = (user.paidCredits || 0) + (user.freeCredits || 0);

      const updates = {};
      if (creditType === 'paid') {
        updates.paidCredits = Math.max(0, (user.paidCredits || 0) + delta);
      } else {
        updates.freeCredits = Math.max(0, (user.freeCredits || 0) + delta);
      }
      updates.walletCredits = (updates.paidCredits !== undefined ? updates.paidCredits : user.paidCredits || 0) +
        (updates.freeCredits !== undefined ? updates.freeCredits : user.freeCredits || 0);

      balanceAfter = updates.walletCredits;
      user = await devStore.updateUser(userId, updates);

      const transactionId = `CTX-ADJ-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
      ledgerTx = await devStore.createCreditTransaction({
        transactionId,
        user: userId,
        type: 'ADMIN_ADJUSTMENT',
        credits: delta,
        balanceBefore,
        balanceAfter,
        referenceType: 'ADMIN_ADJUSTMENT',
        referenceId: req.user._id.toString(),
        desc: `Admin Adjustment (${delta > 0 ? '+' : ''}${delta} CR): ${reason.trim()}`,
        status: 'COMPLETED',
      });
    }

    // Record audit log
    await recordAuditLog({
      req,
      action: 'CREDIT_ADJUSTMENT',
      module: 'credits',
      targetType: 'User',
      targetId: userId,
      targetName: user.name,
      previousValue: { balance: balanceBefore },
      newValue: { balance: balanceAfter, adjustment: delta, creditType },
      reason: reason.trim(),
    });

    return res.status(200).json({
      success: true,
      message: `Adjusted ${delta > 0 ? '+' : ''}${delta} credits for ${user.name}. New balance: ${balanceAfter} CR.`,
      data: {
        user,
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
        ];
      }
      transactions = await CreditTransaction.find(query)
        .populate('user', 'name email phone role')
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
    } else {
      applications = await devStore.findApplications({ stage, search });
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
    } else {
      const filter = {};
      if (status && status !== 'all') filter.status = status.toUpperCase();
      connections = await devStore.findAgencyConnections(filter);

      // Populate details from devStore
      const populated = [];
      for (const c of connections) {
        const agency = await devStore.findUserById(c.agencyId);
        const uni = await devStore.findUniversityById(c.universityId);
        const rep = await devStore.findUserById(c.universityRepresentativeId);
        populated.push({
          ...c,
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
      scholarships = await Scholarship.find(query).sort({ createdAt: -1 });
    } else {
      scholarships = await devStore.findScholarships({ search, country });
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
    } else {
      reports = await devStore.findReports({ status, priority, targetType, search });
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

      await report.save();
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

      report = await devStore.updateReport(id, updates);
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

      sessions = Array.from(sessionMap.values()).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    } else {
      sessions = await devStore.findChatSessions();
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
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Message text is required.' });
    }

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
    let settings = null;
    if (mongoose.connection.readyState === 1) {
      const allSettings = await PlatformSetting.find({});
      if (allSettings.length === 0) {
        settings = await devStore.getPlatformSettings();
      } else {
        settings = {};
        allSettings.forEach((s) => {
          settings[s.category] = { ...(settings[s.category] || {}), [s.key]: s.value };
        });
      }
    } else {
      settings = await devStore.getPlatformSettings();
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
    const { category, values } = req.body;
    if (!category || !values) {
      return res.status(400).json({ success: false, message: 'Category and setting values are required.' });
    }

    let updated = null;
    if (mongoose.connection.readyState === 1) {
      for (const [key, val] of Object.entries(values)) {
        await PlatformSetting.findOneAndUpdate(
          { key, category },
          { key, category, value: val, updatedBy: req.user._id },
          { upsert: true, new: true }
        );
      }
      updated = await devStore.updatePlatformSettingCategory(category, values, req.user._id);
    } else {
      updated = await devStore.updatePlatformSettingCategory(category, values, req.user._id);
    }

    await recordAuditLog({
      req,
      action: 'UPDATED_SETTINGS',
      module: 'settings',
      targetType: 'PlatformSetting',
      targetId: category,
      targetName: `${category} Settings`,
      newValue: values,
    });

    return res.status(200).json({
      success: true,
      message: `${category} settings updated successfully.`,
      data: { settings: updated },
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
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password || !phone) {
      return res.status(400).json({ success: false, message: 'Name, email, password, and phone are required.' });
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
      payments = await PaymentOrder.find(query)
        .populate('user', 'name email phone role')
        .populate('verifiedBy', 'name email')
        .sort({ createdAt: -1 });
    } else {
      payments = await devStore.findPaymentOrders({ status, search });
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
    const { status } = req.query;
    const query = {};
    if (status && status !== 'all') {
      query.verificationStatus = status.toUpperCase();
    }

    if (mongoose.connection.readyState === 1) {
      const verifications = await AgencyProfile.find(query)
        .populate('user', 'name email phone role status')
        .populate('reviewedBy', 'name email')
        .sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        count: verifications.length,
        data: { verifications },
      });
    } else {
      const verifications = await devStore.findAgencyProfiles(query);
      return res.status(200).json({
        success: true,
        count: verifications.length,
        data: { verifications },
      });
    }
  } catch (error) {
    next(error);
  }
};

export const getAgencyVerificationDetails = async (req, res, next) => {
  try {
    let verification;
    if (mongoose.connection.readyState === 1) {
      verification = await AgencyProfile.findById(req.params.id)
        .populate('user', 'name email phone role status')
        .populate('reviewedBy', 'name email');
    } else {
      verification = await devStore.findAgencyProfileById(req.params.id);
    }

    if (!verification) {
      return res.status(404).json({ success: false, message: 'Agency verification profile not found' });
    }

    return res.status(200).json({
      success: true,
      data: { verification },
    });
  } catch (error) {
    next(error);
  }
};

export const updateAgencyVerificationStatus = async (req, res, next) => {
  try {
    const status = (req.body.status || '').toUpperCase();
    const { rejectionReason = '', adminNotes = '' } = req.body;
    const allowedStatuses = ['PENDING', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED', 'SUSPENDED'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}`,
      });
    }

    if (status === 'REJECTED' && !rejectionReason.trim()) {
      return res.status(400).json({
        success: false,
        message: 'A rejection reason is required when rejecting an agency verification application.',
      });
    }

    const now = new Date();
    let rawActivationToken = null;
    let emailResult = null;

    if (mongoose.connection.readyState === 1) {
      const verification = await AgencyProfile.findById(req.params.id);
      if (!verification) {
        return res.status(404).json({ success: false, message: 'Agency verification profile not found' });
      }

      const agencyUser = await User.findById(verification.user);
      if (!agencyUser) {
        return res.status(404).json({ success: false, message: 'Associated agency user account not found' });
      }

      verification.verificationStatus = status;
      verification.reviewedAt = now;
      verification.reviewedBy = req.user._id;
      if (adminNotes) verification.adminNotes = adminNotes;
      if (!Array.isArray(verification.statusHistory)) verification.statusHistory = [];

      let userUpdates = { agencyVerificationStatus: status };

      if (status === 'VERIFIED') {
        verification.rejectionReason = '';
        verification.statusHistory.push({
          status: 'VERIFIED',
          changedAt: now,
          changedBy: req.user._id,
          note: adminNotes || 'Agency application approved by Administrator.',
        });

        rawActivationToken = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(rawActivationToken).digest('hex');
        const tokenExpires = new Date(Date.now() + 48 * 60 * 60 * 1000);

        userUpdates = {
          ...userUpdates,
          accountStatus: 'APPROVED',
          status: 'pending',
          isActive: false,
          activationTokenHash: tokenHash,
          activationTokenExpires: tokenExpires,
          activationTokenUsed: false,
        };

        emailResult = await emailService.sendAgencyActivationEmail({
          to: verification.officialBusinessEmail || agencyUser.email,
          agencyName: verification.agencyName,
          applicationId: verification.applicationId || 'ADM-AGY-2026',
          activationToken: rawActivationToken,
        });
      } else if (status === 'REJECTED') {
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
      } else {
        userUpdates = { ...userUpdates, accountStatus: status };
      }

      await verification.save();
      await User.findByIdAndUpdate(verification.user, userUpdates);

      await recordAuditLog({
        req,
        action: status === 'VERIFIED' ? 'APPROVED_AGENCY' : status === 'REJECTED' ? 'REJECTED_AGENCY' : 'UPDATED_AGENCY',
        module: 'agencies',
        targetType: 'AgencyProfile',
        targetId: verification._id,
        targetName: verification.agencyName,
        newValue: { status },
        reason: rejectionReason || adminNotes,
      });

      return res.status(200).json({
        success: true,
        message: `Agency verification status updated to ${status}.${status === 'VERIFIED' ? ' Activation email dispatched.' : ''}`,
        data: {
          verification,
          emailDispatched: emailResult?.delivered || false,
          activationUrl: emailResult?.activationUrl || null,
          activationToken: rawActivationToken,
        },
      });
    } else {
      let verification = await devStore.findAgencyProfileById(req.params.id);
      if (!verification) {
        return res.status(404).json({ success: false, message: 'Agency verification profile not found' });
      }

      const userId = verification.user?._id || verification.user;
      const agencyUser = await devStore.findUserById(userId);
      if (!agencyUser) {
        return res.status(404).json({ success: false, message: 'Associated agency user account not found' });
      }

      let userUpdates = { agencyVerificationStatus: status };
      let history = Array.isArray(verification.statusHistory) ? [...verification.statusHistory] : [];

      if (status === 'VERIFIED') {
        rawActivationToken = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(rawActivationToken).digest('hex');
        const tokenExpires = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

        userUpdates = {
          ...userUpdates,
          accountStatus: 'APPROVED',
          status: 'pending',
          isActive: false,
          activationTokenHash: tokenHash,
          activationTokenExpires: tokenExpires,
          activationTokenUsed: false,
        };

        history.push({
          status: 'VERIFIED',
          changedAt: now.toISOString(),
          changedBy: req.user._id,
          note: adminNotes || 'Agency application approved by Administrator.',
        });

        emailResult = await emailService.sendAgencyActivationEmail({
          to: verification.officialBusinessEmail || agencyUser.email,
          agencyName: verification.agencyName,
          applicationId: verification.applicationId || 'ADM-AGY-2026',
          activationToken: rawActivationToken,
        });
      } else if (status === 'REJECTED') {
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
      }

      verification = await devStore.saveAgencyProfile({
        ...verification,
        verificationStatus: status,
        reviewedAt: now.toISOString(),
        reviewedBy: req.user._id,
        adminNotes: adminNotes || verification.adminNotes || '',
        rejectionReason: status === 'REJECTED' ? rejectionReason.trim() : '',
        statusHistory: history,
      });

      await devStore.updateUser(userId, userUpdates);

      await recordAuditLog({
        req,
        action: status === 'VERIFIED' ? 'APPROVED_AGENCY' : status === 'REJECTED' ? 'REJECTED_AGENCY' : 'UPDATED_AGENCY',
        module: 'agencies',
        targetType: 'AgencyProfile',
        targetId: verification._id,
        targetName: verification.agencyName,
        newValue: { status },
        reason: rejectionReason || adminNotes,
      });

      return res.status(200).json({
        success: true,
        message: `Agency verification status updated to ${status}.${status === 'VERIFIED' ? ' Activation email dispatched.' : ''}`,
        data: {
          verification,
          emailDispatched: emailResult?.delivered || false,
          activationUrl: emailResult?.activationUrl || null,
          activationToken: rawActivationToken,
        },
      });
    }
  } catch (error) {
    next(error);
  }
};

// ── Agent Applications Admin Review ───────────────────────────────────────────
export const getAdminAgentApplications = async (req, res, next) => {
  try {
    const { status, agencyId } = req.query;
    const filter = {};
    if (status) filter.status = status.toUpperCase();
    if (agencyId) filter.agency = agencyId;

    let applications = [];
    if (mongoose.connection.readyState === 1) {
      applications = await AgentApplication.find(filter)
        .populate('agency', 'name email phone applicationId')
        .sort({ createdAt: -1 });
    } else {
      applications = await devStore.findAgentApplications(filter);
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
    const query = {};
    if (status && status !== 'all') query.status = status.toUpperCase();

    if (mongoose.connection.readyState === 1) {
      const applications = await UniversityRepresentativeApplication.find(query)
        .populate('user', 'name email phone role status accountStatus uniRepVerificationStatus')
        .populate('reviewedBy', 'name email')
        .sort({ createdAt: -1 });

      let filtered = applications;
      if (search.trim()) {
        const s = search.toLowerCase().trim();
        filtered = applications.filter(
          (app) =>
            app.applicationId?.toLowerCase().includes(s) ||
            app.university?.name?.toLowerCase().includes(s) ||
            app.representative?.fullName?.toLowerCase().includes(s) ||
            app.representative?.officialEmail?.toLowerCase().includes(s)
        );
      }

      return res.status(200).json({
        success: true,
        count: filtered.length,
        data: { applications: filtered },
      });
    } else {
      let apps = await devStore.findUniRepApplications(query);
      for (const app of apps) {
        if (!app.userObj && app.user) {
          app.user = await devStore.findUserById(app.user);
        }
      }

      let filtered = apps;
      if (search.trim()) {
        const s = search.toLowerCase().trim();
        filtered = apps.filter(
          (app) =>
            app.applicationId?.toLowerCase().includes(s) ||
            app.university?.name?.toLowerCase().includes(s) ||
            app.representative?.fullName?.toLowerCase().includes(s) ||
            app.representative?.officialEmail?.toLowerCase().includes(s)
        );
      }

      return res.status(200).json({
        success: true,
        count: filtered.length,
        data: { applications: filtered },
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
          .populate('user', 'name email phone role status accountStatus uniRepVerificationStatus')
          .populate('reviewedBy', 'name email');
      }
      if (!application) {
        application = await UniversityRepresentativeApplication.findOne({ applicationId: id.toUpperCase() })
          .populate('user', 'name email phone role status accountStatus uniRepVerificationStatus')
          .populate('reviewedBy', 'name email');
      }
    } else {
      application = await devStore.findUniRepApplicationById(id);
      if (!application) application = await devStore.findUniRepApplicationByAppId(id);
      if (application && application.user) {
        application.user = await devStore.findUserById(application.user);
      }
    }

    if (!application) {
      return res.status(404).json({ success: false, message: 'University Representative application not found.' });
    }

    return res.status(200).json({
      success: true,
      data: { application },
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

    let rawActivationToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawActivationToken).digest('hex');
    const tokenExpires = new Date(Date.now() + 48 * 60 * 60 * 1000);

    let application = null;
    let repUser = null;
    let emailResult = null;

    if (mongoose.connection.readyState === 1) {
      if (mongoose.Types.ObjectId.isValid(id)) application = await UniversityRepresentativeApplication.findById(id);
      if (!application) application = await UniversityRepresentativeApplication.findOne({ applicationId: id.toUpperCase() });

      if (!application) return res.status(404).json({ success: false, message: 'Application not found.' });

      repUser = await User.findById(application.user);
      if (!repUser) return res.status(404).json({ success: false, message: 'Associated user account not found.' });

      application.status = 'APPROVED';
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

      await application.save();

      await User.findByIdAndUpdate(application.user, {
        accountStatus: 'APPROVED',
        status: 'pending',
        isActive: false,
        uniRepVerificationStatus: 'VERIFIED',
        activationTokenHash: tokenHash,
        activationTokenExpires: tokenExpires,
        activationTokenUsed: false,
      });

      emailResult = await emailService.sendUniversityRepActivationEmail({
        to: application.representative?.officialEmail || repUser.email,
        representativeName: application.representative?.fullName || repUser.name,
        universityName: application.university?.name || 'Verified University',
        applicationId: application.applicationId,
        activationToken: rawActivationToken,
      });
    } else {
      application = await devStore.findUniRepApplicationById(id);
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
        reviewedAt: now.toISOString(),
        reviewedBy: req.user._id,
        rejectionReason: '',
        adminNotes: adminNotes || '',
        statusHistory: history,
      });

      await devStore.updateUser(userId, {
        accountStatus: 'APPROVED',
        status: 'pending',
        isActive: false,
        uniRepVerificationStatus: 'VERIFIED',
        activationTokenHash: tokenHash,
        activationTokenExpires: tokenExpires.toISOString(),
        activationTokenUsed: false,
      });

      emailResult = await emailService.sendUniversityRepActivationEmail({
        to: application.representative?.officialEmail || repUser.email,
        representativeName: application.representative?.fullName || repUser.name,
        universityName: application.university?.name || 'Verified University',
        applicationId: application.applicationId,
        activationToken: rawActivationToken,
      });
    }

    await recordAuditLog({
      req,
      action: 'APPROVED_UNI_REP',
      module: 'university-reps',
      targetType: 'UniversityRepresentativeApplication',
      targetId: id,
      targetName: application.representative?.fullName,
      newValue: { status: 'APPROVED' },
    });

    return res.status(200).json({
      success: true,
      message: 'University Representative application approved. Activation link dispatched.',
      data: {
        application,
        activationToken: rawActivationToken,
        activationUrl: emailResult?.activationUrl || null,
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

    if (mongoose.connection.readyState === 1) {
      if (mongoose.Types.ObjectId.isValid(id)) application = await UniversityRepresentativeApplication.findById(id);
      if (!application) application = await UniversityRepresentativeApplication.findOne({ applicationId: id.toUpperCase() });

      if (!application) return res.status(404).json({ success: false, message: 'Application not found.' });

      application.status = 'REJECTED';
      application.reviewedAt = now;
      application.reviewedBy = req.user._id;
      application.rejectionReason = rejectionReason.trim();
      if (adminNotes) application.adminNotes = adminNotes;

      if (!Array.isArray(application.statusHistory)) application.statusHistory = [];
      application.statusHistory.push({
        status: 'REJECTED',
        changedAt: now,
        changedBy: req.user._id,
        note: `Rejected: ${rejectionReason.trim()}`,
      });

      await application.save();

      await User.findByIdAndUpdate(application.user, {
        accountStatus: 'REJECTED',
        uniRepVerificationStatus: 'REJECTED',
        status: 'pending',
        isActive: false,
      });
    } else {
      application = await devStore.findUniRepApplicationById(id);
      if (!application) application = await devStore.findUniRepApplicationByAppId(id);
      if (!application) return res.status(404).json({ success: false, message: 'Application not found.' });

      const userId = application.user?._id || application.user;
      const history = Array.isArray(application.statusHistory) ? [...application.statusHistory] : [];
      history.push({
        status: 'REJECTED',
        changedAt: now.toISOString(),
        changedBy: req.user._id,
        note: `Rejected: ${rejectionReason.trim()}`,
      });

      application = await devStore.updateUniRepApplication(application._id, {
        status: 'REJECTED',
        reviewedAt: now.toISOString(),
        reviewedBy: req.user._id,
        rejectionReason: rejectionReason.trim(),
        adminNotes: adminNotes || '',
        statusHistory: history,
      });

      await devStore.updateUser(userId, {
        accountStatus: 'REJECTED',
        uniRepVerificationStatus: 'REJECTED',
        status: 'pending',
        isActive: false,
      });
    }

    await recordAuditLog({
      req,
      action: 'REJECTED_UNI_REP',
      module: 'university-reps',
      targetType: 'UniversityRepresentativeApplication',
      targetId: id,
      targetName: application.representative?.fullName,
      newValue: { status: 'REJECTED' },
      reason: rejectionReason,
    });

    return res.status(200).json({
      success: true,
      message: 'University Representative application rejected.',
      data: { application },
    });
  } catch (error) {
    next(error);
  }
};
