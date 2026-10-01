import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, '../data/local_dev_db.json');
const UNIVERSITIES_FILE = path.join(__dirname, '../data/universities.json');
const SCHOLARSHIPS_FILE = path.join(__dirname, '../data/scholarships.json');

const DEFAULT_COUNTRIES = [
  {
    _id: '674e1a0b1234567890cc0001',
    name: 'United States',
    code: 'US',
    flag: '🇺🇸',
    region: 'North America',
    currency: 'USD',
    avgTuition: '$25,000 - $55,000 / year',
    avgLivingCost: '$1,200 - $2,200 / month',
    visaInfo: 'F-1 Student Visa with OPT extension for STEM graduates.',
    englishRequirements: 'TOEFL 80+ / IELTS 6.5+ / Duolingo 110+',
    studyLevels: ['Undergraduate', 'Postgraduate', 'PhD'],
    popularPrograms: ['Computer Science', 'Business Administration', 'Data Science', 'Electrical Engineering'],
    description: 'Home to Ivy League and top global research institutions with world-leading campus resources.',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '674e1a0b1234567890cc0002',
    name: 'United Kingdom',
    code: 'GB',
    flag: '🇬🇧',
    region: 'Europe',
    currency: 'GBP',
    avgTuition: '£16,000 - £35,000 / year',
    avgLivingCost: '£1,000 - £1,800 / month',
    visaInfo: 'Student Visa (formerly Tier 4) with 2-year Graduate Immigration Route.',
    englishRequirements: 'IELTS 6.0 - 7.0 / PTE 59+',
    studyLevels: ['Undergraduate', '1-Year Master', 'PhD'],
    popularPrograms: ['Finance', 'International Law', 'Artificial Intelligence', 'Management'],
    description: 'Renowned for prestigious universities, short 1-year master courses, and cultural heritage.',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '674e1a0b1234567890cc0003',
    name: 'Canada',
    code: 'CA',
    flag: '🇨🇦',
    region: 'North America',
    currency: 'CAD',
    avgTuition: 'CAD 20,000 - 45,000 / year',
    avgLivingCost: 'CAD 1,100 - 1,800 / month',
    visaInfo: 'Study Permit with up to 3-year Post-Graduation Work Permit (PGWP).',
    englishRequirements: 'IELTS 6.5+ (no band < 6.0)',
    studyLevels: ['Diploma', 'Bachelor', 'Master', 'PhD'],
    popularPrograms: ['Information Technology', 'Biotechnology', 'Hospitality', 'Engineering'],
    description: 'Welcoming immigration pathways, high standard of living, and diverse multicultural campuses.',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '674e1a0b1234567890cc0004',
    name: 'Australia',
    code: 'AU',
    flag: '🇦🇺',
    region: 'Oceania',
    currency: 'AUD',
    avgTuition: 'AUD 24,000 - 48,000 / year',
    avgLivingCost: 'AUD 1,400 - 2,200 / month',
    visaInfo: 'Subclass 500 Student Visa with post-study work rights (485 visa).',
    englishRequirements: 'IELTS 6.5+ / PTE 58+',
    studyLevels: ['Vocational / VET', 'Bachelor', 'Master', 'Research'],
    popularPrograms: ['Cybersecurity', 'Nursing', 'Accounting', 'Civil Engineering'],
    description: 'World-class Group of Eight institutions, exceptional quality of life, and vibrant cities.',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '674e1a0b1234567890cc0005',
    name: 'Germany',
    code: 'DE',
    flag: '🇩🇪',
    region: 'Europe',
    currency: 'EUR',
    avgTuition: '€0 - €3,000 / year (Nominal admin fees at public unis)',
    avgLivingCost: '€934 / month (Blocked Account requirement)',
    visaInfo: 'National Student Visa with 18-month Job Seeking Permit post-graduation.',
    englishRequirements: 'IELTS 6.5+ / German B2-C1 for German-taught degrees',
    studyLevels: ['Bachelor', 'Master', 'PhD'],
    popularPrograms: ['Automotive Engineering', 'Renewable Energy', 'Informatics', 'Mechatronics'],
    description: 'Zero/low tuition fee public universities, powerhouse economy, and state-of-the-art engineering.',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const DEFAULT_COUPONS = [
  {
    _id: '674e1a0b1234567890cp0001',
    code: 'WELCOME10',
    discountPercent: 10,
    applicablePackages: ['all'],
    usageLimit: 500,
    usedCount: 14,
    perUserLimit: 1,
    isActive: true,
    startDate: new Date().toISOString(),
    expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '674e1a0b1234567890cp0002',
    code: 'ADMIFY25',
    discountPercent: 25,
    applicablePackages: ['premium', 'ultimate'],
    usageLimit: 100,
    usedCount: 22,
    perUserLimit: 1,
    isActive: true,
    startDate: new Date().toISOString(),
    expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const DEFAULT_PLATFORM_SETTINGS = {
  general: {
    platformName: 'Admify Global Study Center',
    supportEmail: 'support@admify.world',
    contactPhone: '+880 1700-000000',
    companyAddress: 'Level 12, Gulshan Tower, Dhaka 1212',
    currency: 'BDT',
    creditRateBdt: 100,
    allowRegistrations: true,
  },
  credits: {
    welcomeCreditAmount: 20,
    welcomeCreditValidityDays: 30,
    forfeitWelcomeOnPurchase: true,
    costs: {
      aiSop: 20,
      sopRewrite: 10,
      aiLor: 20,
      lorRewrite: 10,
      aiRecommendation: 5,
      admissionProbability: 10,
      documentReview: 15,
      aiScholarship: 5,
      directApplication: 50,
      additionalApplication: 30,
      agencyAssistance: 800,
      fullAgencyManaged: 1500,
    },
  },
  payment: {
    bKashMerchant: '01711-223344',
    nagadMerchant: '01811-223344',
    rocketMerchant: '01911-223344-8',
    bankName: 'Eastern Bank PLC',
    bankAccountName: 'Admify Technologies Ltd',
    bankAccountNumber: '1041060000001',
    bankBranch: 'Gulshan Branch',
    bankRoutingNumber: '090271615',
    requireScreenshot: true,
  },
  email: {
    senderName: 'Admify Admissions Desk',
    senderEmail: 'noreply@admify.world',
    sendVerificationEmails: true,
    sendActivationEmails: true,
    sendPaymentNotifications: true,
  },
  security: {
    maxLoginAttempts: 5,
    sessionTimeoutMinutes: 1440,
    requireAdmin2FA: false,
    auditLoggingEnabled: true,
  },
};

const getInitialData = () => {
  return {
    users: [
      {
        _id: '674e1a0b1234567890abcdef',
        name: 'Admify Administrator',
        email: 'admin@admify.world',
        password: '$2a$10$YourHashedPasswordPlaceholderHereOrAutoHashed',
        phone: '+1 (800) 555-0199',
        role: 'admin',
        status: 'active',
        accountStatus: 'ACTIVE',
        isActive: true,
        walletCredits: 1000,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: '674e1a0b1234567890abcde1',
        name: 'Alex Student',
        email: 'alex.student@admify.world',
        password: '',
        phone: '+880 1700-000001',
        role: 'student',
        status: 'active',
        accountStatus: 'ACTIVE',
        isActive: true,
        walletCredits: 20,
        freeCredits: 20,
        paidCredits: 0,
        targetCountry: 'United Kingdom',
        targetCourse: 'MSc Computer Science',
        gpa: '3.85',
        ielts: '7.5',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    agencyProfiles: [],
    notifications: [],
    agentApplications: [],
    universityRepApplications: [],
    universityAgencyConnections: [],
    universities: [],
    scholarships: [],
    paymentOrders: [],
    creditTransactions: [],
    applications: [],
    coupons: DEFAULT_COUPONS,
    countries: DEFAULT_COUNTRIES,
    reports: [],
    auditLogs: [],
    platformSettings: DEFAULT_PLATFORM_SETTINGS,
    chatMessages: [],
    conversations: [],
    announcements: [],
  };
};


class DevStore {
  constructor() {
    if (process.env.NODE_ENV !== 'production') {
      this.ensureDbFile();
    }
  }

  ensureDbFile() {
    if (process.env.NODE_ENV === 'production') {
      return;
    }
    if (!fs.existsSync(DB_FILE)) {
      const initial = getInitialData();
      const salt = bcrypt.genSaltSync(10);
      initial.users[0].password = bcrypt.hashSync('Admin@123456', salt);
      initial.users[1].password = bcrypt.hashSync('Password123!', salt);

      // seed universities if file exists
      if (fs.existsSync(UNIVERSITIES_FILE)) {
        try {
          const raw = fs.readFileSync(UNIVERSITIES_FILE, 'utf-8');
          initial.universities = JSON.parse(raw);
        } catch (e) {
          console.warn('[DevStore] universities.json seed failed:', e.message);
        }
      }

      // seed scholarships if file exists
      if (fs.existsSync(SCHOLARSHIPS_FILE)) {
        try {
          const raw = fs.readFileSync(SCHOLARSHIPS_FILE, 'utf-8');
          initial.scholarships = JSON.parse(raw);
        } catch (e) {
          console.warn('[DevStore] scholarships.json seed failed:', e.message);
        }
      }

      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    } else {
      // Ensure all collection keys exist in current DB file
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const db = JSON.parse(raw);
        let modified = false;

        const arraysToCheck = [
          'users',
          'agencyProfiles',
          'notifications',
          'agentApplications',
          'universityRepApplications',
          'universityAgencyConnections',
          'universities',
          'scholarships',
          'paymentOrders',
          'creditTransactions',
          'applications',
          'coupons',
          'countries',
          'reports',
          'auditLogs',
          'chatMessages',
          'adminSeenItems',
          'studentSeenItems',
          'agentSeenItems',
          'agencySeenItems',
          'uniRepSeenItems',
        ];

        for (const k of arraysToCheck) {
          if (!Array.isArray(db[k])) {
            db[k] = [];
            modified = true;
          }
        }

        if (!db.platformSettings || typeof db.platformSettings !== 'object') {
          db.platformSettings = DEFAULT_PLATFORM_SETTINGS;
          modified = true;
        }

        if (db.countries.length === 0) {
          db.countries = DEFAULT_COUNTRIES;
          modified = true;
        }

        if (db.coupons.length === 0) {
          db.coupons = DEFAULT_COUPONS;
          modified = true;
        }

        if (db.universities.length <= 1 && fs.existsSync(UNIVERSITIES_FILE)) {
          try {
            const rawUnis = JSON.parse(fs.readFileSync(UNIVERSITIES_FILE, 'utf-8'));
            for (const u of rawUnis) {
              if (!db.universities.some((existing) => existing.name === u.name)) {
                db.universities.push(u);
                modified = true;
              }
            }
          } catch {}
        }

        if (db.scholarships.length === 0 && fs.existsSync(SCHOLARSHIPS_FILE)) {
          try {
            db.scholarships = JSON.parse(fs.readFileSync(SCHOLARSHIPS_FILE, 'utf-8'));
            modified = true;
          } catch {}
        }

        const syncRes = this.syncWelcomeCreditLedger(db);
        if (syncRes.backfilledCount > 0) {
          modified = true;
        }

        if (modified) {
          fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
        }
      } catch (err) {
        console.error('[DevStore ensureDbFile sync error]', err);
      }
    }
  }

  read() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('[DevStore Fatal] devStore fallback is strictly prohibited in production environment. Ensure MongoDB is connected.');
    }
    try {
      this.ensureDbFile();
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(raw);
    } catch {
      return getInitialData();
    }
  }

  write(data) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('[DevStore Fatal] devStore fallback is strictly prohibited in production environment. Ensure MongoDB is connected.');
    }
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[DevStore Write Error]', err);
    }
  }

  // ── User Methods ──────────────────────────────────────────────────────────
  async findUserByEmail(email) {
    if (!email) return null;
    const db = this.read();
    const user = db.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase().trim()
    );
    if (!user) return null;
    return this.attachUserMethods(user);
  }

  async findUserById(id) {
    if (!id) return null;
    const db = this.read();
    const idStr = id.toString();
    const user = db.users.find((u) => u._id === idStr);
    if (!user) return null;
    return this.attachUserMethods(user);
  }

  async findUserByActivationTokenHash(tokenHash) {
    if (!tokenHash) return null;
    const db = this.read();
    const user = db.users.find((u) => u.activationTokenHash === tokenHash);
    if (!user) return null;
    return this.attachUserMethods(user);
  }

  async findAdmins() {
    const db = this.read();
    return db.users.filter((u) => u.role === 'admin').map((u) => this.attachUserMethods(u));
  }

  async findUsers(filter = {}) {
    const db = this.read();
    let list = db.users || [];

    if (filter.role && filter.role !== 'all') {
      const targetRole = filter.role.toLowerCase();
      if (targetRole === 'unirep' || targetRole === 'university_rep') {
        list = list.filter((u) => u.role === 'university_rep' || u.role === 'university representative' || u.role === 'university');
      } else {
        list = list.filter((u) => u.role === targetRole);
      }
    }

    if (filter.status && filter.status !== 'all') {
      list = list.filter((u) => u.status === filter.status || u.accountStatus === filter.status.toUpperCase());
    }

    if (filter.search) {
      const s = filter.search.toLowerCase().trim();
      list = list.filter(
        (u) =>
          u.name?.toLowerCase().includes(s) ||
          u.email?.toLowerCase().includes(s) ||
          u.phone?.toLowerCase().includes(s) ||
          u.targetCountry?.toLowerCase().includes(s) ||
          u._id?.toLowerCase().includes(s)
      );
    }

    // Sort descending by createdAt
    list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    return list.map((u) => this.attachUserMethods(u));
  }

  async createUser(userData) {
    const db = this.read();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password || 'Admify@2026', salt);

    const isPendingRole =
      userData.role === 'agency' ||
      userData.role === 'university_rep' ||
      userData.role === 'university' ||
      userData.role === 'university representative';

    const newUser = {
      ...userData,
      _id: new mongoose.Types.ObjectId().toString(),
      email: userData.email.toLowerCase().trim(),
      password: hashedPassword,
      status: userData.status || (isPendingRole ? 'pending' : 'active'),
      accountStatus: userData.accountStatus || (isPendingRole ? 'PENDING' : 'ACTIVE'),
      isActive: userData.isActive !== undefined ? userData.isActive : !isPendingRole,
      emailVerified: userData.emailVerified !== undefined ? userData.emailVerified : !isPendingRole,
      walletCredits: userData.walletCredits !== undefined ? userData.walletCredits : (userData.role === 'student' ? 20 : 0),
      freeCredits: userData.freeCredits !== undefined ? userData.freeCredits : (userData.role === 'student' ? 20 : 0),
      paidCredits: userData.paidCredits || 0,
      freeCreditExpiresAt: userData.freeCreditExpiresAt || (userData.role === 'student' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null),
      freeCreditsForfeited: false,
      totalPurchasedCredits: 0,
      totalUsedCredits: 0,
      agencyVerificationStatus: userData.agencyVerificationStatus || 'PENDING',
      uniRepVerificationStatus: userData.uniRepVerificationStatus || 'PENDING',
      universityId: userData.universityId || null,
      universityRepApplicationId: userData.universityRepApplicationId || '',
      designation: userData.designation || '',
      department: userData.department || '',
      officialUniversityEmail: userData.officialUniversityEmail || '',
      activationTokenHash: userData.activationTokenHash || null,
      activationTokenExpires: userData.activationTokenExpires || null,
      activationTokenUsed: userData.activationTokenUsed || false,
      activatedAt: userData.activatedAt || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.users.push(newUser);
    this.write(db);
    return this.attachUserMethods(newUser);
  }

  async updateUser(id, updates) {
    const db = this.read();
    const idStr = id.toString();
    const idx = db.users.findIndex((u) => u._id === idStr);
    if (idx === -1) return null;

    db.users[idx] = {
      ...db.users[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.write(db);
    return this.attachUserMethods(db.users[idx]);
  }

  async deleteUser(id) {
    const db = this.read();
    const idStr = id.toString();
    const idx = db.users.findIndex((u) => u._id === idStr);
    if (idx === -1) return false;
    db.users.splice(idx, 1);
    this.write(db);
    return true;
  }

  attachUserMethods(rawUser) {
    const user = { ...rawUser };
    user.matchPassword = async (enteredPassword) => {
      if (!user.password) return false;
      return bcrypt.compare(enteredPassword, user.password);
    };
    user.toJSON = function () {
      const copy = { ...this };
      delete copy.password;
      delete copy.activationTokenHash;
      const isPendingRole =
        copy.role === 'agency' ||
        copy.role === 'university_rep' ||
        copy.role === 'university' ||
        copy.role === 'university representative';
      if (copy.role !== 'student') {
        copy.walletCredits = 'N/A';
        copy.availableCredits = 'N/A';
        copy.freeCredits = 'N/A';
        copy.paidCredits = 'N/A';
      } else {
        const now = new Date();
        const isFreeExpired = copy.freeCreditExpiresAt && new Date(copy.freeCreditExpiresAt) < now;
        const isFreeForfeited = Boolean(copy.freeCreditsForfeited);
        const activeFree = (!isFreeExpired && !isFreeForfeited) ? (Number(copy.freeCredits) || 0) : 0;
        const activePaid = Number(copy.paidCredits) || 0;
        copy.availableCredits = activeFree + activePaid;
        copy.walletCredits = copy.availableCredits;
        copy.activeFreeCredits = activeFree;
        copy.isFreeExpired = Boolean(isFreeExpired);
        copy.freeCredits = activeFree;
        copy.paidCredits = activePaid;
        copy.creditsBreakdown = {
          availableCredits: copy.availableCredits,
          freeCredits: activeFree,
          paidCredits: activePaid,
          isFreeExpired: Boolean(isFreeExpired),
          freeCreditsForfeited: isFreeForfeited,
        };
      }
      copy.user_metadata = {
        full_name: copy.name,
        phone: copy.phone,
        role: copy.role,
        accountStatus: copy.accountStatus || (isPendingRole ? 'PENDING' : 'ACTIVE'),
        isActive: copy.isActive !== undefined ? copy.isActive : !isPendingRole,
        agencyVerificationStatus: copy.agencyVerificationStatus || 'PENDING',
        uniRepVerificationStatus: copy.uniRepVerificationStatus || 'PENDING',
        universityId: copy.universityId || null,
        universityRepApplicationId: copy.universityRepApplicationId || '',
        designation: copy.designation || '',
        department: copy.department || '',
        officialUniversityEmail: copy.officialUniversityEmail || '',
      };
      return copy;
    };
    return user;
  }

  // ── Agency Profile Methods ────────────────────────────────────────────────
  async findAgencyProfileByUserId(userId) {
    if (!userId) return null;
    const db = this.read();
    const idStr = userId.toString();
    let profile = (db.agencyProfiles || []).find(
      (p) =>
        p.user?.toString() === idStr ||
        p.user?._id?.toString() === idStr ||
        p.userId?.toString() === idStr
    ) || null;
    if (!profile) {
      const u = (db.users || []).find((usr) => usr._id?.toString() === idStr && usr.role === 'agency');
      if (u) {
        profile = (db.agencyProfiles || []).find(
          (p) => p.officialBusinessEmail && p.officialBusinessEmail.toLowerCase() === (u.email || '').toLowerCase()
        ) || null;
        if (profile) {
          profile.user = u._id;
          this.write(db);
        }
      }
    }
    return profile;
  }

  async findAgencyProfileById(id) {
    if (!id) return null;
    const db = this.read();
    const idStr = id.toString();
    let profile = (db.agencyProfiles || []).find((p) => p._id === idStr) || null;
    if (!profile) {
      profile = await this.findAgencyProfileByUserId(id);
    }
    if (!profile) {
      profile = await this.findAgencyProfileByApplicationId(id);
    }
    return profile;
  }

  async findAgencyProfileByApplicationId(applicationId) {
    if (!applicationId) return null;
    const db = this.read();
    return (db.agencyProfiles || []).find((p) => p.applicationId === applicationId) || null;
  }

  async findAgencyProfiles(query = {}) {
    const db = this.read();
    if (!Array.isArray(db.agencyProfiles)) db.agencyProfiles = [];
    let list = db.agencyProfiles;
    const agencyUsers = (db.users || []).filter((u) => u.role === 'agency');

    // Auto-synchronize: ensure EVERY agency user has a canonical AgencyProfile
    let dirty = false;
    for (const u of agencyUsers) {
      const uid = u._id?.toString();
      let p = list.find((item) => (
        item.user?.toString() === uid ||
        item.user?._id?.toString() === uid ||
        (item.officialBusinessEmail && item.officialBusinessEmail.toLowerCase() === (u.email || '').toLowerCase())
      ));

      if (!p) {
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        const timeCode = Date.now().toString(36).toUpperCase().slice(-4);
        const appId = u.applicationId || `ADM-AGY-2026-${timeCode}${randomSuffix}`;
        p = {
          _id: new mongoose.Types.ObjectId().toString(),
          user: uid,
          agencyName: u.name || 'Agency ' + (u.email || '').split('@')[0],
          officialBusinessEmail: u.email,
          applicationId: appId,
          verificationStatus: (u.agencyVerificationStatus || (u.accountStatus === 'APPROVED' || u.accountStatus === 'ACTIVE' ? 'VERIFIED' : 'PENDING')).toUpperCase(),
          isDraft: true,
          authorizedPerson: {
            fullName: u.name || '',
            phone: u.phone || '',
            email: u.email || '',
            designation: 'Managing Director',
          },
          businessVerification: {},
          createdAt: u.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        list.push(p);
        u.agencyProfile = p._id;
        dirty = true;
      } else {
        if (!p.user || p.user.toString() !== uid) {
          p.user = uid;
          dirty = true;
        }
        if (!u.agencyProfile || u.agencyProfile.toString() !== p._id.toString()) {
          u.agencyProfile = p._id;
          dirty = true;
        }
      }
    }
    if (dirty) {
      db.agencyProfiles = list;
      this.write(db);
    }

    // Filter by verificationStatus
    const st = (query.verificationStatus || query.status || '').toUpperCase();
    if (st && st !== 'ALL') {
      if (st === 'VERIFIED' || st === 'APPROVED') {
        list = list.filter((p) => {
          const s = (p.verificationStatus || '').toUpperCase();
          return s === 'VERIFIED' || s === 'APPROVED';
        });
      } else {
        list = list.filter((p) => (p.verificationStatus || '').toUpperCase() === st);
      }
    }

    // Populate user
    let populated = list.map((p) => {
      const uId = p.user?._id || p.user;
      const user = db.users.find((u) => u._id === uId?.toString());
      return {
        ...p,
        user: user
          ? {
              _id: user._id,
              name: user.name,
              email: user.email,
              phone: user.phone,
              role: user.role,
              status: user.status,
              accountStatus: user.accountStatus,
              agencyVerificationStatus: user.agencyVerificationStatus || p.verificationStatus,
              createdAt: user.createdAt,
            }
          : null,
      };
    });

    // Filter by search
    const s = (query.search || '').toLowerCase().trim();
    if (s) {
      populated = populated.filter((p) => {
        return (
          p.agencyName?.toLowerCase().includes(s) ||
          p.legalName?.toLowerCase().includes(s) ||
          p.officialBusinessEmail?.toLowerCase().includes(s) ||
          p.applicationId?.toLowerCase().includes(s) ||
          p.authorizedPerson?.fullName?.toLowerCase().includes(s) ||
          p.authorizedPerson?.phone?.toLowerCase().includes(s) ||
          p.authorizedPerson?.email?.toLowerCase().includes(s) ||
          p.user?.name?.toLowerCase().includes(s) ||
          p.user?.email?.toLowerCase().includes(s) ||
          p.user?.phone?.toLowerCase().includes(s)
        );
      });
    }

    return populated.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }

  async saveAgencyProfile(profileData) {
    const db = this.read();
    let existingIndex = -1;

    if (profileData._id) {
      existingIndex = db.agencyProfiles.findIndex((p) => p._id === profileData._id);
    } else if (profileData.user) {
      existingIndex = db.agencyProfiles.findIndex(
        (p) => (p.user?.toString() || p.user?._id?.toString()) === (profileData.user.toString() || profileData.user._id?.toString())
      );
    }

    if (existingIndex >= 0) {
      db.agencyProfiles[existingIndex] = {
        ...db.agencyProfiles[existingIndex],
        ...profileData,
        updatedAt: new Date().toISOString(),
      };
      this.write(db);
      return db.agencyProfiles[existingIndex];
    } else {
      const newProfile = {
        ...profileData,
        _id: profileData._id || new mongoose.Types.ObjectId().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      db.agencyProfiles.push(newProfile);
      this.write(db);
      return newProfile;
    }
  }

  // ── Notifications ─────────────────────────────────────────────────────────
  async createNotification(notifData) {
    const db = this.read();
    if (!Array.isArray(db.notifications)) db.notifications = [];
    const newNotif = {
      _id: new mongoose.Types.ObjectId().toString(),
      ...notifData,
      user: notifData.user?.toString(),
      read: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.notifications.unshift(newNotif);
    this.write(db);
    return newNotif;
  }

  async findNotifications(userId = null) {
    const db = this.read();
    if (!Array.isArray(db.notifications)) return [];
    if (!userId) return db.notifications;
    const idStr = userId.toString();
    return db.notifications.filter((n) => !n.user || n.user === idStr);
  }

  async markNotificationAsRead(id, userId) {
    const db = this.read();
    if (!Array.isArray(db.notifications)) return null;
    const notif = db.notifications.find((n) => n._id === id.toString());
    if (notif) {
      notif.read = true;
      notif.updatedAt = new Date().toISOString();
      this.write(db);
    }
    return notif;
  }

  async markAllNotificationsAsRead(userId) {
    const db = this.read();
    if (!Array.isArray(db.notifications)) return;
    const idStr = userId.toString();
    db.notifications.forEach((n) => {
      if (!n.user || n.user === idStr) n.read = true;
    });
    this.write(db);
  }

  // ── Agent Applications ────────────────────────────────────────────────────
  async findAgentApplicationById(id) {
    const db = this.read();
    if (!Array.isArray(db.agentApplications)) return null;
    const idStr = id.toString();
    return (
      db.agentApplications.find(
        (a) => a._id === idStr || a.applicationId?.toUpperCase() === idStr.toUpperCase()
      ) || null
    );
  }

  async findAgentApplicationByAppId(appId) {
    if (!appId) return null;
    const db = this.read();
    if (!Array.isArray(db.agentApplications)) return null;
    return (
      db.agentApplications.find(
        (a) => a.applicationId?.toUpperCase() === appId.toUpperCase().trim()
      ) || null
    );
  }

  async findAgentApplications(filter = {}) {
    const db = this.read();
    if (!Array.isArray(db.agentApplications)) return [];
    let list = db.agentApplications;
    if (filter.agency) {
      list = list.filter((a) => a.agency === filter.agency.toString());
    }
    if (filter.status) {
      list = list.filter((a) => a.status === filter.status);
    }
    if (filter.email) {
      list = list.filter((a) => a.email?.toLowerCase() === filter.email.toLowerCase().trim());
    }
    return list;
  }

  async createAgentApplication(data) {
    const db = this.read();
    if (!Array.isArray(db.agentApplications)) db.agentApplications = [];
    const newApp = {
      _id: new mongoose.Types.ObjectId().toString(),
      ...data,
      agency: data.agency?.toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.agentApplications.unshift(newApp);
    this.write(db);
    return newApp;
  }

  async updateAgentApplication(id, updates) {
    const db = this.read();
    if (!Array.isArray(db.agentApplications)) return null;
    const idStr = id.toString();
    const index = db.agentApplications.findIndex(
      (a) => a._id === idStr || a.applicationId?.toUpperCase() === idStr.toUpperCase()
    );
    if (index === -1) return null;
    db.agentApplications[index] = {
      ...db.agentApplications[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.write(db);
    return db.agentApplications[index];
  }

  async findAgencyByIdOrAppId(identifier) {
    if (!identifier) return null;
    const db = this.read();
    const clean = identifier.trim();

    const profile = db.agencyProfiles?.find(
      (p) =>
        p._id === clean ||
        p.applicationId?.toUpperCase() === clean.toUpperCase() ||
        p.agencyName?.toLowerCase() === clean.toLowerCase()
    );
    if (profile) {
      const user = db.users.find((u) => u._id === profile.user?.toString());
      return { profile, user };
    }

    const user = db.users.find(
      (u) => (u._id === clean || u.email?.toLowerCase() === clean.toLowerCase()) && u.role === 'agency'
    );
    if (user) {
      const p = db.agencyProfiles?.find((ap) => ap.user?.toString() === user._id);
      return { profile: p || null, user };
    }

    return null;
  }

  // ── Universities ──────────────────────────────────────────────────────────
  async findOrCreateUniversity(data = {}) {
    const db = this.read();
    if (!Array.isArray(db.universities)) db.universities = [];
    const name = data.name || 'Verified University';
    let uni = db.universities.find((u) => u.name?.toLowerCase() === name.toLowerCase());
    if (!uni) {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `uni-${Date.now()}`;
      uni = {
        _id: new mongoose.Types.ObjectId().toString(),
        slug,
        name,
        country: data.country || 'Global',
        city: data.city || '',
        location: data.city ? `${data.city}, ${data.country || 'Global'}` : (data.country || 'Global'),
        type: data.type || 'Public',
        logo: data.logo || '',
        website: data.website || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      db.universities.push(uni);
      this.write(db);
    }
    return uni;
  }

  // ── University Representative Applications ────────────────────────────────
  async findUniRepApplicationById(id) {
    if (!id) return null;
    const db = this.read();
    if (!Array.isArray(db.universityRepApplications)) return null;
    const idStr = id.toString();
    return db.universityRepApplications.find((a) => a._id === idStr) || null;
  }

  async findUniRepApplicationByUserId(userId) {
    if (!userId) return null;
    const db = this.read();
    if (!Array.isArray(db.universityRepApplications)) return null;
    const idStr = userId.toString();
    return db.universityRepApplications.find((a) => a.user?.toString() === idStr) || null;
  }

  async findUniRepApplicationByAppId(appId) {
    if (!appId) return null;
    const db = this.read();
    if (!Array.isArray(db.universityRepApplications)) return null;
    return (
      db.universityRepApplications.find(
        (a) => a.applicationId?.toUpperCase() === appId.toUpperCase().trim()
      ) || null
    );
  }

  async createUniRepApplication(data) {
    const db = this.read();
    if (!Array.isArray(db.universityRepApplications)) db.universityRepApplications = [];
    const newApp = {
      _id: new mongoose.Types.ObjectId().toString(),
      ...data,
      user: data.user?.toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.universityRepApplications.unshift(newApp);
    this.write(db);
    return newApp;
  }

  async updateUniRepApplication(id, updates) {
    const db = this.read();
    if (!Array.isArray(db.universityRepApplications)) return null;
    const idStr = id.toString();
    const index = db.universityRepApplications.findIndex(
      (a) => a._id === idStr || a.applicationId?.toUpperCase() === idStr.toUpperCase()
    );
    if (index === -1) return null;
    db.universityRepApplications[index] = {
      ...db.universityRepApplications[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.write(db);
    return db.universityRepApplications[index];
  }

  async deleteUniRepApplication(id) {
    const db = this.read();
    if (!Array.isArray(db.universityRepApplications)) return true;
    const idStr = id ? id.toString() : '';
    db.universityRepApplications = db.universityRepApplications.filter(
      (a) => a._id !== idStr && a.applicationId?.toUpperCase() !== idStr.toUpperCase()
    );
    this.write(db);
    return true;
  }

  async findUniRepApplications(filter = {}) {
    const db = this.read();
    if (!Array.isArray(db.universityRepApplications)) db.universityRepApplications = [];
    if (!Array.isArray(db.users)) db.users = [];

    // Reconcile uni rep users
    const uniUsers = db.users.filter(
      (u) => u.role === 'university_rep' || u.role === 'universityRep' || u.role === 'university' || u.role === 'university representative'
    );
    let dirty = false;
    for (const u of uniUsers) {
      const uid = u._id ? u._id.toString() : '';
      let app = db.universityRepApplications.find(
        (a) =>
          a.user?.toString() === uid ||
          a.user?._id?.toString() === uid ||
          (u.universityRepApplicationId && a.applicationId?.toUpperCase() === u.universityRepApplicationId?.toUpperCase())
      );
      if (app) {
        const rawStatus = (u.uniRepVerificationStatus || u.accountStatus || (u.status === 'rejected' ? 'REJECTED' : '')).toUpperCase();
        if (rawStatus === 'REJECTED' && app.status !== 'REJECTED') {
          app.status = 'REJECTED';
          app.profileStatus = 'REJECTED';
          dirty = true;
        }
      } else {
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        const timeCode = Date.now().toString(36).toUpperCase().slice(-4);
        const appId = u.universityRepApplicationId || `ADM-REP-2026-${timeCode}${randomSuffix}`;
        const hasRequired = Boolean(u.employeeId && u.city && u.website);
        const rawStatus = (u.uniRepVerificationStatus || u.accountStatus || (u.status === 'rejected' ? 'REJECTED' : 'PENDING')).toUpperCase();
        const isExplicitRejected = rawStatus === 'REJECTED' || u.uniRepVerificationStatus === 'REJECTED' || u.accountStatus === 'REJECTED' || u.status === 'rejected';
        const isExplicitActive = rawStatus === 'ACTIVE' || u.accountStatus === 'ACTIVE' || u.status === 'active';
        const isExplicitApproved = rawStatus === 'APPROVED' || rawStatus === 'VERIFIED' || u.uniRepVerificationStatus === 'VERIFIED' || u.uniRepVerificationStatus === 'APPROVED';
        const isUnderReview = rawStatus === 'UNDER_REVIEW' || u.uniRepVerificationStatus === 'UNDER_REVIEW';

        let resolvedStatus = 'PENDING';
        if (isExplicitRejected) resolvedStatus = 'REJECTED';
        else if (isExplicitActive) resolvedStatus = 'ACTIVE';
        else if (isExplicitApproved) resolvedStatus = 'APPROVED';
        else if (isUnderReview) resolvedStatus = 'UNDER_REVIEW';
        else if (!hasRequired) resolvedStatus = 'PROFILE_INCOMPLETE';
        else resolvedStatus = 'PENDING';

        app = {
          _id: new mongoose.Types.ObjectId().toString(),
          applicationId: appId,
          user: uid,
          userObj: {
            _id: uid,
            name: u.name,
            email: u.email,
            phone: u.phone,
            role: u.role,
            status: u.status,
            accountStatus: u.accountStatus || 'PENDING',
            uniRepVerificationStatus: u.uniRepVerificationStatus || 'PENDING',
            walletCredits: 'N/A',
            availableCredits: 'N/A',
          },
          university: {
            name: u.universityName || (u.email && u.email.includes('@') ? u.email.split('@')[1].replace(/\.[a-z]+$/, '').toUpperCase() + ' University' : 'Partner University'),
            legalName: u.universityName || 'Partner University',
            logo: '',
            website: u.website || null,
            country: u.country || 'Global',
            city: u.city || null,
            type: 'Public',
            domain: u.email && u.email.includes('@') ? u.email.split('@')[1] : '',
          },
          representative: {
            fullName: u.name || '',
            designation: u.designation || 'International Admissions Officer',
            officialEmail: u.email || '',
            phone: u.phone || '',
            employeeId: u.employeeId || null,
          },
          isProfileComplete: hasRequired,
          profileStatus: resolvedStatus,
          status: resolvedStatus,
          rejectionReason: u.rejectionReason || '',
          rejectedAt: u.rejectedAt || null,
          rejectedBy: u.rejectedBy || null,
          adminNotes: u.adminNotes || '',
          submittedAt: u.createdAt || new Date().toISOString(),
          createdAt: u.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        db.universityRepApplications.unshift(app);
        u.universityRepApplication = app._id;
        u.universityRepApplicationId = appId;
        dirty = true;
      }
    }
    if (dirty) this.write(db);

    return db.universityRepApplications.filter((app) => {
      if (filter.status && filter.status !== 'all') {
        const st = filter.status.toUpperCase();
        if (st === 'REJECTED') {
          if (app.status !== 'REJECTED' && app.profileStatus !== 'REJECTED') return false;
        } else if (st === 'APPROVED' || st === 'ACTIVE') {
          if (app.status !== 'APPROVED' && app.status !== 'ACTIVE') return false;
        } else if (st === 'PROFILE_INCOMPLETE') {
          if (app.status === 'REJECTED' || app.status === 'APPROVED' || app.status === 'ACTIVE') return false;
          if (app.status !== 'PROFILE_INCOMPLETE' && app.profileStatus !== 'PROFILE_INCOMPLETE' && app.isProfileComplete) return false;
        } else if (st === 'PENDING') {
          if (app.status === 'REJECTED' || app.status === 'APPROVED' || app.status === 'ACTIVE') return false;
          if (app.status !== 'PENDING' && app.profileStatus !== 'PENDING') return false;
        } else if (app.status !== st && app.profileStatus !== st) {
          return false;
        }
      }
      if (filter.search && filter.search.trim()) {
        const s = filter.search.toLowerCase().trim();
        const match =
          app.applicationId?.toLowerCase().includes(s) ||
          app.university?.name?.toLowerCase().includes(s) ||
          app.representative?.fullName?.toLowerCase().includes(s) ||
          app.representative?.officialEmail?.toLowerCase().includes(s);
        if (!match) return false;
      }
      if (filter.user && app.user?.toString() !== filter.user.toString()) return false;
      return true;
    });
  }

  // ── Agent Applications & Directory ──────────────────────────────────────────
  async findAgentApplications(filter = {}) {
    const db = this.read();
    if (!Array.isArray(db.agentApplications)) db.agentApplications = [];
    if (!Array.isArray(db.users)) db.users = [];

    // Reconcile agent users with agent applications
    const agentUsers = db.users.filter((u) => u.role === 'agent');
    let dirty = false;
    for (const ag of agentUsers) {
      const agUid = ag._id ? ag._id.toString() : '';
      let app = db.agentApplications.find(
        (a) =>
          a.agentUser?.toString() === agUid ||
          (ag.agentApplicationId && a.applicationId?.toUpperCase() === ag.agentApplicationId?.toUpperCase()) ||
          (ag.email && a.email?.toLowerCase() === ag.email.toLowerCase())
      );
      if (!app) {
        let agencyUser = null;
        if (ag.agencyId) {
          agencyUser = db.users.find((u) => u._id?.toString() === ag.agencyId.toString());
        }
        if (!agencyUser) {
          agencyUser = db.users.find((u) => u.role === 'agency');
        }
        const agencyName = agencyUser ? agencyUser.name : 'Partner Agency';
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        const timeCode = Date.now().toString(36).toUpperCase().slice(-4);
        const applicationId = ag.agentApplicationId || `ADM-AGT-2026-${timeCode}${randomSuffix}`;

        app = {
          _id: new mongoose.Types.ObjectId().toString(),
          applicationId,
          agency: agencyUser ? agencyUser._id.toString() : null,
          agencyName,
          agentName: ag.name,
          email: ag.email,
          phone: ag.phone || '+8801700000000',
          designation: ag.designation || 'Educational Counselor',
          countrySpecialization: [],
          status: 'REGISTERED',
          activationCodeStatus: 'USED',
          agentUser: agUid,
          registeredAt: ag.createdAt || new Date().toISOString(),
          createdAt: ag.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        db.agentApplications.unshift(app);
        ag.agentApplicationId = applicationId;
        if (agencyUser && !ag.agencyId) ag.agencyId = agencyUser._id.toString();
        dirty = true;
      }
    }
    if (dirty) this.write(db);

    return db.agentApplications.filter((app) => {
      if (filter.status && filter.status !== 'all') {
        if (app.status?.toUpperCase() !== filter.status.toUpperCase()) return false;
      }
      if (filter.agency && app.agency?.toString() !== filter.agency.toString()) return false;
      if (filter.agencyId && app.agency?.toString() !== filter.agencyId.toString()) return false;
      if (filter.email && app.email?.toLowerCase().trim() !== filter.email.toLowerCase().trim()) return false;
      if (filter.search && filter.search.trim()) {
        const s = filter.search.toLowerCase().trim();
        const match =
          app.applicationId?.toLowerCase().includes(s) ||
          app.agentName?.toLowerCase().includes(s) ||
          app.email?.toLowerCase().includes(s) ||
          app.phone?.toLowerCase().includes(s) ||
          app.agencyName?.toLowerCase().includes(s);
        if (!match) return false;
      }
      return true;
    });
  }

  async findAgentApplicationById(id) {
    if (!id) return null;
    const db = this.read();
    if (!Array.isArray(db.agentApplications)) return null;
    const idStr = id.toString().toUpperCase().trim();
    return (
      db.agentApplications.find(
        (a) =>
          a._id?.toString() === id.toString() ||
          a.applicationId?.toUpperCase() === idStr ||
          a.agentUser?.toString() === id.toString()
      ) || null
    );
  }

  async createAgentApplication(data) {
    const db = this.read();
    if (!Array.isArray(db.agentApplications)) db.agentApplications = [];
    const newApp = {
      _id: new mongoose.Types.ObjectId().toString(),
      ...data,
      agency: data.agency?.toString(),
      agentUser: data.agentUser ? data.agentUser.toString() : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.agentApplications.unshift(newApp);
    this.write(db);
    return newApp;
  }

  async findAgents({ status, search, agencyId } = {}) {
    const db = this.read();
    // Ensure agent applications are reconciled
    await this.findAgentApplications();
    const refreshed = this.read();
    let agents = (refreshed.users || []).filter((u) => u.role === 'agent');

    return agents
      .map((ag) => {
        const item = { ...ag };
        const uid = item._id ? item._id.toString() : '';
        const app = (refreshed.agentApplications || []).find(
          (a) => a.agentUser === uid || (item.email && a.email === item.email)
        );
        item.agentApplication = app || null;
        let agencyUser = null;
        if (item.agencyId) {
          agencyUser = (refreshed.users || []).find(
            (u) => u._id?.toString() === item.agencyId.toString()
          );
        } else if (app && app.agency) {
          agencyUser = (refreshed.users || []).find(
            (u) => u._id?.toString() === app.agency.toString()
          );
        }
        item.agencyId = agencyUser
          ? {
              _id: agencyUser._id,
              name: agencyUser.name,
              email: agencyUser.email,
              phone: agencyUser.phone,
              applicationId: agencyUser.applicationId,
            }
          : null;
        item.agencyName = agencyUser ? agencyUser.name : app?.agencyName || 'Partner Agency';
        item.walletCredits = 'N/A';
        item.availableCredits = 'N/A';
        return item;
      })
      .filter((ag) => {
        if (status && status !== 'all') {
          const st = status.toUpperCase();
          if ((ag.accountStatus || 'ACTIVE').toUpperCase() !== st) return false;
        }
        if (agencyId && ag.agencyId?._id?.toString() !== agencyId.toString()) return false;
        if (search && search.trim()) {
          const s = search.toLowerCase().trim();
          const match =
            ag.name?.toLowerCase().includes(s) ||
            ag.email?.toLowerCase().includes(s) ||
            ag.phone?.toLowerCase().includes(s) ||
            ag.agentApplicationId?.toLowerCase().includes(s) ||
            ag.agencyName?.toLowerCase().includes(s);
          if (!match) return false;
        }
        return true;
      });
  }

  // ── Universities ──────────────────────────────────────────────────────────
  async findOrCreateUniversity(data) {
    const db = this.read();
    if (!Array.isArray(db.universities)) db.universities = [];

    const normName = (data.name || '').toLowerCase().trim();
    let uni = db.universities.find(
      (u) => (u.name || '').toLowerCase().trim() === normName
    );

    if (uni) return uni;

    uni = {
      _id: new mongoose.Types.ObjectId().toString(),
      slug: normName.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `uni-${Date.now()}`,
      name: data.name || 'Verified University',
      location: data.city ? `${data.city}, ${data.country}` : data.country || 'Global',
      country: (data.country || 'Global').toLowerCase(),
      type: data.type || 'Public',
      logo: data.logo || '',
      website: data.website || '',
      programs: [],
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.universities.push(uni);
    this.write(db);
    return uni;
  }

  async findUniversities(query = {}) {
    const db = this.read();
    if (!Array.isArray(db.universities)) return [];
    let list = db.universities;

    if (query.country && query.country !== 'all') {
      list = list.filter((u) => (u.country || '').toLowerCase() === query.country.toLowerCase());
    }

    if (query.status && query.status !== 'all') {
      list = list.filter((u) => (u.status || 'active') === query.status);
    }

    if (query.search) {
      const s = query.search.toLowerCase().trim();
      list = list.filter(
        (u) =>
          u.name?.toLowerCase().includes(s) ||
          u.location?.toLowerCase().includes(s) ||
          u.country?.toLowerCase().includes(s)
      );
    }

    return list;
  }

  async findUniversityById(id) {
    if (!id) return null;
    const db = this.read();
    if (!Array.isArray(db.universities)) return null;
    const idStr = id.toString();
    return db.universities.find((u) => u._id === idStr || u.slug === idStr.toLowerCase());
  }

  async createUniversity(data) {
    const db = this.read();
    if (!Array.isArray(db.universities)) db.universities = [];

    const normName = (data.name || '').toLowerCase().trim();
    const uni = {
      _id: new mongoose.Types.ObjectId().toString(),
      slug: normName.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `uni-${Date.now()}`,
      name: data.name,
      legalName: data.legalName || data.name,
      location: data.location || (data.city ? `${data.city}, ${data.country}` : data.country || 'Global'),
      city: data.city || '',
      country: (data.country || 'Global').toLowerCase(),
      type: data.type || 'Public',
      logo: data.logo || '',
      website: data.website || '',
      description: data.description || '',
      tuition: data.tuition || '',
      applicationFee: data.applicationFee || '',
      livingCost: data.livingCost || '',
      admissionRequirements: data.admissionRequirements || '',
      englishRequirements: data.englishRequirements || '',
      rank: data.rank || 100,
      programs: Array.isArray(data.programs) ? data.programs : [],
      status: data.status || 'active',
      featured: data.featured || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.universities.unshift(uni);
    this.write(db);
    return uni;
  }

  async updateUniversity(id, updates) {
    const db = this.read();
    if (!Array.isArray(db.universities)) return null;
    const idStr = id.toString();
    const idx = db.universities.findIndex((u) => u._id === idStr || u.slug === idStr.toLowerCase());
    if (idx === -1) return null;

    db.universities[idx] = {
      ...db.universities[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.write(db);
    return db.universities[idx];
  }

  async deleteUniversity(id) {
    const db = this.read();
    if (!Array.isArray(db.universities)) return false;
    const idStr = id.toString();
    const idx = db.universities.findIndex((u) => u._id === idStr || u.slug === idStr.toLowerCase());
    if (idx === -1) return false;
    db.universities.splice(idx, 1);
    this.write(db);
    return true;
  }

  // ── University Agency Connections ─────────────────────────────────────────
  async createAgencyConnection(data) {
    const db = this.read();
    if (!Array.isArray(db.universityAgencyConnections)) db.universityAgencyConnections = [];

    const existing = db.universityAgencyConnections.find(
      (c) =>
        c.agencyId === data.agencyId?.toString() &&
        c.universityRepresentativeId === data.universityRepresentativeId?.toString()
    );
    if (existing) {
      const err = new Error('Connection request or relationship already exists.');
      err.code = 11000;
      throw err;
    }

    const newConn = {
      _id: new mongoose.Types.ObjectId().toString(),
      agencyId: data.agencyId?.toString(),
      agencyProfileId: data.agencyProfileId?.toString() || null,
      universityId: data.universityId?.toString(),
      universityRepresentativeId: data.universityRepresentativeId?.toString(),
      requestedBy: data.requestedBy?.toString(),
      requestedByRole: data.requestedByRole || 'agency',
      status: data.status || 'PENDING',
      notes: data.notes || '',
      respondedAt: null,
      respondedBy: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.universityAgencyConnections.unshift(newConn);
    this.write(db);
    return newConn;
  }

  async findAgencyConnections(filter = {}) {
    const db = this.read();
    if (!Array.isArray(db.universityAgencyConnections)) return [];
    return db.universityAgencyConnections.filter((c) => {
      if (filter.agencyId && c.agencyId !== filter.agencyId.toString()) return false;
      if (
        filter.universityRepresentativeId &&
        c.universityRepresentativeId !== filter.universityRepresentativeId.toString()
      )
        return false;
      if (filter.status && c.status !== filter.status) return false;
      return true;
    });
  }

  async findAgencyConnectionById(id) {
    if (!id) return null;
    const db = this.read();
    if (!Array.isArray(db.universityAgencyConnections)) return null;
    const idStr = id.toString();
    return db.universityAgencyConnections.find((c) => c._id === idStr);
  }

  async updateAgencyConnection(id, updates) {
    const db = this.read();
    if (!Array.isArray(db.universityAgencyConnections)) return null;
    const idStr = id.toString();
    const idx = db.universityAgencyConnections.findIndex((c) => c._id === idStr);
    if (idx === -1) return null;

    db.universityAgencyConnections[idx] = {
      ...db.universityAgencyConnections[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.write(db);
    return db.universityAgencyConnections[idx];
  }

  // ── Payment Orders ────────────────────────────────────────────────────────
  async findPaymentOrders(query = {}) {
    const db = this.read();
    if (!Array.isArray(db.paymentOrders)) return [];
    let list = db.paymentOrders;

    if (query.status && query.status !== 'all') {
      list = list.filter((p) => (p.status || '').toUpperCase() === query.status.toUpperCase());
    }

    if (query.search) {
      const s = query.search.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.orderId?.toLowerCase().includes(s) ||
          p.transactionId?.toLowerCase().includes(s) ||
          p.packageName?.toLowerCase().includes(s) ||
          p.user?.name?.toLowerCase().includes(s) ||
          p.user?.email?.toLowerCase().includes(s)
      );
    }

    // populate user if id string
    return list.map((p) => {
      const u = typeof p.user === 'object' ? p.user : db.users.find((usr) => usr._id === p.user?.toString());
      return {
        ...p,
        user: u ? { _id: u._id, name: u.name, email: u.email, phone: u.phone, role: u.role } : null,
      };
    });
  }

  async findPaymentOrderById(id) {
    if (!id) return null;
    const db = this.read();
    if (!Array.isArray(db.paymentOrders)) return null;
    const idStr = id.toString();
    const p = db.paymentOrders.find((order) => order._id === idStr || order.orderId === idStr);
    if (!p) return null;
    const u = typeof p.user === 'object' ? p.user : db.users.find((usr) => usr._id === p.user?.toString());
    return {
      ...p,
      user: u ? { _id: u._id, name: u.name, email: u.email, phone: u.phone, role: u.role } : null,
    };
  }

  async createPaymentOrder(data) {
    const db = this.read();
    if (!Array.isArray(db.paymentOrders)) db.paymentOrders = [];
    const newOrder = {
      _id: new mongoose.Types.ObjectId().toString(),
      ...data,
      user: data.user?.toString(),
      status: data.status || 'PENDING_PAYMENT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.paymentOrders.unshift(newOrder);
    this.write(db);
    return newOrder;
  }

  async updatePaymentOrder(id, updates) {
    const db = this.read();
    if (!Array.isArray(db.paymentOrders)) return null;
    const idStr = id.toString();
    const idx = db.paymentOrders.findIndex((p) => p._id === idStr || p.orderId === idStr);
    if (idx === -1) return null;
    db.paymentOrders[idx] = {
      ...db.paymentOrders[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.write(db);
    return db.paymentOrders[idx];
  }

  // ── Credit Transactions ───────────────────────────────────────────────────
  async findCreditTransactions(query = {}) {
    const db = this.read();
    if (!Array.isArray(db.creditTransactions)) return [];
    let list = db.creditTransactions;

    if (query.user) {
      const uid = query.user.toString();
      list = list.filter((tx) => (tx.user?._id || tx.user)?.toString() === uid);
    }

    if (query.type && query.type !== 'all') {
      list = list.filter((tx) => tx.type === query.type);
    }

    // populate user first so search can match user fields
    const populated = list.map((tx) => {
      const uid = (tx.user?._id || tx.user)?.toString();
      const u = typeof tx.user === 'object' && tx.user.name ? tx.user : db.users.find((usr) => usr._id === uid);
      const adminId = (tx.admin?._id || tx.admin)?.toString();
      const adminUser = adminId ? db.users.find((usr) => usr._id === adminId) : null;
      return {
        ...tx,
        adminName: tx.adminName || adminUser?.name || '',
        adminEmail: tx.adminEmail || adminUser?.email || '',
        user: u ? { _id: u._id, name: u.name, email: u.email, phone: u.phone, role: u.role } : null,
      };
    });

    let results = populated;
    if (query.search) {
      const s = query.search.toLowerCase().trim();
      results = results.filter(
        (tx) =>
          tx.transactionId?.toLowerCase().includes(s) ||
          tx.desc?.toLowerCase().includes(s) ||
          tx.referenceId?.toLowerCase().includes(s) ||
          tx.type?.toLowerCase().includes(s) ||
          tx.reason?.toLowerCase().includes(s) ||
          tx.adminName?.toLowerCase().includes(s) ||
          tx.user?.name?.toLowerCase().includes(s) ||
          tx.user?.email?.toLowerCase().includes(s)
      );
    }

    results.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return results;
  }

  async createCreditTransaction(data) {
    const db = this.read();
    if (!Array.isArray(db.creditTransactions)) db.creditTransactions = [];

    const userIdStr = (data.user?._id || data.user)?.toString();

    // Idempotency check for WELCOME_CREDIT
    if (data.type === 'WELCOME_CREDIT') {
      const existing = db.creditTransactions.find(
        (tx) => (tx.user?.toString() === userIdStr || tx.user?._id?.toString() === userIdStr) && tx.type === 'WELCOME_CREDIT'
      );
      if (existing) {
        return existing;
      }
    }

    const newTx = {
      _id: new mongoose.Types.ObjectId().toString(),
      transactionId: data.transactionId || `CTX-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      ...data,
      user: userIdStr,
      status: data.status || 'COMPLETED',
      expiresAt: data.expiresAt || null,
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: data.updatedAt || new Date().toISOString(),
    };
    db.creditTransactions.unshift(newTx);
    this.write(db);
    return newTx;
  }

  syncWelcomeCreditLedger(externalDb = null) {
    const isInternal = !externalDb;
    const db = externalDb || this.read();
    if (!Array.isArray(db.users) || !Array.isArray(db.creditTransactions)) {
      return { backfilledCount: 0, totalStudents: 0 };
    }

    let backfilledCount = 0;
    const students = db.users.filter((u) => u.role === 'student');

    for (const student of students) {
      // Check if student already has a WELCOME_CREDIT transaction
      const hasWelcome = db.creditTransactions.some(
        (tx) => (tx.user?.toString() === student._id.toString() || tx.user?._id?.toString() === student._id.toString()) && tx.type === 'WELCOME_CREDIT'
      );

      if (!hasWelcome) {
        // Safe one-time backfill: student was created under previous implementation without ledger record
        const createdAt = student.createdAt || new Date().toISOString();
        const expiresAt = student.freeCreditExpiresAt || new Date(new Date(createdAt).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
        const randId = Math.random().toString(36).substring(2, 8).toUpperCase();
        const transactionId = `ADM-WELCOME-BF-${randId}`;

        const backfillTx = {
          _id: new mongoose.Types.ObjectId().toString(),
          transactionId,
          user: student._id.toString(),
          type: 'WELCOME_CREDIT',
          credits: 20,
          balanceBefore: 0,
          balanceAfter: 20,
          referenceType: 'WELCOME',
          referenceId: 'WELCOME_STARTER_20CR',
          desc: 'Welcome Starter Credits',
          status: 'COMPLETED',
          expiresAt,
          createdAt,
          updatedAt: createdAt,
        };

        db.creditTransactions.push(backfillTx);
        backfilledCount++;
      }
    }

    if (backfilledCount > 0 && isInternal) {
      this.write(db);
    }

    return { backfilledCount, totalStudents: students.length };
  }

  // ── Applications ──────────────────────────────────────────────────────────
  async findApplications(query = {}) {
    const db = this.read();
    if (!Array.isArray(db.applications)) return [];
    let list = db.applications;

    if (query.user) {
      list = list.filter((a) => a.user?.toString() === query.user.toString());
    }

    if (query.stage && query.stage !== 'all') {
      list = list.filter((a) => a.stage?.toLowerCase() === query.stage.toLowerCase());
    }

    if (query.search) {
      const s = query.search.toLowerCase().trim();
      list = list.filter(
        (a) =>
          a.university?.toLowerCase().includes(s) ||
          a.program?.toLowerCase().includes(s) ||
          a.user?.name?.toLowerCase().includes(s) ||
          a.user?.email?.toLowerCase().includes(s)
      );
    }

    list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    return list.map((a) => {
      const u = typeof a.user === 'object' ? a.user : db.users.find((usr) => usr._id === a.user?.toString());
      return {
        ...a,
        user: u ? { _id: u._id, name: u.name, email: u.email, phone: u.phone, gpa: u.gpa, ielts: u.ielts } : null,
      };
    });
  }

  async findApplicationById(id) {
    if (!id) return null;
    const db = this.read();
    if (!Array.isArray(db.applications)) return null;
    const idStr = id.toString();
    const a = db.applications.find((app) => app._id === idStr);
    if (!a) return null;
    const u = typeof a.user === 'object' ? a.user : db.users.find((usr) => usr._id === a.user?.toString());
    return {
      ...a,
      user: u ? { _id: u._id, name: u.name, email: u.email, phone: u.phone, gpa: u.gpa, ielts: u.ielts } : null,
    };
  }

  async createApplication(data) {
    const db = this.read();
    if (!Array.isArray(db.applications)) db.applications = [];
    const newApp = {
      _id: new mongoose.Types.ObjectId().toString(),
      ...data,
      user: data.user?.toString(),
      stage: data.stage || 'Submitted',
      progress: data.progress || 25,
      steps: data.steps || [
        { label: 'Submitted', date: 'Today', status: 'completed' },
        { label: 'Documents Pending', date: 'In Progress', status: 'current' },
        { label: 'In Review', date: 'Pending', status: 'upcoming' },
        { label: 'Decision', date: 'Pending', status: 'upcoming' },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.applications.unshift(newApp);
    this.write(db);
    return newApp;
  }

  async updateApplication(id, updates) {
    const db = this.read();
    if (!Array.isArray(db.applications)) return null;
    const idStr = id.toString();
    const idx = db.applications.findIndex((a) => a._id === idStr);
    if (idx === -1) return null;

    db.applications[idx] = {
      ...db.applications[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.write(db);
    return db.applications[idx];
  }

  // ── Scholarships ──────────────────────────────────────────────────────────
  async findScholarships(query = {}) {
    const db = this.read();
    if (!Array.isArray(db.scholarships)) return [];
    let list = db.scholarships;

    if (query.country && query.country !== 'all') {
      list = list.filter((s) => (s.country || '').toLowerCase().includes(query.country.toLowerCase()));
    }

    if (query.search) {
      const s = query.search.toLowerCase().trim();
      list = list.filter(
        (item) =>
          item.name?.toLowerCase().includes(s) ||
          item.university?.toLowerCase().includes(s) ||
          item.country?.toLowerCase().includes(s)
      );
    }

    return list;
  }

  async findScholarshipById(id) {
    if (!id) return null;
    const db = this.read();
    if (!Array.isArray(db.scholarships)) return null;
    const idStr = id.toString();
    return db.scholarships.find((s) => s._id === idStr || s.id === idStr);
  }

  async createScholarship(data) {
    const db = this.read();
    if (!Array.isArray(db.scholarships)) db.scholarships = [];
    const newSch = {
      _id: new mongoose.Types.ObjectId().toString(),
      ...data,
      status: data.status || 'published',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.scholarships.unshift(newSch);
    this.write(db);
    return newSch;
  }

  async updateScholarship(id, updates) {
    const db = this.read();
    if (!Array.isArray(db.scholarships)) return null;
    const idStr = id.toString();
    const idx = db.scholarships.findIndex((s) => s._id === idStr || s.id === idStr);
    if (idx === -1) return null;

    db.scholarships[idx] = {
      ...db.scholarships[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.write(db);
    return db.scholarships[idx];
  }

  async deleteScholarship(id) {
    const db = this.read();
    if (!Array.isArray(db.scholarships)) return false;
    const idStr = id.toString();
    const idx = db.scholarships.findIndex((s) => s._id === idStr || s.id === idStr);
    if (idx === -1) return false;
    db.scholarships.splice(idx, 1);
    this.write(db);
    return true;
  }

  // ── Coupons ───────────────────────────────────────────────────────────────
  async findCoupons(query = {}) {
    const db = this.read();
    if (!Array.isArray(db.coupons)) return [];
    let list = db.coupons;

    if (query.isActive !== undefined) {
      const activeBool = query.isActive === 'true' || query.isActive === true;
      list = list.filter((c) => c.isActive === activeBool);
    }

    if (query.search) {
      const s = query.search.toUpperCase().trim();
      list = list.filter((c) => c.code?.includes(s));
    }

    return list;
  }

  async findCouponById(id) {
    if (!id) return null;
    const db = this.read();
    if (!Array.isArray(db.coupons)) return null;
    const idStr = id.toString();
    return db.coupons.find((c) => c._id === idStr || c.code === idStr.toUpperCase());
  }

  async createCoupon(data) {
    const db = this.read();
    if (!Array.isArray(db.coupons)) db.coupons = [];

    const existing = db.coupons.find((c) => c.code === data.code?.toUpperCase().trim());
    if (existing) {
      const err = new Error(`Coupon with code ${data.code} already exists.`);
      err.code = 11000;
      throw err;
    }

    const newCoupon = {
      _id: new mongoose.Types.ObjectId().toString(),
      code: data.code.toUpperCase().trim(),
      discountPercent: Number(data.discountPercent) || 10,
      applicablePackages: Array.isArray(data.applicablePackages) ? data.applicablePackages : ['all'],
      usageLimit: Number(data.usageLimit) || 100,
      usedCount: 0,
      perUserLimit: Number(data.perUserLimit) || 1,
      isActive: data.isActive !== undefined ? data.isActive : true,
      startDate: data.startDate || new Date().toISOString(),
      expiryDate: data.expiryDate || new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.coupons.unshift(newCoupon);
    this.write(db);
    return newCoupon;
  }

  async updateCoupon(id, updates) {
    const db = this.read();
    if (!Array.isArray(db.coupons)) return null;
    const idStr = id.toString();
    const idx = db.coupons.findIndex((c) => c._id === idStr || c.code === idStr.toUpperCase());
    if (idx === -1) return null;

    db.coupons[idx] = {
      ...db.coupons[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.write(db);
    return db.coupons[idx];
  }

  async deleteCoupon(id) {
    const db = this.read();
    if (!Array.isArray(db.coupons)) return false;
    const idStr = id.toString();
    const idx = db.coupons.findIndex((c) => c._id === idStr || c.code === idStr.toUpperCase());
    if (idx === -1) return false;
    db.coupons.splice(idx, 1);
    this.write(db);
    return true;
  }

  // ── Countries ─────────────────────────────────────────────────────────────
  async findCountries(query = {}) {
    const db = this.read();
    if (!Array.isArray(db.countries)) return [];
    let list = db.countries;

    if (query.status && query.status !== 'all') {
      list = list.filter((c) => c.status === query.status);
    }

    if (query.search) {
      const s = query.search.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.name?.toLowerCase().includes(s) ||
          c.code?.toLowerCase().includes(s) ||
          c.region?.toLowerCase().includes(s)
      );
    }

    return list;
  }

  async findCountryById(id) {
    if (!id) return null;
    const db = this.read();
    if (!Array.isArray(db.countries)) return null;
    const idStr = id.toString();
    return db.countries.find((c) => c._id === idStr || c.code === idStr.toUpperCase() || c.name.toLowerCase() === idStr.toLowerCase());
  }

  async createCountry(data) {
    const db = this.read();
    if (!Array.isArray(db.countries)) db.countries = [];

    const existing = db.countries.find(
      (c) =>
        c.code === data.code?.toUpperCase().trim() ||
        c.name.toLowerCase() === data.name?.toLowerCase().trim()
    );
    if (existing) {
      const err = new Error(`Country ${data.name} (${data.code}) already exists.`);
      err.code = 11000;
      throw err;
    }

    const newCountry = {
      _id: new mongoose.Types.ObjectId().toString(),
      name: data.name,
      code: data.code.toUpperCase().trim(),
      flag: data.flag || '🌐',
      region: data.region || 'Global',
      currency: data.currency || 'USD',
      avgTuition: data.avgTuition || '$15,000 - $35,000 / year',
      avgLivingCost: data.avgLivingCost || '$800 - $1,500 / month',
      visaInfo: data.visaInfo || 'Student visa with proof of funds.',
      englishRequirements: data.englishRequirements || 'IELTS 6.5+',
      studyLevels: Array.isArray(data.studyLevels) ? data.studyLevels : ['Bachelor', 'Master', 'PhD'],
      popularPrograms: Array.isArray(data.popularPrograms) ? data.popularPrograms : ['Computer Science', 'Business'],
      description: data.description || '',
      status: data.status || 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.countries.unshift(newCountry);
    this.write(db);
    return newCountry;
  }

  async updateCountry(id, updates) {
    const db = this.read();
    if (!Array.isArray(db.countries)) return null;
    const idStr = id.toString();
    const idx = db.countries.findIndex((c) => c._id === idStr || c.code === idStr.toUpperCase());
    if (idx === -1) return null;

    db.countries[idx] = {
      ...db.countries[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.write(db);
    return db.countries[idx];
  }

  async deleteCountry(id) {
    const db = this.read();
    if (!Array.isArray(db.countries)) return false;
    const idStr = id.toString();
    const idx = db.countries.findIndex((c) => c._id === idStr || c.code === idStr.toUpperCase());
    if (idx === -1) return false;
    db.countries.splice(idx, 1);
    this.write(db);
    return true;
  }

  // ── Reports & Complaints ──────────────────────────────────────────────────
  async findReports(query = {}) {
    const db = this.read();
    if (!Array.isArray(db.reports)) return [];
    let list = db.reports;

    if (query.status && query.status !== 'all') {
      list = list.filter((r) => r.status === query.status);
    }

    if (query.priority && query.priority !== 'all') {
      list = list.filter((r) => r.priority === query.priority);
    }

    if (query.targetType && query.targetType !== 'all') {
      list = list.filter((r) => r.targetType === query.targetType);
    }

    if (query.search) {
      const s = query.search.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.reportId?.toLowerCase().includes(s) ||
          r.title?.toLowerCase().includes(s) ||
          r.description?.toLowerCase().includes(s) ||
          r.reporterName?.toLowerCase().includes(s) ||
          r.reporterEmail?.toLowerCase().includes(s) ||
          r.targetName?.toLowerCase().includes(s)
      );
    }

    list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return list;
  }

  async findReportById(id) {
    if (!id) return null;
    const db = this.read();
    if (!Array.isArray(db.reports)) return null;
    const idStr = id.toString();
    return db.reports.find((r) => r._id === idStr || r.reportId === idStr);
  }

  async createReport(data) {
    const db = this.read();
    if (!Array.isArray(db.reports)) db.reports = [];

    const newReport = {
      _id: new mongoose.Types.ObjectId().toString(),
      reportId: `ADM-REP-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`,
      ...data,
      reportedBy: data.reportedBy?.toString(),
      status: data.status || 'PENDING',
      priority: data.priority || 'MEDIUM',
      statusHistory: [
        {
          status: 'PENDING',
          changedAt: new Date().toISOString(),
          changedBy: data.reportedBy?.toString(),
          note: 'Report submitted.',
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.reports.unshift(newReport);
    this.write(db);
    return newReport;
  }

  async updateReport(id, updates) {
    const db = this.read();
    if (!Array.isArray(db.reports)) return null;
    const idStr = id.toString();
    const idx = db.reports.findIndex((r) => r._id === idStr || r.reportId === idStr);
    if (idx === -1) return null;

    db.reports[idx] = {
      ...db.reports[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.write(db);
    return db.reports[idx];
  }

  // ── Audit Logs ────────────────────────────────────────────────────────────
  async findAuditLogs(query = {}) {
    const db = this.read();
    if (!Array.isArray(db.auditLogs)) return [];
    let list = db.auditLogs;

    if (query.module && query.module !== 'all') {
      list = list.filter((l) => l.module === query.module);
    }

    if (query.action && query.action !== 'all') {
      list = list.filter((l) => l.action === query.action);
    }

    if (query.search) {
      const s = query.search.toLowerCase().trim();
      list = list.filter(
        (l) =>
          l.adminName?.toLowerCase().includes(s) ||
          l.adminEmail?.toLowerCase().includes(s) ||
          l.action?.toLowerCase().includes(s) ||
          l.targetName?.toLowerCase().includes(s) ||
          l.targetId?.toLowerCase().includes(s) ||
          l.reason?.toLowerCase().includes(s)
      );
    }

    list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return list;
  }

  async createAuditLog(data) {
    const db = this.read();
    if (!Array.isArray(db.auditLogs)) db.auditLogs = [];

    const newLog = {
      _id: new mongoose.Types.ObjectId().toString(),
      ...data,
      adminId: data.adminId?.toString(),
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.auditLogs.unshift(newLog);
    this.write(db);
    return newLog;
  }

  // ── Platform Settings ─────────────────────────────────────────────────────
  async getPlatformSettings() {
    const db = this.read();
    return db.platformSettings || DEFAULT_PLATFORM_SETTINGS;
  }

  async updatePlatformSettingCategory(category, data, updatedBy) {
    const db = this.read();
    if (!db.platformSettings) db.platformSettings = { ...DEFAULT_PLATFORM_SETTINGS };

    db.platformSettings[category] = {
      ...db.platformSettings[category],
      ...data,
    };

    this.write(db);
    return db.platformSettings;
  }

  // ── Chat Messages / Support Inbox ─────────────────────────────────────────
  async findChatSessions() {
    const db = this.read();
    if (!Array.isArray(db.chatMessages)) return [];

    const sessionMap = new Map();
    for (const msg of db.chatMessages) {
      if (!sessionMap.has(msg.sessionId)) {
        const u = msg.user ? db.users.find((usr) => usr._id === msg.user.toString()) : null;
        sessionMap.set(msg.sessionId, {
          sessionId: msg.sessionId,
          user: u ? { _id: u._id, name: u.name, email: u.email, role: u.role } : null,
          lastMessage: msg.text,
          lastSender: msg.sender,
          isLiveAgentRequest: msg.isLiveAgentRequest || false,
          status: msg.status || 'active',
          updatedAt: msg.createdAt,
          messageCount: 1,
        });
      } else {
        const item = sessionMap.get(msg.sessionId);
        item.messageCount += 1;
        if (msg.isLiveAgentRequest) item.isLiveAgentRequest = true;
        if (new Date(msg.createdAt) > new Date(item.updatedAt)) {
          item.lastMessage = msg.text;
          item.lastSender = msg.sender;
          item.updatedAt = msg.createdAt;
        }
      }
    }

    const sessions = Array.from(sessionMap.values());
    sessions.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    return sessions;
  }

  async findChatMessagesBySession(sessionId) {
    const db = this.read();
    if (!Array.isArray(db.chatMessages)) return [];
    const list = db.chatMessages.filter((m) => m.sessionId === sessionId);
    list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    return list;
  }

  async addChatMessage(data) {
    const db = this.read();
    if (!Array.isArray(db.chatMessages)) db.chatMessages = [];
    const newMsg = {
      _id: new mongoose.Types.ObjectId().toString(),
      isSeenByStudent: data.sender === 'user' ? true : Boolean(data.isSeenByStudent),
      ...data,
      user: data.user?.toString(),
      senderId: data.senderId?.toString() || data.user?.toString(),
      receiverId: data.receiverId?.toString() || data.receiver?.toString(),
      receiver: data.receiverId?.toString() || data.receiver?.toString(),
      createdAt: data.createdAt ? new Date(data.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.chatMessages.push(newMsg);
    this.write(db);
    return newMsg;
  }

  async findConversations(userId) {
    const db = this.read();
    if (!Array.isArray(db.conversations)) return [];
    const uidStr = userId.toString();
    return db.conversations.filter((c) =>
      (c.participants || []).some((p) => (p.user?._id || p.user)?.toString() === uidStr)
    );
  }

  async findConversationByParticipantKey(key) {
    const db = this.read();
    if (!Array.isArray(db.conversations)) return null;
    return db.conversations.find((c) => c.participantKey === key) || null;
  }

  // ── Applications ───────────────────────────────────────────────────────────
  async findApplications(query = {}) {
    const db = this.read();
    let list = Array.isArray(db.applications) ? [...db.applications] : [];
    if (query.user) {
      list = list.filter((a) => a.user?.toString() === query.user.toString());
    }
    if (query.assignedAgency) {
      list = list.filter((a) => a.assignedAgency?.toString() === query.assignedAgency.toString());
    }
    if (query.assignedAgent) {
      list = list.filter((a) => a.assignedAgent?.toString() === query.assignedAgent.toString());
    }
    if (query.stage && query.stage !== 'all') {
      list = list.filter((a) => a.stage?.toLowerCase() === query.stage.toLowerCase());
    }
    return list;
  }

  async findApplicationById(id) {
    if (!id) return null;
    const db = this.read();
    const idStr = id.toString();
    return (db.applications || []).find((a) => a._id === idStr || a.applicationId === idStr) || null;
  }

  async createApplication(data) {
    const db = this.read();
    if (!Array.isArray(db.applications)) db.applications = [];
    const newApp = {
      _id: new mongoose.Types.ObjectId().toString(),
      applicationId: data.applicationId || `APP-${Date.now().toString(36).toUpperCase()}`,
      stage: 'Submitted',
      progress: 25,
      steps: [
        { label: 'Application Submitted', date: new Date().toLocaleDateString(), status: 'completed' },
        { label: 'Document Verification', date: 'Pending', status: 'current' },
        { label: 'University Processing', date: 'Upcoming', status: 'upcoming' },
        { label: 'Offer Decision', date: 'Upcoming', status: 'upcoming' },
      ],
      ...data,
      user: data.user?.toString(),
      assignedAgency: data.assignedAgency?.toString() || null,
      assignedAgent: data.assignedAgent?.toString() || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.applications.unshift(newApp);
    this.write(db);
    return newApp;
  }

  async updateApplication(id, updates) {
    const db = this.read();
    if (!Array.isArray(db.applications)) return null;
    const idx = db.applications.findIndex((a) => a._id === id.toString() || a.applicationId === id.toString());
    if (idx === -1) return null;

    db.applications[idx] = {
      ...db.applications[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.write(db);
    return db.applications[idx];
  }

  // ── Agency Service Orders ──────────────────────────────────────────────────
  async findAgencyServiceOrders(query = {}) {
    const db = this.read();
    let list = Array.isArray(db.agencyServiceOrders) ? [...db.agencyServiceOrders] : [];
    if (query.user) {
      list = list.filter((o) => o.user?.toString() === query.user.toString());
    }
    if (query.agencyId) {
      list = list.filter((o) => o.assignedAgency?.agencyId?.toString() === query.agencyId.toString());
    }
    if (query.status && query.status !== 'all') {
      list = list.filter((o) => o.status === query.status);
    }
    return list;
  }

  async findAgencyServiceOrderById(id) {
    if (!id) return null;
    const db = this.read();
    const idStr = id.toString();
    return (db.agencyServiceOrders || []).find((o) => o._id === idStr || o.orderId === idStr) || null;
  }

  async createAgencyServiceOrder(data) {
    const db = this.read();
    if (!Array.isArray(db.agencyServiceOrders)) db.agencyServiceOrders = [];
    const newOrder = {
      _id: new mongoose.Types.ObjectId().toString(),
      orderId: data.orderId || `ADM-AGY-${Date.now().toString(36).toUpperCase()}`,
      status: 'ACTIVE',
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.agencyServiceOrders.unshift(newOrder);
    this.write(db);
    return newOrder;
  }

  async updateAgencyServiceOrder(id, updates) {
    const db = this.read();
    if (!Array.isArray(db.agencyServiceOrders)) return null;
    const idx = db.agencyServiceOrders.findIndex((o) => o._id === id.toString() || o.orderId === id.toString());
    if (idx === -1) return null;

    db.agencyServiceOrders[idx] = {
      ...db.agencyServiceOrders[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.write(db);
    return db.agencyServiceOrders[idx];
  }

  async deleteAgencyConnection(id) {
    const db = this.read();
    if (!Array.isArray(db.universityAgencyConnections)) return false;
    const idx = db.universityAgencyConnections.findIndex((c) => c._id === id.toString());
    if (idx === -1) return false;
    db.universityAgencyConnections.splice(idx, 1);
    this.write(db);
    return true;
  }

  // ── Agent Tasks ─────────────────────────────────────────────────────────────
  async findTasks(filter = {}) {
    const db = this.read();
    if (!Array.isArray(db.tasks)) return [];
    let list = db.tasks;
    if (filter.agent) {
      list = list.filter((t) => t.agent?.toString() === filter.agent.toString());
    }
    if (filter.status && filter.status !== 'all') {
      list = list.filter((t) => t.status === filter.status);
    }
    return list;
  }

  async findTaskById(id) {
    const db = this.read();
    if (!Array.isArray(db.tasks)) return null;
    return db.tasks.find((t) => t._id === id.toString()) || null;
  }

  async createTask(data) {
    const db = this.read();
    if (!Array.isArray(db.tasks)) db.tasks = [];
    const newTask = {
      _id: new mongoose.Types.ObjectId().toString(),
      status: 'PENDING',
      priority: 'MEDIUM',
      ...data,
      agent: data.agent?.toString(),
      agency: data.agency?.toString(),
      student: data.student ? data.student.toString() : null,
      application: data.application ? data.application.toString() : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.tasks.unshift(newTask);
    this.write(db);
    return newTask;
  }

  async updateTask(id, updates) {
    const db = this.read();
    if (!Array.isArray(db.tasks)) return null;
    const idx = db.tasks.findIndex((t) => t._id === id.toString());
    if (idx === -1) return null;
    db.tasks[idx] = {
      ...db.tasks[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.write(db);
    return db.tasks[idx];
  }

  async deleteTask(id) {
    const db = this.read();
    if (!Array.isArray(db.tasks)) return false;
    const idx = db.tasks.findIndex((t) => t._id === id.toString());
    if (idx === -1) return false;
    db.tasks.splice(idx, 1);
    this.write(db);
    return true;
  }

  // ── Announcements ──────────────────────────────────────────────────────────
  async findAnnouncements(query = {}) {
    const db = this.read();
    if (!Array.isArray(db.announcements)) return [];
    let list = [...db.announcements];
    if (query.university) {
      list = list.filter((a) => a.university?.toString() === query.university.toString());
    }
    if (query.status && query.status !== 'all') {
      list = list.filter((a) => a.status === query.status);
    }
    return list;
  }

  async findAnnouncementById(id) {
    const db = this.read();
    if (!Array.isArray(db.announcements)) return null;
    return db.announcements.find((a) => a._id === id.toString()) || null;
  }

  async createAnnouncement(data) {
    const db = this.read();
    if (!Array.isArray(db.announcements)) db.announcements = [];
    const newAnn = {
      _id: new mongoose.Types.ObjectId().toString(),
      status: 'ACTIVE',
      ...data,
      university: data.university?.toString(),
      universityRepresentative: data.universityRepresentative?.toString(),
      publishDate: data.publishDate || new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.announcements.unshift(newAnn);
    this.write(db);
    return newAnn;
  }

  async updateAnnouncement(id, updates) {
    const db = this.read();
    if (!Array.isArray(db.announcements)) return null;
    const idx = db.announcements.findIndex((a) => a._id === id.toString());
    if (idx === -1) return null;
    db.announcements[idx] = {
      ...db.announcements[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.write(db);
    return db.announcements[idx];
  }

  async deleteAnnouncement(id) {
    const db = this.read();
    if (!Array.isArray(db.announcements)) return false;
    const idx = db.announcements.findIndex((a) => a._id === id.toString());
    if (idx === -1) return false;
    db.announcements.splice(idx, 1);
    this.write(db);
    return true;
  }

  // ── Scholarships ───────────────────────────────────────────────────────────
  async findScholarships(query = {}) {
    const db = this.read();
    if (!Array.isArray(db.scholarships)) return [];
    let list = [...db.scholarships];
    if (query.universityId) {
      list = list.filter((s) => s.universityId?.toString() === query.universityId.toString());
    }
    if (query.type && query.type !== 'all') {
      list = list.filter((s) => s.type === query.type);
    }
    return list;
  }

  async findScholarshipById(id) {
    const db = this.read();
    if (!Array.isArray(db.scholarships)) return null;
    return db.scholarships.find((s) => s._id === id.toString()) || null;
  }

  async createScholarship(data) {
    const db = this.read();
    if (!Array.isArray(db.scholarships)) db.scholarships = [];
    const newSch = {
      _id: new mongoose.Types.ObjectId().toString(),
      status: 'Eligible',
      coverage: 'Partial Tuition',
      ...data,
      universityId: data.universityId?.toString() || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.scholarships.unshift(newSch);
    this.write(db);
    return newSch;
  }

  async updateScholarship(id, updates) {
    const db = this.read();
    if (!Array.isArray(db.scholarships)) return null;
    const idx = db.scholarships.findIndex((s) => s._id === id.toString());
    if (idx === -1) return null;
    db.scholarships[idx] = {
      ...db.scholarships[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.write(db);
    return db.scholarships[idx];
  }

  async deleteScholarship(id) {
    const db = this.read();
    if (!Array.isArray(db.scholarships)) return false;
    const idx = db.scholarships.findIndex((s) => s._id === id.toString());
    if (idx === -1) return false;
    db.scholarships.splice(idx, 1);
    this.write(db);
    return true;
  }

  // ── Admin Seen Tracking Methods ───────────────────────────────────────────
  async isEntitySeen(entityType, entityId) {
    if (!entityType || !entityId) return false;
    const db = this.read();
    const items = db.adminSeenItems || [];
    const idStr = entityId.toString();
    return items.some(
      (item) => item.entityType === entityType && item.entityId === idStr
    );
  }

  async markEntitySeen(entityType, entityId, adminId = null) {
    if (!entityType || !entityId) return false;
    const db = this.read();
    db.adminSeenItems = db.adminSeenItems || [];
    const idStr = entityId.toString();
    const nowIso = new Date().toISOString();

    const existing = db.adminSeenItems.find(
      (item) => item.entityType === entityType && item.entityId === idStr
    );
    if (!existing) {
      db.adminSeenItems.push({
        _id: new mongoose.Types.ObjectId().toString(),
        entityType,
        entityId: idStr,
        admin: adminId ? adminId.toString() : null,
        seenAt: nowIso,
        createdAt: nowIso,
      });
    }

    const collectionMap = {
      agencies: 'agencyProfiles',
      agency: 'agencyProfiles',
      agents: 'agentApplications',
      agent: 'agentApplications',
      agent_application: 'agentApplications',
      agent_user: 'users',
      uniRepresentatives: 'universityRepApplications',
      university_rep: 'universityRepApplications',
      applications: 'applications',
      application: 'applications',
      partnerships: 'universityAgencyConnections',
      partnership: 'universityAgencyConnections',
      payments: 'paymentOrders',
      payment: 'paymentOrders',
      scholarships: 'scholarships',
      scholarship: 'scholarships',
      reports: 'reports',
      report: 'reports',
      support: 'chatMessages',
      supportInbox: 'chatMessages',
    };

    const collName = collectionMap[entityType];
    if (collName && Array.isArray(db[collName])) {
      if (collName === 'chatMessages') {
        for (const msg of db.chatMessages) {
          if (msg.sessionId === idStr || msg._id === idStr) {
            msg.isSeenByAdmin = true;
            msg.adminSeenAt = nowIso;
          }
        }
      } else {
        const doc = db[collName].find((d) => d._id === idStr || d.id === idStr || d.applicationId === idStr || d.orderId === idStr || d.reportId === idStr);
        if (doc) {
          doc.isSeenByAdmin = true;
          doc.adminSeenAt = nowIso;
        }
      }
    }

    // Automatically mark any matching notification as read
    if (Array.isArray(db.notifications)) {
      for (const n of db.notifications) {
        if (
          n.relatedEntityId === idStr ||
          (n.relatedEntityType && n.relatedEntityType.toLowerCase() === entityType.toLowerCase() && n.link?.includes(idStr))
        ) {
          n.read = true;
        }
      }
    }

    this.write(db);
    return true;
  }

  // ── Student Seen Tracking Methods ─────────────────────────────────────────
  async isStudentEntitySeen(userId, entityType, entityId) {
    if (!userId || !entityType || !entityId) return false;
    const db = this.read();
    const items = db.studentSeenItems || [];
    const uidStr = userId.toString();
    const idStr = entityId.toString();
    return items.some(
      (item) => item.user === uidStr && item.entityType === entityType && item.entityId === idStr
    );
  }

  async markStudentEntitySeen(userId, entityType, entityId) {
    if (!userId || !entityType || !entityId) return false;
    const db = this.read();
    db.studentSeenItems = db.studentSeenItems || [];
    const uidStr = userId.toString();
    const idStr = entityId.toString();
    const nowIso = new Date().toISOString();

    const existing = db.studentSeenItems.find(
      (item) => item.user === uidStr && item.entityType === entityType && item.entityId === idStr
    );
    if (!existing) {
      db.studentSeenItems.push({
        _id: new mongoose.Types.ObjectId().toString(),
        user: uidStr,
        entityType,
        entityId: idStr,
        seenAt: nowIso,
        createdAt: nowIso,
      });
    }

    const collectionMap = {
      applications: 'applications',
      application: 'applications',
      direct_application: 'applications',
      directApplications: 'applications',
      agency_order: 'agencyServiceOrders',
      agency_service_order: 'agencyServiceOrders',
      agencyAssistance: 'agencyServiceOrders',
      reports: 'reports',
      report: 'reports',
      support: 'chatMessages',
      message: 'chatMessages',
      chat_message: 'chatMessages',
      messages: 'chatMessages',
      scholarships: 'scholarships',
      scholarship: 'scholarships',
      notifications: 'notifications',
      notification: 'notifications',
    };

    const collName = collectionMap[entityType];
    if (collName && Array.isArray(db[collName])) {
      if (collName === 'chatMessages') {
        for (const msg of db.chatMessages) {
          if ((msg.sessionId === idStr || msg._id === idStr) && (msg.user?.toString() === uidStr || !msg.user)) {
            msg.isSeenByStudent = true;
            msg.studentSeenAt = nowIso;
          }
        }
      } else {
        const doc = db[collName].find(
          (d) =>
            (d._id === idStr || d.id === idStr || d.applicationId === idStr || d.orderId === idStr || d.reportId === idStr) &&
            (d.user?.toString() === uidStr || d.reportedBy?.toString() === uidStr || !d.user)
        );
        if (doc) {
          doc.isSeenByStudent = true;
          doc.studentSeenAt = nowIso;
        }
      }
    }

    // Automatically mark any matching student notification as read
    if (Array.isArray(db.notifications)) {
      for (const n of db.notifications) {
        const notifUserId = (n.user || n.userId)?.toString();
        if (notifUserId === uidStr) {
          if (
            n.relatedEntityId === idStr ||
            (n.relatedEntityType && n.relatedEntityType.toLowerCase() === entityType.toLowerCase() && n.link?.includes(idStr))
          ) {
            n.read = true;
          }
        }
      }
    }

    this.write(db);
    return true;
  }

  // ── Agent Seen Tracking Methods ───────────────────────────────────────────
  async isAgentEntitySeen(agentId, entityType, entityId) {
    if (!agentId || !entityType || !entityId) return false;
    const db = this.read();
    const items = db.agentSeenItems || [];
    const aidStr = agentId.toString();
    const idStr = entityId.toString();
    return items.some(
      (item) => (item.agent === aidStr || item.user === aidStr) && item.entityType === entityType && item.entityId === idStr
    );
  }

  async markAgentEntitySeen(agentId, entityType, entityId) {
    if (!agentId || !entityType || !entityId) return false;
    const db = this.read();
    db.agentSeenItems = db.agentSeenItems || [];
    const aidStr = agentId.toString();
    const idStr = entityId.toString();
    const nowIso = new Date().toISOString();

    const existing = db.agentSeenItems.find(
      (item) => (item.agent === aidStr || item.user === aidStr) && item.entityType === entityType && item.entityId === idStr
    );
    if (!existing) {
      db.agentSeenItems.push({
        _id: new mongoose.Types.ObjectId().toString(),
        agent: aidStr,
        user: aidStr,
        entityType,
        entityId: idStr,
        seenAt: nowIso,
        createdAt: nowIso,
      });
    }

    const collectionMap = {
      applications: 'applications',
      application: 'applications',
      tasks: 'tasks',
      task: 'tasks',
      reports: 'reports',
      report: 'reports',
      support: 'chatMessages',
      message: 'chatMessages',
      chat_message: 'chatMessages',
      messages: 'chatMessages',
      notifications: 'notifications',
      notification: 'notifications',
      students: 'users',
      student: 'users',
    };

    const collName = collectionMap[entityType];
    if (collName && Array.isArray(db[collName])) {
      if (collName === 'chatMessages') {
        for (const msg of db.chatMessages) {
          if (
            (msg.sessionId === idStr || msg._id === idStr) &&
            (msg.receiver?.toString() === aidStr || msg.user?.toString() === aidStr)
          ) {
            msg.isSeenByAgent = true;
            msg.agentSeenAt = nowIso;
          }
        }
      } else {
        const doc = db[collName].find(
          (d) =>
            (d._id === idStr || d.id === idStr || d.applicationId === idStr || d.reportId === idStr || d.taskId === idStr)
        );
        if (doc) {
          doc.isSeenByAgent = true;
          doc.agentSeenAt = nowIso;
        }
      }
    }

    // Automatically mark matching agent notification as read
    if (Array.isArray(db.notifications)) {
      for (const n of db.notifications) {
        const notifUserId = (n.user || n.userId)?.toString();
        if (notifUserId === aidStr) {
          if (
            n.relatedEntityId === idStr ||
            (n.relatedEntityType && n.relatedEntityType.toLowerCase() === entityType.toLowerCase() && n.link?.includes(idStr))
          ) {
            n.read = true;
          }
        }
      }
    }

    this.write(db);
    return true;
  }

  // ── Agency Seen Tracking Methods ──────────────────────────────────────────
  async isAgencyEntitySeen(agencyId, entityType, entityId) {
    if (!agencyId || !entityType || !entityId) return false;
    const db = this.read();
    const items = db.agencySeenItems || [];
    const aidStr = agencyId.toString();
    const idStr = entityId.toString();
    return items.some(
      (item) => (item.agency === aidStr || item.user === aidStr) && item.entityType === entityType && item.entityId === idStr
    );
  }

  async markAgencyEntitySeen(agencyId, entityType, entityId) {
    if (!agencyId || !entityType || !entityId) return false;
    const db = this.read();
    db.agencySeenItems = db.agencySeenItems || [];
    const aidStr = agencyId.toString();
    const idStr = entityId.toString();
    const nowIso = new Date().toISOString();

    const existing = db.agencySeenItems.find(
      (item) => (item.agency === aidStr || item.user === aidStr) && item.entityType === entityType && item.entityId === idStr
    );
    if (!existing) {
      db.agencySeenItems.push({
        _id: new mongoose.Types.ObjectId().toString(),
        agency: aidStr,
        user: aidStr,
        entityType,
        entityId: idStr,
        seenAt: nowIso,
        createdAt: nowIso,
      });
    }

    const collectionMap = {
      applications: 'applications',
      application: 'applications',
      serviceRequests: 'agencyServiceOrders',
      serviceRequest: 'agencyServiceOrders',
      service_request: 'agencyServiceOrders',
      serviceOrders: 'agencyServiceOrders',
      serviceOrder: 'agencyServiceOrders',
      agents: 'users',
      agent: 'users',
      agentApplications: 'agentApplications',
      agentApplication: 'agentApplications',
      students: 'users',
      student: 'users',
      universityPartnerships: 'universityAgencyConnections',
      universityPartnership: 'universityAgencyConnections',
      partnerships: 'universityAgencyConnections',
      partnership: 'universityAgencyConnections',
      university_connection: 'universityAgencyConnections',
      university_connections: 'universityAgencyConnections',
      messages: 'chatMessages',
      message: 'chatMessages',
      chatMessages: 'chatMessages',
      chat_message: 'chatMessages',
      reports: 'reports',
      report: 'reports',
      notifications: 'notifications',
      notification: 'notifications',
    };

    const collName = collectionMap[entityType];
    if (collName && Array.isArray(db[collName])) {
      if (collName === 'chatMessages') {
        for (const msg of db.chatMessages) {
          if (
            (msg.sessionId === idStr || msg._id === idStr) &&
            (msg.receiver?.toString() === aidStr || msg.user?.toString() === aidStr)
          ) {
            msg.isSeenByAgency = true;
            msg.agencySeenAt = nowIso;
          }
        }
      } else {
        const doc = db[collName].find(
          (d) =>
            (d._id === idStr || d.id === idStr || d.applicationId === idStr || d.orderId === idStr || d.reportId === idStr)
        );
        if (doc) {
          doc.isSeenByAgency = true;
          doc.agencySeenAt = nowIso;
        }
      }
    }

    // Automatically mark matching agency notification as read
    if (Array.isArray(db.notifications)) {
      for (const n of db.notifications) {
        const notifUserId = (n.user || n.userId)?.toString();
        if (notifUserId === aidStr) {
          if (
            n.relatedEntityId === idStr ||
            (n.relatedEntityType && n.relatedEntityType.toLowerCase() === entityType.toLowerCase() && n.link?.includes(idStr))
          ) {
            n.read = true;
          }
        }
      }
    }

    this.write(db);
    return true;
  }

  async isUniRepEntitySeen(repId, entityType, entityId) {
    if (!repId || !entityType || !entityId) return false;
    const db = this.read();
    const items = db.uniRepSeenItems || [];
    const ridStr = repId.toString();
    const idStr = entityId.toString();
    return items.some(
      (item) => (item.universityRep === ridStr || item.user === ridStr) && item.entityType === entityType && item.entityId === idStr
    );
  }

  async markUniRepEntitySeen(repId, entityType, entityId) {
    if (!repId || !entityType || !entityId) return false;
    const db = this.read();
    db.uniRepSeenItems = db.uniRepSeenItems || [];
    const ridStr = repId.toString();
    const idStr = entityId.toString();
    const nowIso = new Date().toISOString();

    const existing = db.uniRepSeenItems.find(
      (item) => (item.universityRep === ridStr || item.user === ridStr) && item.entityType === entityType && item.entityId === idStr
    );
    if (!existing) {
      db.uniRepSeenItems.push({
        _id: new mongoose.Types.ObjectId().toString(),
        universityRep: ridStr,
        user: ridStr,
        entityType,
        entityId: idStr,
        seenAt: nowIso,
        createdAt: nowIso,
      });
    }

    const collectionMap = {
      applications: 'applications',
      application: 'applications',
      partnerships: 'universityAgencyConnections',
      partnership: 'universityAgencyConnections',
      universityAgencyConnections: 'universityAgencyConnections',
      messages: 'chatMessages',
      message: 'chatMessages',
      chatMessages: 'chatMessages',
      reports: 'reports',
      report: 'reports',
      notifications: 'notifications',
      notification: 'notifications',
    };

    const collName = collectionMap[entityType];
    if (collName && Array.isArray(db[collName])) {
      if (collName === 'chatMessages') {
        for (const msg of db.chatMessages) {
          if (
            (msg.sessionId === idStr || msg._id === idStr) &&
            (msg.receiver?.toString() === ridStr || msg.user?.toString() === ridStr)
          ) {
            msg.isSeenByUniRep = true;
            msg.uniRepSeenAt = nowIso;
          }
        }
      } else {
        const doc = db[collName].find(
          (d) =>
            (d._id === idStr || d.id === idStr || d.applicationId === idStr || d.reportId === idStr)
        );
        if (doc) {
          doc.isSeenByUniRep = true;
          doc.uniRepSeenAt = nowIso;
        }
      }
    }

    // Automatically mark matching university rep notification as read
    if (Array.isArray(db.notifications)) {
      for (const n of db.notifications) {
        const notifUserId = (n.user || n.userId)?.toString();
        if (notifUserId === ridStr) {
          if (
            n.relatedEntityId === idStr ||
            (n.relatedEntityType && n.relatedEntityType.toLowerCase() === entityType.toLowerCase() && n.link?.includes(idStr))
          ) {
            n.read = true;
          }
        }
      }
    }

    this.write(db);
    return true;
  }
}


export const devStore = new DevStore();
export default devStore;
