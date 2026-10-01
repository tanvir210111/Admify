import express from 'express';
import {
  generateSOPHandler,
  generateLORHandler,
  predictAdmissionHandler,
  getRecommendationsHandler,
  countryRecommendationHandler,
  scholarshipRecommendationHandler,
  profileStrengthHandler,
  universityComparisonHandler,
  studyGuidanceHandler,
  chatHandler,
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

// 1. SOP Generator
router.post('/generate-sop', optionalProtect, generateSOPHandler);
router.post('/sop', optionalProtect, generateSOPHandler);

// 2. LOR Generator
router.post('/generate-lor', optionalProtect, generateLORHandler);
router.post('/lor', optionalProtect, generateLORHandler);

// 3. Admission Probability
router.post('/predict-admission', optionalProtect, predictAdmissionHandler);
router.post('/admission-probability', optionalProtect, predictAdmissionHandler);

// 4. University Recommendations
router.get('/recommendations', optionalProtect, getRecommendationsHandler);
router.post('/university-recommendation', optionalProtect, getRecommendationsHandler);

// 5. Country Recommendation
router.post('/country-recommendation', optionalProtect, countryRecommendationHandler);

// 6. Scholarship Recommendation
router.post('/scholarship-recommendation', optionalProtect, scholarshipRecommendationHandler);

// 7. Profile Strength Analysis
router.post('/profile-strength', optionalProtect, profileStrengthHandler);

// 8. University Comparison
router.post('/university-comparison', optionalProtect, universityComparisonHandler);

// 9. Study Guidance
router.post('/study-guidance', optionalProtect, studyGuidanceHandler);

// 10. AI Chat
router.post('/chat', optionalProtect, chatHandler);

export default router;
