import mongoose from 'mongoose';
import Application from '../models/Application.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import StudentSeenItem from '../models/StudentSeenItem.js';
import AgencySeenItem from '../models/AgencySeenItem.js';
import UniRepSeenItem from '../models/UniRepSeenItem.js';
import University from '../models/University.js';
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

      // Notify assigned agency if applicable
      if (req.body.assignedAgency) {
        try {
          application.assignedAgency = req.body.assignedAgency;
          await application.save();
          await Notification.create({
            user: req.body.assignedAgency,
            title: 'New Student Application Assigned',
            message: `A new application for ${university} (${program}) was submitted by ${req.user.name || 'Student'} and assigned to your agency.`,
            type: 'info',
            link: '/agency/applications',
            actionUrl: '/agency/applications',
            relatedEntityType: 'application',
            relatedEntityId: application._id ? application._id.toString() : '',
          });
        } catch {}
      }

      // Notify University Representative
      try {
        let uniRepUsers = [];
        if (application.universityId) {
          uniRepUsers = await User.find({
            role: { $in: ['university_rep', 'university representative', 'university'] },
            universityId: application.universityId,
          });
        }
        if (uniRepUsers.length === 0 && application.university) {
          const u = await University.findOne({ name: new RegExp(`^${application.university.trim()}$`, 'i') });
          if (u) {
            uniRepUsers = await User.find({
              role: { $in: ['university_rep', 'university representative', 'university'] },
              universityId: u._id,
            });
          }
        }
        for (const rep of uniRepUsers) {
          await Notification.create({
            user: rep._id,
            title: 'New Candidate Application Received',
            message: `A new application for ${application.program} was submitted by ${req.user.name || 'Student'}.`,
            type: 'info',
            link: '/university-rep/applications',
            actionUrl: '/university-rep/applications',
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
        assignedAgency: req.body.assignedAgency || undefined,
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

      // Notify assigned agency if applicable
      if (req.body.assignedAgency) {
        try {
          await devStore.createNotification({
            userId: req.body.assignedAgency,
            title: 'New Student Application Assigned',
            message: `A new application for ${university} (${program}) was submitted by ${req.user.name || 'Student'} and assigned to your agency.`,
            type: 'info',
            link: '/agency/applications',
            actionUrl: '/agency/applications',
            relatedEntityType: 'application',
            relatedEntityId: application._id ? application._id.toString() : '',
          });
        } catch {}
      }

      // Notify target University Representative in devStore
      try {
        const db = devStore.read();
        let targetUniId = application.universityId;
        if (!targetUniId && application.university) {
          const matchUni = (db.universities || []).find(
            (u) => u.name && u.name.toLowerCase() === application.university.toLowerCase()
          );
          if (matchUni) targetUniId = matchUni._id;
        }
        const uniReps = (db.users || []).filter(
          (u) =>
            ['university_rep', 'university representative', 'university'].includes(u.role) &&
            (targetUniId ? u.universityId?.toString() === targetUniId.toString() : false)
        );
        for (const rep of uniReps) {
          await devStore.createNotification({
            userId: rep._id,
            title: 'New Candidate Application Received',
            message: `A new application for ${application.program} was submitted by ${req.user.name || 'Student'}.`,
            type: 'info',
            link: '/university-rep/applications',
            actionUrl: '/university-rep/applications',
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

      // If application is assigned to an agency, reset seen and notify
      if (application.assignedAgency) {
        try {
          await AgencySeenItem.deleteMany({
            agency: application.assignedAgency,
            entityId: application._id.toString(),
          });
          await Notification.create({
            user: application.assignedAgency,
            title: 'Application Status Updated',
            message: `Application for ${application.university} is now: ${application.stage}`,
            type: 'info',
            link: '/agency/applications',
            actionUrl: '/agency/applications',
            relatedEntityType: 'application',
            relatedEntityId: application._id.toString(),
          });
        } catch {}
      }

      // Reset Uni Rep seen item for this updated application and notify Uni Rep
      try {
        await UniRepSeenItem.deleteMany({
          entityType: 'application',
          entityId: application._id.toString(),
        });

        let uniRepUsers = [];
        if (application.universityId) {
          uniRepUsers = await User.find({
            role: { $in: ['university_rep', 'university representative', 'university'] },
            universityId: application.universityId,
          });
        }
        if (uniRepUsers.length === 0 && application.university) {
          const u = await University.findOne({ name: new RegExp(`^${application.university.trim()}$`, 'i') });
          if (u) {
            uniRepUsers = await User.find({
              role: { $in: ['university_rep', 'university representative', 'university'] },
              universityId: u._id,
            });
          }
        }
        for (const rep of uniRepUsers) {
          await Notification.create({
            user: rep._id,
            title: 'Application Stage Updated',
            message: `Application for ${application.studentName || application.program || 'applicant'} stage changed to: ${application.stage}`,
            type: 'info',
            link: '/university-rep/applications',
            actionUrl: '/university-rep/applications',
            relatedEntityType: 'application',
            relatedEntityId: application._id.toString(),
          });
        }
      } catch {}
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
      if (application.assignedAgency) {
        db.agencySeenItems = (db.agencySeenItems || []).filter(
          (item) => !(item.agency?.toString() === application.assignedAgency?.toString() && item.entityId === req.params.id.toString())
        );
      }
      db.uniRepSeenItems = (db.uniRepSeenItems || []).filter(
        (item) => !(item.entityType === 'application' && item.entityId === req.params.id.toString())
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

      if (application.assignedAgency) {
        try {
          await devStore.createNotification({
            userId: application.assignedAgency,
            title: 'Application Status Updated',
            message: `Application for ${application.university} is now: ${application.stage}`,
            type: 'info',
            link: '/agency/applications',
            actionUrl: '/agency/applications',
            relatedEntityType: 'application',
            relatedEntityId: application._id ? application._id.toString() : req.params.id,
          });
        } catch {}
      }

      // Notify Uni Rep in devStore
      try {
        let targetUniId = application.universityId;
        if (!targetUniId && application.university) {
          const matchUni = (db.universities || []).find(
            (u) => u.name && u.name.toLowerCase() === application.university.toLowerCase()
          );
          if (matchUni) targetUniId = matchUni._id;
        }
        const uniReps = (db.users || []).filter(
          (u) =>
            ['university_rep', 'university representative', 'university'].includes(u.role) &&
            (targetUniId ? u.universityId?.toString() === targetUniId.toString() : false)
        );
        for (const rep of uniReps) {
          await devStore.createNotification({
            userId: rep._id,
            title: 'Application Stage Updated',
            message: `Application for ${application.studentName || application.program || 'applicant'} stage changed to: ${application.stage}`,
            type: 'info',
            link: '/university-rep/applications',
            actionUrl: '/university-rep/applications',
            relatedEntityType: 'application',
            relatedEntityId: application._id ? application._id.toString() : req.params.id,
          });
        }
      } catch {}
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
