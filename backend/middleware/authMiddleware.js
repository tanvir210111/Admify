import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import devStore from '../utils/devStore.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
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
        return res.status(401).json({
          success: false,
          message: 'User belonging to this token no longer exists',
        });
      }

      req.user = user;
      req.isRegistrationToken = Boolean(decoded.type === 'agency_registration');
      req.isUniRepRegistrationToken = Boolean(decoded.type === 'unirep_registration');
      req.applicationId = decoded.applicationId || null;

      // Scoped token protection: registration tokens can only access their respective verification routes
      if (req.isRegistrationToken && !req.originalUrl.includes('/api/agency/verification')) {
        return res.status(403).json({
          success: false,
          message: 'Temporary registration token is only valid for agency verification submission.',
        });
      }
      if (req.isUniRepRegistrationToken && !req.originalUrl.includes('/api/university-rep/verification')) {
        return res.status(403).json({
          success: false,
          message: 'Temporary registration token is only valid for university representative verification submission.',
        });
      }

      return next();
    } catch (error) {
      console.error('[Auth Error]', error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token invalid or expired',
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided',
    });
  }
};

export default protect;
