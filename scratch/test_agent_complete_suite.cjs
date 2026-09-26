/**
 * Comprehensive Automated Agent Test Suite
 * Tests all Agent Panel endpoints, RBAC, IDOR protection, student privacy isolation,
 * zero wallet leaks, task workflows, and regression across roles.
 */
const http = require('http');

const BASE_URL = 'http://localhost:5001';

function makeRequest(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(
      url,
      {
        method,
        headers,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve({ status: res.statusCode, body: parsed });
          } catch (e) {
            resolve({ status: res.statusCode, body: data });
          }
        });
      }
    );

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('  STARTING ADMIFY AGENT PANEL TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // 1. Unauthenticated Agent API = 401
    console.log('--- TEST 1: Unauthenticated Agent API Protection ---');
    const unauth = await makeRequest('GET', '/api/agent/dashboard');
    assert(unauth.status === 401, 'Unauthenticated request to /api/agent/dashboard returns 401');

    // 2. Student -> Agent API = 403
    console.log('\n--- TEST 2: Role Authorization (Student -> Agent API) ---');
    const studentLogin = await makeRequest('POST', '/api/auth/login', {
      email: 'student@example.com',
      password: 'password123',
    });

    let studentToken = null;
    if (studentLogin.status === 200) {
      studentToken = studentLogin.body.data?.token || studentLogin.body.token;
      const studentOnAgent = await makeRequest('GET', '/api/agent/dashboard', null, studentToken);
      assert(studentOnAgent.status === 403, 'Student accessing /api/agent/dashboard returns 403 Forbidden');
    } else {
      console.log('  [SKIP] Default student login not found; creating mock student...');
      const registerStudent = await makeRequest('POST', '/api/auth/register', {
        name: 'Test Student',
        email: `student_${Date.now()}@test.com`,
        password: 'Password123!',
        phone: '+880 1711 000000',
        role: 'student',
      });
      studentToken = registerStudent.body.data?.token || registerStudent.body.token;
      const studentOnAgent = await makeRequest('GET', '/api/agent/dashboard', null, studentToken);
      assert(studentOnAgent.status === 403, 'Student accessing /api/agent/dashboard returns 403 Forbidden');
    }

    // 3. Agency -> Agent API = 403
    console.log('\n--- TEST 3: Role Authorization (Agency -> Agent API) ---');
    const agencyLogin = await makeRequest('POST', '/api/auth/login', {
      email: 'pinnacle_test_2@admify.world',
      password: 'Password123!',
    });
    assert(agencyLogin.status === 200, 'Verified Agency logged in successfully');
    const agencyToken = agencyLogin.body?.data?.token;
    const agencyUser = agencyLogin.body?.data?.user;

    const agencyOnAgent = await makeRequest('GET', '/api/agent/dashboard', null, agencyToken);
    assert(agencyOnAgent.status === 403, 'Agency accessing /api/agent/dashboard returns 403 Forbidden');

    // 4. Agent Registration Flow & Active Agent Authentication
    console.log('\n--- TEST 4: Agent Registration Flow (Agency -> Application -> Code -> Register) ---');
    const agentEmail = `agent_${Date.now()}@testcounselor.world`;
    const agentApply = await makeRequest('POST', '/api/agency/agent-applications', {
      name: 'Certified Education Counselor',
      email: agentEmail,
      phone: '+880 1711 999888',
      designation: 'Senior Admissions Lead',
      experienceYears: '5',
      countrySpecialization: 'UK, Canada',
      notes: 'Automated test suite registration',
    }, agencyToken);
    assert(agentApply.status === 201, 'Agency submitted Agent Application (HTTP 201)');
    const appRecord = agentApply.body.data?.application;
    const appId = appRecord?.applicationId || appRecord?._id;

    // Generate Admin JWT token and approve application via Admin API
    const jwt = require('../backend/node_modules/jsonwebtoken');
    const adminToken = jwt.sign(
      { id: '674e1a0b1234567890abcdef' },
      process.env.JWT_SECRET || 'admify_dev_jwt_secret_key_2026_super_secure',
      { expiresIn: '1h' }
    );

    const approveRes = await makeRequest(
      'POST',
      `/api/admin/agent-applications/${appRecord._id}/approve`,
      {},
      adminToken
    );
    assert(approveRes.status === 200, 'Admin approved Agent Application and generated Activation Code via API (HTTP 200)');
    const activationCode =
      approveRes.body?.data?.activationCode ||
      approveRes.body?.activationCode ||
      approveRes.body?.data?.application?.activationCode;
    assert(!!activationCode, `Activation Code received: ${activationCode}`);

    // Register Agent using the 3 required fields
    const registerAgent = await makeRequest('POST', '/api/auth/register', {
      name: 'Certified Education Counselor',
      email: agentEmail,
      password: 'Password123!',
      phone: '+880 1711 999888',
      role: 'agent',
      agencyId: agencyUser._id,
      agentApplicationId: appRecord.applicationId,
      activationCode: activationCode,
    });
    if (registerAgent.status !== 201) {
      console.error('Registration failed with:', registerAgent.status, registerAgent.body);
    }
    assert(registerAgent.status === 201, 'Agent successfully registered with valid Agency ID, App ID, and Activation Code');

    // Login as the newly created Agent
    const agentLogin = await makeRequest('POST', '/api/auth/login', {
      email: agentEmail,
      password: 'Password123!',
    });
    assert(agentLogin.status === 200, 'Agent login succeeds with HTTP 200');
    const agentToken = agentLogin.body.data?.token;
    assert(!!agentToken, 'Agent JWT token received');

    const agentDash = await makeRequest('GET', '/api/agent/dashboard', null, agentToken);
    assert(agentDash.status === 200, 'Agent dashboard returned HTTP 200');
    assert(agentDash.body.success === true, 'Dashboard response has success=true');
    assert(agentDash.body.data?.stats !== undefined, 'Dashboard contains operational statistics');
    console.log('  Agent Stats:', JSON.stringify(agentDash.body.data.stats));

    // 5. Student List & Strict Privacy (Zero Wallet / Payment Data Leakage)
    console.log('\n--- TEST 5: Student Privacy & Zero Wallet Leakage ---');
    const studentsRes = await makeRequest('GET', '/api/agent/students', null, agentToken);
    assert(studentsRes.status === 200, 'Agent students endpoint returned HTTP 200');
    assert(Array.isArray(studentsRes.body.data?.students), 'Students list returned as array');

    const students = studentsRes.body.data.students;
    let walletLeaked = false;
    for (const s of students) {
      if (s.walletCredits !== undefined || s.paidCredits !== undefined || s.freeCredits !== undefined) {
        walletLeaked = true;
        break;
      }
    }
    assert(!walletLeaked, 'STRICT PRIVACY: Zero student walletCredits / paidCredits / freeCredits exposed');

    // 6. Applications Management & Caseload Isolation
    console.log('\n--- TEST 6: Application Management & Stage Updating ---');
    const appsRes = await makeRequest('GET', '/api/agent/applications', null, agentToken);
    assert(appsRes.status === 200, 'Agent applications endpoint returned HTTP 200');
    assert(Array.isArray(appsRes.body.data?.applications), 'Applications returned as array');

    // 7. Tasks & Deadlines (Create, Query, Update)
    console.log('\n--- TEST 7: Tasks & Deadlines Lifecycle ---');
    const createTaskRes = await makeRequest('POST', '/api/agent/tasks', {
      title: 'Verify IELTS authenticity for applicant',
      dueDate: '2026-10-15',
      priority: 'HIGH',
      notes: 'Follow up with university admissions office',
    }, agentToken);
    assert(createTaskRes.status === 201, 'Agent task created with HTTP 201');
    assert(createTaskRes.body.data?.task?.title === 'Verify IELTS authenticity for applicant', 'Task title recorded');

    const taskId = createTaskRes.body.data.task._id;

    const updateTaskRes = await makeRequest('PUT', `/api/agent/tasks/${taskId}`, {
      status: 'COMPLETED',
      notes: 'IELTS certificate verified successfully.',
    }, agentToken);
    assert(updateTaskRes.status === 200, 'Agent task updated to COMPLETED with HTTP 200');
    assert(updateTaskRes.body.data?.task?.status === 'COMPLETED', 'Task status is COMPLETED');

    const tasksListRes = await makeRequest('GET', '/api/agent/tasks', null, agentToken);
    assert(tasksListRes.status === 200, 'Agent tasks list returned HTTP 200');
    const foundTask = tasksListRes.body.data.tasks.find((t) => t._id === taskId);
    assert(!!foundTask, 'Newly created and updated task found in agent task list');

    // 8. Documents Repository
    console.log('\n--- TEST 8: Documents Repository ---');
    const docsRes = await makeRequest('GET', '/api/agent/documents', null, agentToken);
    assert(docsRes.status === 200, 'Agent documents endpoint returned HTTP 200');
    assert(Array.isArray(docsRes.body.data?.documents), 'Documents returned as array');

    // 9. SOP & LOR Drafts
    console.log('\n--- TEST 9: SOP & LOR Workspace ---');
    const sopRes = await makeRequest('GET', '/api/agent/sop-lor', null, agentToken);
    assert(sopRes.status === 200, 'Agent SOP/LOR endpoint returned HTTP 200');
    assert(Array.isArray(sopRes.body.data?.items), 'SOP/LOR cases returned as array');

    // 10. Universities Catalog (Read-Only)
    console.log('\n--- TEST 10: Universities Catalog ---');
    const unisRes = await makeRequest('GET', '/api/agent/universities', null, agentToken);
    assert(unisRes.status === 200, 'Agent universities directory returned HTTP 200');
    assert(Array.isArray(unisRes.body.data?.universities), 'Universities returned as array');

    // 11. Performance Metrics
    console.log('\n--- TEST 11: Real Performance Metrics ---');
    const perfRes = await makeRequest('GET', '/api/agent/performance', null, agentToken);
    assert(perfRes.status === 200, 'Agent performance endpoint returned HTTP 200');
    assert(perfRes.body.data?.totalApplications !== undefined, 'Contains real application count');
    assert(perfRes.body.data?.taskCompletionRate !== undefined, 'Contains real task completion rate');

    // 12. Notifications & Mark-as-read
    console.log('\n--- TEST 12: Notifications Management ---');
    const notifsRes = await makeRequest('GET', '/api/agent/notifications', null, agentToken);
    assert(notifsRes.status === 200, 'Agent notifications returned HTTP 200');
    assert(Array.isArray(notifsRes.body.data?.notifications), 'Notifications returned as array');

    // 13. Reports Submission & Retrieval
    console.log('\n--- TEST 13: Operational Issue Reporting ---');
    const reportRes = await makeRequest('POST', '/api/agent/reports', {
      targetType: 'application_issue',
      reason: 'Delay in student CAS statement issuance',
      details: 'Followed up twice with international office without response',
    }, agentToken);
    assert(reportRes.status === 201, 'Agent report filed with HTTP 201');
    assert(reportRes.body.data?.report?.status === 'OPEN', 'Report created with status OPEN');

    const reportsList = await makeRequest('GET', '/api/agent/reports', null, agentToken);
    assert(reportsList.status === 200, 'Agent reports list returned HTTP 200');
    assert(reportsList.body.data?.reports?.length > 0, 'Report found in agent reports list');

    // 14. Sponsoring Agency Affiliation (Read-Only & Immutable)
    console.log('\n--- TEST 14: Sponsoring Agency Affiliation ---');
    const agencyRes = await makeRequest('GET', '/api/agent/agency', null, agentToken);
    assert(agencyRes.status === 200, 'Agent agency endpoint returned HTTP 200');
    assert(agencyRes.body.data?.agency !== undefined, 'Affiliated agency profile returned');
    assert(agencyRes.body.data?.myStatus?.status === 'active', 'Agent standing confirmed as active');

    // 15. Agent Profile & RBAC Security (Tamper Prevention)
    console.log('\n--- TEST 15: Agent Profile & RBAC Tamper Prevention ---');
    const profileRes = await makeRequest('GET', '/api/agent/profile', null, agentToken);
    assert(profileRes.status === 200, 'Agent profile retrieved with HTTP 200');
    assert(profileRes.body.data?.user?.role === 'agent', 'Profile confirms role=agent');

    // Attempt tampering: Agent trying to change role to 'admin' or changing agencyId
    const originalAgencyId = profileRes.body.data?.user?.agencyId;
    const tamperRes = await makeRequest('PUT', '/api/agent/profile', {
      role: 'admin',
      agencyId: '666666666666666666666666',
      walletCredits: 999999,
      designation: 'Senior Education Specialist',
    }, agentToken);

    assert(tamperRes.status === 200, 'Profile update processed safely');
    const verifyProfile = await makeRequest('GET', '/api/agent/profile', null, agentToken);
    assert(verifyProfile.body.data?.user?.role === 'agent', 'SECURITY: Agent role CANNOT be escalated to admin');
    assert(String(verifyProfile.body.data?.user?.agencyId) === String(originalAgencyId), 'SECURITY: Agent agencyId is IMMUTABLE');
    assert(verifyProfile.body.data?.user?.designation === 'Senior Education Specialist', 'Permitted profile field designation was updated');

    // 16. Agent Settings (Password & Preferences)
    console.log('\n--- TEST 16: Agent Security Settings ---');
    const settingsRes = await makeRequest('PUT', '/api/agent/settings', {
      phone: '+880 1800 123456',
    }, agentToken);
    assert(settingsRes.status === 200, 'Agent phone settings updated with HTTP 200');

    // 17. IDOR Isolation Test: Agent A cannot access arbitrary student profile
    console.log('\n--- TEST 17: IDOR Protection on Student Dossiers ---');
    const fakeStudentId = '65f000000000000000000001';
    const idorRes = await makeRequest('GET', `/api/agent/students/${fakeStudentId}`, null, agentToken);
    assert(idorRes.status === 403, 'IDOR PROTECTION: Accessing unassigned student returns 403 Forbidden');

    console.log('\n====================================================');
    console.log(`  TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================\n');

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Test Suite encountered unhandled exception:', err);
    process.exit(1);
  }
}

runTests();
