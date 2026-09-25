import express from 'express';
import {
  getWallet,
  validateCoupon,
  submitPaymentOrder,
  deductServiceCredits,
  activateAgencyService,
} from '../controllers/walletController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getWallet);
router.post('/coupon/validate', protect, validateCoupon);
router.post('/payment-order', protect, submitPaymentOrder);
router.post('/deduct', protect, deductServiceCredits);
router.post('/agency-service/activate', protect, activateAgencyService);

export default router;
