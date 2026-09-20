import mongoose from 'mongoose';

const scholarshipSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    sponsor: {
      type: String,
      required: true,
    },
    amount: {
      type: String,
      required: true,
    },
    coverage: {
      type: String,
      default: 'Partial Tuition',
    },
    eligibility: {
      type: String,
      required: true,
    },
    deadline: {
      type: String,
      required: true,
    },
    match: {
      type: String,
      default: '95%',
    },
    type: {
      type: String,
      enum: ['merit', 'need', 'subject', 'general'],
      default: 'merit',
    },
    status: {
      type: String,
      default: 'Eligible',
    },
    country: {
      type: String,
      default: 'Global',
    },
    description: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Scholarship = mongoose.model('Scholarship', scholarshipSchema);
export default Scholarship;
