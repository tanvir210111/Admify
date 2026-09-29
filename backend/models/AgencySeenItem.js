import mongoose from 'mongoose';

const agencySeenItemSchema = new mongoose.Schema(
  {
    agency: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    entityType: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    entityId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    seenAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Composite unique index so an entity is only recorded once per agency
agencySeenItemSchema.index({ agency: 1, entityType: 1, entityId: 1 }, { unique: true });
agencySeenItemSchema.index({ user: 1, entityType: 1, entityId: 1 });

const AgencySeenItem = mongoose.model('AgencySeenItem', agencySeenItemSchema);
export default AgencySeenItem;
