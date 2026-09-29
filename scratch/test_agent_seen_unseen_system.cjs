/**
 * Comprehensive Agent Notification + Sidebar Count + Status Count + Seen/Unseen + Highlight Test Suite
 * Scenarios A through U as required by the specification.
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

async function runAgentSeenSuite() {
  console.log('======================================================');
  console.log('STARTING AGENT NOTIFICATION + SEEN/UNSEEN SUITE (A-U)');
  console.log('======================================================\n');

  // Spawn backend if not already listening
  let serverProcess = null;
  try {
    await request('GET', '/api/health');
    console.log('Backend server already running on port 5001.');
  } catch (err) {
    console.log('Starting backend server for test run on port 5001...');
    serverProcess = spawn(process.execPath, ['server.js'], {
      cwd: path.resolve(__dirname, '../backend'),
      env: { ...process.env, PORT: '5001' },
      stdio: 'pipe',
    });

    // Wait for server to become ready
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

    // Create Agent A in devStore / db
    const agentAId = `agt_a_${ts}`;
    const agentBId = `agt_b_${ts}`;
    const studentId = `stu_${ts}`;

    const db = devStore.read();
    db.users = db.users || [];
    db.users.push({
      _id: agentAId,
      name: 'Agent A Counselor',
      email: `agentA_${ts}@admify.world`,
      role: 'agent',
      status: 'active',
      accountStatus: 'ACTIVE',
      createdAt: new Date().toISOString(),
    });
    db.users.push({
      _id: agentBId,
      name: 'Agent B Counselor',
      email: `agentB_${ts}@admify.world`,
      role: 'agent',
      status: 'active',
      accountStatus: 'ACTIVE',
      createdAt: new Date().toISOString(),
    });
    db.users.push({
      _id: studentId,
      name: 'Student Tanvir',
      email: `student_${ts}@admify.world`,
      role: 'student',
      status: 'active',
      createdAt: new Date().toISOString(),
    });
    devStore.write(db);

    const tokenAgentA = jwt.sign({ id: agentAId }, JWT_SECRET, { expiresIn: '1h' });
    const tokenAgentB = jwt.sign({ id: agentBId }, JWT_SECRET, { expiresIn: '1h' });
    const tokenStudent = jwt.sign({ id: studentId }, JWT_SECRET, { expiresIn: '1h' });

    // ── Scenario A: Initial Agent sidebar counts ──
    console.log('\n--- Scenario A: Initial Agent sidebar counts ---');
    const initCountsRes = await request('GET', '/api/agent/sidebar-counts', null, tokenAgentA);
    assert(initCountsRes.status === 200, 'Agent A can query /api/agent/sidebar-counts');
    assert(initCountsRes.data.success === true, 'Response indicates success');
    assert(initCountsRes.data.data.applications === 0, 'Initial unseen applications count is 0');
    assert(initCountsRes.data.data.tasks === 0, 'Initial unseen tasks count is 0');
    assert(initCountsRes.data.data.notifications === 0, 'Initial unseen notifications count is 0');
    assert(initCountsRes.data.data.students === 0, 'Initial unseen students count is 0');

    // ── Scenario B & C: New actionable event increments count & is unseen ──
    console.log('\n--- Scenario B & C: New actionable event increments count & item is unseen ---');
    const appId = `app_${ts}_1`;
    const dbNow = devStore.read();
    dbNow.applications = dbNow.applications || [];
    dbNow.applications.push({
      _id: appId,
      applicationId: appId,
      university: 'Oxford University',
      program: 'MSc Computer Science',
      user: studentId,
      assignedAgent: agentAId,
      stage: 'In Review',
      isSeenByAgent: false,
      createdAt: new Date().toISOString(),
    });
    devStore.write(dbNow);

    const afterAppRes = await request('GET', '/api/agent/sidebar-counts', null, tokenAgentA);
    assert(afterAppRes.data.data.applications === 1, 'Applications unseen count incremented to 1');
    assert(afterAppRes.data.data.students === 1, 'Assigned student unseen count incremented to 1');

    // ── Scenario D: New item receives full highlight ──
    console.log('\n--- Scenario D: New item receives full highlight (isSeenByAgent=false) ---');
    const appsListRes = await request('GET', '/api/agent/applications', null, tokenAgentA);
    assert(appsListRes.status === 200, 'Agent A fetched applications');
    const fetchedApp = appsListRes.data.data.applications.find((a) => a._id === appId);
    assert(fetchedApp && fetchedApp.isSeenByAgent === false, 'Fetched application has isSeenByAgent === false for full highlight');

    // ── Scenario E & F: Direct item view marks seen & count decreases exactly once ──
    console.log('\n--- Scenario E & F: Direct item view marks seen & count decreases exactly once ---');
    const markSeenRes = await request('PUT', `/api/agent/seen/application/${appId}`, null, tokenAgentA);
    assert(markSeenRes.status === 200, 'PUT /api/agent/seen/application/:id returned 200');
    assert(markSeenRes.data.data.isSeenByAgent === true, 'Response confirms isSeenByAgent: true');

    const countsAfterSeen = await request('GET', '/api/agent/sidebar-counts', null, tokenAgentA);
    assert(countsAfterSeen.data.data.applications === 0, 'Applications unseen count decremented to 0');

    // ── Scenario G: Reopening does not decrease again (strict idempotency) ──
    console.log('\n--- Scenario G: Reopening does not decrease again (strict idempotency) ---');
    const markSeenAgainRes = await request('PUT', `/api/agent/seen/application/${appId}`, null, tokenAgentA);
    assert(markSeenAgainRes.status === 200, 'Second seen call returned 200');

    const countsAfterSecondSeen = await request('GET', '/api/agent/sidebar-counts', null, tokenAgentA);
    assert(countsAfterSecondSeen.data.data.applications === 0, 'Count remains 0, strictly idempotent');

    // ── Scenario H: Refresh preserves seen state ──
    console.log('\n--- Scenario H: Refresh preserves seen state ---');
    const refreshAppsRes = await request('GET', '/api/agent/applications', null, tokenAgentA);
    const refreshedApp = refreshAppsRes.data.data.applications.find((a) => a._id === appId);
    assert(refreshedApp && refreshedApp.isSeenByAgent === true, 'Application remains isSeenByAgent === true across refresh');

    // ── Scenario I: Logout/login preserves seen state ──
    console.log('\n--- Scenario I: Logout/login preserves seen state ---');
    const freshTokenA = jwt.sign({ id: agentAId }, JWT_SECRET, { expiresIn: '1h' });
    const freshCountsRes = await request('GET', '/api/agent/sidebar-counts', null, freshTokenA);
    assert(freshCountsRes.data.data.applications === 0, 'Fresh login session preserves 0 unseen applications');

    // ── Scenario J: New event after seen state increments again ──
    console.log('\n--- Scenario J: New event after seen state increments again ---');
    const app2Id = `app_${ts}_2`;
    const dbJ = devStore.read();
    dbJ.applications.push({
      _id: app2Id,
      applicationId: app2Id,
      university: 'Cambridge University',
      program: 'MSc AI',
      user: studentId,
      assignedAgent: agentAId,
      stage: 'Submitted',
      isSeenByAgent: false,
      createdAt: new Date().toISOString(),
    });
    devStore.write(dbJ);

    const countsJ = await request('GET', '/api/agent/sidebar-counts', null, freshTokenA);
    assert(countsJ.data.data.applications === 1, 'Applications unseen count correctly incremented to 1 for the new event');

    // ── Scenario K, L, M: Notification unread count & notification click flow ──
    console.log('\n--- Scenario K, L, M: Notification unread count & notification click flow ---');
    const notifId = `notif_${ts}_1`;
    const dbK = devStore.read();
    dbK.notifications = dbK.notifications || [];
    dbK.notifications.push({
      _id: notifId,
      user: agentAId,
      title: 'New Document Uploaded',
      message: 'Student uploaded transcript for Cambridge',
      read: false,
      relatedEntityType: 'application',
      relatedEntityId: app2Id,
      createdAt: new Date().toISOString(),
    });
    devStore.write(dbK);

    const countsBeforeClick = await request('GET', '/api/agent/sidebar-counts', null, freshTokenA);
    assert(countsBeforeClick.data.data.notifications === 1, 'Notifications unseen count is 1');
    assert(countsBeforeClick.data.data.applications === 1, 'Applications unseen count is 1');

    // Simulate Agent clicking the notification: marks read and marks related entity seen
    const readNotifRes = await request('PUT', `/api/agent/notifications/${notifId}/read`, null, freshTokenA);
    assert(readNotifRes.status === 200, 'Notification marked as read');
    await request('PUT', `/api/agent/seen/application/${app2Id}`, null, freshTokenA);

    const countsAfterClick = await request('GET', '/api/agent/sidebar-counts', null, freshTokenA);
    assert(countsAfterClick.data.data.notifications === 0, 'Notifications count decreased to 0');
    assert(countsAfterClick.data.data.applications === 0, 'Related application count decreased to 0');

    // ── Scenario N: Direct entity view synchronizes notification ──
    console.log('\n--- Scenario N: Direct entity view synchronizes notification ---');
    const app3Id = `app_${ts}_3`;
    const notif3Id = `notif_${ts}_3`;
    const dbN = devStore.read();
    dbN.applications.push({
      _id: app3Id,
      applicationId: app3Id,
      university: 'Imperial College',
      program: 'MSc Data Science',
      user: studentId,
      assignedAgent: agentAId,
      stage: 'Submitted',
      isSeenByAgent: false,
      createdAt: new Date().toISOString(),
    });
    dbN.notifications.push({
      _id: notif3Id,
      user: agentAId,
      title: 'Imperial Application Created',
      message: 'Assigned to your caseload',
      read: false,
      relatedEntityType: 'application',
      relatedEntityId: app3Id,
      createdAt: new Date().toISOString(),
    });
    devStore.write(dbN);

    // Verify unread notification exists
    const countsBeforeDirect = await request('GET', '/api/agent/sidebar-counts', null, freshTokenA);
    assert(countsBeforeDirect.data.data.notifications === 1, 'Notification unread count is 1 before direct view');

    // Direct view of entity
    await request('PUT', `/api/agent/seen/application/${app3Id}`, null, freshTokenA);

    // Verify both entity is seen and notification is auto-marked read
    const countsAfterDirect = await request('GET', '/api/agent/sidebar-counts', null, freshTokenA);
    assert(countsAfterDirect.data.data.applications === 0, 'Application is seen (0)');
    assert(countsAfterDirect.data.data.notifications === 0, 'Related notification auto-synchronized to read (0)');

    // ── Scenario O: Internal status/tab unseen counts ──
    console.log('\n--- Scenario O: Internal status/tab unseen counts ---');
    const appPendingId = `app_pending_${ts}`;
    const appReviewId = `app_review_${ts}`;
    const dbO = devStore.read();
    dbO.applications.push({
      _id: appPendingId,
      applicationId: appPendingId,
      university: 'Harvard University',
      program: 'MBA',
      user: studentId,
      assignedAgent: agentAId,
      stage: 'Documents Pending',
      isSeenByAgent: false,
      createdAt: new Date().toISOString(),
    });
    dbO.applications.push({
      _id: appReviewId,
      applicationId: appReviewId,
      university: 'Stanford University',
      program: 'MS CS',
      user: studentId,
      assignedAgent: agentAId,
      stage: 'In Review',
      isSeenByAgent: false,
      createdAt: new Date().toISOString(),
    });
    devStore.write(dbO);

    const statusCountsRes = await request('GET', '/api/agent/status-counts', null, freshTokenA);
    assert(statusCountsRes.status === 200, 'GET /api/agent/status-counts returned 200');
    assert(statusCountsRes.data.data.applications.all === 2, 'Total unseen applications is 2');
    assert(statusCountsRes.data.data.applications['Documents Pending'] === 1, 'Documents Pending unseen count is 1');
    assert(statusCountsRes.data.data.applications['In Review'] === 1, 'In Review unseen count is 1');
    assert(statusCountsRes.data.data.applications['Accepted'] === 0, 'Accepted unseen count is 0');

    // ── Scenario P: Strict Agent Data Isolation ──
    console.log('\n--- Scenario P: Strict Agent Data Isolation ---');
    const countsB = await request('GET', '/api/agent/sidebar-counts', null, tokenAgentB);
    assert(countsB.status === 200, 'Agent B fetched counts');
    assert(countsB.data.data.applications === 0, 'Agent B sees 0 applications (never sees Agent A data)');
    assert(countsB.data.data.students === 0, 'Agent B sees 0 students');

    // Agent B tries to mark Agent A's application as seen -> Must be 403 Forbidden (IDOR prevention)
    const idorRes = await request('PUT', `/api/agent/seen/application/${appPendingId}`, null, tokenAgentB);
    assert(idorRes.status === 403, `Agent B cannot mark Agent A entity as seen (Status: ${idorRes.status} Forbidden)`);

    // ── Scenario Q: Cross-role RBAC ──
    console.log('\n--- Scenario Q: Cross-role RBAC ---');
    // Unauthenticated
    const unauthSidebar = await request('GET', '/api/agent/sidebar-counts');
    assert(unauthSidebar.status === 401, 'Unauthenticated GET /sidebar-counts returns 401');

    const unauthSeen = await request('PUT', `/api/agent/seen/application/${appPendingId}`);
    assert(unauthSeen.status === 401, 'Unauthenticated PUT /seen returns 401');

    // Student role attempting Agent API
    const studentOnAgent = await request('GET', '/api/agent/sidebar-counts', null, tokenStudent);
    assert(studentOnAgent.status === 403, 'Student accessing Agent counts returns 403 Forbidden');

    const studentOnSeen = await request('PUT', `/api/agent/seen/application/${appPendingId}`, null, tokenStudent);
    assert(studentOnSeen.status === 403, 'Student mutating Agent seen state returns 403 Forbidden');

    // ── Scenario R: Business status remains unchanged ──
    console.log('\n--- Scenario R: Business status remains unchanged ---');
    const appVerifyRes = await request('GET', '/api/agent/applications', null, freshTokenA);
    const targetApp = appVerifyRes.data.data.applications.find((a) => a._id === appPendingId);
    assert(targetApp && targetApp.stage === 'Documents Pending', 'Business stage remains strictly "Documents Pending" and was never altered by seen logic');

    // ── Scenario S: Admin regression test ──
    console.log('\n--- Scenario S: Admin regression test ---');
    const adminToken = jwt.sign({ id: '674e1a0b1234567890abcdef' }, JWT_SECRET, { expiresIn: '1h' });
    const adminCountsRes = await request('GET', '/api/admin/sidebar-counts', null, adminToken);
    assert(adminCountsRes.status === 200, 'Admin /api/admin/sidebar-counts works intact (200)');
    assert(typeof adminCountsRes.data.data === 'object', 'Admin sidebar counts returned valid structure');

    // ── Scenario T: Student regression test ──
    console.log('\n--- Scenario T: Student regression test ---');
    const studentCountsRes = await request('GET', '/api/student/sidebar-counts', null, tokenStudent);
    assert(studentCountsRes.status === 200, 'Student /api/student/sidebar-counts works intact (200)');
    assert(typeof studentCountsRes.data.data === 'object', 'Student sidebar counts returned valid structure');

    // ── Scenario U: Existing Agent workflows remain intact ──
    console.log('\n--- Scenario U: Existing Agent workflows remain intact ---');
    const dashRes = await request('GET', '/api/agent/dashboard', null, freshTokenA);
    assert(dashRes.status === 200, 'Agent Dashboard API works intact (200)');

    const studentsRes = await request('GET', '/api/agent/students', null, freshTokenA);
    assert(studentsRes.status === 200, 'Agent Students API works intact (200)');

    const tasksRes = await request('GET', '/api/agent/tasks', null, freshTokenA);
    assert(tasksRes.status === 200, 'Agent Tasks API works intact (200)');

    const messagesRes = await request('GET', '/api/agent/messages', null, freshTokenA);
    assert(messagesRes.status === 200, 'Agent Messages API works intact (200)');

    const reportsRes = await request('GET', '/api/agent/reports', null, freshTokenA);
    assert(reportsRes.status === 200, 'Agent Reports API works intact (200)');

    console.log('\n======================================================');
    console.log('ALL AGENT NOTIFICATION + SEEN/UNSEEN TESTS PASSED (A-U)!');
    console.log('======================================================\n');
  } finally {
    if (serverProcess) {
      serverProcess.kill();
    }
  }
}

runAgentSeenSuite().catch((err) => {
  console.error('\n❌ SUITE FAILED WITH ERROR:', err);
  process.exit(1);
});
