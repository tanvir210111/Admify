import mongoose from 'mongoose';
import Notification from '../models/Notification.js';
import devStore from '../utils/devStore.js';

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
      const unreadCount = await Notification.countDocuments({ user: req.user._id, read: false });

      return res.status(200).json({
        success: true,
        unreadCount,
        count: notifications.length,
        data: { notifications },
      });
    } else {
      const notifications = await devStore.findNotifications(req.user._id);
      const unreadCount = notifications.filter((n) => !n.read).length;

      return res.status(200).json({
        success: true,
        unreadCount,
        count: notifications.length,
        data: { notifications },
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markAsRead = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const notification = await Notification.findOneAndUpdate(
        { _id: req.params.id, user: req.user._id },
        { read: true },
        { new: true }
      );

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Notification marked as read',
        data: { notification },
      });
    } else {
      const notification = await devStore.markNotificationAsRead(req.params.id, req.user._id);
      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found',
        });
      }
      return res.status(200).json({
        success: true,
        message: 'Notification marked as read',
        data: { notification },
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all user notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
export const markAllAsRead = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
    } else {
      await devStore.markAllNotificationsAsRead(req.user._id);
    }

    return res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    next(error);
  }
};
