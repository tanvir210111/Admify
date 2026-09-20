import express from 'express';
import {
  generateSOPHandler,
  generateLORHandler,
  predictAdmissionHandler,
  getRecommendationsHandler,
} from '../controllers/aiController.js';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// Optional auth middleware so endpoints work both for guest visitors and logged in students
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
      // Ignore token failure in optional protect
    }
  }
  next();
};

router.post('/generate-sop', optionalProtect, generateSOPHandler);
router.post('/generate-lor', optionalProtect, generateLORHandler);
router.post('/predict-admission', optionalProtect, predictAdmissionHandler);
router.get('/recommendations', optionalProtect, getRecommendationsHandler);

export default router;
