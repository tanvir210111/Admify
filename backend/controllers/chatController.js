import crypto from 'crypto';
import mongoose from 'mongoose';
import ChatMessage from '../models/ChatMessage.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import devStore from '../utils/devStore.js';
import geminiService from '../services/geminiService.js';
import { emitToAdminSupport, emitToVisitor } from '../socket/socketServer.js';

export const EXACT_AI_WARNING =
  'I’m an AI chatbot and may not always provide accurate or up-to-date information. For accurate information and personalized assistance, please talk to a live agent.';

// ── In-Memory Visitor Session Registry with devStore sync ─────────────────────
const visitorSessions = new Map();

export function getVisitorSession(token) {
  let sessionToken = typeof token === 'string' ? token.trim() : '';
  if (!sessionToken) return null;
  if (!sessionToken.startsWith('vis_')) {
    sessionToken = `vis_${sessionToken}`;
  }
  if (visitorSessions.has(sessionToken)) {
    return visitorSessions.get(sessionToken);
  }
  if (process.env.NODE_ENV !== 'production' && mongoose.connection.readyState !== 1) {
    try {
      const db = devStore.read();
      const existing = (db.visitorSessions || []).find(
        (s) => s.visitorToken === sessionToken || s.visitorToken === token
      );
      if (existing) {
        visitorSessions.set(sessionToken, existing);
        return existing;
      }
    } catch {}
  }
  return null;
}

export function getOrCreateVisitorSession(token) {
  let sessionToken = typeof token === 'string' ? token.trim() : '';
  if (!sessionToken) {
    sessionToken = `vis_${crypto.randomBytes(16).toString('hex')}`;
  } else if (!sessionToken.startsWith('vis_')) {
    sessionToken = `vis_${sessionToken}`;
  }

  if (visitorSessions.has(sessionToken)) {
    return visitorSessions.get(sessionToken);
  }

  // Check devStore backup only in development/test offline mode
  if (process.env.NODE_ENV !== 'production' && mongoose.connection.readyState !== 1) {
    try {
      const db = devStore.read();
      const existingInDb = (db.visitorSessions || []).find((s) => s.visitorToken === sessionToken);
      if (existingInDb) {
        visitorSessions.set(sessionToken, existingInDb);
        return existingInDb;
      }
    } catch {}
  }

  const newSession = {
    visitorToken: sessionToken,
    aiMessageCount: 0,
    status: 'ai', // 'ai' | 'waiting_live_agent' | 'live' | 'closed'
    visitorInfo: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  visitorSessions.set(sessionToken, newSession);

  if (process.env.NODE_ENV !== 'production' && mongoose.connection.readyState !== 1) {
    try {
      const db = devStore.read();
      if (!Array.isArray(db.visitorSessions)) db.visitorSessions = [];
      db.visitorSessions.push(newSession);
      devStore.write(db);
    } catch {}
  }

  return newSession;
}

function saveVisitorSession(session) {
  session.updatedAt = new Date().toISOString();
  visitorSessions.set(session.visitorToken, session);

  if (process.env.NODE_ENV !== 'production' && mongoose.connection.readyState !== 1) {
    try {
      const db = devStore.read();
      if (!Array.isArray(db.visitorSessions)) db.visitorSessions = [];
      const idx = db.visitorSessions.findIndex((s) => s.visitorToken === session.visitorToken);
      if (idx !== -1) {
        db.visitorSessions[idx] = session;
      } else {
        db.visitorSessions.push(session);
      }
      devStore.write(db);
    } catch (err) {
      console.warn('[Visitor Session Save Error]', err.message);
    }
  }
}

// ── 1. Website Chatbot Message Handler (Real Gemini + 4-Message Cap) ──────────
export const sendMessage = async (req, res, next) => {
  try {
    const text = req.body.text || req.body.message;
    const incomingToken = req.body.visitorToken || req.body.sessionId;

    if (!text || typeof text !== 'string' || text.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Message text is required.',
      });
    }

    const trimmedText = text.trim().slice(0, 1000);
    const session = getOrCreateVisitorSession(incomingToken || req.headers['x-visitor-token']);

    // If returning visitor with existing token in production with MongoDB, restore message count if session was fresh
    if (mongoose.connection.readyState === 1 && incomingToken && session.aiMessageCount === 0) {
      try {
        const pastAiCount = await ChatMessage.countDocuments({ sessionId: session.visitorToken, sender: 'ai' });
        if (pastAiCount > 0) {
          session.aiMessageCount = pastAiCount;
        }
      } catch {}
    }

    // ── Enforce 4 AI Message Limit Server-Side ──
    if (session.aiMessageCount >= 4) {
      return res.status(200).json({
        success: true,
        visitorToken: session.visitorToken,
        sessionId: session.visitorToken,
        aiMessageCount: session.aiMessageCount,
        remainingMessages: 0,
        limitReached: true,
        offerLiveAgent: true,
        warning: EXACT_AI_WARNING,
        canEscalateToLive: true,
        reply: EXACT_AI_WARNING,
        data: {
          reply: {
            sessionId: session.visitorToken,
            sender: 'ai',
            text: EXACT_AI_WARNING,
            isLimitWarning: true,
            createdAt: new Date().toISOString(),
          },
        },
      });
    }

    // Persist visitor question in ChatMessage
    let savedVisitorMsg = null;
    if (mongoose.connection.readyState === 1) {
      savedVisitorMsg = await ChatMessage.create({
        sessionId: session.visitorToken,
        user: req.user?._id || undefined,
        sender: 'visitor',
        text: trimmedText,
      });
    } else if (process.env.NODE_ENV !== 'production') {
      savedVisitorMsg = await devStore.addChatMessage({
        sessionId: session.visitorToken,
        user: req.user?._id?.toString() || undefined,
        sender: 'visitor',
        text: trimmedText,
      });
    } else {
      savedVisitorMsg = {
        _id: `vis_${Date.now()}`,
        sessionId: session.visitorToken,
        sender: 'visitor',
        text: trimmedText,
        createdAt: new Date().toISOString(),
      };
    }

    // Retrieve recent session history for context
    let history = [];
    if (mongoose.connection.readyState === 1) {
      history = await ChatMessage.find({ sessionId: session.visitorToken })
        .sort({ createdAt: -1 })
        .limit(6)
        .lean();
      history.reverse();
    } else if (process.env.NODE_ENV !== 'production') {
      try {
        const db = devStore.read();
        history = (db.chatMessages || [])
          .filter((m) => m.sessionId === session.visitorToken)
          .slice(-6);
      } catch {}
    }

    // Execute real Gemini generation
    const aiResponseText = await geminiService.generateChatResponse({
      prompt: trimmedText,
      conversationHistory: history,
      dbGrounding: 'Admify offers 1 Free Direct Application for international students, verified scholarships (DAAD, Chevening, Fulbright), and study options across UK, USA, Canada, Germany, Australia, and Europe.',
    });

    session.aiMessageCount += 1;
    const isNowAtLimit = session.aiMessageCount >= 4;
    saveVisitorSession(session);

    let savedAiMsg = null;
    if (mongoose.connection.readyState === 1) {
      savedAiMsg = await ChatMessage.create({
        sessionId: session.visitorToken,
        sender: 'ai',
        text: aiResponseText,
      });
    } else if (process.env.NODE_ENV !== 'production') {
      savedAiMsg = await devStore.addChatMessage({
        sessionId: session.visitorToken,
        sender: 'ai',
        text: aiResponseText,
      });
    } else {
      savedAiMsg = {
        _id: `ai_${Date.now()}`,
        sessionId: session.visitorToken,
        sender: 'ai',
        text: aiResponseText,
        createdAt: new Date().toISOString(),
      };
    }

    return res.status(200).json({
      success: true,
      visitorToken: session.visitorToken,
      sessionId: session.visitorToken,
      aiMessageCount: session.aiMessageCount,
      remainingMessages: Math.max(0, 4 - session.aiMessageCount),
      limitReached: isNowAtLimit,
      warning: isNowAtLimit ? EXACT_AI_WARNING : null,
      offerLiveAgent: isNowAtLimit,
      canEscalateToLive: isNowAtLimit,
      reply: savedAiMsg?.text,
      data: {
        reply: savedAiMsg,
        visitorMessage: savedVisitorMsg,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── 2. Live Agent Intake & Escalation ─────────────────────────────────────────
export const requestLiveAgent = async (req, res, next) => {
  try {
    const incomingToken =
      req.body.visitorToken ||
      req.body.sessionId ||
      req.headers['x-visitor-token'] ||
      req.headers['x-session-id'];
    const { fullName, email, phone } = req.body;

    // Strict form validation
    if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2 || fullName.trim().length > 100) {
      return res.status(400).json({ success: false, message: 'Valid Full Name is required (2–100 characters).' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
      return res.status(400).json({ success: false, message: 'A valid email address is required.' });
    }

    const phoneRegex = /^[\d+\-\s()]{7,25}$/;
    if (!phone || typeof phone !== 'string' || !phoneRegex.test(phone.trim())) {
      return res.status(400).json({ success: false, message: 'A valid phone number is required (7–25 digits).' });
    }

    const session = getOrCreateVisitorSession(incomingToken);
    const cleanedInfo = {
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
    };

    const isAlreadyWaiting =
      session.status === 'waiting_live_agent' || session.status === 'live';

    session.visitorInfo = cleanedInfo;
    session.status = 'waiting_live_agent';
    saveVisitorSession(session);

    // If already waiting/live, be idempotent: do not create duplicate escalation notices or duplicate notifications
    if (isAlreadyWaiting) {
      return res.status(200).json({
        success: true,
        visitorToken: session.visitorToken,
        sessionId: session.visitorToken,
        status: session.status,
        alreadyActive: true,
        message: 'Your live support request is already active. An advisor will respond shortly.',
      });
    }

    // Save escalation notice in ChatMessage with visitorInfo
    const escalationNotice = `[LIVE SUPPORT ESCALATION] Visitor: ${cleanedInfo.fullName} | Email: ${cleanedInfo.email} | Phone: ${cleanedInfo.phone}`;
    if (mongoose.connection.readyState === 1) {
      await ChatMessage.create({
        sessionId: session.visitorToken,
        sender: 'system',
        text: escalationNotice,
        isLiveAgentRequest: true,
        visitorInfo: cleanedInfo,
      });

      // Update prior messages in this session with visitorInfo
      try {
        await ChatMessage.updateMany(
          { sessionId: session.visitorToken, $or: [{ visitorInfo: null }, { visitorInfo: { $exists: false } }] },
          { $set: { visitorInfo: cleanedInfo } }
        );
      } catch {}
    } else if (process.env.NODE_ENV !== 'production') {
      await devStore.addChatMessage({
        sessionId: session.visitorToken,
        sender: 'system',
        text: escalationNotice,
        isLiveAgentRequest: true,
        visitorInfo: cleanedInfo,
      });
    }

    // Create Admin notification
    try {
      if (mongoose.connection.readyState === 1) {
        const adminUser = await User.findOne({ role: 'admin' });
        if (adminUser) {
          await Notification.create({
            user: adminUser._id,
            title: 'New Website Visitor Support Request',
            message: `${cleanedInfo.fullName} (${cleanedInfo.email}) requested Live Support.`,
            type: 'info',
            link: '/admin/support',
            actionUrl: '/admin/support',
            relatedEntityType: 'support',
            relatedEntityId: session.visitorToken,
          });
        }
      } else if (process.env.NODE_ENV !== 'production') {
        const db = devStore.read();
        const adminUser = (db.users || []).find((u) => u.role === 'admin');
        if (adminUser) {
          if (!Array.isArray(db.notifications)) db.notifications = [];
          db.notifications.push({
            _id: `notif_sup_${Date.now()}`,
            user: adminUser._id,
            title: 'New Website Visitor Support Request',
            message: `${cleanedInfo.fullName} (${cleanedInfo.email}) requested Live Support.`,
            type: 'info',
            link: '/admin/support',
            actionUrl: '/admin/support',
            relatedEntityType: 'support',
            relatedEntityId: session.visitorToken,
            read: false,
            createdAt: new Date().toISOString(),
          });
          devStore.write(db);
        }
      }
    } catch (notifErr) {
      console.warn('[Admin Notification Error]', notifErr.message);
    }

    // Broadcast real-time support notification to Admin desk
    try {
      emitToAdminSupport('new_support_request', {
        sessionId: session.visitorToken,
        visitorInfo: cleanedInfo,
        requestedAt: new Date().toISOString(),
      });
    } catch {}

    return res.status(200).json({
      success: true,
      visitorToken: session.visitorToken,
      sessionId: session.visitorToken,
      status: 'waiting_live_agent',
      message: 'Your request has been routed to our live admissions desk. An advisor will respond shortly.',
    });
  } catch (error) {
    next(error);
  }
};

// ── 3. Visitor Sends Message to Admin (Live Mode) ─────────────────────────────
export const sendVisitorReply = async (req, res, next) => {
  try {
    const incomingToken =
      req.body.visitorToken ||
      req.body.sessionId ||
      req.headers['x-visitor-token'] ||
      req.headers['x-session-id'];
    const { text } = req.body;
    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Message text is required.' });
    }

    const session = getOrCreateVisitorSession(incomingToken);
    const trimmedText = text.trim().slice(0, 1000);

    let savedMsg = null;
    if (mongoose.connection.readyState === 1) {
      savedMsg = await ChatMessage.create({
        sessionId: session.visitorToken,
        sender: 'visitor',
        text: trimmedText,
        visitorInfo: session.visitorInfo || undefined,
      });
    } else if (process.env.NODE_ENV !== 'production') {
      savedMsg = await devStore.addChatMessage({
        sessionId: session.visitorToken,
        sender: 'visitor',
        text: trimmedText,
        visitorInfo: session.visitorInfo || undefined,
      });
    } else {
      savedMsg = {
        _id: `vis_${Date.now()}`,
        sessionId: session.visitorToken,
        sender: 'visitor',
        text: trimmedText,
        visitorInfo: session.visitorInfo || undefined,
        createdAt: new Date().toISOString(),
      };
    }

    // Broadcast live to Admin support desk
    try {
      emitToAdminSupport('support_message_received', {
        sessionId: session.visitorToken,
        message: savedMsg,
      });
    } catch {}

    return res.status(201).json({
      success: true,
      data: { message: savedMsg },
    });
  } catch (error) {
    next(error);
  }
};

// ── 4. Retrieve Visitor Session History (Secure, Token-Scoped) ────────────────
export const getSessionHistory = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    if (!sessionId || typeof sessionId !== 'string') {
      return res.status(400).json({ success: false, message: 'Session ID is required.' });
    }

    const session = visitorSessions.get(sessionId) || getOrCreateVisitorSession(sessionId);

    let messages = [];
    if (mongoose.connection.readyState === 1) {
      messages = await ChatMessage.find({ sessionId }).sort({ createdAt: 1 }).limit(100).lean();
    } else if (process.env.NODE_ENV !== 'production') {
      try {
        const db = devStore.read();
        messages = (db.chatMessages || [])
          .filter((m) => m.sessionId === sessionId)
          .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      } catch {}
    }

    return res.status(200).json({
      success: true,
      visitorToken: session.visitorToken,
      aiMessageCount: session.aiMessageCount || 0,
      limitReached: (session.aiMessageCount || 0) >= 4,
      status: session.status || 'ai',
      visitorInfo: session.visitorInfo || null,
      count: messages.length,
      data: { messages },
    });
  } catch (error) {
    next(error);
  }
};

export default {
  sendMessage,
  requestLiveAgent,
  sendVisitorReply,
  getSessionHistory,
  getVisitorSession,
  getOrCreateVisitorSession,
  EXACT_AI_WARNING,
};
