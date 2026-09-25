import User from '../models/User.js';
import PaymentOrder from '../models/PaymentOrder.js';
import CreditTransaction from '../models/CreditTransaction.js';
import Coupon from '../models/Coupon.js';
import AgencyServiceOrder from '../models/AgencyServiceOrder.js';
import Notification from '../models/Notification.js';
import { CREDIT_PACKAGES, CREDIT_COSTS } from '../utils/creditConstants.js';

// Helper: Calculate authentic usable credits respecting 1-month expiry and purchase forfeiture
export const getActiveCreditsBreakdown = (user) => {
  const now = new Date();
  const isFreeExpired = user.freeCreditExpiresAt && new Date(user.freeCreditExpiresAt) < now;
  const isFreeForfeited = Boolean(user.freeCreditsForfeited);

  const activeFreeCredits = !isFreeExpired && !isFreeForfeited ? (user.freeCredits ?? 0) : 0;
  const activePaidCredits = user.paidCredits ?? 0;
  const totalAvailable = activeFreeCredits + activePaidCredits;

  return {
    availableCredits: totalAvailable,
    freeCredits: activeFreeCredits,
    paidCredits: activePaidCredits,
    freeCreditExpiresAt: user.freeCreditExpiresAt,
    isFreeExpired,
    freeCreditsForfeited: isFreeForfeited,
    totalPurchasedCredits: user.totalPurchasedCredits ?? 0,
    totalUsedCredits: user.totalUsedCredits ?? 0,
  };
};

// Helper: Generate dynamically formatted unique IDs (e.g. ADM-PAY-20260925-ABCD)
const generateDynamicId = (prefix) => {
  const d = new Date();
  const dateStr = d.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${dateStr}-${rand}`;
};

// @desc    Get student wallet balance, breakdown, transactions, and payment history
// @route   GET /api/wallet
// @access  Private
export const getWallet = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const breakdown = getActiveCreditsBreakdown(user);

    // Synchronize user.walletCredits if it drifted
    if (user.walletCredits !== breakdown.availableCredits) {
      user.walletCredits = breakdown.availableCredits;
      await user.save();
    }

    const creditTransactions = await CreditTransaction.find({ user: user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    const paymentOrders = await PaymentOrder.find({ user: user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    const agencyOrders = await AgencyServiceOrder.find({ user: user._id })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: {
        ...breakdown,
        creditTransactions,
        paymentOrders,
        agencyOrders,
        packages: CREDIT_PACKAGES,
        serviceCosts: CREDIT_COSTS,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Validate a promo coupon for package purchase
// @route   POST /api/wallet/coupon/validate
// @access  Private
export const validateCoupon = async (req, res, next) => {
  try {
    const { couponCode, packageId } = req.body;

    if (!couponCode || !packageId) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code and package selection are required',
      });
    }

    const pkg = CREDIT_PACKAGES.find((p) => p.id === packageId && !p.isFree);
    if (!pkg) {
      return res.status(400).json({
        success: false,
        message: 'Invalid paid package selected for coupon application',
      });
    }

    const coupon = await Coupon.findOne({
      code: couponCode.trim().toUpperCase(),
      isActive: true,
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or inactive coupon code',
      });
    }

    // Expiry check
    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'This coupon has expired',
      });
    }

    // Usage limit check
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({
        success: false,
        message: 'This coupon has reached its maximum global redemption limit',
      });
    }

    // Per-user limit check
    const userUsages = (coupon.usedBy || []).filter(
      (u) => u.userId?.toString() === req.user._id.toString()
    ).length;
    if (userUsages >= (coupon.perUserLimit || 1)) {
      return res.status(400).json({
        success: false,
        message: 'You have already redeemed this coupon the maximum allowed times',
      });
    }

    // Applicable packages check
    if (!coupon.applicablePackages.includes('all') && !coupon.applicablePackages.includes(packageId)) {
      return res.status(400).json({
        success: false,
        message: `This coupon is not applicable to the ${pkg.name} package`,
      });
    }

    const originalAmount = pkg.priceBdt;
    const discountAmount = Math.round((originalAmount * coupon.discountPercent) / 100);
    const finalAmount = Math.max(0, originalAmount - discountAmount);

    return res.status(200).json({
      success: true,
      message: `Coupon applied: ${coupon.discountPercent}% OFF`,
      data: {
        code: coupon.code,
        discountPercent: coupon.discountPercent,
        originalAmount,
        discountAmount,
        finalAmount,
        credits: pkg.credits,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit a manual credit package purchase payment order
// @route   POST /api/wallet/payment-order
// @access  Private
export const submitPaymentOrder = async (req, res, next) => {
  try {
    const {
      packageId,
      couponCode,
      paymentMethod,
      transactionId,
      screenshotUrl = '',
      accountNumber = '',
      paidAmount,
    } = req.body;

    if (!packageId || !paymentMethod || !transactionId) {
      return res.status(400).json({
        success: false,
        message: 'Package, payment method, and transaction ID are required',
      });
    }

    const pkg = CREDIT_PACKAGES.find((p) => p.id === packageId && !p.isFree);
    if (!pkg) {
      return res.status(400).json({
        success: false,
        message: 'Selected package is invalid or not eligible for manual payment purchase',
      });
    }

    const validMethods = ['bKash', 'Nagad', 'Rocket', 'Bank Transfer'];
    if (!validMethods.includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: `Payment method must be one of: ${validMethods.join(', ')}`,
      });
    }

    const cleanTxnId = transactionId.trim();

    // ── DUPLICATE TRANSACTION ID PROTECTION (Server-Side) ─────────────────────
    const duplicateTxn = await PaymentOrder.findOne({
      transactionId: cleanTxnId,
      status: { $in: ['APPROVED', 'PENDING_VERIFICATION'] },
    });

    if (duplicateTxn) {
      return res.status(400).json({
        success: false,
        message: 'This Transaction ID has already been submitted or processed. Duplicate transaction IDs are strictly blocked.',
      });
    }

    let discountPercent = 0;
    let discountAmount = 0;
    let finalAmount = pkg.priceBdt;

    // Validate Coupon if provided
    if (couponCode && couponCode.trim()) {
      const cleanCoupon = couponCode.trim().toUpperCase();
      const coupon = await Coupon.findOne({ code: cleanCoupon, isActive: true });
      if (coupon) {
        const isNotExpired = !coupon.expiryDate || new Date(coupon.expiryDate) >= new Date();
        const isUnderLimit = !coupon.usageLimit || coupon.usedCount < coupon.usageLimit;
        const userUsage = (coupon.usedBy || []).filter(
          (u) => u.userId?.toString() === req.user._id.toString()
        ).length;
        const isUnderUserLimit = userUsage < (coupon.perUserLimit || 1);
        const isApplicable =
          coupon.applicablePackages.includes('all') || coupon.applicablePackages.includes(packageId);

        if (isNotExpired && isUnderLimit && isUnderUserLimit && isApplicable) {
          discountPercent = coupon.discountPercent;
          discountAmount = Math.round((pkg.priceBdt * discountPercent) / 100);
          finalAmount = Math.max(0, pkg.priceBdt - discountAmount);

          // Update coupon usage
          coupon.usedCount += 1;
          coupon.usedBy.push({ userId: req.user._id, usedAt: new Date() });
          await coupon.save();
        }
      }
    }

    // Verify paid amount matches final amount if provided
    if (paidAmount && Math.abs(Number(paidAmount) - finalAmount) > 10) {
      return res.status(400).json({
        success: false,
        message: `Submitted paid amount (৳${paidAmount}) does not match expected final amount (৳${finalAmount})`,
      });
    }

    let orderId = generateDynamicId('ADM-PAY');
    // Ensure uniqueness of orderId
    while (await PaymentOrder.findOne({ orderId })) {
      orderId = generateDynamicId('ADM-PAY');
    }

    const paymentOrder = await PaymentOrder.create({
      orderId,
      user: req.user._id,
      packageId: pkg.id,
      packageName: pkg.name,
      credits: pkg.credits,
      originalAmount: pkg.priceBdt,
      couponCode: couponCode ? couponCode.trim().toUpperCase() : '',
      discountPercent,
      discountAmount,
      finalAmount,
      paymentMethod,
      transactionId: cleanTxnId,
      screenshotUrl,
      accountNumber: accountNumber.trim(),
      status: 'PENDING_VERIFICATION',
      submittedDate: new Date(),
    });

    // Notify user of submission
    await Notification.create({
      user: req.user._id,
      title: 'Payment Order Submitted',
      message: `Your payment order ${orderId} for ${pkg.credits} CR (৳${finalAmount.toLocaleString('en-BD')}) is pending admin review. Verification typically takes 1–2 hours.`,
      type: 'info',
      link: '/student/wallet',
    });

    return res.status(201).json({
      success: true,
      message: 'Payment details submitted successfully! Your order is pending verification (approx. 1–2 hours).',
      data: {
        paymentOrder,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Atomically deduct credits for a successfully executed service action
// @route   POST /api/wallet/deduct
// @access  Private
export const deductServiceCredits = async (req, res, next) => {
  try {
    const { serviceCode, referenceId = '', metadata = {} } = req.body;

    if (!serviceCode || !CREDIT_COSTS[serviceCode]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or missing service code',
      });
    }

    const service = CREDIT_COSTS[serviceCode];
    const cost = service.credits;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const breakdown = getActiveCreditsBreakdown(user);

    if (breakdown.availableCredits < cost) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient Credits',
        requiredCredits: cost,
        availableCredits: breakdown.availableCredits,
      });
    }

    const balanceBefore = breakdown.availableCredits;

    // Deduct from free credits first if available and valid, then remainder from paid credits
    let remainingToDeduct = cost;
    if (breakdown.freeCredits > 0) {
      const deductFromFree = Math.min(breakdown.freeCredits, remainingToDeduct);
      user.freeCredits = Math.max(0, (user.freeCredits ?? 0) - deductFromFree);
      remainingToDeduct -= deductFromFree;
    }

    if (remainingToDeduct > 0) {
      user.paidCredits = Math.max(0, (user.paidCredits ?? 0) - remainingToDeduct);
    }

    user.totalUsedCredits = (user.totalUsedCredits ?? 0) + cost;

    // Recompute total active
    const newBreakdown = getActiveCreditsBreakdown(user);
    user.walletCredits = newBreakdown.availableCredits;
    await user.save();

    const transactionId = `CTX-USE-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const transaction = await CreditTransaction.create({
      transactionId,
      user: user._id,
      type: 'USAGE',
      credits: -cost,
      balanceBefore,
      balanceAfter: newBreakdown.availableCredits,
      referenceType: serviceCode,
      referenceId: referenceId || service.name,
      desc: `${service.name} (${cost} CR)`,
      status: 'COMPLETED',
    });

    return res.status(200).json({
      success: true,
      message: `Successfully deducted ${cost} credits for ${service.name}`,
      data: {
        cost,
        balanceBefore,
        balanceAfter: newBreakdown.availableCredits,
        transaction,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Activate Agency Assistance (800 CR) or Full Agency Managed Service (1,500 CR)
// @route   POST /api/wallet/agency-service/activate
// @access  Private
export const activateAgencyService = async (req, res, next) => {
  try {
    const {
      serviceType, // 'AGENCY_ASSISTANCE' or 'FULL_AGENCY_MANAGED'
      targetCountry = '',
      studyLevel = '',
      targetDiscipline = '',
      budgetRange = '',
      notes = '',
    } = req.body;

    if (!serviceType || !['AGENCY_ASSISTANCE', 'FULL_AGENCY_MANAGED'].includes(serviceType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid agency service type. Must be AGENCY_ASSISTANCE (800 CR) or FULL_AGENCY_MANAGED (1,500 CR)',
      });
    }

    const cost = serviceType === 'AGENCY_ASSISTANCE' ? 800 : 1500;
    const serviceName =
      serviceType === 'AGENCY_ASSISTANCE'
        ? 'Agency Assistance'
        : 'Full Agency Managed Service';

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const breakdown = getActiveCreditsBreakdown(user);

    if (breakdown.availableCredits < cost) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient Credits',
        requiredCredits: cost,
        availableCredits: breakdown.availableCredits,
      });
    }

    const balanceBefore = breakdown.availableCredits;

    // Deduct credits
    let remainingToDeduct = cost;
    if (breakdown.freeCredits > 0) {
      const deductFromFree = Math.min(breakdown.freeCredits, remainingToDeduct);
      user.freeCredits = Math.max(0, (user.freeCredits ?? 0) - deductFromFree);
      remainingToDeduct -= deductFromFree;
    }

    if (remainingToDeduct > 0) {
      user.paidCredits = Math.max(0, (user.paidCredits ?? 0) - remainingToDeduct);
    }

    user.totalUsedCredits = (user.totalUsedCredits ?? 0) + cost;
    const newBreakdown = getActiveCreditsBreakdown(user);
    user.walletCredits = newBreakdown.availableCredits;
    await user.save();

    let orderId = generateDynamicId('ADM-AGY');
    while (await AgencyServiceOrder.findOne({ orderId })) {
      orderId = generateDynamicId('ADM-AGY');
    }

    const agencyOrder = await AgencyServiceOrder.create({
      orderId,
      user: user._id,
      serviceType,
      serviceName,
      creditsDeducted: cost,
      status: 'ACTIVE',
      targetCountry,
      studyLevel,
      targetDiscipline,
      budgetRange,
      notes,
      disclaimerAcknowledged: true,
    });

    const transactionId = `CTX-AGY-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const transaction = await CreditTransaction.create({
      transactionId,
      user: user._id,
      type: 'USAGE',
      credits: -cost,
      balanceBefore,
      balanceAfter: newBreakdown.availableCredits,
      referenceType: serviceType,
      referenceId: orderId,
      desc: `${serviceName} Activation (${cost} CR)`,
      status: 'COMPLETED',
    });

    await Notification.create({
      user: user._id,
      title: `${serviceName} Activated`,
      message: `Your ${serviceName} request ${orderId} has been activated (${cost} CR deducted). Admify Admin is allocating your certified agency counselor.`,
      type: 'success',
      link: '/student/agency-assistance',
    });

    return res.status(201).json({
      success: true,
      message: `${serviceName} activated successfully!`,
      data: {
        agencyOrder,
        transaction,
        balanceAfter: newBreakdown.availableCredits,
      },
    });
  } catch (error) {
    next(error);
  }
};
