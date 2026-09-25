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
      enum: ['student', 'agent', 'agency', 'university', 'university representative', 'admin'],
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
