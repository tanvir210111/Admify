/**
 * Admify AI Service
 * Provides algorithmic scoring for university match, admission probability,
 * AI document drafting (SOP & LOR), and chat response generation.
 */

export const generateSOP = ({
  fullName = 'Applicant',
  university = 'Stanford University',
  course = 'M.S. Computer Science',
  experience = 'academic coursework and research projects',
  tone = 'academic',
}) => {
  return `STATEMENT OF PURPOSE

Candidate: ${fullName}
Target Institution: ${university}
Intended Program: ${course}
Tone: ${tone.toUpperCase()}

To the Esteemed Admissions Committee,

I am writing to formally submit my application for admission to the ${course} program at ${university}. My intellectual journey and professional ambitions have converged on an overarching objective: to engineer groundbreaking computational methodologies and contribute rigorously to transformative research in modern computer systems and applied artificial intelligence.

Throughout my undergraduate tenure and subsequent background involving ${experience}, I established a formidable foundation in foundational mathematics, distributed algorithms, data structures, and statistical machine learning. Beyond academic performance, my active participation in technical projects revealed the immense societal impact of architecting scalable, ethically grounded intelligent systems.

${university}'s distinguished legacy of academic leadership, renowned research centers, and visionary faculty members make it the ideal environment for my graduate education. I am particularly eager to engage with ongoing research initiatives, collaborate with fellow researchers, and leverage the institutional resources to push the boundaries of current engineering disciplines.

I am confident that my analytical determination, academic discipline, and profound enthusiasm will enable me to make meaningful contributions to the academic community at ${university}. Thank you for your time and consideration of my candidacy.

Sincerely,
${fullName}`;
};

export const generateLOR = ({
  studentName = 'Candidate',
  recommenderName = 'Prof. Dr. Robert Vance',
  recommenderTitle = 'Professor of Computer Science & Engineering',
  university = 'Stanford University',
  course = 'M.S. Computer Science',
  relationship = 'academic supervisor and course instructor for 3 years',
}) => {
  return `CONFIDENTIAL LETTER OF RECOMMENDATION

To the Graduate Admissions Committee,
${university}

Subject: Recommendation for ${studentName} — ${course}

Dear Members of the Admissions Committee,

It is a distinct privilege to provide my highest recommendation for ${studentName} for admission to the ${course} program at ${university}. I have known ${studentName} for the past several semesters in my capacity as their ${relationship}. In this time, I have had ample opportunity to observe their academic prowess, research diligence, and exceptional moral character.

Among the cohort of students I have mentored over the past decade, ${studentName} unmistakably ranks within the top percentile in terms of analytical rigor and conceptual synthesis. During coursework and collaborative laboratory seminars, they demonstrated not only mastery over complex theoretical paradigms, but also an innate curiosity that frequently prompted sophisticated independent investigations.

Their ability to formulate hypothesis-driven experiments, critically analyze voluminous datasets, and communicate technical findings clearly distinguishes them as an exemplary candidate for graduate research at an elite institution like ${university}.

Beyond their academic caliber, ${studentName} exemplifies collaborative integrity, resilience in solving ambiguous problems, and an unwavering commitment to scholastic excellence. I recommend ${studentName} with utmost enthusiasm and without any reservation.

Respectfully submitted,

${recommenderName}
${recommenderTitle}`;
};

export const calculateAdmissionProbability = ({
  gpa = 3.5,
  ielts = 7.0,
  gre = null,
  universityRank = 50,
  workExperienceYears = 1,
}) => {
  let score = 50; // Base score

  // GPA factor (max +25)
  const numericGpa = parseFloat(gpa) || 3.0;
  if (numericGpa >= 3.8) score += 25;
  else if (numericGpa >= 3.5) score += 20;
  else if (numericGpa >= 3.2) score += 14;
  else score += 5;

  // Language proficiency factor (max +15)
  const numericIelts = parseFloat(ielts) || 6.5;
  if (numericIelts >= 7.5) score += 15;
  else if (numericIelts >= 7.0) score += 12;
  else if (numericIelts >= 6.5) score += 8;
  else score += 2;

  // Experience factor (max +10)
  if (workExperienceYears >= 3) score += 10;
  else if (workExperienceYears >= 1) score += 6;

  // University competitiveness penalty
  if (universityRank <= 10) score -= 18;
  else if (universityRank <= 30) score -= 12;
  else if (universityRank <= 100) score -= 6;

  const finalProbability = Math.min(Math.max(Math.round(score), 15), 98);

  let category = 'Target';
  if (finalProbability >= 85) category = 'Safe';
  else if (finalProbability < 60) category = 'Reach / Dream';

  return {
    probability: finalProbability,
    category,
    breakdown: {
      academicFactor: numericGpa >= 3.5 ? 'Strong' : 'Moderate',
      languageFactor: numericIelts >= 7.0 ? 'Exceeds Requirement' : 'Meets Requirement',
      competitiveness: universityRank <= 30 ? 'Highly Competitive' : 'Standard Selective',
    },
    recommendations: [
      numericGpa < 3.6 ? 'Highlight relevant research projects or capstone work to offset GPA' : 'Maintain current academic trajectory',
      numericIelts < 7.5 ? 'Target 7.5+ on IELTS or 100+ on TOEFL for competitive edge' : 'Language requirement comfortably met',
      'Submit customized SOP emphasizing alignment with faculty research labs',
    ],
  };
};

export default {
  generateSOP,
  generateLOR,
  calculateAdmissionProbability,
};
