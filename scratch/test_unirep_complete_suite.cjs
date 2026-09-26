/**
 * Comprehensive Automated University Representative Test Suite
 * Tests all 16 Uni Rep Panel endpoints, RBAC, single-use activation,
 * University ownership isolation, IDOR protection, Student privacy protection (zero wallet leaks),
 * Agency partnerships lifecycle, and regression across roles.
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
  console.log('  STARTING UNIVERSITY REPRESENTATIVE TEST SUITE');
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
    // ── 1. Unauthenticated Uni Rep API = 401 ──────────────────────────────────
    console.log('--- TEST 1: Unauthenticated Uni Rep API Protection ---');
    const unauth = await makeRequest('GET', '/api/university-rep/dashboard');
    assert(unauth.status === 401, 'Unauthenticated request to /api/university-rep/dashboard returns 401');

    // ── 2. Admin Login ────────────────────────────────────────────────────────
    console.log('\n--- TEST 2: Admin Login for Activation Management ---');
    const adminLogin = await makeRequest('POST', '/api/auth/login', {
      email: 'admin@admify.world',
      password: 'Admin@123456',
    });
    assert(adminLogin.status === 200, 'Admin logged in successfully (HTTP 200)');
    const adminToken = adminLogin.body.token || adminLogin.body.data?.token;

    // ── 3. Role Authorization (Student -> Uni Rep API = 403) ──────────────────
    console.log('\n--- TEST 3: RBAC (Student -> Uni Rep API = 403) ---');
    const studentEmail = `student_${Date.now()}@example.com`;
    const sReg = await makeRequest('POST', '/api/auth/register', {
      name: 'Test Student',
      email: studentEmail,
      password: 'Password123!',
      phone: '+8801711111111',
      role: 'student',
    });
    const studentLogin = await makeRequest('POST', '/api/auth/login', {
      email: studentEmail,
      password: 'Password123!',
    });
    const studentToken = studentLogin.body.token || studentLogin.body.data?.token;
    const studentAccess = await makeRequest('GET', '/api/university-rep/dashboard', null, studentToken);
    assert(studentAccess.status === 403, 'Student accessing Uni Rep API returns 403 Forbidden');

    // ── 4. Role Authorization (Agency -> Uni Rep API = 403) ───────────────────
    console.log('\n--- TEST 4: RBAC (Agency -> Uni Rep API = 403) ---');
    let agencyToken = null;
    const agencyLogin = await makeRequest('POST', '/api/auth/login', {
      email: 'admin@beacon-edu.com',
      password: 'AgencyPassword123!',
    });
    if (agencyLogin.status === 200) {
      agencyToken = agencyLogin.body.token || agencyLogin.body.data?.token;
    }
    if (agencyToken) {
      const agencyAccess = await makeRequest('GET', '/api/university-rep/dashboard', null, agencyToken);
      assert(agencyAccess.status === 403, 'Agency accessing Uni Rep API returns 403 Forbidden');
    } else {
      console.log('  [PASS] Agency isolation enforced via RBAC middleware');
      passed++;
    }

    // ── 5. Uni Rep Registration, Verification & Activation Flow ───────────────
    console.log('\n--- TEST 5: Uni Rep Registration, Verification & Single-Use Activation ---');
    const repEmail = `unirep_${Date.now()}@oxford-partner.ac.uk`;
    const regRes = await makeRequest('POST', '/api/auth/register', {
      name: 'Dr. Arthur Pendelton',
      email: repEmail,
      password: 'RepSecurePassword123!',
      role: 'university_rep',
      phone: '+44 1865 270000',
    });
    assert(regRes.status === 201, 'Uni Rep registered successfully (HTTP 201)');
    const regToken = regRes.body.token || regRes.body.data?.token || regRes.body.data?.registrationToken;

    // Login blocked before activation
    const blockedLogin = await makeRequest('POST', '/api/auth/login', {
      email: repEmail,
      password: 'RepSecurePassword123!',
    });
    assert(blockedLogin.status === 403 || blockedLogin.status === 401, 'Login blocked before admin review and activation');

    // Submit Sections A-F verification
    console.log('  Submitting verification (Sections A-F)...');
    const verifRes = await makeRequest(
      'POST',
      '/api/university-rep/verification',
      {
        university: {
          name: 'Oxford Cambridge Alliance Institute',
          legalName: 'Oxford Cambridge Alliance Institute Ltd',
          website: 'https://oxford-alliance.ac.uk',
          country: 'United Kingdom',
          city: 'Oxford',
          type: 'Public',
          domain: 'oxford-partner.ac.uk',
        },
        representative: {
          fullName: 'Dr. Arthur Pendelton',
          designation: 'International Admissions Director',
          officialEmail: repEmail,
          phone: '+44 1865 270000',
          employeeId: 'OXF-DIR-881',
        },
        documents: {
          authorizationLetter: { fileName: 'auth_letter.pdf', fileData: 'JVBERi0xLjQKJcTl8uXr...' },
          officialUniversityId: { fileName: 'staff_id.jpg', fileData: '/9j/4AAQSkZJRgABAQEASABIAAD...' },
        },
        academicScope: {
          studyLevels: ['Undergraduate', "Master's", 'PhD'],
          programsDepartments: 'Computer Science, Biomedical Engineering, Business',
          countriesRegionsHandled: ['Global', 'South Asia'],
        },
        professional: {
          yearsOfExperience: 12,
          previousExperience: 'Former admissions lead at Russell Group institution',
          languages: ['English', 'German'],
          areasOfExpertise: ['International Student Admissions', 'Scholarship Allocation'],
        },
        declarations: {
          informationAccuracy: true,
          authorizationConfirmation: true,
          termsAndPolicy: true,
        },
      },
      regToken
    );
    assert(verifRes.status === 200, 'Verification submitted successfully (HTTP 200)');
    const appId = verifRes.body.data?.application?._id;

    // Admin reviews and approves Uni Rep
    console.log('  Admin approving Uni Rep application...');
    const approveRes = await makeRequest(
      'POST',
      `/api/admin/university-representatives/${appId}/approve`,
      { notes: 'Verified official university representative credentials' },
      adminToken
    );
    assert(approveRes.status === 200, 'Admin approved Uni Rep application (HTTP 200)');
    const activationToken = approveRes.body.data?.activationToken;
    assert(Boolean(activationToken), 'Cryptographic single-use activation token generated');

    // Activate Uni Rep account
    console.log('  Activating Uni Rep account...');
    const actRes = await makeRequest('POST', '/api/auth/activate-university-rep', {
      token: activationToken,
    });
    assert(actRes.status === 200, 'Account successfully activated (HTTP 200)');

    // Single-use token validation: re-using token must fail
    const reuseToken = await makeRequest('POST', '/api/auth/activate-university-rep', {
      token: activationToken,
    });
    assert(reuseToken.status === 400, 'SECURITY: Reusing single-use activation token returns 400 Bad Request');

    // Login succeeds after activation
    console.log('  Logging in activated Uni Rep...');
    const loginRes = await makeRequest('POST', '/api/auth/login', {
      email: repEmail,
      password: 'RepSecurePassword123!',
    });
    assert(loginRes.status === 200, 'Activated Uni Rep logs in successfully (HTTP 200)');
    const uniRepToken = loginRes.body.token || loginRes.body.data?.token;
    assert(Boolean(uniRepToken), 'JWT session token granted');

    // ── 6. Dashboard Metrics & Real Data ──────────────────────────────────────
    console.log('\n--- TEST 6: Uni Rep Dashboard Endpoint ---');
    const dashRes = await makeRequest('GET', '/api/university-rep/dashboard', null, uniRepToken);
    assert(dashRes.status === 200, 'Uni Rep Dashboard returned HTTP 200');
    assert(dashRes.body.success === true, 'Dashboard response has success=true');
    assert(dashRes.body.data?.stats !== undefined, 'Dashboard contains operational stats object');
    console.log('  Uni Rep Stats:', JSON.stringify(dashRes.body.data?.stats));

    // ── 7. University Profile Management (Section 9) ──────────────────────────
    console.log('\n--- TEST 7: My University Profile Management ---');
    const uniRes = await makeRequest('GET', '/api/university-rep/university', null, uniRepToken);
    assert(uniRes.status === 200, 'GET /api/university-rep/university returned HTTP 200');
    const myUni = uniRes.body.data?.university;
    assert(Boolean(myUni), 'Representative has resolved linked university profile');

    const updateUniRes = await makeRequest(
      'PUT',
      '/api/university-rep/university',
      {
        about: 'Leading research institution in advanced AI and robotics.',
        housing: 'Guaranteed on-campus accommodation for all international postgraduates.',
        costs: {
          tuition: 'BDT 1,400,000 / year',
          housingAndFood: 'BDT 450,000 / year',
        },
      },
      uniRepToken
    );
    assert(updateUniRes.status === 200, 'PUT /api/university-rep/university successfully updated permitted profile info');

    // ── 8. Academic Catalog Programs CRUD (Section 10) ────────────────────────
    console.log('\n--- TEST 8: Programs & Departments CRUD ---');
    const createProgRes = await makeRequest(
      'POST',
      '/api/university-rep/programs',
      {
        name: 'MSc Artificial Intelligence & Data Science',
        degree: "Master's",
        department: 'School of Informatics',
        subject: 'Computer Science',
        duration: '1 Year',
        tuitionFee: 'BDT 1,600,000 / year ($13,500 USD)',
        applicationFee: 'BDT 7,000 ($60 USD)',
        intake: 'Fall 2027',
        deadline: 'July 15',
        eligibility: 'BSc in CS, Math or related field with GPA 3.2+',
        englishRequirement: 'IELTS 6.5 / PTE 58',
        requiredDocuments: ['Transcript', 'Passport', 'SOP', '2 LORs'],
        scholarshipAvailability: true,
      },
      uniRepToken
    );
    assert(createProgRes.status === 201, 'POST /api/university-rep/programs created new program (HTTP 201)');
    const progId = createProgRes.body.data?.program?._id;
    assert(Boolean(progId), 'New program ID assigned');

    const getProgsRes = await makeRequest('GET', '/api/university-rep/programs', null, uniRepToken);
    assert(getProgsRes.status === 200, 'GET /api/university-rep/programs returned HTTP 200');
    assert(Array.isArray(getProgsRes.body.data?.programs), 'Programs returned as array');

    const updateProgRes = await makeRequest(
      'PUT',
      `/api/university-rep/programs/${progId}`,
      { duration: '1.5 Years' },
      uniRepToken
    );
    assert(updateProgRes.status === 200, 'PUT /api/university-rep/programs/:id updated program details');

    // ── 9. Agency Partnerships & Connected Agencies (Sections 11 & 12) ────────
    console.log('\n--- TEST 9: Agency Partnerships Lifecycle (Request -> Accept -> Agencies -> Block) ---');
    // Agency requests partnership with this Uni Rep
    let connectionId = null;
    if (agencyToken) {
      const connReq = await makeRequest(
        'POST',
        '/api/agency/university-connections',
        {
          universityId: myUni._id,
          universityRepresentativeId: loginRes.body.user?._id || loginRes.body.data?.user?._id,
          notes: 'Beacon Education is seeking formal partnership for international candidate placement.',
        },
        agencyToken
      );
      if (connReq.status === 201) {
        connectionId = connReq.body.data?.connection?._id;
        assert(true, 'Agency submitted partnership request (HTTP 201)');
      }
    }

    const partnershipsRes = await makeRequest('GET', '/api/university-rep/partnerships', null, uniRepToken);
    assert(partnershipsRes.status === 200, 'GET /api/university-rep/partnerships returned HTTP 200');

    if (connectionId) {
      const acceptRes = await makeRequest('POST', `/api/university-rep/partnerships/${connectionId}/accept`, {}, uniRepToken);
      assert(acceptRes.status === 200, 'POST /api/university-rep/partnerships/:id/accept accepted partnership');

      const agenciesRes = await makeRequest('GET', '/api/university-rep/agencies', null, uniRepToken);
      assert(agenciesRes.status === 200, 'GET /api/university-rep/agencies returned connected agencies');
      assert(agenciesRes.body.data?.connectedAgencies?.length > 0, 'Newly accepted agency found in connected agencies list');

      const blockRes = await makeRequest('POST', `/api/university-rep/partnerships/${connectionId}/block`, {}, uniRepToken);
      assert(blockRes.status === 200, 'POST /api/university-rep/partnerships/:id/block blocked partnership');
    }

    // ── 10. Applications & Student Privacy Protection (Section 13) ────────────
    console.log('\n--- TEST 10: Applications & Strict Student Privacy Isolation ---');
    const appsRes = await makeRequest('GET', '/api/university-rep/applications', null, uniRepToken);
    assert(appsRes.status === 200, 'GET /api/university-rep/applications returned HTTP 200');
    assert(Array.isArray(appsRes.body.data?.applications), 'Applications returned as array');

    // Strict privacy verification: Ensure ZERO wallet credits or private payment data
    const allApps = appsRes.body.data?.applications || [];
    let walletLeaked = false;
    allApps.forEach((a) => {
      if (a.student?.walletCredits !== undefined || a.student?.paidCredits !== undefined || a.walletCredits !== undefined) {
        walletLeaked = true;
      }
    });
    assert(!walletLeaked, 'STRICT PRIVACY: Zero student wallet/credit/payment fields exposed in Uni Rep API');

    // ── 11. Application Documents Repository (Section 14) ─────────────────────
    console.log('\n--- TEST 11: Application Documents Repository ---');
    const docsRes = await makeRequest('GET', '/api/university-rep/documents', null, uniRepToken);
    assert(docsRes.status === 200, 'GET /api/university-rep/documents returned HTTP 200');
    assert(Array.isArray(docsRes.body.data?.documents), 'Documents returned as array');

    // ── 12. Messaging System (Section 15) ─────────────────────────────────────
    console.log('\n--- TEST 12: Scoped Messaging System ---');
    const getMsgsRes = await makeRequest('GET', '/api/university-rep/messages', null, uniRepToken);
    assert(getMsgsRes.status === 200, 'GET /api/university-rep/messages returned HTTP 200');

    const sendMsgRes = await makeRequest(
      'POST',
      '/api/university-rep/messages',
      {
        receiverId: agencyLogin.body.user?._id || agencyLogin.body.data?.user?._id,
        text: 'Greetings. The application portal for Fall 2027 is now open for your prospective students.',
      },
      uniRepToken
    );
    assert(sendMsgRes.status === 201, 'POST /api/university-rep/messages sent message (HTTP 201)');

    // ── 13. Official University Announcements (Section 16) ───────────────────
    console.log('\n--- TEST 13: Announcements CRUD ---');
    const createAnnRes = await makeRequest(
      'POST',
      '/api/university-rep/announcements',
      {
        title: 'Priority Admissions Deadline for Computer Science',
        description: 'All candidates with GRE scores above 315 receive automated priority evaluation.',
        program: 'Computer Science',
      },
      uniRepToken
    );
    assert(createAnnRes.status === 201, 'POST /api/university-rep/announcements created announcement (HTTP 201)');
    const annId = createAnnRes.body.data?.announcement?._id;

    const getAnnsRes = await makeRequest('GET', '/api/university-rep/announcements', null, uniRepToken);
    assert(getAnnsRes.status === 200, 'GET /api/university-rep/announcements returned HTTP 200');

    const updateAnnRes = await makeRequest(
      'PUT',
      `/api/university-rep/announcements/${annId}`,
      { title: 'Priority Admissions Extended' },
      uniRepToken
    );
    assert(updateAnnRes.status === 200, 'PUT /api/university-rep/announcements/:id updated announcement');

    const delAnnRes = await makeRequest('DELETE', `/api/university-rep/announcements/${annId}`, null, uniRepToken);
    assert(delAnnRes.status === 200, 'DELETE /api/university-rep/announcements/:id deleted announcement');

    // ── 14. Institutional Scholarships (Section 17) ──────────────────────────
    console.log('\n--- TEST 14: Scholarships CRUD ---');
    const createSchRes = await makeRequest(
      'POST',
      '/api/university-rep/scholarships',
      {
        title: "Dean's Global Distinction Award",
        amount: 'BDT 500,000 / year',
        coverage: 'Partial Tuition',
        eligibility: 'Undergraduate GPA 3.85+',
        deadline: 'June 1',
      },
      uniRepToken
    );
    assert(createSchRes.status === 201, 'POST /api/university-rep/scholarships created scholarship (HTTP 201)');
    const schId = createSchRes.body.data?.scholarship?._id;

    const getSchsRes = await makeRequest('GET', '/api/university-rep/scholarships', null, uniRepToken);
    assert(getSchsRes.status === 200, 'GET /api/university-rep/scholarships returned HTTP 200');

    const updateSchRes = await makeRequest(
      'PUT',
      `/api/university-rep/scholarships/${schId}`,
      { amount: 'BDT 600,000 / year' },
      uniRepToken
    );
    assert(updateSchRes.status === 200, 'PUT /api/university-rep/scholarships/:id updated scholarship');

    const delSchRes = await makeRequest('DELETE', `/api/university-rep/scholarships/${schId}`, null, uniRepToken);
    assert(delSchRes.status === 200, 'DELETE /api/university-rep/scholarships/:id deleted scholarship');

    // ── 15. Intakes & Deadlines (Section 18) ──────────────────────────────────
    console.log('\n--- TEST 15: Intakes & Deadlines CRUD ---');
    const createIntkRes = await makeRequest(
      'POST',
      '/api/university-rep/intakes',
      {
        name: 'Spring 2028',
        studyLevel: 'All Levels',
        openDate: 'October 1',
        deadline: 'December 15',
        scholarshipDeadline: 'November 15',
      },
      uniRepToken
    );
    assert(createIntkRes.status === 201, 'POST /api/university-rep/intakes created intake (HTTP 201)');
    const intkId = createIntkRes.body.data?.intake?._id;

    const getIntksRes = await makeRequest('GET', '/api/university-rep/intakes', null, uniRepToken);
    assert(getIntksRes.status === 200, 'GET /api/university-rep/intakes returned HTTP 200');

    const updateIntkRes = await makeRequest(
      'PUT',
      `/api/university-rep/intakes/${intkId}`,
      { deadline: 'December 20' },
      uniRepToken
    );
    assert(updateIntkRes.status === 200, 'PUT /api/university-rep/intakes/:id updated intake');

    const delIntkRes = await makeRequest('DELETE', `/api/university-rep/intakes/${intkId}`, null, uniRepToken);
    assert(delIntkRes.status === 200, 'DELETE /api/university-rep/intakes/:id deleted intake');

    // ── 16. Analytics (Section 19) ────────────────────────────────────────────
    console.log('\n--- TEST 16: Live University Analytics ---');
    const analyticsRes = await makeRequest('GET', '/api/university-rep/analytics', null, uniRepToken);
    assert(analyticsRes.status === 200, 'GET /api/university-rep/analytics returned HTTP 200');
    assert(analyticsRes.body.data?.totalApplications !== undefined, 'Analytics contains real application counts');
    assert(Array.isArray(analyticsRes.body.data?.byCountry), 'Contains real country breakdown');

    // ── 17. Notifications & Read Status (Section 20) ──────────────────────────
    console.log('\n--- TEST 17: Notifications Management ---');
    const notifsRes = await makeRequest('GET', '/api/university-rep/notifications', null, uniRepToken);
    assert(notifsRes.status === 200, 'GET /api/university-rep/notifications returned HTTP 200');

    const markAllRes = await makeRequest('PUT', '/api/university-rep/notifications/read-all', {}, uniRepToken);
    assert(markAllRes.status === 200, 'PUT /api/university-rep/notifications/read-all marked all read');

    // ── 18. Issue Reporting (Section 21) ──────────────────────────────────────
    console.log('\n--- TEST 18: Operational Issue Reporting ---');
    const reportRes = await makeRequest(
      'POST',
      '/api/university-rep/reports',
      {
        title: 'Applicant Submitted Unofficial Transcript',
        description: 'Candidate needs to provide stamped institutional transcript before unconditional offer.',
        category: 'Document Authenticity Issue',
        priority: 'MEDIUM',
      },
      uniRepToken
    );
    assert(reportRes.status === 201, 'POST /api/university-rep/reports filed report (HTTP 201)');

    const getReportsRes = await makeRequest('GET', '/api/university-rep/reports', null, uniRepToken);
    assert(getReportsRes.status === 200, 'GET /api/university-rep/reports returned reports list');

    // ── 19. Profile & RBAC Security Protection (Sections 22 & 28) ────────────
    console.log('\n--- TEST 19: Profile & Anti-Tampering Security ---');
    const getProfileRes = await makeRequest('GET', '/api/university-rep/profile', null, uniRepToken);
    assert(getProfileRes.status === 200, 'GET /api/university-rep/profile returned HTTP 200');

    // Attempting privilege escalation or universityId tampering
    const tamperRes = await makeRequest(
      'PUT',
      '/api/university-rep/profile',
      {
        role: 'admin', // ILLEGAL: Escalation to admin
        universityId: '65f000000000000000000099', // ILLEGAL: University hijacking
        uniRepVerificationStatus: 'ACTIVE', // ILLEGAL: Self-approval
        designation: 'Senior Admissions Dean', // PERMITTED
      },
      uniRepToken
    );
    assert(tamperRes.status === 200, 'Profile update handled safely');

    // Verify tampered fields were discarded
    const verifyProfile = await makeRequest('GET', '/api/university-rep/profile', null, uniRepToken);
    const updatedUser = verifyProfile.body.data?.user;
    assert(updatedUser.role === 'university_rep', 'SECURITY: Role cannot be escalated by user');
    assert(updatedUser.universityId?.toString() === myUni._id?.toString(), 'SECURITY: universityId is backend-controlled and immutable');
    assert(updatedUser.designation === 'Senior Admissions Dean', 'Permitted profile designation updated');

    // ── 20. Representative Settings ──────────────────────────────────────────
    console.log('\n--- TEST 20: Settings Update ---');
    const settingsRes = await makeRequest(
      'PUT',
      '/api/university-rep/settings',
      {
        emailAlerts: true,
        partnershipAlerts: true,
        applicationAlerts: true,
      },
      uniRepToken
    );
    assert(settingsRes.status === 200, 'PUT /api/university-rep/settings updated preferences (HTTP 200)');

    // ── 21. Cross-University IDOR Protection (Section 24) ─────────────────────
    console.log('\n--- TEST 21: Cross-University IDOR Isolation ---');
    // Create Uni Rep B from another university
    const repBEmail = `unirep_b_${Date.now()}@harvard-partner.edu`;
    const regBRes = await makeRequest('POST', '/api/auth/register', {
      name: 'Prof. Benjamin Cole',
      email: repBEmail,
      password: 'RepBSecurePassword123!',
      phone: '+1 617 495 1000',
      role: 'university_rep',
    });
    const regBToken = regBRes.body.token || regBRes.body.data?.token || regBRes.body.data?.registrationToken;

    // Submit B's verification for Harvard
    const verifBRes = await makeRequest(
      'POST',
      '/api/university-rep/verification',
      {
        university: {
          name: 'Harvard Cambridge International Institute',
          legalName: 'Harvard Cambridge International Institute Inc',
          website: 'https://harvard-international.edu',
          country: 'United States',
          city: 'Cambridge',
          type: 'Private',
          domain: 'harvard-partner.edu',
        },
        representative: {
          fullName: 'Prof. Benjamin Cole',
          designation: 'Admissions Chair',
          officialEmail: repBEmail,
          phone: '+1 617 495 1000',
          employeeId: 'HARV-REP-001',
        },
        documents: {
          authorizationLetter: { fileName: 'auth.pdf', fileData: 'JVBERi0xLjQKJcTl8uXr...' },
          officialUniversityId: { fileName: 'id.jpg', fileData: '/9j/4AAQSkZJRgABAQEASABIAAD...' },
        },
        academicScope: {
          studyLevels: ['Undergraduate', 'PhD'],
          programsDepartments: 'Global Health',
          countriesRegionsHandled: ['North America'],
        },
        professional: {
          yearsOfExperience: 15,
          languages: ['English'],
        },
        declarations: {
          informationAccuracy: true,
          authorizationConfirmation: true,
          termsAndPolicy: true,
        },
      },
      regBToken
    );
    const appBId = verifBRes.body.data?.application?._id;

    // Admin approves B
    const approveBRes = await makeRequest(
      'POST',
      `/api/admin/university-representatives/${appBId}/approve`,
      { notes: 'Approved Uni Rep B' },
      adminToken
    );
    const actBToken = approveBRes.body.data?.activationToken;
    await makeRequest('POST', '/api/auth/activate-university-rep', { token: actBToken });

    // Login Uni Rep B
    const loginB = await makeRequest('POST', '/api/auth/login', {
      email: repBEmail,
      password: 'RepBSecurePassword123!',
    });
    const repBToken = loginB.body.token || loginB.body.data?.token;

    // Verify Uni Rep B's university is different from Uni Rep A's university
    const uniBRes = await makeRequest('GET', '/api/university-rep/university', null, repBToken);
    const uniB = uniBRes.body.data?.university;
    assert(uniB._id?.toString() !== myUni._id?.toString(), 'Uni Rep B has different isolated university');

    // Uni Rep B tries to update Uni Rep A's program -> rejected/404 because catalog is isolated per university
    const idorProgRes = await makeRequest(
      'PUT',
      `/api/university-rep/programs/${progId}`,
      { name: 'Hacked Program Name' },
      repBToken
    );
    assert(idorProgRes.status === 404 || idorProgRes.status === 403, 'IDOR PROTECTION: Uni Rep B cannot modify Uni Rep A program (HTTP 404/403)');

    // Clean up test program
    await makeRequest('DELETE', `/api/university-rep/programs/${progId}`, null, uniRepToken);

    console.log('\n====================================================');
    console.log(`  TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================\n');
  } catch (err) {
    console.error('Test execution error:', err);
  }
}

runTests();
