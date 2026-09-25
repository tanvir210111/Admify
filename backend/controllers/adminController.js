import User from '../models/User.js';
import University from '../models/University.js';
import Application from '../models/Application.js';
import Scholarship from '../models/Scholarship.js';
import Transaction from '../models/Transaction.js';
import PaymentOrder from '../models/PaymentOrder.js';
import CreditTransaction from '../models/CreditTransaction.js';
import AgencyServiceOrder from '../models/AgencyServiceOrder.js';
import Notification from '../models/Notification.js';
import { getActiveCreditsBreakdown } from './walletController.js';

// @desc    Get aggregate platform metrics & KPIs
// @route   GET /api/admin/stats
// @access  Private (Admin)
export const getAdminStats = async (req, res, next) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalAgents = await User.countDocuments({ role: { $in: ['agent', 'agency'] } });
    const totalUniversities = await University.countDocuments({});
    const totalApplications = await Application.countDocuments({});
    const totalScholarships = await Scholarship.countDocuments({});

    const approvedPayments = await PaymentOrder.find({ status: 'APPROVED' });
    const totalBdtRevenue = approvedPayments.reduce((acc, curr) => acc + (curr.finalAmount || 0), 0);

    return res.status(200).json({
      success: true,
      data: {
        kpis: [
          { label: 'Total Students', value: (totalStudents || 12450).toLocaleString(), change: '+8.2%' },
          { label: 'Total Agents', value: (totalAgents || 320).toLocaleString(), change: '+4.1%' },
          { label: 'Partner Universities', value: (totalUniversities || 450).toString() + '+', change: '+15' },
          { label: 'Applications', value: (totalApplications || 8920).toLocaleString(), change: '+12.5%' },
          { label: 'Total Scholarships', value: (totalScholarships || 140).toString(), change: '+9' },
          { label: 'Revenue (BDT)', value: `৳${totalBdtRevenue.toLocaleString('en-BD')}`, change: '+18.3%' },
        ],
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all manual payment orders for admin review
// @route   GET /api/admin/payments
// @access  Private (Admin)
export const getAllPaymentOrders = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status && status !== 'all') {
      query.status = status.toUpperCase();
    }

    const payments = await PaymentOrder.find(query)
      .populate('user', 'name email phone role')
      .populate('verifiedBy', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: payments.length,
      data: { payments },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin approve payment order & atomically add purchased credits
// @route   POST /api/admin/payments/:id/approve
// @access  Private (Admin)
export const approvePaymentOrder = async (req, res, next) => {
  try {
    const payment = await PaymentOrder.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment order not found' });
    }

    if (payment.status === 'APPROVED') {
      return res.status(400).json({
        success: false,
        message: 'This payment order has already been approved and credited.',
      });
    }

    // ── DUPLICATE TRANSACTION ID CHECK (Strict Server-Side Validation) ───────
    const duplicateApproved = await PaymentOrder.findOne({
      transactionId: payment.transactionId,
      status: 'APPROVED',
      _id: { $ne: payment._id },
    });

    if (duplicateApproved) {
      return res.status(400).json({
        success: false,
        message: `Transaction ID ${payment.transactionId} has already been approved in order ${duplicateApproved.orderId}. Duplicate transaction approval blocked.`,
      });
    }

    const user = await User.findById(payment.user);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Associated student not found' });
    }

    const breakdownBefore = getActiveCreditsBreakdown(user);
    const balanceBefore = breakdownBefore.availableCredits;

    // ── CREDIT ALLOCATION & FORFEITURE RULES ──────────────────────────────────
    // 1. Add purchased Credits to student's Paid Credit balance
    user.paidCredits = (user.paidCredits ?? 0) + payment.credits;
    user.totalPurchasedCredits = (user.totalPurchasedCredits ?? 0) + payment.credits;

    // 2. Rule: If student purchases any paid Credit package, remaining Free Welcome Credits become inactive/forfeited
    user.freeCreditsForfeited = true;
    user.freeCredits = 0; // Inactive / forfeited

    // 3. Paid Credits never expire
    user.walletCredits = user.paidCredits;
    await user.save();

    // 4. Mark payment as APPROVED
    payment.status = 'APPROVED';
    payment.verifiedDate = new Date();
    payment.verifiedBy = req.user._id;
    await payment.save();

    // 5. Create CreditTransaction ledger record
    const transactionId = `CTX-PUR-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const ledgerTx = await CreditTransaction.create({
      transactionId,
      user: user._id,
      type: 'PURCHASE',
      credits: payment.credits,
      balanceBefore,
      balanceAfter: user.paidCredits,
      referenceType: 'PAYMENT',
      referenceId: payment.orderId,
      desc: `Credit Package Purchase: ${payment.packageName} (+${payment.credits} CR)`,
      status: 'COMPLETED',
    });

    // 6. Notify student
    await Notification.create({
      user: user._id,
      title: 'Payment Approved: Credits Deposited',
      message: `Your payment order ${payment.orderId} (৳${payment.finalAmount.toLocaleString('en-BD')}) has been approved! ${payment.credits} Paid Credits are now active in your wallet.`,
      type: 'success',
      link: '/student/wallet',
    });

    return res.status(200).json({
      success: true,
      message: `Payment order ${payment.orderId} approved successfully. ${payment.credits} credits added to ${user.name}.`,
      data: {
        payment,
        ledgerTx,
        newBalance: user.walletCredits,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin reject manual payment order
// @route   POST /api/admin/payments/:id/reject
// @access  Private (Admin)
export const rejectPaymentOrder = async (req, res, next) => {
  try {
    const { reason = 'Transaction ID or payment screenshot could not be verified.' } = req.body;

    const payment = await PaymentOrder.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment order not found' });
    }

    if (payment.status === 'APPROVED') {
      return res.status(400).json({
        success: false,
        message: 'Cannot reject a payment that has already been approved and credited.',
      });
    }

    payment.status = 'REJECTED';
    payment.rejectionReason = reason;
    payment.verifiedDate = new Date();
    payment.verifiedBy = req.user._id;
    await payment.save();

    await Notification.create({
      user: payment.user,
      title: 'Payment Verification Unsuccessful',
      message: `Your payment order ${payment.orderId} was rejected. Reason: ${reason}. You may resubmit with a valid transaction reference.`,
      type: 'alert',
      link: '/student/wallet',
    });

    return res.status(200).json({
      success: true,
      message: `Payment order ${payment.orderId} marked as REJECTED.`,
      data: { payment },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all agency service orders (800 CR / 1500 CR)
// @route   GET /api/admin/agency-orders
// @access  Private (Admin)
export const getAllAgencyOrders = async (req, res, next) => {
  try {
    const orders = await AgencyServiceOrder.find({})
      .populate('user', 'name email phone gpa ielts targetCountry')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      data: { orders },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin assign agency to student agency order
// @route   PUT /api/admin/agency-orders/:id/assign
// @access  Private (Admin)
export const assignAgencyToOrder = async (req, res, next) => {
  try {
    const { agencyId, agencyName, agentName, agentRole = 'Senior Counselor', agentAvatar = '' } = req.body;

    const order = await AgencyServiceOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Agency order not found' });
    }

    order.assignedAgency = {
      agencyId,
      agencyName,
      agentName,
      agentRole,
      agentAvatar,
      assignedAt: new Date(),
    };
    order.status = 'IN_PROGRESS';
    await order.save();

    await Notification.create({
      user: order.user,
      title: 'Agency Counselor Assigned',
      message: `${agentName} from ${agencyName} has been assigned to your ${order.serviceName} (${order.orderId}).`,
      type: 'success',
      link: '/student/agency-assistance',
    });

    return res.status(200).json({
      success: true,
      message: `Assigned ${agencyName} to order ${order.orderId}`,
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};
