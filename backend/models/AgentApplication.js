import mongoose from 'mongoose';

const agentApplicationSchema = new mongoose.Schema(
  {
    applicationId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    agency: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    agencyApplicationId: {
      type: String,
      default: '',
      index: true,
    },
    agencyName: {
      type: String,
      required: true,
      trim: true,
    },
    agentName: {
      type: String,
      required: [true, 'Agent full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Agent email is required'],
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      required: [true, 'Agent phone number is required'],
      trim: true,
    },
    designation: {
      type: String,
      default: 'Educational Counselor',
      trim: true,
    },
    countrySpecialization: {
      type: [String],
      default: [],
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'REGISTERED', 'COMPLETED'],
      default: 'PENDING',
      index: true,
    },
    activationCode: {
      type: String,
      default: null,
      index: true,
    },
    activationCodeStatus: {
      type: String,
      enum: ['ISSUED', 'USED', 'EXPIRED', 'REVOKED', null],
      default: null,
    },
    activationCodeExpires: {
      type: Date,
      default: null,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    agentUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    registeredAt: {
      type: Date,
      default: null,
    },
    statusHistory: [
      {
        status: { type: String, required: true },
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        note: { type: String, default: '' },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const AgentApplication = mongoose.model('AgentApplication', agentApplicationSchema);

export default AgentApplication;
