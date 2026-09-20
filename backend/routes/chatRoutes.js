import express from 'express';
import { sendMessage, getSessionHistory } from '../controllers/chatController.js';
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

router.post('/message', optionalProtect, sendMessage);
router.get('/history/:sessionId', getSessionHistory);

export default router;
