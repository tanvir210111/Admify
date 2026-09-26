import express from 'express';
import {
  register,
  login,
  adminLogin,
  getMe,
  activateAgency,
  activateUniversityRep,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/admin/login', adminLogin);
router.post('/activate-agency', activateAgency);
router.post('/activate-university-rep', activateUniversityRep);
router.get('/me', protect, getMe);

export default router;
