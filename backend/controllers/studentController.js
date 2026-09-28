import mongoose from 'mongoose';
import Application from '../models/Application.js';
import AgencyServiceOrder from '../models/AgencyServiceOrder.js';
import ChatMessage from '../models/ChatMessage.js';
import Report from '../models/Report.js';
import Notification from '../models/Notification.js';
import StudentSeenItem from '../models/StudentSeenItem.js';
import devStore from '../utils/devStore.js';

// Helper to determine if an entity document is seen for a student
export const isStudentDocSeen = (entityType, doc, seenItems = []) => {
  if (!doc) return true;
  if (doc.isSeenByStudent === true) return true;

  const docId = (doc._id || doc.id || doc.applicationId || doc.orderId || doc.reportId)?.toString();
  if (!docId) return true;

  if (Array.isArray(seenItems)) {
    return seenItems.some(
      (item) => item.entityType === entityType && item.entityId === docId
    );
  }

  if (seenItems instanceof Map) {
    return seenItems.has(`${entityType}:${docId}`) || seenItems.has(docId);
  }

  return false;
};

// Helper to mark a student entity as seen with automatic notification sync
export const markStudentEntityAsSeenHelper = async (studentId, entityType, entityId) => {
  if (!studentId || !entityType || !entityId) return false;
  const idStr = entityId.toString();
  const uidStr = studentId.toString();
  const now = new Date();

  if (mongoose.connection.readyState === 1) {
    // 1. Record in persistent StudentSeenItem
    try {
      await StudentSeenItem.findOneAndUpdate(
        { user: studentId, entityType, entityId: idStr },
        { user: studentId, entityType, entityId: idStr, seenAt: now },
        { upsert: true, new: true }
      );
    } catch (err) {
      console.warn('[StudentSeen] Error saving seen item:', err.message);
    }

    // 2. Update target document directly
    if (['application', 'applications', 'direct_application', 'directApplications'].includes(entityType)) {
      await Application.updateOne(
        { _id: entityId, user: studentId },
        { isSeenByStudent: true, studentSeenAt: now }
      );
    } else if (['agency_order', 'agency_service_order', 'agencyAssistance'].includes(entityType)) {
      await AgencyServiceOrder.updateOne(
        { $or: [{ _id: entityId }, { orderId: entityId }], user: studentId },
        { isSeenByStudent: true, studentSeenAt: now }
      );
    } else if (['chat_message', 'message', 'messages', 'support'].includes(entityType)) {
      await ChatMessage.updateMany(
        { $or: [{ sessionId: entityId }, { _id: entityId }], user: studentId },
        { isSeenByStudent: true, studentSeenAt: now }
      );
    } else if (['report', 'reports'].includes(entityType)) {
      await Report.updateOne(
        { $or: [{ _id: entityId }, { reportId: entityId }], reportedBy: studentId },
        { isSeenByStudent: true, studentSeenAt: now }
      );
    }

    // 3. Automatically synchronize any related unread notification for this student
    await Notification.updateMany(
      {
        user: studentId,
        read: false,
        $or: [
          { relatedEntityId: idStr },
          { relatedEntityType: entityType, link: { $regex: idStr } },
        ],
      },
      { read: true }
    );

    return true;
  } else {
    return devStore.markStudentEntitySeen(studentId, entityType, entityId);
  }
};

// Calculate all unseen counts and status breakdowns for the authenticated student
export const calculateStudentUnseenCounts = async (studentId) => {
  const uidStr = studentId.toString();
  const seenMap = new Map();

  let allApplications = [];
  let allAgencyOrders = [];
  let allMessages = [];
  let allReports = [];
  let unreadNotificationsList = [];

  if (mongoose.connection.readyState === 1) {
    const seenItems = await StudentSeenItem.find({ user: studentId }).lean();
    for (const item of seenItems) {
      seenMap.set(`${item.entityType}:${item.entityId}`, true);
      seenMap.set(item.entityId, true);
    }

    [
      allApplications,
      allAgencyOrders,
      allMessages,
      allReports,
      unreadNotificationsList,
    ] = await Promise.all([
      Application.find({ user: studentId }).lean(),
      AgencyServiceOrder.find({ user: studentId }).lean(),
      ChatMessage.find({ user: studentId, sender: { $ne: 'user' } }).lean(),
      Report.find({ reportedBy: studentId }).lean(),
      Notification.find({ user: studentId, read: false }).lean(),
    ]);
  } else {
    const db = devStore.read();
    const seenList = (db.studentSeenItems || []).filter(
      (item) => item.user === uidStr
    );
    for (const item of seenList) {
      seenMap.set(`${item.entityType}:${item.entityId}`, true);
      seenMap.set(item.entityId, true);
    }

    allApplications = (db.applications || []).filter(
      (a) => a.user?.toString() === uidStr
    );
    allAgencyOrders = (db.agencyServiceOrders || []).filter(
      (o) => o.user?.toString() === uidStr
    );
    allMessages = (db.chatMessages || []).filter(
      (m) => (m.user?.toString() === uidStr || !m.user) && m.sender !== 'user'
    );
    allReports = (db.reports || []).filter(
      (r) => r.reportedBy?.toString() === uidStr
    );
    unreadNotificationsList = (db.notifications || []).filter(
      (n) => (n.user || n.userId)?.toString() === uidStr && !n.read
    );
  }

  // 1. Applications & Direct Applications
  const unseenApplications = allApplications.filter(
    (a) => !isStudentDocSeen('application', a, seenMap)
  );

  const directApplicationsUnseen = unseenApplications.filter(
    (a) => a.applicationType !== 'agency'
  ).length;

  const applicationsUnseen = unseenApplications.length;

  // 2. Agency Assistance
  const unseenAgencyOrders = allAgencyOrders.filter(
    (o) => !isStudentDocSeen('agency_order', o, seenMap)
  );
  const agencyAssistanceUnseen = unseenAgencyOrders.length;

  // 3. Messages (incoming from agent or support)
  const unseenMessages = allMessages.filter(
    (m) => !isStudentDocSeen('message', m, seenMap)
  );
  // Group by session if preferred, or count distinct sessions with unseen messages
  const unseenMessageSessions = new Set(unseenMessages.map((m) => m.sessionId || m._id)).size;
  const messagesUnseen = unseenMessageSessions;

  // 4. Documents (applications that have document updates or pending requests)
  const documentsUnseen = unseenApplications.filter(
    (a) => a.stage === 'Documents Pending' || (a.documents && a.documents.some((d) => !d.verified))
  ).length;

  // 5. Reports & Complaints (resolved or responded reports that student hasn't seen)
  const unseenReports = allReports.filter((r) => {
    const hasUpdate = r.status && r.status !== 'PENDING';
    const isSeen = isStudentDocSeen('report', r, seenMap);
    return hasUpdate && !isSeen;
  });
  const reportsUnseen = unseenReports.length;

  // 6. Notifications
  const notificationsUnread = unreadNotificationsList.length;

  // 7. Status breakdowns for applications
  const statusCounts = {
    applications: {
      all: unseenApplications.length,
      direct: unseenApplications.filter((a) => a.applicationType !== 'agency').length,
      agency: unseenApplications.filter((a) => a.applicationType === 'agency').length,
      Submitted: unseenApplications.filter((a) => a.stage === 'Submitted').length,
      'Documents Pending': unseenApplications.filter((a) => a.stage === 'Documents Pending').length,
      'In Review': unseenApplications.filter((a) => a.stage === 'In Review').length,
      Accepted: unseenApplications.filter((a) => a.stage === 'Accepted').length,
      'Visa Processing': unseenApplications.filter((a) => a.stage === 'Visa Processing').length,
      Enrolled: unseenApplications.filter((a) => a.stage === 'Enrolled').length,
      Rejected: unseenApplications.filter((a) => a.stage === 'Rejected').length,
    },
    notifications: {
      all: notificationsUnread,
      unread: notificationsUnread,
      agency: unreadNotificationsList.filter(
        (n) => n.type === 'agency' || n.relatedEntityType === 'agency' || n.link?.includes('agency')
      ).length,
      application: unreadNotificationsList.filter(
        (n) => n.type === 'application' || n.relatedEntityType === 'application' || n.link?.includes('application')
      ).length,
      scholarship: unreadNotificationsList.filter(
        (n) => n.type === 'scholarship' || n.relatedEntityType === 'scholarship' || n.link?.includes('scholarship')
      ).length,
      documents: unreadNotificationsList.filter(
        (n) => n.type === 'documents' || n.relatedEntityType === 'documents' || n.link?.includes('document')
      ).length,
    },
    reports: {
      all: unseenReports.length,
    },
    directApplications: {
      all: directApplicationsUnseen,
    },
    agencyAssistance: {
      all: agencyAssistanceUnseen,
    },
    messages: {
      all: messagesUnseen,
    },
    documents: {
      all: documentsUnseen,
    },
    scholarships: {
      all: 0,
    },
    recommendations: {
      all: 0,
    },
  };

  return {
    directApplications: directApplicationsUnseen,
    applications: applicationsUnseen,
    applicationTracking: applicationsUnseen,
    agencyAssistance: agencyAssistanceUnseen,
    messages: messagesUnseen,
    documents: documentsUnseen,
    reports: reportsUnseen,
    notifications: notificationsUnread,
    scholarships: 0,
    recommendations: 0,
    statusCounts,
  };
};

// @desc    Get student sidebar unseen counts
// @route   GET /api/student/sidebar-counts
// @access  Private (Student)
export const getStudentSidebarCounts = async (req, res, next) => {
  try {
    const counts = await calculateStudentUnseenCounts(req.user._id);
    return res.status(200).json({
      success: true,
      data: counts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get internal page/status/tab unseen counts for student
// @route   GET /api/student/status-counts
// @access  Private (Student)
export const getStudentStatusCounts = async (req, res, next) => {
  try {
    const counts = await calculateStudentUnseenCounts(req.user._id);
    return res.status(200).json({
      success: true,
      data: {
        ...counts.statusCounts,
        sidebarCounts: {
          directApplications: counts.directApplications,
          applications: counts.applications,
          agencyAssistance: counts.agencyAssistance,
          messages: counts.messages,
          documents: counts.documents,
          reports: counts.reports,
          notifications: counts.notifications,
          scholarships: counts.scholarships,
          recommendations: counts.recommendations,
        },
        statusCounts: counts.statusCounts,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark a student entity as seen
// @route   PUT /api/student/seen/:entityType/:entityId
// @access  Private (Student)
export const markStudentEntityAsSeen = async (req, res, next) => {
  try {
    const { entityType, entityId } = req.params;
    const studentId = req.user._id;

    if (!entityType || !entityId) {
      return res.status(400).json({
        success: false,
        message: 'entityType and entityId are required',
      });
    }

    // Ownership verification for student data isolation
    const idStr = entityId.toString();
    const uidStr = studentId.toString();

    if (mongoose.connection.readyState === 1) {
      if (['application', 'applications', 'direct_application', 'directApplications'].includes(entityType)) {
        const app = await Application.findById(entityId);
        if (app && app.user.toString() !== uidStr) {
          return res.status(403).json({
            success: false,
            message: 'Forbidden: You do not own this application',
          });
        }
      } else if (['agency_order', 'agency_service_order', 'agencyAssistance'].includes(entityType)) {
        const order = await AgencyServiceOrder.findOne({ $or: [{ _id: entityId }, { orderId: entityId }] });
        if (order && order.user.toString() !== uidStr) {
          return res.status(403).json({
            success: false,
            message: 'Forbidden: You do not own this agency order',
          });
        }
      } else if (['report', 'reports'].includes(entityType)) {
        const rep = await Report.findOne({ $or: [{ _id: entityId }, { reportId: entityId }] });
        if (rep && rep.reportedBy.toString() !== uidStr) {
          return res.status(403).json({
            success: false,
            message: 'Forbidden: You do not own this report',
          });
        }
      } else if (['chat_message', 'message', 'messages', 'support'].includes(entityType)) {
        const msg = await ChatMessage.findOne({ $or: [{ sessionId: entityId }, { _id: entityId }] });
        if (msg && msg.user && msg.user.toString() !== uidStr) {
          return res.status(403).json({
            success: false,
            message: 'Forbidden: You do not own this conversation',
          });
        }
      }
    } else {
      const db = devStore.read();
      if (['application', 'applications', 'direct_application', 'directApplications'].includes(entityType)) {
        const app = (db.applications || []).find((a) => a._id === idStr || a.applicationId === idStr);
        if (app && app.user?.toString() !== uidStr) {
          return res.status(403).json({
            success: false,
            message: 'Forbidden: You do not own this application',
          });
        }
      } else if (['agency_order', 'agency_service_order', 'agencyAssistance'].includes(entityType)) {
        const order = (db.agencyServiceOrders || []).find((o) => o._id === idStr || o.orderId === idStr);
        if (order && order.user?.toString() !== uidStr) {
          return res.status(403).json({
            success: false,
            message: 'Forbidden: You do not own this agency order',
          });
        }
      } else if (['report', 'reports'].includes(entityType)) {
        const rep = (db.reports || []).find((r) => r._id === idStr || r.reportId === idStr);
        if (rep && rep.reportedBy?.toString() !== uidStr) {
          return res.status(403).json({
            success: false,
            message: 'Forbidden: You do not own this report',
          });
        }
      }
    }

    await markStudentEntityAsSeenHelper(studentId, entityType, entityId);

    return res.status(200).json({
      success: true,
      message: `Entity [${entityType}/${entityId}] marked as seen by student`,
      data: {
        entityType,
        entityId,
        isSeenByStudent: true,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark a student entity as seen (POST variant)
// @route   POST /api/student/seen
// @access  Private (Student)
export const markStudentEntityAsSeenPost = async (req, res, next) => {
  req.params = { ...req.params, entityType: req.body.entityType, entityId: req.body.entityId };
  return markStudentEntityAsSeen(req, res, next);
};
