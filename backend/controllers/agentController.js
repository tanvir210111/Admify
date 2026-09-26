import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Application from '../models/Application.js';
import AgentApplication from '../models/AgentApplication.js';
import AgencyProfile from '../models/AgencyProfile.js';
import AgencyServiceOrder from '../models/AgencyServiceOrder.js';
import University from '../models/University.js';
import UniversityAgencyConnection from '../models/UniversityAgencyConnection.js';
import Notification from '../models/Notification.js';
import ChatMessage from '../models/ChatMessage.js';
import Report from '../models/Report.js';
import Task from '../models/Task.js';
import AuditLog from '../models/AuditLog.js';
import devStore from '../utils/devStore.js';

// ── Helper: Audit Logging for Agent Actions ──────────────────────────────────
const recordAgentAuditLog = async ({
  req,
  action,
  module = 'agent',
  targetType = 'Agent',
  targetId = 'N/A',
  targetName = '',
  previousValue = null,
  newValue = null,
  reason = 'Action performed via Agent Portal',
}) => {
  try {
    const logData = {
      adminId: req.user._id,
      adminName: req.user.name,
      adminEmail: req.user.email,
      action: `AGENT_${action}`,
      module,
      targetType,
      targetId: targetId ? targetId.toString() : 'N/A',
      targetName: targetName || '',
      previousValue: previousValue || null,
      newValue: newValue || null,
      reason,
      ip: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'AgentPortal',
    };

    if (mongoose.connection.readyState === 1) {
      await AuditLog.create(logData);
    } else {
      if (typeof devStore.createAuditLog === 'function') {
        await devStore.createAuditLog(logData);
      } else if (typeof devStore.addAuditLog === 'function') {
        await devStore.addAuditLog(logData);
      }
    }
  } catch (err) {
    console.warn('[Audit Log Warning] Failed to save agent audit record:', err.message);
  }
};

// ── 1. Agent Dashboard ────────────────────────────────────────────────────────
// @desc    Get real operational statistics and recent pipeline for the logged-in agent
// @route   GET /api/agent/dashboard
// @access  Private (Agent)
export const getAgentDashboard = async (req, res, next) => {
  try {
    const agentIdStr = req.user._id.toString();
    const agencyIdStr = req.user.agencyId ? req.user.agencyId.toString() : null;

    let applications = [];
    let serviceOrders = [];
    let tasks = [];
    let notifications = [];
    let messages = [];

    if (mongoose.connection.readyState === 1) {
      // Find applications assigned to this agent
      applications = await Application.find({ assignedAgent: req.user._id })
        .populate('user', 'name email phone targetCountry gpa ielts')
        .sort({ updatedAt: -1 });

      // Find service orders where this agent is assigned
      if (agencyIdStr) {
        serviceOrders = await AgencyServiceOrder.find({
          'assignedAgency.agencyId': agencyIdStr,
          $or: [
            { 'assignedAgency.agentName': req.user.name },
            { 'assignedAgency.agentId': agentIdStr },
          ],
        }).populate('user', 'name email phone');
      }

      tasks = await Task.find({ agent: req.user._id }).sort({ dueDate: 1 });
      notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
      messages = await ChatMessage.find({
        $or: [{ user: req.user._id }, { receiver: req.user._id }],
      }).sort({ createdAt: -1 });
    } else {
      const db = devStore.read();
      applications = (db.applications || []).filter(
        (a) => a.assignedAgent?.toString() === agentIdStr
      );
      for (const app of applications) {
        if (!app.user?.name && app.user) {
          app.user = (db.users || []).find((u) => u._id === app.user.toString()) || app.user;
        }
      }

      if (agencyIdStr) {
        serviceOrders = (db.agencyServiceOrders || []).filter(
          (o) =>
            o.assignedAgency?.agencyId?.toString() === agencyIdStr &&
            (o.assignedAgency?.agentName === req.user.name || o.assignedAgency?.agentId?.toString() === agentIdStr)
        );
        for (const ord of serviceOrders) {
          if (!ord.user?.name && ord.user) {
            ord.user = (db.users || []).find((u) => u._id === ord.user.toString()) || ord.user;
          }
        }
      }

      tasks = (db.tasks || []).filter((t) => t.agent?.toString() === agentIdStr);
      notifications = (db.notifications || []).filter((n) => n.user?.toString() === agentIdStr);
      messages = (db.chatMessages || []).filter(
        (m) => m.user?.toString() === agentIdStr || m.receiver?.toString() === agentIdStr
      );
    }

    // Unique assigned students
    const studentIdSet = new Set([
      ...applications.map((a) => (a.user?._id || a.user)?.toString()).filter(Boolean),
      ...serviceOrders.map((o) => (o.user?._id || o.user)?.toString()).filter(Boolean),
    ]);

    const assignedStudents = studentIdSet.size;
    const activeApplications = applications.filter((a) => a.stage !== 'Completed' && a.stage !== 'Rejected').length;
    const pendingApplications = applications.filter((a) => ['Submitted', 'Documents Pending', 'In Review'].includes(a.stage)).length;
    const documentsPending = applications.filter((a) => a.stage === 'Documents Pending').length;
    const applicationsSubmitted = applications.filter((a) => a.stage === 'Submitted').length;
    const offersReceived = applications.filter((a) => a.stage === 'Accepted').length;
    const pendingTasks = tasks.filter((t) => t.status === 'PENDING' || t.status === 'IN_PROGRESS').length;

    // Upcoming deadlines in next 14 days
    const now = new Date();
    const twoWeeks = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    const upcomingDeadlinesList = tasks.filter((t) => t.dueDate && new Date(t.dueDate) >= now && new Date(t.dueDate) <= twoWeeks);
    const upcomingDeadlines = upcomingDeadlinesList.length;

    // Unread count
    const unreadNotifications = notifications.filter((n) => !n.read).length;

    return res.status(200).json({
      success: true,
      data: {
        stats: {
          assignedStudents,
          activeApplications,
          pendingApplications,
          documentsPending,
          applicationsSubmitted,
          offersReceived,
          pendingTasks,
          upcomingDeadlines,
          unreadNotifications,
        },
        recentApplications: applications.slice(0, 5),
        recentTasks: tasks.slice(0, 5),
        upcomingDeadlines: upcomingDeadlinesList.slice(0, 5),
        recentNotifications: notifications.slice(0, 5),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── 2. My Students ───────────────────────────────────────────────────────────
// @desc    Get only students assigned to this agent (Strictly excludes wallet/credit data)
// @route   GET /api/agent/students
// @access  Private (Agent)
export const getAgentStudents = async (req, res, next) => {
  try {
    const agentIdStr = req.user._id.toString();
    const agencyIdStr = req.user.agencyId ? req.user.agencyId.toString() : null;
    const { search = '' } = req.query;

    let applications = [];
    let serviceOrders = [];
    let students = [];

    if (mongoose.connection.readyState === 1) {
      applications = await Application.find({ assignedAgent: req.user._id });
      if (agencyIdStr) {
        serviceOrders = await AgencyServiceOrder.find({
          'assignedAgency.agencyId': agencyIdStr,
          $or: [
            { 'assignedAgency.agentName': req.user.name },
            { 'assignedAgency.agentId': agentIdStr },
          ],
        });
      }

      const studentIds = Array.from(new Set([
        ...applications.map((a) => a.user?.toString()).filter(Boolean),
        ...serviceOrders.map((o) => o.user?.toString()).filter(Boolean),
      ]));

      const query = { _id: { $in: studentIds }, role: 'student' };
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { targetCountry: { $regex: search, $options: 'i' } },
        ];
      }

      // STRICT PRIVACY: NEVER SELECT walletCredits, paidCredits, freeCredits, or private financial records
      students = await User.find(query).select(
        'name email phone targetCountry targetCourse gpa ielts bio createdAt avatar'
      );
    } else {
      const db = devStore.read();
      applications = (db.applications || []).filter((a) => a.assignedAgent?.toString() === agentIdStr);
      if (agencyIdStr) {
        serviceOrders = (db.agencyServiceOrders || []).filter(
          (o) =>
            o.assignedAgency?.agencyId?.toString() === agencyIdStr &&
            (o.assignedAgency?.agentName === req.user.name || o.assignedAgency?.agentId?.toString() === agentIdStr)
        );
      }

      const studentIds = new Set([
        ...applications.map((a) => a.user?.toString()).filter(Boolean),
        ...serviceOrders.map((o) => o.user?.toString()).filter(Boolean),
      ]);

      students = (db.users || [])
        .filter((u) => studentIds.has(u._id) && u.role === 'student')
        .map((u) => ({
          _id: u._id,
          name: u.name,
          email: u.email,
          phone: u.phone,
          targetCountry: u.targetCountry || '',
          targetCourse: u.targetCourse || '',
          gpa: u.gpa || '',
          ielts: u.ielts || '',
          bio: u.bio || '',
          createdAt: u.createdAt,
          avatar: u.avatar || '',
        }));

      if (search) {
        const q = search.toLowerCase();
        students = students.filter(
          (s) =>
            s.name?.toLowerCase().includes(q) ||
            s.email?.toLowerCase().includes(q) ||
            s.targetCountry?.toLowerCase().includes(q)
        );
      }
    }

    const enriched = students.map((s) => {
      const sId = s._id.toString();
      const app = applications.find((a) => (a.user?._id || a.user)?.toString() === sId);
      const srv = serviceOrders.find((o) => (o.user?._id || o.user)?.toString() === sId);
      return {
        ...(s.toObject ? s.toObject() : s),
        activeApplication: app || null,
        activeService: srv || null,
      };
    });

    return res.status(200).json({
      success: true,
      count: enriched.length,
      data: { students: enriched },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single assigned student profile (Strictly authorized)
// @route   GET /api/agent/students/:id
// @access  Private (Agent)
export const getAgentStudentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const agentIdStr = req.user._id.toString();

    // Verify assignment
    let isAssigned = false;
    if (mongoose.connection.readyState === 1) {
      const app = await Application.findOne({ user: id, assignedAgent: req.user._id });
      if (app) isAssigned = true;
      if (!isAssigned && req.user.agencyId) {
        const ord = await AgencyServiceOrder.findOne({
          user: id,
          'assignedAgency.agencyId': req.user.agencyId.toString(),
          $or: [
            { 'assignedAgency.agentName': req.user.name },
            { 'assignedAgency.agentId': agentIdStr },
          ],
        });
        if (ord) isAssigned = true;
      }
    } else {
      const db = devStore.read();
      const app = (db.applications || []).find((a) => a.user?.toString() === id && a.assignedAgent?.toString() === agentIdStr);
      if (app) isAssigned = true;
      if (!isAssigned && req.user.agencyId) {
        const ord = (db.agencyServiceOrders || []).find(
          (o) =>
            o.user?.toString() === id &&
            o.assignedAgency?.agencyId?.toString() === req.user.agencyId.toString() &&
            (o.assignedAgency?.agentName === req.user.name || o.assignedAgency?.agentId?.toString() === agentIdStr)
        );
        if (ord) isAssigned = true;
      }
    }

    if (!isAssigned) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This student is not assigned to your counselor caseload.',
      });
    }

    let student = null;
    if (mongoose.connection.readyState === 1) {
      student = await User.findById(id).select('name email phone targetCountry targetCourse gpa ielts bio createdAt avatar');
    } else {
      student = await devStore.findUserById(id);
      if (student) {
        const copy = { ...student };
        delete copy.password;
        delete copy.walletCredits;
        delete copy.paidCredits;
        delete copy.freeCredits;
        student = copy;
      }
    }

    return res.status(200).json({
      success: true,
      data: { student },
    });
  } catch (error) {
    next(error);
  }
};

// ── 3. Application Management ────────────────────────────────────────────────
// @desc    Get applications assigned to this agent
// @route   GET /api/agent/applications
// @access  Private (Agent)
export const getAgentApplications = async (req, res, next) => {
  try {
    const agentIdStr = req.user._id.toString();
    const { stage, search } = req.query;

    let applications = [];

    if (mongoose.connection.readyState === 1) {
      const query = { assignedAgent: req.user._id };
      if (stage && stage !== 'all') query.stage = stage;

      applications = await Application.find(query)
        .populate('user', 'name email phone targetCountry gpa ielts')
        .sort({ updatedAt: -1 });

      if (search) {
        const q = search.toLowerCase();
        applications = applications.filter(
          (a) =>
            a.university?.toLowerCase().includes(q) ||
            a.program?.toLowerCase().includes(q) ||
            a.user?.name?.toLowerCase().includes(q)
        );
      }
    } else {
      const db = devStore.read();
      applications = (db.applications || []).filter(
        (a) => a.assignedAgent?.toString() === agentIdStr
      );
      if (stage && stage !== 'all') {
        applications = applications.filter((a) => a.stage?.toLowerCase() === stage.toLowerCase());
      }
      for (const app of applications) {
        if (!app.user?.name && app.user) {
          app.user = (db.users || []).find((u) => u._id === app.user.toString()) || app.user;
        }
      }
      if (search) {
        const q = search.toLowerCase();
        applications = applications.filter(
          (a) =>
            a.university?.toLowerCase().includes(q) ||
            a.program?.toLowerCase().includes(q) ||
            a.user?.name?.toLowerCase().includes(q)
        );
      }
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

// @desc    Update progress, stage, or step notes for an assigned application
// @route   PUT /api/agent/applications/:id
// @access  Private (Agent)
export const updateAgentApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { stage, progress, notes, stepLabel } = req.body;
    const agentIdStr = req.user._id.toString();

    let application = null;

    if (mongoose.connection.readyState === 1) {
      application = await Application.findOne({ _id: id, assignedAgent: req.user._id });
      if (!application) {
        return res.status(404).json({ success: false, message: 'Application not found or unauthorized.' });
      }

      if (stage) application.stage = stage;
      if (progress !== undefined) application.progress = Number(progress);
      if (notes) application.notes = notes;

      if (stepLabel) {
        if (!Array.isArray(application.steps)) application.steps = [];
        application.steps.push({
          label: stepLabel,
          date: new Date().toLocaleDateString(),
          status: 'completed',
        });
      }

      await application.save();
    } else {
      application = await devStore.findApplicationById(id);
      if (!application || application.assignedAgent?.toString() !== agentIdStr) {
        return res.status(404).json({ success: false, message: 'Application not found or unauthorized.' });
      }

      const updates = {};
      if (stage) updates.stage = stage;
      if (progress !== undefined) updates.progress = Number(progress);
      if (notes) updates.notes = notes;
      if (stepLabel) {
        const steps = Array.isArray(application.steps) ? [...application.steps] : [];
        steps.push({ label: stepLabel, date: new Date().toLocaleDateString(), status: 'completed' });
        updates.steps = steps;
      }

      application = await devStore.updateApplication(id, updates);
    }

    await recordAgentAuditLog({
      req,
      action: 'UPDATE_APPLICATION',
      module: 'applications',
      targetType: 'Application',
      targetId: id,
      targetName: `${application.university} - ${application.program}`,
      newValue: { stage: application.stage, progress: application.progress },
      reason: notes || 'Agent updated application progress',
    });

    return res.status(200).json({
      success: true,
      message: 'Application progress updated successfully.',
      data: { application },
    });
  } catch (error) {
    next(error);
  }
};

// ── 4. Document Management ───────────────────────────────────────────────────
// @desc    Get documents for students/applications assigned to this agent
// @route   GET /api/agent/documents
// @access  Private (Agent)
export const getAgentDocuments = async (req, res, next) => {
  try {
    const agentIdStr = req.user._id.toString();
    let applications = [];

    if (mongoose.connection.readyState === 1) {
      applications = await Application.find({ assignedAgent: req.user._id })
        .populate('user', 'name email')
        .select('university program documents user');
    } else {
      const db = devStore.read();
      applications = (db.applications || []).filter((a) => a.assignedAgent?.toString() === agentIdStr);
      for (const app of applications) {
        if (!app.user?.name && app.user) {
          app.user = (db.users || []).find((u) => u._id === app.user.toString()) || app.user;
        }
      }
    }

    const docs = [];
    applications.forEach((a) => {
      if (Array.isArray(a.documents)) {
        a.documents.forEach((d, idx) => {
          docs.push({
            id: `${a._id}-${idx}`,
            applicationId: a._id,
            university: a.university,
            program: a.program,
            studentName: a.user?.name || 'Student',
            studentEmail: a.user?.email,
            name: d.name || 'Document',
            type: d.type || 'Supporting Document',
            fileUrl: d.fileUrl || '',
            status: d.status || 'PENDING',
            uploadedAt: d.uploadedAt || a.createdAt,
          });
        });
      }
    });

    return res.status(200).json({
      success: true,
      count: docs.length,
      data: { documents: docs },
    });
  } catch (error) {
    next(error);
  }
};

// ── 5. SOP / LOR Assistance ──────────────────────────────────────────────────
// @desc    Get SOP / LOR drafts for assigned applications
// @route   GET /api/agent/sop-lor
// @access  Private (Agent)
export const getAgentSopLor = async (req, res, next) => {
  try {
    const agentIdStr = req.user._id.toString();
    let applications = [];

    if (mongoose.connection.readyState === 1) {
      applications = await Application.find({ assignedAgent: req.user._id })
        .populate('user', 'name email targetCountry')
        .select('university program sopDraft lorDraft user createdAt');
    } else {
      const db = devStore.read();
      applications = (db.applications || []).filter((a) => a.assignedAgent?.toString() === agentIdStr);
      for (const app of applications) {
        if (!app.user?.name && app.user) {
          app.user = (db.users || []).find((u) => u._id === app.user.toString()) || app.user;
        }
      }
    }

    const items = applications.map((a) => ({
      applicationId: a._id,
      university: a.university,
      program: a.program,
      studentName: a.user?.name || 'Student',
      studentEmail: a.user?.email,
      sop: a.sopDraft || { text: '', status: 'NOT_STARTED', comments: [] },
      lor: a.lorDraft || { text: '', status: 'NOT_STARTED', comments: [] },
    }));

    return res.status(200).json({
      success: true,
      count: items.length,
      data: { items },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add suggestion or review comments to SOP or LOR
// @route   PUT /api/agent/sop-lor/:id
// @access  Private (Agent)
export const updateAgentSopLor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { type, comment, status, revisedText } = req.body; // type: 'sop' | 'lor'
    const agentIdStr = req.user._id.toString();

    let app = null;

    if (mongoose.connection.readyState === 1) {
      app = await Application.findOne({ _id: id, assignedAgent: req.user._id });
      if (!app) return res.status(404).json({ success: false, message: 'Application not found or unauthorized.' });

      const field = type === 'lor' ? 'lorDraft' : 'sopDraft';
      if (!app[field]) app[field] = { text: '', status: 'IN_REVIEW', comments: [] };

      if (status) app[field].status = status;
      if (revisedText !== undefined) app[field].revisedText = revisedText;
      if (comment) {
        if (!Array.isArray(app[field].comments)) app[field].comments = [];
        app[field].comments.push({
          author: req.user.name,
          role: 'agent',
          comment: comment.trim(),
          createdAt: new Date(),
        });
      }

      await app.save();
    } else {
      app = await devStore.findApplicationById(id);
      if (!app || app.assignedAgent?.toString() !== agentIdStr) {
        return res.status(404).json({ success: false, message: 'Application not found or unauthorized.' });
      }

      const field = type === 'lor' ? 'lorDraft' : 'sopDraft';
      const existingDraft = app[field] || { text: '', status: 'IN_REVIEW', comments: [] };
      if (status) existingDraft.status = status;
      if (revisedText !== undefined) existingDraft.revisedText = revisedText;
      if (comment) {
        if (!Array.isArray(existingDraft.comments)) existingDraft.comments = [];
        existingDraft.comments.push({
          author: req.user.name,
          role: 'agent',
          comment: comment.trim(),
          createdAt: new Date().toISOString(),
        });
      }

      app = await devStore.updateApplication(id, { [field]: existingDraft });
    }

    return res.status(200).json({
      success: true,
      message: `${type?.toUpperCase() || 'SOP'} feedback recorded successfully.`,
      data: { application: app },
    });
  } catch (error) {
    next(error);
  }
};

// ── 6. Universities & Programs Directory ──────────────────────────────────────
// @desc    Get master university & program catalog for student counseling
// @route   GET /api/agent/universities
// @access  Private (Agent)
export const getAgentUniversities = async (req, res, next) => {
  try {
    const { search = '', country = '' } = req.query;
    let list = [];

    if (mongoose.connection.readyState === 1) {
      const q = {};
      if (country) q.country = country;
      if (search) {
        q.$or = [
          { name: { $regex: search, $options: 'i' } },
          { location: { $regex: search, $options: 'i' } },
        ];
      }
      list = await University.find(q).sort({ name: 1 });
    } else {
      const db = devStore.read();
      list = db.universities || [];
      if (country) list = list.filter((u) => u.country?.toLowerCase() === country.toLowerCase());
      if (search) {
        const s = search.toLowerCase();
        list = list.filter((u) => u.name?.toLowerCase().includes(s) || u.location?.toLowerCase().includes(s));
      }
    }

    return res.status(200).json({
      success: true,
      count: list.length,
      data: { universities: list },
    });
  } catch (error) {
    next(error);
  }
};

// ── 7. Messaging ─────────────────────────────────────────────────────────────
// @desc    Get communication threads for authorized students, agency, and uni reps
// @route   GET /api/agent/messages
// @access  Private (Agent)
export const getAgentMessages = async (req, res, next) => {
  try {
    const agentIdStr = req.user._id.toString();
    let messages = [];

    if (mongoose.connection.readyState === 1) {
      messages = await ChatMessage.find({
        $or: [{ user: req.user._id }, { receiver: req.user._id }],
      }).sort({ createdAt: 1 });
    } else {
      const db = devStore.read();
      messages = (db.chatMessages || []).filter(
        (m) => m.user?.toString() === agentIdStr || m.receiver?.toString() === agentIdStr
      );
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

// @desc    Send message from Agent to assigned student or agency
// @route   POST /api/agent/messages
// @access  Private (Agent)
export const sendAgentMessage = async (req, res, next) => {
  try {
    const { receiverId, text, sessionId } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Message text is required.' });
    }

    const payload = {
      user: req.user._id,
      sender: 'agent',
      receiver: receiverId || null,
      text: text.trim(),
      sessionId: sessionId || `SESSION-AGT-${req.user._id}-${Date.now()}`,
      createdAt: new Date(),
    };

    let newMsg = null;
    if (mongoose.connection.readyState === 1) {
      newMsg = await ChatMessage.create(payload);
    } else {
      newMsg = await devStore.addChatMessage(payload);
    }

    return res.status(201).json({
      success: true,
      data: { message: newMsg },
    });
  } catch (error) {
    next(error);
  }
};

// ── 8. Tasks & Deadlines ─────────────────────────────────────────────────────
// @desc    Get personal tasks and deadlines for this agent
// @route   GET /api/agent/tasks
// @access  Private (Agent)
export const getAgentTasks = async (req, res, next) => {
  try {
    const agentIdStr = req.user._id.toString();
    const { status } = req.query;

    let tasks = [];
    if (mongoose.connection.readyState === 1) {
      const q = { agent: req.user._id };
      if (status && status !== 'all') q.status = status;
      tasks = await Task.find(q)
        .populate('student', 'name email phone')
        .populate('application', 'university program')
        .sort({ dueDate: 1, createdAt: -1 });
    } else {
      tasks = await devStore.findTasks({ agent: req.user._id, status });
      const db = devStore.read();
      for (const t of tasks) {
        if (t.student && !t.student.name) {
          t.student = (db.users || []).find((u) => u._id === t.student.toString()) || t.student;
        }
        if (t.application && !t.application.university) {
          t.application = (db.applications || []).find((a) => a._id === t.application.toString()) || t.application;
        }
      }
    }

    return res.status(200).json({
      success: true,
      count: tasks.length,
      data: { tasks },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new personal task or deadline
// @route   POST /api/agent/tasks
// @access  Private (Agent)
export const createAgentTask = async (req, res, next) => {
  try {
    const { title, studentId, applicationId, dueDate, priority, notes } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Task title is required.' });
    }

    const payload = {
      title: title.trim(),
      agent: req.user._id,
      agency: req.user.agencyId || null,
      student: studentId || null,
      application: applicationId || null,
      dueDate: dueDate ? new Date(dueDate) : null,
      priority: priority || 'MEDIUM',
      status: 'PENDING',
      notes: notes || '',
    };

    let newTask = null;
    if (mongoose.connection.readyState === 1) {
      newTask = await Task.create(payload);
    } else {
      newTask = await devStore.createTask(payload);
    }

    await recordAgentAuditLog({
      req,
      action: 'CREATE_TASK',
      module: 'tasks',
      targetType: 'Task',
      targetId: newTask._id,
      targetName: newTask.title,
      reason: 'Agent scheduled new follow-up task',
    });

    return res.status(201).json({
      success: true,
      message: 'Task created successfully.',
      data: { task: newTask },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task status or details
// @route   PUT /api/agent/tasks/:id
// @access  Private (Agent)
export const updateAgentTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, title, dueDate, priority, notes } = req.body;
    const agentIdStr = req.user._id.toString();

    let task = null;
    if (mongoose.connection.readyState === 1) {
      task = await Task.findOne({ _id: id, agent: req.user._id });
      if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });

      if (status) task.status = status;
      if (title) task.title = title.trim();
      if (dueDate !== undefined) task.dueDate = dueDate ? new Date(dueDate) : null;
      if (priority) task.priority = priority;
      if (notes !== undefined) task.notes = notes;

      await task.save();
    } else {
      task = await devStore.findTaskById(id);
      if (!task || task.agent?.toString() !== agentIdStr) {
        return res.status(404).json({ success: false, message: 'Task not found.' });
      }

      const updates = {};
      if (status) updates.status = status;
      if (title) updates.title = title.trim();
      if (dueDate !== undefined) updates.dueDate = dueDate;
      if (priority) updates.priority = priority;
      if (notes !== undefined) updates.notes = notes;

      task = await devStore.updateTask(id, updates);
    }

    return res.status(200).json({
      success: true,
      message: 'Task updated successfully.',
      data: { task },
    });
  } catch (error) {
    next(error);
  }
};

// ── 9. Performance Analytics ─────────────────────────────────────────────────
// @desc    Get real aggregated performance metrics for the logged-in agent
// @route   GET /api/agent/performance
// @access  Private (Agent)
export const getAgentPerformance = async (req, res, next) => {
  try {
    const agentIdStr = req.user._id.toString();

    let applications = [];
    let tasks = [];

    if (mongoose.connection.readyState === 1) {
      applications = await Application.find({ assignedAgent: req.user._id });
      tasks = await Task.find({ agent: req.user._id });
    } else {
      const db = devStore.read();
      applications = (db.applications || []).filter((a) => a.assignedAgent?.toString() === agentIdStr);
      tasks = (db.tasks || []).filter((t) => t.agent?.toString() === agentIdStr);
    }

    const countryBreakdown = {};
    const stageBreakdown = {
      Submitted: 0,
      'Documents Pending': 0,
      'In Review': 0,
      Accepted: 0,
      Completed: 0,
      Rejected: 0,
    };

    applications.forEach((a) => {
      const c = a.country || 'Global';
      countryBreakdown[c] = (countryBreakdown[c] || 0) + 1;

      if (stageBreakdown[a.stage] !== undefined) {
        stageBreakdown[a.stage] += 1;
      }
    });

    const completedTasks = tasks.filter((t) => t.status === 'COMPLETED').length;
    const taskCompletionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
    const conversionRate = applications.length > 0 ? Math.round((stageBreakdown.Accepted / applications.length) * 100) : 0;

    return res.status(200).json({
      success: true,
      data: {
        totalApplications: applications.length,
        activeApplications: applications.filter((a) => a.stage !== 'Completed' && a.stage !== 'Rejected').length,
        offersReceived: stageBreakdown.Accepted,
        completedApplications: stageBreakdown.Completed,
        conversionRate,
        completedTasks,
        totalTasks: tasks.length,
        taskCompletionRate,
        countryBreakdown,
        stageBreakdown,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── 10. Notifications ────────────────────────────────────────────────────────
// @desc    Get notifications for agent
// @route   GET /api/agent/notifications
// @access  Private (Agent)
export const getAgentNotifications = async (req, res, next) => {
  try {
    let notifications = [];
    if (mongoose.connection.readyState === 1) {
      notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
    } else {
      const db = devStore.read();
      notifications = (db.notifications || []).filter((n) => n.user?.toString() === req.user._id.toString());
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

// @desc    Mark agent notification as read
// @route   PUT /api/agent/notifications/:id/read
// @access  Private (Agent)
export const markAgentNotificationRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (mongoose.connection.readyState === 1) {
      await Notification.findOneAndUpdate({ _id: id, user: req.user._id }, { read: true });
    } else {
      const db = devStore.read();
      const n = (db.notifications || []).find((x) => x._id === id && x.user?.toString() === req.user._id.toString());
      if (n) {
        n.read = true;
        devStore.write(db);
      }
    }

    return res.status(200).json({ success: true, message: 'Notification marked as read.' });
  } catch (error) {
    next(error);
  }
};

// ── 11. Reports & Operational Issues ──────────────────────────────────────────
// @desc    Get reports filed by this agent
// @route   GET /api/agent/reports
// @access  Private (Agent)
export const getAgentReports = async (req, res, next) => {
  try {
    const agentIdStr = req.user._id.toString();
    let reports = [];

    if (mongoose.connection.readyState === 1) {
      reports = await Report.find({ reportedBy: req.user._id }).sort({ createdAt: -1 });
    } else {
      const db = devStore.read();
      reports = (db.reports || []).filter((r) => r.reportedBy?.toString() === agentIdStr);
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

// @desc    Submit a new operational issue / report
// @route   POST /api/agent/reports
// @access  Private (Agent)
export const createAgentReport = async (req, res, next) => {
  try {
    const { reason, details, targetType, targetId } = req.body;
    if (!reason || !reason.trim()) {
      return res.status(400).json({ success: false, message: 'Report reason is required.' });
    }

    const payload = {
      reportedBy: req.user._id,
      reporterName: req.user.name,
      reporterRole: 'agent',
      targetType: targetType || 'operational_issue',
      targetId: targetId || req.user.agencyId?.toString() || 'agency',
      reason: reason.trim(),
      details: details ? details.trim() : '',
      status: 'OPEN',
      createdAt: new Date(),
    };

    let report = null;
    if (mongoose.connection.readyState === 1) {
      report = await Report.create(payload);
    } else {
      const db = devStore.read();
      if (!Array.isArray(db.reports)) db.reports = [];
      report = {
        _id: new mongoose.Types.ObjectId().toString(),
        ...payload,
        createdAt: new Date().toISOString(),
      };
      db.reports.unshift(report);
      devStore.write(db);
    }

    await recordAgentAuditLog({
      req,
      action: 'FILE_REPORT',
      module: 'reports',
      targetType: 'Report',
      targetId: report._id,
      targetName: report.reason,
      reason: details || 'Agent reported operational issue',
    });

    return res.status(201).json({
      success: true,
      message: 'Issue report submitted successfully for Admin review.',
      data: { report },
    });
  } catch (error) {
    next(error);
  }
};

// ── 12. My Agency ────────────────────────────────────────────────────────────
// @desc    Get details of the Agency this agent belongs to
// @route   GET /api/agent/agency
// @access  Private (Agent)
export const getAgentAgency = async (req, res, next) => {
  try {
    if (!req.user.agencyId) {
      return res.status(400).json({ success: false, message: 'No agency linked to your agent profile.' });
    }

    let agency = null;
    let agencyProfile = null;

    if (mongoose.connection.readyState === 1) {
      agency = await User.findById(req.user.agencyId).select('name email phone accountStatus agencyVerificationStatus createdAt');
      agencyProfile = await AgencyProfile.findOne({ user: req.user.agencyId });
    } else {
      agency = await devStore.findUserById(req.user.agencyId);
      agencyProfile = await devStore.findAgencyProfileByUserId(req.user.agencyId);
    }

    return res.status(200).json({
      success: true,
      data: {
        agency: {
          _id: agency?._id || req.user.agencyId,
          name: agency?.name || 'Affiliated Agency',
          email: agency?.email,
          phone: agency?.phone,
          accountStatus: agency?.accountStatus || 'ACTIVE',
          verificationStatus: agency?.agencyVerificationStatus || 'VERIFIED',
          profile: agencyProfile,
        },
        myStatus: {
          designation: req.user.designation || 'Educational Counselor',
          agentApplicationId: req.user.agentApplicationId,
          status: req.user.status || 'active',
          joinedAt: req.user.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── 13. My Profile ───────────────────────────────────────────────────────────
// @desc    Get Agent personal & counselor profile
// @route   GET /api/agent/profile
// @access  Private (Agent)
export const getAgentProfile = async (req, res, next) => {
  try {
    let currentUser = req.user;
    if (mongoose.connection.readyState === 1) {
      currentUser = await User.findById(req.user._id) || req.user;
    } else {
      currentUser = (await devStore.findUserById(req.user._id)) || req.user;
    }

    return res.status(200).json({
      success: true,
      data: {
        user: {
          _id: currentUser._id,
          name: currentUser.name,
          email: currentUser.email,
          phone: currentUser.phone,
          role: currentUser.role,
          status: currentUser.status,
          accountStatus: currentUser.accountStatus,
          agencyId: currentUser.agencyId,
          agentApplicationId: currentUser.agentApplicationId,
          designation: currentUser.designation,
          department: currentUser.department,
          dateOfBirth: currentUser.dateOfBirth,
          gender: currentUser.gender,
          country: currentUser.country,
          city: currentUser.city,
          address: currentUser.address,
          academicScope: currentUser.academicScope,
          professional: currentUser.professional,
          documents: currentUser.documents,
          avatar: currentUser.avatar,
          createdAt: currentUser.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update permitted agent profile fields
// @route   PUT /api/agent/profile
// @access  Private (Agent)
export const updateAgentProfile = async (req, res, next) => {
  try {
    // STRICT SECURITY: AGENT CANNOT CHANGE role, agencyId, agentApplicationId, accountStatus, walletCredits
    const {
      designation,
      phone,
      dateOfBirth,
      gender,
      country,
      city,
      address,
      academicScope,
      professional,
      avatar,
    } = req.body;

    const updates = {};
    if (designation) updates.designation = designation.trim();
    if (phone) updates.phone = phone.trim();
    if (dateOfBirth) updates.dateOfBirth = dateOfBirth;
    if (gender) updates.gender = gender;
    if (country) updates.country = country.trim();
    if (city) updates.city = city.trim();
    if (address) updates.address = address.trim();
    if (academicScope) updates.academicScope = academicScope;
    if (professional) updates.professional = professional;
    if (avatar) updates.avatar = avatar;

    let updatedUser = null;
    if (mongoose.connection.readyState === 1) {
      updatedUser = await User.findByIdAndUpdate(req.user._id, { $set: updates }, { new: true });
    } else {
      updatedUser = await devStore.updateUser(req.user._id, updates);
    }

    await recordAgentAuditLog({
      req,
      action: 'UPDATE_PROFILE',
      module: 'agent',
      targetType: 'User',
      targetId: req.user._id,
      newValue: updates,
      reason: 'Agent updated counselor profile',
    });

    return res.status(200).json({
      success: true,
      message: 'Counselor profile updated successfully.',
      data: { user: updatedUser },
    });
  } catch (error) {
    next(error);
  }
};

// ── 14. Settings ─────────────────────────────────────────────────────────────
// @desc    Update Agent account password and preferences
// @route   PUT /api/agent/settings
// @access  Private (Agent)
export const updateAgentSettings = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, phone } = req.body;

    if (newPassword) {
      if (newPassword.length < 6) {
        return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
      }

      if (mongoose.connection.readyState === 1) {
        const user = await User.findById(req.user._id).select('+password');
        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
          return res.status(400).json({ success: false, message: 'Current password does not match.' });
        }
        user.password = newPassword;
        if (phone) user.phone = phone.trim();
        await user.save();
      } else {
        const user = await devStore.findUserById(req.user._id);
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
          return res.status(400).json({ success: false, message: 'Current password does not match.' });
        }
        user.password = await bcrypt.hash(newPassword, 10);
        if (phone) user.phone = phone.trim();
        const db = devStore.read();
        const idx = db.users.findIndex((u) => u._id === user._id);
        if (idx !== -1) db.users[idx] = user;
        devStore.write(db);
      }
    } else if (phone) {
      if (mongoose.connection.readyState === 1) {
        await User.findByIdAndUpdate(req.user._id, { phone: phone.trim() });
      } else {
        const user = await devStore.findUserById(req.user._id);
        user.phone = phone.trim();
        const db = devStore.read();
        const idx = db.users.findIndex((u) => u._id === user._id);
        if (idx !== -1) db.users[idx] = user;
        devStore.write(db);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Agent security settings saved successfully.',
    });
  } catch (error) {
    next(error);
  }
};
