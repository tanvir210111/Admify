import mongoose from 'mongoose';
import AgencyProfile from '../models/AgencyProfile.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import AgentApplication from '../models/AgentApplication.js';
import UniversityAgencyConnection from '../models/UniversityAgencyConnection.js';
import University from '../models/University.js';
import Application from '../models/Application.js';
import AgencyServiceOrder from '../models/AgencyServiceOrder.js';
import AuditLog from '../models/AuditLog.js';
import Report from '../models/Report.js';
import ChatMessage from '../models/ChatMessage.js';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import devStore from '../utils/devStore.js';

// Sanitize payload to prevent any client-side privilege escalation
const sanitizeAgencyInput = (body) => {
  const allowed = { ...body };
  delete allowed.verificationStatus;
  delete allowed.reviewedAt;
  delete allowed.reviewedBy;
  delete allowed.rejectionReason;
  delete allowed.adminNotes;
  delete allowed.user;
  delete allowed._id;
  delete allowed.createdAt;
  delete allowed.updatedAt;
  delete allowed.statusHistory;
  return allowed;
};

// Helper to validate document file format and binary size limits
const validateDocument = (doc, label, maxSizeBytes = 3.5 * 1024 * 1024) => {
  if (!doc) return null;
  // If doc is string data URL (like logo)
  const fileData = typeof doc === 'string' ? doc : doc.fileData;
  const fileType = typeof doc === 'object' ? doc.fileType : '';

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

  // Base64 binary size calculation: length * (3/4)
  const base64Str = fileData.includes(',') ? fileData.split(',')[1] : fileData;
  const approxBytes = Math.ceil((base64Str.length * 3) / 4);

  if (approxBytes > maxSizeBytes) {
    const maxMb = (maxSizeBytes / (1024 * 1024)).toFixed(1);
    return `${label} is too large. Maximum allowed size is ${maxMb}MB.`;
  }

  return null;
};

// Helper to notify all Admins of new agency verification submission
const notifyAdminsOfVerification = async ({ profile, agencyName, applicationId }) => {
  const title = 'New Agency Verification Request';
  const message = `A new agency registration has been submitted by "${agencyName}" (App ID: ${applicationId}) and is waiting for review.`;
  const link = '/admin/agents';

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

// @desc    Get current agency verification profile & status
// @route   GET /api/agency/verification
// @access  Private (Agency role or Agency Registration Token)
export const getAgencyVerification = async (req, res) => {
  try {
    let profile = null;
    if (mongoose.connection.readyState === 1) {
      profile = await AgencyProfile.findOne({ user: req.user._id });
    } else {
      profile = await devStore.findAgencyProfileByUserId(req.user._id);
    }

    if (!profile) {
      // Return default template with user's initial registration info
      const applicationId = req.applicationId || `ADM-AGY-2026-${Date.now().toString(36).toUpperCase().slice(-4)}`;
      return res.status(200).json({
        success: true,
        applicationId,
        verificationStatus: req.user.agencyVerificationStatus || 'PENDING',
        accountStatus: req.user.accountStatus || 'PENDING',
        profile: {
          applicationId,
          agencyName: req.user.name || '',
          officialBusinessEmail: req.user.email || '',
          authorizedPerson: {
            phone: req.user.phone || '',
            email: req.user.email || '',
          },
          verificationStatus: req.user.agencyVerificationStatus || 'PENDING',
          isDraft: true,
        },
      });
    }

    res.status(200).json({
      success: true,
      applicationId: profile.applicationId,
      verificationStatus: profile.verificationStatus,
      accountStatus: req.user.accountStatus || 'PENDING',
      profile,
    });
  } catch (error) {
    console.error('Error in getAgencyVerification:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving agency verification profile',
      error: error.message,
    });
  }
};

// @desc    Save agency verification draft
// @route   PUT /api/agency/verification/draft
// @access  Private (Agency role or Agency Registration Token)
export const saveAgencyDraft = async (req, res) => {
  try {
    const cleanData = sanitizeAgencyInput(req.body);

    if (mongoose.connection.readyState === 1) {
      let profile = await AgencyProfile.findOne({ user: req.user._id });

      if (profile) {
        if (profile.verificationStatus === 'VERIFIED') {
          return res.status(400).json({
            success: false,
            message: 'Agency is already verified. Updates require admin assistance.',
          });
        }

        Object.assign(profile, cleanData);
        profile.isDraft = true;
        await profile.save();
      } else {
        const applicationId = req.applicationId || `ADM-AGY-2026-${Date.now().toString(36).toUpperCase().slice(-4)}`;
        profile = await AgencyProfile.create({
          ...cleanData,
          agencyName: cleanData.agencyName || req.user.name,
          user: req.user._id,
          applicationId,
          isDraft: true,
          verificationStatus: 'PENDING',
        });

        await User.findByIdAndUpdate(req.user._id, {
          agencyProfile: profile._id,
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Agency verification draft saved successfully.',
        applicationId: profile.applicationId,
        profile,
      });
    } else {
      // devStore fallback
      let profile = await devStore.findAgencyProfileByUserId(req.user._id);
      if (profile && profile.verificationStatus === 'VERIFIED') {
        return res.status(400).json({
          success: false,
          message: 'Agency is already verified. Updates require admin assistance.',
        });
      }

      const applicationId = profile?.applicationId || req.applicationId || `ADM-AGY-2026-${Date.now().toString(36).toUpperCase().slice(-4)}`;
      profile = await devStore.saveAgencyProfile({
        ...cleanData,
        agencyName: cleanData.agencyName || req.user.name,
        user: req.user._id,
        applicationId,
        isDraft: true,
        verificationStatus: profile?.verificationStatus || 'PENDING',
      });

      await devStore.updateUser(req.user._id, {
        agencyProfile: profile._id,
      });

      return res.status(200).json({
        success: true,
        message: 'Agency verification draft saved successfully.',
        applicationId: profile.applicationId,
        profile,
      });
    }
  } catch (error) {
    console.error('Error in saveAgencyDraft:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save verification draft',
      error: error.message,
    });
  }
};

// @desc    Submit agency profile for verification
// @route   POST /api/agency/verification
// @access  Private (Agency role or Agency Registration Token)
export const submitAgencyVerification = async (req, res) => {
  try {
    const cleanData = sanitizeAgencyInput(req.body);

    // Validation checks
    const errors = [];

    // Step 1: Basic Information
    if (!cleanData.agencyName?.trim()) errors.push('Agency Name is required');
    if (!cleanData.legalName?.trim()) errors.push('Official/Legal Agency Name is required');
    if (!cleanData.agencyType) errors.push('Agency Type is required');
    if (!cleanData.yearEstablished) errors.push('Year Established is required');
    if (!cleanData.officeAddress?.trim()) errors.push('Office Address is required');
    if (!cleanData.country?.trim()) errors.push('Country is required');
    if (!cleanData.city?.trim()) errors.push('City is required');
    if (!cleanData.officialBusinessEmail?.trim()) errors.push('Official Business Email is required');

    // Step 2: Authorized Person
    const auth = cleanData.authorizedPerson || {};
    if (!auth.fullName?.trim()) errors.push('Authorized Person Full Name is required');
    if (!auth.designation) errors.push('Authorized Person Designation is required');
    if (!auth.phone?.trim()) errors.push('Authorized Person Phone Number is required');
    if (!auth.email?.trim()) errors.push('Authorized Person Email Address is required');
    if (!auth.identityNumber?.trim()) errors.push('NID/Passport Number is required');
    if (!auth.identityDocument?.fileData && !auth.identityDocument?.fileName) {
      errors.push('NID/Passport Copy document is required');
    } else {
      const nidErr = validateDocument(auth.identityDocument, 'NID / Passport Copy', 3.5 * 1024 * 1024);
      if (nidErr) errors.push(nidErr);
    }

    // Step 3: Business Verification (supports international and country-specific documents)
    const biz = cleanData.businessVerification || {};
    if (!biz.tradeLicenseNumber?.trim()) errors.push('Trade License Number is required');
    if (!biz.tradeLicenseDocument?.fileData && !biz.tradeLicenseDocument?.fileName) {
      errors.push('Trade License Copy document is required');
    } else {
      const tradeErr = validateDocument(biz.tradeLicenseDocument, 'Trade License Copy', 3.5 * 1024 * 1024);
      if (tradeErr) errors.push(tradeErr);
    }

    if (biz.businessRegistrationDocument?.fileData) {
      const bizRegErr = validateDocument(biz.businessRegistrationDocument, 'Business Registration Certificate', 3.5 * 1024 * 1024);
      if (bizRegErr) errors.push(bizRegErr);
    }

    if (biz.tinDocument?.fileData) {
      const tinErr = validateDocument(biz.tinDocument, 'TIN Certificate', 3.5 * 1024 * 1024);
      if (tinErr) errors.push(tinErr);
    }

    if (cleanData.logo) {
      const logoErr = validateDocument(cleanData.logo, 'Agency Logo', 2 * 1024 * 1024);
      if (logoErr) errors.push(logoErr);
    }

    // Step 4: Agency Profile
    if (!cleanData.about?.trim()) errors.push('About Agency description is required');
    if (!Array.isArray(cleanData.countriesServed) || cleanData.countriesServed.length === 0) {
      errors.push('At least one destination Country Served must be selected');
    }
    if (!Array.isArray(cleanData.servicesOffered) || cleanData.servicesOffered.length === 0) {
      errors.push('At least one Service Offered must be selected');
    }

    // Step 5: Experience & Capacity
    const exp = cleanData.experience || {};
    if (exp.yearsOfExperience === undefined || exp.yearsOfExperience === null || exp.yearsOfExperience < 0) {
      errors.push('Years of Experience is required');
    }
    if (exp.numberOfCounselors === undefined || exp.numberOfCounselors === null || exp.numberOfCounselors < 1) {
      errors.push('Number of Counselors/Agents is required (at least 1)');
    }

    // Step 6: Declarations
    if (!cleanData.declarationsAccepted) {
      errors.push('You must accept both verification declaration checkboxes to submit');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed. Please review the highlighted fields.',
        errors,
      });
    }

    const now = new Date();

    if (mongoose.connection.readyState === 1) {
      let profile = await AgencyProfile.findOne({ user: req.user._id });

      const applicationId =
        profile?.applicationId ||
        req.applicationId ||
        `ADM-AGY-2026-${Date.now().toString(36).toUpperCase().slice(-4)}${Math.floor(1000 + Math.random() * 9000)}`;

      if (profile) {
        if (profile.verificationStatus === 'VERIFIED') {
          return res.status(400).json({
            success: false,
            message: 'Agency is already verified.',
          });
        }

        Object.assign(profile, cleanData);
        profile.applicationId = applicationId;
        profile.verificationStatus = 'UNDER_REVIEW';
        profile.isDraft = false;
        profile.submittedAt = now;
        profile.rejectionReason = ''; // Clear previous rejection reason upon new submission
        if (!Array.isArray(profile.statusHistory)) profile.statusHistory = [];
        profile.statusHistory.push({
          status: 'UNDER_REVIEW',
          changedAt: now,
          changedBy: req.user._id,
          note: 'Verification application submitted for Admin compliance review.',
        });

        await profile.save();
      } else {
        profile = await AgencyProfile.create({
          ...cleanData,
          user: req.user._id,
          applicationId,
          verificationStatus: 'UNDER_REVIEW',
          isDraft: false,
          submittedAt: now,
          rejectionReason: '',
          statusHistory: [
            {
              status: 'UNDER_REVIEW',
              changedAt: now,
              changedBy: req.user._id,
              note: 'Verification application submitted for Admin compliance review.',
            },
          ],
        });
      }

      // Update User: remain inactive and non-loginable with status UNDER_REVIEW
      await User.findByIdAndUpdate(req.user._id, {
        agencyVerificationStatus: 'UNDER_REVIEW',
        accountStatus: 'UNDER_REVIEW',
        status: 'in_review',
        isActive: false,
        agencyProfile: profile._id,
        name: profile.agencyName,
      });

      // Dispatch real Admin Notification in DB
      await notifyAdminsOfVerification({
        profile,
        agencyName: profile.agencyName,
        applicationId,
      });

      return res.status(200).json({
        success: true,
        message: 'Your agency registration has been submitted for verification. Admify Admin will review your submitted information and documents.',
        applicationId,
        verificationStatus: 'UNDER_REVIEW',
        accountStatus: 'UNDER_REVIEW',
        profile,
      });
    } else {
      // devStore fallback
      let profile = await devStore.findAgencyProfileByUserId(req.user._id);

      if (profile && profile.verificationStatus === 'VERIFIED') {
        return res.status(400).json({
          success: false,
          message: 'Agency is already verified.',
        });
      }

      const applicationId =
        profile?.applicationId ||
        req.applicationId ||
        `ADM-AGY-2026-${Date.now().toString(36).toUpperCase().slice(-4)}${Math.floor(1000 + Math.random() * 9000)}`;

      profile = await devStore.saveAgencyProfile({
        ...cleanData,
        user: req.user._id,
        applicationId,
        verificationStatus: 'UNDER_REVIEW',
        isDraft: false,
        submittedAt: now.toISOString(),
        rejectionReason: '',
      });

      await devStore.updateUser(req.user._id, {
        agencyVerificationStatus: 'UNDER_REVIEW',
        accountStatus: 'UNDER_REVIEW',
        status: 'in_review',
        isActive: false,
        agencyProfile: profile._id,
        name: profile.agencyName,
      });

      // Dispatch real Admin Notification in DB
      await notifyAdminsOfVerification({
        profile,
        agencyName: profile.agencyName,
        applicationId,
      });

      return res.status(200).json({
        success: true,
        message: 'Your agency registration has been submitted for verification. Admify Admin will review your submitted information and documents.',
        applicationId,
        verificationStatus: 'UNDER_REVIEW',
        accountStatus: 'UNDER_REVIEW',
        profile,
      });
    }
  } catch (error) {
    console.error('Error in submitAgencyVerification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit verification request',
      error: error.message,
    });
  }
};

// @desc    Resubmit agency verification after rejection
// @route   POST /api/agency/verification/resubmit
// @access  Private (Agency role or Agency Registration Token)
export const resubmitAgencyVerification = async (req, res) => {
  return submitAgencyVerification(req, res);
};

// @desc    Agency submits an Agent application
// @route   POST /api/agency/agent-applications
// @access  Private (Verified Agency only)
export const createAgentApplication = async (req, res) => {
  try {
    // Agency must be approved and active
    const isAgencyActive =
      (req.user.accountStatus === 'ACTIVE' || req.user.status === 'active') &&
      req.user.role === 'agency';

    if (!isAgencyActive) {
      return res.status(403).json({
        success: false,
        message: 'Only verified and active agencies are authorized to submit agent applications. Please verify your agency account first.',
      });
    }

    const { email, phone, designation, countrySpecialization, notes } = req.body;
    const agentName = req.body.agentName || req.body.name;

    if (!agentName || !agentName.trim()) {
      return res.status(400).json({ success: false, message: 'Agent name is required' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Agent email is required' });
    }
    if (!phone || !phone.trim()) {
      return res.status(400).json({ success: false, message: 'Agent phone is required' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if agent is already registered as a user
    let existingUser = null;
    if (mongoose.connection.readyState === 1) {
      existingUser = await User.findOne({ email: cleanEmail });
    } else {
      existingUser = await devStore.findUserByEmail(cleanEmail);
    }

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: `An account with email "${cleanEmail}" is already registered.`,
      });
    }

    // Check if there is an existing pending or approved application for this email
    let existingApp = null;
    if (mongoose.connection.readyState === 1) {
      existingApp = await AgentApplication.findOne({
        email: cleanEmail,
        status: { $in: ['PENDING', 'UNDER_REVIEW', 'APPROVED'] },
      });
    } else {
      const apps = await devStore.findAgentApplications({ email: cleanEmail });
      existingApp = apps.find((a) => ['PENDING', 'UNDER_REVIEW', 'APPROVED'].includes(a.status));
    }

    if (existingApp) {
      return res.status(400).json({
        success: false,
        message: `An agent application for "${cleanEmail}" is already in progress (${existingApp.status}).`,
      });
    }

    // Lookup agency's unique Application ID
    let agencyAppId = req.user.applicationId || '';
    if (!agencyAppId) {
      if (mongoose.connection.readyState === 1) {
        const agencyProfile = await AgencyProfile.findOne({ user: req.user._id });
        agencyAppId = agencyProfile?.applicationId || req.user._id.toString();
      } else {
        const agencyProfile = await devStore.findAgencyProfileByUserId(req.user._id);
        agencyAppId = agencyProfile?.applicationId || req.user._id.toString();
      }
    }

    // Generate unique Agent Application ID: AGT-APP-YYYYMMDD-XXXX
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const applicationId = `AGT-APP-${dateStr}-${randomSuffix}`;

    const appPayload = {
      applicationId,
      agency: req.user._id,
      agencyApplicationId: agencyAppId,
      agencyName: req.user.name,
      agentName: agentName.trim(),
      email: cleanEmail,
      phone: phone.trim(),
      designation: designation?.trim() || 'Educational Counselor',
      countrySpecialization: Array.isArray(countrySpecialization) ? countrySpecialization : [],
      notes: notes?.trim() || '',
      status: 'PENDING',
    };

    let savedApp = null;
    if (mongoose.connection.readyState === 1) {
      savedApp = await AgentApplication.create(appPayload);
    } else {
      savedApp = await devStore.createAgentApplication(appPayload);
    }

    // Notify Admins of new Agent Application
    const notifTitle = 'New Agent Application Submitted';
    const notifMessage = `Agency "${req.user.name}" submitted an agent application for "${agentName.trim()}" (App ID: ${applicationId}).`;
    try {
      if (mongoose.connection.readyState === 1) {
        const admins = await User.find({ role: 'admin' });
        for (const admin of admins) {
          await Notification.create({
            user: admin._id,
            title: notifTitle,
            message: notifMessage,
            type: 'info',
            link: '/admin/agents',
          });
        }
      } else {
        const admins = await devStore.findAdmins();
        for (const admin of admins) {
          await devStore.createNotification({
            user: admin._id,
            title: notifTitle,
            message: notifMessage,
            type: 'info',
            link: '/admin/agents',
          });
        }
      }
    } catch (notifErr) {
      console.warn('Failed to notify admins of agent application:', notifErr.message);
    }

    return res.status(201).json({
      success: true,
      message: `Agent application submitted successfully for "${agentName.trim()}". Awaiting Admin approval.`,
      application: savedApp,
      data: {
        application: savedApp,
      },
    });
  } catch (error) {
    console.error('Error in createAgentApplication:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error creating agent application',
      error: error.message,
    });
  }
};

// @desc    Get all Agent applications submitted by this Agency
// @route   GET /api/agency/agent-applications
// @access  Private (Agency only)
export const getAgencyAgentApplications = async (req, res) => {
  try {
    let applications = [];
    if (mongoose.connection.readyState === 1) {
      applications = await AgentApplication.find({ agency: req.user._id }).sort({ createdAt: -1 });
    } else {
      applications = await devStore.findAgentApplications({ agency: req.user._id });
    }

    return res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    console.error('Error in getAgencyAgentApplications:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve agent applications',
      error: error.message,
    });
  }
};

// @desc    Get list of verified and active University Representatives for partnership connection
// @route   GET /api/agency/verified-universities
// @access  Private (Agency only)
export const getVerifiedUniversityReps = async (req, res) => {
  try {
    let reps = [];
    if (mongoose.connection.readyState === 1) {
      reps = await User.find({
        role: { $in: ['university_rep', 'university representative', 'university'] },
        accountStatus: 'ACTIVE',
        isActive: true,
      })
        .populate('universityId')
        .select('name email phone designation department country city universityId avatar');
    } else {
      const db = devStore.read();
      const rawReps = (db.users || []).filter(
        (u) =>
          (u.role === 'university_rep' || u.role === 'university representative' || u.role === 'university') &&
          u.accountStatus === 'ACTIVE' &&
          u.isActive !== false
      );
      for (const r of rawReps) {
        const copy = { ...r };
        delete copy.password;
        if (copy.universityId) {
          copy.universityId = await devStore.findUniversityById(copy.universityId);
        }
        reps.push(copy);
      }
    }

    return res.status(200).json({
      success: true,
      count: reps.length,
      data: {
        representatives: reps,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch verified university representatives',
      error: error.message,
    });
  }
};

// @desc    Send connection request from Agency to verified University Representative
// @route   POST /api/agency/university-connections
// @access  Private (Agency only)
export const createAgencyUniversityConnection = async (req, res) => {
  try {
    const { universityRepresentativeId, notes = '' } = req.body;

    if (!universityRepresentativeId) {
      return res.status(400).json({
        success: false,
        message: 'University Representative ID is required.',
      });
    }

    // Security Gate: Agency must be ACTIVE and VERIFIED
    const isAgencyVerified =
      (req.user.accountStatus === 'ACTIVE' || req.user.status === 'active') &&
      req.user.agencyVerificationStatus === 'VERIFIED';

    if (!isAgencyVerified) {
      return res.status(403).json({
        success: false,
        message: 'Only verified and active Agency accounts can establish university connections.',
      });
    }

    // Find Target University Representative
    let targetRep = null;
    if (mongoose.connection.readyState === 1) {
      targetRep = await User.findOne({
        _id: universityRepresentativeId,
        role: { $in: ['university_rep', 'university representative', 'university'] },
      });
    } else {
      targetRep = await devStore.findUserById(universityRepresentativeId);
    }

    if (!targetRep) {
      return res.status(404).json({
        success: false,
        message: 'University Representative account not found.',
      });
    }

    // Security Gate: Uni Rep must be ACTIVE & VERIFIED
    const isTargetActive =
      (targetRep.accountStatus === 'ACTIVE' || targetRep.status === 'active') &&
      targetRep.isActive !== false;

    if (!isTargetActive) {
      return res.status(400).json({
        success: false,
        message: 'Target University Representative is not active or verified.',
      });
    }

    if (!targetRep.universityId) {
      return res.status(400).json({
        success: false,
        message: 'Target University Representative does not have an affiliated university.',
      });
    }

    // Prevent duplicate active/pending connections
    let existingConnection = null;
    if (mongoose.connection.readyState === 1) {
      existingConnection = await UniversityAgencyConnection.findOne({
        agencyId: req.user._id,
        universityRepresentativeId: targetRep._id,
        status: { $in: ['PENDING', 'ACCEPTED'] },
      });
    } else {
      const conns = await devStore.findAgencyConnections({
        agencyId: req.user._id,
        universityRepresentativeId: targetRep._id,
      });
      existingConnection = conns.find((c) => c.status === 'PENDING' || c.status === 'ACCEPTED');
    }

    if (existingConnection) {
      return res.status(400).json({
        success: false,
        message: 'A connection request or partnership already exists with this University Representative.',
      });
    }

    // Create Connection Record
    let connection = null;
    if (mongoose.connection.readyState === 1) {
      connection = await UniversityAgencyConnection.create({
        agencyId: req.user._id,
        agencyProfileId: req.user.agencyProfile || null,
        universityId: targetRep.universityId,
        universityRepresentativeId: targetRep._id,
        requestedBy: req.user._id,
        requestedByRole: 'agency',
        status: 'PENDING',
        notes: notes.trim(),
      });

      // Notify target Uni Rep
      try {
        await Notification.create({
          user: targetRep._id,
          title: 'New Agency Connection Request',
          message: `${req.user.name} has requested a university partnership connection.`,
          type: 'info',
          link: '/university/dashboard',
        });
      } catch {}
    } else {
      connection = await devStore.createAgencyConnection({
        agencyId: req.user._id,
        agencyProfileId: req.user.agencyProfile || null,
        universityId: targetRep.universityId,
        universityRepresentativeId: targetRep._id,
        requestedBy: req.user._id,
        requestedByRole: 'agency',
        status: 'PENDING',
        notes: notes.trim(),
      });

      await devStore.createNotification({
        user: targetRep._id,
        title: 'New Agency Connection Request',
        message: `${req.user.name} has requested a university partnership connection.`,
        type: 'info',
        link: '/university/dashboard',
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Connection request sent successfully to University Representative.',
      data: {
        connection,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A connection request already exists between this agency and representative.',
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Failed to create university connection request',
      error: error.message,
    });
  }
};

// @desc    Get all university connections for this Agency
// @route   GET /api/agency/university-connections
// @access  Private (Agency only)
export const getAgencyUniversityConnections = async (req, res) => {
  try {
    let connections = [];
    if (mongoose.connection.readyState === 1) {
      connections = await UniversityAgencyConnection.find({ agencyId: req.user._id })
        .populate('universityRepresentativeId', 'name email phone designation avatar')
        .populate('universityId', 'name location country logo website type')
        .sort({ createdAt: -1 });
    } else {
      connections = await devStore.findAgencyConnections({ agencyId: req.user._id });
      for (const conn of connections) {
        if (!conn.universityRepresentative && conn.universityRepresentativeId) {
          conn.universityRepresentative = await devStore.findUserById(conn.universityRepresentativeId);
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

// Helper to record audit log for agency actions
const recordAgencyAuditLog = async ({ req, action, module, targetType, targetId, targetName, previousValue, newValue, reason }) => {
  try {
    const logData = {
      adminId: req.user._id,
      adminName: req.user.name,
      adminEmail: req.user.email,
      action: `AGENCY_${action}`,
      module: module || 'agency',
      targetType: targetType || 'Agency',
      targetId: targetId ? targetId.toString() : 'N/A',
      targetName: targetName || '',
      previousValue: previousValue || null,
      newValue: newValue || null,
      reason: reason || 'Action performed via Agency Portal',
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
    console.warn('[Agency Audit Error]:', err.message);
  }
};

// ── 1. Agency Dashboard Analytics ─────────────────────────────────────────────
// @desc    Get real-time statistics and recent activity for this Agency
// @route   GET /api/agency/dashboard
// @access  Private (Verified Agency)
export const getAgencyDashboard = async (req, res, next) => {
  try {
    const agencyIdStr = req.user._id.toString();

    let agents = [];
    let agentApplications = [];
    let students = [];
    let applications = [];
    let serviceOrders = [];
    let connections = [];
    let notifications = [];

    if (mongoose.connection.readyState === 1) {
      agents = await User.find({ role: 'agent', agencyId: req.user._id });
      agentApplications = await AgentApplication.find({ agency: req.user._id });
      applications = await Application.find({ assignedAgency: req.user._id });
      serviceOrders = await AgencyServiceOrder.find({ 'assignedAgency.agencyId': agencyIdStr });
      connections = await UniversityAgencyConnection.find({ agencyId: req.user._id });
      notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(10);

      // Unique students linked via applications or service orders
      const studentIds = new Set([
        ...applications.map((a) => a.user?.toString()).filter(Boolean),
        ...serviceOrders.map((o) => o.user?.toString()).filter(Boolean),
      ]);
      if (studentIds.size > 0) {
        students = await User.find({ _id: { $in: Array.from(studentIds) } }).select('name email phone targetCountry gpa ielts studyLevel');
      }
    } else {
      const db = devStore.read();
      agents = (db.users || []).filter((u) => u.role === 'agent' && u.agencyId?.toString() === agencyIdStr);
      agentApplications = (db.agentApplications || []).filter((a) => a.agency?.toString() === agencyIdStr);
      applications = (db.applications || []).filter((a) => a.assignedAgency?.toString() === agencyIdStr);
      serviceOrders = (db.agencyServiceOrders || []).filter((o) => o.assignedAgency?.agencyId?.toString() === agencyIdStr);
      connections = (db.universityAgencyConnections || []).filter((c) => c.agencyId?.toString() === agencyIdStr);
      notifications = (db.notifications || []).filter((n) => n.user?.toString() === agencyIdStr).slice(0, 10);

      const studentIds = new Set([
        ...applications.map((a) => a.user?.toString()).filter(Boolean),
        ...serviceOrders.map((o) => o.user?.toString()).filter(Boolean),
      ]);
      students = (db.users || []).filter((u) => studentIds.has(u._id?.toString()));
    }

    const totalAgents = agents.length + agentApplications.filter((a) => a.status === 'APPROVED' || a.status === 'REGISTERED').length;
    const activeAgents = agents.filter((a) => a.status === 'active' || a.accountStatus === 'ACTIVE').length;
    const assignedStudents = students.length;
    const activeApplications = applications.filter((a) => ['Submitted', 'Documents Pending', 'In Review'].includes(a.stage)).length;
    const pendingApplications = applications.filter((a) => a.stage === 'In Review' || a.stage === 'Documents Pending').length;
    const completedApplications = applications.filter((a) => a.stage === 'Accepted' || a.stage === 'Completed').length;
    const universityPartnerships = connections.filter((c) => c.status === 'ACCEPTED').length;
    const pendingPartnershipRequests = connections.filter((c) => c.status === 'PENDING').length;
    const pendingServiceRequests = serviceOrders.filter((o) => o.status === 'ACTIVE' || o.status === 'IN_PROGRESS').length;

    // Recent activity compilation
    const recentActivity = [];
    applications.slice(0, 5).forEach((app) => {
      recentActivity.push({
        id: app._id,
        type: 'APPLICATION',
        title: `Application: ${app.university} - ${app.program}`,
        subtitle: `Stage: ${app.stage} · Progress: ${app.progress}%`,
        createdAt: app.createdAt,
      });
    });

    serviceOrders.slice(0, 5).forEach((ord) => {
      recentActivity.push({
        id: ord._id,
        type: 'SERVICE_REQUEST',
        title: `Service Order: ${ord.serviceName}`,
        subtitle: `Status: ${ord.status} · ${ord.creditsDeducted} Credits`,
        createdAt: ord.createdAt,
      });
    });

    connections.slice(0, 5).forEach((conn) => {
      recentActivity.push({
        id: conn._id,
        type: 'PARTNERSHIP',
        title: `Partnership: ${conn.status}`,
        subtitle: `Connection status: ${conn.status}`,
        createdAt: conn.createdAt,
      });
    });

    recentActivity.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    return res.status(200).json({
      success: true,
      data: {
        stats: {
          totalAgents,
          activeAgents,
          assignedStudents,
          activeApplications,
          pendingApplications,
          completedApplications,
          universityPartnerships,
          pendingPartnershipRequests,
          pendingServiceRequests,
        },
        recentApplications: applications.slice(0, 5),
        recentServiceRequests: serviceOrders.slice(0, 5),
        recentPartnerships: connections.slice(0, 5),
        recentNotifications: notifications.slice(0, 5),
        recentActivity: recentActivity.slice(0, 10),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── 2. My Agents Management ───────────────────────────────────────────────────
// @desc    Get all agents and submitted applications for this agency
// @route   GET /api/agency/agents
// @access  Private (Verified Agency)
export const getAgencyAgents = async (req, res, next) => {
  try {
    const agencyIdStr = req.user._id.toString();
    let registeredAgents = [];
    let applications = [];

    if (mongoose.connection.readyState === 1) {
      registeredAgents = await User.find({ role: 'agent', agencyId: req.user._id }).select(
        'name email phone status accountStatus designation countrySpecialization avatar createdAt'
      );
      applications = await AgentApplication.find({ agency: req.user._id }).sort({ createdAt: -1 });
    } else {
      const db = devStore.read();
      registeredAgents = (db.users || []).filter((u) => u.role === 'agent' && u.agencyId?.toString() === agencyIdStr);
      applications = (db.agentApplications || []).filter((a) => a.agency?.toString() === agencyIdStr);
    }

    return res.status(200).json({
      success: true,
      count: registeredAgents.length + applications.length,
      data: {
        registeredAgents,
        applications,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update status of an Agent belonging to this Agency
// @route   PUT /api/agency/agents/:id/status
// @access  Private (Verified Agency)
export const updateAgencyAgentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowed = ['active', 'inactive', 'suspended'];

    if (!allowed.includes(status?.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid agent status. Allowed: active, inactive, suspended',
      });
    }

    const agencyIdStr = req.user._id.toString();
    let updatedAgent = null;

    if (mongoose.connection.readyState === 1) {
      const agent = await User.findOne({ _id: id, role: 'agent', agencyId: req.user._id });
      if (!agent) {
        return res.status(404).json({ success: false, message: 'Agent not found in your agency roster.' });
      }

      agent.status = status.toLowerCase();
      agent.accountStatus = status.toLowerCase() === 'active' ? 'ACTIVE' : 'SUSPENDED';
      agent.isActive = status.toLowerCase() === 'active';
      await agent.save();
      updatedAgent = agent;
    } else {
      const db = devStore.read();
      const agent = (db.users || []).find((u) => u._id === id && u.role === 'agent' && u.agencyId?.toString() === agencyIdStr);
      if (!agent) {
        return res.status(404).json({ success: false, message: 'Agent not found in your agency roster.' });
      }

      agent.status = status.toLowerCase();
      agent.accountStatus = status.toLowerCase() === 'active' ? 'ACTIVE' : 'SUSPENDED';
      agent.isActive = status.toLowerCase() === 'active';
      devStore.write(db);
      updatedAgent = agent;
    }

    await recordAgencyAuditLog({
      req,
      action: 'UPDATE_AGENT_STATUS',
      module: 'agents',
      targetType: 'Agent',
      targetId: id,
      targetName: updatedAgent.name,
      newValue: { status },
      reason: `Agency updated agent status to ${status}`,
    });

    return res.status(200).json({
      success: true,
      message: `Agent ${updatedAgent.name} status updated to ${status}`,
      data: { agent: updatedAgent },
    });
  } catch (error) {
    next(error);
  }
};

// ── 3. Students Management ────────────────────────────────────────────────────
// @desc    Get all students assigned to this agency or active service orders
// @route   GET /api/agency/students
// @access  Private (Verified Agency)
export const getAgencyStudents = async (req, res, next) => {
  try {
    const agencyIdStr = req.user._id.toString();
    const { search = '' } = req.query;

    let students = [];
    let applications = [];
    let serviceOrders = [];

    if (mongoose.connection.readyState === 1) {
      applications = await Application.find({ assignedAgency: req.user._id }).populate('assignedAgent', 'name email');
      serviceOrders = await AgencyServiceOrder.find({ 'assignedAgency.agencyId': agencyIdStr });

      const studentIds = Array.from(new Set([
        ...applications.map((a) => a.user?.toString()).filter(Boolean),
        ...serviceOrders.map((o) => o.user?.toString()).filter(Boolean),
      ]));

      const query = { _id: { $in: studentIds }, role: 'student' };
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { targetCountry: { $regex: search, $options: 'i' } },
        ];
      }

      // STRICT PRIVACY: NEVER SELECT walletCredits, paidCredits, freeCredits, or private financial records
      students = await User.find(query).select(
        'name email phone targetCountry targetCourse gpa ielts bio createdAt avatar'
      );
    } else {
      const db = devStore.read();
      applications = (db.applications || []).filter((a) => a.assignedAgency?.toString() === agencyIdStr);
      serviceOrders = (db.agencyServiceOrders || []).filter((o) => o.assignedAgency?.agencyId?.toString() === agencyIdStr);

      const studentIds = new Set([
        ...applications.map((a) => a.user?.toString()).filter(Boolean),
        ...serviceOrders.map((o) => o.user?.toString()).filter(Boolean),
      ]);

      students = (db.users || [])
        .filter((u) => studentIds.has(u._id) && u.role === 'student')
        .map((u) => ({
          _id: u._id,
          name: u.name,
          email: u.email,
          phone: u.phone,
          targetCountry: u.targetCountry || '',
          targetCourse: u.targetCourse || '',
          gpa: u.gpa || '',
          ielts: u.ielts || '',
          bio: u.bio || '',
          createdAt: u.createdAt,
          avatar: u.avatar || '',
        }));

      if (search) {
        const q = search.toLowerCase();
        students = students.filter(
          (s) => s.name?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q) || s.targetCountry?.toLowerCase().includes(q)
        );
      }
    }

    // Attach student's active application and service context
    const enriched = students.map((s) => {
      const sId = s._id.toString();
      const app = applications.find((a) => (a.user?._id || a.user)?.toString() === sId);
      const srv = serviceOrders.find((o) => (o.user?._id || o.user)?.toString() === sId);
      return {
        ...s.toObject ? s.toObject() : s,
        activeApplication: app || null,
        activeService: srv || null,
        assignedAgent: app?.assignedAgent || srv?.assignedAgency?.agentName || 'Unassigned',
      };
    });

    return res.status(200).json({
      success: true,
      count: enriched.length,
      data: { students: enriched },
    });
  } catch (error) {
    next(error);
  }
};

// ── 4. Applications Management ────────────────────────────────────────────────
// @desc    Get applications assigned to this agency
// @route   GET /api/agency/applications
// @access  Private (Verified Agency)
export const getAgencyApplications = async (req, res, next) => {
  try {
    const agencyIdStr = req.user._id.toString();
    const { stage, search } = req.query;

    let applications = [];

    if (mongoose.connection.readyState === 1) {
      const query = { assignedAgency: req.user._id };
      if (stage && stage !== 'all') query.stage = stage;

      applications = await Application.find(query)
        .populate('user', 'name email phone targetCountry gpa ielts')
        .populate('assignedAgent', 'name email designation')
        .sort({ createdAt: -1 });

      if (search) {
        const q = search.toLowerCase();
        applications = applications.filter(
          (a) =>
            a.university?.toLowerCase().includes(q) ||
            a.program?.toLowerCase().includes(q) ||
            a.user?.name?.toLowerCase().includes(q) ||
            a.user?.email?.toLowerCase().includes(q)
        );
      }
    } else {
      const db = devStore.read();
      applications = (db.applications || []).filter((a) => a.assignedAgency?.toString() === agencyIdStr);
      if (stage && stage !== 'all') {
        applications = applications.filter((a) => a.stage?.toLowerCase() === stage.toLowerCase());
      }
      for (const app of applications) {
        if (!app.user?.name && app.user) {
          app.user = (db.users || []).find((u) => u._id === app.user.toString()) || app.user;
        }
        if (!app.assignedAgent?.name && app.assignedAgent) {
          app.assignedAgent = (db.users || []).find((u) => u._id === app.assignedAgent.toString()) || app.assignedAgent;
        }
      }
      if (search) {
        const q = search.toLowerCase();
        applications = applications.filter(
          (a) =>
            a.university?.toLowerCase().includes(q) ||
            a.program?.toLowerCase().includes(q) ||
            a.user?.name?.toLowerCase().includes(q)
        );
      }
    }

    return res.status(200).json({
      success: true,
      count: applications.length,
      data: { applications },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update progress, stage, or assign agent for an Agency application
// @route   PUT /api/agency/applications/:id
// @access  Private (Verified Agency)
export const updateAgencyApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { stage, progress, assignedAgent, notes, stepLabel } = req.body;
    const agencyIdStr = req.user._id.toString();

    let application = null;

    if (mongoose.connection.readyState === 1) {
      application = await Application.findOne({ _id: id, assignedAgency: req.user._id });
      if (!application) {
        return res.status(404).json({ success: false, message: 'Application not found or unauthorized.' });
      }

      if (stage) application.stage = stage;
      if (progress !== undefined) application.progress = Number(progress);
      if (assignedAgent) {
        // Verify agent belongs to this agency
        const agent = await User.findOne({ _id: assignedAgent, role: 'agent', agencyId: req.user._id });
        if (!agent) {
          return res.status(400).json({ success: false, message: 'Assigned agent must be a registered member of your agency.' });
        }
        application.assignedAgent = agent._id;
      }
      if (notes) application.notes = notes;

      if (stepLabel) {
        if (!Array.isArray(application.steps)) application.steps = [];
        application.steps.push({
          label: stepLabel,
          date: new Date().toLocaleDateString(),
          status: 'completed',
        });
      }

      await application.save();
    } else {
      application = await devStore.findApplicationById(id);
      if (!application || application.assignedAgency?.toString() !== agencyIdStr) {
        return res.status(404).json({ success: false, message: 'Application not found or unauthorized.' });
      }

      const updates = {};
      if (stage) updates.stage = stage;
      if (progress !== undefined) updates.progress = Number(progress);
      if (assignedAgent) updates.assignedAgent = assignedAgent;
      if (notes) updates.notes = notes;
      if (stepLabel) {
        const steps = Array.isArray(application.steps) ? [...application.steps] : [];
        steps.push({ label: stepLabel, date: new Date().toLocaleDateString(), status: 'completed' });
        updates.steps = steps;
      }

      application = await devStore.updateApplication(id, updates);
    }

    await recordAgencyAuditLog({
      req,
      action: 'UPDATE_APPLICATION',
      module: 'applications',
      targetType: 'Application',
      targetId: id,
      targetName: `${application.university} - ${application.program}`,
      newValue: { stage: application.stage, progress: application.progress },
      reason: notes || 'Agency updated application progress',
    });

    return res.status(200).json({
      success: true,
      message: 'Application updated successfully',
      data: { application },
    });
  } catch (error) {
    next(error);
  }
};

// ── 5. Service Requests Management ───────────────────────────────────────────
// @desc    Get Agency Service Requests (Agency Assistance = 800 CR, Full Managed = 1500 CR)
// @route   GET /api/agency/service-requests
// @access  Private (Verified Agency)
export const getAgencyServiceRequests = async (req, res, next) => {
  try {
    const agencyIdStr = req.user._id.toString();
    const { status } = req.query;

    let orders = [];

    if (mongoose.connection.readyState === 1) {
      const query = {
        $or: [
          { 'assignedAgency.agencyId': agencyIdStr },
          { status: 'ACTIVE', 'assignedAgency.agencyId': { $exists: false } },
        ],
      };
      if (status && status !== 'all') query.status = status;

      orders = await AgencyServiceOrder.find(query)
        .populate('user', 'name email phone targetCountry studyLevel gpa ielts')
        .sort({ createdAt: -1 });
    } else {
      const db = devStore.read();
      orders = (db.agencyServiceOrders || []).filter(
        (o) => o.assignedAgency?.agencyId?.toString() === agencyIdStr || (o.status === 'ACTIVE' && !o.assignedAgency?.agencyId)
      );
      if (status && status !== 'all') {
        orders = orders.filter((o) => o.status === status);
      }
      for (const ord of orders) {
        if (!ord.user?.name && ord.user) {
          ord.user = (db.users || []).find((u) => u._id === ord.user.toString()) || ord.user;
        }
      }
    }

    return res.status(200).json({
      success: true,
      count: orders.length,
      data: { serviceOrders: orders },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Accept, update status, or assign agent for a Service Request
// @route   PUT /api/agency/service-requests/:id
// @access  Private (Verified Agency)
export const updateAgencyServiceRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action, status, agentId, notes } = req.body;
    const agencyIdStr = req.user._id.toString();

    let order = null;

    if (mongoose.connection.readyState === 1) {
      order = await AgencyServiceOrder.findById(id);
      if (!order) return res.status(404).json({ success: false, message: 'Service order not found.' });

      // Check authorization
      const isAssignedToThis = order.assignedAgency?.agencyId === agencyIdStr;
      const isOpenToAccept = order.status === 'ACTIVE' && !order.assignedAgency?.agencyId;

      if (!isAssignedToThis && !isOpenToAccept) {
        return res.status(403).json({ success: false, message: 'This service order belongs to another agency.' });
      }

      if (action === 'ACCEPT' || isOpenToAccept) {
        order.assignedAgency = {
          agencyId: agencyIdStr,
          agencyName: req.user.name,
          assignedAt: new Date(),
        };
        order.status = 'IN_PROGRESS';
      }

      if (action === 'REJECT') {
        order.status = 'CANCELLED';
        order.notes = notes || 'Rejected by agency';
      }

      if (status) order.status = status;
      if (notes) order.notes = notes;

      if (agentId) {
        const agent = await User.findOne({ _id: agentId, role: 'agent', agencyId: req.user._id });
        if (agent) {
          order.assignedAgency.agentName = agent.name;
          order.assignedAgency.agentRole = agent.designation || 'Counselor';
        }
      }

      await order.save();
    } else {
      order = await devStore.findAgencyServiceOrderById(id);
      if (!order) return res.status(404).json({ success: false, message: 'Service order not found.' });

      const isAssignedToThis = order.assignedAgency?.agencyId?.toString() === agencyIdStr;
      const isOpenToAccept = order.status === 'ACTIVE' && !order.assignedAgency?.agencyId;

      if (!isAssignedToThis && !isOpenToAccept) {
        return res.status(403).json({ success: false, message: 'This service order belongs to another agency.' });
      }

      const updates = {};
      if (action === 'ACCEPT' || isOpenToAccept) {
        updates.assignedAgency = {
          agencyId: agencyIdStr,
          agencyName: req.user.name,
          assignedAt: new Date().toISOString(),
        };
        updates.status = 'IN_PROGRESS';
      }
      if (action === 'REJECT') {
        updates.status = 'CANCELLED';
      }
      if (status) updates.status = status;
      if (notes) updates.notes = notes;

      order = await devStore.updateAgencyServiceOrder(id, updates);
    }

    await recordAgencyAuditLog({
      req,
      action: 'UPDATE_SERVICE_REQUEST',
      module: 'services',
      targetType: 'AgencyServiceOrder',
      targetId: id,
      targetName: order.serviceName,
      newValue: { status: order.status },
      reason: notes || `Agency updated service order to ${order.status}`,
    });

    return res.status(200).json({
      success: true,
      message: 'Service order updated successfully.',
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};

// ── 6. University Partnerships ────────────────────────────────────────────────
// @desc    Cancel a pending partnership request made by this agency
// @route   DELETE /api/agency/university-connections/:id
// @access  Private (Verified Agency)
export const cancelAgencyUniversityConnection = async (req, res, next) => {
  try {
    const { id } = req.params;
    const agencyIdStr = req.user._id.toString();

    if (mongoose.connection.readyState === 1) {
      const conn = await UniversityAgencyConnection.findOne({ _id: id, agencyId: req.user._id });
      if (!conn) {
        return res.status(404).json({ success: false, message: 'Partnership request not found.' });
      }
      await conn.deleteOne();
    } else {
      const ok = await devStore.deleteAgencyConnection(id);
      if (!ok) return res.status(404).json({ success: false, message: 'Partnership request not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Partnership connection request cancelled.',
    });
  } catch (error) {
    next(error);
  }
};

// ── 7. Agency Messaging ───────────────────────────────────────────────────────
// @desc    Get conversation threads for authorized students, agents, and uni reps
// @route   GET /api/agency/messages
// @access  Private (Verified Agency)
export const getAgencyMessages = async (req, res, next) => {
  try {
    const agencyIdStr = req.user._id.toString();

    let messages = [];
    if (mongoose.connection.readyState === 1) {
      messages = await ChatMessage.find({
        $or: [{ user: req.user._id }, { receiver: req.user._id }],
      }).sort({ createdAt: 1 });
    } else {
      const db = devStore.read();
      messages = (db.chatMessages || []).filter(
        (m) => m.user?.toString() === agencyIdStr || m.receiver?.toString() === agencyIdStr
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

// @desc    Send message to student, agent, or uni rep
// @route   POST /api/agency/messages
// @access  Private (Verified Agency)
export const sendAgencyMessage = async (req, res, next) => {
  try {
    const { receiverId, text, sessionId } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Message text is required.' });
    }

    const payload = {
      user: req.user._id,
      sender: 'agency',
      receiver: receiverId || null,
      text: text.trim(),
      sessionId: sessionId || `SESSION-AGY-${req.user._id}-${Date.now()}`,
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

// ── 8. Agency Documents ───────────────────────────────────────────────────────
// @desc    Get all agency compliance and application documents
// @route   GET /api/agency/documents
// @access  Private (Verified Agency)
export const getAgencyDocuments = async (req, res, next) => {
  try {
    let profile = null;
    if (mongoose.connection.readyState === 1) {
      profile = await AgencyProfile.findOne({ user: req.user._id });
    } else {
      profile = await devStore.findAgencyProfileByUserId(req.user._id);
    }

    const docs = [];
    if (profile?.documents) {
      const d = profile.documents;
      if (d.tradeLicense) docs.push({ name: 'Trade License', type: 'tradeLicense', ...d.tradeLicense });
      if (d.businessRegistration) docs.push({ name: 'Business Registration', type: 'businessRegistration', ...d.businessRegistration });
      if (d.tinCertificate) docs.push({ name: 'TIN Certificate', type: 'tinCertificate', ...d.tinCertificate });
      if (d.binVatCertificate) docs.push({ name: 'BIN/VAT Certificate', type: 'binVatCertificate', ...d.binVatCertificate });
      if (d.agencyProfileDocument) docs.push({ name: 'Company Profile Deck', type: 'agencyProfileDocument', ...d.agencyProfileDocument });
    }

    return res.status(200).json({
      success: true,
      data: { documents: docs, verificationStatus: profile?.verificationStatus || 'PENDING' },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload Agency verification or accreditation document
// @route   POST /api/agency/documents
// @access  Private (Verified Agency)
export const uploadAgencyDocument = async (req, res, next) => {
  try {
    const { docType, fileData, fileName, fileType } = req.body;
    if (!docType || !fileData) {
      return res.status(400).json({ success: false, message: 'Document type and fileData are required.' });
    }

    const err = validateDocument({ fileData, fileType }, docType);
    if (err) return res.status(400).json({ success: false, message: err });

    const docObj = {
      fileName: fileName || `${docType}.pdf`,
      fileType: fileType || 'application/pdf',
      fileData,
      uploadedAt: new Date(),
    };

    if (mongoose.connection.readyState === 1) {
      let profile = await AgencyProfile.findOne({ user: req.user._id });
      if (!profile) profile = new AgencyProfile({ user: req.user._id, agencyName: req.user.name });
      if (!profile.documents) profile.documents = {};
      profile.documents[docType] = docObj;
      await profile.save();
    } else {
      let profile = await devStore.findAgencyProfileByUserId(req.user._id);
      if (!profile) {
        profile = { _id: new mongoose.Types.ObjectId().toString(), user: req.user._id, agencyName: req.user.name, documents: {} };
      }
      if (!profile.documents) profile.documents = {};
      profile.documents[docType] = docObj;
      await devStore.saveAgencyProfile(profile);
    }

    return res.status(200).json({
      success: true,
      message: `${docType} uploaded successfully.`,
      data: { document: docObj },
    });
  } catch (error) {
    next(error);
  }
};

// ── 9. Agency Performance Analytics ───────────────────────────────────────────
// @desc    Get real analytics across applications, destination countries, and agent workloads
// @route   GET /api/agency/performance
// @access  Private (Verified Agency)
export const getAgencyPerformance = async (req, res, next) => {
  try {
    const agencyIdStr = req.user._id.toString();

    let applications = [];
    let agents = [];
    let serviceOrders = [];

    if (mongoose.connection.readyState === 1) {
      applications = await Application.find({ assignedAgency: req.user._id });
      agents = await User.find({ role: 'agent', agencyId: req.user._id });
      serviceOrders = await AgencyServiceOrder.find({ 'assignedAgency.agencyId': agencyIdStr });
    } else {
      const db = devStore.read();
      applications = (db.applications || []).filter((a) => a.assignedAgency?.toString() === agencyIdStr);
      agents = (db.users || []).filter((u) => u.role === 'agent' && u.agencyId?.toString() === agencyIdStr);
      serviceOrders = (db.agencyServiceOrders || []).filter((o) => o.assignedAgency?.agencyId?.toString() === agencyIdStr);
    }

    const countryBreakdown = {};
    const universityBreakdown = {};
    const stageBreakdown = {
      Submitted: 0,
      'Documents Pending': 0,
      'In Review': 0,
      Accepted: 0,
      Rejected: 0,
    };

    applications.forEach((a) => {
      const c = a.country || 'Global';
      countryBreakdown[c] = (countryBreakdown[c] || 0) + 1;

      const u = a.university || 'General';
      universityBreakdown[u] = (universityBreakdown[u] || 0) + 1;

      if (stageBreakdown[a.stage] !== undefined) {
        stageBreakdown[a.stage] += 1;
      }
    });

    const agentWorkloads = agents.map((ag) => {
      const agId = ag._id.toString();
      const count = applications.filter((a) => a.assignedAgent?.toString() === agId).length;
      return {
        id: ag._id,
        name: ag.name,
        email: ag.email,
        activeApplications: count,
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        totalApplications: applications.length,
        totalServices: serviceOrders.length,
        completedServices: serviceOrders.filter((s) => s.status === 'COMPLETED').length,
        conversionRate: applications.length > 0 ? Math.round((stageBreakdown.Accepted / applications.length) * 100) : 0,
        countryBreakdown,
        universityBreakdown,
        stageBreakdown,
        agentWorkloads,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── 10. Agency Notifications ──────────────────────────────────────────────────
// @desc    Get notifications for agency
// @route   GET /api/agency/notifications
// @access  Private (Verified Agency)
export const getAgencyNotifications = async (req, res, next) => {
  try {
    let notifications = [];
    if (mongoose.connection.readyState === 1) {
      notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
    } else {
      const db = devStore.read();
      notifications = (db.notifications || []).filter((n) => n.user?.toString() === req.user._id.toString());
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

// @desc    Mark agency notification as read
// @route   PUT /api/agency/notifications/:id/read
// @access  Private (Verified Agency)
export const markAgencyNotificationRead = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1) {
      await Notification.findOneAndUpdate({ _id: id, user: req.user._id }, { read: true });
    } else {
      const db = devStore.read();
      const n = (db.notifications || []).find((x) => x._id === id && x.user?.toString() === req.user._id.toString());
      if (n) {
        n.read = true;
        devStore.write(db);
      }
    }

    return res.status(200).json({ success: true, message: 'Notification marked as read.' });
  } catch (error) {
    next(error);
  }
};

// ── 11. Agency Reports / Issues ───────────────────────────────────────────────
// @desc    Get reports filed regarding this agency or its assigned agents
// @route   GET /api/agency/reports
// @access  Private (Verified Agency)
export const getAgencyReports = async (req, res, next) => {
  try {
    const agencyIdStr = req.user._id.toString();

    let reports = [];
    if (mongoose.connection.readyState === 1) {
      reports = await Report.find({
        $or: [{ targetId: agencyIdStr }, { targetType: 'agency' }],
      }).sort({ createdAt: -1 });
    } else {
      const db = devStore.read();
      reports = (db.reports || []).filter(
        (r) => r.targetId?.toString() === agencyIdStr || r.targetType === 'agency'
      );
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

// @desc    Submit agency response to an open report
// @route   POST /api/agency/reports/:id/respond
// @access  Private (Verified Agency)
export const submitAgencyReportResponse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { responseText } = req.body;
    if (!responseText || !responseText.trim()) {
      return res.status(400).json({ success: false, message: 'Response explanation is required.' });
    }

    const agencyIdStr = req.user._id.toString();
    let report = null;

    if (mongoose.connection.readyState === 1) {
      report = await Report.findById(id);
      if (!report) return res.status(404).json({ success: false, message: 'Report not found.' });
      report.adminNotes = `${report.adminNotes || ''}\n[Agency Response by ${req.user.name} at ${new Date().toISOString()}]: ${responseText.trim()}`;
      await report.save();
    } else {
      const db = devStore.read();
      report = (db.reports || []).find((r) => r._id === id);
      if (!report) return res.status(404).json({ success: false, message: 'Report not found.' });
      report.adminNotes = `${report.adminNotes || ''}\n[Agency Response]: ${responseText.trim()}`;
      devStore.write(db);
    }

    await recordAgencyAuditLog({
      req,
      action: 'RESPOND_REPORT',
      module: 'reports',
      targetType: 'Report',
      targetId: id,
      reason: responseText.trim(),
    });

    return res.status(200).json({
      success: true,
      message: 'Official response submitted successfully for Admin review.',
    });
  } catch (error) {
    next(error);
  }
};

// ── 12. Service History Ledger ────────────────────────────────────────────────
// @desc    Get complete historical service orders for this Agency
// @route   GET /api/agency/service-history
// @access  Private (Verified Agency)
export const getAgencyServiceHistory = async (req, res, next) => {
  try {
    const agencyIdStr = req.user._id.toString();

    let orders = [];
    if (mongoose.connection.readyState === 1) {
      orders = await AgencyServiceOrder.find({ 'assignedAgency.agencyId': agencyIdStr })
        .populate('user', 'name email phone')
        .sort({ createdAt: -1 });
    } else {
      const db = devStore.read();
      orders = (db.agencyServiceOrders || []).filter(
        (o) => o.assignedAgency?.agencyId?.toString() === agencyIdStr
      );
      for (const ord of orders) {
        if (!ord.user?.name && ord.user) {
          ord.user = (db.users || []).find((u) => u._id === ord.user.toString()) || ord.user;
        }
      }
    }

    return res.status(200).json({
      success: true,
      count: orders.length,
      data: { serviceOrders: orders },
    });
  } catch (error) {
    next(error);
  }
};

// ── 13. Agency Profile & Settings ─────────────────────────────────────────────
// @desc    Get agency official verification profile
// @route   GET /api/agency/profile
// @access  Private (Verified Agency)
export const getAgencyProfile = async (req, res, next) => {
  try {
    let profile = null;
    if (mongoose.connection.readyState === 1) {
      profile = await AgencyProfile.findOne({ user: req.user._id });
    } else {
      profile = await devStore.findAgencyProfileByUserId(req.user._id);
    }

    return res.status(200).json({
      success: true,
      data: {
        user: {
          _id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          phone: req.user.phone,
          accountStatus: req.user.accountStatus,
          agencyVerificationStatus: req.user.agencyVerificationStatus,
          createdAt: req.user.createdAt,
        },
        profile,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update permitted agency profile fields
// @route   PUT /api/agency/profile
// @access  Private (Verified Agency)
export const updateAgencyProfile = async (req, res, next) => {
  try {
    const allowed = sanitizeAgencyInput(req.body);

    let updatedProfile = null;
    if (mongoose.connection.readyState === 1) {
      updatedProfile = await AgencyProfile.findOneAndUpdate(
        { user: req.user._id },
        { $set: allowed },
        { new: true, upsert: true }
      );
    } else {
      let existing = await devStore.findAgencyProfileByUserId(req.user._id);
      if (!existing) {
        existing = { _id: new mongoose.Types.ObjectId().toString(), user: req.user._id, agencyName: req.user.name };
      }
      const merged = { ...existing, ...allowed };
      updatedProfile = await devStore.saveAgencyProfile(merged);
    }

    await recordAgencyAuditLog({
      req,
      action: 'UPDATE_PROFILE',
      module: 'agency',
      targetType: 'AgencyProfile',
      targetId: req.user._id,
      newValue: allowed,
      reason: 'Agency updated public organizational profile',
    });

    return res.status(200).json({
      success: true,
      message: 'Agency profile updated successfully.',
      data: { profile: updatedProfile },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update agency account settings & credentials
// @route   PUT /api/agency/settings
// @access  Private (Verified Agency)
export const updateAgencySettings = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, phone } = req.body;

    if (newPassword) {
      if (newPassword.length < 6) {
        return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
      }

      if (mongoose.connection.readyState === 1) {
        const user = await User.findById(req.user._id).select('+password');
        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
          return res.status(400).json({ success: false, message: 'Current password does not match.' });
        }
        user.password = newPassword;
        if (phone) user.phone = phone.trim();
        await user.save();
      } else {
        const user = await devStore.findUserById(req.user._id);
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
          return res.status(400).json({ success: false, message: 'Current password does not match.' });
        }
        user.password = await bcrypt.hash(newPassword, 10);
        if (phone) user.phone = phone.trim();
        const db = devStore.read();
        const idx = db.users.findIndex((u) => u._id === user._id);
        if (idx !== -1) db.users[idx] = user;
        devStore.write(db);
      }
    } else if (phone) {
      if (mongoose.connection.readyState === 1) {
        await User.findByIdAndUpdate(req.user._id, { phone: phone.trim() });
      } else {
        const user = await devStore.findUserById(req.user._id);
        user.phone = phone.trim();
        const db = devStore.read();
        const idx = db.users.findIndex((u) => u._id === user._id);
        if (idx !== -1) db.users[idx] = user;
        devStore.write(db);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Agency security settings saved successfully.',
    });
  } catch (error) {
    next(error);
  }
};



