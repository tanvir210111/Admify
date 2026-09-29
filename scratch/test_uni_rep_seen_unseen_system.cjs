/**
 * Comprehensive University Representative (Uni Rep) Notification + Seen/Unseen + Ownership System Test Suite
 * Scenarios A through AG as specified in task requirements.
 */
const http = require('http');
const path = require('path');
const { spawn } = require('child_process');
const jwt = require('../backend/node_modules/jsonwebtoken');

const BASE_URL = 'http://127.0.0.1:5001';
const JWT_SECRET = process.env.JWT_SECRET || 'admify_dev_jwt_secret_key_2026_super_secure';

function request(method, routePath, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(routePath, BASE_URL);
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const data = body ? JSON.stringify(body) : null;
    if (data) headers['Content-Length'] = Buffer.byteLength(data);

    const req = http.request(url, { method, headers }, (res) => {
      let raw = '';
      res.on('data', (chunk) => (raw += chunk));
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = JSON.parse(raw);
        } catch {
          parsed = raw;
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: parsed,
        });
      });
    });

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    throw new Error(message);
  }
  console.log(`  ✓ ${message}`);
}

async function runUniRepSeenSuite() {
  console.log('===========================================================');
  console.log('STARTING UNI REP NOTIFICATION + SEEN/UNSEEN SUITE (A-AG)');
  console.log('===========================================================\n');

  // Check if backend is running or spawn
  let serverProcess = null;
  try {
    await request('GET', '/api/health');
    console.log('Backend server already running on port 5001.');
  } catch {
    console.log('Starting backend server for test run on port 5001...');
    serverProcess = spawn(process.execPath, ['server.js'], {
      cwd: path.resolve(__dirname, '../backend'),
      env: { ...process.env, PORT: '5001' },
      stdio: 'pipe',
    });

    let ready = false;
    for (let i = 0; i < 25; i++) {
      await new Promise((r) => setTimeout(r, 600));
      try {
        const h = await request('GET', '/api/health');
        if (h.status === 200) {
          ready = true;
          break;
        }
      } catch {}
    }
    if (!ready) throw new Error('Backend failed to start on port 5001');
    console.log('Backend server successfully started.');
  }

  try {
    const ts = Date.now();
    const devStore = require('../backend/utils/devStore.js').default;

    // IDs — all scoped to this timestamp to prevent cross-run pollution
    const repAUserId = `unirep_user_a_${ts}`;
    const repBUserId = `unirep_user_b_${ts}`;
    const uniAId = `uni_a_${ts}`;
    const uniBId = `uni_b_${ts}`;
    const uniAName = `Cambridge_Institute_${ts}`;
    const uniBName = `Harvard_Tech_${ts}`;
    const agency1UserId = `agency_user_1_${ts}`;
    const agency2UserId = `agency_user_2_${ts}`;
    const student1Id = `stu_user_1_${ts}`;

    const db = devStore.read();
    db.users = db.users || [];
    db.universities = db.universities || [];
    db.universityAgencyConnections = db.universityAgencyConnections || [];
    db.applications = db.applications || [];
    db.chatMessages = db.chatMessages || [];
    db.notifications = db.notifications || [];
    db.reports = db.reports || [];
    db.uniRepSeenItems = db.uniRepSeenItems || [];

    // University A & B — unique names per run
    db.universities.push({
      _id: uniAId,
      name: uniAName,
      location: 'Cambridge, UK',
      country: 'United Kingdom',
      status: 'active',
      isActive: true,
      createdAt: new Date().toISOString(),
    });
    db.universities.push({
      _id: uniBId,
      name: uniBName,
      location: 'Cambridge, USA',
      country: 'United States',
      status: 'active',
      isActive: true,
      createdAt: new Date().toISOString(),
    });

    // Uni Rep A (for University A)
    db.users.push({
      _id: repAUserId,
      name: 'Rep Alice Cambridge',
      email: `alice_${ts}@cambridge.edu`,
      role: 'university_rep',
      status: 'active',
      universityId: uniAId,
      accountStatus: 'ACTIVE',
      createdAt: new Date().toISOString(),
    });

    // Uni Rep B (for University B)
    db.users.push({
      _id: repBUserId,
      name: 'Rep Bob Harvard',
      email: `bob_${ts}@harvard.edu`,
      role: 'university_rep',
      status: 'active',
      universityId: uniBId,
      accountStatus: 'ACTIVE',
      createdAt: new Date().toISOString(),
    });

    // Agency 1 & Agency 2 users
    db.users.push({
      _id: agency1UserId,
      name: 'Global Edu Agency',
      email: `agency1_${ts}@agency.com`,
      role: 'agency',
      status: 'active',
      createdAt: new Date().toISOString(),
    });
    db.users.push({
      _id: agency2UserId,
      name: 'Rival Agency',
      email: `agency2_${ts}@agency.com`,
      role: 'agency',
      status: 'active',
      createdAt: new Date().toISOString(),
    });

    // Student
    db.users.push({
      _id: student1Id,
      name: 'John Student',
      email: `student_${ts}@mail.com`,
      role: 'student',
      status: 'active',
      createdAt: new Date().toISOString(),
    });

    devStore.write(db);

    const tokenRepA = jwt.sign({ id: repAUserId }, JWT_SECRET, { expiresIn: '1h' });
    const tokenRepB = jwt.sign({ id: repBUserId }, JWT_SECRET, { expiresIn: '1h' });

    // ─────────────────────────────────────────────────────────────
    // SCENARIO A: Uni Rep authentication and university linkage
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- Scenario A: Uni Rep authentication and university linkage ---');
    const myUniRes = await request('GET', '/api/university-rep/university', null, tokenRepA);
    assert(myUniRes.status === 200, 'Authenticated Uni Rep A can access university endpoint');
    assert(myUniRes.data.success === true, 'Success is true');
    assert(
      myUniRes.data.data.university?._id === uniAId || myUniRes.data.data.university?.name === uniAName,
      'Uni Rep A is linked to University A'
    );

    // ─────────────────────────────────────────────────────────────
    // SCENARIO B: Initial sidebar counts = 0
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- Scenario B: Initial sidebar counts = 0 ---');
    const initRes = await request('GET', '/api/university-rep/sidebar-counts', null, tokenRepA);
    assert(initRes.status === 200, 'GET /sidebar-counts succeeds');
    assert(initRes.data.data.partnerships === 0, 'Initial partnerships count is 0');
    assert(initRes.data.data.applications === 0, 'Initial applications count is 0');
    assert(initRes.data.data.documents === 0, 'Initial documents count is 0');
    assert(initRes.data.data.messages === 0, 'Initial messages count is 0');
    assert(initRes.data.data.notifications === 0, 'Initial notifications count is 0');
    assert(initRes.data.data.reports === 0, 'Initial reports count is 0');

    // ─────────────────────────────────────────────────────────────
    // SCENARIOS C & D: New partnership increases count & status tab count
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- Scenarios C & D: New partnership increases sidebar & status counts ---');
    const conn1Id = `conn_1_${ts}`;
    const dNow1 = devStore.read();
    dNow1.universityAgencyConnections.push({
      _id: conn1Id,
      universityId: uniAId,
      universityRepresentativeId: repAUserId,
      agencyId: agency1UserId,
      status: 'PENDING',
      requestedBy: agency1UserId,
      createdAt: new Date().toISOString(),
    });
    devStore.write(dNow1);

    const postConnCounts = await request('GET', '/api/university-rep/sidebar-counts', null, tokenRepA);
    assert(postConnCounts.data.data.partnerships === 1, 'Partnership count incremented to 1');

    const statusCounts1 = await request('GET', '/api/university-rep/status-counts', null, tokenRepA);
    assert(statusCounts1.data.data.partnerships['Pending Requests'] === 1, 'Pending Requests status count is 1');
    assert(statusCounts1.data.data.partnerships['All Partnerships'] === 1, 'All Partnerships status count is 1');

    // Check enrichment in getUniRepConnections
    const connListRes = await request('GET', '/api/university-rep/connections', null, tokenRepA);
    const connInList = (connListRes.data.data.connections || []).find((c) => c._id === conn1Id);
    assert(connInList && connInList.isSeenByUniRep === false, 'Partnership record has isSeenByUniRep === false');

    // ─────────────────────────────────────────────────────────────
    // SCENARIOS E & F: Mark partnership seen & count decreases exactly once
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- Scenarios E & F: Mark partnership seen & count decreases exactly once ---');
    const markConnRes = await request('PUT', `/api/university-rep/seen/partnership/${conn1Id}`, {}, tokenRepA);
    assert(markConnRes.status === 200, 'PUT /seen/partnership/:id succeeds');
    assert(markConnRes.data.success === true, 'Mark partnership seen returns success');

    const afterSeenConnCounts = await request('GET', '/api/university-rep/sidebar-counts', null, tokenRepA);
    assert(afterSeenConnCounts.data.data.partnerships === 0, 'Partnership sidebar count decremented to 0');

    // Duplicate seen call
    const markConnResDup = await request('PUT', `/api/university-rep/seen/partnership/${conn1Id}`, {}, tokenRepA);
    assert(markConnResDup.status === 200, 'Duplicate mark seen succeeds idempotently');
    const afterDupConnCounts = await request('GET', '/api/university-rep/sidebar-counts', null, tokenRepA);
    assert(afterDupConnCounts.data.data.partnerships === 0, 'Partnership count remains 0, no negative count');

    // ─────────────────────────────────────────────────────────────
    // SCENARIOS G & H: New application increases count & Submitted tab count
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- Scenarios G & H: New application increases count & stage count ---');
    const appId1 = `app_1_${ts}`;
    const dNow2 = devStore.read();
    dNow2.applications.push({
      _id: appId1,
      universityId: uniAId,
      university: uniAName,
      program: 'MSc Computer Science',
      user: student1Id,
      stage: 'Submitted',
      status: 'Submitted',
      documents: [],
      createdAt: new Date().toISOString(),
    });
    devStore.write(dNow2);

    const postAppCounts = await request('GET', '/api/university-rep/sidebar-counts', null, tokenRepA);
    assert(postAppCounts.data.data.applications === 1, 'Applications sidebar count is 1');

    const appStatusCounts = await request('GET', '/api/university-rep/status-counts', null, tokenRepA);
    assert(appStatusCounts.data.data.applications['Submitted'] === 1, 'Applications Submitted tab count is 1');
    assert(appStatusCounts.data.data.applications['All Stages'] === 1, 'Applications All Stages tab count is 1');

    // ─────────────────────────────────────────────────────────────
    // SCENARIO I: Mark application seen
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- Scenario I: Mark application seen ---');
    const markAppRes = await request('PUT', `/api/university-rep/seen/application/${appId1}`, {}, tokenRepA);
    assert(markAppRes.status === 200, 'Mark application seen succeeds');

    const afterAppSeenCounts = await request('GET', '/api/university-rep/sidebar-counts', null, tokenRepA);
    assert(afterAppSeenCounts.data.data.applications === 0, 'Applications count decremented to 0');

    // ─────────────────────────────────────────────────────────────
    // SCENARIOS J & K: New document increases document count & mark seen
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- Scenarios J & K: New document increases count & mark seen ---');
    const dNow3 = devStore.read();
    const targetApp = dNow3.applications.find((a) => a._id === appId1);
    targetApp.documents = [
      {
        _id: `doc_1_${ts}`,
        name: 'Official Academic Transcript.pdf',
        type: 'Transcript',
        url: 'https://admify.test/transcript.pdf',
        uploadedAt: new Date().toISOString(),
      },
    ];
    devStore.write(dNow3);

    const postDocCounts = await request('GET', '/api/university-rep/sidebar-counts', null, tokenRepA);
    assert(postDocCounts.data.data.documents === 1, 'Documents sidebar count is 1');

    const docStatusCounts = await request('GET', '/api/university-rep/status-counts', null, tokenRepA);
    assert(docStatusCounts.data.data.documents['Transcript'] === 1, 'Documents Transcript filter count is 1');
    assert(docStatusCounts.data.data.documents['All Types'] === 1, 'Documents All Types filter count is 1');

    // Mark document seen
    const markDocRes = await request('PUT', `/api/university-rep/seen/document/doc_1_${ts}`, {}, tokenRepA);
    assert(markDocRes.status === 200, 'Mark document seen succeeds');

    const afterDocSeenCounts = await request('GET', '/api/university-rep/sidebar-counts', null, tokenRepA);
    assert(afterDocSeenCounts.data.data.documents === 0, 'Documents sidebar count is now 0');

    // ─────────────────────────────────────────────────────────────
    // SCENARIOS L & M: New incoming message increases count & mark seen
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- Scenarios L & M: New incoming message increases count & mark seen ---');
    const msg1Id = `msg_1_${ts}`;
    const dNow4 = devStore.read();
    dNow4.chatMessages.push({
      _id: msg1Id,
      user: agency1UserId,
      receiver: repAUserId,
      text: 'Hello Rep Alice, we submitted an urgent application.',
      sessionId: `SESSION-${ts}`,
      createdAt: new Date().toISOString(),
    });
    devStore.write(dNow4);

    const postMsgCounts = await request('GET', '/api/university-rep/sidebar-counts', null, tokenRepA);
    assert(postMsgCounts.data.data.messages === 1, 'Messages sidebar count is 1');

    // Mark message seen
    const markMsgRes = await request('PUT', `/api/university-rep/seen/message/${msg1Id}`, {}, tokenRepA);
    assert(markMsgRes.status === 200, 'Mark message seen succeeds');

    const afterMsgSeenCounts = await request('GET', '/api/university-rep/sidebar-counts', null, tokenRepA);
    assert(afterMsgSeenCounts.data.data.messages === 0, 'Messages sidebar count is 0');

    // ─────────────────────────────────────────────────────────────
    // SCENARIOS N & O: New admin report update increases report count & mark seen
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- Scenarios N & O: Report updates and mark seen ---');
    const rep1Id = `report_1_${ts}`;
    const dNow5 = devStore.read();
    // Rep created report
    dNow5.reports.push({
      _id: rep1Id,
      reportId: `REP-${ts}`,
      reportedBy: repAUserId,
      title: 'Dispute with applicant credentials',
      description: 'Potential fake certification',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    });
    devStore.write(dNow5);

    // Initial report in PENDING has not had admin action, so report count = 0
    const pendingReportCounts = await request('GET', '/api/university-rep/sidebar-counts', null, tokenRepA);
    assert(pendingReportCounts.data.data.reports === 0, 'Pending report without admin action does not count as new update');

    // Admin resolves report
    const dNow6 = devStore.read();
    const rMatch = dNow6.reports.find((r) => r._id === rep1Id);
    rMatch.status = 'RESOLVED';
    rMatch.adminNotes = 'Issue verified and cleared.';
    devStore.write(dNow6);

    const resolvedReportCounts = await request('GET', '/api/university-rep/sidebar-counts', null, tokenRepA);
    assert(resolvedReportCounts.data.data.reports === 1, 'Resolved report counts as 1 unseen admin update');

    // Mark report seen
    const markRepRes = await request('PUT', `/api/university-rep/seen/report/${rep1Id}`, {}, tokenRepA);
    assert(markRepRes.status === 200, 'Mark report seen succeeds');

    const afterRepSeenCounts = await request('GET', '/api/university-rep/sidebar-counts', null, tokenRepA);
    assert(afterRepSeenCounts.data.data.reports === 0, 'Reports count decremented to 0');

    // ─────────────────────────────────────────────────────────────
    // SCENARIOS P, Q, R: Notification unread count & click synchronization
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- Scenarios P, Q, R: Notification unread & entity synchronization ---');
    const notif1Id = `notif_1_${ts}`;
    const appId2 = `app_2_${ts}`;
    const dNow7 = devStore.read();
    // Create new application 2 (unseen)
    dNow7.applications.push({
      _id: appId2,
      universityId: uniAId,
      university: uniAName,
      program: 'MBA Executive',
      user: student1Id,
      stage: 'Submitted',
      status: 'Submitted',
      documents: [],
      createdAt: new Date().toISOString(),
    });
    // Create notification linked to application 2
    dNow7.notifications.push({
      _id: notif1Id,
      user: repAUserId,
      title: 'New Candidate Application Received',
      message: 'A new application for MBA Executive was submitted.',
      read: false,
      isRead: false,
      link: '/university-rep/applications',
      actionUrl: '/university-rep/applications',
      relatedEntityType: 'application',
      relatedEntityId: appId2,
      createdAt: new Date().toISOString(),
    });
    devStore.write(dNow7);

    const countsBeforeNotifClick = await request('GET', '/api/university-rep/sidebar-counts', null, tokenRepA);
    assert(countsBeforeNotifClick.data.data.notifications === 1, 'Unread notification count is 1');
    assert(countsBeforeNotifClick.data.data.applications === 1, 'Application 2 is unseen (applications count = 1)');

    // Click notification: call mark notification read
    const readNotifRes = await request('PUT', `/api/university-rep/notifications/${notif1Id}/read`, {}, tokenRepA);
    assert(readNotifRes.status === 200, 'Mark notification read succeeds');

    const countsAfterNotifClick = await request('GET', '/api/university-rep/sidebar-counts', null, tokenRepA);
    assert(countsAfterNotifClick.data.data.notifications === 0, 'Notifications count is now 0');
    assert(countsAfterNotifClick.data.data.applications === 0, 'Related application 2 marked seen via synchronization (applications count = 0)');

    // ─────────────────────────────────────────────────────────────
    // SCENARIO S: Direct page view marks entity seen
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- Scenario S: Direct page view marks entity seen ---');
    const appId3 = `app_3_${ts}`;
    const dNow8 = devStore.read();
    dNow8.applications.push({
      _id: appId3,
      universityId: uniAId,
      university: uniAName,
      program: 'BSc Physics',
      user: student1Id,
      stage: 'Submitted',
      status: 'Submitted',
      documents: [],
      createdAt: new Date().toISOString(),
    });
    devStore.write(dNow8);

    const countsBeforeDirect = await request('GET', '/api/university-rep/sidebar-counts', null, tokenRepA);
    assert(countsBeforeDirect.data.data.applications === 1, 'Application 3 is unseen');

    // Direct interaction with application 3
    const directSeenRes = await request('POST', `/api/university-rep/seen/application/${appId3}`, {}, tokenRepA);
    assert(directSeenRes.status === 200, 'POST /seen/application/:id marks entity seen');

    const countsAfterDirect = await request('GET', '/api/university-rep/sidebar-counts', null, tokenRepA);
    assert(countsAfterDirect.data.data.applications === 0, 'Application 3 is now seen');

    // ─────────────────────────────────────────────────────────────
    // SCENARIOS T & U: Refresh & Logout/Login preserves seen state
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- Scenarios T & U: Refresh & Re-login preserves seen state ---');
    // Simulated page refresh / another query
    const refreshCounts = await request('GET', '/api/university-rep/sidebar-counts', null, tokenRepA);
    assert(refreshCounts.data.data.applications === 0, 'Page refresh preserves seen state');

    // New token (simulating login/logout session change)
    const newTokenRepA = jwt.sign({ id: repAUserId }, JWT_SECRET, { expiresIn: '2h' });
    const reloginCounts = await request('GET', '/api/university-rep/sidebar-counts', null, newTokenRepA);
    assert(reloginCounts.data.data.applications === 0, 'New login session preserves seen state from persistent DB');

    // ─────────────────────────────────────────────────────────────
    // SCENARIO V: Reopening does not decrement again
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- Scenario V: Reopening does not decrement again ---');
    await request('PUT', `/api/university-rep/seen/application/${appId3}`, {}, tokenRepA);
    const reopenCounts = await request('GET', '/api/university-rep/sidebar-counts', null, tokenRepA);
    assert(reopenCounts.data.data.applications === 0, 'Reopening already-seen application does not decrement below 0');

    // ─────────────────────────────────────────────────────────────
    // SCENARIO W: New entity after all seen increases count again
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- Scenario W: New entity after all seen increases count again ---');
    const appId4 = `app_4_${ts}`;
    const dNow9 = devStore.read();
    dNow9.applications.push({
      _id: appId4,
      universityId: uniAId,
      university: uniAName,
      program: 'MSc Biochemistry',
      user: student1Id,
      stage: 'Submitted',
      status: 'Submitted',
      documents: [],
      createdAt: new Date().toISOString(),
    });
    devStore.write(dNow9);

    const countsNewApp = await request('GET', '/api/university-rep/sidebar-counts', null, tokenRepA);
    assert(countsNewApp.data.data.applications === 1, 'New application 4 increments count back to 1');

    // ─────────────────────────────────────────────────────────────
    // SCENARIOS X & Y: No negative counts & Duplicate seen records prevented
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- Scenarios X & Y: No negative counts & Duplicate prevention ---');
    await request('PUT', `/api/university-rep/seen/application/${appId4}`, {}, tokenRepA);
    await request('PUT', `/api/university-rep/seen/application/${appId4}`, {}, tokenRepA);
    await request('PUT', `/api/university-rep/seen/application/${appId4}`, {}, tokenRepA);

    const finalAppCounts = await request('GET', '/api/university-rep/sidebar-counts', null, tokenRepA);
    assert(finalAppCounts.data.data.applications === 0, 'Count is 0, never negative');

    const dbCheck = devStore.read();
    const seenRecordsForApp4 = (dbCheck.uniRepSeenItems || []).filter(
      (s) => s.entityType === 'application' && s.entityId === appId4 && s.user === repAUserId
    );
    assert(seenRecordsForApp4.length === 1, 'Exactly one persistent seen record exists, no duplicates');

    // ─────────────────────────────────────────────────────────────
    // SCENARIOS Z & AA: Uni Rep A cannot access Uni Rep B data & IDOR attempt returns 403
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- Scenarios Z & AA: Cross-representative isolation & IDOR Protection ---');
    // Create an application belonging to University B (Harvard)
    const appHarvardId = `app_harvard_${ts}`;
    const dNow10 = devStore.read();
    dNow10.applications.push({
      _id: appHarvardId,
      universityId: uniBId,
      university: uniBName,
      program: 'PhD Robotics',
      user: student1Id,
      stage: 'Submitted',
      status: 'Submitted',
      documents: [
        {
          _id: `doc_harvard_${ts}`,
          name: 'Harvard Recommendation Letter.pdf',
          type: 'LOR',
          url: 'https://admify.test/lor.pdf',
        },
      ],
      createdAt: new Date().toISOString(),
    });
    devStore.write(dNow10);

    // Uni Rep A attempts IDOR: mark Harvard application as seen
    const idorAppRes = await request('PUT', `/api/university-rep/seen/application/${appHarvardId}`, {}, tokenRepA);
    assert(idorAppRes.status === 403, 'IDOR attempt on unowned application returns 403 Forbidden');

    // Uni Rep A attempts IDOR: mark Harvard document as seen
    const idorDocRes = await request('PUT', `/api/university-rep/seen/document/doc_harvard_${ts}`, {}, tokenRepA);
    assert(idorDocRes.status === 403, 'IDOR attempt on unowned document returns 403 Forbidden');

    // Verify Uni Rep B can mark it seen
    const repBSeenRes = await request('PUT', `/api/university-rep/seen/application/${appHarvardId}`, {}, tokenRepB);
    assert(repBSeenRes.status === 200, 'Legitimate owner Uni Rep B can mark application seen');

    // ─────────────────────────────────────────────────────────────
    // SCENARIO AB: Business status remains unchanged after seen
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- Scenario AB: Business status remains unchanged after seen ---');
    const dbStatusCheck = devStore.read();
    const appHarvard = dbStatusCheck.applications.find((a) => a._id === appHarvardId);
    assert(appHarvard.stage === 'Submitted', 'Application stage remains "Submitted" after seen');

    // ─────────────────────────────────────────────────────────────
    // SCENARIOS AC & AD: Message receiver authorization fix
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- Scenarios AC & AD: Messaging authorization security check ---');
    // Agency 2 does NOT have an accepted connection with University A
    const unauthMsgRes = await request(
      'POST',
      '/api/university-rep/messages',
      { receiverId: agency2UserId, text: 'Hello unapproved agency' },
      tokenRepA
    );
    assert(unauthMsgRes.status === 403, 'Sending message to unauthorized agency returns 403 Forbidden');

    // Create an ACCEPTED connection between University A and Agency 1
    const dNow11 = devStore.read();
    dNow11.universityAgencyConnections.push({
      _id: `conn_accepted_${ts}`,
      universityId: uniAId,
      universityRepresentativeId: repAUserId,
      agencyId: agency1UserId,
      status: 'ACCEPTED',
      requestedBy: agency1UserId,
      createdAt: new Date().toISOString(),
    });
    devStore.write(dNow11);

    const authMsgRes = await request(
      'POST',
      '/api/university-rep/messages',
      { receiverId: agency1UserId, text: 'Hello partner agency! Welcome to Cambridge.' },
      tokenRepA
    );
    assert(authMsgRes.status === 201, 'Sending message to authorized partner with ACCEPTED connection returns 201 Created');

    // ─────────────────────────────────────────────────────────────
    // SCENARIO AE: Document ownership validation
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- Scenario AE: Document ownership validation ---');
    // Attempt to mark arbitrary non-existent or synthetic document
    const fakeDocRes = await request('PUT', `/api/university-rep/seen/document/fake_doc_id_999`, {}, tokenRepA);
    assert(fakeDocRes.status === 404 || fakeDocRes.status === 403, 'Non-existent document is rejected with 403/404');

    // ─────────────────────────────────────────────────────────────
    // SCENARIOS AF & AG: Legacy university-string & universityId matching
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- Scenarios AF & AG: Legacy university-string & universityId matching ---');
    const legacyAppId = `app_legacy_${ts}`;
    const dNow12 = devStore.read();
    // App with ONLY legacy string university (lowercased), no universityId
    dNow12.applications.push({
      _id: legacyAppId,
      university: uniAName.toLowerCase(), // case-insensitive match test
      program: 'BA History of Art',
      user: student1Id,
      stage: 'Submitted',
      status: 'Submitted',
      documents: [],
      createdAt: new Date().toISOString(),
    });
    devStore.write(dNow12);

    const legacyCounts = await request('GET', '/api/university-rep/sidebar-counts', null, tokenRepA);
    assert(legacyCounts.data.data.applications === 1, 'Legacy university string matched for Uni Rep A (applications count = 1)');

    const markLegacyRes = await request('PUT', `/api/university-rep/seen/application/${legacyAppId}`, {}, tokenRepA);
    assert(markLegacyRes.status === 200, 'Legacy university string application marked seen successfully');

    const afterLegacyCounts = await request('GET', '/api/university-rep/sidebar-counts', null, tokenRepA);
    assert(afterLegacyCounts.data.data.applications === 0, 'Legacy application seen decrements count to 0');

    console.log('\n===========================================================');
    console.log('🎉 ALL SCENARIOS (A-AG) PASSED SUCCESSFULLY!');
    console.log('===========================================================');
  } finally {
    if (serverProcess) {
      serverProcess.kill();
    }
  }
}

runUniRepSeenSuite().catch((err) => {
  console.error('\n❌ TEST SUITE FAILED:', err);
  process.exit(1);
});
