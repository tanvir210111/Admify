import mongoose from 'mongoose';

const documentFileSchema = new mongoose.Schema(
  {
    fileName: { type: String, default: '' },
    fileSize: { type: String, default: '' },
    fileType: { type: String, default: '' },
    fileData: { type: String, default: '' }, // Data URL (Base64) or secure document URL
  },
  { _id: false }
);

const universityRepresentativeApplicationSchema = new mongoose.Schema(
  {
    applicationId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },

    // ── SECTION A: UNIVERSITY INFORMATION ──────────────────────────────────
    university: {
      name: { type: String, required: true, trim: true },
      legalName: { type: String, required: true, trim: true },
      logo: { type: String, default: '' },
      website: { type: String, required: true, trim: true },
      country: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      type: {
        type: String,
        enum: ['Public', 'Private', 'Government', 'Other'],
        required: true,
        default: 'Public',
      },
      domain: { type: String, required: true, lowercase: true, trim: true },
      matchedUniversityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'University',
        default: null,
      },
    },

    // ── SECTION B: REPRESENTATIVE INFORMATION ──────────────────────────────
    representative: {
      fullName: { type: String, required: true, trim: true },
      designation: {
        type: String,
        enum: [
          'International Admissions Officer',
          'International Relations Officer',
          'Regional Representative',
          'Recruitment Officer',
          'Authorized Representative',
          'Other',
        ],
        required: true,
        default: 'International Admissions Officer',
      },
      officialEmail: { type: String, required: true, lowercase: true, trim: true },
      phone: { type: String, required: true, trim: true },
      employeeId: { type: String, required: true, trim: true },
    },

    // ── SECTION C: AUTHORIZATION & DOCUMENTS ───────────────────────────────
    documents: {
      authorizationLetter: { type: documentFileSchema, default: () => ({}) },
      officialUniversityId: { type: documentFileSchema, default: () => ({}) },
      employeeIdDocument: { type: documentFileSchema, default: () => ({}) },
      supportingDocument: { type: documentFileSchema, default: () => ({}) },
    },

    // ── SECTION D: ACADEMIC SCOPE ──────────────────────────────────────────
    academicScope: {
      studyLevels: {
        type: [String],
        enum: ['Foundation', 'Diploma', 'Undergraduate', "Master's", 'PhD'],
        default: ['Undergraduate', "Master's"],
      },
      programsDepartments: { type: String, default: '', trim: true },
      countriesRegionsHandled: { type: [String], default: [] },
    },

    // ── SECTION E: PROFESSIONAL INFORMATION ────────────────────────────────
    professional: {
      yearsOfExperience: { type: Number, default: 0 },
      previousExperience: { type: String, default: '', trim: true },
      languages: { type: [String], default: [] },
      areasOfExpertise: { type: [String], default: [] },
      certificationsMemberships: { type: [String], default: [] },
    },

    // ── SECTION F: DECLARATION ─────────────────────────────────────────────
    declarations: {
      informationAccuracy: { type: Boolean, default: false },
      authorizationConfirmation: { type: Boolean, default: false },
      termsAndPolicy: { type: Boolean, default: false },
    },

    // ── LIFECYCLE & AUDIT ──────────────────────────────────────────────────
    status: {
      type: String,
      enum: ['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'ACTIVE'],
      default: 'PENDING',
      index: true,
    },
    submittedAt: { type: Date, default: null },
    reviewedAt: { type: Date, default: null },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    rejectionReason: { type: String, default: '' },
    adminNotes: { type: String, default: '' },
    statusHistory: [
      {
        status: { type: String, required: true },
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
        note: { type: String, default: '' },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const UniversityRepresentativeApplication = mongoose.model(
  'UniversityRepresentativeApplication',
  universityRepresentativeApplicationSchema
);

export default UniversityRepresentativeApplication;
