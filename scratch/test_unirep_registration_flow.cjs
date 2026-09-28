/**
 * test_unirep_registration_flow.cjs
 * Comprehensive test suite validating:
 * 1. Basic Uni Rep signup with only basic fields -> SUCCESS (HTTP 201)
 * 2. User created with status=pending, accountStatus=PENDING, role=university_rep
 * 3. Scoped registration token returned; no active login session created
 * 4. Verification submission endpoint succeeds with required university + representative fields
 * 5. Verification submission updates status to UNDER_REVIEW
 * 6. Missing required verification fields are rejected (HTTP 400)
 * 7. Agency registration still passes (Basic -> Verification)
 * 8. Agent registration still passes (with activation code)
 * 9. Student registration still passes
 */

const http = require('http');
const assert = require('assert');

function makeRequest(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'localhost',
      port: 5001,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    };

    const req = http.request(options, (res) => {
      let raw = '';
      res.on('data', (chunk) => (raw += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(raw);
          resolve({ status: res.statusCode, body: parsed });
        } catch {
          resolve({ status: res.statusCode, raw });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log('================================================================');
  console.log('RUNNING UNIVERSITY REPRESENTATIVE & MULTI-ROLE REGISTRATION TESTS');
  console.log('================================================================\n');

  const rand = Math.floor(100000 + Math.random() * 900000);
  const password = 'Password123!';

  // ── TEST 1: Basic Uni Rep Signup with ONLY Basic Fields ────────────────────
  console.log('[TEST 1 & 2 & 3] Basic Uni Rep Signup with ONLY Basic Fields');
  const uniRepEmail = `unirep_${rand}@oxford.ac.uk`;
  const unirepBasicPayload = {
    name: 'Dr. Arthur Pendelton',
    email: uniRepEmail,
    password,
    phone: '+44 1865 123456',
    role: 'university', // Frontend sends "university" or "university_rep"
  };

  const res1 = await makeRequest('POST', '/api/auth/register', unirepBasicPayload);
  console.log('Signup response status:', res1.status);
  assert.strictEqual(res1.status, 201, `Basic signup must return HTTP 201, got ${res1.status}: ${JSON.stringify(res1.body)}`);
  assert.strictEqual(res1.body.success, true);
  assert(res1.body.data.registrationToken, 'Scoped registrationToken must be returned');
  assert(res1.body.data.applicationId, 'applicationId must be returned');
  assert.strictEqual(res1.body.data.representative.role, 'university_rep');
  assert.strictEqual(res1.body.data.representative.accountStatus, 'PENDING');
  assert.strictEqual(res1.body.data.representative.verificationStatus, 'PENDING');
  console.log('  -> PASS: Uni Rep account created as PENDING without validation error');
  console.log('  -> PASS: Registration token returned:', res1.body.data.registrationToken.slice(0, 25) + '...');

  const regToken = res1.body.data.registrationToken;
  const unirepAppId = res1.body.data.applicationId;

  // Verify that this registration token CANNOT be used to access protected role dashboards
  const authCheck = await makeRequest('GET', '/api/auth/me', null, regToken);
  assert(authCheck.status === 401 || authCheck.status === 403, 'Registration token must NOT act as active user session');
  console.log('  -> PASS: Registration token is scoped and cannot access authenticated user endpoints\n');

  // ── TEST 6: Missing Required Verification Fields Rejected ─────────────────
  console.log('[TEST 6] Verification submission rejects missing required fields');
  // Attempt to submit verification missing University City and Employee ID
  const invalidVerificationPayload = {
    applicationId: unirepAppId,
    university: {
      name: 'University of Oxford',
      legalName: 'The Chancellor Masters and Scholars of the University of Oxford',
      website: 'https://www.ox.ac.uk',
      country: 'United Kingdom',
      city: '', // MISSING!
      type: 'Public',
      domain: 'oxford.ac.uk',
    },
    representative: {
      fullName: 'Dr. Arthur Pendelton',
      designation: 'International Admissions Officer',
      officialEmail: uniRepEmail,
      phone: '+44 1865 123456',
      employeeId: '', // MISSING!
    },
    documents: {
      authorizationLetter: { fileName: 'auth.pdf', fileData: 'data:application/pdf;base64,mock' },
      officialUniversityId: { fileName: 'id.pdf', fileData: 'data:application/pdf;base64,mock' },
    },
    academicScope: {
      studyLevels: ['Undergraduate', "Master's"],
      programsDepartments: 'Faculty of History',
      countriesRegionsHandled: ['United Kingdom', 'Europe'],
    },
    professional: {
      yearsOfExperience: 5,
    },
    declarations: {
      informationAccuracy: true,
      authorizationConfirmation: true,
      termsAndPolicy: true,
    },
  };

  const resInvalid = await makeRequest('POST', '/api/university-rep/verification', invalidVerificationPayload, regToken);
  assert.strictEqual(resInvalid.status, 400, `Expected HTTP 400 for missing city, got ${resInvalid.status}`);
  console.log('  -> PASS: Rejected missing university field with message:', resInvalid.body.message);

  // ── TEST 4 & 5: Valid Verification Submission -> UNDER_REVIEW ─────────────
  console.log('[TEST 4 & 5] Valid verification submission succeeds and transitions to UNDER_REVIEW');
  const validVerificationPayload = {
    ...invalidVerificationPayload,
    university: {
      ...invalidVerificationPayload.university,
      city: 'Oxford',
    },
    representative: {
      ...invalidVerificationPayload.representative,
      employeeId: 'OXF-EMP-8899',
    },
  };

  const resValid = await makeRequest('POST', '/api/university-rep/verification', validVerificationPayload, regToken);
  assert.strictEqual(resValid.status, 200, `Verification submission should succeed with HTTP 200, got ${resValid.status}: ${JSON.stringify(resValid.body)}`);
  assert.strictEqual(resValid.body.success, true);
  assert.strictEqual(resValid.body.data.application.status, 'UNDER_REVIEW');
  assert.strictEqual(resValid.body.data.application.university.city, 'Oxford');
  assert.strictEqual(resValid.body.data.application.representative.employeeId, 'OXF-EMP-8899');
  console.log('  -> PASS: Verification application submitted successfully as UNDER_REVIEW\n');

  // ── TEST 7: Agency Registration Flow Still Passes ─────────────────────────
  console.log('[TEST 7] Agency Registration Flow');
  const agencyEmail = `agency_${rand}@consultancy.com`;
  const agencyRes = await makeRequest('POST', '/api/auth/register', {
    name: 'Global Edu Consult',
    email: agencyEmail,
    password,
    phone: '+1 555 123 4567',
    role: 'agency',
  });
  assert.strictEqual(agencyRes.status, 201, `Agency signup should return 201, got ${agencyRes.status}`);
  assert(agencyRes.body.data.registrationToken, 'Agency registrationToken required');
  assert.strictEqual(agencyRes.body.data.agency.accountStatus, 'PENDING');
  console.log('  -> PASS: Agency basic registration created as PENDING\n');

  // ── TEST 8: Agent Registration Flow ───────────────────────────────────────
  console.log('[TEST 8] Agent Registration with Approved Application & Code');
  // First seed an Agency and AgentApplication in devStore to get code
  const devStore = (await import('../backend/utils/devStore.js')).default;
  const hostAgency = await devStore.createUser({
    name: 'Host Agency Ltd',
    email: `host_${rand}@agency.com`,
    password,
    phone: '+1 888 555 1111',
    role: 'agency',
    accountStatus: 'ACTIVE',
    status: 'active',
  });

  const agentApp = await devStore.createAgentApplication({
    applicationId: `AGT-APP-${rand}`,
    name: 'Tariq Agent',
    email: `tariq_${rand}@agency.com`,
    phone: '+1 888 555 2222',
    agency: hostAgency._id,
    agencyId: hostAgency._id,
    agencyName: hostAgency.name,
    status: 'APPROVED',
    activationCode: `ACT-${rand}`,
    activationCodeStatus: 'ISSUED',
    activationCodeExpires: new Date(Date.now() + 86400000).toISOString(),
  });

  const agentRes = await makeRequest('POST', '/api/auth/register', {
    name: 'Tariq Agent',
    email: `tariq_${rand}@agency.com`,
    password,
    phone: '+1 888 555 2222',
    role: 'agent',
    agencyId: hostAgency._id,
    agentApplicationId: agentApp.applicationId,
    activationCode: `ACT-${rand}`,
  });
  assert.strictEqual(agentRes.status, 201, `Agent signup should return 201, got ${agentRes.status}: ${JSON.stringify(agentRes.body)}`);
  assert.strictEqual(agentRes.body.data.user.role, 'agent');
  assert.strictEqual(agentRes.body.data.user.accountStatus, 'ACTIVE');
  console.log('  -> PASS: Agent registration succeeds with valid activation code\n');

  // ── TEST 9: Student Registration Flow ─────────────────────────────────────
  console.log('[TEST 9] Student Registration Flow');
  const studentEmail = `student_${rand}@admission.edu`;
  const studentRes = await makeRequest('POST', '/api/auth/register', {
    name: 'Maria Santos',
    email: studentEmail,
    password,
    phone: '+1 555 987 6543',
    role: 'student',
  });
  assert.strictEqual(studentRes.status, 201, `Student signup should return 201, got ${studentRes.status}`);
  assert.strictEqual(studentRes.body.data.user.role, 'student');
  assert.strictEqual(studentRes.body.data.user.accountStatus, 'ACTIVE');
  console.log('  -> PASS: Student registration creates active account\n');

  console.log('================================================================');
  console.log('ALL REGISTRATION & VERIFICATION TESTS PASSED SUCCESSFULLY! (9/9)');
  console.log('================================================================\n');
}

runTests().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
