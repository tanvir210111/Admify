import mongoose from 'mongoose';

const paymentOrderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    packageId: {
      type: String,
      required: true,
      enum: ['basic', 'standard', 'premium', 'ultimate'],
    },
    packageName: {
      type: String,
      required: true,
    },
    credits: {
      type: Number,
      required: true,
    },
    originalAmount: {
      type: Number,
      required: true, // in BDT
    },
    couponCode: {
      type: String,
      default: '',
      uppercase: true,
      trim: true,
    },
    discountPercent: {
      type: Number,
      default: 0,
    },
    discountAmount: {
      type: Number,
      default: 0, // in BDT
    },
    finalAmount: {
      type: Number,
      required: true, // in BDT
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['bKash', 'Nagad', 'Rocket', 'Bank Transfer'],
    },
    transactionId: {
      type: String,
      required: true,
      trim: true,
    },
    screenshotUrl: {
      type: String,
      default: '',
    },
    accountNumber: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['PENDING_PAYMENT', 'PENDING_VERIFICATION', 'APPROVED', 'REJECTED'],
      default: 'PENDING_VERIFICATION',
    },
    submittedDate: {
      type: Date,
      default: Date.now,
    },
    verifiedDate: {
      type: Date,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Index to quickly look up user orders and status
paymentOrderSchema.index({ user: 1, createdAt: -1 });
paymentOrderSchema.index({ transactionId: 1 });

const PaymentOrder = mongoose.model('PaymentOrder', paymentOrderSchema);
export default PaymentOrder;
