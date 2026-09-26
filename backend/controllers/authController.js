import mongoose from 'mongoose';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import AgencyProfile from '../models/AgencyProfile.js';
import AgentApplication from '../models/AgentApplication.js';
import UniversityRepresentativeApplication from '../models/UniversityRepresentativeApplication.js';
import University from '../models/University.js';
import Notification from '../models/Notification.js';
import CreditTransaction from '../models/CreditTransaction.js';
import generateToken from '../utils/generateToken.js';
import devStore from '../utils/devStore.js';

// Helper to issue scoped agency registration token (NOT a login session)
export const generateAgencyRegistrationToken = (userId, applicationId) => {
  return jwt.sign(
    { id: userId, type: 'agency_registration', applicationId },
    process.env.JWT_SECRET || 'admify_super_secret_jwt_fallback_key_2026',
    { expiresIn: '24h' }
  );
};

// Helper to issue scoped university representative registration token (NOT a login session)
export const generateUniRepRegistrationToken = (userId, applicationId) => {
  return jwt.sign(
    { id: userId, type: 'unirep_registration', applicationId },
    process.env.JWT_SECRET || 'admify_super_secret_jwt_fallback_key_2026',
    { expiresIn: '24h' }
  );
};

// @desc    Register a new user (student, agent, agency, university)
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role = 'student' } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, password, and phone',
      });
    }

    // Disallow arbitrary self-registration as admin through public register
    const validRoles = ['student', 'agent', 'agency', 'university', 'university representative', 'university_rep'];
    const cleanRole = role ? role.toLowerCase().trim() : 'student';
    let assignedRole = validRoles.includes(cleanRole) ? cleanRole : 'student';
    if (assignedRole === 'university representative' || assignedRole === 'university') {
      assignedRole = 'university_rep';
    }

    // ──────────────────────────────────────────────────────────────────────────
    // SPECIAL FLOW: AGENCY REGISTRATION (Step 1 of Agency Lifecycle)
    // Clicking "Create Agency Account" MUST NOT create an active/login-ready account.
    // It creates a PENDING agency registration/application with a scoped registration token.
    // ──────────────────────────────────────────────────────────────────────────
    if (assignedRole === 'agency') {
      const cleanEmail = email.toLowerCase().trim();
      const cleanPhone = phone.trim();
      const cleanName = name.trim();

      // Check existing email
      let existingUser = null;
      if (mongoose.connection.readyState === 1) {
        existingUser = await User.findOne({ email: cleanEmail });
      } else {
        existingUser = await devStore.findUserByEmail(cleanEmail);
      }

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email address already exists. Please sign in or use another email.',
        });
      }

      // Generate unique application ID (e.g. ADM-AGY-2026-XXXXX)
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const timeCode = Date.now().toString(36).toUpperCase().slice(-4);
      const applicationId = `ADM-AGY-2026-${timeCode}${randomSuffix}`;

      let agencyUser;
      let agencyProfile;

      if (mongoose.connection.readyState === 1) {
        agencyUser = await User.create({
          name: cleanName,
          email: cleanEmail,
          password,
          phone: cleanPhone,
          role: 'agency',
          status: 'pending',
          accountStatus: 'PENDING',
          isActive: false,
          emailVerified: false,
          agencyVerificationStatus: 'PENDING',
        });

        agencyProfile = await AgencyProfile.create({
          user: agencyUser._id,
          agencyName: cleanName,
          officialBusinessEmail: cleanEmail,
          authorizedPerson: {
            phone: cleanPhone,
            email: cleanEmail,
          },
          applicationId,
          verificationStatus: 'PENDING',
          isDraft: true,
        });

        agencyUser.agencyProfile = agencyProfile._id;
        await agencyUser.save();
      } else {
        agencyUser = await devStore.createUser({
          name: cleanName,
          email: cleanEmail,
          password,
          phone: cleanPhone,
          role: 'agency',
          status: 'pending',
          accountStatus: 'PENDING',
          isActive: false,
          emailVerified: false,
          agencyVerificationStatus: 'PENDING',
        });

        agencyProfile = await devStore.saveAgencyProfile({
          user: agencyUser._id,
          agencyName: cleanName,
          officialBusinessEmail: cleanEmail,
          authorizedPerson: {
            phone: cleanPhone,
            email: cleanEmail,
          },
          applicationId,
          verificationStatus: 'PENDING',
          isDraft: true,
        });

        await devStore.updateUser(agencyUser._id, {
          agencyProfile: agencyProfile._id,
        });
      }

      // Generate temporary registration token for verification submission (valid 24h)
      const registrationToken = generateAgencyRegistrationToken(agencyUser._id, applicationId);

      return res.status(201).json({
        success: true,
        message: 'Agency registration application created. Please complete agency verification.',
        data: {
          applicationId,
          registrationToken,
          agency: {
            _id: agencyUser._id,
            name: agencyUser.name,
            email: agencyUser.email,
            phone: agencyUser.phone,
            role: 'agency',
            accountStatus: 'PENDING',
            verificationStatus: 'PENDING',
            applicationId,
          },
        },
      });
    }

    // ──────────────────────────────────────────────────────────────────────────
    // SPECIAL FLOW: UNIVERSITY REPRESENTATIVE REGISTRATION (Step 1 of Uni Rep Lifecycle)
    // Clicking "Create University Representative Account" MUST NOT create an active/login-ready account.
    // It creates a PENDING application with a scoped unirep registration token.
    // ──────────────────────────────────────────────────────────────────────────
    if (assignedRole === 'university_rep') {
      const cleanEmail = email.toLowerCase().trim();
      const cleanPhone = phone.trim();
      const cleanName = name.trim();

      // Check existing email
      let existingUser = null;
      if (mongoose.connection.readyState === 1) {
        existingUser = await User.findOne({ email: cleanEmail });
      } else {
        existingUser = await devStore.findUserByEmail(cleanEmail);
      }

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'An account with this official email already exists. Please sign in or use another email.',
        });
      }

      // Generate unique University Representative Application ID (e.g. UREP-APP-20260926-0001)
      const nowStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const applicationId = `UREP-APP-${nowStr}-${randomSuffix}`;

      let uniRepUser;
      let uniRepApp;

      if (mongoose.connection.readyState === 1) {
        uniRepUser = await User.create({
          name: cleanName,
          email: cleanEmail,
          password,
          phone: cleanPhone,
          role: 'university_rep',
          status: 'pending',
          accountStatus: 'PENDING',
          isActive: false,
          emailVerified: false,
          uniRepVerificationStatus: 'PENDING',
          universityRepApplicationId: applicationId,
        });

        uniRepApp = await UniversityRepresentativeApplication.create({
          applicationId,
          user: uniRepUser._id,
          university: {
            name: req.body.universityName?.trim() || '',
            legalName: req.body.officialLegalName?.trim() || req.body.universityName?.trim() || '',
            logo: '',
            website: '',
            country: '',
            city: '',
            type: 'Public',
            domain: cleanEmail.includes('@') ? cleanEmail.split('@')[1] : '',
            matchedUniversityId: null,
          },
          representative: {
            fullName: cleanName,
            designation: 'International Admissions Officer',
            officialEmail: cleanEmail,
            phone: cleanPhone,
            employeeId: '',
          },
          status: 'PENDING',
        });

        uniRepUser.universityRepApplication = uniRepApp._id;
        await uniRepUser.save();
      } else {
        uniRepUser = await devStore.createUser({
          name: cleanName,
          email: cleanEmail,
          password,
          phone: cleanPhone,
          role: 'university_rep',
          status: 'pending',
          accountStatus: 'PENDING',
          isActive: false,
          emailVerified: false,
          uniRepVerificationStatus: 'PENDING',
          universityRepApplicationId: applicationId,
        });

        uniRepApp = await devStore.createUniRepApplication({
          applicationId,
          user: uniRepUser._id,
          university: {
            name: req.body.universityName?.trim() || '',
            legalName: req.body.officialLegalName?.trim() || req.body.universityName?.trim() || '',
            logo: '',
            website: '',
            country: '',
            city: '',
            type: 'Public',
            domain: cleanEmail.includes('@') ? cleanEmail.split('@')[1] : '',
            matchedUniversityId: null,
          },
          representative: {
            fullName: cleanName,
            designation: 'International Admissions Officer',
            officialEmail: cleanEmail,
            phone: cleanPhone,
            employeeId: '',
          },
          status: 'PENDING',
        });

        await devStore.updateUser(uniRepUser._id, {
          universityRepApplication: uniRepApp._id,
        });
      }

      // Generate temporary registration token for verification submission (valid 24h)
      const registrationToken = generateUniRepRegistrationToken(uniRepUser._id, applicationId);

      return res.status(201).json({
        success: true,
        message: 'University Representative registration application created. Please complete university representative verification.',
        token: registrationToken,
        data: {
          applicationId,
          token: registrationToken,
          registrationToken,
          representative: {
            _id: uniRepUser._id,
            name: uniRepUser.name,
            email: uniRepUser.email,
            phone: uniRepUser.phone,
            role: 'university_rep',
            accountStatus: 'PENDING',
            verificationStatus: 'PENDING',
            applicationId,
          },
        },
      });
    }

    // ──────────────────────────────────────────────────────────────────────────
    // AGENT REGISTRATION FLOW: Requires Agency ID, Agent App ID, Activation Code
    // ──────────────────────────────────────────────────────────────────────────
    if (assignedRole === 'agent') {
      const { agencyId, agentApplicationId, activationCode } = req.body;

      if (!agencyId || !agencyId.trim()) {
        return res.status(400).json({ success: false, message: 'Agency ID is required.' });
      }
      if (!agentApplicationId || !agentApplicationId.trim()) {
        return res.status(400).json({ success: false, message: 'Agent Application ID is required.' });
      }
      if (!activationCode || !activationCode.trim()) {
        return res.status(400).json({ success: false, message: 'Activation Code is required.' });
      }

      const cleanAgencyId = agencyId.trim();
      const cleanAppId = agentApplicationId.trim().toUpperCase();
      const cleanCode = activationCode.trim().toUpperCase();
      const cleanEmail = email.toLowerCase().trim();

      // 1. Verify Agency exists
      let agency = null;
      if (mongoose.connection.readyState === 1) {
        if (mongoose.Types.ObjectId.isValid(cleanAgencyId)) {
          agency = await User.findOne({ _id: cleanAgencyId, role: 'agency' });
        }
        if (!agency) {
          const profile = await AgencyProfile.findOne({
            applicationId: cleanAgencyId.toUpperCase(),
          });
          if (profile) {
            agency = await User.findOne({ _id: profile.user, role: 'agency' });
          }
        }
        if (!agency) {
          agency = await User.findOne({
            applicationId: cleanAgencyId.toUpperCase(),
            role: 'agency',
          });
        }
      } else {
        const agencyRes = await devStore.findAgencyByIdOrAppId(cleanAgencyId);
        agency = agencyRes?.user || agencyRes;
      }

      if (!agency) {
        return res.status(400).json({ success: false, message: 'Invalid Agency ID.' });
      }

      // 2. Verify Agency is active & approved
      const isAgencyActive =
        (agency.accountStatus === 'ACTIVE' || agency.status === 'active') &&
        agency.status !== 'suspended' &&
        agency.accountStatus !== 'REJECTED';

      if (!isAgencyActive) {
        return res.status(400).json({
          success: false,
          message: 'Agency is not verified or is suspended.',
        });
      }

      // 3. Verify Agent Application exists
      let application = null;
      if (mongoose.connection.readyState === 1) {
        application = await AgentApplication.findOne({ applicationId: cleanAppId });
      } else {
        application = await devStore.findAgentApplicationByAppId(cleanAppId);
      }

      if (!application) {
        return res.status(400).json({ success: false, message: 'Agent application not found.' });
      }

      // 4. Verify Agent Application belongs to this exact Agency
      const appAgencyId = (application.agency?._id || application.agency || '').toString();
      const agencyUserId = agency._id.toString();
      const appAgencyAppId = (application.agencyApplicationId || '').toUpperCase();
      const agencyAppId = (agency.applicationId || '').toUpperCase();

      const agencyMatches =
        appAgencyId === agencyUserId ||
        (appAgencyAppId && agencyAppId && appAgencyAppId === agencyAppId);

      if (!agencyMatches) {
        return res.status(400).json({
          success: false,
          message: 'Agent application does not belong to this Agency.',
        });
      }

      // 5. Verify Application has been approved
      if (application.status === 'REGISTERED' || application.status === 'COMPLETED') {
        return res.status(400).json({
          success: false,
          message: 'Agent is already registered using this application.',
        });
      }

      if (application.status !== 'APPROVED') {
        return res.status(400).json({
          success: false,
          message: 'This Agent application has not been approved.',
        });
      }

      // 6. Verify Activation Code
      const expectedCode = (application.activationCode || '').toUpperCase();
      if (!expectedCode || cleanCode !== expectedCode) {
        return res.status(400).json({ success: false, message: 'Invalid activation code.' });
      }

      if (application.activationCodeStatus === 'USED') {
        return res.status(400).json({ success: false, message: 'Activation code has already been used.' });
      }

      if (
        application.activationCodeStatus === 'EXPIRED' ||
        (application.activationCodeExpires && new Date(application.activationCodeExpires) < new Date())
      ) {
        return res.status(400).json({ success: false, message: 'Activation code has expired.' });
      }

      if (application.activationCodeStatus !== 'ISSUED') {
        return res.status(400).json({ success: false, message: 'Activation code is not valid.' });
      }

      // 7. Verify email matches approved application email
      const appEmail = (application.email || '').toLowerCase().trim();
      if (appEmail && cleanEmail !== appEmail) {
        return res.status(400).json({
          success: false,
          message: `Agent email must match the approved application email (${appEmail}).`,
        });
      }

      // 8. Verify email is not already registered
      let existingUser = null;
      if (mongoose.connection.readyState === 1) {
        existingUser = await User.findOne({ email: cleanEmail });
      } else {
        existingUser = await devStore.findUserByEmail(cleanEmail);
      }

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email address already exists.',
        });
      }

      // 9. Atomically create Agent User and link to Agency
      const now = new Date();
      let agentUser = null;

      if (mongoose.connection.readyState === 1) {
        agentUser = await User.create({
          name: name.trim(),
          email: cleanEmail,
          password,
          phone: phone.trim(),
          role: 'agent',
          agencyId: agency._id,
          agentApplicationId: application.applicationId,
          status: 'active',
          accountStatus: 'ACTIVE',
          isActive: true,
          emailVerified: true,
        });

        application.status = 'REGISTERED';
        application.activationCodeStatus = 'USED';
        application.agentUser = agentUser._id;
        application.registeredAt = now;
        if (!Array.isArray(application.statusHistory)) application.statusHistory = [];
        application.statusHistory.push({
          status: 'REGISTERED',
          changedAt: now,
          changedBy: agentUser._id,
          note: `Agent registered successfully and linked to Agency "${agency.name}".`,
        });

        await application.save();
      } else {
        agentUser = await devStore.createUser({
          name: name.trim(),
          email: cleanEmail,
          password,
          phone: phone.trim(),
          role: 'agent',
          agencyId: agency._id,
          agentApplicationId: application.applicationId,
          status: 'active',
          accountStatus: 'ACTIVE',
          isActive: true,
          emailVerified: true,
        });

        const history = Array.isArray(application.statusHistory) ? [...application.statusHistory] : [];
        history.push({
          status: 'REGISTERED',
          changedAt: now.toISOString(),
          changedBy: agentUser._id,
          note: `Agent registered successfully and linked to Agency "${agency.name}".`,
        });

        await devStore.updateAgentApplication(application._id, {
          status: 'REGISTERED',
          activationCodeStatus: 'USED',
          agentUser: agentUser._id,
          registeredAt: now.toISOString(),
          statusHistory: history,
        });
      }

      const token = generateToken(agentUser._id);

      return res.status(201).json({
        success: true,
        message: 'Agent account successfully verified, registered, and linked to agency!',
        data: {
          token,
          user: agentUser,
          agency: {
            _id: agency._id,
            name: agency.name,
            applicationId: agency.applicationId,
          },
          agentApplicationId: application.applicationId,
        },
      });
    }

    // ──────────────────────────────────────────────────────────────────────────
    // STANDARD REGISTRATION FLOW FOR OTHER ROLES (Student, University)
    // ──────────────────────────────────────────────────────────────────────────
    let user;
    if (mongoose.connection.readyState === 1) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email address already exists',
        });
      }

      user = await User.create({
        name,
        email: email.toLowerCase(),
        password,
        phone,
        role: assignedRole,
        status: 'active',
        accountStatus: 'ACTIVE',
        isActive: true,
      });

      if (assignedRole === 'student') {
        try {
          await CreditTransaction.create({
            transactionId: `CTX-WLC-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
            user: user._id,
            type: 'WELCOME_CREDIT',
            credits: 20,
            balanceBefore: 0,
            balanceAfter: 20,
            referenceType: 'WELCOME',
            referenceId: 'WELCOME_BONUS_20CR',
            desc: 'Free Welcome Credits (Valid for 1 month)',
            status: 'COMPLETED',
          });
        } catch (err) {
          console.warn('Failed to log welcome credit transaction:', err.message);
        }
      }
    } else {
      const existingUser = await devStore.findUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email address already exists',
        });
      }

      user = await devStore.createUser({
        name,
        email,
        password,
        phone,
        role: assignedRole,
        status: 'active',
        accountStatus: 'ACTIVE',
        isActive: true,
      });
    }

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully! Please log in.',
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    let user;
    if (mongoose.connection.readyState === 1) {
      user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    } else {
      user = await devStore.findUserByEmail(email);
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials',
      });
    }

    // If a role was specified in the login request, verify it matches
    if (role) {
      const normalize = (r) =>
        r === 'university representative' || r === 'uni rep' || r === 'university_rep'
          ? 'university'
          : r;
      const reqRole = normalize(role.toLowerCase().trim());
      const userRole = normalize(user.role.toLowerCase().trim());
      if (reqRole !== userRole) {
        return res.status(403).json({
          success: false,
          message: `This account is registered as '${user.role}', not '${role}'. Please switch role tabs.`,
        });
      }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // AGENCY LOGIN GATE: Block login if agency account is not fully active
    // ──────────────────────────────────────────────────────────────────────────
    if (user.role === 'agency') {
      const isAgencyActive =
        user.accountStatus === 'ACTIVE' &&
        user.isActive === true;

      if (!isAgencyActive) {
        let msg = 'Your agency account has not been activated yet. Please check your email after Admin approval.';
        if (user.accountStatus === 'PENDING') {
          msg = 'Your agency registration is pending verification. Please complete verification submission.';
        } else if (user.accountStatus === 'UNDER_REVIEW') {
          msg = 'Your agency verification is currently under review by Admify Admin. You will receive an activation email once approved.';
        } else if (user.accountStatus === 'APPROVED') {
          msg = 'Your agency registration has been approved! Please check your official business email and click the activation link before logging in.';
        } else if (user.accountStatus === 'REJECTED') {
          msg = 'Your agency application was not approved. Please contact compliance@admify.world for further assistance.';
        }

        return res.status(403).json({
          success: false,
          accountStatus: user.accountStatus || 'PENDING',
          message: msg,
        });
      }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // UNI REP LOGIN GATE: Block login if University Representative account is not fully active
    // ──────────────────────────────────────────────────────────────────────────
    if (
      user.role === 'university_rep' ||
      user.role === 'university representative' ||
      (user.role === 'university' && user.universityRepApplicationId)
    ) {
      const isUniRepActive =
        user.accountStatus === 'ACTIVE' &&
        user.isActive === true;

      if (!isUniRepActive) {
        let msg = 'Your University Representative account has not been activated yet. Please check your email after Admin approval.';
        if (user.accountStatus === 'PENDING') {
          msg = 'Your University Representative registration is pending verification. Please complete verification submission.';
        } else if (user.accountStatus === 'UNDER_REVIEW') {
          msg = 'Your University Representative verification is currently under review by Admify Admin. You will receive an activation email once approved.';
        } else if (user.accountStatus === 'APPROVED') {
          msg = 'Your University Representative registration has been approved! Please check your official university email and click the activation link before logging in.';
        } else if (user.accountStatus === 'REJECTED') {
          msg = 'Your University Representative application was not approved. Please contact compliance@admify.world for further assistance.';
        }

        return res.status(403).json({
          success: false,
          accountStatus: user.accountStatus || 'PENDING',
          message: msg,
        });
      }
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: 'Welcome back!',
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin specific authentication
// @route   POST /api/auth/admin/login
// @access  Public
export const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide admin email and password',
      });
    }

    let user;
    if (mongoose.connection.readyState === 1) {
      user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    } else {
      user = await devStore.findUserByEmail(email);
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid administrator credentials',
      });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: account does not have administrative clearance',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid administrator credentials',
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: 'Administrator clearance granted',
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Activate agency account via secure single-use token from email
// @route   POST /api/auth/activate-agency
// @access  Public
export const activateAgency = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'A valid activation token is required.',
      });
    }

    const tokenHash = crypto.createHash('sha256').update(token.trim()).digest('hex');

    let user;
    if (mongoose.connection.readyState === 1) {
      user = await User.findOne({
        activationTokenHash: tokenHash,
        role: 'agency',
      }).select('+activationTokenHash');
    } else {
      user = await devStore.findUserByActivationTokenHash(tokenHash);
    }

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid activation link. The link may be incorrect, expired, or already used.',
      });
    }

    // Check if token already used
    if (user.activationTokenUsed) {
      return res.status(400).json({
        success: false,
        alreadyUsed: true,
        message: 'This activation link has already been used. Your account is active. Please log in.',
      });
    }

    // Check token expiration (48h)
    if (user.activationTokenExpires && new Date(user.activationTokenExpires) < new Date()) {
      return res.status(400).json({
        success: false,
        expired: true,
        message: 'This activation link has expired. Please contact compliance@admify.world for a replacement link.',
      });
    }

    // Verify approval status
    if (user.accountStatus !== 'APPROVED' && user.accountStatus !== 'ACTIVE') {
      return res.status(400).json({
        success: false,
        message: `Account cannot be activated in its current status (${user.accountStatus}).`,
      });
    }

    // Perform activation
    const updates = {
      activationTokenUsed: true,
      accountStatus: 'ACTIVE',
      status: 'active',
      isActive: true,
      emailVerified: true,
      activatedAt: new Date(),
    };

    if (mongoose.connection.readyState === 1) {
      Object.assign(user, updates);
      await user.save();

      try {
        await Notification.create({
          user: user._id,
          title: 'Account Activated Successfully',
          message: 'Welcome to Admify! Your Agency partner portal is now active.',
          type: 'success',
          link: '/agency/dashboard',
        });
      } catch {}
    } else {
      await devStore.updateUser(user._id, updates);
      await devStore.createNotification({
        user: user._id,
        title: 'Account Activated Successfully',
        message: 'Welcome to Admify! Your Agency partner portal is now active.',
        type: 'success',
        link: '/agency/dashboard',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Account Activated Successfully. Your Admify Agency account is now active. Please log in.',
      data: {
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Activate University Representative account via secure single-use token from email
// @route   POST /api/auth/activate-university-rep
// @access  Public
export const activateUniversityRep = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'A valid activation token is required.',
      });
    }

    const tokenHash = crypto.createHash('sha256').update(token.trim()).digest('hex');

    let user;
    if (mongoose.connection.readyState === 1) {
      user = await User.findOne({
        activationTokenHash: tokenHash,
        role: { $in: ['university_rep', 'university representative', 'university'] },
      }).select('+activationTokenHash');
    } else {
      user = await devStore.findUserByActivationTokenHash(tokenHash);
    }

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid activation link. The link may be incorrect, expired, or already used.',
      });
    }

    // Check if token already used (Replay prevention)
    if (user.activationTokenUsed) {
      return res.status(400).json({
        success: false,
        alreadyUsed: true,
        message: 'This activation link has already been used. Your account is active. Please log in.',
      });
    }

    // Check token expiration (48h)
    if (user.activationTokenExpires && new Date(user.activationTokenExpires) < new Date()) {
      return res.status(400).json({
        success: false,
        expired: true,
        message: 'This activation link has expired. Please contact compliance@admify.world for assistance.',
      });
    }

    // Verify approval status
    if (user.accountStatus !== 'APPROVED' && user.accountStatus !== 'ACTIVE') {
      return res.status(400).json({
        success: false,
        message: `Account cannot be activated in its current status (${user.accountStatus}).`,
      });
    }

    // Find and update associated UniversityRepresentativeApplication
    let app = null;
    let universityRecord = null;

    if (mongoose.connection.readyState === 1) {
      if (user.universityRepApplication) {
        app = await UniversityRepresentativeApplication.findById(user.universityRepApplication);
      } else {
        app = await UniversityRepresentativeApplication.findOne({ user: user._id });
      }

      if (app) {
        app.status = 'ACTIVE';
        if (!Array.isArray(app.statusHistory)) app.statusHistory = [];
        app.statusHistory.push({
          status: 'ACTIVE',
          changedAt: new Date(),
          changedBy: user._id,
          note: 'University Representative completed email activation.',
        });
        await app.save();

        // Check if university exists or create one
        const uniName = app.university?.name || 'Verified University';
        let uni = null;
        if (app.university?.matchedUniversityId) {
          uni = await University.findById(app.university.matchedUniversityId);
        }
        if (!uni) {
          uni = await University.findOne({ name: new RegExp(`^${uniName}$`, 'i') });
        }
        if (!uni) {
          const slug = uniName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `uni-${Date.now()}`;
          uni = await University.create({
            slug,
            name: uniName,
            location: app.university?.city ? `${app.university.city}, ${app.university.country}` : app.university?.country || 'Global',
            country: (app.university?.country || 'Global').toLowerCase(),
            type: app.university?.type || 'Public',
            logo: app.university?.logo || '',
            website: app.university?.website || '',
          });
        }
        universityRecord = uni;
      }
    } else {
      app = await devStore.findUniRepApplicationByUserId(user._id);
      if (app) {
        await devStore.updateUniRepApplication(app._id, {
          status: 'ACTIVE',
        });

        const uniName = app.university?.name || 'Verified University';
        universityRecord = await devStore.findOrCreateUniversity({
          name: uniName,
          country: app.university?.country || 'Global',
          city: app.university?.city || '',
          type: app.university?.type || 'Public',
          logo: app.university?.logo || '',
          website: app.university?.website || '',
        });
      }
    }

    // Perform activation
    const updates = {
      activationTokenUsed: true,
      accountStatus: 'ACTIVE',
      status: 'active',
      isActive: true,
      emailVerified: true,
      uniRepVerificationStatus: 'VERIFIED',
      role: 'university_rep',
      activatedAt: new Date(),
    };

    if (universityRecord?._id) {
      updates.universityId = universityRecord._id;
    }

    if (mongoose.connection.readyState === 1) {
      Object.assign(user, updates);
      await user.save();

      try {
        await Notification.create({
          user: user._id,
          title: 'Account Activated Successfully',
          message: 'Welcome to Admify! Your University Representative account is now active.',
          type: 'success',
          link: '/university/dashboard',
        });
      } catch {}
    } else {
      await devStore.updateUser(user._id, updates);
      await devStore.createNotification({
        user: user._id,
        title: 'Account Activated Successfully',
        message: 'Welcome to Admify! Your University Representative account is now active.',
        type: 'success',
        link: '/university/dashboard',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Account Activated Successfully. Your Admify University Representative account is now active. Please log in.',
      data: {
        email: user.email,
        name: user.name,
        role: 'university_rep',
        accountStatus: 'ACTIVE',
        uniRepVerificationStatus: 'VERIFIED',
        universityId: user.universityId || updates.universityId,
        user: {
          email: user.email,
          name: user.name,
          role: 'university_rep',
          accountStatus: 'ACTIVE',
          uniRepVerificationStatus: 'VERIFIED',
          universityId: user.universityId || updates.universityId,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get currently logged in user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    let user;
    if (mongoose.connection.readyState === 1) {
      user = await User.findById(req.user._id).select('-password');
    } else {
      const devUser = await devStore.findUserById(req.user._id);
      if (devUser) {
        const userObj = devUser.toObject ? devUser.toObject() : { ...devUser };
        delete userObj.password;
        user = userObj;
      }
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Current user profile loaded',
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};
