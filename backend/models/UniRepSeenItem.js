import mongoose from 'mongoose';

const uniRepSeenItemSchema = new mongoose.Schema(
  {
    universityRep: {
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
    universityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'University',
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

// Composite unique index so an entity is only recorded once per university representative
uniRepSeenItemSchema.index({ universityRep: 1, entityType: 1, entityId: 1 }, { unique: true });
uniRepSeenItemSchema.index({ user: 1, entityType: 1, entityId: 1 });

const UniRepSeenItem = mongoose.model('UniRepSeenItem', uniRepSeenItemSchema);
export default UniRepSeenItem;
