import mongoose from 'mongoose';

const adminSeenItemSchema = new mongoose.Schema(
  {
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
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
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

// Composite unique index so an entity is only recorded once
adminSeenItemSchema.index({ entityType: 1, entityId: 1 }, { unique: true });

const AdminSeenItem = mongoose.model('AdminSeenItem', adminSeenItemSchema);
export default AdminSeenItem;
