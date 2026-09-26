import mongoose from 'mongoose';

const universityAgencyConnectionSchema = new mongoose.Schema(
  {
    agencyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    agencyProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AgencyProfile',
      default: null,
    },
    universityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'University',
      required: true,
      index: true,
    },
    universityRepresentativeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    requestedByRole: {
      type: String,
      enum: ['agency', 'university_rep', 'university'],
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'BLOCKED'],
      default: 'PENDING',
      index: true,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    respondedAt: {
      type: Date,
      default: null,
    },
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index ensuring only 1 connection relationship per Agency and Uni Rep pair
universityAgencyConnectionSchema.index(
  { agencyId: 1, universityRepresentativeId: 1 },
  { unique: true }
);

const UniversityAgencyConnection = mongoose.model(
  'UniversityAgencyConnection',
  universityAgencyConnectionSchema
);

export default UniversityAgencyConnection;
