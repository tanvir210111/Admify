import mongoose from 'mongoose';

const creditTransactionSchema = new mongoose.Schema(
  {
    transactionId: {
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
    type: {
      type: String,
      enum: ['WELCOME_CREDIT', 'PURCHASE', 'USAGE', 'ADMIN_ADJUSTMENT', 'REFUND'],
      required: true,
    },
    credits: {
      type: Number,
      required: true, // positive for credits, negative for usage
    },
    balanceBefore: {
      type: Number,
      required: true,
    },
    balanceAfter: {
      type: Number,
      required: true,
    },
    referenceType: {
      type: String,
      enum: [
        'WELCOME',
        'PAYMENT',
        'AI_SOP',
        'SOP_REWRITE',
        'AI_LOR',
        'LOR_REWRITE',
        'AI_RECOMMENDATION',
        'ADMISSION_PROBABILITY',
        'DOCUMENT_REVIEW',
        'AI_SCHOLARSHIP',
        'UNIVERSITY_COMPARISON',
        'COST_ESTIMATOR',
        'UNIVERSITY_APPLICATION',
        'ADDITIONAL_APPLICATION',
        'AGENCY_ASSISTANCE',
        'FULL_AGENCY_MANAGED',
        'ADMIN_ADJUSTMENT',
        'OTHER',
      ],
      default: 'OTHER',
    },
    referenceId: {
      type: String,
      default: '',
    },
    desc: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['COMPLETED', 'PENDING', 'FAILED'],
      default: 'COMPLETED',
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    direction: {
      type: String,
      enum: ['CREDIT', 'DEBIT'],
      default: 'CREDIT',
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    adminName: {
      type: String,
      default: '',
    },
    adminEmail: {
      type: String,
      default: '',
    },
    reason: {
      type: String,
      default: '',
    },
    note: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

creditTransactionSchema.index({ user: 1, createdAt: -1 });
// Enforce database-level idempotency: only one WELCOME_CREDIT per user
creditTransactionSchema.index(
  { user: 1, type: 1 },
  { unique: true, partialFilterExpression: { type: 'WELCOME_CREDIT' } }
);

const CreditTransaction = mongoose.model('CreditTransaction', creditTransactionSchema);
export default CreditTransaction;
