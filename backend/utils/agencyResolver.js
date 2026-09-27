import mongoose from 'mongoose';
import User from '../models/User.js';
import AgencyProfile from '../models/AgencyProfile.js';
import devStore from './devStore.js';

/**
 * Normalizes and resolves the authenticated Agency identity and AgencyProfile
 * from the authenticated req.user token context.
 *
 * Preferred secure logic:
 *   authenticated user
 *         ↓
 *   verify role === "agency" (or ownership of valid AgencyProfile)
 *         ↓
 *   resolve owned AgencyProfile (with fallback self-healing)
 *         ↓
 *   verify agency is VERIFIED/APPROVED + ACTIVE
 *         ↓
 *   return resolved agency context
 *
 * @param {Object} user - The authenticated req.user object from protect middleware
 * @returns {Promise<Object|null>} - Resolved agency context or null if not an agency
 */
export const resolveAuthenticatedAgency = async (user) => {
  if (!user || (!user._id && !user.id)) {
    return null;
  }

  const userId = user._id || user.id;
  const userIdStr = userId.toString();
  const rawRole = (user.role || user.user_metadata?.role || '').toString().toLowerCase().trim();
  if (rawRole !== 'agency') {
    return null;
  }

  let profile = null;

  if (mongoose.connection.readyState === 1) {
    // 1. Try finding AgencyProfile directly by user reference
    profile = await AgencyProfile.findOne({ user: userId });

    // 2. Fallback: Check if user has an agencyProfile ObjectId reference
    if (!profile && user.agencyProfile && mongoose.Types.ObjectId.isValid(user.agencyProfile)) {
      profile = await AgencyProfile.findById(user.agencyProfile);
    }

    // 3. Fallback: Check by officialBusinessEmail matching user's registered email
    if (!profile && user.email) {
      profile = await AgencyProfile.findOne({
        officialBusinessEmail: user.email.toLowerCase().trim(),
      });
    }

    let userNeedsSave = false;
    let profileNeedsSave = false;

    // Normalize user role to lowercase 'agency'
    if (user.role !== 'agency') {
      user.role = 'agency';
      userNeedsSave = true;
    }

    // If profile exists, ensure bidirectional linkage and consistency
    if (profile) {
      if (!profile.user || profile.user.toString() !== userIdStr) {
        profile.user = userId;
        profileNeedsSave = true;
      }
      if (!user.agencyProfile || user.agencyProfile.toString() !== profile._id.toString()) {
        user.agencyProfile = profile._id;
        userNeedsSave = true;
      }
      if (!user.agencyId || user.agencyId.toString() !== userIdStr) {
        user.agencyId = userId;
        userNeedsSave = true;
      }
    } else if (rawRole === 'agency') {
      // Auto-create AgencyProfile for legacy/missing records if role is agency
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const timeCode = Date.now().toString(36).toUpperCase().slice(-4);
      const applicationId = `ADM-AGY-2026-${timeCode}${randomSuffix}`;

      profile = await AgencyProfile.create({
        user: userId,
        agencyName: user.name || 'Partner Agency',
        officialBusinessEmail: user.email ? user.email.toLowerCase().trim() : '',
        applicationId,
        verificationStatus:
          user.agencyVerificationStatus === 'VERIFIED' ||
          user.agencyVerificationStatus === 'APPROVED' ||
          user.accountStatus === 'ACTIVE' ||
          user.accountStatus === 'APPROVED'
            ? 'VERIFIED'
            : 'PENDING',
        isDraft: false,
      });

      user.agencyProfile = profile._id;
      user.agencyId = userId;
      userNeedsSave = true;
    }

    // Determine verification & active state across user and profile
    const vStatus = (profile?.verificationStatus || user.agencyVerificationStatus || '').toUpperCase();
    const aStatus = (user.accountStatus || '').toUpperCase();

    const isVerified =
      vStatus === 'VERIFIED' ||
      vStatus === 'APPROVED' ||
      aStatus === 'ACTIVE' ||
      aStatus === 'APPROVED';

    const isActive =
      (aStatus === 'ACTIVE' || aStatus === 'APPROVED' || user.status === 'active' || user.isActive) &&
      aStatus !== 'SUSPENDED' &&
      user.status !== 'suspended';

    // Self-heal approved/active state on both user and profile
    if (isVerified && (user.accountStatus !== 'ACTIVE' || !user.isActive || user.status !== 'active')) {
      user.accountStatus = 'ACTIVE';
      user.status = 'active';
      user.isActive = true;
      user.agencyVerificationStatus = 'VERIFIED';
      userNeedsSave = true;
    }

    if (profile && isVerified && profile.verificationStatus !== 'VERIFIED') {
      profile.verificationStatus = 'VERIFIED';
      profileNeedsSave = true;
    }

    if (profileNeedsSave) {
      await profile.save();
    }

    if (userNeedsSave && typeof user.save === 'function') {
      await user.save();
    }

    const profileIdStr = profile ? profile._id.toString() : userIdStr;

    return {
      agencyUser: user,
      agencyProfile: profile,
      agencyUserId: userIdStr,
      agencyProfileId: profileIdStr,
      // All IDs representing this agency for robust querying
      agencyIds: [userId, profile?._id].filter(Boolean),
      agencyIdStrs: [userIdStr, profileIdStr].filter(Boolean),
      isVerified,
      isActive,
      verificationStatus: profile?.verificationStatus || user.agencyVerificationStatus || 'PENDING',
      accountStatus: user.accountStatus || 'PENDING',
    };
  } else {
    // ── Development / Offline devStore fallback ──
    profile = await devStore.findAgencyProfileByUserId(userIdStr);

    if (!profile && user.agencyProfile) {
      profile = await devStore.findAgencyProfileById(user.agencyProfile);
    }
    if (!profile && user.email) {
      const db = devStore.read();
      profile = (db.agencyProfiles || []).find(
        (p) => p.officialBusinessEmail?.toLowerCase().trim() === user.email.toLowerCase().trim()
      );
    }

    if (profile) {
      let dirty = false;
      const updates = {};
      if (profile.user?.toString() !== userIdStr) {
        updates.user = userIdStr;
        dirty = true;
      }
      if (dirty) {
        await devStore.saveAgencyProfile({ ...profile, ...updates });
      }
      if (user.agencyProfile?.toString() !== profile._id?.toString() || user.role !== 'agency') {
        await devStore.updateUser(userIdStr, {
          role: 'agency',
          agencyProfile: profile._id?.toString(),
          agencyId: userIdStr,
        });
      }
    } else if (rawRole === 'agency') {
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const timeCode = Date.now().toString(36).toUpperCase().slice(-4);
      const applicationId = `ADM-AGY-2026-${timeCode}${randomSuffix}`;

      profile = await devStore.saveAgencyProfile({
        user: userIdStr,
        agencyName: user.name || 'Partner Agency',
        officialBusinessEmail: user.email ? user.email.toLowerCase().trim() : '',
        applicationId,
        verificationStatus:
          user.agencyVerificationStatus === 'VERIFIED' ||
          user.agencyVerificationStatus === 'APPROVED' ||
          user.accountStatus === 'ACTIVE' ||
          user.accountStatus === 'APPROVED'
            ? 'VERIFIED'
            : 'PENDING',
        isDraft: false,
      });

      await devStore.updateUser(userIdStr, {
        role: 'agency',
        agencyProfile: profile._id?.toString(),
        agencyId: userIdStr,
      });
    }

    const vStatus = (profile?.verificationStatus || user.agencyVerificationStatus || '').toUpperCase();
    const aStatus = (user.accountStatus || '').toUpperCase();

    const isVerified =
      vStatus === 'VERIFIED' ||
      vStatus === 'APPROVED' ||
      aStatus === 'ACTIVE' ||
      aStatus === 'APPROVED';

    const isActive =
      (aStatus === 'ACTIVE' || aStatus === 'APPROVED' || user.status === 'active' || user.isActive) &&
      aStatus !== 'SUSPENDED' &&
      user.status !== 'suspended';

    if (isVerified && (user.accountStatus !== 'ACTIVE' || !user.isActive || user.status !== 'active')) {
      await devStore.updateUser(userIdStr, {
        accountStatus: 'ACTIVE',
        status: 'active',
        isActive: true,
        agencyVerificationStatus: 'VERIFIED',
      });
      user.accountStatus = 'ACTIVE';
      user.status = 'active';
      user.isActive = true;
      user.agencyVerificationStatus = 'VERIFIED';
    }

    const profileIdStr = profile ? profile._id?.toString() : userIdStr;

    return {
      agencyUser: user,
      agencyProfile: profile,
      agencyUserId: userIdStr,
      agencyProfileId: profileIdStr,
      agencyIds: [userIdStr, profileIdStr].filter(Boolean),
      agencyIdStrs: [userIdStr, profileIdStr].filter(Boolean),
      isVerified,
      isActive,
      verificationStatus: profile?.verificationStatus || user.agencyVerificationStatus || 'PENDING',
      accountStatus: user.accountStatus || 'PENDING',
    };
  }
};

export default resolveAuthenticatedAgency;
