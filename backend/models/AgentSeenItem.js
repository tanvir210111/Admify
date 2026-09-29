import mongoose from 'mongoose';

const agentSeenItemSchema = new mongoose.Schema(
  {
    agent: {
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

// Composite unique index so an entity is only recorded once per agent
agentSeenItemSchema.index({ agent: 1, entityType: 1, entityId: 1 }, { unique: true });
agentSeenItemSchema.index({ user: 1, entityType: 1, entityId: 1 });

const AgentSeenItem = mongoose.model('AgentSeenItem', agentSeenItemSchema);
export default AgentSeenItem;
