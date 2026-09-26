import mongoose from 'mongoose';
import UniversityRepresentativeApplication from '../models/UniversityRepresentativeApplication.js';
import UniversityAgencyConnection from '../models/UniversityAgencyConnection.js';
import University from '../models/University.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import Application from '../models/Application.js';
import Scholarship from '../models/Scholarship.js';
import Announcement from '../models/Announcement.js';
import Report from '../models/Report.js';
import ChatMessage from '../models/ChatMessage.js';
import AuditLog from '../models/AuditLog.js';
import bcrypt from 'bcryptjs';
import devStore from '../utils/devStore.js';

// Audit log recorder helper
const recordUniRepAuditLog = async ({ req, action, module, targetType, targetId, targetName, previousValue, newValue, reason }) => {
  try {
    const logData = {
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action,
      module: module || 'university_rep',
      targetType: targetType || 'University',
      targetId: targetId ? targetId.toString() : (req.user.universityId ? req.user.universityId.toString() : null),
      targetName: targetName || '',
      previousValue: previousValue || null,
      newValue: newValue || null,
      reason: reason || 'Action performed via University Representative Portal',
      ip: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
      timestamp: new Date(),
    };

    if (mongoose.connection.readyState === 1) {
      await AuditLog.create(logData);
    } else {
      const db = devStore.read();
      if (!Array.isArray(db.auditLogs)) db.auditLogs = [];
      db.auditLogs.unshift({
        _id: new mongoose.Types.ObjectId().toString(),
        ...logData,
        createdAt: new Date().toISOString(),
      });
      devStore.write(db);
    }
  } catch (err) {
    console.warn('[UniRep Audit Error]:', err.message);
  }
};

// University resolver helper (Backend-controlled single source of truth)
const resolveUniversityForUser = async (user) => {
  let university = null;
  const universityId = user.universityId;

  if (mongoose.connection.readyState === 1) {
    if (universityId) {
      university = await University.findById(universityId);
    }
    if (!university && user.universityRepApplicationId) {
      const app = await UniversityRepresentativeApplication.findOne({
        $or: [{ _id: mongoose.isValidObjectId(user.universityRepApplicationId) ? user.universityRepApplicationId : null }, { applicationId: user.universityRepApplicationId }],
      });
      if (app?.university?.matchedUniversityId) {
        university = await University.findById(app.university.matchedUniversityId);
      }
      if (!university && app?.university?.name) {
        university = await University.findOne({ name: new RegExp(`^${app.university.name.trim()}$`, 'i') });
      }
    }
  } else {
    if (universityId) {
      university = await devStore.findUniversityById(universityId);
    }
    if (!university && user.universityRepApplicationId) {
      const db = devStore.read();
      const app = (db.universityRepApplications || []).find(
        (a) => a._id === user.universityRepApplicationId.toString() || a.applicationId === user.universityRepApplicationId
      );
      if (app?.university?.matchedUniversityId) {
        university = await devStore.findUniversityById(app.university.matchedUniversityId);
      }
      if (!university && app?.university?.name) {
        university = (db.universities || []).find(
          (u) => u.name?.toLowerCase().trim() === app.university.name?.toLowerCase().trim()
        );
      }
    }
  }

  // If still not found but user has a university name in application, create an initialized University record
  if (!university && user.universityRepApplication) {
    let app = null;
    if (mongoose.connection.readyState === 1) {
      app = await UniversityRepresentativeApplication.findById(user.universityRepApplication);
      if (app?.university?.name) {
        university = await University.create({
          name: app.university.name,
          slug: app.university.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `uni-${Date.now()}`,
          location: `${app.university.city || ''}, ${app.university.country || ''}`.trim().replace(/^,\s*|,\s*$/g, ''),
          country: (app.university.country || 'Global').toLowerCase(),
          type: app.university.type || 'Public',
          logo: app.university.logo || '',
          website: app.university.website || '',
          about: `Official profile for ${app.university.name}.`,
          programs: [],
          intakesList: [],
        });
        await User.findByIdAndUpdate(user._id, { universityId: university._id });
        user.universityId = university._id;
      }
    } else {
      const db = devStore.read();
      app = (db.universityRepApplications || []).find((a) => a._id === user.universityRepApplication.toString());
      if (app?.university?.name) {
        university = await devStore.createUniversity({
          name: app.university.name,
          country: app.university.country || 'Global',
          city: app.university.city || '',
          type: app.university.type || 'Public',
          logo: app.university.logo || '',
          website: app.university.website || '',
        });
        await devStore.updateUser(user._id, { universityId: university._id });
        user.universityId = university._id;
      }
    }
  }

  return university;
};

// Document validation helper (MIME check + size limit 3.5MB)
const validateDocument = (doc, label, maxSizeBytes = 3.5 * 1024 * 1024) => {
  if (!doc) return null;
  const fileData = typeof doc === 'string' ? doc : (doc.fileData || doc.dataUrl || '');
  const fileType = typeof doc === 'object' ? (doc.fileType || doc.mimeType || '') : '';

  if (!fileData || typeof fileData !== 'string' || !fileData.trim()) return null;

  const validMimes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
  ];

  if (fileType && !validMimes.includes(fileType.toLowerCase())) {
    return `${label} must be a valid PDF, JPG, PNG, or WEBP file.`;
  }

  const base64Str = fileData.includes(',') ? fileData.split(',')[1] : fileData;
  const approxBytes = Math.ceil((base64Str.length * 3) / 4);

  if (approxBytes > maxSizeBytes) {
    const maxMb = (maxSizeBytes / (1024 * 1024)).toFixed(1);
    return `${label} is too large. Maximum allowed size is ${maxMb}MB.`;
  }

  return null;
};

// Notify Admins helper
const notifyAdminsOfUniRepVerification = async ({ repName, universityName, applicationId }) => {
  const title = 'New University Representative Verification Request';
  const message = `A new University Representative verification has been submitted by "${repName}" for "${universityName}" (App ID: ${applicationId}) and is waiting for review.`;
  const link = '/admin/universities';

  try {
    if (mongoose.connection.readyState === 1) {
      const admins = await User.find({ role: 'admin' });
      for (const admin of admins) {
        await Notification.create({
          user: admin._id,
          title,
          message,
          type: 'info',
          link,
        });
      }
    } else {
      const admins = await devStore.findAdmins();
      for (const admin of admins) {
        await devStore.createNotification({
          user: admin._id,
          title,
          message,
          type: 'info',
          link,
        });
      }
    }
  } catch (err) {
    console.warn('[Admin Notification Warning] Failed to dispatch admin notification:', err.message);
  }
};

// @desc    Submit University Representative verification details
// @route   POST /api/university-rep/verification
// @access  Private (University Rep role or Uni Rep Registration Token)
export const submitUniRepVerification = async (req, res, next) => {
  try {
    const rawUni = req.body.university || req.body.universityInfo || {};
    const rawRep = req.body.representative || req.body.representativeInfo || {};
    const rawDocs = req.body.documents || {};
    const rawScope = req.body.academicScope || {};
    const rawProf = req.body.professional || req.body.professionalInfo || {};
    const rawDecl = req.body.declarations || req.body.declaration || {};

    const university = {
      name: rawUni.name || rawUni.universityName || '',
      legalName: rawUni.legalName || rawUni.officialLegalName || rawUni.name || rawUni.universityName || '',
      website: rawUni.website || rawUni.officialWebsite || '',
      country: rawUni.country || '',
      city: rawUni.city || '',
      type: rawUni.type || rawUni.universityType || 'Public',
      domain: rawUni.domain || rawUni.officialEmailDomain || '',
      logo: rawUni.logo || null,
    };

    const representative = {
      fullName: rawRep.fullName || rawRep.name || '',
      designation: rawRep.designation || 'International Admissions Officer',
      officialEmail: rawRep.officialEmail || rawRep.email || '',
      phone: rawRep.phone || '',
      employeeId: rawRep.employeeId || '',
    };

    const documents = {
      authorizationLetter: rawDocs.authorizationLetter || null,
      officialUniversityId: rawDocs.officialUniversityId || null,
      employeeIdDocument: rawDocs.employeeIdDocument || rawDocs.employeeIdDoc || null,
      supportingDocument: rawDocs.supportingDocument || rawDocs.otherSupportingDoc || null,
    };

    const academicScope = {
      studyLevels: Array.isArray(rawScope.studyLevels) ? rawScope.studyLevels : ['Undergraduate'],
      programsDepartments: rawScope.programsDepartments || rawScope.programsHandled || '',
      countriesRegionsHandled: Array.isArray(rawScope.countriesRegionsHandled)
        ? rawScope.countriesRegionsHandled
        : Array.isArray(rawScope.countriesHandled)
        ? rawScope.countriesHandled
        : ['Global'],
    };

    const professional = {
      yearsOfExperience: rawProf.yearsOfExperience !== undefined ? rawProf.yearsOfExperience : rawProf.yearsExperience !== undefined ? rawProf.yearsExperience : 0,
      previousExperience: rawProf.previousExperience || '',
      languages: Array.isArray(rawProf.languages) ? rawProf.languages : ['English'],
      areasOfExpertise: Array.isArray(rawProf.areasOfExpertise) ? rawProf.areasOfExpertise : [],
      certificationsMemberships: Array.isArray(rawProf.certificationsMemberships) ? rawProf.certificationsMemberships : [],
    };

    const declarations = {
      informationAccuracy: Boolean(rawDecl.informationAccuracy || rawDecl.informationAccurate),
      authorizationConfirmation: Boolean(rawDecl.authorizationConfirmation || rawDecl.authorizedToRepresent),
      termsAndPolicy: Boolean(rawDecl.termsAndPolicy || rawDecl.termsAgreed),
    };

    // ── SECTION A: University Information Validation ─────────────────────────
    if (!university.name?.trim()) {
      return res.status(400).json({ success: false, message: 'University Name is required.' });
    }
    if (!university.legalName?.trim()) {
      return res.status(400).json({ success: false, message: 'Official/Legal University Name is required.' });
    }
    if (!university.website?.trim()) {
      return res.status(400).json({ success: false, message: 'Official University Website is required.' });
    }
    if (!university.country?.trim()) {
      return res.status(400).json({ success: false, message: 'University Country is required.' });
    }
    if (!university.city?.trim()) {
      return res.status(400).json({ success: false, message: 'University City is required.' });
    }
    if (!university.type?.trim()) {
      return res.status(400).json({ success: false, message: 'University Type is required.' });
    }
    if (!university.domain?.trim()) {
      return res.status(400).json({ success: false, message: 'Official University Email Domain is required.' });
    }

    // ── SECTION B: Representative Information Validation ─────────────────────
    if (!representative.fullName?.trim()) {
      return res.status(400).json({ success: false, message: 'Representative Full Name is required.' });
    }
    if (!representative.designation?.trim()) {
      return res.status(400).json({ success: false, message: 'Representative Designation is required.' });
    }
    if (!representative.officialEmail?.trim()) {
      return res.status(400).json({ success: false, message: 'Official Email is required.' });
    }
    if (!representative.phone?.trim()) {
      return res.status(400).json({ success: false, message: 'Representative Phone Number is required.' });
    }
    if (!representative.employeeId?.trim()) {
      return res.status(400).json({ success: false, message: 'Employee ID / Representative ID is required.' });
    }

    // Domain consistency check: representative email domain vs official university domain
    const repEmailDomain = representative.officialEmail.split('@')[1]?.toLowerCase().trim();
    const statedDomain = university.domain.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0].trim();
    if (repEmailDomain && statedDomain && !repEmailDomain.includes(statedDomain) && !statedDomain.includes(repEmailDomain)) {
      console.warn(`[Domain Check Notice] Rep email domain (${repEmailDomain}) differs from stated university domain (${statedDomain})`);
    }

    // ── SECTION C: Authorization & Documents Validation ──────────────────────
    const hasDoc = (d) => Boolean(d && (d.fileData || d.dataUrl || d.fileName || d.originalName));
    if (!hasDoc(documents.authorizationLetter)) {
      return res.status(400).json({ success: false, message: 'Authorization Letter is required.' });
    }
    if (!hasDoc(documents.officialUniversityId)) {
      return res.status(400).json({ success: false, message: 'Official University ID is required.' });
    }
    if (!hasDoc(documents.employeeIdDocument)) {
      // Optional if employeeIdDocument not provided or fallback to other
      console.log('Employee ID doc check');
    }

    const docErrors = [
      validateDocument(documents.authorizationLetter, 'Authorization Letter'),
      validateDocument(documents.officialUniversityId, 'Official University ID'),
      validateDocument(documents.employeeIdDocument, 'Employee ID Document'),
      validateDocument(documents.supportingDocument, 'Supporting Document'),
      validateDocument(university.logo, 'University Logo', 2 * 1024 * 1024),
    ].filter(Boolean);

    if (docErrors.length > 0) {
      return res.status(400).json({ success: false, message: docErrors[0] });
    }

    // ── SECTION D: Academic Scope Validation ─────────────────────────────────
    if (!academicScope.programsDepartments?.trim()) {
      return res.status(400).json({ success: false, message: 'Programs / Departments are required.' });
    }
    if (!Array.isArray(academicScope.countriesRegionsHandled) || academicScope.countriesRegionsHandled.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one Country / Region handled is required.' });
    }

    // ── SECTION F: Declaration Validation ───────────────────────────────────
    if (!declarations.informationAccuracy || !declarations.authorizationConfirmation || !declarations.termsAndPolicy) {
      return res.status(400).json({
        success: false,
        message: 'All three verification declarations must be accepted before submitting.',
      });
    }

    const userId = req.user._id;
    const now = new Date();

    let application = null;

    if (mongoose.connection.readyState === 1) {
      // Find existing application or create
      application = await UniversityRepresentativeApplication.findOne({ user: userId });
      if (!application) {
        const nowStr = now.toISOString().slice(0, 10).replace(/-/g, '');
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        const applicationId = `UREP-APP-${nowStr}-${randomSuffix}`;
        application = new UniversityRepresentativeApplication({
          applicationId,
          user: userId,
        });
      }

      application.university = {
        name: university.name.trim(),
        legalName: university.legalName.trim(),
        logo: university.logo || '',
        website: university.website.trim(),
        country: university.country.trim(),
        city: university.city.trim(),
        type: university.type.trim(),
        domain: statedDomain,
        matchedUniversityId: application.university?.matchedUniversityId || null,
      };

      application.representative = {
        fullName: representative.fullName.trim(),
        designation: representative.designation.trim(),
        officialEmail: representative.officialEmail.toLowerCase().trim(),
        phone: representative.phone.trim(),
        employeeId: representative.employeeId.trim(),
      };

      application.documents = {
        authorizationLetter: documents.authorizationLetter || {},
        officialUniversityId: documents.officialUniversityId || {},
        employeeIdDocument: documents.employeeIdDocument || {},
        supportingDocument: documents.supportingDocument || {},
      };

      application.academicScope = {
        studyLevels: Array.isArray(academicScope.studyLevels) ? academicScope.studyLevels : ['Undergraduate'],
        programsDepartments: academicScope.programsDepartments.trim(),
        countriesRegionsHandled: academicScope.countriesRegionsHandled,
      };

      application.professional = {
        yearsOfExperience: Number(professional.yearsOfExperience) || 0,
        previousExperience: professional.previousExperience?.trim() || '',
        languages: Array.isArray(professional.languages) ? professional.languages : [],
        areasOfExpertise: Array.isArray(professional.areasOfExpertise) ? professional.areasOfExpertise : [],
        certificationsMemberships: Array.isArray(professional.certificationsMemberships) ? professional.certificationsMemberships : [],
      };

      application.declarations = {
        informationAccuracy: Boolean(declarations.informationAccuracy),
        authorizationConfirmation: Boolean(declarations.authorizationConfirmation),
        termsAndPolicy: Boolean(declarations.termsAndPolicy),
      };

      application.status = 'UNDER_REVIEW';
      application.submittedAt = now;

      if (!Array.isArray(application.statusHistory)) application.statusHistory = [];
      application.statusHistory.push({
        status: 'UNDER_REVIEW',
        changedAt: now,
        changedBy: userId,
        note: 'University representative submitted verification application for review.',
      });

      await application.save();

      // Update User record with profile info and UNDER_REVIEW status
      await User.findByIdAndUpdate(userId, {
        accountStatus: 'UNDER_REVIEW',
        uniRepVerificationStatus: 'UNDER_REVIEW',
        name: representative.fullName.trim(),
        phone: representative.phone.trim(),
        department: academicScope.programsDepartments.trim(),
        designation: representative.designation.trim(),
        officialUniversityEmail: representative.officialEmail.toLowerCase().trim(),
        employeeId: representative.employeeId.trim(),
        country: university.country.trim(),
        city: university.city.trim(),
        academicScope: application.academicScope,
        professional: application.professional,
        documents: application.documents,
        universityRepApplication: application._id,
        universityRepApplicationId: application.applicationId,
      });

      // Notify Admins
      await notifyAdminsOfUniRepVerification({
        repName: representative.fullName.trim(),
        universityName: university.name.trim(),
        applicationId: application.applicationId,
      });

      return res.status(200).json({
        success: true,
        message: 'University Representative verification submitted successfully and is now under review.',
        data: {
          application,
        },
      });
    } else {
      // devStore mode
      application = await devStore.findUniRepApplicationByUserId(userId);
      const nowStr = now.toISOString().slice(0, 10).replace(/-/g, '');
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const applicationId = application?.applicationId || `UREP-APP-${nowStr}-${randomSuffix}`;

      const appData = {
        applicationId,
        user: userId,
        university: {
          name: university.name.trim(),
          legalName: university.legalName.trim(),
          logo: university.logo || '',
          website: university.website.trim(),
          country: university.country.trim(),
          city: university.city.trim(),
          type: university.type.trim(),
          domain: statedDomain,
          matchedUniversityId: null,
        },
        representative: {
          fullName: representative.fullName.trim(),
          designation: representative.designation.trim(),
          officialEmail: representative.officialEmail.toLowerCase().trim(),
          phone: representative.phone.trim(),
          employeeId: representative.employeeId.trim(),
        },
        documents: {
          authorizationLetter: documents.authorizationLetter || {},
          officialUniversityId: documents.officialUniversityId || {},
          employeeIdDocument: documents.employeeIdDocument || {},
          supportingDocument: documents.supportingDocument || {},
        },
        academicScope: {
          studyLevels: Array.isArray(academicScope.studyLevels) ? academicScope.studyLevels : ['Undergraduate'],
          programsDepartments: academicScope.programsDepartments.trim(),
          countriesRegionsHandled: academicScope.countriesRegionsHandled,
        },
        professional: {
          yearsOfExperience: Number(professional.yearsOfExperience) || 0,
          previousExperience: professional.previousExperience?.trim() || '',
          languages: Array.isArray(professional.languages) ? professional.languages : [],
          areasOfExpertise: Array.isArray(professional.areasOfExpertise) ? professional.areasOfExpertise : [],
          certificationsMemberships: Array.isArray(professional.certificationsMemberships) ? professional.certificationsMemberships : [],
        },
        declarations: {
          informationAccuracy: Boolean(declarations.informationAccuracy),
          authorizationConfirmation: Boolean(declarations.authorizationConfirmation),
          termsAndPolicy: Boolean(declarations.termsAndPolicy),
        },
        status: 'UNDER_REVIEW',
        submittedAt: now.toISOString(),
      };

      if (application) {
        application = await devStore.updateUniRepApplication(application._id, appData);
      } else {
        application = await devStore.createUniRepApplication(appData);
      }

      await devStore.updateUser(userId, {
        accountStatus: 'UNDER_REVIEW',
        uniRepVerificationStatus: 'UNDER_REVIEW',
        name: representative.fullName.trim(),
        phone: representative.phone.trim(),
        department: academicScope.programsDepartments.trim(),
        designation: representative.designation.trim(),
        officialUniversityEmail: representative.officialEmail.toLowerCase().trim(),
        employeeId: representative.employeeId.trim(),
        country: university.country.trim(),
        city: university.city.trim(),
        academicScope: appData.academicScope,
        professional: appData.professional,
        documents: appData.documents,
        universityRepApplication: application._id,
        universityRepApplicationId: application.applicationId,
      });

      await notifyAdminsOfUniRepVerification({
        repName: representative.fullName.trim(),
        universityName: university.name.trim(),
        applicationId: application.applicationId,
      });

      return res.status(200).json({
        success: true,
        message: 'University Representative verification submitted successfully and is now under review.',
        data: {
          application,
        },
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get current University Representative verification status & details
// @route   GET /api/university-rep/verification
// @access  Private (Uni Rep or Registration Token)
export const getUniRepVerification = async (req, res, next) => {
  try {
    const userId = req.user._id;
    let application = null;

    if (mongoose.connection.readyState === 1) {
      application = await UniversityRepresentativeApplication.findOne({ user: userId });
    } else {
      application = await devStore.findUniRepApplicationByUserId(userId);
    }

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'No University Representative application found for this account.',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        application,
        user: {
          _id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          phone: req.user.phone,
          role: req.user.role,
          accountStatus: req.user.accountStatus,
          uniRepVerificationStatus: req.user.uniRepVerificationStatus,
          universityId: req.user.universityId,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get University Representative profile
// @route   GET /api/university-rep/profile
// @access  Private (University Rep)
export const getUniRepProfile = async (req, res, next) => {
  try {
    const userId = req.user._id;
    let user;
    let university = null;
    let application = null;

    if (mongoose.connection.readyState === 1) {
      user = await User.findById(userId).select('-password');
      if (user.universityId) {
        university = await University.findById(user.universityId);
      }
      application = await UniversityRepresentativeApplication.findOne({ user: userId });
    } else {
      user = await devStore.findUserById(userId);
      if (user?.universityId) {
        university = await devStore.findUniversityById(user.universityId);
      }
      application = await devStore.findUniRepApplicationByUserId(userId);
    }

    return res.status(200).json({
      success: true,
      data: {
        user,
        university,
        application,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update University Representative profile (backend-guarded)
// @route   PUT /api/university-rep/profile
// @access  Private (University Rep)
export const updateUniRepProfile = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Strict sanitization: strip any attempts to change role, university ownership, or verification status
    const allowed = { ...req.body };
    delete allowed.role;
    delete allowed.universityId; // University affiliation is backend-controlled!
    delete allowed.accountStatus;
    delete allowed.uniRepVerificationStatus;
    delete allowed.agencyVerificationStatus;
    delete allowed.activationTokenHash;
    delete allowed.activationTokenExpires;
    delete allowed.activationTokenUsed;
    delete allowed.activatedAt;
    delete allowed.email;
    delete allowed.password;
    delete allowed._id;

    let updatedUser;
    if (mongoose.connection.readyState === 1) {
      updatedUser = await User.findByIdAndUpdate(userId, allowed, { new: true }).select('-password');
    } else {
      updatedUser = await devStore.updateUser(userId, allowed);
    }

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get connections for University Representative
// @route   GET /api/university-rep/connections
// @access  Private (University Rep)
export const getUniRepConnections = async (req, res, next) => {
  try {
    const userId = req.user._id;
    let connections = [];

    if (mongoose.connection.readyState === 1) {
      connections = await UniversityAgencyConnection.find({
        universityRepresentativeId: userId,
      })
        .populate('agencyId', 'name email phone avatar status accountStatus')
        .populate('agencyProfileId')
        .populate('universityId', 'name location country logo website');
    } else {
      connections = await devStore.findAgencyConnections({
        universityRepresentativeId: userId,
      });
      // Attach populated representations
      for (const conn of connections) {
        if (!conn.agency && conn.agencyId) {
          conn.agency = await devStore.findUserById(conn.agencyId);
        }
        if (!conn.university && conn.universityId) {
          conn.university = await devStore.findUniversityById(conn.universityId);
        }
      }
    }

    return res.status(200).json({
      success: true,
      count: connections.length,
      data: {
        connections,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Accept agency connection request
// @route   POST /api/university-rep/connections/:id/accept
// @access  Private (University Rep)
export const acceptAgencyConnection = async (req, res, next) => {
  try {
    const connectionId = req.params.id;
    const userId = req.user._id;

    // Verify Uni Rep is ACTIVE
    if (req.user.accountStatus !== 'ACTIVE' && req.user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Only active, verified University Representatives can accept agency connections.',
      });
    }

    let conn = null;
    const now = new Date();

    if (mongoose.connection.readyState === 1) {
      conn = await UniversityAgencyConnection.findById(connectionId);
      if (!conn) {
        return res.status(404).json({ success: false, message: 'Connection request not found.' });
      }

      // Security check: connection must belong to this Uni Rep
      if (conn.universityRepresentativeId.toString() !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to modify this connection request.',
        });
      }

      conn.status = 'ACCEPTED';
      conn.respondedAt = now;
      conn.respondedBy = userId;
      await conn.save();

      // Notify agency
      try {
        await Notification.create({
          user: conn.agencyId,
          title: 'Agency Connection Accepted',
          message: `${req.user.name} has accepted your university connection partnership request.`,
          type: 'success',
          link: '/agency/dashboard',
        });
      } catch {}
    } else {
      conn = await devStore.findAgencyConnectionById(connectionId);
      if (!conn) {
        return res.status(404).json({ success: false, message: 'Connection request not found.' });
      }

      if (conn.universityRepresentativeId.toString() !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to modify this connection request.',
        });
      }

      conn = await devStore.updateAgencyConnection(connectionId, {
        status: 'ACCEPTED',
        respondedAt: now.toISOString(),
        respondedBy: userId.toString(),
      });

      await devStore.createNotification({
        user: conn.agencyId,
        title: 'Agency Connection Accepted',
        message: `${req.user.name} has accepted your university connection partnership request.`,
        type: 'success',
        link: '/agency/dashboard',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Connection request accepted successfully.',
      data: {
        connection: conn,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject agency connection request
// @route   POST /api/university-rep/connections/:id/reject
// @access  Private (University Rep)
export const rejectAgencyConnection = async (req, res, next) => {
  try {
    const connectionId = req.params.id;
    const userId = req.user._id;

    if (req.user.accountStatus !== 'ACTIVE' && req.user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Only active, verified University Representatives can manage agency connections.',
      });
    }

    let conn = null;
    const now = new Date();

    if (mongoose.connection.readyState === 1) {
      conn = await UniversityAgencyConnection.findById(connectionId);
      if (!conn) {
        return res.status(404).json({ success: false, message: 'Connection request not found.' });
      }

      // Security check: connection must belong to this Uni Rep
      if (conn.universityRepresentativeId.toString() !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to modify this connection request.',
        });
      }

      conn.status = 'REJECTED';
      conn.respondedAt = now;
      conn.respondedBy = userId;
      await conn.save();

      try {
        await Notification.create({
          user: conn.agencyId,
          title: 'Agency Connection Declined',
          message: `${req.user.name} has declined your university connection request.`,
          type: 'info',
          link: '/agency/dashboard',
        });
      } catch {}
    } else {
      conn = await devStore.findAgencyConnectionById(connectionId);
      if (!conn) {
        return res.status(404).json({ success: false, message: 'Connection request not found.' });
      }

      if (conn.universityRepresentativeId.toString() !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to modify this connection request.',
        });
      }

      conn = await devStore.updateAgencyConnection(connectionId, {
        status: 'REJECTED',
        respondedAt: now.toISOString(),
        respondedBy: userId.toString(),
      });

      await devStore.createNotification({
        user: conn.agencyId,
        title: 'Agency Connection Declined',
        message: `${req.user.name} has declined your university connection request.`,
        type: 'info',
        link: '/agency/dashboard',
      });
    }

    await recordUniRepAuditLog({
      req,
      action: 'REJECTED_AGENCY_PARTNERSHIP',
      module: 'partnerships',
      targetType: 'UniversityAgencyConnection',
      targetId: connectionId,
      reason: 'Representative declined agency partnership request',
    });

    return res.status(200).json({
      success: true,
      message: 'Connection request declined.',
      data: {
        connection: conn,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Block agency connection request/partnership
// @route   POST /api/university-rep/connections/:id/block
// @access  Private (University Rep)
export const blockAgencyConnection = async (req, res, next) => {
  try {
    const connectionId = req.params.id;
    const userId = req.user._id;

    if (req.user.accountStatus !== 'ACTIVE' && req.user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Only active, verified University Representatives can manage agency connections.',
      });
    }

    let conn = null;
    const now = new Date();

    if (mongoose.connection.readyState === 1) {
      conn = await UniversityAgencyConnection.findById(connectionId);
      if (!conn) {
        return res.status(404).json({ success: false, message: 'Connection request not found.' });
      }

      if (conn.universityRepresentativeId.toString() !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to modify this connection.',
        });
      }

      conn.status = 'BLOCKED';
      conn.respondedAt = now;
      conn.respondedBy = userId;
      await conn.save();
    } else {
      conn = await devStore.findAgencyConnectionById(connectionId);
      if (!conn) {
        return res.status(404).json({ success: false, message: 'Connection request not found.' });
      }

      if (conn.universityRepresentativeId.toString() !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to modify this connection.',
        });
      }

      conn = await devStore.updateAgencyConnection(connectionId, {
        status: 'BLOCKED',
        respondedAt: now.toISOString(),
        respondedBy: userId.toString(),
      });
    }

    await recordUniRepAuditLog({
      req,
      action: 'BLOCKED_AGENCY_PARTNERSHIP',
      module: 'partnerships',
      targetType: 'UniversityAgencyConnection',
      targetId: connectionId,
      reason: 'Representative blocked agency partnership',
    });

    return res.status(200).json({
      success: true,
      message: 'Agency partnership blocked.',
      data: { connection: conn },
    });
  } catch (error) {
    next(error);
  }
};

// ── 1. DASHBOARD ─────────────────────────────────────────────────────────────
// @desc    Get real backend metrics and recent activity for University Representative
// @route   GET /api/university-rep/dashboard
// @access  Private (University Rep)
export const getUniRepDashboard = async (req, res, next) => {
  try {
    const university = await resolveUniversityForUser(req.user);
    const userId = req.user._id.toString();

    let connections = [];
    let applications = [];
    let notifications = [];
    let messages = [];
    let announcements = [];

    if (mongoose.connection.readyState === 1) {
      connections = await UniversityAgencyConnection.find({
        universityRepresentativeId: req.user._id,
      }).populate('agencyId', 'name email phone avatar');

      if (university) {
        applications = await Application.find({
          $or: [
            { university: new RegExp(`^${university.name}$`, 'i') },
            { universityId: university._id },
          ],
        }).populate('user', 'name email phone country gpa ielts');
        announcements = await Announcement.find({ university: university._id }).sort({ createdAt: -1 });
      }

      notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(10);
      messages = await ChatMessage.find({
        $or: [{ user: req.user._id }, { receiver: req.user._id }],
      }).sort({ createdAt: -1 }).limit(10);
    } else {
      const db = devStore.read();
      connections = (db.universityAgencyConnections || []).filter(
        (c) => c.universityRepresentativeId?.toString() === userId
      );

      if (university) {
        applications = (db.applications || []).filter(
          (a) =>
            a.university?.toLowerCase().trim() === university.name?.toLowerCase().trim() ||
            a.universityId?.toString() === university._id?.toString()
        );
        announcements = (db.announcements || []).filter(
          (ann) => ann.university?.toString() === university._id?.toString()
        );
      }

      notifications = (db.notifications || []).filter((n) => n.user?.toString() === userId).slice(0, 10);
      messages = (db.chatMessages || []).filter(
        (m) => m.user?.toString() === userId || m.receiver?.toString() === userId
      ).slice(0, 10);
    }

    const activePrograms = Array.isArray(university?.programs) ? university.programs.length : 0;
    const connectedAgencies = connections.filter((c) => c.status === 'ACCEPTED').length;
    const pendingPartnershipRequests = connections.filter((c) => c.status === 'PENDING').length;
    const acceptedPartnerships = connectedAgencies;
    const totalApplications = applications.length;
    const pendingApplications = applications.filter((a) =>
      ['Submitted', 'Documents Pending', 'In Review'].includes(a.stage)
    ).length;
    const acceptedApplications = applications.filter((a) => a.stage === 'Accepted').length;
    const unreadNotifications = notifications.filter((n) => !n.read && !n.isRead).length;

    // Upcoming deadlines from programs or intakes
    const upcomingDeadlines = [];
    if (university?.programs) {
      university.programs.forEach((prog) => {
        if (prog.deadline) {
          upcomingDeadlines.push({
            title: `${prog.name} Application Deadline`,
            deadline: prog.deadline,
            type: 'Program',
            programName: prog.name,
          });
        }
      });
    }
    if (university?.intakesList) {
      university.intakesList.forEach((intk) => {
        if (intk.deadline) {
          upcomingDeadlines.push({
            title: `${intk.name} Intake Deadline`,
            deadline: intk.deadline,
            type: 'Intake',
            programName: intk.program || 'All Programs',
          });
        }
      });
    }

    // Build real recent activity from applications, partnerships, and announcements
    const recentActivity = [];
    connections.slice(0, 5).forEach((conn) => {
      recentActivity.push({
        id: conn._id,
        type: 'PARTNERSHIP',
        title: `Partnership Request: ${conn.status}`,
        subtitle: `Status: ${conn.status} · Requested by Agency`,
        createdAt: conn.createdAt || conn.respondedAt,
      });
    });

    applications.slice(0, 5).forEach((app) => {
      recentActivity.push({
        id: app._id,
        type: 'APPLICATION',
        title: `Application for ${app.program || 'Program'}`,
        subtitle: `Stage: ${app.stage} · Progress: ${app.progress || 0}%`,
        createdAt: app.createdAt || app.date,
      });
    });

    announcements.slice(0, 5).forEach((ann) => {
      recentActivity.push({
        id: ann._id,
        type: 'ANNOUNCEMENT',
        title: `Announcement: ${ann.title}`,
        subtitle: `Status: ${ann.status} · Program: ${ann.program || 'General'}`,
        createdAt: ann.createdAt || ann.publishDate,
      });
    });

    recentActivity.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    return res.status(200).json({
      success: true,
      data: {
        stats: {
          universityProfileStatus: req.user.uniRepVerificationStatus || 'PENDING',
          universityName: university?.name || 'Not Linked',
          activePrograms,
          connectedAgencies,
          pendingPartnershipRequests,
          acceptedPartnerships,
          totalApplications,
          pendingApplications,
          acceptedApplications,
          recentMessagesCount: messages.length,
          unreadNotifications,
          upcomingDeadlinesCount: upcomingDeadlines.length,
        },
        university,
        upcomingDeadlines: upcomingDeadlines.slice(0, 5),
        recentActivity: recentActivity.slice(0, 8),
        recentNotifications: notifications.slice(0, 5),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── 2. MY UNIVERSITY ─────────────────────────────────────────────────────────
// @desc    Get linked university details
// @route   GET /api/university-rep/university
// @access  Private (University Rep)
export const getUniRepUniversity = async (req, res, next) => {
  try {
    const university = await resolveUniversityForUser(req.user);
    if (!university) {
      return res.status(404).json({
        success: false,
        message: 'No verified university record found linked to your representative account.',
      });
    }

    return res.status(200).json({
      success: true,
      data: { university },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update permitted university profile information
// @route   PUT /api/university-rep/university
// @access  Private (University Rep)
export const updateUniRepUniversity = async (req, res, next) => {
  try {
    const university = await resolveUniversityForUser(req.user);
    if (!university) {
      return res.status(404).json({ success: false, message: 'University record not found.' });
    }

    // Guarded: representative can ONLY edit permitted profile info, NEVER identity or ownership
    const allowed = {};
    const editableFields = [
      'about', 'history', 'location', 'city', 'logo', 'coverImage', 'website',
      'facultyStudentRatio', 'acceptanceRate', 'totalStudents', 'internationalPct',
      'housing', 'facilities', 'clubs', 'careerServices', 'employmentRate',
      'averageStartingSalary', 'alumniNetwork', 'topEmployers', 'tags',
      'admissionReqs', 'costs', 'applicationDeadline', 'intakeSeasons'
    ];

    editableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        allowed[field] = req.body[field];
      }
    });

    let updatedUni = null;
    if (mongoose.connection.readyState === 1) {
      updatedUni = await University.findByIdAndUpdate(university._id, allowed, { new: true });
    } else {
      updatedUni = await devStore.updateUniversity(university._id, allowed);
    }

    await recordUniRepAuditLog({
      req,
      action: 'UPDATED_UNIVERSITY_PROFILE',
      module: 'university',
      targetType: 'University',
      targetId: university._id,
      targetName: university.name,
      newValue: allowed,
      reason: 'Representative updated institutional profile',
    });

    return res.status(200).json({
      success: true,
      message: 'University profile updated successfully.',
      data: { university: updatedUni },
    });
  } catch (error) {
    next(error);
  }
};

// ── 3. PROGRAMS & DEPARTMENTS ────────────────────────────────────────────────
// @desc    Get all academic catalog programs for representative's university
// @route   GET /api/university-rep/programs
// @access  Private (University Rep)
export const getUniRepPrograms = async (req, res, next) => {
  try {
    const university = await resolveUniversityForUser(req.user);
    if (!university) {
      return res.status(404).json({ success: false, message: 'University record not found.' });
    }

    const programs = Array.isArray(university.programs) ? university.programs : [];
    return res.status(200).json({
      success: true,
      count: programs.length,
      data: { programs, universityName: university.name },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new program in academic catalog
// @route   POST /api/university-rep/programs
// @access  Private (University Rep)
export const createUniRepProgram = async (req, res, next) => {
  try {
    const university = await resolveUniversityForUser(req.user);
    if (!university) {
      return res.status(404).json({ success: false, message: 'University record not found.' });
    }

    const {
      name, degree, department, subject, duration, tuitionFee, applicationFee,
      intake, deadline, eligibility, englishRequirement, requiredDocuments, scholarshipAvailability
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Program Name is required.' });
    }

    const newProgram = {
      _id: new mongoose.Types.ObjectId().toString(),
      name: name.trim(),
      degree: degree || 'Undergraduate',
      department: department?.trim() || '',
      subject: subject?.trim() || '',
      duration: duration?.trim() || '4 Years',
      tuitionFee: tuitionFee?.trim() || 'BDT 0',
      applicationFee: applicationFee?.trim() || 'BDT 0',
      intake: intake?.trim() || 'Fall',
      deadline: deadline?.trim() || 'Rolling Admissions',
      eligibility: eligibility?.trim() || '',
      englishRequirement: englishRequirement?.trim() || 'IELTS 6.0 / PTE 50',
      requiredDocuments: Array.isArray(requiredDocuments) ? requiredDocuments : ['Transcript', 'Passport'],
      scholarshipAvailability: Boolean(scholarshipAvailability),
      status: 'ACTIVE',
    };

    let updatedUni = null;
    if (mongoose.connection.readyState === 1) {
      university.programs.push(newProgram);
      await university.save();
      updatedUni = university;
    } else {
      const programs = Array.isArray(university.programs) ? [...university.programs, newProgram] : [newProgram];
      updatedUni = await devStore.updateUniversity(university._id, { programs });
    }

    await recordUniRepAuditLog({
      req,
      action: 'CREATED_PROGRAM',
      module: 'programs',
      targetType: 'Program',
      targetId: newProgram._id,
      targetName: newProgram.name,
      newValue: newProgram,
      reason: 'Representative added new degree program to catalog',
    });

    return res.status(201).json({
      success: true,
      message: 'Program added to university catalog successfully.',
      data: { program: newProgram, programs: updatedUni.programs },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update program in academic catalog
// @route   PUT /api/university-rep/programs/:id
// @access  Private (University Rep)
export const updateUniRepProgram = async (req, res, next) => {
  try {
    const university = await resolveUniversityForUser(req.user);
    if (!university) {
      return res.status(404).json({ success: false, message: 'University record not found.' });
    }

    const { id } = req.params;
    const programs = Array.isArray(university.programs) ? university.programs : [];
    const progIndex = programs.findIndex((p) => p._id?.toString() === id || p.id === id);

    if (progIndex === -1) {
      return res.status(404).json({ success: false, message: 'Program not found in this university catalog.' });
    }

    const prevProg = programs[progIndex];
    const updatedProg = {
      ...(prevProg.toObject ? prevProg.toObject() : prevProg),
      ...req.body,
      _id: prevProg._id,
    };

    let updatedUni = null;
    if (mongoose.connection.readyState === 1) {
      university.programs[progIndex] = updatedProg;
      await university.save();
      updatedUni = university;
    } else {
      programs[progIndex] = updatedProg;
      updatedUni = await devStore.updateUniversity(university._id, { programs });
    }

    await recordUniRepAuditLog({
      req,
      action: 'UPDATED_PROGRAM',
      module: 'programs',
      targetType: 'Program',
      targetId: id,
      targetName: updatedProg.name,
      previousValue: prevProg,
      newValue: updatedProg,
      reason: 'Representative updated program catalog details',
    });

    return res.status(200).json({
      success: true,
      message: 'Program updated successfully.',
      data: { program: updatedProg, programs: updatedUni.programs },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete program from academic catalog
// @route   DELETE /api/university-rep/programs/:id
// @access  Private (University Rep)
export const deleteUniRepProgram = async (req, res, next) => {
  try {
    const university = await resolveUniversityForUser(req.user);
    if (!university) {
      return res.status(404).json({ success: false, message: 'University record not found.' });
    }

    const { id } = req.params;
    const programs = Array.isArray(university.programs) ? university.programs : [];
    const progIndex = programs.findIndex((p) => p._id?.toString() === id || p.id === id);

    if (progIndex === -1) {
      return res.status(404).json({ success: false, message: 'Program not found in this university catalog.' });
    }

    const deleted = programs.splice(progIndex, 1)[0];

    let updatedUni = null;
    if (mongoose.connection.readyState === 1) {
      await university.save();
      updatedUni = university;
    } else {
      updatedUni = await devStore.updateUniversity(university._id, { programs });
    }

    await recordUniRepAuditLog({
      req,
      action: 'DELETED_PROGRAM',
      module: 'programs',
      targetType: 'Program',
      targetId: id,
      targetName: deleted?.name,
      reason: 'Representative deleted program from catalog',
    });

    return res.status(200).json({
      success: true,
      message: 'Program removed from catalog successfully.',
      data: { programs: updatedUni.programs },
    });
  } catch (error) {
    next(error);
  }
};

// ── 4. PARTNERSHIPS & CONNECTED AGENCIES ────────────────────────────────────
// @desc    Get all agency partnerships (pending, accepted, rejected, blocked)
// @route   GET /api/university-rep/partnerships
// @access  Private (University Rep)
export const getUniRepPartnerships = async (req, res, next) => {
  try {
    return getUniRepConnections(req, res, next);
  } catch (error) {
    next(error);
  }
};

// @desc    Get connected agencies (accepted connections only)
// @route   GET /api/university-rep/agencies
// @access  Private (University Rep)
export const getUniRepAgencies = async (req, res, next) => {
  try {
    const userId = req.user._id;
    let connections = [];

    if (mongoose.connection.readyState === 1) {
      connections = await UniversityAgencyConnection.find({
        universityRepresentativeId: userId,
        status: 'ACCEPTED',
      })
        .populate('agencyId', 'name email phone avatar status country city')
        .populate('agencyProfileId');
    } else {
      connections = await devStore.findAgencyConnections({
        universityRepresentativeId: userId,
        status: 'ACCEPTED',
      });
      for (const conn of connections) {
        if (!conn.agency && conn.agencyId) {
          conn.agency = await devStore.findUserById(conn.agencyId);
        }
        if (!conn.agencyProfile && conn.agencyId) {
          conn.agencyProfile = await devStore.findAgencyProfileByUserId(conn.agencyId);
        }
      }
    }

    return res.status(200).json({
      success: true,
      count: connections.length,
      data: { connectedAgencies: connections },
    });
  } catch (error) {
    next(error);
  }
};

// ── 5. APPLICATIONS & DOCUMENTS ──────────────────────────────────────────────
// @desc    Get applications submitted to this representative's verified university
// @route   GET /api/university-rep/applications
// @access  Private (University Rep)
export const getUniRepApplications = async (req, res, next) => {
  try {
    const university = await resolveUniversityForUser(req.user);
    if (!university) {
      return res.status(200).json({ success: true, count: 0, data: { applications: [] } });
    }

    let applications = [];

    if (mongoose.connection.readyState === 1) {
      applications = await Application.find({
        $or: [
          { university: new RegExp(`^${university.name}$`, 'i') },
          { universityId: university._id },
        ],
      })
        .populate('user', 'name email phone country gpa ielts')
        .populate('assignedAgency', 'name email phone')
        .populate('assignedAgent', 'name email phone');
    } else {
      const db = devStore.read();
      applications = (db.applications || []).filter(
        (a) =>
          a.university?.toLowerCase().trim() === university.name?.toLowerCase().trim() ||
          a.universityId?.toString() === university._id?.toString()
      );
      // Attach sanitized user information
      for (const app of applications) {
        if (app.user && typeof app.user === 'string') {
          const u = await devStore.findUserById(app.user);
          if (u) {
            app.student = {
              _id: u._id,
              name: u.name,
              email: u.email,
              phone: u.phone,
              country: u.country,
              gpa: u.gpa,
              ielts: u.ielts,
            };
          }
        }
      }
    }

    // STRICT SANITIZATION: Never expose student wallets, credits, or payment histories
    const sanitizedApps = applications.map((app) => {
      const a = app.toObject ? app.toObject() : { ...app };
      const student = a.user || a.student || {};
      delete student.password;
      delete student.walletCredits;
      delete student.freeCredits;
      delete student.paidCredits;
      delete student.creditTransactions;
      delete student.paymentOrders;

      return {
        _id: a._id,
        applicationId: a.applicationId || `APP-${a._id?.toString().slice(-6).toUpperCase()}`,
        student: {
          _id: student._id,
          name: student.name || 'Anonymous Student',
          email: student.email || '',
          phone: student.phone || '',
          country: student.country || a.country || 'International',
          gpa: student.gpa || 'N/A',
          ielts: student.ielts || 'N/A',
        },
        program: a.program,
        university: a.university,
        stage: a.stage,
        progress: a.progress || 25,
        steps: a.steps || [],
        intake: a.intake || 'Upcoming',
        country: a.country || university.country,
        date: a.date || a.createdAt,
        createdAt: a.createdAt,
        documents: a.documents || [],
        assignedAgency: a.assignedAgency,
        assignedAgent: a.assignedAgent,
      };
    });

    return res.status(200).json({
      success: true,
      count: sanitizedApps.length,
      data: { applications: sanitizedApps },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single application by ID for this university
// @route   GET /api/university-rep/applications/:id
// @access  Private (University Rep)
export const getUniRepApplicationById = async (req, res, next) => {
  try {
    const university = await resolveUniversityForUser(req.user);
    if (!university) {
      return res.status(404).json({ success: false, message: 'University record not found.' });
    }

    const { id } = req.params;
    let application = null;

    if (mongoose.connection.readyState === 1) {
      application = await Application.findById(id)
        .populate('user', 'name email phone country gpa ielts')
        .populate('assignedAgency', 'name email phone')
        .populate('assignedAgent', 'name email phone');
    } else {
      application = await devStore.findApplicationById(id);
      if (application && application.user) {
        const u = await devStore.findUserById(application.user);
        if (u) {
          application.student = {
            _id: u._id,
            name: u.name,
            email: u.email,
            phone: u.phone,
            country: u.country,
            gpa: u.gpa,
            ielts: u.ielts,
          };
        }
      }
    }

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    // STRICT UNIVERSITY OWNERSHIP CHECK
    const appUniName = application.university?.toLowerCase().trim();
    const myUniName = university.name?.toLowerCase().trim();
    const appUniId = application.universityId?.toString();
    const myUniId = university._id?.toString();

    if (appUniName !== myUniName && appUniId !== myUniId) {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: You can only view applications submitted to your verified university.',
      });
    }

    // Strip student financial data
    const a = application.toObject ? application.toObject() : { ...application };
    const student = a.user || a.student || {};
    delete student.walletCredits;
    delete student.freeCredits;
    delete student.paidCredits;

    const sanitized = {
      _id: a._id,
      applicationId: a.applicationId || `APP-${a._id?.toString().slice(-6).toUpperCase()}`,
      student: {
        _id: student._id,
        name: student.name,
        email: student.email,
        phone: student.phone,
        country: student.country,
        gpa: student.gpa,
        ielts: student.ielts,
      },
      program: a.program,
      university: a.university,
      stage: a.stage,
      progress: a.progress || 25,
      steps: a.steps || [],
      documents: a.documents || [],
      intake: a.intake,
      country: a.country,
      date: a.date || a.createdAt,
      assignedAgency: a.assignedAgency,
      assignedAgent: a.assignedAgent,
      notes: a.notes,
    };

    return res.status(200).json({
      success: true,
      data: { application: sanitized },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all documents for applications submitted to this university
// @route   GET /api/university-rep/documents
// @access  Private (University Rep)
export const getUniRepDocuments = async (req, res, next) => {
  try {
    const university = await resolveUniversityForUser(req.user);
    if (!university) {
      return res.status(200).json({ success: true, count: 0, data: { documents: [] } });
    }

    let applications = [];
    if (mongoose.connection.readyState === 1) {
      applications = await Application.find({
        $or: [
          { university: new RegExp(`^${university.name}$`, 'i') },
          { universityId: university._id },
        ],
      }).populate('user', 'name email');
    } else {
      const db = devStore.read();
      applications = (db.applications || []).filter(
        (a) =>
          a.university?.toLowerCase().trim() === university.name?.toLowerCase().trim() ||
          a.universityId?.toString() === university._id?.toString()
      );
      for (const a of applications) {
        if (a.user) a.user = await devStore.findUserById(a.user);
      }
    }

    const documentRepository = [];
    applications.forEach((app) => {
      const docs = Array.isArray(app.documents) ? app.documents : [];
      docs.forEach((doc, idx) => {
        documentRepository.push({
          id: `${app._id}-${idx}`,
          applicationId: app.applicationId || app._id,
          studentName: app.user?.name || 'Applicant',
          studentEmail: app.user?.email || '',
          program: app.program,
          documentName: doc.name || doc.title || 'Document',
          documentType: doc.type || 'Academic / Identity',
          url: doc.url || doc.fileData || '',
          verified: Boolean(doc.verified),
          uploadedAt: doc.uploadedAt || app.createdAt,
        });
      });
    });

    return res.status(200).json({
      success: true,
      count: documentRepository.length,
      data: { documents: documentRepository },
    });
  } catch (error) {
    next(error);
  }
};

// ── 6. MESSAGING ─────────────────────────────────────────────────────────────
// @desc    Get messages involving this representative
// @route   GET /api/university-rep/messages
// @access  Private (University Rep)
export const getUniRepMessages = async (req, res, next) => {
  try {
    const userId = req.user._id.toString();
    let messages = [];

    if (mongoose.connection.readyState === 1) {
      messages = await ChatMessage.find({
        $or: [{ user: req.user._id }, { receiver: req.user._id }],
      }).sort({ createdAt: 1 });
    } else {
      const db = devStore.read();
      messages = (db.chatMessages || []).filter(
        (m) => m.user?.toString() === userId || m.receiver?.toString() === userId
      );
    }

    return res.status(200).json({
      success: true,
      count: messages.length,
      data: { messages },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send message from university representative
// @route   POST /api/university-rep/messages
// @access  Private (University Rep)
export const sendUniRepMessage = async (req, res, next) => {
  try {
    const { receiverId, text, sessionId } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Message text is required.' });
    }

    const payload = {
      user: req.user._id,
      sender: 'agent', // ChatMessage schema enum: ['user', 'ai', 'agent']
      receiver: receiverId || null,
      text: text.trim(),
      sessionId: sessionId || `SESSION-UREP-${req.user._id}-${Date.now()}`,
      createdAt: new Date(),
    };

    let newMsg = null;
    if (mongoose.connection.readyState === 1) {
      newMsg = await ChatMessage.create(payload);
    } else {
      newMsg = await devStore.addChatMessage(payload);
    }

    return res.status(201).json({
      success: true,
      data: { message: newMsg },
    });
  } catch (error) {
    next(error);
  }
};

// ── 7. ANNOUNCEMENTS ─────────────────────────────────────────────────────────
// @desc    Get announcements created for this university
// @route   GET /api/university-rep/announcements
// @access  Private (University Rep)
export const getUniRepAnnouncements = async (req, res, next) => {
  try {
    const university = await resolveUniversityForUser(req.user);
    if (!university) {
      return res.status(200).json({ success: true, count: 0, data: { announcements: [] } });
    }

    let announcements = [];
    if (mongoose.connection.readyState === 1) {
      announcements = await Announcement.find({ university: university._id }).sort({ createdAt: -1 });
    } else {
      announcements = await devStore.findAnnouncements({ university: university._id });
    }

    return res.status(200).json({
      success: true,
      count: announcements.length,
      data: { announcements },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new announcement for connected agencies
// @route   POST /api/university-rep/announcements
// @access  Private (University Rep)
export const createUniRepAnnouncement = async (req, res, next) => {
  try {
    const university = await resolveUniversityForUser(req.user);
    if (!university) {
      return res.status(404).json({ success: false, message: 'University record not found.' });
    }

    const { title, description, program, targetAgencies, isPublicToConnected, expiryDate } = req.body;
    if (!title?.trim() || !description?.trim()) {
      return res.status(400).json({ success: false, message: 'Title and Description are required.' });
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      university: university._id,
      universityName: university.name,
      universityRepresentative: req.user._id,
      program: program?.trim() || 'All Programs',
      targetAgencies: Array.isArray(targetAgencies) ? targetAgencies : [],
      isPublicToConnected: isPublicToConnected !== undefined ? Boolean(isPublicToConnected) : true,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      status: 'ACTIVE',
    };

    let announcement = null;
    if (mongoose.connection.readyState === 1) {
      announcement = await Announcement.create(payload);
    } else {
      announcement = await devStore.createAnnouncement(payload);
    }

    await recordUniRepAuditLog({
      req,
      action: 'CREATED_ANNOUNCEMENT',
      module: 'announcements',
      targetType: 'Announcement',
      targetId: announcement._id,
      targetName: announcement.title,
      newValue: announcement,
      reason: 'Representative published official university announcement',
    });

    return res.status(201).json({
      success: true,
      message: 'Announcement published successfully.',
      data: { announcement },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update announcement
// @route   PUT /api/university-rep/announcements/:id
// @access  Private (University Rep)
export const updateUniRepAnnouncement = async (req, res, next) => {
  try {
    const { id } = req.params;
    let announcement = null;

    if (mongoose.connection.readyState === 1) {
      announcement = await Announcement.findById(id);
    } else {
      announcement = await devStore.findAnnouncementById(id);
    }

    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found.' });
    }

    // Security check: Must belong to representative's university
    const university = await resolveUniversityForUser(req.user);
    if (announcement.university?.toString() !== university?._id?.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this announcement.' });
    }

    const updates = { ...req.body };
    delete updates.university;
    delete updates.universityRepresentative;

    let updated = null;
    if (mongoose.connection.readyState === 1) {
      updated = await Announcement.findByIdAndUpdate(id, updates, { new: true });
    } else {
      updated = await devStore.updateAnnouncement(id, updates);
    }

    return res.status(200).json({
      success: true,
      message: 'Announcement updated successfully.',
      data: { announcement: updated },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete announcement
// @route   DELETE /api/university-rep/announcements/:id
// @access  Private (University Rep)
export const deleteUniRepAnnouncement = async (req, res, next) => {
  try {
    const { id } = req.params;
    let announcement = null;

    if (mongoose.connection.readyState === 1) {
      announcement = await Announcement.findById(id);
    } else {
      announcement = await devStore.findAnnouncementById(id);
    }

    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found.' });
    }

    const university = await resolveUniversityForUser(req.user);
    if (announcement.university?.toString() !== university?._id?.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this announcement.' });
    }

    if (mongoose.connection.readyState === 1) {
      await Announcement.findByIdAndDelete(id);
    } else {
      await devStore.deleteAnnouncement(id);
    }

    return res.status(200).json({
      success: true,
      message: 'Announcement deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// ── 8. SCHOLARSHIPS ──────────────────────────────────────────────────────────
// @desc    Get scholarships for this university
// @route   GET /api/university-rep/scholarships
// @access  Private (University Rep)
export const getUniRepScholarships = async (req, res, next) => {
  try {
    const university = await resolveUniversityForUser(req.user);
    if (!university) {
      return res.status(200).json({ success: true, count: 0, data: { scholarships: [] } });
    }

    let scholarships = [];
    if (mongoose.connection.readyState === 1) {
      scholarships = await Scholarship.find({
        $or: [
          { universityId: university._id },
          { sponsor: new RegExp(`^${university.name}$`, 'i') },
        ],
      }).sort({ createdAt: -1 });
    } else {
      const db = devStore.read();
      scholarships = (db.scholarships || []).filter(
        (s) =>
          s.universityId?.toString() === university._id?.toString() ||
          s.sponsor?.toLowerCase().trim() === university.name?.toLowerCase().trim()
      );
    }

    return res.status(200).json({
      success: true,
      count: scholarships.length,
      data: { scholarships, universityName: university.name },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create scholarship for this university
// @route   POST /api/university-rep/scholarships
// @access  Private (University Rep)
export const createUniRepScholarship = async (req, res, next) => {
  try {
    const university = await resolveUniversityForUser(req.user);
    if (!university) {
      return res.status(404).json({ success: false, message: 'University record not found.' });
    }

    const {
      title, amount, coverage, eligibility, deadline, studyLevel, requirements, applicationMethod, officialLink, description
    } = req.body;

    if (!title?.trim() || !amount?.trim() || !eligibility?.trim() || !deadline?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Scholarship Title, Amount, Eligibility, and Deadline are required.',
      });
    }

    const payload = {
      title: title.trim(),
      sponsor: university.name,
      amount: amount.trim(),
      coverage: coverage?.trim() || 'Partial Tuition',
      eligibility: eligibility.trim(),
      deadline: deadline.trim(),
      studyLevel: studyLevel || 'Undergraduate',
      requirements: requirements?.trim() || '',
      applicationMethod: applicationMethod?.trim() || 'Online Portal',
      officialLink: officialLink?.trim() || '',
      description: description?.trim() || '',
      universityId: university._id,
      universityName: university.name,
      status: 'Eligible',
      match: '95%',
      type: 'merit',
      country: university.country,
    };

    let scholarship = null;
    if (mongoose.connection.readyState === 1) {
      scholarship = await Scholarship.create(payload);
    } else {
      scholarship = await devStore.createScholarship(payload);
    }

    await recordUniRepAuditLog({
      req,
      action: 'CREATED_SCHOLARSHIP',
      module: 'scholarships',
      targetType: 'Scholarship',
      targetId: scholarship._id,
      targetName: scholarship.title,
      newValue: scholarship,
      reason: 'Representative added new university scholarship award',
    });

    return res.status(201).json({
      success: true,
      message: 'Scholarship created successfully.',
      data: { scholarship },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update scholarship
// @route   PUT /api/university-rep/scholarships/:id
// @access  Private (University Rep)
export const updateUniRepScholarship = async (req, res, next) => {
  try {
    const { id } = req.params;
    const university = await resolveUniversityForUser(req.user);

    let scholarship = null;
    if (mongoose.connection.readyState === 1) {
      scholarship = await Scholarship.findById(id);
    } else {
      scholarship = await devStore.findScholarshipById(id);
    }

    if (!scholarship) {
      return res.status(404).json({ success: false, message: 'Scholarship not found.' });
    }

    // Enforce university ownership
    if (scholarship.universityId && scholarship.universityId.toString() !== university?._id?.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this scholarship.' });
    }

    const updates = { ...req.body };
    delete updates.universityId; // Prevent reassignment

    let updated = null;
    if (mongoose.connection.readyState === 1) {
      updated = await Scholarship.findByIdAndUpdate(id, updates, { new: true });
    } else {
      updated = await devStore.updateScholarship(id, updates);
    }

    return res.status(200).json({
      success: true,
      message: 'Scholarship updated successfully.',
      data: { scholarship: updated },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete scholarship
// @route   DELETE /api/university-rep/scholarships/:id
// @access  Private (University Rep)
export const deleteUniRepScholarship = async (req, res, next) => {
  try {
    const { id } = req.params;
    const university = await resolveUniversityForUser(req.user);

    let scholarship = null;
    if (mongoose.connection.readyState === 1) {
      scholarship = await Scholarship.findById(id);
    } else {
      scholarship = await devStore.findScholarshipById(id);
    }

    if (!scholarship) {
      return res.status(404).json({ success: false, message: 'Scholarship not found.' });
    }

    if (scholarship.universityId && scholarship.universityId.toString() !== university?._id?.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this scholarship.' });
    }

    if (mongoose.connection.readyState === 1) {
      await Scholarship.findByIdAndDelete(id);
    } else {
      await devStore.deleteScholarship(id);
    }

    return res.status(200).json({
      success: true,
      message: 'Scholarship removed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// ── 9. INTAKES & DEADLINES ───────────────────────────────────────────────────
// @desc    Get intake admission cycles and deadlines
// @route   GET /api/university-rep/intakes
// @access  Private (University Rep)
export const getUniRepIntakes = async (req, res, next) => {
  try {
    const university = await resolveUniversityForUser(req.user);
    if (!university) {
      return res.status(404).json({ success: false, message: 'University record not found.' });
    }

    const intakes = Array.isArray(university.intakesList) ? university.intakesList : [];
    return res.status(200).json({
      success: true,
      count: intakes.length,
      data: { intakes, universityName: university.name },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create intake admission cycle
// @route   POST /api/university-rep/intakes
// @access  Private (University Rep)
export const createUniRepIntake = async (req, res, next) => {
  try {
    const university = await resolveUniversityForUser(req.user);
    if (!university) {
      return res.status(404).json({ success: false, message: 'University record not found.' });
    }

    const {
      name, studyLevel, program, openDate, deadline, scholarshipDeadline, documentDeadline, expectedDecisionDate, status
    } = req.body;

    if (!name?.trim() || !deadline?.trim()) {
      return res.status(400).json({ success: false, message: 'Intake Name and Application Deadline are required.' });
    }

    const newIntake = {
      _id: new mongoose.Types.ObjectId().toString(),
      name: name.trim(),
      studyLevel: studyLevel || 'All Levels',
      program: program?.trim() || 'All Programs',
      openDate: openDate?.trim() || '',
      deadline: deadline.trim(),
      scholarshipDeadline: scholarshipDeadline?.trim() || '',
      documentDeadline: documentDeadline?.trim() || '',
      expectedDecisionDate: expectedDecisionDate?.trim() || '',
      status: status || 'OPEN',
    };

    let updatedUni = null;
    if (mongoose.connection.readyState === 1) {
      if (!Array.isArray(university.intakesList)) university.intakesList = [];
      university.intakesList.push(newIntake);
      await university.save();
      updatedUni = university;
    } else {
      const intakes = Array.isArray(university.intakesList) ? [...university.intakesList, newIntake] : [newIntake];
      updatedUni = await devStore.updateUniversity(university._id, { intakesList: intakes });
    }

    await recordUniRepAuditLog({
      req,
      action: 'CREATED_INTAKE',
      module: 'intakes',
      targetType: 'Intake',
      targetId: newIntake._id,
      targetName: newIntake.name,
      newValue: newIntake,
      reason: 'Representative added new intake cycle and deadlines',
    });

    return res.status(201).json({
      success: true,
      message: 'Intake cycle created successfully.',
      data: { intake: newIntake, intakes: updatedUni.intakesList },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update intake admission cycle
// @route   PUT /api/university-rep/intakes/:id
// @access  Private (University Rep)
export const updateUniRepIntake = async (req, res, next) => {
  try {
    const university = await resolveUniversityForUser(req.user);
    if (!university) {
      return res.status(404).json({ success: false, message: 'University record not found.' });
    }

    const { id } = req.params;
    const intakes = Array.isArray(university.intakesList) ? university.intakesList : [];
    const intkIdx = intakes.findIndex((i) => i._id?.toString() === id || i.id === id);

    if (intkIdx === -1) {
      return res.status(404).json({ success: false, message: 'Intake cycle not found.' });
    }

    const prevIntk = intakes[intkIdx];
    const updatedIntk = {
      ...(prevIntk.toObject ? prevIntk.toObject() : prevIntk),
      ...req.body,
      _id: prevIntk._id,
    };

    let updatedUni = null;
    if (mongoose.connection.readyState === 1) {
      university.intakesList[intkIdx] = updatedIntk;
      await university.save();
      updatedUni = university;
    } else {
      intakes[intkIdx] = updatedIntk;
      updatedUni = await devStore.updateUniversity(university._id, { intakesList: intakes });
    }

    return res.status(200).json({
      success: true,
      message: 'Intake cycle updated successfully.',
      data: { intake: updatedIntk, intakes: updatedUni.intakesList },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete intake admission cycle
// @route   DELETE /api/university-rep/intakes/:id
// @access  Private (University Rep)
export const deleteUniRepIntake = async (req, res, next) => {
  try {
    const university = await resolveUniversityForUser(req.user);
    if (!university) {
      return res.status(404).json({ success: false, message: 'University record not found.' });
    }

    const { id } = req.params;
    const intakes = Array.isArray(university.intakesList) ? university.intakesList : [];
    const intkIdx = intakes.findIndex((i) => i._id?.toString() === id || i.id === id);

    if (intkIdx === -1) {
      return res.status(404).json({ success: false, message: 'Intake cycle not found.' });
    }

    intakes.splice(intkIdx, 1);

    let updatedUni = null;
    if (mongoose.connection.readyState === 1) {
      await university.save();
      updatedUni = university;
    } else {
      updatedUni = await devStore.updateUniversity(university._id, { intakesList: intakes });
    }

    return res.status(200).json({
      success: true,
      message: 'Intake cycle deleted successfully.',
      data: { intakes: updatedUni.intakesList },
    });
  } catch (error) {
    next(error);
  }
};

// ── 10. ANALYTICS ────────────────────────────────────────────────────────────
// @desc    Get real university recruitment and admissions analytics
// @route   GET /api/university-rep/analytics
// @access  Private (University Rep)
export const getUniRepAnalytics = async (req, res, next) => {
  try {
    const university = await resolveUniversityForUser(req.user);
    if (!university) {
      return res.status(404).json({ success: false, message: 'University record not found.' });
    }

    let applications = [];
    let connections = [];

    if (mongoose.connection.readyState === 1) {
      applications = await Application.find({
        $or: [
          { university: new RegExp(`^${university.name}$`, 'i') },
          { universityId: university._id },
        ],
      }).populate('assignedAgency', 'name');
      connections = await UniversityAgencyConnection.find({
        universityRepresentativeId: req.user._id,
      });
    } else {
      const db = devStore.read();
      applications = (db.applications || []).filter(
        (a) =>
          a.university?.toLowerCase().trim() === university.name?.toLowerCase().trim() ||
          a.universityId?.toString() === university._id?.toString()
      );
      connections = (db.universityAgencyConnections || []).filter(
        (c) => c.universityRepresentativeId?.toString() === req.user._id.toString()
      );
    }

    // Real breakdowns
    const byCountry = {};
    const byProgram = {};
    const byAgency = {};
    const byIntake = {};
    const stageCounts = {
      Submitted: 0,
      'Documents Pending': 0,
      'In Review': 0,
      Accepted: 0,
      Rejected: 0,
      Waitlisted: 0,
    };

    applications.forEach((app) => {
      const country = app.country || 'Global';
      byCountry[country] = (byCountry[country] || 0) + 1;

      const program = app.program || 'General';
      byProgram[program] = (byProgram[program] || 0) + 1;

      const agencyName = app.assignedAgency?.name || (app.assignedAgency ? 'Partner Agency' : 'Direct / Self');
      byAgency[agencyName] = (byAgency[agencyName] || 0) + 1;

      const intake = app.intake || 'General';
      byIntake[intake] = (byIntake[intake] || 0) + 1;

      if (stageCounts[app.stage] !== undefined) {
        stageCounts[app.stage]++;
      } else {
        stageCounts[app.stage] = 1;
      }
    });

    return res.status(200).json({
      success: true,
      data: {
        totalApplications: applications.length,
        connectedAgenciesCount: connections.filter((c) => c.status === 'ACCEPTED').length,
        offersAccepted: stageCounts.Accepted || 0,
        inReview: stageCounts['In Review'] || 0,
        pending: (stageCounts.Submitted || 0) + (stageCounts['Documents Pending'] || 0),
        rejected: stageCounts.Rejected || 0,
        byCountry: Object.entries(byCountry).map(([country, count]) => ({ country, count })),
        byProgram: Object.entries(byProgram).map(([program, count]) => ({ program, count })),
        byAgency: Object.entries(byAgency).map(([agency, count]) => ({ agency, count })),
        byIntake: Object.entries(byIntake).map(([intake, count]) => ({ intake, count })),
        stageBreakdown: stageCounts,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── 11. NOTIFICATIONS ────────────────────────────────────────────────────────
// @desc    Get notifications for university representative
// @route   GET /api/university-rep/notifications
// @access  Private (University Rep)
export const getUniRepNotifications = async (req, res, next) => {
  try {
    const userId = req.user._id.toString();
    let notifications = [];

    if (mongoose.connection.readyState === 1) {
      notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
    } else {
      const db = devStore.read();
      notifications = (db.notifications || []).filter((n) => n.user?.toString() === userId);
    }

    return res.status(200).json({
      success: true,
      count: notifications.length,
      data: { notifications },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark single notification as read
// @route   PUT /api/university-rep/notifications/:id/read
// @access  Private (University Rep)
export const markUniRepNotificationRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (mongoose.connection.readyState === 1) {
      await Notification.findOneAndUpdate({ _id: id, user: req.user._id }, { read: true, isRead: true });
    } else {
      await devStore.markNotificationRead(id);
    }

    return res.status(200).json({ success: true, message: 'Notification marked as read.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/university-rep/notifications/read-all
// @access  Private (University Rep)
export const markAllUniRepNotificationsRead = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      await Notification.updateMany({ user: req.user._id }, { read: true, isRead: true });
    } else {
      const db = devStore.read();
      if (Array.isArray(db.notifications)) {
        db.notifications.forEach((n) => {
          if (n.user?.toString() === req.user._id.toString()) {
            n.read = true;
            n.isRead = true;
          }
        });
        devStore.write(db);
      }
    }

    return res.status(200).json({ success: true, message: 'All notifications marked as read.' });
  } catch (error) {
    next(error);
  }
};

// ── 12. REPORTS / ISSUES ─────────────────────────────────────────────────────
// @desc    Get reports submitted by this representative
// @route   GET /api/university-rep/reports
// @access  Private (University Rep)
export const getUniRepReports = async (req, res, next) => {
  try {
    const userId = req.user._id.toString();
    let reports = [];

    if (mongoose.connection.readyState === 1) {
      reports = await Report.find({ reportedBy: req.user._id }).sort({ createdAt: -1 });
    } else {
      const db = devStore.read();
      reports = (db.reports || []).filter((r) => r.reportedBy?.toString() === userId);
    }

    return res.status(200).json({
      success: true,
      count: reports.length,
      data: { reports },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit issue report to platform Admin
// @route   POST /api/university-rep/reports
// @access  Private (University Rep)
export const createUniRepReport = async (req, res, next) => {
  try {
    const { title, description, category, priority, targetType, targetId, targetName } = req.body;
    if (!title?.trim() || !description?.trim()) {
      return res.status(400).json({ success: false, message: 'Report Title and Description are required.' });
    }

    const reportId = `REP-UR-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    const payload = {
      reportId,
      reportedBy: req.user._id,
      reporterName: req.user.name,
      reporterEmail: req.user.email,
      reporterRole: 'university_rep',
      title: title.trim(),
      description: description.trim(),
      category: category || 'General Operational Issue',
      priority: priority || 'MEDIUM',
      targetType: targetType || 'service_issue',
      targetId: targetId || '',
      targetName: targetName || '',
      status: 'PENDING',
    };

    let newReport = null;
    if (mongoose.connection.readyState === 1) {
      newReport = await Report.create(payload);
    } else {
      newReport = await devStore.createReport(payload);
    }

    await recordUniRepAuditLog({
      req,
      action: 'SUBMITTED_ISSUE_REPORT',
      module: 'reports',
      targetType: 'Report',
      targetId: newReport._id || reportId,
      targetName: title,
      reason: 'Representative submitted operational issue report to Admin',
    });

    return res.status(201).json({
      success: true,
      message: 'Report submitted successfully to Admify administration.',
      data: { report: newReport },
    });
  } catch (error) {
    next(error);
  }
};

// ── 13. SETTINGS ─────────────────────────────────────────────────────────────
// @desc    Update representative settings (password, contact, notification prefs)
// @route   PUT /api/university-rep/settings
// @access  Private (University Rep)
export const updateUniRepSettings = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, emailAlerts, partnershipAlerts, applicationAlerts } = req.body;
    const userId = req.user._id;

    // Password change flow
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ success: false, message: 'Current password is required to set a new password.' });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long.' });
      }

      let user = null;
      if (mongoose.connection.readyState === 1) {
        user = await User.findById(userId);
      } else {
        user = await devStore.findUserById(userId);
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Incorrect current password.' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      if (mongoose.connection.readyState === 1) {
        user.password = hashedPassword;
        await user.save();
      } else {
        await devStore.updateUser(userId, { password: hashedPassword });
      }
    }

    // Notification preferences flow
    const prefs = {
      emailAlerts: emailAlerts !== undefined ? Boolean(emailAlerts) : true,
      partnershipAlerts: partnershipAlerts !== undefined ? Boolean(partnershipAlerts) : true,
      applicationAlerts: applicationAlerts !== undefined ? Boolean(applicationAlerts) : true,
    };

    if (mongoose.connection.readyState === 1) {
      await User.findByIdAndUpdate(userId, { notificationPreferences: prefs });
    } else {
      await devStore.updateUser(userId, { notificationPreferences: prefs });
    }

    await recordUniRepAuditLog({
      req,
      action: 'UPDATED_SETTINGS',
      module: 'settings',
      targetType: 'User',
      targetId: userId,
      reason: 'Representative updated security settings and notification preferences',
    });

    return res.status(200).json({
      success: true,
      message: 'Settings updated successfully.',
      data: { preferences: prefs },
    });
  } catch (error) {
    next(error);
  }
};

