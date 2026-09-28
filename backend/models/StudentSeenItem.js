import mongoose from 'mongoose';

const studentSeenItemSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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

// Composite unique index so an entity is only recorded once per student
studentSeenItemSchema.index({ user: 1, entityType: 1, entityId: 1 }, { unique: true });

const StudentSeenItem = mongoose.model('StudentSeenItem', studentSeenItemSchema);
export default StudentSeenItem;
