import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    university: {
      type: String,
      required: true,
    },
    program: {
      type: String,
      required: true,
    },
    logo: {
      type: String,
      default: '🎓',
    },
    date: {
      type: String,
      default: () => new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
    },
    stage: {
      type: String,
      enum: ['Submitted', 'Documents Pending', 'In Review', 'Accepted', 'Rejected', 'Waitlisted'],
      default: 'Submitted',
    },
    progress: {
      type: Number,
      default: 25,
    },
    steps: [
      {
        label: String,
        date: String,
        status: {
          type: String,
          enum: ['completed', 'current', 'warning', 'upcoming', 'success'],
          default: 'upcoming',
        },
      },
    ],
    color: {
      type: String,
      default: 'from-blue-500 to-indigo-600',
    },
    notes: {
      type: String,
      default: '',
    },
    assignedAgent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

const Application = mongoose.model('Application', applicationSchema);
export default Application;
