import express from 'express';
import { getWallet, topUpCredits } from '../controllers/walletController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getWallet);
router.post('/topup', protect, topUpCredits);

export default router;
