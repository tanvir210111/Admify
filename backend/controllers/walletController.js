import User from '../models/User.js';
import Transaction from '../models/Transaction.js';

// @desc    Get user wallet balance and recent transactions
// @route   GET /api/wallet
// @access  Private
export const getWallet = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const transactions = await Transaction.find({ user: req.user._id }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: {
        credits: user.walletCredits,
        balanceUsd: (user.walletCredits * 0.1).toFixed(2), // 1 credit = $0.10
        transactions,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add credits to user wallet
// @route   POST /api/wallet/topup
// @access  Private
export const topUpCredits = async (req, res, next) => {
  try {
    const { amount = 50, paymentMethod = 'Credit Card' } = req.body;
    const creditsToAdd = parseInt(amount, 10);

    if (isNaN(creditsToAdd) || creditsToAdd <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid credit amount',
      });
    }

    const user = await User.findById(req.user._id);
    user.walletCredits += creditsToAdd;
    await user.save();

    const transaction = await Transaction.create({
      user: user._id,
      type: 'credit',
      amount: creditsToAdd,
      desc: 'Top Up Funds',
      paymentMethod,
    });

    return res.status(200).json({
      success: true,
      message: `Successfully topped up ${creditsToAdd} credits`,
      data: {
        newBalance: user.walletCredits,
        transaction,
      },
    });
  } catch (error) {
    next(error);
  }
};
