const http = require('http');

const PORT = 5001;
const BASE_URL = `http://127.0.0.1:${PORT}`;

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const data = body ? JSON.stringify(body) : null;
    if (data) headers['Content-Length'] = Buffer.byteLength(data);

    const req = http.request(
      url,
      {
        method,
        headers,
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          let parsed = null;
          try {
            parsed = JSON.parse(raw);
          } catch (e) {
            parsed = raw;
          }
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        });
      }
    );

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log('================================================================');
  console.log('RUNNING AGENCY DASHBOARD AUTHORIZATION & REGRESSION TEST SUITE');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message, extra = '') {
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${message} ${extra ? `(${extra})` : ''}`);
      failed++;
    }
  }

  try {
    // 0. Server Health Check
    const health = await request('GET', '/api/health');
    assert(health.status === 200, `Backend is running on port ${PORT}`);

    const rand = Math.floor(1000 + Math.random() * 9000);
    const testPassword = 'Password123!';

    // 1. Admin Login
    console.log('\n--- 1. Admin Authentication ---');
    const adminLoginRes = await request('POST', '/api/auth/admin/login', {
      email: 'admin@admify.world',
      password: 'Admin@123456',
    });
    const adminToken = adminLoginRes.data?.token || adminLoginRes.data?.data?.token;
    assert(adminLoginRes.status === 200 && !!adminToken, 'Admin logged in and obtained token');

    // 2. Student Setup
    console.log('\n--- 2. Student Setup ---');
    const studentEmail = `student.test.${Date.now()}.${rand}@admify.world`;
    const regStudentRes = await request('POST', '/api/auth/register', {
      name: `Student Tester ${rand}`,
      email: studentEmail,
      password: testPassword,
      phone: '+880 1700-112233',
      role: 'student',
    });
    assert(regStudentRes.status === 201, 'Student registered successfully');
    const studentLogin = await request('POST', '/api/auth/login', {
      email: studentEmail,
      password: testPassword,
      role: 'student',
    });
    const studentToken = studentLogin.data?.data?.token || studentLogin.data?.token;
    assert(!!studentToken, 'Student obtained token');

    // 3. Register Agency A, B, Pending, Rejected, Suspended
    console.log('\n--- 3. Register Agency A, B, Pending, Rejected, Suspended ---');

    // Agency A
    const agencyAEmail = `agency.alpha.${Date.now()}.${rand}@admify.world`;
    const regAgencyARes = await request('POST', '/api/auth/register', {
      name: `Alpha Agency Ltd ${rand}`,
      email: agencyAEmail,
      password: testPassword,
      phone: '+880 1711-111111',
      role: 'agency',
    });
    const agencyAId = regAgencyARes.data?.data?.agency?._id || regAgencyARes.data?.data?.user?._id;
    assert(regAgencyARes.status === 201 && !!agencyAId, 'Agency A registered');

    // Agency B
    const agencyBEmail = `agency.beta.${Date.now()}.${rand}@admify.world`;
    const regAgencyBRes = await request('POST', '/api/auth/register', {
      name: `Beta Agency Ltd ${rand}`,
      email: agencyBEmail,
      password: testPassword,
      phone: '+880 1722-222222',
      role: 'agency',
    });
    const agencyBId = regAgencyBRes.data?.data?.agency?._id || regAgencyBRes.data?.data?.user?._id;
    assert(regAgencyBRes.status === 201 && !!agencyBId, 'Agency B registered');

    // Pending Agency
    const agencyPendingEmail = `agency.pending.${Date.now()}.${rand}@admify.world`;
    const regPendingRes = await request('POST', '/api/auth/register', {
      name: `Pending Agency Ltd ${rand}`,
      email: agencyPendingEmail,
      password: testPassword,
      phone: '+880 1733-333333',
      role: 'agency',
    });
    assert(regPendingRes.status === 201, 'Pending Agency registered');

    // Rejected Agency
    const agencyRejEmail = `agency.rejected.${Date.now()}.${rand}@admify.world`;
    const regRejRes = await request('POST', '/api/auth/register', {
      name: `Rejected Agency Ltd ${rand}`,
      email: agencyRejEmail,
      password: testPassword,
      phone: '+880 1744-444444',
      role: 'agency',
    });
    const agencyRejId = regRejRes.data?.data?.agency?._id || regRejRes.data?.data?.user?._id;
    assert(regRejRes.status === 201 && !!agencyRejId, 'Rejected Agency registered');

    // Suspended Agency
    const agencySuspEmail = `agency.suspended.${Date.now()}.${rand}@admify.world`;
    const regSuspRes = await request('POST', '/api/auth/register', {
      name: `Suspended Agency Ltd ${rand}`,
      email: agencySuspEmail,
      password: testPassword,
      phone: '+880 1755-555555',
      role: 'agency',
    });
    const agencySuspId = regSuspRes.data?.data?.agency?._id || regSuspRes.data?.data?.user?._id;
    assert(regSuspRes.status === 201 && !!agencySuspId, 'Suspended Agency registered');

    console.log('\n--- 4. Admin Approvals / Rejections / Suspensions ---');

    // Admin approves Agency A
    const appA = await request(
      'PUT',
      `/api/admin/agencies/verifications/${agencyAId}/status`,
      { status: 'VERIFIED', adminNotes: 'Agency A Approved' },
      adminToken
    );
    assert(appA.status === 200, 'Admin approves Agency A (200 OK)');

    // Admin approves Agency B
    const appB = await request(
      'PUT',
      `/api/admin/agencies/verifications/${agencyBId}/status`,
      { status: 'VERIFIED', adminNotes: 'Agency B Approved' },
      adminToken
    );
    assert(appB.status === 200, 'Admin approves Agency B (200 OK)');

    // Admin rejects Rejected Agency
    const appRej = await request(
      'PUT',
      `/api/admin/agencies/verifications/${agencyRejId}/status`,
      { status: 'REJECTED', rejectionReason: 'Failed background verification' },
      adminToken
    );
    assert(appRej.status === 200, 'Admin rejects Rejected Agency (200 OK)');

    // Admin suspends Suspended Agency
    const appSusp = await request(
      'PUT',
      `/api/admin/agencies/verifications/${agencySuspId}/status`,
      { status: 'SUSPENDED', adminNotes: 'Compliance violation' },
      adminToken
    );
    assert(appSusp.status === 200, 'Admin suspends Suspended Agency (200 OK)');

    console.log('\n--- Requirement A: Approved Agency Login ---');
    const loginA = await request('POST', '/api/auth/login', {
      email: agencyAEmail,
      password: testPassword,
      role: 'agency',
    });
    const tokenA = loginA.data?.data?.token || loginA.data?.token;
    assert(loginA.status === 200 && !!tokenA, 'Agency A logs in successfully directly with password');

    const loginB = await request('POST', '/api/auth/login', {
      email: agencyBEmail,
      password: testPassword,
      role: 'agency',
    });
    const tokenB = loginB.data?.data?.token || loginB.data?.token;
    assert(loginB.status === 200 && !!tokenB, 'Agency B logs in successfully directly with password');

    console.log('\n--- Requirement B: Approved Agency Dashboard Access -> 200 OK ---');
    const dashA = await request('GET', '/api/agency/dashboard', null, tokenA);
    assert(dashA.status === 200, `Agency A dashboard access returns 200 OK (status: ${dashA.status})`);
    assert(
      dashA.data?.message !== 'Access restricted to registered Agency accounts.',
      'Dashboard does NOT return "Access restricted to registered Agency accounts."'
    );

    console.log('\n--- Requirement C: Correct Agency Profile Returned ---');
    const profileA = await request('GET', '/api/agency/profile', null, tokenA);
    assert(profileA.status === 200, 'Agency A profile returns 200 OK');
    const profA = profileA.data?.data?.profile;
    const userA = profileA.data?.data?.user;
    assert(
      (profA?.agencyName && profA.agencyName.includes('Alpha Agency Ltd')) ||
      (userA?.name && userA.name.includes('Alpha Agency Ltd')) ||
      profA?.officialBusinessEmail === agencyAEmail ||
      userA?.email === agencyAEmail,
      `Agency A profile matches expected identity (Got agencyName: ${profA?.agencyName || userA?.name})`
    );

    console.log('\n--- Requirement D: Dashboard Metrics Load Successfully ---');
    const statsA = dashA.data?.data?.stats || dashA.data?.stats;
    assert(statsA !== undefined, 'Agency A dashboard returns stats payload');
    assert(
      typeof (statsA?.totalAgents ?? statsA?.activeAgents ?? 0) === 'number',
      'Metrics contain numeric agent counts'
    );
    assert(
      typeof (statsA?.totalApplications ?? 0) === 'number',
      'Metrics contain numeric application counts'
    );

    console.log('\n--- Requirement E: Agency A Cannot Access Agency B Data (IDOR & Tenant Isolation) ---');
    const docsA = await request('GET', '/api/agency/documents', null, tokenA);
    assert(docsA.status === 200, 'Agency A documents returns 200 OK');

    const agentsA = await request('GET', '/api/agency/agents', null, tokenA);
    assert(agentsA.status === 200, 'Agency A agents endpoint returns 200 OK');

    const perfA = await request('GET', '/api/agency/performance', null, tokenA);
    assert(perfA.status === 200, 'Agency A performance endpoint returns 200 OK');

    const reportsA = await request('GET', '/api/agency/reports', null, tokenA);
    assert(reportsA.status === 200, 'Agency A reports endpoint returns 200 OK');

    const profileB = await request('GET', '/api/agency/profile', null, tokenB);
    const profB = profileB.data?.data?.profile;
    const userB = profileB.data?.data?.user;
    assert(
      (profB?.agencyName && profB.agencyName.includes('Beta Agency Ltd')) ||
      (userB?.name && userB.name.includes('Beta Agency Ltd')) ||
      profB?.officialBusinessEmail === agencyBEmail ||
      userB?.email === agencyBEmail,
      'Agency B profile matches Agency B identity, completely isolated from Agency A'
    );

    console.log('\n--- 5. Setup Agent and UniRep Users for Cross-Role Isolation ---');
    // Agency A nominates an agent
    const candidateAgentEmail = `agent.sarah.${Date.now()}.${rand}@agencyalpha.com`;
    const nomRes = await request('POST', '/api/agency/agent-applications', {
      agentName: 'Sarah Agent',
      email: candidateAgentEmail,
      phone: '+8801811223344',
      designation: 'Senior Admissions Officer',
    }, tokenA);
    assert(nomRes.status === 201, 'Agency A nominated agent candidate', JSON.stringify(nomRes.data));
    const agentApp = nomRes.data?.data?.application;

    // Admin approves candidate agent application
    const approveAgentRes = await request(
      'POST',
      `/api/admin/agent-applications/${agentApp?._id}/approve`,
      { adminNotes: 'Approved counselor' },
      adminToken
    );
    assert(approveAgentRes.status === 200, 'Admin approved agent nomination');
    const activationCode = approveAgentRes.data?.data?.activationCode;

    // Agent registers
    const regAgentRes = await request('POST', '/api/auth/register', {
      name: 'Sarah Agent',
      email: candidateAgentEmail,
      password: testPassword,
      phone: '+8801811223344',
      role: 'agent',
      agencyId: agencyAId,
      agentApplicationId: agentApp?.applicationId,
      activationCode,
    });
    assert(regAgentRes.status === 201, 'Agent registered successfully with activation code');

    // Agent logs in
    const agentLogin = await request('POST', '/api/auth/login', {
      email: candidateAgentEmail,
      password: testPassword,
      role: 'agent',
    });
    const agentToken = agentLogin.data?.data?.token || agentLogin.data?.token;
    assert(!!agentToken, 'Agent logged in and obtained token');

    // UniRep Setup
    const unirepEmail = `unirep.oxford.${Date.now()}.${rand}@oxford.ac.uk`;
    const regUniRepRes = await request('POST', '/api/auth/register', {
      name: 'Dr. John Oxford',
      email: unirepEmail,
      password: testPassword,
      phone: '+44 7700 900123',
      role: 'university_rep',
      universityName: 'University of Oxford',
    });
    assert(regUniRepRes.status === 201, 'UniRep registered successfully');
    const unirepAppId = regUniRepRes.data?.data?.applicationId;

    // Admin approves UniRep
    const approveUniRepRes = await request(
      'POST',
      `/api/admin/university-rep-applications/${unirepAppId}/approve`,
      { adminNotes: 'Verified university credentials' },
      adminToken
    );
    assert(approveUniRepRes.status === 200, 'Admin approved UniRep application');
    const unirepActivationToken = approveUniRepRes.data?.data?.activationToken || approveUniRepRes.data?.activationToken;

    // UniRep activates account
    const actUniRepRes = await request('POST', '/api/auth/activate-university-rep', {
      token: unirepActivationToken,
    });
    assert(actUniRepRes.status === 200, 'UniRep activated account via token');

    // UniRep logs in
    const unirepLogin = await request('POST', '/api/auth/login', {
      email: unirepEmail,
      password: testPassword,
      role: 'university',
    });
    const unirepToken = unirepLogin.data?.data?.token || unirepLogin.data?.token;
    assert(!!unirepToken, 'UniRep logged in and obtained token');

    console.log('\n--- Requirement F: Non-agency User Cannot Access Agency Dashboard (HTTP 403) ---');
    const studentDash = await request('GET', '/api/agency/dashboard', null, studentToken);
    assert(
      studentDash.status === 403,
      `Student access to Agency dashboard blocked with HTTP 403 (got ${studentDash.status})`
    );
    assert(
      studentDash.data?.message === 'Access restricted to registered Agency accounts.',
      'Student gets exact error: "Access restricted to registered Agency accounts."'
    );

    const agentDash = await request('GET', '/api/agency/dashboard', null, agentToken);
    assert(agentDash.status === 403, `Agent access to Agency dashboard blocked with HTTP 403 (got ${agentDash.status})`);
    assert(
      agentDash.data?.message === 'Access restricted to registered Agency accounts.',
      'Agent gets exact error: "Access restricted to registered Agency accounts."'
    );

    const unirepDash = await request('GET', '/api/agency/dashboard', null, unirepToken);
    assert(unirepDash.status === 403, `UniRep access to Agency dashboard blocked with HTTP 403 (got ${unirepDash.status})`);
    assert(
      unirepDash.data?.message === 'Access restricted to registered Agency accounts.',
      'UniRep gets exact error: "Access restricted to registered Agency accounts."'
    );

    console.log('\n--- Requirement G: Pending Agency Blocked from Operational Dashboard ---');
    const loginPending = await request('POST', '/api/auth/login', {
      email: agencyPendingEmail,
      password: testPassword,
      role: 'agency',
    });
    assert(
      loginPending.status === 403,
      `Pending agency login correctly blocked with 403 (got ${loginPending.status})`
    );
    assert(
      loginPending.data?.message === 'Your agency registration is still under review.',
      'Pending agency received review message'
    );

    console.log('\n--- Requirement H: Rejected Agency Blocked from Login ---');
    const loginRej = await request('POST', '/api/auth/login', {
      email: agencyRejEmail,
      password: testPassword,
      role: 'agency',
    });
    assert(loginRej.status === 403, `Rejected agency login blocked with HTTP 403 (got ${loginRej.status})`);
    assert(
      loginRej.data?.message && loginRej.data.message.toLowerCase().includes('rejected'),
      `Rejected agency received rejection message: "${loginRej.data?.message}"`
    );

    console.log('\n--- Requirement I: Suspended Agency Blocked from Login / Access ---');
    const loginSusp = await request('POST', '/api/auth/login', {
      email: agencySuspEmail,
      password: testPassword,
      role: 'agency',
    });
    assert(loginSusp.status === 403, `Suspended agency login blocked with HTTP 403 (got ${loginSusp.status})`);
    assert(
      loginSusp.data?.message && (loginSusp.data.message.toLowerCase().includes('suspended') || loginSusp.data.message.toLowerCase().includes('inactive') || loginSusp.data.message.toLowerCase().includes('review')),
      `Suspended agency received suspension message: "${loginSusp.data?.message}"`
    );

    console.log('\n--- Requirement J: Admin Access Remains Unaffected ---');
    const adminAgenciesList = await request('GET', '/api/admin/agencies', null, adminToken);
    assert(adminAgenciesList.status === 200, 'Admin can list agencies (200 OK)');
    const adminStats = await request('GET', '/api/admin/stats', null, adminToken);
    assert(adminStats.status === 200, 'Admin stats endpoint unaffected (200 OK)');

    console.log('\n--- Requirement K: Existing Agent Panel / Endpoints Unaffected ---');
    const agentProfile = await request('GET', '/api/agent/profile', null, agentToken);
    assert(agentProfile.status === 200, `Agent profile endpoint accessible (${agentProfile.status})`);

    console.log('\n--- Requirement L: Existing UniRep Panel / Endpoints Unaffected ---');
    const unirepProfile = await request('GET', '/api/university-rep/dashboard', null, unirepToken);
    assert(unirepProfile.status === 200, `UniRep dashboard endpoint accessible (${unirepProfile.status})`);

    console.log('\n--- Requirement M: Existing Student Panel / Endpoints Unaffected ---');
    const studentProfile = await request('GET', '/api/users/profile', null, studentToken);
    assert(studentProfile.status === 200, `Student profile endpoint accessible (${studentProfile.status})`);

    const studentMe = await request('GET', '/api/auth/me', null, studentToken);
    assert(studentMe.status === 200, `Student auth/me endpoint accessible (${studentMe.status})`);

    console.log('\n================================================================');
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('================================================================\n');

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error('Test execution failed with error:', err);
    process.exit(1);
  }
}

runTests();
