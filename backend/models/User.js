import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Do not return password by default
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    role: {
      type: String,
      enum: ['student', 'agent', 'agency', 'university', 'university representative', 'university_rep', 'admin'],
      default: 'student',
    },
    status: {
      type: String,
      enum: ['active', 'in_review', 'pending', 'suspended'],
      default: 'active',
    },
    avatar: {
      type: String,
      default: '',
    },
    // Academic & Profile Information
    gpa: {
      type: String,
      default: '',
    },
    ielts: {
      type: String,
      default: '',
    },
    targetCountry: {
      type: String,
      default: '',
    },
    targetCourse: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: '',
    },
    // Wallet / Credits system (Credit-based model)
    walletCredits: {
      type: Number,
      default: 20, // Initial 20 Welcome Credits
    },
    freeCredits: {
      type: Number,
      default: 20, // Valid for 1 month
    },
    paidCredits: {
      type: Number,
      default: 0, // Never expires
    },
    freeCreditExpiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days validity
    },
    freeCreditsForfeited: {
      type: Boolean,
      default: false,
    },
    totalPurchasedCredits: {
      type: Number,
      default: 0,
    },
    totalUsedCredits: {
      type: Number,
      default: 0,
    },
    // Agency & University Representative Verification & Lifecycle Status
    accountStatus: {
      type: String,
      enum: ['PENDING', 'UNDER_REVIEW', 'APPROVED', 'ACTIVE', 'REJECTED'],
      default: function () {
        return (this.role === 'agency' || this.role === 'university_rep' || this.role === 'university' || this.role === 'university representative') ? 'PENDING' : 'ACTIVE';
      },
      index: true,
    },
    isActive: {
      type: Boolean,
      default: function () {
        return this.role !== 'agency' && this.role !== 'university_rep' && this.role !== 'university' && this.role !== 'university representative';
      },
    },
    emailVerified: {
      type: Boolean,
      default: function () {
        return this.role !== 'agency' && this.role !== 'university_rep' && this.role !== 'university' && this.role !== 'university representative';
      },
    },
    agencyVerificationStatus: {
      type: String,
      enum: ['PENDING', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED'],
      default: 'PENDING',
    },
    agencyProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AgencyProfile',
    },
    // University Representative Affiliation & Lifecycle
    universityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'University',
      default: null,
      index: true,
    },
    universityRepApplication: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UniversityRepresentativeApplication',
      default: null,
    },
    universityRepApplicationId: {
      type: String,
      default: '',
      index: true,
    },
    uniRepVerificationStatus: {
      type: String,
      enum: ['PENDING', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED'],
      default: 'PENDING',
    },
    department: {
      type: String,
      default: '',
      trim: true,
    },
    designation: {
      type: String,
      default: '',
      trim: true,
    },
    officialUniversityEmail: {
      type: String,
      default: '',
      lowercase: true,
      trim: true,
    },
    employeeId: {
      type: String,
      default: '',
      trim: true,
    },
    dateOfBirth: {
      type: String,
      default: '',
    },
    gender: {
      type: String,
      default: '',
    },
    country: {
      type: String,
      default: '',
    },
    city: {
      type: String,
      default: '',
    },
    address: {
      type: String,
      default: '',
    },
    academicScope: {
      studyLevels: { type: [String], default: [] },
      programsDepartments: { type: String, default: '' },
      countriesRegionsHandled: { type: [String], default: [] },
    },
    professional: {
      yearsOfExperience: { type: Number, default: 0 },
      previousExperience: { type: String, default: '' },
      languages: { type: [String], default: [] },
      areasOfExpertise: { type: [String], default: [] },
      certificationsMemberships: { type: [String], default: [] },
    },
    documents: {
      authorizationLetter: { type: Object, default: () => ({}) },
      officialUniversityId: { type: Object, default: () => ({}) },
      employeeIdDocument: { type: Object, default: () => ({}) },
      supportingDocument: { type: Object, default: () => ({}) },
    },
    // Secure single-use activation token for email activation
    activationTokenHash: {
      type: String,
      select: false,
    },
    activationTokenExpires: {
      type: Date,
      default: null,
    },
    activationTokenUsed: {
      type: Boolean,
      default: false,
    },
    activatedAt: {
      type: Date,
      default: null,
    },
    // Agent-specific agency association
    agencyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    agentApplicationId: {
      type: String,
      default: '',
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.password;
        // Dynamically evaluate active usable credits (respecting 1-month expiry and purchase forfeiture)
        const now = new Date();
        const isFreeExpired = ret.freeCreditExpiresAt && new Date(ret.freeCreditExpiresAt) < now;
        const isFreeForfeited = Boolean(ret.freeCreditsForfeited);
        const activeFree = (!isFreeExpired && !isFreeForfeited) ? (ret.freeCredits || 0) : 0;
        const activePaid = ret.paidCredits || 0;
        ret.availableCredits = activeFree + activePaid;
        ret.walletCredits = ret.availableCredits;
        ret.activeFreeCredits = activeFree;
        ret.isFreeExpired = isFreeExpired;

        // Compatibility layer for frontend checking user.user_metadata
        ret.user_metadata = {
          full_name: ret.name,
          phone: ret.phone,
          role: ret.role,
          accountStatus: ret.accountStatus,
          isActive: ret.isActive,
          agencyVerificationStatus: ret.agencyVerificationStatus,
          uniRepVerificationStatus: ret.uniRepVerificationStatus,
          universityId: ret.universityId,
          universityRepApplicationId: ret.universityRepApplicationId,
          designation: ret.designation,
          department: ret.department,
          officialUniversityEmail: ret.officialUniversityEmail,
        };
        return ret;
      },
    },
  }
);

// Encrypt password using bcryptjs before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare user-entered password to hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
