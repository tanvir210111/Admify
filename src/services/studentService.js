import { api } from '../lib/api';
import { universityDatabase } from '../data/universityDetails';
import { convertTextToDual } from '../utils/currency';

// Storage keys for student state persistence
const STORAGE_KEYS = {
  DIRECT_APPS: 'admify_student_direct_apps',
  SAVED_UNIS: 'admify_student_saved_unis',
  COMPARE_UNIS: 'admify_student_compare_unis',
  DOCUMENTS: 'admify_student_documents',
  AGENCY_REQUESTS: 'admify_student_agency_requests',
  REPORTS: 'admify_student_reports',
  FREE_APP_USED: 'admify_student_free_app_used',
};

// Purge mock seed data on load so student starts completely clean
try {
  const direct = localStorage.getItem(STORAGE_KEYS.DIRECT_APPS);
  if (direct && (direct.includes('app-seed-1') || direct.includes('Stanford University'))) {
    localStorage.removeItem(STORAGE_KEYS.DIRECT_APPS);
  }
  const agency = localStorage.getItem(STORAGE_KEYS.AGENCY_REQUESTS);
  if (agency && agency.includes('req-9821')) {
    localStorage.removeItem(STORAGE_KEYS.AGENCY_REQUESTS);
  }
  const docs = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
  if (docs && docs.includes('doc-1')) {
    localStorage.removeItem(STORAGE_KEYS.DOCUMENTS);
  }
  const reps = localStorage.getItem(STORAGE_KEYS.REPORTS);
  if (reps && reps.includes('rep-101')) {
    localStorage.removeItem(STORAGE_KEYS.REPORTS);
  }
  const saved = localStorage.getItem(STORAGE_KEYS.SAVED_UNIS);
  if (saved && saved.includes('stanford-university')) {
    localStorage.removeItem(STORAGE_KEYS.SAVED_UNIS);
  }
  const comp = localStorage.getItem(STORAGE_KEYS.COMPARE_UNIS);
  if (comp && comp.includes('stanford-university')) {
    localStorage.removeItem(STORAGE_KEYS.COMPARE_UNIS);
  }
} catch {}

// Initial default registered agencies for the bidding ecosystem
export const REGISTERED_AGENCIES = [
  {
    id: 'ag-1',
    name: 'GlobalBridge Pathways',
    tagline: 'Premier Ivy League & Russell Group Specialist',
    logo: '🌐',
    country: 'United Kingdom',
    rating: 4.9,
    reviewsCount: 312,
    successRate: '98.4%',
    studentsPlaced: '4,200+',
    countriesServed: ['United States', 'United Kingdom', 'Canada', 'Australia'],
    services: ['Profile Evaluation', 'SOP Polishing', 'Visa Expediting', 'Scholarship Negotiation'],
    experienceYears: 12,
    agentName: 'Eleanor Vance',
    agentRole: 'Senior Academic Counselor',
    agentAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    bidAmount: '৳35,880 ($299)',
    bidProposal: 'Comprehensive top-3 university guidance, personalized SOP review with native editor, and 100% visa interview preparation pass record.',
    turnaroundDays: 3,
    status: 'bid_submitted',
    eligible: true,
  },
  {
    id: 'ag-2',
    name: 'AdmitEdge International',
    tagline: 'STEM & Direct-to-University Placement Experts',
    logo: '🚀',
    country: 'United States',
    rating: 4.8,
    reviewsCount: 254,
    successRate: '96.8%',
    studentsPlaced: '3,800+',
    countriesServed: ['United States', 'Germany', 'Switzerland', 'Canada'],
    services: ['University Selection', 'Financial Planning', 'University Liaison', 'Document Auditing'],
    experienceYears: 9,
    agentName: 'Marcus Sterling',
    agentRole: 'Director of International Admissions',
    agentAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200',
    bidAmount: '৳29,880 ($249)',
    bidProposal: 'Direct university partnership processing with waived application fee support and expedited representative follow-up.',
    turnaroundDays: 2,
    status: 'bid_submitted',
    eligible: true,
  },
  {
    id: 'ag-3',
    name: 'EuroScholar Advisory',
    tagline: 'Europe & Scandinavia Low-Tuition Specialists',
    logo: '🏛️',
    country: 'Germany',
    rating: 4.9,
    reviewsCount: 198,
    successRate: '97.2%',
    studentsPlaced: '2,150+',
    countriesServed: ['Germany', 'Switzerland', 'Netherlands', 'Sweden'],
    services: ['Public University Applications', 'Blocked Account Setup', 'Visa Processing', 'Language Test Prep'],
    experienceYears: 8,
    agentName: 'Dr. Julia Weber',
    agentRole: 'Head of European Studies',
    agentAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200',
    bidAmount: '৳23,880 ($199)',
    bidProposal: 'Zero-tuition German & European public university admissions focus with full document legalization assistance.',
    turnaroundDays: 4,
    status: 'bid_submitted',
    eligible: true,
  },
  {
    id: 'ag-4',
    name: 'Pacific Blue EduCare',
    tagline: 'Australia & New Zealand Post-Study Work Visas',
    logo: '🦘',
    country: 'Australia',
    rating: 4.7,
    reviewsCount: 180,
    successRate: '95.5%',
    studentsPlaced: '2,900+',
    countriesServed: ['Australia', 'New Zealand'],
    services: ['GTE Statement Review', 'OSHC Insurance', 'Offer Letter Expedited Processing'],
    experienceYears: 11,
    agentName: 'Harrison Cole',
    agentRole: 'Certified MARA Education Consultant',
    agentAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200',
    bidAmount: '৳26,400 ($220)',
    bidProposal: 'Official Australian Go8 partner agent. Direct streamlined visa processing with high grant rate.',
    turnaroundDays: 3,
    status: 'bid_submitted',
    eligible: true,
  },
];

// Helper to get local data safely
const getLocal = (key, fallback) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
};

const setLocal = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`[StudentService] setLocal failed for ${key}`, err);
  }
};

/**
 * Calculate dynamic profile strength percentage and checklists
 */
export function calculateProfileStrength(user) {
  const checks = [
    { key: 'name', label: 'Full Name', completed: Boolean(user?.name || user?.user_metadata?.full_name), weight: 15 },
    { key: 'email', label: 'Verified Email', completed: Boolean(user?.email), weight: 10 },
    { key: 'phone', label: 'Phone Number', completed: Boolean(user?.phone || user?.user_metadata?.phone), weight: 10 },
    { key: 'gpa', label: 'Academic CGPA / Scores', completed: Boolean(user?.gpa && user?.gpa !== '0'), weight: 20 },
    { key: 'ielts', label: 'English Proficiency (IELTS / TOEFL)', completed: Boolean(user?.ielts && user?.ielts !== '0'), weight: 15 },
    { key: 'targetCountry', label: 'Target Destination Country', completed: Boolean(user?.targetCountry), weight: 10 },
    { key: 'targetCourse', label: 'Target Program / Course', completed: Boolean(user?.targetCourse), weight: 10 },
    { key: 'documents', label: 'Uploaded Application Documents', completed: getLocal(STORAGE_KEYS.DOCUMENTS, []).length > 0, weight: 10 },
  ];

  const totalScore = checks.reduce((acc, curr) => (curr.completed ? acc + curr.weight : acc), 0);
  const missingItems = checks.filter((c) => !c.completed);
  const completedItems = checks.filter((c) => c.completed);

  return {
    percentage: Math.min(100, Math.max(15, totalScore)),
    checks,
    missingItems,
    completedItems,
  };
}

/**
 * Student Service API + Local Cache Gateway
 */
export const studentService = {
  // ── 1. Profile ──────────────────────────────────────────────
  async getProfile() {
    try {
      const res = await api.get('/api/users/profile');
      if (res?.data?.user) return res.data.user;
    } catch {
      // Fallback to local session user
    }
    const cached = localStorage.getItem('admify_user');
    return cached ? JSON.parse(cached) : null;
  },

  async updateProfile(profileData) {
    try {
      const res = await api.put('/api/users/profile', profileData);
      return res?.data?.user || profileData;
    } catch (err) {
      console.warn('[StudentService] Remote update failed, persisting locally', err.message);
      const cached = localStorage.getItem('admify_user');
      const user = cached ? JSON.parse(cached) : {};
      const updated = { ...user, ...profileData };
      localStorage.setItem('admify_user', JSON.stringify(updated));
      return updated;
    }
  },

  // ── Subscription Model: Exactly 3 Plans (Free Starter, Pro Path, Elite Premium) ──
  getStudentPlan(user) {
    if (user?.tier === 'elite' || user?.plan === 'elite') return 'elite';
    if (user?.tier === 'pro' || user?.plan === 'pro') return 'pro';
    try {
      const storedPlan = localStorage.getItem('admify_student_plan');
      if (storedPlan === 'elite' || storedPlan === 'pro') return storedPlan;
      const userStr = localStorage.getItem('admify_user');
      if (userStr) {
        const parsed = JSON.parse(userStr);
        if (parsed?.tier === 'elite' || parsed?.plan === 'elite') return 'elite';
        if (parsed?.tier === 'pro' || parsed?.plan === 'pro') return 'pro';
      }
      const isPrem = localStorage.getItem('admify_is_premium');
      if (isPrem === 'true') return 'pro';
      return 'free';
    } catch {
      return 'free';
    }
  },

  setStudentPlan(plan) {
    try {
      const safePlan = plan === 'elite' ? 'elite' : (plan === 'pro' ? 'pro' : 'free');
      localStorage.setItem('admify_student_plan', safePlan);
      localStorage.setItem('admify_is_premium', safePlan !== 'free' ? 'true' : 'false');
    } catch {}
  },

  isPremiumAccount(user) {
    const plan = this.getStudentPlan(user);
    return plan === 'pro' || plan === 'elite';
  },

  setPremiumAccount(isPremium) {
    this.setStudentPlan(isPremium ? 'pro' : 'free');
  },

  // ── 2. Direct Applications & 1 FREE Application Business Rule ──
  getFreeApplicationStatus() {
    const isUsed = getLocal(STORAGE_KEYS.FREE_APP_USED, false);
    const directApps = getLocal(STORAGE_KEYS.DIRECT_APPS, []);
    const usedCount = directApps.filter((a) => a.applicationType === 'direct').length;
    const freeUsed = isUsed || usedCount >= 1;
    return {
      freeAvailable: !freeUsed,
      usedCount,
      freeAllowed: 1,
    };
  },

  async getMyApplications() {
    let remoteApps = [];
    try {
      const res = await api.get('/api/applications/my');
      if (res?.data?.applications) {
        remoteApps = res.data.applications;
      }
    } catch {
      // Backend offline or unauthorized
    }

    const localApps = getLocal(STORAGE_KEYS.DIRECT_APPS, []);

    // Merge and deduplicate by ID or university+program
    const combinedMap = new Map();
    remoteApps.forEach((app) => combinedMap.set(app._id || `${app.university}-${app.program}`, app));
    localApps.forEach((app) => combinedMap.set(app._id || app.id || `${app.university}-${app.program}`, app));

    return Array.from(combinedMap.values());
  },

  // ── University Application Fee Helper & Clearance State ──
  getUniversityAppFee(uniNameOrSlug) {
    if (!uniNameOrSlug) {
      return { fee: 0, feeUsd: 0, feeBdt: 0, feeDisplay: "৳0 ($0) - Free / Waived", isZeroFee: true };
    }
    const clean = String(uniNameOrSlug).toLowerCase().trim();

    // Zero-Fee Universities (Application Fee = 0)
    const zeroFeeMatchers = [
      'munich', 'tum', 'heidelberg', 'sorbonne', 'vienna', 'helsinki', 
      'oslo', 'iu international', 'coventry', 'greenwich', 'barcelona', 
      'auckland', 'deakin', 'germany', 'norway', 'austria', 'finland'
    ];

    const isZero = zeroFeeMatchers.some(keyword => clean.includes(keyword));
    if (isZero) {
      return {
        fee: 0,
        feeUsd: 0,
        feeBdt: 0,
        feeDisplay: "৳0 ($0) - Free / Waived Fee",
        isZeroFee: true,
        reason: "Zero application fee institution or regional direct partner.",
      };
    }

    // Specific known paid application fees
    let feeUsd = 75;
    if (clean.includes('stanford')) feeUsd = 125;
    else if (clean.includes('mit') || clean.includes('massachusetts')) feeUsd = 75;
    else if (clean.includes('oxford')) feeUsd = 95;
    else if (clean.includes('imperial')) feeUsd = 80;
    else if (clean.includes('toronto')) feeUsd = 95;
    else if (clean.includes('british columbia') || clean.includes('ubc')) feeUsd = 115;
    else if (clean.includes('melbourne')) feeUsd = 100;
    else if (clean.includes('amsterdam')) feeUsd = 100;
    else if (clean.includes('trinity')) feeUsd = 60;
    else if (clean.includes('kth')) feeUsd = 85;
    else if (clean.includes('eth zurich')) feeUsd = 150;
    else if (clean.includes('windsor')) feeUsd = 90;
    else if (clean.includes('arizona')) feeUsd = 70;
    else if (clean.includes('texas')) feeUsd = 75;
    else if (clean.includes('bologna')) feeUsd = 50;
    else if (clean.includes('leuven')) feeUsd = 80;
    else if (clean.includes('tokyo')) feeUsd = 80;
    else if (clean.includes('seoul')) feeUsd = 70;

    const feeBdt = feeUsd * 120;
    return {
      fee: feeUsd,
      feeUsd,
      feeBdt,
      feeDisplay: `৳${feeBdt.toLocaleString()} ($${feeUsd})`,
      isZeroFee: false,
      reason: "Official university institutional application fee applies.",
    };
  },

  getFeeClearance(uniName) {
    const clearances = getLocal('admify_fee_clearances', {});
    const cleanKey = String(uniName || '').toLowerCase().trim();
    return (
      clearances[cleanKey] || {
        status: 'unpaid', // 'unpaid' | 'agent_assigned' | 'verified'
        assignedAgent: null,
        feeDetails: null,
        trxId: null,
        receiptNumber: null,
      }
    );
  },

  requestFeeAgent(uniName, program) {
    const feeInfo = this.getUniversityAppFee(uniName);
    const clearances = getLocal('admify_fee_clearances', {});
    const cleanKey = String(uniName || '').toLowerCase().trim();

    const assignedAgent = {
      id: 'agent-fee-tanvir',
      name: 'Tanvir Ahmed',
      title: 'Admify Admissions Billing & Fee Agent',
      department: 'Admin Panel - Official Fee Collection Desk',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      phone: '+880 1711-234567',
      bkashMerchant: '01711-234567 (Admify Global)',
      nagadNumber: '01711-234567',
      bankName: 'City Bank PLC (Account: 1102938472001)',
      depositRef: `ADM-FEE-${Math.floor(1000 + Math.random() * 9000)}`,
      assignedAt: new Date().toISOString(),
    };

    clearances[cleanKey] = {
      status: 'agent_assigned',
      university: uniName,
      program,
      assignedAgent,
      feeDetails: feeInfo,
      requestedAt: new Date().toISOString(),
    };

    setLocal('admify_fee_clearances', clearances);
    return clearances[cleanKey];
  },

  confirmFeeDeposit(uniName, { trxId, paymentMethod = 'bKash Merchant' } = {}) {
    const clearances = getLocal('admify_fee_clearances', {});
    const cleanKey = String(uniName || '').toLowerCase().trim();
    const existing = clearances[cleanKey] || {};

    const verifiedRecord = {
      ...existing,
      status: 'verified',
      trxId: trxId || `TXN-${Date.now().toString().slice(-6)}`,
      paymentMethod,
      verifiedBy: existing.assignedAgent?.name || 'Admin Panel Billing Desk',
      verifiedAt: new Date().toISOString(),
      receiptNumber: `RCP-${Math.floor(100000 + Math.random() * 900000)}`,
    };

    clearances[cleanKey] = verifiedRecord;
    setLocal('admify_fee_clearances', clearances);
    return verifiedRecord;
  },

  async submitDirectApplication(applicationData) {
    const status = this.getFreeApplicationStatus();
    const isFreeApplication = status.freeAvailable;
    const feeInfo = this.getUniversityAppFee(applicationData.university);

    // Business Rule Check:
    // If university has fee > 0, it must have verified fee clearance by admin agent
    let feeClearance = null;
    if (!feeInfo.isZeroFee) {
      feeClearance = this.getFeeClearance(applicationData.university);
      if (feeClearance.status !== 'verified') {
        throw new Error(
          `Application Fee of ${feeInfo.feeDisplay} for ${applicationData.university} must be deposited & verified by an assigned Admin Fee Agent before submission.`
        );
      }
    }

    const newApp = {
      _id: `dir-${Date.now()}`,
      id: `dir-${Date.now()}`,
      university: applicationData.university,
      program: applicationData.program,
      intake: applicationData.intake || 'Fall 2026',
      notes: applicationData.statement || '',
      logo: applicationData.logo || '🎓',
      applicationType: 'direct',
      isFreeApplication,
      applicationFeeStatus: feeInfo.isZeroFee ? 'Free ($0 App Fee)' : `Fee Cleared (${feeInfo.feeDisplay})`,
      assignedFeeAgent: feeClearance?.assignedAgent?.name || null,
      feeReceipt: feeClearance?.receiptNumber || null,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      stage: 'Submitted',
      progress: 25,
      steps: [
        { label: feeInfo.isZeroFee ? 'Application Submitted ($0 Fee)' : 'Application Submitted (Fee Cleared)', date: 'Today', status: 'completed' },
        { label: 'Documents Review by Uni', date: 'Next Step', status: 'current' },
        { label: 'Department Evaluation', date: 'Pending', status: 'upcoming' },
        { label: 'Admission Decision', date: 'Pending', status: 'upcoming' },
      ],
      createdAt: new Date().toISOString(),
    };

    // Try posting to backend
    try {
      await api.post('/api/applications', {
        university: applicationData.university,
        program: applicationData.program,
        notes: applicationData.statement,
        logo: applicationData.logo,
      });
    } catch (err) {
      console.warn('[StudentService] API submit failed, saving locally', err.message);
    }

    // Persist in local storage
    const current = getLocal(STORAGE_KEYS.DIRECT_APPS, []);
    const updated = [newApp, ...current];
    setLocal(STORAGE_KEYS.DIRECT_APPS, updated);
    setLocal(STORAGE_KEYS.FREE_APP_USED, true);

    return newApp;
  },

  // ── 3. Agency Assistance & Confidential Bidding System ─────────
  getAgencyAssistanceState(user = null) {
    const plan = this.getStudentPlan(user);
    const defaultStored = {
      hasActiveRequest: false,
      requestDetails: null,
      selectedAgency: null,
      assignedAgent: null,
    };
    const stored = getLocal(STORAGE_KEYS.AGENCY_REQUESTS, defaultStored);

    // 1. FREE STARTER — strictly self-service, no agency, no agent
    if (plan === 'free') {
      return {
        isLocked: true,
        plan: 'free',
        reason: 'Agency Assistance is available on Pro Path and Elite Premium.',
        hasActiveRequest: false,
        requestDetails: null,
        selectedAgency: null,
        assignedAgent: null,
        bids: [],
        eligibleAgencies: [],
      };
    }

    // 2. PRO PATH — receives assistance via Admin assignment only; NO marketplace, NO bids
    if (plan === 'pro') {
      return {
        isLocked: false,
        plan: 'pro',
        hasActiveRequest: Boolean(stored.hasActiveRequest),
        requestDetails: stored.requestDetails,
        // Only the agency assigned by Admin is visible
        selectedAgency: stored.selectedAgency,
        assignedAgent: stored.assignedAgent,
        // SECURITY: Bids, bid counts, and competing agencies are 100% confidential
        bids: [],
        eligibleAgencies: [],
      };
    }

    // 3. ELITE PREMIUM — can browse sanitized Agency Directory, choose agency; BIDS STILL CONFIDENTIAL
    const sanitizedDirectory = REGISTERED_AGENCIES.map((a) => ({
      id: a.id,
      name: a.name,
      tagline: a.tagline,
      logo: a.logo,
      country: a.country,
      rating: a.rating,
      reviewsCount: a.reviewsCount,
      successRate: a.successRate,
      studentsPlaced: a.studentsPlaced,
      countriesServed: a.countriesServed,
      services: a.services,
      experienceYears: a.experienceYears,
      agentName: a.agentName,
      agentRole: a.agentRole,
      agentAvatar: a.agentAvatar,
      // bidAmount & bidProposal are completely stripped to preserve confidentiality
    }));

    return {
      isLocked: false,
      plan: 'elite',
      hasActiveRequest: Boolean(stored.hasActiveRequest),
      requestDetails: stored.requestDetails,
      selectedAgency: stored.selectedAgency,
      assignedAgent: stored.assignedAgent,
      eligibleAgencies: sanitizedDirectory,
      // SECURITY: Bids are confidential for ALL student tiers
      bids: [],
    };
  },

  submitAgencyAssistanceRequest(reqData, user = null) {
    const plan = this.getStudentPlan(user);
    if (plan === 'free') {
      throw new Error('Agency Assistance is available on Pro Path and Elite Premium. Please upgrade your subscription.');
    }

    const requestId = `req-${Date.now().toString().slice(-4)}`;
    const requestDetails = {
      id: requestId,
      targetCountry: reqData.targetCountry || 'Global',
      studyLevel: reqData.studyLevel || "Master's",
      targetDiscipline: reqData.targetDiscipline || 'General Studies',
      budgetRange: reqData.budgetRange ? convertTextToDual(reqData.budgetRange) : '৳2,400,000 - ৳4,800,000 / yr ($20,000 - $40,000 / yr)',
      intake: reqData.intake || 'Upcoming Intake',
      notes: reqData.notes || '',
      submittedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      status: plan === 'pro' ? 'under_admin_review' : 'marketplace_open',
    };

    // Store confidential bids for Admin monitoring only (never returned to student)
    const adminBids = REGISTERED_AGENCIES.map((a) => ({
      agencyId: a.id,
      agencyName: a.name,
      bidAmount: a.bidAmount,
      bidProposal: a.bidProposal,
      submittedAt: 'Just now',
      turnaroundDays: a.turnaroundDays,
    }));
    setLocal('admify_admin_agency_bids', adminBids);

    const updatedState = {
      hasActiveRequest: true,
      requestDetails,
      selectedAgency: null,
      assignedAgent: null,
    };
    setLocal(STORAGE_KEYS.AGENCY_REQUESTS, updatedState);

    return this.getAgencyAssistanceState(user);
  },

  // Admin action: reviews confidential bids and assigns an Agency to a Pro student
  adminAssignAgency(agencyId, user = null) {
    const chosen = REGISTERED_AGENCIES.find((a) => a.id === agencyId) || REGISTERED_AGENCIES[0];
    const assignedAgent = {
      name: chosen.agentName,
      role: chosen.agentRole,
      avatar: chosen.agentAvatar,
      agencyName: chosen.name,
      online: true,
      email: `${chosen.agentName.toLowerCase().replace(' ', '.')}@${chosen.id}.admify-partner.com`,
    };

    // Sanitized agency details visible to student
    const sanitizedAgency = {
      id: chosen.id,
      name: chosen.name,
      tagline: chosen.tagline,
      logo: chosen.logo,
      country: chosen.country,
      rating: chosen.rating,
      reviewsCount: chosen.reviewsCount,
      successRate: chosen.successRate,
      studentsPlaced: chosen.studentsPlaced,
      countriesServed: chosen.countriesServed,
      services: chosen.services,
      experienceYears: chosen.experienceYears,
      assignedAgent,
      assignmentType: 'Admin Desk Matching',
      assignedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
    };

    const stored = getLocal(STORAGE_KEYS.AGENCY_REQUESTS, {});
    const updated = {
      ...stored,
      hasActiveRequest: true,
      selectedAgency: sanitizedAgency,
      assignedAgent,
      requestDetails: {
        ...(stored.requestDetails || {
          id: `req-${Date.now().toString().slice(-4)}`,
          targetCountry: 'Global',
          studyLevel: "Master's Degree",
          targetDiscipline: 'Computer Science & AI',
          budgetRange: '৳3,600,000 - ৳6,000,000 / yr ($30,000 - $50,000 / yr)',
          submittedAt: 'Today',
        }),
        status: 'agency_assigned_by_admin',
      },
    };
    setLocal(STORAGE_KEYS.AGENCY_REQUESTS, updated);

    // Sync agency application in user's applications
    const currentApps = getLocal(STORAGE_KEYS.DIRECT_APPS, []);
    const agencyApp = {
      _id: `ag-app-${Date.now()}`,
      id: `ag-app-${Date.now()}`,
      university: `${chosen.name} Portfolio Guidance`,
      program: updated.requestDetails?.targetDiscipline || 'Graduate Studies',
      logo: chosen.logo,
      applicationType: 'agency',
      assignedAgency: chosen.name,
      assignedAgent: chosen.agentName,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      stage: 'In Review',
      progress: 40,
      steps: [
        { label: 'Agency Assistance Requested', date: 'Completed', status: 'completed' },
        { label: 'Agency & Counselor Assigned by Admin', date: 'Today', status: 'completed' },
        { label: 'Application Preparation', date: 'In Progress', status: 'current' },
        { label: 'Submission to University Rep', date: 'Pending', status: 'upcoming' },
        { label: 'University Decision', date: 'Pending', status: 'upcoming' },
      ],
    };
    setLocal(STORAGE_KEYS.DIRECT_APPS, [agencyApp, ...currentApps.filter((a) => a.applicationType !== 'agency')]);

    return this.getAgencyAssistanceState(user);
  },

  // Elite student action: selects agency from the directory
  selectAgencyElite(agencyId, user = null) {
    return this.adminAssignAgency(agencyId, user);
  },

  // ── 4. Universities & Saved / Comparison ────────────────────
  async getUniversities(params = {}) {
    try {
      const qs = new URLSearchParams();
      if (params.search) qs.set('search', params.search);
      if (params.country && params.country !== 'all') qs.set('country', params.country);
      const res = await api.get(`/api/universities?${qs.toString()}`);
      if (res?.data?.universities && res.data.universities.length > 0) {
        return res.data.universities;
      }
    } catch {
      // Fallback to internal database
    }

    // Convert universityDatabase into array
    const list = Object.entries(universityDatabase).map(([slug, data]) => {
      const rawCountry = data.location.split(',').pop().trim();
      const country = rawCountry === 'USA' ? 'United States' : (rawCountry === 'UK' ? 'United Kingdom' : rawCountry);
      const feeInfo = this.getUniversityAppFee(data.name || slug);
      return {
        _id: slug,
        slug,
        name: data.name,
        country,
        location: data.location,
        logo: data.logo,
        coverImage: data.coverImage,
        rank: data.rank,
        acceptanceRate: data.acceptanceRate,
        applicationFee: feeInfo.fee,
        applicationFeeDisplay: feeInfo.feeDisplay,
        isZeroFee: feeInfo.isZeroFee,
        tuition: convertTextToDual(data.costs?.tuition || '$35,000 / year'),
        programs: data.programs || [],
        admissionReqs: data.admissionReqs,
        scholarshipsList: data.scholarshipsList || [],
        applicationDeadline: data.applicationDeadline,
      };
    });

    if (params.search) {
      const q = params.search.toLowerCase();
      return list.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.country.toLowerCase().includes(q) ||
          u.programs.some((p) => p.name.toLowerCase().includes(q))
      );
    }
    if (params.country && params.country !== 'all') {
      const qCountry = params.country.toLowerCase();
      return list.filter((u) => u.country.toLowerCase() === qCountry || u.location.toLowerCase().includes(qCountry));
    }
    return list;
  },

  getSavedUniversities() {
    return getLocal(STORAGE_KEYS.SAVED_UNIS, []);
  },

  toggleSaveUniversity(slug) {
    const saved = this.getSavedUniversities();
    const next = saved.includes(slug) ? saved.filter((s) => s !== slug) : [...saved, slug];
    setLocal(STORAGE_KEYS.SAVED_UNIS, next);
    return next;
  },

  getComparisonList() {
    return getLocal(STORAGE_KEYS.COMPARE_UNIS, []);
  },

  toggleComparison(slug) {
    const list = this.getComparisonList();
    let next;
    if (list.includes(slug)) {
      next = list.filter((s) => s !== slug);
    } else {
      if (list.length >= 4) {
        throw new Error('You can compare a maximum of 4 universities at a time.');
      }
      next = [...list, slug];
    }
    setLocal(STORAGE_KEYS.COMPARE_UNIS, next);
    return next;
  },

  // ── 5. AI Recommendations with Authentic Academic Thresholds ──
  async getAiRecommendations(userOrAssessment = {}) {
    // Free accounts strictly do NOT receive AI recommendations
    if (!this.isPremiumAccount(userOrAssessment)) {
      return [];
    }

    const allUnis = await this.getUniversities();

    const gpaNum = parseFloat(userOrAssessment?.gpa) || 3.7;
    const ieltsNum = parseFloat(userOrAssessment?.ielts) || 7.0;
    const targetDegree = userOrAssessment?.targetDegree || "Master's / Postgraduate";
    const fieldOfStudy = userOrAssessment?.fieldOfStudy || "Computer Science & AI";
    const targetDestinations = Array.isArray(userOrAssessment?.targetDestinations) && userOrAssessment.targetDestinations.length > 0
      ? userOrAssessment.targetDestinations
      : (userOrAssessment?.targetCountry && userOrAssessment.targetCountry !== 'all' ? [userOrAssessment.targetCountry] : []);
    const budget = userOrAssessment?.budget || "standard";

    // Helper to evaluate authentic thresholds per university
    const getUniversityThresholds = (uni) => {
      const slug = uni.slug || '';
      const rankNum = parseInt(String(uni.rank).replace(/[^0-9]/g, '')) || 300;

      // 1. Elite Ivy League / Top 20 (Stanford, MIT, Oxford, Imperial, Cambridge)
      if (
        ['stanford-university', 'massachusetts-institute-of-technology', 'oxford-university', 'imperial-college-london'].includes(slug) ||
        rankNum <= 20
      ) {
        return {
          minGpa: 3.75,
          idealGpa: 3.85,
          minIelts: 7.5,
          tier: 'Elite (Top 20)',
          acceptanceRate: uni.acceptanceRate || '4%',
          hasPathwayFor55: false,
        };
      }

      // 2. High Tier / Selective Top 100 (Toronto, UBC, TUM, Heidelberg, Sorbonne, Amsterdam, Trinity, KTH, Melbourne, Auckland, Tokyo, SNU)
      if (
        [
          'university-of-toronto',
          'university-of-british-columbia',
          'technical-university-of-munich',
          'heidelberg-university',
          'sorbonne-university',
          'university-of-amsterdam',
          'trinity-college-dublin',
          'kth-royal-institute-of-technology',
          'university-of-melbourne',
          'university-of-auckland',
          'university-of-tokyo',
          'seoul-national-university',
        ].includes(slug) ||
        rankNum <= 100
      ) {
        return {
          minGpa: 3.30,
          idealGpa: 3.55,
          minIelts: 6.5,
          tier: 'Selective (Top 100)',
          acceptanceRate: uni.acceptanceRate || '20%',
          hasPathwayFor55: false,
        };
      }

      // 3. Mid-Tier (Rank 101-250) (e.g. Arizona State, Deakin, Helsinki)
      if (['arizona-state-university', 'deakin-university', 'university-of-helsinki'].includes(slug) || rankNum <= 250) {
        return {
          minGpa: 2.75,
          idealGpa: 3.00,
          minIelts: 6.0,
          tier: 'Mid Tier',
          acceptanceRate: uni.acceptanceRate || '75%',
          hasPathwayFor55: true,
        };
      }

      // 4. Accessible & Pathway Friendly (Coventry, Greenwich, UT Arlington, Windsor, Western Sydney, IU)
      return {
        minGpa: 2.50,
        idealGpa: 2.75,
        minIelts: 5.5,
        tier: 'Accessible / Pathway',
        acceptanceRate: uni.acceptanceRate || '78%',
        hasPathwayFor55: true,
      };
    };

    const scoredList = allUnis.map((uni) => {
      const threshold = getUniversityThresholds(uni);

      // ── A. GPA Feasibility (55% weight) ──
      const gpaDiff = gpaNum - threshold.minGpa;
      let gpaScore = 80;

      if (gpaDiff < -0.5) {
        // Severe GPA deficit (e.g. 2.90 vs 3.75 min)
        gpaScore = Math.max(10, Math.round(25 + gpaDiff * 30));
      } else if (gpaDiff < 0) {
        // Slight GPA deficit (e.g. 3.1 vs 3.3 min)
        gpaScore = Math.max(35, Math.round(58 + gpaDiff * 40));
      } else {
        // Meets or exceeds minimum
        gpaScore = Math.min(98, Math.round(82 + gpaDiff * 30));
      }

      // ── B. English Proficiency Feasibility (30% weight) ──
      const ieltsDiff = ieltsNum - threshold.minIelts;
      let englishScore = 85;

      if (ieltsDiff < -1.0) {
        // Extreme language deficit (e.g. 5.5 vs 7.5 min)
        englishScore = 15;
      } else if (ieltsDiff < 0) {
        // Below direct entry (e.g. 5.5 vs 6.0)
        englishScore = threshold.hasPathwayFor55 ? 75 : 40;
      } else {
        // Meets or exceeds requirement
        englishScore = Math.min(98, 88 + ieltsDiff * 10);
      }

      // ── C. Destination & Budget Alignment (15% weight) ──
      const isCountryMatch = targetDestinations.length === 0 || 
        targetDestinations.some(d => d.toLowerCase() === 'all' || d.toLowerCase() === uni.country.toLowerCase());
      const destinationScore = isCountryMatch ? 90 : 50;

      // ── Final Weighted Match Calculation ──
      let finalScore = Math.round(gpaScore * 0.55 + englishScore * 0.30 + destinationScore * 0.15);
      finalScore = Math.max(18, Math.min(98, finalScore));

      // ── Status Classification ──
      let status = 'Target / Ideal Fit';
      if (finalScore >= 88) {
        status = gpaNum >= 3.6 && threshold.minGpa >= 3.5 ? 'Top Tier Match' : 'Target / Ideal Fit';
      } else if (finalScore >= 75) {
        status = 'Safe / High Probability Match';
      } else if (finalScore >= 50) {
        status = 'Reach / Pathway Eligible';
      } else {
        status = 'High Risk / Severe Requirement Gap';
      }

      // ── Authentic, Truthful Reasons ──
      const reasons = [];

      // 1. GPA Rationale
      if (gpaDiff < -0.4) {
        reasons.push(
          `Significant GPA Gap: Your GPA (${gpaNum.toFixed(2)}) is well below the admitted cohort average (${threshold.minGpa.toFixed(2)}+). Highly competitive (${threshold.acceptanceRate} acceptance rate).`
        );
      } else if (gpaDiff < 0) {
        reasons.push(
          `Reach Target: Your GPA (${gpaNum.toFixed(2)}) is slightly below the ${threshold.minGpa.toFixed(2)} baseline. Requires exceptional SOP or research credentials to compensate.`
        );
      } else {
        reasons.push(
          `Direct Entry Qualified: Your GPA (${gpaNum.toFixed(2)}) satisfies the minimum entry requirement (${threshold.minGpa.toFixed(2)}+).`
        );
      }

      // 2. English Language Rationale
      if (ieltsDiff < -1.0) {
        reasons.push(
          `Language Prerequisite Gap: University strictly mandates ${threshold.minIelts}+ IELTS (Current: ${ieltsNum}). Direct entry unavailable without test retake.`
        );
      } else if (ieltsDiff < 0) {
        if (threshold.hasPathwayFor55) {
          reasons.push(
            `Pathway Option: Direct entry requires ${threshold.minIelts} IELTS, but pre-sessional English or pathway entry is available for score ${ieltsNum}.`
          );
        } else {
          reasons.push(
            `Conditional Entry: Current IELTS (${ieltsNum}) is below direct entry standard (${threshold.minIelts}). English test retake recommended.`
          );
        }
      } else {
        reasons.push(
          `Language Requirement Met: Your ${ieltsNum} IELTS fulfills unconditioned direct admission criteria.`
        );
      }

      // Matched program
      let matchedProgram = uni.programs?.find(p => 
        p.name.toLowerCase().includes(fieldOfStudy.toLowerCase().split(' ')[0]) ||
        fieldOfStudy.toLowerCase().includes(p.name.toLowerCase().split(' ')[0])
      )?.name;

      if (!matchedProgram) {
        matchedProgram = `${fieldOfStudy} (${targetDegree.includes("Bachelor") ? "BSc" : "MSc"})`;
      }

      return {
        _id: uni._id,
        slug: uni.slug,
        name: uni.name,
        country: uni.country,
        location: uni.location,
        rank: uni.rank || 'Top Global University',
        match: finalScore,
        prog: matchedProgram,
        status,
        tuition: uni.tuition,
        coverImage: uni.coverImage,
        logo: uni.logo,
        reasons,
      };
    });

    // Sort by match score descending (most realistic matches first)
    scoredList.sort((a, b) => b.match - a.match);

    return scoredList;
  },

  // ── 6. Admission Probability Prediction ────────────────────
  async predictAdmission(factors) {
    try {
      const res = await api.post('/api/ai/predict-admission', factors);
      if (res?.data?.prediction) return res.data.prediction;
    } catch {
      // Fallback logic
    }

    const gpa = parseFloat(factors.gpa) || 3.5;
    const ielts = parseFloat(factors.ielts) || 7.0;
    const rank = parseInt(factors.universityRank, 10) || 50;
    const work = parseInt(factors.workExperienceYears, 10) || 1;

    let probability = Math.round(gpa * 18 + ielts * 3 + Math.min(work * 3, 10) - (rank < 20 ? 15 : 5));
    probability = Math.max(35, Math.min(96, probability));

    return {
      probability,
      status: probability >= 80 ? 'High Probability' : probability >= 60 ? 'Moderate Probability' : 'Reach Target',
      factors: [
        { label: 'Academic Standing (GPA)', status: gpa >= 3.6 ? 'strong' : 'moderate', note: `GPA: ${gpa}` },
        { label: 'English Proficiency', status: ielts >= 7.0 ? 'strong' : 'needs_attention', note: `Score: ${ielts}` },
        { label: 'Program Competitiveness', status: rank <= 30 ? 'moderate' : 'strong', note: `Rank: #${rank}` },
        { label: 'Work Experience', status: work >= 2 ? 'strong' : 'recommended', note: `${work} year(s) listed` },
      ],
      recommendations: [
        'Complement application with strong, tailored SOP detailing quantitative accomplishments',
        'Obtain 2 academic letters of recommendation highlighting research aptitude',
        probability < 75 ? 'Consider retaking IELTS/GRE to push probability past 85%' : 'Profile meets priority scholarship review threshold',
      ],
    };
  },

  // ── 7. Scholarships ─────────────────────────────────────────
  async getScholarships(params = {}) {
    try {
      const qs = new URLSearchParams();
      if (params.search) qs.set('search', params.search);
      if (params.type && params.type !== 'all') qs.set('type', params.type);
      if (params.country && params.country !== 'all') qs.set('country', params.country);
      const res = await api.get(`/api/scholarships?${qs.toString()}`);
      if (res?.data?.scholarships && res.data.scholarships.length > 0) {
        return res.data.scholarships;
      }
    } catch {
      // Fallback
    }

    const list = [
      // 1. United Kingdom
      {
        id: 'sch-uk-1',
        title: 'Chevening Scholarships',
        sponsor: 'UK Foreign, Commonwealth & Development Office (FCDO)',
        amount: 'Full Tuition + ৳2,700,000 / yr (£17,300 / yr) + Flights',
        coverage: '100% Comprehensive Tuition, Flights, Visa & Living Allowance',
        eligibility: 'Minimum 2 years work experience & 2:1 Honours degree (3.3+ GPA)',
        deadline: 'November 5, 2026',
        match: 98,
        type: 'government',
        country: 'United Kingdom',
        status: 'Open for Applications',
        requirements: ['Academic Transcripts', '2 Professional References', 'Leadership & Influence Essays', 'Unconditional UK Offer'],
      },
      {
        id: 'sch-uk-2',
        title: 'Commonwealth Shared Scholarship',
        sponsor: 'Commonwealth Scholarship Commission / UK FCDO',
        amount: 'Full Tuition + ৳2,496,000 / yr (£16,000 / yr) + Airfare',
        coverage: '100% Tuition, Travel & Monthly Maintenance',
        eligibility: 'Citizen of eligible developing Commonwealth nation (including Bangladesh)',
        deadline: 'December 12, 2026',
        match: 95,
        type: 'need',
        country: 'United Kingdom',
        status: 'Upcoming Intake',
        requirements: ['Proof of Nationality', 'Financial Need Statement', 'Academic Transcripts', 'Development Impact Statement'],
      },
      {
        id: 'sch-uk-3',
        title: 'Rhodes Scholarship at Oxford',
        sponsor: 'Rhodes Trust / University of Oxford',
        amount: 'Full Course Fees + ৳2,980,000 / yr (£19,100 / yr) Stipend',
        coverage: '100% University & College Fees, Living Stipend & Health Surcharge',
        eligibility: 'Exceptional intellect, character, leadership & commitment to service (Top 2% GPA)',
        deadline: 'August 1, 2026',
        match: 92,
        type: 'merit',
        country: 'United Kingdom',
        status: 'Open for Applications',
        requirements: ['Undergraduate Degree Certificate', '6 Recommendation Letters', 'Personal Statement', 'Institutional Endorsement'],
      },

      // 2. Canada
      {
        id: 'sch-ca-1',
        title: 'Lester B. Pearson International Scholarship',
        sponsor: 'University of Toronto',
        amount: 'Full Tuition + Books + Full Residence 4 Years (≈ ৳8,880,000+)',
        coverage: '100% Tuition, Incidental Fees, Book Costs & 4-Year Full Residence',
        eligibility: 'Recognized leadership, high academic achievement & school nomination',
        deadline: 'January 15, 2027',
        match: 96,
        type: 'merit',
        country: 'Canada',
        status: 'Open for Applications',
        requirements: ['Official High School Nomination', 'U of T Application', 'Student Application Essay'],
      },
      {
        id: 'sch-ca-2',
        title: 'Vanier Canada Graduate Scholarships',
        sponsor: 'Government of Canada (CIHR, NSERC, SSHRC)',
        amount: '৳6,000,000 / yr ($50,000 / yr) for 3 Years',
        coverage: 'Full Doctoral Research Support & Living Funding',
        eligibility: 'Scholarly achievement in graduate studies & demonstrated leadership potential',
        deadline: 'November 1, 2026',
        match: 93,
        type: 'government',
        country: 'Canada',
        status: 'Open for Applications',
        requirements: ['Canadian Institution Nomination', 'Research Proposal', 'Leadership Reference Letters'],
      },

      // 3. United States
      {
        id: 'sch-us-1',
        title: 'Fulbright Foreign Student Program',
        sponsor: 'U.S. Department of State / ECA',
        amount: 'Full Tuition + ৳3,600,000 / yr ($30,000 / yr) Stipend + Airfare',
        coverage: 'Complete Tuition, Living Stipend, Health Benefit Plan & Return Airfare',
        eligibility: 'Undergraduate degree with superior academic records, minimum 2 years experience',
        deadline: 'June 1, 2026',
        match: 97,
        type: 'government',
        country: 'United States',
        status: 'Open for Applications',
        requirements: ['University Transcripts', 'GRE/TOEFL Scores', 'Study/Research Objectives Essay', '3 Letters of Reference'],
      },
      {
        id: 'sch-us-2',
        title: 'Knight-Hennessy Scholars Program',
        sponsor: 'Stanford University',
        amount: 'Full Tuition + ৳5,400,000 / yr ($45,000 / yr) Stipend',
        coverage: '100% Tuition, Room, Board & Travel across any Stanford graduate degree',
        eligibility: 'Graduated within 7 years, independent thought, purposeful leadership',
        deadline: 'October 11, 2026',
        match: 94,
        type: 'merit',
        country: 'United States',
        status: 'Open for Applications',
        requirements: ['Concurrent Stanford Degree Application', 'Two Recommendation Letters', 'Video Statement', 'Resume'],
      },

      // 4. Germany
      {
        id: 'sch-de-1',
        title: 'DAAD Helmut-Schmidt European Masters Grant',
        sponsor: 'Federal Foreign Office of Germany (DAAD)',
        amount: 'Full Tuition + ৳1,457,000 / yr (€934 / mo) Allowance + Health',
        coverage: 'Complete Tuition Exemption, Monthly Allowance, Travel Subsidy & Health Insurance',
        eligibility: 'Bachelor graduates in political science, law, economics, or computer science',
        deadline: 'July 31, 2026',
        match: 95,
        type: 'government',
        country: 'Germany',
        status: 'Open for Applications',
        requirements: ['DAAD Application Form', 'Hand-signed Motivation Letter', 'Degree Certificates', 'Academic CV'],
      },
      {
        id: 'sch-de-2',
        title: 'Deutschlandstipendium National Merit Grant',
        sponsor: 'German Federal Government & Corporate Partners',
        amount: '৳468,000 / yr (€300 / mo) Cash Grant',
        coverage: 'Direct Monthly Financial Contribution without Social Means Test',
        eligibility: 'Outstanding academic record and active civil or community engagement',
        deadline: 'August 30, 2026',
        match: 90,
        type: 'merit',
        country: 'Germany',
        status: 'Open for Applications',
        requirements: ['Enrollment Verification at German Institution', 'Transcript of Records', 'Letter of Motivation'],
      },

      // 5. France
      {
        id: 'sch-fr-1',
        title: 'Eiffel Excellence Scholarship Program',
        sponsor: 'French Ministry for Europe and Foreign Affairs',
        amount: 'Full Tuition + ৳1,840,000 / yr (€1,181 / mo) + Flights',
        coverage: 'Monthly Living Allowance, International Return Flights, Cultural Activities & Health',
        eligibility: 'Foreign nationality applicants under 25 for Master or under 30 for PhD',
        deadline: 'January 10, 2027',
        match: 96,
        type: 'government',
        country: 'France',
        status: 'Open for Applications',
        requirements: ['Institutional Submission by French University', 'Academic Transcripts', 'Study Project Proposal', 'Language Certificate'],
      },
      {
        id: 'sch-fr-2',
        title: 'Émile Boutmy Scholarship',
        sponsor: 'Sciences Po Paris Foundation',
        amount: 'Up to ৳2,296,000 / yr (€14,720 / yr) Tuition Fee Grant',
        coverage: 'Tuition Fee Waiver for Full Duration of Studies',
        eligibility: 'Non-EU student admitted to undergraduate or master’s program based on merit and profile',
        deadline: 'December 1, 2026',
        match: 91,
        type: 'merit',
        country: 'France',
        status: 'Open for Applications',
        requirements: ['Admissions Dossier', 'Proof of Financial Income', 'Language Proficiency (English/French)'],
      },

      // 6. Netherlands
      {
        id: 'sch-nl-1',
        title: 'NL Scholarship (Holland Scholarship)',
        sponsor: 'Dutch Ministry of Education, Culture & Science',
        amount: '৳650,000 - ৳1,950,000 (€5,000 - €15,000) Entrance Grant',
        coverage: 'Direct Contribution towards Non-EU Tuition Fees for Year 1',
        eligibility: 'Citizen of non-EEA country applying for full-time degree at participating Dutch university',
        deadline: 'May 1, 2026',
        match: 94,
        type: 'government',
        country: 'Netherlands',
        status: 'Open for Applications',
        requirements: ['Unconditional University Offer', 'Letter of Motivation', 'High School or Bachelor Transcripts'],
      },
      {
        id: 'sch-nl-2',
        title: 'TU Delft Justus & Louise van Effen Excellence Award',
        sponsor: 'Delft University of Technology Foundation',
        amount: '100% Tuition Fees (€20,500/yr) + ৳1,755,000 / yr (€13,500 / yr) Living',
        coverage: 'Full 2-Year MSc Tuition, Living Expenses & Membership in Scholarship Club',
        eligibility: 'Cumulative GPA 80%+ (3.8+ GPA) at internationally renowned university',
        deadline: 'December 1, 2026',
        match: 92,
        type: 'merit',
        country: 'Netherlands',
        status: 'Open for Applications',
        requirements: ['TU Delft MSc Application', 'Two Reference Letters', 'GRE Scores if required', 'Detailed CV'],
      },

      // 7. Ireland
      {
        id: 'sch-ie-1',
        title: 'Government of Ireland International Education (GOI-IES)',
        sponsor: 'Higher Education Authority (HEA) / Government of Ireland',
        amount: '100% Tuition Fee Waiver + ৳1,300,000 (€10,000) Living Stipend',
        coverage: 'Full Tuition Fee Waiver & Direct Cash Stipend for One Year Study in Ireland',
        eligibility: 'Non-EU/EEA candidates showing exceptional academic record and future leadership',
        deadline: 'March 13, 2026',
        match: 95,
        type: 'government',
        country: 'Ireland',
        status: 'Open for Applications',
        requirements: ['Offer from Irish Higher Education Institution', 'Academic References', 'Personal Statement', 'Transcript'],
      },
      {
        id: 'sch-ie-2',
        title: 'Trinity Global Excellence Postgraduate Award',
        sponsor: 'Trinity College Dublin',
        amount: 'Up to ৳650,000 (€5,000) Tuition Fee Deduction',
        coverage: 'Direct Tuition Fee Credit for First Year of Postgraduate Studies',
        eligibility: 'Holder of non-EU offer letter with academic achievements',
        deadline: 'March 31, 2026',
        match: 91,
        type: 'merit',
        country: 'Ireland',
        status: 'Open for Applications',
        requirements: ['TCD Offer Letter', '200-word Statement of Purpose', 'CV'],
      },

      // 8. Sweden
      {
        id: 'sch-se-1',
        title: 'Swedish Institute Scholarships for Global Professionals (SISGP)',
        sponsor: 'Swedish Institute / Ministry for Foreign Affairs',
        amount: '100% Tuition Fees + ৳1,843,200 / yr (SEK 12,000 / mo) + Travel',
        coverage: 'Full Tuition directly to University, Monthly Living Stipend, Travel Grant, Insurance',
        eligibility: 'Minimum 3,000 hours demonstrated work and leadership experience',
        deadline: 'February 28, 2026',
        match: 97,
        type: 'government',
        country: 'Sweden',
        status: 'Open for Applications',
        requirements: ['Universityadmissions.se Application', 'Proof of Work Experience', 'Proof of Leadership', '2 Reference Letters'],
      },
      {
        id: 'sch-se-2',
        title: 'KTH Royal Institute Global Scholarship',
        sponsor: 'KTH Royal Institute of Technology Stockholm',
        amount: '100% Tuition Fee Waiver for 2 Years',
        coverage: 'Full 2-Year MSc Tuition Coverage',
        eligibility: 'Top academic standing among first-choice KTH Master’s applicants',
        deadline: 'January 15, 2026',
        match: 93,
        type: 'merit',
        country: 'Sweden',
        status: 'Open for Applications',
        requirements: ['KTH Program Application', 'Motivation Essay', 'Academic Records'],
      },

      // 9. Finland
      {
        id: 'sch-fi-1',
        title: 'Finland Scholarship',
        sponsor: 'Finnish Ministry of Education and Culture / EDUFI',
        amount: '100% Tuition Fee Waiver + ৳650,000 (€5,000) Relocation Grant',
        coverage: 'Full Tuition Waiver for Year 1 & 2 + First Year Relocation Grant',
        eligibility: 'Exceptional international non-EU master’s applicants',
        deadline: 'January 17, 2026',
        match: 94,
        type: 'government',
        country: 'Finland',
        status: 'Open for Applications',
        requirements: ['Studyinfo.fi Application', 'Bachelor Degree Certificate', 'Transcript of Records'],
      },
      {
        id: 'sch-fi-2',
        title: 'Aalto University International Scholarship',
        sponsor: 'Aalto University',
        amount: '100% Full Tuition Waiver for 2-Year Master’s',
        coverage: 'Full Tuition Fee Coverage for Non-EU Students',
        eligibility: 'Top 5% admitted students ranked by academic evaluation',
        deadline: 'January 10, 2026',
        match: 92,
        type: 'merit',
        country: 'Finland',
        status: 'Open for Applications',
        requirements: ['Aalto Application', 'Academic Transcripts', 'Portfolio (Design / Architecture)'],
      },

      // 10. Norway
      {
        id: 'sch-no-1',
        title: 'HK-dir International Higher Education Grant',
        sponsor: 'Norwegian Directorate for Higher Education and Skills',
        amount: 'Full Tuition Fee Relief + ৳1,620,000 / yr (NOK 144,000 / yr) Allowance',
        coverage: 'Tuition Exemption & Monthly Living Grant',
        eligibility: 'Non-EU students demonstrating strong academic records in STEM and Sustainability',
        deadline: 'December 1, 2026',
        match: 93,
        type: 'government',
        country: 'Norway',
        status: 'Open for Applications',
        requirements: ['UiO / NTNU Admission', 'Statement of Purpose', 'Academic Transcripts'],
      },
      {
        id: 'sch-no-2',
        title: 'NORHED II International Fellowship',
        sponsor: 'Norwegian Agency for Development Cooperation (NORAD)',
        amount: '100% Tuition, Research Allowance, Living Costs & Travel',
        coverage: 'Comprehensive Doctoral and Master’s Fellowship',
        eligibility: 'Students from developing partner countries admitted to Norwegian partner institutions',
        deadline: 'October 30, 2026',
        match: 90,
        type: 'need',
        country: 'Norway',
        status: 'Upcoming Intake',
        requirements: ['Partner Institution Endorsement', 'Research Proposal', 'Official Transcripts'],
      },

      // 11. Denmark
      {
        id: 'sch-dk-1',
        title: 'Danish Government State Scholarship',
        sponsor: 'Danish Ministry of Higher Education and Science',
        amount: '100% Tuition Fee Waiver + ৳1,440,000 / yr (DKK 7,000 / mo) Living Allowance',
        coverage: 'Full or Partial Tuition Waiver & Monthly Living Contribution',
        eligibility: 'Enrolled in full-degree master’s program from outside EU/EEA with high GPA',
        deadline: 'January 15, 2026',
        match: 94,
        type: 'government',
        country: 'Denmark',
        status: 'Open for Applications',
        requirements: ['University of Copenhagen / DTU Application', 'Academic Transcripts', 'Curriculum Vitae'],
      },
      {
        id: 'sch-dk-2',
        title: 'DTU Excellence Fellowship',
        sponsor: 'Technical University of Denmark (DTU)',
        amount: 'Full Tuition Fee Waiver for 2 Years',
        coverage: 'Complete Graduate Course Tuition Offset',
        eligibility: 'Outstanding academic records in engineering and technical sciences',
        deadline: 'January 15, 2026',
        match: 91,
        type: 'merit',
        country: 'Denmark',
        status: 'Open for Applications',
        requirements: ['DTU MSc Application', 'Bachelor Degree Records', 'Motivation Letter'],
      },

      // 12. Switzerland
      {
        id: 'sch-ch-1',
        title: 'Swiss Government Excellence Scholarships (ESKAS)',
        sponsor: 'Federal Commission for Scholarships for Foreign Students (FCS)',
        amount: '100% Tuition + ৳3,120,000 / yr (CHF 1,920 / mo) + Insurance + Airfare',
        coverage: 'Monthly stipend, tuition exemption, mandatory Swiss health insurance, return flight',
        eligibility: 'Postgraduate researchers, doctoral or post-doctoral candidates with research proposal',
        deadline: 'November 15, 2026',
        match: 96,
        type: 'government',
        country: 'Switzerland',
        status: 'Open for Applications',
        requirements: ['Swiss Embassy Application Package', 'Research Proposal', 'Acceptance from Swiss Professor', '2 Confidential References'],
      },
      {
        id: 'sch-ch-2',
        title: 'ETH Zurich Excellence Scholarship (ESOP)',
        sponsor: 'ETH Zurich Foundation',
        amount: 'Full Living Costs: ৳3,250,000 / yr (CHF 24,000 / yr) + 100% Tuition Waiver',
        coverage: 'Complete Study and Living Grant + Individual Faculty Mentorship',
        eligibility: 'Top 10% of Bachelor’s degree cohort (Grade A equivalent)',
        deadline: 'December 15, 2026',
        match: 95,
        type: 'merit',
        country: 'Switzerland',
        status: 'Open for Applications',
        requirements: ['ETH Master Application', 'Pre-proposal for Master’s Thesis', 'Two Academic References'],
      },

      // 13. Italy
      {
        id: 'sch-it-1',
        title: 'Invest Your Talent in Italy (IYT)',
        sponsor: 'Italian Ministry of Foreign Affairs & Italian Trade Agency (ICE)',
        amount: '100% Tuition Fee Exemption + ৳1,404,000 / yr (€1,000 / mo) + Corporate Internship',
        coverage: 'Full Tuition Exemption, Monthly Cash Allowance & Guaranteed 3-Month Paid Corporate Internship',
        eligibility: 'Bachelor’s in Engineering, Advanced Tech, Architecture, or Management',
        deadline: 'March 1, 2026',
        match: 95,
        type: 'government',
        country: 'Italy',
        status: 'Open for Applications',
        requirements: ['Universitaly Application', 'Degree Transcript', 'Video Presentation (1 minute)', 'English Certificate'],
      },
      {
        id: 'sch-it-2',
        title: 'DSU Regional Right to University Education Grant',
        sponsor: 'Regional Governments of Italy (Lazio / Tuscany / Lombardy)',
        amount: 'Free Tuition + Free University Canteen Meals + Up to ৳936,000 (€7,200 / yr) Cash',
        coverage: 'Zero Tuition, Free Accommodation / Meals, Annual Cash Payment for Living Costs',
        eligibility: 'Family ISEE / Equivalent Economic Indicator below €25,000 (Highly accessible for Bangladeshi students)',
        deadline: 'September 5, 2026',
        match: 98,
        type: 'need',
        country: 'Italy',
        status: 'Open for Applications',
        requirements: ['Income & Property Certificates Translated & Legalized', 'ISEE Parificato', 'Enrollment Proof'],
      },

      // 14. Spain
      {
        id: 'sch-es-1',
        title: 'Fundación Carolina International Fellowship',
        sponsor: 'Fundación Carolina / Spanish Ministry of Foreign Affairs',
        amount: '100% Tuition Fees + ৳1,170,000 / yr (€750 / mo) + Flights + Medical',
        coverage: 'Tuition, Flight Tickets, Monthly Living Allowance, Legalization Assistance',
        eligibility: 'Demonstrated academic merit and commitment to return to country of origin',
        deadline: 'March 14, 2026',
        match: 95,
        type: 'government',
        country: 'Spain',
        status: 'Open for Applications',
        requirements: ['Online Application Form', 'Academic Curriculum Vitae', 'Official Transcripts'],
      },
      {
        id: 'sch-es-2',
        title: 'AECID Spanish Cooperation Scholarship',
        sponsor: 'Agencia Española de Cooperación Internacional para el Desarrollo',
        amount: 'Full Tuition + €900 / mo Living Subsidy',
        coverage: 'Academic Grant for Postgraduate Studies in Spain',
        eligibility: 'High-achieving international graduates in priority development fields',
        deadline: 'April 20, 2026',
        match: 92,
        type: 'government',
        country: 'Spain',
        status: 'Open for Applications',
        requirements: ['AECID Sede Electrónica Submission', 'Degree Certificates', 'Motivation Statement'],
      },

      // 15. Belgium
      {
        id: 'sch-be-1',
        title: 'Master Mind Scholarship',
        sponsor: 'Government of Flanders / Department of Education & Training',
        amount: '৳1,300,000 / yr (€10,000 / yr) Grant + Tuition reduced to €131 / yr',
        coverage: '€10,000 grant per academic year + 95% Tuition Fee Waiver at Flemish Universities',
        eligibility: 'Outstanding academic performance with GPA 3.5/4.0 and English proficiency C1',
        deadline: 'March 1, 2026',
        match: 96,
        type: 'government',
        country: 'Belgium',
        status: 'Open for Applications',
        requirements: ['Nomination by KU Leuven / Ghent', 'Academic Transcripts', 'Motivational Letter', '2 Recommendation Letters'],
      },
      {
        id: 'sch-be-2',
        title: 'Science@Leuven Scholarship',
        sponsor: 'KU Leuven Faculty of Science',
        amount: 'Up to ৳1,560,000 / yr (€12,000 / yr) + Full Tuition Waiver + Health Insurance',
        coverage: 'Full Year 1 and Year 2 Master’s Science Studies Coverage',
        eligibility: 'High-ranking international students admitted to KU Leuven Master of Science',
        deadline: 'February 15, 2026',
        match: 93,
        type: 'merit',
        country: 'Belgium',
        status: 'Open for Applications',
        requirements: ['KU Leuven Application', 'Cover Letter explaining interest in Faculty of Science', 'Two Recommendation Letters'],
      },

      // 16. Austria
      {
        id: 'sch-at-1',
        title: 'Ernst Mach Grant for Studying in Austria',
        sponsor: 'Austrian Agency for Education and Internationalisation (OeAD)',
        amount: 'Full Tuition + ৳1,638,000 / yr (€1,050 / mo) + ৳156,000 Travel Grant',
        coverage: 'Monthly Grant, Exemption from Austrian University Tuition, Travel Subsidy',
        eligibility: 'Graduate students and young researchers from non-European countries',
        deadline: 'February 1, 2026',
        match: 95,
        type: 'government',
        country: 'Austria',
        status: 'Open for Applications',
        requirements: ['OeAD Portal Submission', 'Written Consent of Supervisor at Austrian University', 'Two Letters of Recommendation'],
      },
      {
        id: 'sch-at-2',
        title: 'Franz Werfel Fellowship',
        sponsor: 'Austrian Federal Ministry of Education, Science and Research (BMBWF)',
        amount: '৳1,794,000 / yr (€1,150 / mo) + Accommodation & Health Insurance',
        coverage: 'Fellowship for Researchers and Postgraduates in Austria',
        eligibility: 'High scholastic records and approved research proposal',
        deadline: 'March 1, 2026',
        match: 91,
        type: 'merit',
        country: 'Austria',
        status: 'Open for Applications',
        requirements: ['List of Publications', 'Doctoral/Postgraduate Proposal', 'Supervising Professor Recommendation'],
      },

      // 17. Japan
      {
        id: 'sch-jp-1',
        title: 'MEXT Japanese Government Scholarship (Monbukagakusho)',
        sponsor: 'Ministry of Education, Culture, Sports, Science and Technology (MEXT)',
        amount: '100% Tuition Fees + ৳1,440,000 / yr (¥144,000 / mo) + Return Airfare',
        coverage: 'Complete Tuition, Admission Fee, Round-trip International Flights, Monthly Stipend',
        eligibility: 'Undergraduate degree, under 35 years of age, passing embassy screening examination',
        deadline: 'May 15, 2026',
        match: 98,
        type: 'government',
        country: 'Japan',
        status: 'Open for Applications',
        requirements: ['Japanese Embassy Application Form', 'Field of Study and Research Program Plan', 'Academic Transcripts', 'Medical Certificate'],
      },
      {
        id: 'sch-jp-2',
        title: 'JASSO Student Exchange Support Honors Scholarship',
        sponsor: 'Japan Student Services Organization (JASSO)',
        amount: '৳576,000 / yr (¥48,000 / mo) Monthly Support',
        coverage: 'Direct living stipend for international students admitted to Japanese universities',
        eligibility: 'Excellent academic record (GPA 2.3+ on Japanese 3.0 scale)',
        deadline: 'Rolling / University Nomination',
        match: 92,
        type: 'merit',
        country: 'Japan',
        status: 'Open for Applications',
        requirements: ['University Recommendation', 'Study Plan', 'Proof of Financial Self-support'],
      },

      // 18. South Korea
      {
        id: 'sch-kr-1',
        title: 'Global Korea Scholarship (GKS / KGSP)',
        sponsor: 'National Institute for International Education (NIIED) / Ministry of Education',
        amount: '100% Tuition + ৳1,080,000 / yr (₩1,000,000 / mo) + Airfare + Settlement Allowance',
        coverage: 'Full Degree Tuition, Round-trip Airfare, 1-Year Korean Language Training, Medical Insurance',
        eligibility: 'Cumulative GPA 80%+ or top 20% in previous institution, under 40 years old',
        deadline: 'March 15, 2026',
        match: 97,
        type: 'government',
        country: 'South Korea',
        status: 'Open for Applications',
        requirements: ['GKS Application Form', 'Personal Statement & Statement of Purpose', 'Two Recommendation Letters', 'Medical Form'],
      },
      {
        id: 'sch-kr-2',
        title: 'KAIST International Student Presidential Scholarship',
        sponsor: 'KAIST (Korea Advanced Institute of Science & Technology)',
        amount: '100% Tuition Fee Waiver + ₩350,000 / mo Stipend + National Health Insurance',
        coverage: 'Complete Tuition & Monthly Maintenance for duration of degree',
        eligibility: 'Admitted international student meeting full academic requirements',
        deadline: 'September 20, 2026',
        match: 94,
        type: 'merit',
        country: 'South Korea',
        status: 'Open for Applications',
        requirements: ['KAIST Online Application', 'Official Academic Transcripts', 'Recommendation Letters from 2 Academic Mentors'],
      },

      // 19. Australia
      {
        id: 'sch-au-1',
        title: 'Australia Awards Scholarships',
        sponsor: 'Department of Foreign Affairs and Trade (DFAT) / Australian Government',
        amount: '100% Tuition Fees + ৳3,800,000 / yr (AUD $47,500 / yr) + Return Airfare + OSHC',
        coverage: 'Full Tuition, Living Allowance, Establishment Allowance, Return Airfare, OSHC Insurance',
        eligibility: 'Citizen of eligible Indo-Pacific nation (Bangladesh priority), 2+ years work experience',
        deadline: 'April 30, 2026',
        match: 98,
        type: 'government',
        country: 'Australia',
        status: 'Open for Applications',
        requirements: ['OASIS Online Application', 'Curriculum Vitae', 'Development Impact Plan', 'Certified Transcripts & Degrees'],
      },
      {
        id: 'sch-au-2',
        title: 'Melbourne Research Scholarship',
        sponsor: 'The University of Melbourne',
        amount: 'Full Fee Offset + ৳2,960,000 / yr (AUD $37,000 / yr) Living Stipend + Relocation Grant',
        coverage: '100% Tuition Exemption, Living Allowance for 2 to 3.5 years, Relocation Allowance',
        eligibility: 'Applied for graduate research (MPhil / PhD) at Melbourne with strong research proposal',
        deadline: 'October 31, 2026',
        match: 93,
        type: 'merit',
        country: 'Australia',
        status: 'Open for Applications',
        requirements: ['Graduate Research Candidature Application', 'Research Proposal', 'Referees Reports'],
      },

      // 20. New Zealand
      {
        id: 'sch-nz-1',
        title: 'Manaaki New Zealand Scholarships',
        sponsor: 'Ministry of Foreign Affairs and Trade (MFAT) / New Zealand Government',
        amount: '100% Tuition Fees + ৳2,700,000 / yr (NZ$531 / wk) + Establishment Grant + Medical + Travel',
        coverage: 'Full Tuition, Living Allowance, Establishment Grant, Medical Insurance, Return Airfare',
        eligibility: 'Citizen of eligible partner country, commitment to contribute to home country development',
        deadline: 'February 28, 2026',
        match: 97,
        type: 'government',
        country: 'New Zealand',
        status: 'Open for Applications',
        requirements: ['Manaaki Online Portal Application', 'Work and Leadership Experience', 'Academic Transcripts'],
      },
      {
        id: 'sch-nz-2',
        title: 'University of Auckland International Student Excellence',
        sponsor: 'The University of Auckland',
        amount: 'Up to ৳800,000 (NZ$10,000) Towards Compulsory Tuition Fees',
        coverage: 'Direct Tuition Credit for First Year of Study',
        eligibility: 'International fee-paying student with unconditional offer and high GPA',
        deadline: 'November 21, 2026',
        match: 92,
        type: 'merit',
        country: 'New Zealand',
        status: 'Open for Applications',
        requirements: ['UoA Student Application', '500-word Personal Statement', 'Academic Transcripts'],
      },
    ];

    let filtered = list;

    if (params.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.sponsor.toLowerCase().includes(q) ||
          s.country.toLowerCase().includes(q)
      );
    }
    if (params.type && params.type !== 'all') {
      filtered = filtered.filter((s) => s.type === params.type);
    }
    if (params.country && params.country !== 'all') {
      const targetCountry = params.country.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.country.toLowerCase().includes(targetCountry) ||
          targetCountry.includes(s.country.toLowerCase())
      );
    }
    return filtered;
  },

  // ── 8. AI SOP & LOR Generation ─────────────────────────────
  async generateSop(input) {
    try {
      const res = await api.post('/api/ai/generate-sop', input);
      if (res?.data?.document) return res.data.document;
    } catch {
      // Fallback generator
    }

    const { university = 'Target University', course = 'Selected Program', fullName = 'Student Applicant', experience = 'academic research and practical projects', careerGoals = 'lead impactful innovations in my field' } = input;

    return `STATEMENT OF PURPOSE

Applicant: ${fullName}
Target Institution: ${university}
Intended Program: ${course}

1. INTRODUCTION & ACADEMIC PASSION
My decision to pursue advanced studies in ${course} at ${university} represents a natural culmination of my intellectual trajectory. Having cultivated a rigorous foundation in quantitative methodology and systems analysis, I have consistently sought opportunities to leverage computational frameworks to address complex global challenges. ${university}'s esteemed reputation for pioneering research and interdisciplinary collaboration makes it the ideal environment to propel my academic ambitions.

2. ACADEMIC FOUNDATION & TECHNICAL EXPERTISE
Throughout my undergraduate training, I maintained a steadfast commitment to academic excellence. Engaging deeply with challenging coursework, I developed profound competencies in theoretical models and empirical problem solving. My hands-on exposure through ${experience} allowed me to synthesize abstract paradigms into tangible technical solutions. These experiences honed my capacity for analytical problem-solving and solidified my readiness for rigorous graduate-level scholarship.

3. RESEARCH OBJECTIVES & UNIVERSITY ALIGNMENT
The distinctive curriculum at ${university} uniquely bridges theoretical depth with scalable real-world application. I am particularly eager to collaborate with distinguished faculty members whose groundbreaking contributions directly inspire my prospective inquiry. The university's state-of-the-art research facilities, vibrant international cohort, and rich collaborative culture provide the precise ecosystem necessary to advance my proposed investigations.

4. LONG-TERM CAREER GOALS
Following the completion of ${course}, my primary objective is to ${careerGoals}. I intend to bridge the gap between pioneering research and industrial implementation, fostering solutions that deliver measurable global benefit.

5. CONCLUSION
I am eager to contribute my technical acumen, cross-cultural perspective, and diligent work ethic to the vibrant academic community at ${university}. Thank you for your time and thoughtful consideration of my application.`;
  },

  async generateLor(input) {
    try {
      const res = await api.post('/api/ai/generate-lor', input);
      if (res?.data?.document) return res.data.document;
    } catch {
      // Fallback generator
    }

    const {
      studentName = 'Alex Doe',
      university = 'Target University',
      course = 'Selected Program',
      recommenderName = 'Prof. Dr. Robert Vance',
      recommenderTitle = 'Senior Professor',
      relationship = 'academic instructor and research supervisor for 2 years',
      achievements = 'graduating in the top 5% of their class',
    } = input;

    return `CONFIDENTIAL LETTER OF RECOMMENDATION

To the Graduate Admissions Committee,
${university}

Subject: Recommendation for ${studentName} — ${course}

It is my distinct privilege to write this letter of recommendation on behalf of ${studentName}, who is applying for admission to the ${course} program at ${university}. As ${recommenderTitle} with over a decade of experience supervising aspiring scholars, I have had the pleasure of mentoring ${studentName} as their ${relationship}.

From our very first interactions, ${studentName} stood out for their exceptional intellectual curiosity and meticulous approach to scholarly work. In my advanced seminars, they routinely demonstrated an extraordinary capacity to dissect complex literature, synthesize disparate theories, and construct innovative hypotheses. Notably, their performance culminated in ${achievements}, a testament to their dedication and technical proficiency.

Beyond technical aptitude, ${studentName} demonstrates rare interpersonal maturity and leadership. During collaborative laboratory initiatives, they naturally assumed responsibility for coordinating project milestones, ensuring methodological rigor, and mentoring junior peers. Their integrity, open-mindedness, and receptive attitude to feedback make them an invaluable addition to any high-performing research group.

${university} is renowned for cultivating visionary problem solvers, and I am entirely confident that ${studentName} possesses both the intellectual capability and resilience required to excel in your demanding program. I recommend them with the utmost enthusiasm and without reservation.

Sincerely,

${recommenderName}
${recommenderTitle}`;
  },

  // ── 9. Documents Vault ──────────────────────────────────────
  getDocuments() {
    return getLocal(STORAGE_KEYS.DOCUMENTS, []);
  },

  addDocument(doc) {
    const list = this.getDocuments();
    const newDoc = {
      id: `doc-${Date.now()}`,
      title: doc.title,
      category: doc.category || 'General',
      size: doc.size || '1.5 MB',
      uploadedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      status: 'Pending Review',
      usedInApps: [],
    };
    const updated = [newDoc, ...list];
    setLocal(STORAGE_KEYS.DOCUMENTS, updated);
    return updated;
  },

  deleteDocument(id) {
    const list = this.getDocuments();
    const updated = list.filter((d) => d.id !== id);
    setLocal(STORAGE_KEYS.DOCUMENTS, updated);
    return updated;
  },

  // ── 10. Reports & Complaints ────────────────────────────────
  getReports() {
    return getLocal(STORAGE_KEYS.REPORTS, []);
  },

  submitReport(reportData) {
    const list = this.getReports();
    const newReport = {
      id: `rep-${Date.now().toString().slice(-4)}`,
      targetType: reportData.targetType,
      targetName: reportData.targetName,
      reason: reportData.reason,
      description: reportData.description,
      status: 'Submitted',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      resolutionNote: 'Under initial review by Admify Trust & Safety Committee.',
    };
    const updated = [newReport, ...list];
    setLocal(STORAGE_KEYS.REPORTS, updated);
    return updated;
  },

  // ── 11. Clear All Student Mock Data Utility ─────────────────
  clearAllData() {
    Object.values(STORAGE_KEYS).forEach((k) => {
      try {
        localStorage.removeItem(k);
      } catch (err) {
        console.warn('Failed to clear key', k, err);
      }
    });
    return true;
  },
};

export default studentService;
