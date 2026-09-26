import mongoose from 'mongoose';

const countrySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    flag: {
      type: String,
      default: '🌐',
    },
    region: {
      type: String,
      default: 'Global',
    },
    currency: {
      type: String,
      default: 'USD',
    },
    avgTuition: {
      type: String,
      default: '$15,000 - $35,000 / year',
    },
    avgLivingCost: {
      type: String,
      default: '$800 - $1,500 / month',
    },
    visaInfo: {
      type: String,
      default: 'Student visa required with proof of funds.',
    },
    englishRequirements: {
      type: String,
      default: 'IELTS 6.0+ or TOEFL 80+',
    },
    studyLevels: {
      type: [String],
      default: ['Bachelor', 'Master', 'PhD'],
    },
    popularPrograms: {
      type: [String],
      default: ['Computer Science', 'Business Administration', 'Engineering'],
    },
    description: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const Country = mongoose.model('Country', countrySchema);
export default Country;
