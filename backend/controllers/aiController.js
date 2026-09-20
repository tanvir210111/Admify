import { generateSOP, generateLOR, calculateAdmissionProbability } from '../services/aiService.js';
import University from '../models/University.js';
import Transaction from '../models/Transaction.js';

// @desc    Generate AI Statement of Purpose
// @route   POST /api/ai/generate-sop
// @access  Public / Private
export const generateSOPHandler = async (req, res, next) => {
  try {
    const { university, course, experience, tone } = req.body;
    const fullName = req.user ? req.user.name : (req.body.fullName || 'Applicant');

    const document = generateSOP({
      fullName,
      university: university || 'Stanford University',
      course: course || 'M.S. Computer Science',
      experience: experience || 'rigorous academic coursework and projects',
      tone: tone || 'academic',
    });

    // If authenticated user, optionally log transaction
    if (req.user) {
      const user = req.user;
      if (user.walletCredits >= 5) {
        user.walletCredits -= 5;
        await user.save();

        await Transaction.create({
          user: user._id,
          type: 'debit',
          amount: 5,
          desc: `AI SOP Generation for ${university || 'University'}`,
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Statement of Purpose generated successfully',
      data: {
        document,
        type: 'sop',
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate AI Letter of Recommendation
// @route   POST /api/ai/generate-lor
// @access  Public / Private
export const generateLORHandler = async (req, res, next) => {
  try {
    const { university, course, recommenderName, recommenderTitle, relationship } = req.body;
    const studentName = req.user ? req.user.name : (req.body.studentName || 'Alex Doe');

    const document = generateLOR({
      studentName,
      university: university || 'Stanford University',
      course: course || 'M.S. Computer Science',
      recommenderName: recommenderName || 'Prof. Dr. Robert Vance',
      recommenderTitle: recommenderTitle || 'Professor of Computer Science',
      relationship: relationship || 'academic supervisor for 2 years',
    });

    return res.status(200).json({
      success: true,
      message: 'Letter of Recommendation generated successfully',
      data: {
        document,
        type: 'lor',
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Predict admission probability
// @route   POST /api/ai/predict-admission
// @access  Public
export const predictAdmissionHandler = async (req, res, next) => {
  try {
    const { gpa, ielts, gre, universityRank, workExperienceYears } = req.body;

    const prediction = calculateAdmissionProbability({
      gpa: gpa || (req.user && req.user.gpa) || 3.6,
      ielts: ielts || (req.user && req.user.ielts) || 7.0,
      gre,
      universityRank: universityRank || 25,
      workExperienceYears: workExperienceYears || 1,
    });

    return res.status(200).json({
      success: true,
      data: { prediction },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get AI university recommendations
// @route   GET /api/ai/recommendations
// @access  Public / Private
export const getRecommendationsHandler = async (req, res, next) => {
  try {
    const universities = await University.find({}).limit(6);

    const matches = universities.map((uni, idx) => {
      const matchScore = Math.max(98 - idx * 4, 75);
      return {
        _id: uni._id,
        name: uni.name,
        slug: uni.slug,
        location: uni.location,
        country: uni.country,
        rank: uni.rank,
        match: matchScore,
        prog: uni.programs?.[0]?.name || 'Computer Science',
        status: matchScore >= 95 ? 'Ready to Apply' : matchScore >= 90 ? 'SOP Generated' : 'Profile Review',
        logo: uni.logo,
        coverImage: uni.coverImage,
      };
    });

    return res.status(200).json({
      success: true,
      count: matches.length,
      data: { matches },
    });
  } catch (error) {
    next(error);
  }
};
