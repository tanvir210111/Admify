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
    announcements: [],
  };
};

class DevStore {
  constructor() {
    this.ensureDbFile();
  }

  ensureDbFile() {
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

        if (modified) {
          fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
        }
      } catch (err) {
        console.error('[DevStore ensureDbFile sync error]', err);
      }
    }
  }

  read() {
    try {
      this.ensureDbFile();
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(raw);
    } catch {
      return getInitialData();
    }
  }

  write(data) {
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
      walletCredits: userData.walletCredits || 20,
      freeCredits: userData.freeCredits || 20,
      paidCredits: 0,
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
    user.toJSON = () => {
      const copy = { ...user };
      delete copy.password;
      delete copy.activationTokenHash;
      const isPendingRole =
        copy.role === 'agency' ||
        copy.role === 'university_rep' ||
        copy.role === 'university' ||
        copy.role === 'university representative';
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
    return db.agencyProfiles.find((p) => p.user?.toString() === idStr) || null;
  }

  async findAgencyProfileById(id) {
    if (!id) return null;
    const db = this.read();
    const idStr = id.toString();
    return db.agencyProfiles.find((p) => p._id === idStr) || null;
  }

  async findAgencyProfileByApplicationId(applicationId) {
    if (!applicationId) return null;
    const db = this.read();
    return db.agencyProfiles.find((p) => p.applicationId === applicationId) || null;
  }

  async findAgencyProfiles(query = {}) {
    const db = this.read();
    let list = db.agencyProfiles || [];
    if (query.verificationStatus) {
      list = list.filter((p) => p.verificationStatus === query.verificationStatus);
    }
    // populate user
    return list.map((p) => {
      const user = db.users.find((u) => u._id === p.user?.toString());
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
            }
          : null,
      };
    });
  }

  async saveAgencyProfile(profileData) {
    const db = this.read();
    let existingIndex = -1;

    if (profileData._id) {
      existingIndex = db.agencyProfiles.findIndex((p) => p._id === profileData._id);
    } else if (profileData.user) {
      existingIndex = db.agencyProfiles.findIndex((p) => p.user?.toString() === profileData.user.toString());
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

  async findUniRepApplications(filter = {}) {
    const db = this.read();
    if (!Array.isArray(db.universityRepApplications)) return [];
    return db.universityRepApplications.filter((app) => {
      if (filter.status && app.status !== filter.status) return false;
      if (filter.user && app.user !== filter.user.toString()) return false;
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
      list = list.filter((tx) => tx.user?.toString() === query.user.toString());
    }

    if (query.type && query.type !== 'all') {
      list = list.filter((tx) => tx.type === query.type);
    }

    if (query.search) {
      const s = query.search.toLowerCase().trim();
      list = list.filter(
        (tx) =>
          tx.transactionId?.toLowerCase().includes(s) ||
          tx.desc?.toLowerCase().includes(s) ||
          tx.referenceId?.toLowerCase().includes(s)
      );
    }

    list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    // populate user
    return list.map((tx) => {
      const u = typeof tx.user === 'object' ? tx.user : db.users.find((usr) => usr._id === tx.user?.toString());
      return {
        ...tx,
        user: u ? { _id: u._id, name: u.name, email: u.email } : null,
      };
    });
  }

  async createCreditTransaction(data) {
    const db = this.read();
    if (!Array.isArray(db.creditTransactions)) db.creditTransactions = [];
    const newTx = {
      _id: new mongoose.Types.ObjectId().toString(),
      transactionId: data.transactionId || `CTX-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      ...data,
      user: data.user?.toString(),
      status: data.status || 'COMPLETED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.creditTransactions.unshift(newTx);
    this.write(db);
    return newTx;
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
      ...data,
      user: data.user?.toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.chatMessages.push(newMsg);
    this.write(db);
    return newMsg;
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
}


export const devStore = new DevStore();
export default devStore;
