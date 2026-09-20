import mongoose from 'mongoose';

const universitySchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
      lowercase: true,
    },
    type: {
      type: String,
      default: 'Public',
    },
    logo: {
      type: String,
      default: '',
    },
    coverImage: {
      type: String,
      default: '',
    },
    rank: {
      type: String,
      default: 'Top 100',
    },
    acceptanceRate: {
      type: String,
      default: '10%',
    },
    totalStudents: {
      type: String,
      default: '20,000+',
    },
    internationalPct: {
      type: String,
      default: '20%',
    },
    about: {
      type: String,
      default: '',
    },
    history: {
      type: String,
      default: '',
    },
    programs: [
      {
        name: String,
        degree: String,
      },
    ],
    facultyStudentRatio: {
      type: String,
      default: '8:1',
    },
    intakeSeasons: [String],
    admissionReqs: {
      gpa: String,
      testScores: String,
      englishProficiency: String,
      documents: [String],
    },
    applicationDeadline: {
      type: String,
      default: 'Rolling Admissions',
    },
    costs: {
      tuition: String,
      housingAndFood: String,
      studentFees: String,
      booksAndSupplies: String,
      totalEstimated: String,
    },
    scholarshipsList: [
      {
        name: String,
        amount: String,
        description: String,
      },
    ],
    housing: String,
    facilities: [String],
    clubs: String,
    careerServices: String,
    employmentRate: String,
    averageStartingSalary: String,
    alumniNetwork: String,
    topEmployers: [String],
    tags: [String],
    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const University = mongoose.model('University', universitySchema);
export default University;
