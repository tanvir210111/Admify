import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import Conversation from '../models/Conversation.js';
import ChatMessage from '../models/ChatMessage.js';
import User from '../models/User.js';
import Application from '../models/Application.js';
import AgencyServiceOrder from '../models/AgencyServiceOrder.js';
import UniversityAgencyConnection from '../models/UniversityAgencyConnection.js';
import Notification from '../models/Notification.js';
import devStore from '../utils/devStore.js';
import { ATTACHMENTS_DIR } from '../middleware/attachmentMiddleware.js';
import {
  emitNewMessage,
  emitMessageEdited,
  emitMessageDeleted,
  emitMessageRead,
  emitReactionUpdated,
} from '../socket/socketServer.js';

/**
 * Deterministic participantKey builder
 * Sorts two user IDs alphabetically to guarantee that User A -> User B
 * and User B -> User A resolve to the exact same thread.
 */
export const buildParticipantKey = (id1, id2) => {
  const sorted = [id1.toString(), id2.toString()].sort();
  return `${sorted[0]}:${sorted[1]}`;
};

/**
 * Helper to fetch a User by ID with Mongoose/devStore support
 */
export const getUserById = async (userId) => {
  if (!userId) return null;
  const idStr = userId.toString();
  if (mongoose.connection.readyState === 1) {
    return User.findById(userId).select('-password').lean();
  }
  const db = devStore.read();
  return (db.users || []).find((u) => u._id?.toString() === idStr) || null;
};

/**
 * Verify relationship authorization between sender and receiver.
 * Enforces strict role and business relationship rules.
 */
export const verifyMessagingPermission = async (senderUser, receiverUser) => {
  if (!senderUser || !receiverUser) {
    return { authorized: false, message: 'Invalid sender or receiver.' };
  }

  const senderId = senderUser._id.toString();
  const receiverId = receiverUser._id.toString();

  // Rule 1: Prevent self-messaging
  if (senderId === receiverId) {
    return { authorized: false, message: 'Self-messaging is not permitted.' };
  }

  const sRole = senderUser.role;
  const rRole = receiverUser.role;

  // Rule 1.1: ADMIN relationships (Direct Chat Mode 2 - Real Participant)
  if (sRole === 'admin' || rRole === 'admin') {
    return { authorized: true };
  }

  // Rule 2: STUDENT relationships
  if (sRole === 'student') {
    if (rRole === 'agent') {
      // Must be assigned agent
      const isAssigned = await isAgentAssignedToStudent(receiverId, senderId);
      if (!isAssigned) {
        return {
          authorized: false,
          message: 'You can only message an admissions counselor assigned to your profile or application.',
        };
      }
      return { authorized: true };
    }

    if (rRole === 'agency') {
      // Must have active application or agency service order
      const hasRelationship = await isAgencyLinkedToStudent(receiverId, senderId);
      if (!hasRelationship) {
        return {
          authorized: false,
          message: 'You can only message an agency that has an active service order or application with you.',
        };
      }
      return { authorized: true };
    }

    if (rRole === 'university_rep' || rRole === 'university') {
      const hasRelationship = await isStudentLinkedToUniRep(senderId, receiverId, receiverUser.universityId);
      if (!hasRelationship) {
        return {
          authorized: false,
          message: 'You can only message university representatives where you have an active application.',
        };
      }
      return { authorized: true };
    }

    return {
      authorized: false,
      message: 'Students are only permitted to message authorized counselors, managing agencies, partner universities, and Admify support.',
    };
  }

  // Rule 3: AGENT relationships
  if (sRole === 'agent') {
    if (rRole === 'student') {
      const isAssigned = await isAgentAssignedToStudent(senderId, receiverId);
      if (!isAssigned) {
        return {
          authorized: false,
          message: 'You are only authorized to message students specifically assigned to you.',
        };
      }
      return { authorized: true };
    }

    if (rRole === 'agency') {
      const agentAgencyId = senderUser.agencyId?.toString();
      if (!agentAgencyId || agentAgencyId !== receiverId) {
        return {
          authorized: false,
          message: 'You can only message your designated managing agency.',
        };
      }
      return { authorized: true };
    }

    if (rRole === 'university_rep' || rRole === 'university') {
      const hasAcceptedConnection = await isAgentLinkedToUniRep(senderId, receiverId, receiverUser.universityId);
      if (!hasAcceptedConnection) {
        return {
          authorized: false,
          message: 'You can only communicate with university representatives with an active partnership connection via your managing agency.',
        };
      }
      return { authorized: true };
    }

    return {
      authorized: false,
      message: 'Counselors can only communicate with their assigned students, managing agency, partner universities, and Admify admin.',
    };
  }

  // Rule 4: AGENCY relationships
  if (sRole === 'agency') {
    if (rRole === 'agent') {
      const agentAgencyId = receiverUser.agencyId?.toString();
      if (!agentAgencyId || agentAgencyId !== senderId) {
        return {
          authorized: false,
          message: 'You can only message registered agents registered under your agency.',
        };
      }
      return { authorized: true };
    }

    if (rRole === 'student') {
      const hasRelationship = await isAgencyLinkedToStudent(senderId, receiverId);
      if (!hasRelationship) {
        return {
          authorized: false,
          message: 'You can only message students who have an application or service order with your agency.',
        };
      }
      return { authorized: true };
    }

    if (rRole === 'university_rep' || rRole === 'university') {
      const hasAcceptedConnection = await isAgencyConnectedToUniRep(senderId, receiverId, receiverUser.universityId);
      if (!hasAcceptedConnection) {
        return {
          authorized: false,
          message: 'You can only communicate with university representatives with an active, accepted partnership connection.',
        };
      }
      return { authorized: true };
    }

    return {
      authorized: false,
      message: 'Agencies can only message authorized agents, assigned students, connected university representatives, and Admify admin.',
    };
  }

  // Rule 5: UNIVERSITY REPRESENTATIVE relationships
  if (sRole === 'university_rep' || sRole === 'university') {
    if (rRole === 'agency') {
      const hasAcceptedConnection = await isAgencyConnectedToUniRep(receiverId, senderId, senderUser.universityId);
      if (!hasAcceptedConnection) {
        return {
          authorized: false,
          message: 'You can only communicate with partner agencies with an active, accepted partnership connection.',
        };
      }
      return { authorized: true };
    }

    if (rRole === 'agent') {
      const hasAcceptedConnection = await isAgentLinkedToUniRep(receiverId, senderId, senderUser.universityId);
      if (!hasAcceptedConnection) {
        return {
          authorized: false,
          message: 'You can only communicate with counselors from partner agencies with an active partnership connection.',
        };
      }
      return { authorized: true };
    }

    if (rRole === 'student') {
      const hasRelationship = await isStudentLinkedToUniRep(receiverId, senderId, senderUser.universityId);
      if (!hasRelationship) {
        return {
          authorized: false,
          message: 'You can only communicate with students who have submitted an application to your institution.',
        };
      }
      return { authorized: true };
    }

    return {
      authorized: false,
      message: 'University representatives can only communicate with connected partner agencies, verified counselors, applicant students, and Admify admin.',
    };
  }

  return { authorized: false, message: 'Unauthorized messaging relationship.' };
};


// ── Relationship Check Helpers ───────────────────────────────────────────────

const isAgentAssignedToStudent = async (agentId, studentId) => {
  const agStr = agentId.toString();
  const stStr = studentId.toString();

  if (mongoose.connection.readyState === 1) {
    const app = await Application.findOne({
      user: studentId,
      assignedAgent: agentId,
    });
    if (app) return true;

    const agentUser = await User.findById(agentId);
    const order = await AgencyServiceOrder.findOne({
      user: studentId,
      $or: [
        { 'assignedAgency.agentId': agStr },
        ...(agentUser?.name ? [{ 'assignedAgency.agentName': agentUser.name }] : []),
      ],
    });
    if (order) return true;
  } else {
    const db = devStore.read();
    const app = (db.applications || []).find(
      (a) => a.user?.toString() === stStr && a.assignedAgent?.toString() === agStr
    );
    if (app) return true;

    const agentUser = (db.users || []).find((u) => u._id?.toString() === agStr);
    const order = (db.agencyServiceOrders || []).find(
      (o) =>
        o.user?.toString() === stStr &&
        (o.assignedAgency?.agentId?.toString() === agStr ||
          (agentUser?.name && o.assignedAgency?.agentName === agentUser.name))
    );
    if (order) return true;
  }

  return false;
};

const isAgencyLinkedToStudent = async (agencyId, studentId) => {
  const agyStr = agencyId.toString();
  const stStr = studentId.toString();

  if (mongoose.connection.readyState === 1) {
    const app = await Application.findOne({
      user: studentId,
      assignedAgency: agencyId,
    });
    if (app) return true;

    const order = await AgencyServiceOrder.findOne({
      user: studentId,
      $or: [
        { 'assignedAgency.agencyId': agyStr },
        { agency: agencyId },
      ],
    });
    if (order) return true;
  } else {
    const db = devStore.read();
    const app = (db.applications || []).find(
      (a) => a.user?.toString() === stStr && a.assignedAgency?.toString() === agyStr
    );
    if (app) return true;

    const order = (db.agencyServiceOrders || []).find(
      (o) =>
        o.user?.toString() === stStr &&
        (o.assignedAgency?.agencyId?.toString() === agyStr || o.agency?.toString() === agyStr)
    );
    if (order) return true;
  }

  return false;
};

const isAgencyConnectedToUniRep = async (agencyId, uniRepUserId, uniId) => {
  const agyStr = agencyId.toString();
  const repStr = uniRepUserId.toString();
  const uniStr = uniId ? uniId.toString() : null;

  if (mongoose.connection.readyState === 1) {
    const conn = await UniversityAgencyConnection.findOne({
      status: 'ACCEPTED',
      agencyId,
      $or: [
        { universityRepresentativeId: uniRepUserId },
        ...(uniId ? [{ universityId: uniId }] : []),
      ],
    });
    return Boolean(conn);
  } else {
    const db = devStore.read();
    const conn = (db.universityAgencyConnections || []).find(
      (c) =>
        c.status === 'ACCEPTED' &&
        c.agencyId?.toString() === agyStr &&
        (c.universityRepresentativeId?.toString() === repStr ||
          (uniStr && c.universityId?.toString() === uniStr))
    );
    return Boolean(conn);
  }
};

const isStudentLinkedToUniRep = async (studentId, uniRepUserId, uniId) => {
  const stStr = studentId.toString();
  const uniStr = uniId ? uniId.toString() : null;

  if (mongoose.connection.readyState === 1) {
    const query = {
      user: studentId,
      ...(uniId ? { university: uniId } : {}),
    };
    const app = await Application.findOne(query);
    return Boolean(app);
  } else {
    const db = devStore.read();
    const app = (db.applications || []).find((a) => {
      const isStudentMatch = a.user?.toString() === stStr;
      if (!isStudentMatch) return false;
      if (uniStr) {
        return (
          a.university?.toString() === uniStr ||
          a.universityId?.toString() === uniStr ||
          a.uniId?.toString() === uniStr
        );
      }
      return true;
    });
    return Boolean(app);
  }
};

const isAgentLinkedToUniRep = async (agentUserId, uniRepUserId, uniId) => {
  let agentUser = null;
  if (mongoose.connection.readyState === 1) {
    agentUser = await User.findById(agentUserId);
  } else {
    const db = devStore.read();
    agentUser = (db.users || []).find((u) => u._id?.toString() === agentUserId.toString());
  }

  const agencyId = agentUser?.agencyId;
  if (!agencyId) return false;

  return isAgencyConnectedToUniRep(agencyId, uniRepUserId, uniId);
};


/**
 * Resolve or atomically create a persistent 1-to-1 conversation.
 * Handles race conditions via deterministic participantKey unique constraint.
 */
export const resolveConversation = async (userA, userB, context = null) => {
  if (!userA || !userB) {
    throw new Error('Both participants are required to resolve a conversation.');
  }

  const idA = userA._id.toString();
  const idB = userB._id.toString();

  if (idA === idB) {
    throw new Error('Cannot create a conversation with yourself.');
  }

  const participantKey = buildParticipantKey(idA, idB);

  // Normalize role values
  const roleA = userA.role === 'university' ? 'university_rep' : userA.role;
  const roleB = userB.role === 'university' ? 'university_rep' : userB.role;

  if (mongoose.connection.readyState === 1) {
    let conversation = await Conversation.findOne({ participantKey });
    if (conversation) {
      return conversation;
    }

    try {
      conversation = await Conversation.create({
        participants: [
          { user: userA._id, role: roleA },
          { user: userB._id, role: roleB },
        ],
        participantKey,
        context: context ? { type: context.type, entityId: context.entityId } : undefined,
        status: 'active',
      });
      return conversation;
    } catch (err) {
      // Handle E11000 duplicate key race condition
      if (err.code === 11000 || err.message?.includes('duplicate key')) {
        return await Conversation.findOne({ participantKey });
      }
      throw err;
    }
  } else {
    const db = devStore.read();
    if (!Array.isArray(db.conversations)) db.conversations = [];

    let conversation = db.conversations.find((c) => c.participantKey === participantKey);
    if (conversation) return conversation;

    conversation = {
      _id: new mongoose.Types.ObjectId().toString(),
      participants: [
        { user: userA._id.toString(), role: roleA },
        { user: userB._id.toString(), role: roleB },
      ],
      participantKey,
      context: context ? { type: context.type, entityId: context.entityId?.toString() } : null,
      lastMessage: null,
      lastMessageAt: null,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.conversations.push(conversation);
    devStore.write(db);
    return conversation;
  }
};

/**
 * Safe message formatter for client consumption.
 * Replaces deleted message content with placeholder, exposes edit tags,
 * maps attachments to safe download URLs without leaking filesystem paths,
 * and omits internal audit histories.
 */
export const formatMessageForResponse = (msg) => {
  if (!msg) return null;
  const isDeleted = Boolean(msg.isDeleted);
  const convId = msg.conversationId?._id || msg.conversationId || msg.sessionId;

  const rawAttachments = Array.isArray(msg.attachments) ? msg.attachments : [];
  const safeAttachments = isDeleted
    ? []
    : rawAttachments.map((att) => ({
        _id: att._id,
        originalName: att.originalName,
        filename: att.filename,
        mimeType: att.mimeType,
        size: att.size,
        url: `/api/conversations/${convId}/attachments/${encodeURIComponent(att.filename)}`,
      }));

  const rawReactions = Array.isArray(msg.reactions) ? msg.reactions : [];
  const safeReactions = isDeleted
    ? []
    : rawReactions.map((r) => ({
        user: (r.user?._id || r.user)?.toString(),
        emoji: r.emoji,
        createdAt: r.createdAt,
      }));

  return {
    _id: msg._id,
    conversationId: convId,
    sessionId: msg.sessionId || (convId ? convId.toString() : undefined),
    senderId: msg.senderId,
    receiverId: msg.receiverId,
    user: msg.user,
    receiver: msg.receiver,
    sender: msg.sender,
    text: isDeleted ? 'This message was deleted' : (msg.text || ''),
    attachments: safeAttachments,
    reactions: safeReactions,
    isEdited: Boolean(msg.isEdited || (msg.editHistory && msg.editHistory.length > 0)),
    editedAt: msg.editedAt || null,
    isDeleted: isDeleted,
    deletedAt: msg.deletedAt || null,
    deletedBy: msg.deletedBy || null,
    isLiveAgentRequest: Boolean(msg.isLiveAgentRequest),
    status: msg.status || 'active',
    createdAt: msg.createdAt,
    updatedAt: msg.updatedAt,
  };
};

/**
 * Create a new message in a conversation.
 * Derives sender identity strictly from JWT authenticated user.
 * Supports text, attachment, or text + attachment.
 */
export const createMessage = async ({ conversationId, receiverId, senderUser, text, attachments = [] }) => {
  if (!senderUser) throw new Error('Authenticated sender user is required.');

  const trimmedText = typeof text === 'string' ? text.trim() : '';
  const validAttachments = Array.isArray(attachments) ? attachments : [];

  if (!trimmedText && validAttachments.length === 0) {
    const err = new Error('Message must contain either text or an attachment.');
    err.statusCode = 400;
    throw err;
  }

  if (trimmedText.length > 5000) {
    const err = new Error('Message text exceeds maximum length of 5000 characters.');
    err.statusCode = 400;
    throw err;
  }

  if (!conversationId && receiverId) {
    const receiverUser = await getUserById(receiverId);
    if (!receiverUser) throw new Error('Recipient user no longer exists.');
    const conv = await resolveConversation(senderUser, receiverUser);
    conversationId = conv._id;
  }

  if (!conversationId) throw new Error('Conversation ID is required.');

  const senderId = senderUser._id.toString();

  // 1. Fetch conversation and verify sender is a participant
  let conversation = null;
  if (mongoose.connection.readyState === 1) {
    conversation = await Conversation.findById(conversationId);
  } else {
    const db = devStore.read();
    conversation = (db.conversations || []).find((c) => c._id?.toString() === conversationId.toString());
  }

  if (!conversation) {
    const err = new Error('Conversation not found.');
    err.statusCode = 404;
    throw err;
  }

  const participants = conversation.participants || [];
  const senderParticipant = participants.find(
    (p) => (p.user?._id || p.user)?.toString() === senderId
  );
  if (!senderParticipant) {
    const err = new Error('Access denied: You are not a participant in this conversation.');
    err.statusCode = 403;
    throw err;
  }

  // 2. Identify receiver participant
  const receiverParticipant = participants.find(
    (p) => (p.user?._id || p.user)?.toString() !== senderId
  );
  if (!receiverParticipant) {
    const err = new Error('Receiver participant not found in conversation.');
    err.statusCode = 400;
    throw err;
  }
  const receiverUserId = (receiverParticipant.user?._id || receiverParticipant.user)?.toString();

  // 3. Verify sender permissions with receiver
  const receiverUser = await getUserById(receiverUserId);
  if (!receiverUser) {
    const err = new Error('Recipient user no longer exists.');
    err.statusCode = 404;
    throw err;
  }

  const permission = await verifyMessagingPermission(senderUser, receiverUser);
  if (!permission.authorized) {
    const err = new Error(permission.message);
    err.statusCode = 403;
    throw err;
  }

  // 4. Save message
  const now = new Date();
  const payload = {
    conversationId: conversation._id,
    senderId: senderUser._id,
    receiverId: receiverUser._id,
    receiver: receiverUser._id,
    user: senderUser._id,
    sender: senderUser.role,
    text: trimmedText,
    attachments: validAttachments,
    isEdited: false,
    editedAt: null,
    editHistory: [],
    isDeleted: false,
    deletedAt: null,
    deletedBy: null,
    sessionId: conversation._id.toString(),
    createdAt: now,
    updatedAt: now,
  };

  let newMsg = null;
  if (mongoose.connection.readyState === 1) {
    newMsg = await ChatMessage.create(payload);

    // Update conversation lastMessage
    await Conversation.findByIdAndUpdate(conversation._id, {
      lastMessage: newMsg._id,
      lastMessageAt: now,
    });
  } else {
    const db = devStore.read();
    if (!Array.isArray(db.chatMessages)) db.chatMessages = [];
    newMsg = {
      _id: new mongoose.Types.ObjectId().toString(),
      ...payload,
      conversationId: conversation._id.toString(),
      senderId: senderUser._id.toString(),
      receiverId: receiverUser._id.toString(),
      receiver: receiverUser._id.toString(),
      user: senderUser._id.toString(),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
    db.chatMessages.push(newMsg);

    // Update conversation in devStore
    const convIdx = db.conversations.findIndex((c) => c._id?.toString() === conversation._id.toString());
    if (convIdx !== -1) {
      db.conversations[convIdx].lastMessage = newMsg._id;
      db.conversations[convIdx].lastMessageAt = now.toISOString();
    }
    devStore.write(db);
  }

  // 5. Trigger recipient notification
  try {
    let link = '/student/messages';
    const rRole = receiverUser.role;
    if (rRole === 'agency') link = '/agency/messages';
    else if (rRole === 'agent') link = '/agent/messages';
    else if (rRole === 'university_rep' || rRole === 'university') link = '/university-rep/messages';

    const notifText = trimmedText || (validAttachments.length > 0 ? `Sent an attachment: ${validAttachments[0].originalName}` : 'New message');

    const notifPayload = {
      user: receiverUser._id,
      title: `New message from ${senderUser.name || 'User'}`,
      message: notifText.slice(0, 100),
      type: 'info',
      link,
      actionUrl: link,
      relatedEntityType: 'message',
      relatedEntityId: newMsg._id.toString(),
    };

    if (mongoose.connection.readyState === 1) {
      await Notification.create(notifPayload);
    } else {
      const db = devStore.read();
      if (!Array.isArray(db.notifications)) db.notifications = [];
      db.notifications.push({
        _id: new mongoose.Types.ObjectId().toString(),
        ...notifPayload,
        user: receiverUser._id.toString(),
        read: false,
        createdAt: new Date().toISOString(),
      });
      devStore.write(db);
    }
  } catch (notifErr) {
    console.warn('[Notification Error]', notifErr.message);
  }

  const formatted = formatMessageForResponse(newMsg);

  // Trigger real-time event broadcast to conversation room and receiver notification room
  try {
    emitNewMessage(conversation._id.toString(), formatted, receiverUser._id.toString());
  } catch (socketErr) {
    console.warn('[Socket Broadcast Error]', socketErr.message);
  }

  return formatted;
};

/**
 * Fetch paginated messages for a conversation.
 * Inverts pagination so page 1 fetches newest messages via createdAt: -1,
 * and reverses the page slice to return chronological (oldest -> newest) order to frontend.
 */
export const getConversationMessages = async (conversationId, userId, { page = 1, limit = 50 } = {}) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 50));
  const skip = (pageNum - 1) * limitNum;
  const convIdStr = conversationId.toString();
  const uidStr = (userId?._id || userId)?.toString();

  // Verify conversation membership
  let conversation = null;
  if (mongoose.connection.readyState === 1) {
    conversation = await Conversation.findById(conversationId);
  } else {
    const db = devStore.read();
    conversation = (db.conversations || []).find((c) => c._id?.toString() === convIdStr);
  }

  if (!conversation) {
    const err = new Error('Conversation not found.');
    err.statusCode = 404;
    throw err;
  }

  const isMember = (conversation.participants || []).some(
    (p) => (p.user?._id || p.user)?.toString() === uidStr
  );
  if (!isMember) {
    const err = new Error('Access denied: You are not a participant in this conversation.');
    err.statusCode = 403;
    throw err;
  }

  if (mongoose.connection.readyState === 1) {
    const total = await ChatMessage.countDocuments({
      $or: [
        { conversationId },
        { sessionId: convIdStr },
      ],
    });

    const rawMessages = await ChatMessage.find({
      $or: [
        { conversationId },
        { sessionId: convIdStr },
      ],
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('senderId', 'name email role avatar')
      .populate('receiverId', 'name email role avatar')
      .lean();

    // Reverse descending page to render chronological (oldest -> newest) order
    const chronological = rawMessages.reverse().map(formatMessageForResponse);

    return {
      messages: chronological,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
        hasNextPage: pageNum * limitNum < total,
      },
    };
  } else {
    const db = devStore.read();
    const all = (db.chatMessages || []).filter(
      (m) => m.conversationId?.toString() === convIdStr || m.sessionId?.toString() === convIdStr
    );
    // Sort descending (newest first)
    all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const total = all.length;
    const pagedDescending = all.slice(skip, skip + limitNum);
    // Reverse to chronological (oldest -> newest)
    const chronological = pagedDescending.reverse().map((m) => {
      const sUser = (db.users || []).find((u) => u._id?.toString() === m.senderId?.toString() || u._id?.toString() === m.user?.toString());
      const rUser = (db.users || []).find((u) => u._id?.toString() === m.receiverId?.toString() || u._id?.toString() === m.receiver?.toString());
      const populated = {
        ...m,
        senderId: sUser ? { _id: sUser._id, name: sUser.name, email: sUser.email, role: sUser.role, avatar: sUser.avatar } : m.senderId,
        receiverId: rUser ? { _id: rUser._id, name: rUser.name, email: rUser.email, role: rUser.role, avatar: rUser.avatar } : m.receiverId,
      };
      return formatMessageForResponse(populated);
    });

    return {
      messages: chronological,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
        hasNextPage: pageNum * limitNum < total,
      },
    };
  }
};

/**
 * Edit a sent message within the 5-minute edit window.
 * Strictly sender-only, records editHistory, updates isEdited and editedAt.
 */
export const editMessage = async (conversationId, messageId, userId, newText) => {
  if (!conversationId || !messageId) {
    const err = new Error('Conversation ID and Message ID are required.');
    err.statusCode = 400;
    throw err;
  }

  if (typeof newText !== 'string' || !newText.trim()) {
    const err = new Error('Message text cannot be empty.');
    err.statusCode = 400;
    throw err;
  }

  const trimmedText = newText.trim();
  if (trimmedText.length > 5000) {
    const err = new Error('Message text exceeds maximum length of 5000 characters.');
    err.statusCode = 400;
    throw err;
  }

  const convIdStr = conversationId.toString();
  const msgIdStr = messageId.toString();
  const uidStr = (userId?._id || userId)?.toString();

  // 1. Verify conversation exists and user is a participant
  let conversation = null;
  if (mongoose.connection.readyState === 1) {
    conversation = await Conversation.findById(conversationId);
  } else {
    const db = devStore.read();
    conversation = (db.conversations || []).find((c) => c._id?.toString() === convIdStr);
  }

  if (!conversation) {
    const err = new Error('Conversation not found.');
    err.statusCode = 404;
    throw err;
  }

  const isMember = (conversation.participants || []).some(
    (p) => (p.user?._id || p.user)?.toString() === uidStr
  );
  if (!isMember) {
    const err = new Error('Access denied: You are not a participant in this conversation.');
    err.statusCode = 403;
    throw err;
  }

  // 2. Fetch message
  let msg = null;
  if (mongoose.connection.readyState === 1) {
    msg = await ChatMessage.findOne({
      _id: messageId,
      $or: [{ conversationId }, { sessionId: convIdStr }],
    });
  } else {
    const db = devStore.read();
    msg = (db.chatMessages || []).find(
      (m) =>
        m._id?.toString() === msgIdStr &&
        (m.conversationId?.toString() === convIdStr || m.sessionId?.toString() === convIdStr)
    );
  }

  if (!msg) {
    const err = new Error('Message not found in this conversation.');
    err.statusCode = 404;
    throw err;
  }

  // 3. Sender authorization check
  const senderId = (msg.senderId?._id || msg.senderId || msg.user?._id || msg.user)?.toString();
  if (senderId !== uidStr) {
    const err = new Error('Access denied: You can only edit your own messages.');
    err.statusCode = 403;
    throw err;
  }

  // 4. Check if message is deleted
  if (msg.isDeleted) {
    const err = new Error('Deleted messages cannot be edited.');
    err.statusCode = 400;
    throw err;
  }

  // 5. Check 3-minute edit window (3 * 60 * 1000 ms = 180,000 ms)
  const EDIT_WINDOW_MS = 3 * 60 * 1000;
  const createdAtMs = new Date(msg.createdAt).getTime();
  const messageAge = Date.now() - createdAtMs;

  if (messageAge > EDIT_WINDOW_MS) {
    const err = new Error('The 3-minute edit window for this message has expired.');
    err.statusCode = 400;
    throw err;
  }

  // 6. Update message with editHistory
  const now = new Date();
  if (mongoose.connection.readyState === 1) {
    if (!Array.isArray(msg.editHistory)) msg.editHistory = [];
    msg.editHistory.push({
      previousContent: msg.text,
      editedAt: now,
    });
    msg.text = trimmedText;
    msg.isEdited = true;
    msg.editedAt = now;
    await msg.save();
    const formatted = formatMessageForResponse(msg);
    try {
      emitMessageEdited(convIdStr, formatted);
    } catch (socketErr) {
      console.warn('[Socket Broadcast Error]', socketErr.message);
    }
    return formatted;
  } else {
    const db = devStore.read();
    const mIdx = (db.chatMessages || []).findIndex((m) => m._id?.toString() === msgIdStr);
    if (mIdx === -1) {
      const err = new Error('Message not found.');
      err.statusCode = 404;
      throw err;
    }
    const target = db.chatMessages[mIdx];
    if (!Array.isArray(target.editHistory)) target.editHistory = [];
    target.editHistory.push({
      previousContent: target.text,
      editedAt: now.toISOString(),
    });
    target.text = trimmedText;
    target.isEdited = true;
    target.editedAt = now.toISOString();
    target.updatedAt = now.toISOString();
    devStore.write(db);
    const formatted = formatMessageForResponse(target);
    try {
      emitMessageEdited(convIdStr, formatted);
    } catch (socketErr) {
      console.warn('[Socket Broadcast Error]', socketErr.message);
    }
    return formatted;
  }
};

/**
 * Message deletion is strictly prohibited per master platform rules.
 */
export const softDeleteMessage = async () => {
  const err = new Error('Message deletion is not permitted on this platform.');
  err.statusCode = 405;
  throw err;
};


/**
 * Stream/download an authorized attachment file safely.
 * Validates participant authorization, message ownership, path traversal,
 * and serves file strictly from ATTACHMENTS_DIR.
 */
export const getAttachmentStream = async (conversationIdOrObj, filename, userId) => {
  let convId = conversationIdOrObj;
  let fname = filename;
  let uId = userId;

  if (conversationIdOrObj && typeof conversationIdOrObj === 'object' && conversationIdOrObj.conversationId) {
    convId = conversationIdOrObj.conversationId;
    fname = conversationIdOrObj.filename;
    uId = conversationIdOrObj.userId || conversationIdOrObj.requestingUser || conversationIdOrObj.user;
  }

  if (!fname || typeof fname !== 'string') {
    const err = new Error('Filename is required.');
    err.statusCode = 400;
    throw err;
  }

  // Anti-Path Traversal: reject any relative segments, slashes, or backslashes
  if (fname.includes('..') || fname.includes('/') || fname.includes('\\')) {
    const err = new Error('Invalid filename specified.');
    err.statusCode = 400;
    throw err;
  }

  const convIdStr = (convId?._id || convId)?.toString();
  const uidStr = (uId?._id || uId)?.toString();

  // 1. Verify conversation exists and user is a participant
  let conversation = null;
  if (mongoose.connection.readyState === 1) {
    conversation = await Conversation.findById(convId);
  } else {
    const db = devStore.read();
    conversation = (db.conversations || []).find((c) => c._id?.toString() === convIdStr);
  }

  if (!conversation) {
    const err = new Error('Conversation not found.');
    err.statusCode = 404;
    throw err;
  }

  const isMember = (conversation.participants || []).some(
    (p) => (p.user?._id || p.user)?.toString() === uidStr
  );
  if (!isMember) {
    const err = new Error('Access denied: You are not a participant in this conversation.');
    err.statusCode = 403;
    throw err;
  }

  // 2. Locate message in this conversation containing the attachment
  let msg = null;
  if (mongoose.connection.readyState === 1) {
    msg = await ChatMessage.findOne({
      $or: [{ conversationId: convId }, { sessionId: convIdStr }],
      'attachments.filename': fname,
      isDeleted: false,
    });
  } else {
    const db = devStore.read();
    msg = (db.chatMessages || []).find(
      (m) =>
        (m.conversationId?.toString() === convIdStr || m.sessionId?.toString() === convIdStr) &&
        !m.isDeleted &&
        (m.attachments || []).some((a) => a.filename === fname)
    );
  }

  if (!msg) {
    const err = new Error('Attachment not found in this conversation.');
    err.statusCode = 404;
    throw err;
  }

  const att = (msg.attachments || []).find((a) => a.filename === fname);
  if (!att) {
    const err = new Error('Attachment metadata not found.');
    err.statusCode = 404;
    throw err;
  }

  // 3. Resolve absolute file path safely inside ATTACHMENTS_DIR
  const resolvedPath = path.resolve(ATTACHMENTS_DIR, fname);
  if (!resolvedPath.startsWith(ATTACHMENTS_DIR)) {
    const err = new Error('Path traversal violation detected.');
    err.statusCode = 403;
    throw err;
  }

  if (!fs.existsSync(resolvedPath)) {
    const err = new Error('Attachment file not found on disk.');
    err.statusCode = 404;
    throw err;
  }

  return {
    filePath: resolvedPath,
    mimeType: att.mimeType,
    originalName: att.originalName,
    size: att.size,
  };
};

/**
 * List all active conversations for a user, sorted by lastMessageAt descending.
 */
export const getUserConversations = async (userId) => {
  const rawUid = userId?._id || userId;
  const uidStr = rawUid.toString();

  if (mongoose.connection.readyState === 1) {
    const list = await Conversation.find({ 'participants.user': rawUid })
      .sort({ lastMessageAt: -1, updatedAt: -1 })
      .populate('participants.user', 'name email role phone avatar gpa targetCountry targetCourse designation department universityId agencyId')
      .populate('lastMessage')
      .lean();

    return list;
  } else {
    const db = devStore.read();
    const list = (db.conversations || []).filter((c) =>
      (c.participants || []).some((p) => (p.user?._id || p.user)?.toString() === uidStr)
    );

    list.sort((a, b) => new Date(b.lastMessageAt || b.updatedAt) - new Date(a.lastMessageAt || a.updatedAt));

    const enriched = list.map((c) => {
      const parts = (c.participants || []).map((p) => {
        const uId = (p.user?._id || p.user)?.toString();
        const u = (db.users || []).find((usr) => usr._id?.toString() === uId);
        return {
          role: p.role,
          user: u ? { _id: u._id, name: u.name, email: u.email, role: u.role, phone: u.phone, avatar: u.avatar } : null,
        };
      });

      const lastMsg = c.lastMessage
        ? (db.chatMessages || []).find((m) => m._id?.toString() === c.lastMessage?.toString())
        : null;

      return {
        ...c,
        participants: parts,
        lastMessage: lastMsg,
      };
    });

    return enriched;
  }
};

/**
 * Get authorized contacts for a specific user based on RBAC & business relationships
 */
export const getAuthorizedContacts = async (user) => {
  const userId = user._id;
  const uidStr = userId.toString();
  const role = user.role;
  const contacts = [];

  if (role === 'student') {
    // 1. Assigned agents & agencies
    if (mongoose.connection.readyState === 1) {
      const apps = await Application.find({ user: userId })
        .populate('assignedAgent', 'name email phone avatar role')
        .populate('assignedAgency', 'name email phone avatar role')
        .lean();

      const orders = await AgencyServiceOrder.find({ user: userId }).lean();

      const seenIds = new Set();
      for (const a of apps) {
        if (a.assignedAgent && !seenIds.has(a.assignedAgent._id.toString())) {
          contacts.push({ ...a.assignedAgent, type: 'Counselor' });
          seenIds.add(a.assignedAgent._id.toString());
        }
        if (a.assignedAgency && !seenIds.has(a.assignedAgency._id.toString())) {
          contacts.push({ ...a.assignedAgency, type: 'Agency' });
          seenIds.add(a.assignedAgency._id.toString());
        }
      }
      for (const o of orders) {
        const agyId = o.assignedAgency?.agencyId;
        if (agyId && !seenIds.has(agyId)) {
          const agyUser = await User.findById(agyId).select('name email phone avatar role').lean();
          if (agyUser) {
            contacts.push({ ...agyUser, type: 'Agency' });
            seenIds.add(agyId);
          }
        }
        const agtId = o.assignedAgency?.agentId;
        if (agtId && !seenIds.has(agtId)) {
          const agtUser = await User.findById(agtId).select('name email phone avatar role').lean();
          if (agtUser) {
            contacts.push({ ...agtUser, type: 'Counselor' });
            seenIds.add(agtId);
          }
        }
      }
    } else {
      const db = devStore.read();
      const apps = (db.applications || []).filter((a) => a.user?.toString() === uidStr);
      const orders = (db.agencyServiceOrders || []).filter((o) => o.user?.toString() === uidStr);
      const seenIds = new Set();

      for (const a of apps) {
        if (a.assignedAgent) {
          const ag = (db.users || []).find((u) => u._id?.toString() === a.assignedAgent.toString());
          if (ag && !seenIds.has(ag._id)) {
            contacts.push({ ...ag, type: 'Counselor' });
            seenIds.add(ag._id);
          }
        }
        if (a.assignedAgency) {
          const agy = (db.users || []).find((u) => u._id?.toString() === a.assignedAgency.toString());
          if (agy && !seenIds.has(agy._id)) {
            contacts.push({ ...agy, type: 'Agency' });
            seenIds.add(agy._id);
          }
        }
      }
      for (const o of orders) {
        const agyId = o.assignedAgency?.agencyId;
        if (agyId && !seenIds.has(agyId)) {
          const agy = (db.users || []).find((u) => u._id?.toString() === agyId);
          if (agy) {
            contacts.push({ ...agy, type: 'Agency' });
            seenIds.add(agyId);
          }
        }
        const agtId = o.assignedAgency?.agentId;
        if (agtId && !seenIds.has(agtId)) {
          const agt = (db.users || []).find((u) => u._id?.toString() === agtId);
          if (agt) {
            contacts.push({ ...agt, type: 'Counselor' });
            seenIds.add(agtId);
          }
        }
      }
    }
  } else if (role === 'agency') {
    // Agency contacts: assigned students, agents, connected unireps
    if (mongoose.connection.readyState === 1) {
      const [apps, orders, agents, conns] = await Promise.all([
        Application.find({ assignedAgency: userId }).populate('user', 'name email phone avatar role').lean(),
        AgencyServiceOrder.find({ $or: [{ agency: userId }, { 'assignedAgency.agencyId': uidStr }] }).populate('user', 'name email phone avatar role').lean(),
        User.find({ role: 'agent', agencyId: userId }).select('name email phone avatar role').lean(),
        UniversityAgencyConnection.find({ agencyId: userId, status: 'ACCEPTED' }).populate('universityRepresentativeId', 'name email phone avatar role').lean(),
      ]);

      const seenIds = new Set();
      for (const a of apps) {
        if (a.user && !seenIds.has(a.user._id.toString())) {
          contacts.push({ ...a.user, type: 'Student' });
          seenIds.add(a.user._id.toString());
        }
      }
      for (const o of orders) {
        if (o.user && !seenIds.has(o.user._id.toString())) {
          contacts.push({ ...o.user, type: 'Student' });
          seenIds.add(o.user._id.toString());
        }
      }
      for (const ag of agents) {
        if (!seenIds.has(ag._id.toString())) {
          contacts.push({ ...ag, type: 'Counselor' });
          seenIds.add(ag._id.toString());
        }
      }
      for (const c of conns) {
        if (c.universityRepresentativeId && !seenIds.has(c.universityRepresentativeId._id.toString())) {
          contacts.push({ ...c.universityRepresentativeId, type: 'University Rep' });
          seenIds.add(c.universityRepresentativeId._id.toString());
        }
      }
    } else {
      const db = devStore.read();
      const apps = (db.applications || []).filter((a) => a.assignedAgency?.toString() === uidStr);
      const orders = (db.agencyServiceOrders || []).filter(
        (o) => o.agency?.toString() === uidStr || o.assignedAgency?.agencyId?.toString() === uidStr
      );
      const agents = (db.users || []).filter((u) => u.role === 'agent' && u.agencyId?.toString() === uidStr);
      const conns = (db.universityAgencyConnections || []).filter(
        (c) => c.agencyId?.toString() === uidStr && c.status === 'ACCEPTED'
      );

      const seenIds = new Set();
      for (const a of apps) {
        const u = (db.users || []).find((usr) => usr._id?.toString() === a.user?.toString());
        if (u && !seenIds.has(u._id)) {
          contacts.push({ ...u, type: 'Student' });
          seenIds.add(u._id);
        }
      }
      for (const o of orders) {
        const u = (db.users || []).find((usr) => usr._id?.toString() === o.user?.toString());
        if (u && !seenIds.has(u._id)) {
          contacts.push({ ...u, type: 'Student' });
          seenIds.add(u._id);
        }
      }
      for (const ag of agents) {
        if (!seenIds.has(ag._id)) {
          contacts.push({ ...ag, type: 'Counselor' });
          seenIds.add(ag._id);
        }
      }
      for (const c of conns) {
        const u = (db.users || []).find((usr) => usr._id?.toString() === c.universityRepresentativeId?.toString());
        if (u && !seenIds.has(u._id)) {
          contacts.push({ ...u, type: 'University Rep' });
          seenIds.add(u._id);
        }
      }
    }
  } else if (role === 'agent') {
    // Agent contacts: assigned students and managing agency
    if (mongoose.connection.readyState === 1) {
      const apps = await Application.find({ assignedAgent: userId }).populate('user', 'name email phone avatar role').lean();
      const seenIds = new Set();
      for (const a of apps) {
        if (a.user && !seenIds.has(a.user._id.toString())) {
          contacts.push({ ...a.user, type: 'Student' });
          seenIds.add(a.user._id.toString());
        }
      }
      if (user.agencyId) {
        const agy = await User.findById(user.agencyId).select('name email phone avatar role').lean();
        if (agy) contacts.push({ ...agy, type: 'Managing Agency' });
      }
    } else {
      const db = devStore.read();
      const apps = (db.applications || []).filter((a) => a.assignedAgent?.toString() === uidStr);
      const seenIds = new Set();
      for (const a of apps) {
        const u = (db.users || []).find((usr) => usr._id?.toString() === a.user?.toString());
        if (u && !seenIds.has(u._id)) {
          contacts.push({ ...u, type: 'Student' });
          seenIds.add(u._id);
        }
      }
      if (user.agencyId) {
        const agy = (db.users || []).find((u) => u._id?.toString() === user.agencyId?.toString());
        if (agy) contacts.push({ ...agy, type: 'Managing Agency' });
      }
    }
  } else if (role === 'university_rep' || role === 'university') {
    // UniRep contacts: accepted partner agencies and applicant students
    if (mongoose.connection.readyState === 1) {
      const conns = await UniversityAgencyConnection.find({
        status: 'ACCEPTED',
        $or: [
          { universityRepresentativeId: userId },
          ...(user.universityId ? [{ universityId: user.universityId }] : []),
        ],
      }).populate('agencyId', 'name email phone avatar role').lean();

      const seenIds = new Set();
      for (const c of conns) {
        if (c.agencyId && !seenIds.has(c.agencyId._id.toString())) {
          contacts.push({ ...c.agencyId, type: 'Partner Agency' });
          seenIds.add(c.agencyId._id.toString());
        }
      }

      // Also include students who applied to this university
      if (user.universityId) {
        const apps = await Application.find({ university: user.universityId }).populate('user', 'name email phone avatar role').lean();
        for (const a of apps) {
          if (a.user && !seenIds.has(a.user._id.toString())) {
            contacts.push({ ...a.user, type: 'Applicant Student' });
            seenIds.add(a.user._id.toString());
          }
        }
      }
    } else {
      const db = devStore.read();
      const conns = (db.universityAgencyConnections || []).filter(
        (c) =>
          c.status === 'ACCEPTED' &&
          (c.universityRepresentativeId?.toString() === uidStr ||
            (user.universityId && c.universityId?.toString() === user.universityId.toString()))
      );
      const seenIds = new Set();
      for (const c of conns) {
        const agy = (db.users || []).find((u) => u._id?.toString() === c.agencyId?.toString());
        if (agy && !seenIds.has(agy._id)) {
          contacts.push({ ...agy, type: 'Partner Agency' });
          seenIds.add(agy._id);
        }
      }

      // Also include students who applied to this university in devStore
      if (user.universityId) {
        const apps = (db.applications || []).filter(
          (a) => a.university?.toString() === user.universityId?.toString() || a.universityId?.toString() === user.universityId?.toString()
        );
        for (const a of apps) {
          const u = (db.users || []).find((usr) => usr._id?.toString() === a.user?.toString());
          if (u && !seenIds.has(u._id)) {
            contacts.push({ ...u, type: 'Applicant Student' });
            seenIds.add(u._id);
          }
        }
      }
    }
  } else if (role === 'admin') {
    // Admin contacts: full directory of active users for direct messaging
    if (mongoose.connection.readyState === 1) {
      const allUsers = await User.find({ role: { $in: ['student', 'agency', 'agent', 'university_rep', 'university'] } })
        .select('name email phone avatar role department designation')
        .lean();
      for (const u of allUsers) {
        contacts.push({ ...u, type: u.role ? u.role.charAt(0).toUpperCase() + u.role.slice(1) : 'User' });
      }
    } else {
      const db = devStore.read();
      const allUsers = (db.users || []).filter((u) => ['student', 'agency', 'agent', 'university_rep', 'university'].includes(u.role));
      for (const u of allUsers) {
        contacts.push({ ...u, type: u.role ? u.role.charAt(0).toUpperCase() + u.role.slice(1) : 'User' });
      }
    }
  }

  // Ensure Admin Support contact is available for non-admin users
  if (role !== 'admin') {
    let adminUser = null;
    if (mongoose.connection.readyState === 1) {
      adminUser = await User.findOne({ role: 'admin' }).select('name email phone avatar role').lean();
    } else {
      adminUser = (devStore.read().users || []).find((u) => u.role === 'admin');
    }
    if (adminUser && !contacts.some((c) => c._id?.toString() === adminUser._id?.toString())) {
      contacts.push({ ...adminUser, type: 'Admify Support / Admin' });
    }
  }

  return contacts;
};


/**
 * Add or toggle an emoji reaction on a message.
 * Rules: One reaction per user per emoji. Clicking the same emoji toggles it off.
 * Reactions cannot be added to soft-deleted messages.
 */
export const addOrToggleReaction = async (conversationIdOrObj, messageId, userId, emoji) => {
  let convId = conversationIdOrObj;
  let msgId = messageId;
  let uId = userId;
  let em = emoji;

  if (conversationIdOrObj && typeof conversationIdOrObj === 'object' && conversationIdOrObj.conversationId) {
    convId = conversationIdOrObj.conversationId;
    msgId = conversationIdOrObj.messageId;
    uId = conversationIdOrObj.userId || conversationIdOrObj.user;
    em = conversationIdOrObj.emoji;
  }

  if (!convId || !msgId) {
    const err = new Error('Conversation ID and Message ID are required.');
    err.statusCode = 400;
    throw err;
  }

  const trimmedEmoji = typeof em === 'string' ? em.trim() : '';
  if (!trimmedEmoji) {
    const err = new Error('Emoji is required.');
    err.statusCode = 400;
    throw err;
  }

  const convIdStr = (convId?._id || convId)?.toString();
  const msgIdStr = (msgId?._id || msgId)?.toString();
  const uidStr = (uId?._id || uId)?.toString();

  // 1. Verify user is participant in conversation
  let conversation = null;
  if (mongoose.connection.readyState === 1) {
    conversation = await Conversation.findById(convId);
  } else {
    const db = devStore.read();
    conversation = (db.conversations || []).find((c) => c._id?.toString() === convIdStr);
  }

  if (!conversation) {
    const err = new Error('Conversation not found.');
    err.statusCode = 404;
    throw err;
  }

  const isMember = (conversation.participants || []).some(
    (p) => (p.user?._id || p.user)?.toString() === uidStr
  );
  if (!isMember) {
    const err = new Error('Access denied: You are not a participant in this conversation.');
    err.statusCode = 403;
    throw err;
  }

  // 2. Fetch message
  let msg = null;
  if (mongoose.connection.readyState === 1) {
    msg = await ChatMessage.findOne({
      _id: msgId,
      $or: [{ conversationId: convId }, { sessionId: convIdStr }],
    });
  } else {
    const db = devStore.read();
    msg = (db.chatMessages || []).find(
      (m) =>
        m._id?.toString() === msgIdStr &&
        (m.conversationId?.toString() === convIdStr || m.sessionId?.toString() === convIdStr)
    );
  }

  if (!msg) {
    const err = new Error('Message not found in this conversation.');
    err.statusCode = 404;
    throw err;
  }

  if (msg.isDeleted) {
    const err = new Error('Deleted messages cannot receive reactions.');
    err.statusCode = 400;
    throw err;
  }

  // 3. Toggle reaction: if user already added this emoji, remove it; else append it
  const reactions = Array.isArray(msg.reactions) ? [...msg.reactions] : [];
  const existingIdx = reactions.findIndex(
    (r) => (r.user?._id || r.user)?.toString() === uidStr && r.emoji === trimmedEmoji
  );

  let action = 'added';
  if (existingIdx !== -1) {
    reactions.splice(existingIdx, 1);
    action = 'removed';
  } else {
    reactions.push({
      user: uidStr,
      emoji: trimmedEmoji,
      createdAt: new Date(),
    });
  }

  // 4. Save
  if (mongoose.connection.readyState === 1) {
    msg.reactions = reactions;
    await msg.save();
  } else {
    const db = devStore.read();
    const mIdx = (db.chatMessages || []).findIndex((m) => m._id?.toString() === msgIdStr);
    if (mIdx !== -1) {
      db.chatMessages[mIdx].reactions = reactions.map((r) => ({
        user: (r.user?._id || r.user)?.toString(),
        emoji: r.emoji,
        createdAt: r.createdAt?.toISOString ? r.createdAt.toISOString() : new Date().toISOString(),
      }));
      devStore.write(db);
    }
  }

  const safeReactions = reactions.map((r) => ({
    user: (r.user?._id || r.user)?.toString(),
    emoji: r.emoji,
    createdAt: r.createdAt,
  }));

  // Emit real-time reaction update
  try {
    emitReactionUpdated(convIdStr, msgIdStr, safeReactions);
  } catch (socketErr) {
    console.warn('[Socket Broadcast Error]', socketErr.message);
  }

  return {
    success: true,
    messageId: msgIdStr,
    action,
    reactions: safeReactions,
  };
};

/**
 * Mark all incoming messages in a conversation as read/seen.
 */
export const markConversationAsRead = async (conversationId, userId) => {
  const convIdStr = conversationId.toString();
  const uidStr = (userId?._id || userId)?.toString();
  const now = new Date();

  // Verify membership
  let conversation = null;
  if (mongoose.connection.readyState === 1) {
    conversation = await Conversation.findById(conversationId);
  } else {
    const db = devStore.read();
    conversation = (db.conversations || []).find((c) => c._id?.toString() === convIdStr);
  }

  if (!conversation) {
    const err = new Error('Conversation not found.');
    err.statusCode = 404;
    throw err;
  }

  const isMember = (conversation.participants || []).some(
    (p) => (p.user?._id || p.user)?.toString() === uidStr
  );
  if (!isMember) {
    const err = new Error('Access denied: You are not a participant in this conversation.');
    err.statusCode = 403;
    throw err;
  }

  // Update messages in MongoDB or devStore
  if (mongoose.connection.readyState === 1) {
    await ChatMessage.updateMany(
      {
        $or: [{ conversationId }, { sessionId: convIdStr }],
        $or: [{ receiverId: userId }, { receiver: userId }],
      },
      {
        $set: {
          isSeenByStudent: true,
          studentSeenAt: now,
        },
      }
    );
  } else {
    const db = devStore.read();
    let changed = false;
    (db.chatMessages || []).forEach((m) => {
      if (
        (m.conversationId?.toString() === convIdStr || m.sessionId?.toString() === convIdStr) &&
        (m.receiverId?.toString() === uidStr || m.receiver?.toString() === uidStr)
      ) {
        m.isSeenByStudent = true;
        m.studentSeenAt = now.toISOString();
        changed = true;
      }
    });
    if (changed) devStore.write(db);
  }

  // Emit real-time read event to room
  try {
    emitMessageRead(convIdStr, uidStr, now);
  } catch (socketErr) {
    console.warn('[Socket Broadcast Error]', socketErr.message);
  }

  return { success: true, conversationId: convIdStr, readAt: now };
};

/**
 * Admin Supervisory Monitoring: List all user conversations with search & role filter.
 * Read-only supervisory endpoint for platform compliance.
 */
export const getSupervisoryConversations = async (
  { page = 1, limit = 20, search = '', role = '', status = '' } = {},
  adminUser
) => {
  if (!adminUser || adminUser.role !== 'admin') {
    const err = new Error('Access denied: Admin role required for supervisory monitoring.');
    err.statusCode = 403;
    throw err;
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;
  const searchLower = (search || '').toLowerCase().trim();

  if (mongoose.connection.readyState === 1) {
    const query = {};
    if (status && ['active', 'closed'].includes(status)) {
      query.status = status;
    }

    let conversations = await Conversation.find(query)
      .populate('participants.user', 'name email role avatar')
      .populate('lastMessage')
      .sort({ lastMessageAt: -1, updatedAt: -1 })
      .lean();

    if (searchLower) {
      conversations = conversations.filter((c) =>
        (c.participants || []).some(
          (p) =>
            p.user?.name?.toLowerCase().includes(searchLower) ||
            p.user?.email?.toLowerCase().includes(searchLower)
        )
      );
    }

    if (role) {
      conversations = conversations.filter((c) =>
        (c.participants || []).some((p) => p.role === role)
      );
    }

    const total = conversations.length;
    const paginated = conversations.slice(skip, skip + limitNum);

    return {
      conversations: paginated,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    };
  } else {
    const db = devStore.read();
    let convs = (db.conversations || []).map((c) => {
      const populatedParticipants = (c.participants || []).map((p) => {
        const u = (db.users || []).find((usr) => usr._id?.toString() === (p.user?._id || p.user)?.toString());
        return {
          role: p.role,
          user: u ? { _id: u._id, name: u.name, email: u.email, role: u.role, avatar: u.avatar } : null,
        };
      });
      const lastMsg = (db.chatMessages || []).find((m) => m._id?.toString() === c.lastMessage?.toString());
      return {
        ...c,
        participants: populatedParticipants,
        lastMessage: lastMsg ? formatMessageForResponse(lastMsg) : null,
      };
    });

    if (status) {
      convs = convs.filter((c) => c.status === status);
    }

    if (searchLower) {
      convs = convs.filter((c) =>
        (c.participants || []).some(
          (p) =>
            p.user?.name?.toLowerCase().includes(searchLower) ||
            p.user?.email?.toLowerCase().includes(searchLower)
        )
      );
    }

    if (role) {
      convs = convs.filter((c) =>
        (c.participants || []).some((p) => p.role === role)
      );
    }

    convs.sort((a, b) => new Date(b.lastMessageAt || b.updatedAt) - new Date(a.lastMessageAt || a.updatedAt));

    const total = convs.length;
    const paginated = convs.slice(skip, skip + limitNum);

    return {
      conversations: paginated,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    };
  }
};

/**
 * Admin Supervisory Monitoring: Full unmasked conversation timeline including edit history and audit flags.
 */
export const getSupervisoryConversationTimeline = async (conversationId, adminUser) => {
  if (!adminUser || adminUser.role !== 'admin') {
    const err = new Error('Access denied: Admin role required for supervisory monitoring.');
    err.statusCode = 403;
    throw err;
  }

  const convIdStr = conversationId.toString();

  let conversation = null;
  let messages = [];

  if (mongoose.connection.readyState === 1) {
    conversation = await Conversation.findById(conversationId)
      .populate('participants.user', 'name email role avatar phone')
      .populate('lastMessage')
      .lean();

    if (!conversation) {
      const err = new Error('Conversation not found.');
      err.statusCode = 404;
      throw err;
    }

    const rawMsgs = await ChatMessage.find({
      $or: [{ conversationId }, { sessionId: convIdStr }],
    })
      .sort({ createdAt: 1 })
      .populate('senderId', 'name email role')
      .populate('receiverId', 'name email role')
      .populate('deletedBy', 'name email role')
      .lean();

    // Supervisory view retains complete unmasked editHistory and deleted flags
    messages = rawMsgs.map((m) => ({
      _id: m._id,
      conversationId: m.conversationId,
      senderId: m.senderId,
      receiverId: m.receiverId,
      sender: m.sender,
      text: m.text, // Unmasked for supervisory audit
      attachments: (m.attachments || []).map((att) => ({
        ...att,
        url: `/api/admin/conversations/${convIdStr}/attachments/${encodeURIComponent(att.filename)}`,
      })),
      reactions: m.reactions || [],
      isEdited: Boolean(m.isEdited),
      editedAt: m.editedAt,
      editHistory: m.editHistory || [], // Exposed to admin for compliance audit
      isDeleted: Boolean(m.isDeleted),
      deletedAt: m.deletedAt,
      deletedBy: m.deletedBy,
      createdAt: m.createdAt,
    }));
  } else {
    const db = devStore.read();
    conversation = (db.conversations || []).find((c) => c._id?.toString() === convIdStr);
    if (!conversation) {
      const err = new Error('Conversation not found.');
      err.statusCode = 404;
      throw err;
    }

    const rawMsgs = (db.chatMessages || []).filter(
      (m) => m.conversationId?.toString() === convIdStr || m.sessionId?.toString() === convIdStr
    );
    rawMsgs.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    messages = rawMsgs.map((m) => ({
      _id: m._id,
      conversationId: m.conversationId,
      senderId: m.senderId,
      receiverId: m.receiverId,
      sender: m.sender,
      text: m.text,
      attachments: (m.attachments || []).map((att) => ({
        ...att,
        url: `/api/admin/conversations/${convIdStr}/attachments/${encodeURIComponent(att.filename)}`,
      })),
      reactions: m.reactions || [],
      isEdited: Boolean(m.isEdited),
      editedAt: m.editedAt,
      editHistory: m.editHistory || [],
      isDeleted: Boolean(m.isDeleted),
      deletedAt: m.deletedAt,
      deletedBy: m.deletedBy,
      createdAt: m.createdAt,
    }));
  }

  return { conversation, messages };
};

/**
 * Admin Supervisory Monitoring: Download attachment with admin audit clearance.
 */
export const getSupervisoryAttachmentStream = async (conversationId, filename, adminUser) => {
  if (!adminUser || adminUser.role !== 'admin') {
    const err = new Error('Access denied: Admin role required.');
    err.statusCode = 403;
    throw err;
  }

  if (!filename || typeof filename !== 'string') {
    const err = new Error('Filename is required.');
    err.statusCode = 400;
    throw err;
  }

  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    const err = new Error('Invalid filename specified.');
    err.statusCode = 400;
    throw err;
  }

  const safeFilename = path.basename(filename);
  const filePath = path.resolve(ATTACHMENTS_DIR, safeFilename);

  if (!filePath.startsWith(ATTACHMENTS_DIR) || !fs.existsSync(filePath)) {
    const err = new Error('Attachment file not found on server.');
    err.statusCode = 404;
    throw err;
  }

  const ext = path.extname(safeFilename).toLowerCase();
  const MIME_MAP = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.pdf': 'application/pdf',
    '.webm': 'audio/webm',
    '.mp4': 'audio/mp4',
    '.m4a': 'audio/mp4',
    '.ogg': 'audio/ogg',
    '.mp3': 'audio/mpeg',
  };

  return {
    filePath,
    filename: safeFilename,
    originalName: safeFilename,
    mimeType: MIME_MAP[ext] || 'application/octet-stream',
  };
};
