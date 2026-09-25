import express from 'express';
import {
  getAdminStats,
  getAllPaymentOrders,
  approvePaymentOrder,
  rejectPaymentOrder,
  getAllAgencyOrders,
  assignAgencyToOrder,
} from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/stats', protect, authorize('admin'), getAdminStats);
router.get('/payments', protect, authorize('admin'), getAllPaymentOrders);
router.post('/payments/:id/approve', protect, authorize('admin'), approvePaymentOrder);
router.post('/payments/:id/reject', protect, authorize('admin'), rejectPaymentOrder);
router.get('/agency-orders', protect, authorize('admin'), getAllAgencyOrders);
router.put('/agency-orders/:id/assign', protect, authorize('admin'), assignAgencyToOrder);

export default router;
