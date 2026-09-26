// test_agent_lifecycle.js
// Automated verification script for Agent Registration + Admin Approval + Activation Flow
import { devStore } from './utils/devStore.js';

const BASE_URL = 'http://localhost:5001';

async function req(url, options = {}) {
  const { headers, ...restOptions } = options;
  const fullUrl = `${BASE_URL}${url}`;
  const res = await fetch(fullUrl, {
    ...restOptions,
    headers: {
      'Content-Type': 'application/json',
      ...(headers || {}),
    },
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, data };
}

async function runTests() {
  console.log('====================================================');
  console.log('STARTING AGENT REGISTRATION LIFECYCLE VERIFICATION');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  // 1. Admin Login to get admin token
  console.log('--- Step 1: Admin Authentication ---');
  const adminLoginRes = await req('/api/auth/admin/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'admin@admify.world', password: 'Admin@123456' }),
  });
  assert(adminLoginRes.status === 200 && adminLoginRes.data?.data?.token, 'Admin logged in successfully');
  const adminToken = adminLoginRes.data?.data?.token;

  // 2. Create and Verify Sponsoring Agency
  console.log('\n--- Step 2: Sponsoring Agency Setup ---');
  const agencyEmail = `global_agency_${Date.now()}@eduglobal.com`;
  const agencySignupRes = await req('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'EduGlobal Study Abroad Consultancy',
      email: agencyEmail,
      password: 'AgencyPassword123!',
      phone: '+8801700998877',
      role: 'agency',
    }),
  });
  assert(agencySignupRes.status === 201, 'Agency initial registration created PENDING application');
  const agencyAppId = agencySignupRes.data?.data?.applicationId;
  const agencyUserId = agencySignupRes.data?.data?.agency?._id;
  assert(agencyAppId && agencyUserId, `Agency Application ID: ${agencyAppId}, User ID: ${agencyUserId}`);

  // Test that an UNVERIFIED agency cannot submit agent nominations
  // Login with temporary/pending status should be blocked or token unusable for agent applications
  const unverifiedNominationRes = await req('/api/agency/agent-applications', {
    method: 'POST',
    headers: { Authorization: `Bearer fake-or-no-token` },
    body: JSON.stringify({ agentName: 'Test' }),
  });
  assert(unverifiedNominationRes.status === 401, 'Unauthenticated / unverified agency blocked from nominating agents');

  // Verify and activate Agency in store
  await devStore.updateUser(agencyUserId, {
    accountStatus: 'ACTIVE',
    status: 'active',
    isActive: true,
    emailVerified: true,
    agencyVerificationStatus: 'VERIFIED',
  });
  await devStore.saveAgencyProfile({
    user: agencyUserId,
    applicationId: agencyAppId,
    agencyName: 'EduGlobal Study Abroad Consultancy',
    officialBusinessEmail: agencyEmail,
    verificationStatus: 'VERIFIED',
    isDraft: false,
  });

  // Approved Agency logs in
  const agencyLoginRes = await req('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: agencyEmail, password: 'AgencyPassword123!', role: 'agency' }),
  });
  assert(agencyLoginRes.status === 200, 'Approved & Activated Agency logged in successfully');
  const agencyToken = agencyLoginRes.data?.data?.token;
  assert(Boolean(agencyToken), 'Agency obtained authenticated session token');

  // 3. Agency Submits Agent Application
  console.log('\n--- Step 3: Agency Submits Agent Application ---');
  const agentEmail = `agent_sarah_${Date.now()}@eduglobal.com`;
  const agentNominationRes = await req('/api/agency/agent-applications', {
    method: 'POST',
    headers: { Authorization: `Bearer ${agencyToken}` },
    body: JSON.stringify({
      agentName: 'Sarah Jenkins',
      email: agentEmail,
      phone: '+8801811223344',
      designation: 'Senior Education Counselor',
      countrySpecialization: ['United Kingdom', 'Canada', 'Australia'],
      notes: '5 years of overseas admissions experience.',
    }),
  });
  if (agentNominationRes.status !== 201) {
    console.error('Agency nomination failed:', agentNominationRes.status, agentNominationRes.data);
  }
  assert(agentNominationRes.status === 201, 'Agency nominated agent candidate successfully');
  const agentApp = agentNominationRes.data?.data?.application;
  assert(agentApp?.applicationId && agentApp.applicationId.startsWith('AGT-APP-'), `Generated Application ID: ${agentApp?.applicationId}`);
  assert(agentApp?.status === 'PENDING', 'Initial application status is PENDING');

  // Test duplicate nomination rejection
  const duplicateNominationRes = await req('/api/agency/agent-applications', {
    method: 'POST',
    headers: { Authorization: `Bearer ${agencyToken}` },
    body: JSON.stringify({
      agentName: 'Sarah Jenkins',
      email: agentEmail,
      phone: '+8801811223344',
    }),
  });
  assert(duplicateNominationRes.status === 400, 'Duplicate agent nomination email correctly rejected');

  // 4. Admin Review and Approval of Agent Application
  console.log('\n--- Step 4: Admin Review & Code Generation ---');
  const adminAgentAppsRes = await req('/api/admin/agent-applications', {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(adminAgentAppsRes.status === 200, 'Admin listed agent applications');
  const listedApp = (adminAgentAppsRes.data?.data?.applications || []).find(
    (a) => a.applicationId === agentApp.applicationId
  );
  assert(listedApp, 'Admin located candidate agent application in review queue');

  // Admin approves agent application -> generates ADM-AGT-XXXXXX activation code
  const approveAgentRes = await req(`/api/admin/agent-applications/${agentApp._id}/approve`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ adminNotes: 'Approved counselor background check.' }),
  });
  assert(approveAgentRes.status === 200, 'Admin approved agent application');
  const activationCode = approveAgentRes.data?.data?.activationCode;
  assert(
    activationCode && activationCode.startsWith('ADM-AGT-'),
    `Admin generated secure Activation Code: ${activationCode}`
  );

  // 5. Agent Registration & Security Validation Checks
  console.log('\n--- Step 5: Agent Registration & Security Validations ---');

  // 5a. Bad Agency ID
  const badAgencyRes = await req('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Sarah Jenkins',
      email: agentEmail,
      password: 'AgentPassword123!',
      phone: '+8801811223344',
      role: 'agent',
      agencyId: 'NON_EXISTENT_AGENCY_ID',
      agentApplicationId: agentApp.applicationId,
      activationCode,
    }),
  });
  assert(badAgencyRes.status === 400 && badAgencyRes.data?.message?.includes('Agency'), 'Rejected: Invalid / non-existent Agency ID');

  // 5b. Bad Agent Application ID
  const badAppIdRes = await req('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Sarah Jenkins',
      email: agentEmail,
      password: 'AgentPassword123!',
      phone: '+8801811223344',
      role: 'agent',
      agencyId: agencyAppId,
      agentApplicationId: 'AGT-APP-FAKE-9999',
      activationCode,
    }),
  });
  assert(badAppIdRes.status === 400 && badAppIdRes.data?.message?.includes('application'), 'Rejected: Non-existent Agent Application ID');

  // 5c. Bad Activation Code
  const badCodeRes = await req('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Sarah Jenkins',
      email: agentEmail,
      password: 'AgentPassword123!',
      phone: '+8801811223344',
      role: 'agent',
      agencyId: agencyAppId,
      agentApplicationId: agentApp.applicationId,
      activationCode: 'ADM-AGT-WRONG99',
    }),
  });
  assert(badCodeRes.status === 400 && badCodeRes.data?.message?.includes('activation code'), 'Rejected: Invalid activation code');

  // 5d. Mismatched Agent Email
  const badEmailRes = await req('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Sarah Jenkins',
      email: 'different_email@yahoo.com',
      password: 'AgentPassword123!',
      phone: '+8801811223344',
      role: 'agent',
      agencyId: agencyAppId,
      agentApplicationId: agentApp.applicationId,
      activationCode,
    }),
  });
  assert(badEmailRes.status === 400 && badEmailRes.data?.message?.includes('email'), 'Rejected: Mismatched agent email');

  // 5e. SUCCESSFUL REGISTRATION with valid credentials
  console.log('\n--- Step 6: Successful Agent Verification & Activation ---');
  const validRegRes = await req('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Sarah Jenkins',
      email: agentEmail,
      password: 'AgentPassword123!',
      phone: '+8801811223344',
      role: 'agent',
      agencyId: agencyAppId, // Can pass agency application ID or mongo ID
      agentApplicationId: agentApp.applicationId,
      activationCode,
    }),
  });
  assert(validRegRes.status === 201, 'Agent successfully registered and activated');
  const agentUser = validRegRes.data?.data?.user;
  const agentToken = validRegRes.data?.data?.token;

  assert(agentUser?.role === 'agent', `Agent role correctly set to: "${agentUser?.role}"`);
  assert(
    agentUser?.agencyId && (agentUser.agencyId === agencyUserId || agentUser.agencyId === agencyAppId),
    `Agent automatically linked to Sponsoring Agency (ID: ${agentUser?.agencyId})`
  );
  assert(
    agentUser?.agentApplicationId === agentApp.applicationId,
    `Agent linked to exact Agent Application ID: ${agentUser?.agentApplicationId}`
  );
  assert(agentUser?.accountStatus === 'ACTIVE', `Agent accountStatus is ACTIVE`);
  assert(Boolean(agentToken), 'Agent issued active JWT session');

  // 6. Security Replay Prevention
  console.log('\n--- Step 7: Anti-Replay & Code Invalidation Checks ---');
  const replayRegRes = await req('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Sarah Jenkins Attack Replay',
      email: agentEmail,
      password: 'AgentPassword123!',
      phone: '+8801811223344',
      role: 'agent',
      agencyId: agencyAppId,
      agentApplicationId: agentApp.applicationId,
      activationCode,
    }),
  });
  assert(replayRegRes.status === 400, 'Replay registration rejected (Code already USED)');

  // 7. Verify Agent Can Access Auth Me with Linked Agency Data
  console.log('\n--- Step 8: Agent Session & Profile Intactness ---');
  const meRes = await req('/api/auth/me', {
    headers: { Authorization: `Bearer ${agentToken}` },
  });
  assert(meRes.status === 200, 'Agent can access /api/auth/me with new token');
  assert(meRes.data?.data?.user?.agencyId, 'Agent profile reflects linked agencyId');
  assert(meRes.data?.data?.user?.agentApplicationId, 'Agent profile reflects linked agentApplicationId');

  // 8. Regression Checks: Student registration and Normal login
  console.log('\n--- Step 9: Regression Checks ---');
  const studentEmail = `student_test_${Date.now()}@gmail.com`;
  const studentRegRes = await req('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'John Student',
      email: studentEmail,
      password: 'StudentPassword123!',
      phone: '+8801911223344',
      role: 'student',
    }),
  });
  assert(studentRegRes.status === 201, 'Student standard registration still works correctly');

  const studentLoginRes = await req('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: studentEmail,
      password: 'StudentPassword123!',
      role: 'student',
    }),
  });
  assert(studentLoginRes.status === 200, 'Student login works correctly');

  console.log('\n====================================================');
  console.log(`VERIFICATION COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
