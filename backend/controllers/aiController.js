import mongoose from 'mongoose';
import geminiService from '../services/geminiService.js';
import { calculateAdmissionProbability } from '../services/aiService.js';
import University from '../models/University.js';
import Scholarship from '../models/Scholarship.js';
import Transaction from '../models/Transaction.js';
import devStore from '../utils/devStore.js';

// ── 1. SOP Generator ────────────────────────────────────────────────────────
export const generateSOPHandler = async (req, res, next) => {
  try {
    const { university, course, experience, tone, careerGoals, motivation, achievements } = req.body;
    const fullName = req.user?.name || req.body.fullName || 'Applicant';

    const document = await geminiService.generateSOP({
      fullName,
      university: university || 'Target University',
      course: course || 'Graduate Program',
      experience: experience || 'academic coursework and research projects',
      tone: tone || 'academic',
      careerGoals: careerGoals || 'advance innovative research and lead technical initiatives',
      motivation: motivation || '',
      achievements: achievements || '',
    });

    // If authenticated user, optionally deduct wallet credits if applicable
    if (req.user && typeof req.user.walletCredits === 'number' && req.user.walletCredits >= 5) {
      req.user.walletCredits -= 5;
      if (typeof req.user.save === 'function') {
        await req.user.save();
      }
      try {
        if (mongoose.connection.readyState === 1) {
          await Transaction.create({
            user: req.user._id,
            type: 'debit',
            amount: 5,
            desc: `AI SOP Generation for ${university || 'University'}`,
          });
        }
      } catch {}
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

// ── 2. LOR Generator ────────────────────────────────────────────────────────
export const generateLORHandler = async (req, res, next) => {
  try {
    const { university, course, recommenderName, recommenderTitle, relationship, achievements } = req.body;
    const studentName = req.user?.name || req.body.studentName || 'Candidate';

    const document = await geminiService.generateLOR({
      studentName,
      university: university || 'Target University',
      course: course || 'Graduate Program',
      recommenderName: recommenderName || 'Prof. Dr. Robert Vance',
      recommenderTitle: recommenderTitle || 'Senior Professor',
      relationship: relationship || 'academic instructor and research supervisor',
      achievements: achievements || 'exceptional scholastic performance',
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

// ── 3. Admission Probability (Hybrid: Real Calculation + Gemini Insights) ────
export const predictAdmissionHandler = async (req, res, next) => {
  try {
    const gpa = req.body.gpa || req.user?.gpa || 3.6;
    const ielts = req.body.ielts || req.user?.ielts || 7.0;
    const gre = req.body.gre || req.user?.gre || null;
    const universityRank = req.body.universityRank || 35;
    const workExperienceYears = req.body.workExperienceYears || 1;

    // Preserve authentic mathematical calculation
    const mathResult = calculateAdmissionProbability({
      gpa,
      ielts,
      gre,
      universityRank,
      workExperienceYears,
    });

    // Enhance with Gemini qualitative reasoning
    const hybridPrediction = await geminiService.generateAdmissionProbability({
      gpa,
      ielts,
      gre,
      universityRank,
      workExperienceYears,
      calculatedScore: mathResult.score || mathResult.probability || 75,
      mathBreakdown: mathResult,
    });

    return res.status(200).json({
      success: true,
      data: {
        prediction: hybridPrediction,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── 4. University Recommendations (Database-Grounded + Gemini Reasoning) ────
export const getRecommendationsHandler = async (req, res, next) => {
  try {
    let universities = [];
    if (mongoose.connection.readyState === 1) {
      universities = await University.find({}).limit(10).lean();
    } else {
      const db = devStore.read();
      universities = (db.universities || []).slice(0, 10);
    }

    const matches = universities.map((uni, idx) => {
      const matchScore = Math.max(98 - idx * 4, 75);
      return {
        _id: uni._id,
        name: uni.name,
        slug: uni.slug,
        location: uni.location || uni.country,
        country: uni.country,
        rank: uni.rank || idx + 15,
        match: matchScore,
        prog: uni.programs?.[0]?.name || uni.programs?.[0] || 'Computer Science & Engineering',
        status: matchScore >= 95 ? 'Ready to Apply' : matchScore >= 90 ? 'SOP Generated' : 'Profile Review',
        logo: uni.logo,
        coverImage: uni.coverImage,
      };
    });

    const studentProfile = {
      name: req.user?.name || 'Student',
      gpa: req.user?.gpa || req.query.gpa || '3.6',
      ielts: req.user?.ielts || req.query.ielts || '7.0',
      targetCountry: req.user?.targetCountry || req.query.country || 'Global',
    };

    const aiReasoning = await geminiService.generateUniversityRecommendation({
      profile: studentProfile,
      targetCountry: studentProfile.targetCountry,
      dbUniversities: universities,
    });

    return res.status(200).json({
      success: true,
      count: matches.length,
      data: {
        matches,
        aiReasoning,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── 5. Country Recommendation ───────────────────────────────────────────────
export const countryRecommendationHandler = async (req, res, next) => {
  try {
    const studentProfile = {
      name: req.user?.name || req.body.name || 'Applicant',
      gpa: req.body.gpa || req.user?.gpa || '3.5',
      ielts: req.body.ielts || req.user?.ielts || '6.5',
      budget: req.body.budget || 'Moderate ($15,000 - $30,000/yr)',
      postStudyWorkPriority: req.body.postStudyWorkPriority || 'High',
      targetDegree: req.body.targetDegree || "Master's",
    };

    const prompt = `Student Preferences:
- Budget: ${studentProfile.budget}
- GPA: ${studentProfile.gpa}
- IELTS / Language Score: ${studentProfile.ielts}
- Post-Study Work Visa Priority: ${studentProfile.postStudyWorkPriority}
- Target Degree Level: ${studentProfile.targetDegree}

Admify Primary Destinations:
1. United Kingdom (1-year Masters, 2-year Graduate Route)
2. United States (OPT STEM extension up to 3 years, top tier research)
3. Canada (Post-Graduation Work Permit up to 3 years, immigration pathways)
4. Germany (Low/zero public tuition, 18-month job seeker visa)
5. Australia (Post-study work rights 2-4 years, high minimum wage)

Provide a structured recommendation ranking top 3 countries with clear pros, cons, and financial feasibility:`;

    const aiGuidance = await geminiService.generateChatResponse({
      prompt,
      dbGrounding: 'Admify supports 20 destination countries with authentic tuition, visa regulations, and living costs in dual currency BDT and USD.',
    });

    return res.status(200).json({
      success: true,
      data: {
        recommendation: aiGuidance,
        studentProfile,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── 6. Scholarship Recommendation ───────────────────────────────────────────
export const scholarshipRecommendationHandler = async (req, res, next) => {
  try {
    let scholarships = [];
    if (mongoose.connection.readyState === 1) {
      scholarships = await Scholarship.find({}).limit(10).lean();
    } else {
      const db = devStore.read();
      scholarships = (db.scholarships || []).slice(0, 10);
    }

    const studentProfile = {
      gpa: req.body.gpa || req.user?.gpa || '3.6',
      targetCountry: req.body.targetCountry || req.user?.targetCountry || 'Global',
      degreeLevel: req.body.degreeLevel || "Master's",
    };

    const aiAnalysis = await geminiService.generateScholarshipRecommendation({
      profile: studentProfile,
      dbScholarships: scholarships,
    });

    return res.status(200).json({
      success: true,
      count: scholarships.length,
      data: {
        scholarships,
        aiAnalysis,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── 7. Profile Strength Analysis ────────────────────────────────────────────
export const profileStrengthHandler = async (req, res, next) => {
  try {
    const studentProfile = {
      name: req.user?.name || req.body.name || 'Applicant',
      gpa: req.body.gpa || req.user?.gpa || '3.5',
      ielts: req.body.ielts || req.user?.ielts || '7.0',
      gre: req.body.gre || req.user?.gre || null,
      targetCountry: req.body.targetCountry || req.user?.targetCountry || 'United Kingdom',
      targetCourse: req.body.targetCourse || req.user?.targetCourse || 'Computer Science',
      hasSop: Boolean(req.body.hasSop || req.user?.sop),
      hasTranscripts: Boolean(req.body.hasTranscripts),
    };

    let score = 50;
    if (parseFloat(studentProfile.gpa) >= 3.6) score += 20;
    else if (parseFloat(studentProfile.gpa) >= 3.2) score += 12;
    if (parseFloat(studentProfile.ielts) >= 7.0) score += 15;
    if (studentProfile.hasSop) score += 10;
    if (studentProfile.hasTranscripts) score += 5;

    const analysis = await geminiService.generateProfileStrength({
      profile: studentProfile,
      completenessScore: Math.min(score, 100),
    });

    return res.status(200).json({
      success: true,
      data: {
        score: Math.min(score, 100),
        status: score >= 80 ? 'Competitive' : score >= 65 ? 'Moderate' : 'Needs Optimization',
        analysis,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── 8. University Comparison ────────────────────────────────────────────────
export const universityComparisonHandler = async (req, res, next) => {
  try {
    const { universityIdA, universityIdB, uniAData, uniBData } = req.body;

    let uniA = uniAData;
    let uniB = uniBData;

    if (!uniA && universityIdA) {
      if (mongoose.connection.readyState === 1) {
        uniA = await University.findById(universityIdA).lean();
      } else {
        uniA = (devStore.read().universities || []).find((u) => u._id?.toString() === universityIdA.toString());
      }
    }

    if (!uniB && universityIdB) {
      if (mongoose.connection.readyState === 1) {
        uniB = await University.findById(universityIdB).lean();
      } else {
        uniB = (devStore.read().universities || []).find((u) => u._id?.toString() === universityIdB.toString());
      }
    }

    if (!uniA || !uniB) {
      return res.status(400).json({
        success: false,
        message: 'Two valid universities are required for comparison.',
      });
    }

    const comparisonText = await geminiService.generateUniversityComparison({
      universityA: uniA,
      universityB: uniB,
    });

    return res.status(200).json({
      success: true,
      data: {
        universityA: uniA,
        universityB: uniB,
        comparison: comparisonText,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── 9. General Study-Abroad Guidance ────────────────────────────────────────
export const studyGuidanceHandler = async (req, res, next) => {
  try {
    const { topic, query } = req.body;

    const guidance = await geminiService.generateStudyGuidance({
      topic: topic || 'General Study Abroad Advice',
      studentQuery: query || 'What are the main steps to prepare for international university admission?',
    });

    return res.status(200).json({
      success: true,
      data: {
        guidance,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── 10. AI Chat Endpoint ────────────────────────────────────────────────────
export const chatHandler = async (req, res, next) => {
  try {
    const { prompt, conversationHistory } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ success: false, message: 'Prompt is required.' });
    }

    const reply = await geminiService.generateChatResponse({
      prompt,
      conversationHistory: conversationHistory || [],
      dbGrounding: 'Admify platform verified admission and scholarship data.',
    });

    return res.status(200).json({
      success: true,
      data: {
        reply,
      },
    });
  } catch (error) {
    next(error);
  }
};

export default {
  generateSOPHandler,
  generateLORHandler,
  predictAdmissionHandler,
  getRecommendationsHandler,
  countryRecommendationHandler,
  scholarshipRecommendationHandler,
  profileStrengthHandler,
  universityComparisonHandler,
  studyGuidanceHandler,
  chatHandler,
};
