import mongoose from 'mongoose';

const documentFileSchema = new mongoose.Schema(
  {
    fileName: { type: String, default: '' },
    fileSize: { type: String, default: '' },
    fileType: { type: String, default: '' },
    fileData: { type: String, default: '' }, // Data URL (Base64) or remote file URL
  },
  { _id: false }
);

const agencyProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    applicationId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },

    // ── Step 1: Agency Basic Information ──────────────────────────────────
    agencyName: {
      type: String,
      required: true,
      trim: true,
    },
    legalName: {
      type: String,
      default: '',
      trim: true,
    },
    logo: {
      type: String,
      default: '',
    },
    agencyType: {
      type: String,
      enum: [
        'Study Abroad Consultancy',
        'Education Consultancy',
        'Immigration Consultancy',
        'Other',
      ],
      default: 'Study Abroad Consultancy',
    },
    yearEstablished: {
      type: Number,
      default: null,
    },
    officeAddress: {
      type: String,
      default: '',
      trim: true,
    },
    country: {
      type: String,
      default: '',
      trim: true,
    },
    city: {
      type: String,
      default: '',
      trim: true,
    },
    website: {
      type: String,
      default: '',
      trim: true,
    },
    officialBusinessEmail: {
      type: String,
      default: '',
      lowercase: true,
      trim: true,
    },

    // ── Step 2: Authorized Person ─────────────────────────────────────────
    authorizedPerson: {
      fullName: {
        type: String,
        default: '',
        trim: true,
      },
      designation: {
        type: String,
        enum: [
          'Owner',
          'Managing Director',
          'Director',
          'Manager',
          'Authorized Representative',
          'Other',
        ],
        default: 'Managing Director',
      },
      phone: {
        type: String,
        default: '',
        trim: true,
      },
      email: {
        type: String,
        default: '',
        lowercase: true,
        trim: true,
      },
      identityNumber: {
        type: String,
        default: '',
        trim: true,
      },
      identityDocument: {
        type: documentFileSchema,
        default: () => ({}),
      },
    },

    // ── Step 3: Business Verification ─────────────────────────────────────
    businessVerification: {
      tradeLicenseNumber: {
        type: String,
        default: '',
        trim: true,
      },
      tradeLicenseDocument: {
        type: documentFileSchema,
        default: () => ({}),
      },
      businessRegistrationNumber: {
        type: String,
        default: '',
        trim: true,
      },
      businessRegistrationDocument: {
        type: documentFileSchema,
        default: () => ({}),
      },
      tinNumber: {
        type: String,
        default: '',
        trim: true,
      },
      tinDocument: {
        type: documentFileSchema,
        default: () => ({}),
      },
      binVatNumber: {
        type: String,
        default: '',
        trim: true,
      },
    },

    // ── Step 4: Agency Profile ────────────────────────────────────────────
    about: {
      type: String,
      default: '',
      trim: true,
    },
    countriesServed: {
      type: [String],
      default: [],
    },
    studyLevels: {
      type: [String],
      enum: ['Foundation', 'Diploma', 'Undergraduate', "Master's", 'PhD'],
      default: ['Undergraduate', "Master's"],
    },
    servicesOffered: {
      type: [String],
      default: ['University Application', 'Visa Assistance'],
    },

    // ── Step 5: Experience & Capacity ─────────────────────────────────────
    experience: {
      yearsOfExperience: {
        type: Number,
        default: 1,
      },
      numberOfCounselors: {
        type: Number,
        default: 1,
      },
      approximateStudentsServed: {
        type: Number,
        default: 0,
      },
      partnerUniversities: {
        type: [String],
        default: [],
      },
      certificationsMemberships: {
        type: [String],
        default: [],
      },
    },

    // ── Step 6: Verification Declarations & Status ─────────────────────────
    declarationsAccepted: {
      type: Boolean,
      default: false,
    },
    verificationStatus: {
      type: String,
      enum: ['PENDING', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED'],
      default: 'PENDING',
      index: true,
    },
    isDraft: {
      type: Boolean,
      default: false,
    },
    submittedAt: {
      type: Date,
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    adminNotes: {
      type: String,
      default: '',
    },
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

const AgencyProfile = mongoose.model('AgencyProfile', agencyProfileSchema);

export default AgencyProfile;
