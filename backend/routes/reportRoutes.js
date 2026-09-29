import express from 'express';
import mongoose from 'mongoose';
import { protect } from '../middleware/authMiddleware.js';
import Report from '../models/Report.js';
import devStore from '../utils/devStore.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

const router = express.Router();

import StudentSeenItem from '../models/StudentSeenItem.js';

// @route   POST /api/reports
// @desc    Submit a user report or complaint
// @access  Private
router.post('/', protect, async (req, res, next) => {
  try {
    const { title, description, targetType, priority, category, targetId, targetName } = req.body;
    if (!title?.trim() || !description?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Title and description are required for reporting.',
      });
    }

    const reportId = `ADM-REP-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    const payload = {
      reportId,
      reportedBy: req.user._id,
      reporterName: req.user.name || 'User',
      reporterEmail: req.user.email || '',
      reporterRole: req.user.role || 'user',
      title: title.trim(),
      description: description.trim(),
      targetType: targetType || 'service_issue',
      targetId: targetId || '',
      targetName: targetName || '',
      priority: (priority || 'MEDIUM').toUpperCase(),
      category: category || 'General',
      status: 'OPEN',
      isSeenByAdmin: false,
      adminSeenAt: null,
      isSeenByStudent: true,
      studentSeenAt: new Date(),
      createdAt: new Date(),
    };

    let report = null;
    if (mongoose.connection.readyState === 1) {
      report = await Report.create(payload);

      // Notify Admins
      try {
        const admins = await User.find({ role: 'admin' });
        for (const a of admins) {
          await Notification.create({
            user: a._id,
            title: 'New Issue Report Submitted',
            message: `Report [${report.reportId}] submitted: ${report.title}`,
            type: 'warning',
            link: '/admin/reports',
            actionUrl: '/admin/reports',
            relatedEntityType: 'report',
            relatedEntityId: report._id ? report._id.toString() : '',
          });
        }
      } catch {}

      // Notify Agency if target is agency
      if (report.targetType === 'agency' || payload.targetType === 'agency') {
        try {
          const targetAgencyId = report.targetId || payload.targetId;
          if (targetAgencyId) {
            await Notification.create({
              user: targetAgencyId,
              title: 'New Issue Report Filed',
              message: `A report [${report.reportId}] has been filed: ${report.title}`,
              type: 'warning',
              link: '/agency/reports',
              actionUrl: '/agency/reports',
              relatedEntityType: 'report',
              relatedEntityId: report._id ? report._id.toString() : '',
            });
          }
        } catch {}
      }
    } else {
      report = await devStore.createReport(payload);

      try {
        const admins = (await devStore.findUsers({ role: 'admin' })) || [];
        for (const a of admins) {
          await devStore.createNotification({
            userId: a._id,
            title: 'New Issue Report Submitted',
            message: `Report [${report.reportId}] submitted: ${report.title}`,
            type: 'warning',
            link: '/admin/reports',
            actionUrl: '/admin/reports',
            relatedEntityType: 'report',
            relatedEntityId: report._id ? report._id.toString() : '',
          });
        }
      } catch {}

      // Notify Agency if target is agency
      if (report.targetType === 'agency' || payload.targetType === 'agency') {
        try {
          const targetAgencyId = report.targetId || payload.targetId;
          if (targetAgencyId) {
            await devStore.createNotification({
              userId: targetAgencyId,
              title: 'New Issue Report Filed',
              message: `A report [${report.reportId}] has been filed: ${report.title}`,
              type: 'warning',
              link: '/agency/reports',
              actionUrl: '/agency/reports',
              relatedEntityType: 'report',
              relatedEntityId: report._id ? report._id.toString() : '',
            });
          }
        } catch {}
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Report submitted successfully.',
      data: { report },
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/reports
// @desc    Get current user's submitted reports
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    let reports = [];
    if (mongoose.connection.readyState === 1) {
      const raw = await Report.find({ reportedBy: req.user._id }).sort({ createdAt: -1 });
      const seenItems = await StudentSeenItem.find({
        user: req.user._id,
        entityType: 'report',
      });
      const seenMap = new Map(seenItems.map((s) => [s.entityId.toString(), true]));
      reports = raw.map((r) => {
        const obj = r.toObject ? r.toObject() : { ...r };
        obj.isSeenByStudent = seenMap.has(obj._id?.toString()) ? true : (obj.isSeenByStudent !== false);
        return obj;
      });
    } else {
      const all = await devStore.findReports();
      reports = all
        .filter((r) => r.reportedBy?.toString() === req.user._id.toString())
        .map((r) => ({
          ...r,
          isSeenByStudent: devStore.isStudentEntitySeen(req.user._id, 'report', r._id) ?? (r.isSeenByStudent !== false),
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
});

export default router;
