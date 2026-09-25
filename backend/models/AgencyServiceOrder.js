import mongoose from 'mongoose';

const agencyServiceOrderSchema = new mongoose.Schema(
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
    serviceType: {
      type: String,
      enum: ['AGENCY_ASSISTANCE', 'FULL_AGENCY_MANAGED'],
      required: true,
    },
    serviceName: {
      type: String,
      required: true,
    },
    creditsDeducted: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
      default: 'ACTIVE',
    },
    assignedAgency: {
      agencyId: String,
      agencyName: String,
      agentName: String,
      agentRole: String,
      agentAvatar: String,
      assignedAt: Date,
    },
    targetCountry: {
      type: String,
      default: '',
    },
    studyLevel: {
      type: String,
      default: '',
    },
    targetDiscipline: {
      type: String,
      default: '',
    },
    budgetRange: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
    disclaimerAcknowledged: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

agencyServiceOrderSchema.index({ user: 1, createdAt: -1 });

const AgencyServiceOrder = mongoose.model('AgencyServiceOrder', agencyServiceOrderSchema);
export default AgencyServiceOrder;
