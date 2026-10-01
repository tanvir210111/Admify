import express from 'express';
import {
  sendMessage,
  requestLiveAgent,
  sendVisitorReply,
  getSessionHistory,
} from '../controllers/chatController.js';
import { publicChatRateLimiter } from '../middleware/rateLimiter.js';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

const optionalProtect = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'admify_super_secret_jwt_fallback_key_2026'
      );
      req.user = await User.findById(decoded.id).select('-password');
    } catch {
      // Ignore
    }
  }
  next();
};

// Public Chatbot Endpoints with Pluggable Rate Limiting
router.post('/message', publicChatRateLimiter, optionalProtect, sendMessage);
router.post('/live-agent-request', publicChatRateLimiter, optionalProtect, requestLiveAgent);
router.post('/visitor-reply', optionalProtect, sendVisitorReply);
router.get('/history/:sessionId', optionalProtect, getSessionHistory);

export default router;
