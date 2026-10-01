import { Server as SocketIOServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Conversation from '../models/Conversation.js';
import devStore from '../utils/devStore.js';

let io = null;

// In-memory presence tracker: Map<userId, Set<socketId>>
const userSockets = new Map();
// In-memory last seen tracker: Map<userId, Date>
const userLastSeen = new Map();

/**
 * Get the initialized Socket.io instance
 */
export const getIO = () => io;

/**
 * Check if a user is currently online (has at least 1 active socket)
 */
export const isUserOnline = (userId) => {
  const sockets = userSockets.get(userId?.toString());
  return Boolean(sockets && sockets.size > 0);
};

/**
 * Get user presence status and last seen timestamp
 */
export const getUserPresence = (userId) => {
  const idStr = userId?.toString();
  const online = isUserOnline(idStr);
  return {
    userId: idStr,
    status: online ? 'online' : 'offline',
    lastSeen: online ? null : userLastSeen.get(idStr) || null,
  };
};

/**
 * Initialize Socket.io with HTTP server
 */
export const initSocketServer = (httpServer, allowedOrigins = '*') => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: allowedOrigins || '*',
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    },
    pingInterval: 25000,
    pingTimeout: 20000,
  });

  // ── 1. Handshake JWT Authentication Middleware ──────────────────────────────
  io.use(async (socket, next) => {
    try {
      const authHeader = socket.handshake.headers?.authorization;
      const token =
        socket.handshake.auth?.token ||
        (authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null) ||
        socket.handshake.query?.token;

      if (!token) {
        const rawVisitor =
          socket.handshake.auth?.visitorToken || socket.handshake.query?.visitorToken;
        if (rawVisitor && typeof rawVisitor === 'string' && rawVisitor.trim().length >= 8) {
          socket.isVisitor = true;
          socket.visitorToken = rawVisitor.trim();
          socket.userId = `visitor:${socket.visitorToken}`;
          socket.role = 'visitor';
          return next();
        }

        const err = new Error('Authentication error: Token required.');
        err.data = { code: 'UNAUTHORIZED' };
        return next(err);
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'admify_super_secret_jwt_fallback_key_2026'
      );

      let user = null;
      if (mongoose.connection.readyState === 1) {
        user = await User.findById(decoded.id).select('-password');
      } else {
        user = await devStore.findUserById(decoded.id);
      }

      if (!user) {
        const err = new Error('Authentication error: User no longer exists.');
        err.data = { code: 'USER_NOT_FOUND' };
        return next(err);
      }

      // Establish immutable verified socket identity
      socket.userId = user._id.toString();
      socket.role = user.role;
      socket.user = user;

      next();
    } catch (err) {
      const authErr = new Error('Authentication error: Invalid or expired token.');
      authErr.data = { code: 'TOKEN_INVALID', message: err.message };
      return next(authErr);
    }
  });

  // ── 2. Connection Lifecycle ────────────────────────────────────────────────
  io.on('connection', (socket) => {
    if (socket.isVisitor) {
      socket.join(`visitor:${socket.visitorToken}`);
      socket.emit('visitor_connected', { visitorToken: socket.visitorToken });
      return;
    }

    if (socket.role === 'admin') {
      socket.join('admin_support');
    }

    const userId = socket.userId;

    // Track active connection in multi-tab registry
    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set());
    }
    const userSet = userSockets.get(userId);
    userSet.add(socket.id);

    // Auto-join personal notification room
    socket.join(`user:${userId}`);

    // If first active socket, broadcast online presence to relevant listeners
    if (userSet.size === 1) {
      io.emit('user_presence_changed', {
        userId,
        status: 'online',
        lastSeen: null,
      });
    }

    // ── 3. Secure Conversation Room Authorization ────────────────────────────
    socket.on('join_conversation', async ({ conversationId } = {}, callback) => {
      try {
        if (!conversationId) {
          socket.emit('error', { message: 'Conversation ID is required.' });
          if (callback) callback({ success: false, message: 'Conversation ID is required.' });
          return;
        }

        let conversation = null;
        if (mongoose.connection.readyState === 1) {
          conversation = await Conversation.findById(conversationId);
        } else {
          const db = devStore.read();
          conversation = (db.conversations || []).find(
            (c) => c._id?.toString() === conversationId.toString()
          );
        }

        if (!conversation) {
          socket.emit('error', { message: 'Conversation not found.' });
          if (callback) callback({ success: false, message: 'Conversation not found.' });
          return;
        }

        const isParticipant = (conversation.participants || []).some(
          (p) => (p.user?._id || p.user)?.toString() === userId
        );

        if (!isParticipant) {
          socket.emit('error', {
            message: 'Access denied: You are not an authorized participant in this conversation.',
          });
          if (callback) {
            callback({
              success: false,
              message: 'Access denied: You are not an authorized participant in this conversation.',
            });
          }
          return;
        }

        const roomName = `conversation:${conversationId}`;
        socket.join(roomName);

        socket.emit('joined_conversation', {
          success: true,
          conversationId,
          room: roomName,
        });

        if (callback) {
          callback({
            success: true,
            conversationId,
            room: roomName,
          });
        }
      } catch (err) {
        socket.emit('error', { message: err.message });
        if (callback) callback({ success: false, message: err.message });
      }
    });

    // ── 4. Leave Conversation Room ───────────────────────────────────────────
    socket.on('leave_conversation', ({ conversationId }) => {
      if (conversationId) {
        socket.leave(`conversation:${conversationId}`);
      }
    });

    // ── 5. Ephemeral Typing Indicators ───────────────────────────────────────
    socket.on('typing_start', async ({ conversationId } = {}) => {
      if (!conversationId) return;

      // Verify participant authorization before emitting
      try {
        let conversation = null;
        if (mongoose.connection.readyState === 1) {
          conversation = await Conversation.findById(conversationId);
        } else {
          const db = devStore.read();
          conversation = (db.conversations || []).find(
            (c) => c._id?.toString() === conversationId.toString()
          );
        }
        if (!conversation) return;
        const isParticipant = (conversation.participants || []).some(
          (p) => (p.user?._id || p.user)?.toString() === userId
        );
        if (!isParticipant) return;

        socket.typingRooms = socket.typingRooms || new Set();
        socket.typingRooms.add(conversationId.toString());

        socket.to(`conversation:${conversationId}`).emit('user_typing', {
          conversationId,
          userId,
          userName: socket.user.name || 'Participant',
        });
      } catch {}
    });

    socket.on('typing_stop', ({ conversationId } = {}) => {
      if (!conversationId) return;
      if (socket.typingRooms) {
        socket.typingRooms.delete(conversationId.toString());
      }
      socket.to(`conversation:${conversationId}`).emit('user_stopped_typing', {
        conversationId,
        userId,
      });
    });

    // ── 6. Query Presence Status ─────────────────────────────────────────────
    socket.on('get_presence', ({ userIds }, callback) => {
      if (!Array.isArray(userIds) || !callback) return;
      const result = {};
      for (const id of userIds) {
        result[id] = getUserPresence(id);
      }
      callback({ success: true, presence: result });
    });

    // ── 7. Disconnection Lifecycle ───────────────────────────────────────────
    socket.on('disconnect', () => {
      // Clean up any active typing indicators for this socket
      if (socket.typingRooms && socket.typingRooms.size > 0) {
        for (const convId of socket.typingRooms) {
          io.to(`conversation:${convId}`).emit('user_stopped_typing', {
            conversationId: convId,
            userId,
          });
        }
        socket.typingRooms.clear();
      }

      const set = userSockets.get(userId);
      if (set) {
        set.delete(socket.id);
        if (set.size === 0) {
          userSockets.delete(userId);
          const now = new Date();
          userLastSeen.set(userId, now);

          // Broadcast offline status to listeners
          io.emit('user_presence_changed', {
            userId,
            status: 'offline',
            lastSeen: now.toISOString(),
          });
        }
      }
    });
  });

  return io;
};

// ── 8. Real-Time Broadcast Helpers for Application Services ─────────────────

/**
 * Broadcast newly created message to conversation room and receiver notification room
 */
export const emitNewMessage = (conversationId, message, receiverId) => {
  if (!io) return;
  const roomName = `conversation:${conversationId}`;
  // Broadcast safe message object directly to conversation room
  io.to(roomName).emit('new_message', message);

  // Also dispatch conversation update / notification to receiver user room
  if (receiverId) {
    io.to(`user:${receiverId}`).emit('conversation_updated', {
      conversationId,
      lastMessage: message,
    });
    io.to(`user:${receiverId}`).emit('badge_increment', {
      section: 'messages',
      conversationId,
    });
  }
};

/**
 * Broadcast message edit update
 */
export const emitMessageEdited = (conversationId, message) => {
  if (!io) return;
  io.to(`conversation:${conversationId}`).emit('message_edited', message);
};

/**
 * Broadcast message soft deletion
 */
export const emitMessageDeleted = (conversationId, messageId) => {
  if (!io) return;
  io.to(`conversation:${conversationId}`).emit('message_deleted', {
    conversationId,
    messageId,
    isDeleted: true,
  });
};

/**
 * Broadcast read receipt
 */
export const emitMessageRead = (conversationId, userId, readAt = new Date()) => {
  if (!io) return;
  io.to(`conversation:${conversationId}`).emit('message_read', {
    conversationId,
    userId,
    readerId: userId,
    readAt: readAt.toISOString ? readAt.toISOString() : readAt,
  });
};

/**
 * Broadcast message reaction update
 */
export const emitReactionUpdated = (conversationId, messageId, reactions) => {
  if (!io) return;
  io.to(`conversation:${conversationId}`).emit('message_reaction_updated', {
    conversationId,
    messageId,
    reactions,
  });
};

export const emitToVisitor = (visitorToken, eventName, payload) => {
  if (!io || !visitorToken) return;
  io.to(`visitor:${visitorToken}`).emit(eventName, payload);
};

export const emitToAdminSupport = (eventName, payload) => {
  if (!io) return;
  io.to('admin_support').emit(eventName, payload);
};

export default {
  initSocketServer,
  getIO,
  emitNewMessage,
  emitMessageEdited,
  emitMessageDeleted,
  emitMessageRead,
  emitReactionUpdated,
  emitToVisitor,
  emitToAdminSupport,
  isUserOnline,
  getUserPresence,
};
