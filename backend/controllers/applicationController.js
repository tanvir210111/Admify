import mongoose from 'mongoose';
import Application from '../models/Application.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import StudentSeenItem from '../models/StudentSeenItem.js';
import devStore from '../utils/devStore.js';

// @desc    Get current user applications
// @route   GET /api/applications/my
// @access  Private
export const getMyApplications = async (req, res, next) => {
  try {
    let applications;
    if (mongoose.connection.readyState === 1) {
      const rawApps = await Application.find({ user: req.user._id }).sort({ createdAt: -1 }).lean();
      const seenItems = await StudentSeenItem.find({ user: req.user._id }).lean();
      const seenMap = new Map();
      for (const s of seenItems) {
        seenMap.set(`${s.entityType}:${s.entityId}`, true);
        seenMap.set(s.entityId, true);
      }

      applications = rawApps.map((a) => {
        const docId = a._id?.toString();
        const isSeen = a.isSeenByStudent !== false || seenMap.has(`application:${docId}`) || seenMap.has(docId);
        return {
          ...a,
          isSeenByStudent: isSeen,
        };
      });
    } else {
      const rawApps = await devStore.findApplications({ user: req.user._id });
      const db = devStore.read();
      const seenList = (db.studentSeenItems || []).filter((s) => s.user === req.user._id.toString());
      applications = rawApps.map((a) => {
        const docId = a._id?.toString() || a.id?.toString();
        const isSeen = a.isSeenByStudent !== false || seenList.some((s) => s.entityId === docId);
        return {
          ...a,
          isSeenByStudent: isSeen,
        };
      });
    }
    return res.status(200).json({
      success: true,
      count: applications.length,
      applications,
      data: { applications },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all applications (Admin / Agent)
// @route   GET /api/applications
// @access  Private (Admin, Agent, Agency, University)
export const getAllApplications = async (req, res, next) => {
  try {
    let applications;
    if (mongoose.connection.readyState === 1) {
      const query = {};
      if (req.user.role === 'agent') {
        // Agents see their assigned applications or all unassigned
        query.$or = [{ assignedAgent: req.user._id }, { assignedAgent: { $exists: false } }];
      }

      applications = await Application.find(query)
        .populate('user', 'name email phone gpa ielts')
        .sort({ createdAt: -1 });
    } else {
      applications = await devStore.findApplications(
        req.user.role === 'agent' ? { assignedAgent: req.user._id } : {}
      );
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

// @desc    Submit a new university application
// @route   POST /api/applications
// @access  Private
export const createApplication = async (req, res, next) => {
  try {
    const university = req.body.university || req.body.universityName;
    const program = req.body.program || req.body.programTitle;
    const { notes, logo } = req.body;

    if (!university || !program) {
      return res.status(400).json({
        success: false,
        message: 'University name and program are required',
      });
    }

    let application;
    if (mongoose.connection.readyState === 1) {
      application = await Application.create({
        user: req.user._id,
        university,
        program,
        notes: notes || '',
        logo: logo || '🎓',
        stage: 'Submitted',
        progress: 25,
        steps: [
          { label: 'Submitted', date: 'Today', status: 'completed' },
          { label: 'Documents Pending', date: 'In Progress', status: 'current' },
          { label: 'In Review', date: 'Pending', status: 'upcoming' },
          { label: 'Decision', date: 'Pending', status: 'upcoming' },
        ],
      });

      // Notify user
      await Notification.create({
        user: req.user._id,
        title: 'Application Received',
        message: `Your application to ${university} for ${program} has been logged.`,
        type: 'info',
      });

      // Notify Admins
      try {
        const admins = await User.find({ role: 'admin' });
        for (const a of admins) {
          await Notification.create({
            user: a._id,
            title: 'New University Application Submitted',
            message: `A new application for ${university} (${program}) was submitted by ${req.user.name || 'Student'}.`,
            type: 'info',
            link: '/admin/applications',
            actionUrl: '/admin/applications',
            relatedEntityType: 'application',
            relatedEntityId: application._id ? application._id.toString() : '',
          });
        }
      } catch {}
    } else {
      application = await devStore.createApplication({
        user: req.user._id,
        university,
        program,
        notes: notes || '',
        logo: logo || '🎓',
        stage: 'Submitted',
        progress: 25,
      });

      // Notify user
      await devStore.createNotification({
        userId: req.user._id,
        title: 'Application Received',
        message: `Your application to ${university} for ${program} has been logged.`,
        type: 'info',
      });

      // Notify Admins
      try {
        const admins = (await devStore.findUsers({ role: 'admin' })) || [];
        for (const a of admins) {
          await devStore.createNotification({
            userId: a._id,
            title: 'New University Application Submitted',
            message: `A new application for ${university} (${program}) was submitted by ${req.user.name || 'Student'}.`,
            type: 'info',
            link: '/admin/applications',
            actionUrl: '/admin/applications',
            relatedEntityType: 'application',
            relatedEntityId: application._id ? application._id.toString() : '',
          });
        }
      } catch {}
    }

    return res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: { application },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update application status / stage / progress
// @route   PUT /api/applications/:id/status
// @access  Private (Admin, Agent, Agency, University)
export const updateApplicationStatus = async (req, res, next) => {
  try {
    const { stage, progress, steps, notes } = req.body;

    let application;
    if (mongoose.connection.readyState === 1) {
      application = await Application.findById(req.params.id);
      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Application not found',
        });
      }

      if (stage) application.stage = stage;
      if (progress !== undefined) application.progress = progress;
      if (steps) application.steps = steps;
      if (notes) application.notes = notes;

      application.isSeenByStudent = false;
      await application.save();

      // Clear student seen item for this updated application
      await StudentSeenItem.deleteMany({
        user: application.user,
        entityId: application._id.toString(),
      });

      // Notify the applicant with rich relation metadata
      await Notification.create({
        user: application.user,
        title: 'Application Status Updated',
        message: `Your application for ${application.university} is now: ${application.stage}`,
        type: application.stage === 'Accepted' ? 'success' : 'info',
        link: '/student/applications',
        actionUrl: '/student/applications',
        relatedEntityType: 'application',
        relatedEntityId: application._id.toString(),
      });
    } else {
      application = await devStore.findApplicationById(req.params.id);
      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Application not found',
        });
      }

      const updates = {};
      if (stage) updates.stage = stage;
      if (progress !== undefined) updates.progress = progress;
      if (steps) updates.steps = steps;
      if (notes) updates.notes = notes;
      updates.isSeenByStudent = false;

      application = await devStore.updateApplication(req.params.id, updates);

      const db = devStore.read();
      db.studentSeenItems = (db.studentSeenItems || []).filter(
        (item) => !(item.user === application.user?.toString() && item.entityId === req.params.id.toString())
      );
      devStore.write(db);

      // Notify the applicant with rich relation metadata
      await devStore.createNotification({
        userId: application.user,
        title: 'Application Status Updated',
        message: `Your application for ${application.university} is now: ${application.stage}`,
        type: application.stage === 'Accepted' ? 'success' : 'info',
        link: '/student/applications',
        actionUrl: '/student/applications',
        relatedEntityType: 'application',
        relatedEntityId: application._id ? application._id.toString() : req.params.id,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Application status updated',
      data: { application },
    });
  } catch (error) {
    next(error);
  }
};
