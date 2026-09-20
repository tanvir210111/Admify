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
    // Wallet / Credits system
    walletCredits: {
      type: Number,
      default: 250, // Initial bonus credits
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.password;
        // Provide compatibility layer for frontend checking user.user_metadata
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
