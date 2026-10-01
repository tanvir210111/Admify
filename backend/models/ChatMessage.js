import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: false,
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      index: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      index: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      index: true,
    },
    sessionId: {
      type: String,
      required: false,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    sender: {
      type: String,
      enum: ['user', 'ai', 'agent', 'student', 'agency', 'university_rep', 'university', 'admin', 'system', 'visitor'],
      default: 'user',
    },
    text: {
      type: String,
      default: '',
    },
    attachments: [
      {
        originalName: { type: String, required: true },
        filename: { type: String, required: true },
        mimeType: { type: String, required: true },
        size: { type: Number, required: true },
        path: { type: String, required: true },
      },
    ],
    isEdited: {
      type: Boolean,
      default: false,
      index: true,
    },
    editedAt: {
      type: Date,
      default: null,
    },
    editHistory: [
      {
        previousContent: { type: String, required: true },
        editedAt: { type: Date, default: Date.now },
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reactions: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        emoji: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isLiveAgentRequest: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['active', 'closed'],
      default: 'active',
    },
    isSeenByAdmin: {
      type: Boolean,
      default: false,
      index: true,
    },
    adminSeenAt: {
      type: Date,
      default: null,
    },
    isSeenByStudent: {
      type: Boolean,
      default: false,
      index: true,
    },
    studentSeenAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

chatMessageSchema.index({ conversationId: 1, createdAt: 1 });
chatMessageSchema.index({ conversationId: 1, createdAt: -1 });
chatMessageSchema.index({ senderId: 1, receiverId: 1, createdAt: 1 });

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);
export default ChatMessage;
