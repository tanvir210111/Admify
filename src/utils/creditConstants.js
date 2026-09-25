// Base Credit Economy Rules
// 1 Credit = ৳100 BDT
export const BDT_PER_CREDIT = 100;

export const formatBDT = (amount) => {
  return "৳" + Number(amount || 0).toLocaleString("en-BD");
};

export const CREDIT_PACKAGES_LIST = [
  {
    id: "starter",
    name: "Free Starter",
    credits: 20,
    priceBdt: 0,
    priceBDT: 0,
    tagline: "Instant welcome credits upon registration",
    description: "Perfect for trying your first $0 direct university application or exploring AI tools.",
    isFree: true,
  },
  {
    id: "basic",
    name: "Basic",
    credits: 100,
    priceBdt: 10000,
    priceBDT: 10000,
    tagline: "Standard applicant pack",
    description: "Great for multiple AI recommendations, SOP/LOR generations, and university comparisons.",
    isFree: false,
  },
  {
    id: "standard",
    name: "Standard",
    credits: 500,
    priceBdt: 50000,
    priceBDT: 50000,
    tagline: "Comprehensive admissions toolkit",
    description: "Ideal for complete direct university applications and comprehensive document checks.",
    isFree: false,
  },
  {
    id: "premium",
    name: "Premium",
    credits: 1000,
    priceBdt: 100000,
    priceBDT: 100000,
    tagline: "Agency assistance ready",
    description: "Unlocks full Agency Assistance (800 CR) plus ample credits for applications & AI tools.",
    isFree: false,
  },
  {
    id: "ultimate",
    name: "Ultimate",
    credits: 2000,
    priceBdt: 200000,
    priceBDT: 200000,
    tagline: "Full agency managed service",
    description: "Fully funds Full Agency Managed Service (1,500 CR) with surplus for priority processing.",
    isFree: false,
  },
];

// Dual-access: can be used as an Array (for .map) or Object (CREDIT_PACKAGES.FREE_STARTER)
export const CREDIT_PACKAGES = Object.assign([...CREDIT_PACKAGES_LIST], {
  FREE_STARTER: CREDIT_PACKAGES_LIST[0],
  BASIC: CREDIT_PACKAGES_LIST[1],
  STANDARD: CREDIT_PACKAGES_LIST[2],
  PREMIUM: CREDIT_PACKAGES_LIST[3],
  ULTIMATE: CREDIT_PACKAGES_LIST[4],
});

export const SERVICE_CREDIT_COSTS = {
  ZERO_FEE_APP: 20,
  PAID_APP_SERVICE: 40,
  AI_RECOMMENDATION: 10,
  ADMISSION_PROBABILITY: 5,
  AI_SOP_GEN: 10,
  SOP_REWRITE: 5,
  AI_LOR_GEN: 10,
  LOR_REWRITE: 5,
  DOC_REVIEW: 5,
  SCHOLARSHIP_MATCH: 5,
  UNI_COMPARE: 2,
  COST_ESTIMATOR: 2,
  ADDITIONAL_APP_PROCESSING: 10,
  AGENCY_ASSISTANCE: 800,
  FULL_AGENCY_MANAGED: 1500,
};

export const CREDIT_COSTS = {
  UNIVERSITY_APPLICATION_FREE: {
    code: "UNIVERSITY_APPLICATION_FREE",
    name: "$0 University Application",
    credits: 20,
    description: "Official Application Fee $0 university application platform service",
  },
  UNIVERSITY_APPLICATION_PAID: {
    code: "UNIVERSITY_APPLICATION_PAID",
    name: "Paid University Application Service",
    credits: 40,
    description: "Platform service cost + official university application fee",
  },
  AI_RECOMMENDATION: {
    code: "AI_RECOMMENDATION",
    name: "AI University Recommendation",
    credits: 10,
    description: "Deep algorithmic matching and tailored admission recommendations",
  },
  ADMISSION_PROBABILITY: {
    code: "ADMISSION_PROBABILITY",
    name: "Admission Probability Analysis",
    credits: 5,
    description: "Predictive acceptance probability calculation engine",
  },
  AI_SOP: {
    code: "AI_SOP",
    name: "AI SOP Generation",
    credits: 10,
    description: "Full tailored Statement of Purpose synthesis",
  },
  SOP_REWRITE: {
    code: "SOP_REWRITE",
    name: "SOP AI Rewrite/Improve",
    credits: 5,
    description: "Paragraph enhancement, grammatical polish, and tone refinement",
  },
  AI_LOR: {
    code: "AI_LOR",
    name: "AI LOR Generation",
    credits: 10,
    description: "Tailored institutional Letter of Recommendation generation",
  },
  LOR_REWRITE: {
    code: "LOR_REWRITE",
    name: "LOR AI Rewrite/Improve",
    credits: 5,
    description: "Professional recommendation polish and tone enhancement",
  },
  DOCUMENT_REVIEW: {
    code: "DOCUMENT_REVIEW",
    name: "Document Review",
    credits: 5,
    description: "Compliance & completeness review of academic vault uploads",
  },
  AI_SCHOLARSHIP: {
    code: "AI_SCHOLARSHIP",
    name: "AI Scholarship Matching",
    credits: 5,
    description: "Personalized merit & need-based scholarship curation",
  },
  UNIVERSITY_COMPARISON: {
    code: "UNIVERSITY_COMPARISON",
    name: "University Comparison",
    credits: 2,
    description: "Side-by-side metric analytics across shortlisted institutions",
  },
  COST_ESTIMATOR: {
    code: "COST_ESTIMATOR",
    name: "Cost Estimator",
    credits: 2,
    description: "Detailed annual tuition & living expenses calculation",
  },
  ADDITIONAL_APPLICATION: {
    code: "ADDITIONAL_APPLICATION",
    name: "Additional Application Processing",
    credits: 10,
    description: "Supplemental application document preparation and audit",
  },
  AGENCY_ASSISTANCE: {
    code: "AGENCY_ASSISTANCE",
    name: "Agency Assistance",
    credits: 800,
    priceBdt: 80000,
    description: "Support and counseling service with assigned agency and agent",
  },
  FULL_AGENCY_MANAGED: {
    code: "FULL_AGENCY_MANAGED",
    name: "Full Agency Managed Service",
    credits: 1500,
    priceBdt: 150000,
    description: "End-to-end comprehensive study-abroad agency management",
  },
};
