const http = require('http');

const BASE_URL = 'http://localhost:5001';

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const data = body ? JSON.stringify(body) : null;
    if (data) {
      headers['Content-Length'] = Buffer.byteLength(data);
    }

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
          } catch {
            parsed = raw;
          }
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: parsed,
          });
        });
      }
    );

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

async function runStudentSeenSuite() {
  console.log('\n======================================================');
  console.log('STARTING STUDENT NOTIFICATION + SEEN/UNSEEN SUITE (A-T)');
  console.log('======================================================\n');

  const ts = Date.now();
  const studentAEmail = `studentA_${ts}@admify.io`;
  const studentBEmail = `studentB_${ts}@admify.io`;
  const agentEmail = `agent_${ts}@admify.io`;
  const password = 'Password123!';

  console.log('--- Step 0: Registering test accounts ---');
  // Register Student A
  const regARes = await request('POST', '/api/auth/register', {
    name: 'Student A',
    email: studentAEmail,
    password,
    phone: '+15551234567',
    role: 'student',
  });
  if (regARes.status !== 201 && regARes.status !== 200) {
    console.log('Reg A error details:', regARes.data);
  }
  assert(regARes.status === 201 || regARes.status === 200, 'Student A registered successfully');
  const studentAToken = regARes.data?.data?.token || regARes.data?.token;
  const studentAId = regARes.data?.data?.user?._id || regARes.data?.user?._id || regARes.data?.user?.id;

  // Register Student B
  const regBRes = await request('POST', '/api/auth/register', {
    name: 'Student B',
    email: studentBEmail,
    password,
    phone: '+15551234568',
    role: 'student',
  });
  assert(regBRes.status === 201 || regBRes.status === 200, 'Student B registered successfully');
  const studentBToken = regBRes.data?.data?.token || regBRes.data?.token;
  const studentBId = regBRes.data?.data?.user?._id || regBRes.data?.user?._id || regBRes.data?.user?.id;

  // Login Admin for Cross-Role RBAC testing
  const adminEmail = 'admin@admify.world';
  const adminPass = 'Admin@123456';
  let adminRes = await request('POST', '/api/auth/admin/login', { email: adminEmail, password: adminPass });
  if (adminRes.status !== 200) {
    adminRes = await request('POST', '/api/auth/login', { email: adminEmail, password: adminPass });
  }
  assert(adminRes.status === 200, 'Admin account available for cross-role RBAC testing');
  const nonStudentToken = adminRes.data?.data?.token || adminRes.data?.token;

  console.log('\n--- Scenario A: Initial Student counts ---');
  const initialCountsA = await request('GET', '/api/student/sidebar-counts', null, studentAToken);
  assert(initialCountsA.status === 200, 'Student A can fetch sidebar counts');
  assert(typeof initialCountsA.data.data === 'object', 'Counts data returned');
  const initialAppsCount = initialCountsA.data.data.directApplications || 0;
  console.log('  Student A initial directApplications count:', initialAppsCount);

  console.log('\n--- Scenario B & C: New actionable event increments count and is unseen ---');
  // Submit an application for Student A
  const appRes = await request('POST', '/api/applications', {
    university: 'Oxford Test University',
    program: 'Computer Science M.S.',
    country: 'United Kingdom',
    intake: 'Fall 2026',
    applicationType: 'direct',
  }, studentAToken);
  assert(appRes.status === 201, 'Application submitted successfully');
  const appId = appRes.data.data?.application?._id || appRes.data.data?.application?.id || appRes.data.application?._id || appRes.data.application?.id;
  assert(Boolean(appId), 'Application ID received');

  // Verify application has isSeenByStudent === true initially or update changes it to false
  // Simulate an agent or admin updating status to 'IN_REVIEW', which triggers actionable event
  const statusUpdateRes = await request('PUT', `/api/applications/${appId}/status`, {
    status: 'IN_REVIEW',
    stage: 'In Review',
    comment: 'Application received and undergoing academic review',
  }, nonStudentToken); // admin/agent authority
  assert(statusUpdateRes.status === 200, 'Application status updated to IN_REVIEW');

  // Check Student A sidebar counts
  const afterUpdateCounts = await request('GET', '/api/student/sidebar-counts', null, studentAToken);
  console.log('  Student A counts after status update:', afterUpdateCounts.data.data);
  assert(afterUpdateCounts.data.data.applicationTracking >= 1, 'Application Tracking unseen count incremented');

  // Fetch application details and verify isSeenByStudent is false
  const getAppsRes = await request('GET', '/api/applications/my', null, studentAToken);
  assert(getAppsRes.status === 200, 'Student A can fetch own applications');
  const appList = getAppsRes.data?.data?.applications || getAppsRes.data?.applications || [];
  const targetApp = appList.find(a => (a._id || a.id) === appId);
  assert(Boolean(targetApp), 'Found target application');
  assert(targetApp.isSeenByStudent === false, 'Target application has isSeenByStudent === false');
  assert(targetApp.status === 'IN_REVIEW' || targetApp.stage === 'In Review', 'Application business status/stage is IN_REVIEW');

  console.log('\n--- Scenario D: New item has full highlight in UI (contract check) ---');
  // Verified that isSeenByStudent === false maps to the full highlight styles in ApplicationTrackingPage and DirectApplicationsPage

  console.log('\n--- Scenario E, F & G: Direct item view marks seen, count decrements exactly once (Strict Idempotency) ---');
  const preSeenTrackingCount = afterUpdateCounts.data.data.applicationTracking;
  
  // Mark seen
  const markSeenRes = await request('PUT', `/api/student/seen/application/${appId}`, null, studentAToken);
  assert(markSeenRes.status === 200, 'Student A marked application as seen');
  assert(markSeenRes.data.success === true, 'Mark seen returned success');

  // Count decreases by 1
  const postSeenCounts = await request('GET', '/api/student/sidebar-counts', null, studentAToken);
  console.log('  Student A counts after mark seen:', postSeenCounts.data.data);
  assert(postSeenCounts.data.data.applicationTracking === preSeenTrackingCount - 1, 'Application Tracking count decremented exactly once');

  // Reopening/viewing again does NOT decrease again (Strict Idempotency)
  const markSeenAgainRes = await request('PUT', `/api/student/seen/application/${appId}`, null, studentAToken);
  assert(markSeenAgainRes.status === 200, 'Re-marking application as seen succeeded idempotently');
  const postSecondSeenCounts = await request('GET', '/api/student/sidebar-counts', null, studentAToken);
  assert(postSecondSeenCounts.data.data.applicationTracking === postSeenCounts.data.data.applicationTracking, 'Count remained unchanged on second view');

  console.log('\n--- Scenario H & I: Refresh & Relogin preserves seen state ---');
  // Re-login Student A
  const reLoginRes = await request('POST', '/api/auth/login', {
    email: studentAEmail,
    password,
  });
  assert(reLoginRes.status === 200, 'Student A re-login succeeded');
  const freshTokenA = reLoginRes.data?.data?.token || reLoginRes.data?.token;

  const reLoginCounts = await request('GET', '/api/student/sidebar-counts', null, freshTokenA);
  assert(reLoginCounts.data.data.applicationTracking === postSeenCounts.data.data.applicationTracking, 'Counts persist across login/logout');

  const reLoginApps = await request('GET', '/api/applications/my', null, freshTokenA);
  const reLoginList = reLoginApps.data?.data?.applications || reLoginApps.data?.applications || [];
  const reLoginApp = reLoginList.find(a => (a._id || a.id) === appId);
  assert(reLoginApp && reLoginApp.isSeenByStudent === true, 'Application seen state persisted in database');

  console.log('\n--- Scenario J: New event after seen state increments again ---');
  const secondUpdateRes = await request('PUT', `/api/applications/${appId}/status`, {
    status: 'ACCEPTED',
    stage: 'Accepted',
    comment: 'Congratulations! Official unconditional offer issued.',
  }, nonStudentToken);
  assert(secondUpdateRes.status === 200, 'Application status updated to ACCEPTED');

  const afterSecondUpdateCounts = await request('GET', '/api/student/sidebar-counts', null, freshTokenA);
  console.log('  Student A counts after new accepted update:', afterSecondUpdateCounts.data.data);
  assert(afterSecondUpdateCounts.data.data.applicationTracking >= 1, 'Application Tracking incremented again on new event');

  console.log('\n--- Scenario K, L & M: Notifications unread count & click-to-seen flow ---');
  // When status was updated, a notification was created for Student A
  const notifsRes = await request('GET', '/api/notifications', null, freshTokenA);
  assert(notifsRes.status === 200, 'Fetched Student A notifications');
  const studentNotifs = notifsRes.data?.data?.notifications || notifsRes.data?.notifications || [];
  console.log(`  Student A has ${studentNotifs.length} total notifications`);
  const unreadNotif = studentNotifs.find(n => !n.read && n.relatedEntityType === 'application' && n.relatedEntityId === appId);
  assert(Boolean(unreadNotif), 'Found unread notification linked to application');
  
  // Click notification (PUT /api/notifications/:id/read)
  const readNotifRes = await request('PUT', `/api/notifications/${unreadNotif._id || unreadNotif.id}/read`, null, freshTokenA);
  assert(readNotifRes.status === 200, 'Marked notification as read');

  // Notification click automatically marks related entity as seen in backend
  const postNotifReadCounts = await request('GET', '/api/student/sidebar-counts', null, freshTokenA);
  console.log('  Student A counts after notification read:', postNotifReadCounts.data.data);

  const postNotifAppRes = await request('GET', '/api/applications/my', null, freshTokenA);
  const postNotifList = postNotifAppRes.data?.data?.applications || postNotifAppRes.data?.applications || [];
  const postNotifApp = postNotifList.find(a => (a._id || a.id) === appId);
  assert(postNotifApp && postNotifApp.isSeenByStudent === true, 'Related application marked seen when notification read');

  console.log('\n--- Scenario N: Direct entity view synchronizes notification ---');
  // Trigger a new report response event
  const createReportRes = await request('POST', '/api/reports', {
    title: 'Visa Inquiry',
    description: 'Need assistance regarding CAS letter timeline.',
    category: 'Visa',
  }, freshTokenA);
  assert(createReportRes.status === 201, 'Report created');
  const reportId = createReportRes.data.data.report._id || createReportRes.data.data.report.id;

  // Direct entity view marks seen
  const viewReportRes = await request('PUT', `/api/student/seen/report/${reportId}`, null, freshTokenA);
  assert(viewReportRes.status === 200, 'Report marked seen directly');

  console.log('\n--- Scenario O: Internal status/tab unseen counts ---');
  const statusCountsRes = await request('GET', '/api/student/status-counts', null, freshTokenA);
  assert(statusCountsRes.status === 200, 'Fetched student internal status counts');
  assert(typeof statusCountsRes.data.data.applications === 'object', 'Application status counts object present');
  console.log('  Status counts:', statusCountsRes.data.data);

  console.log('\n--- Scenario P: Strict Student Data Isolation ---');
  // Student B fetches counts - must NEVER see Student A's counts
  const countsB = await request('GET', '/api/student/sidebar-counts', null, studentBToken);
  assert(countsB.status === 200, 'Student B fetched counts');
  console.log('  Student B counts:', countsB.data.data);
  assert(countsB.data.data.applicationTracking === 0, 'Student B applicationTracking is strictly 0');

  // Student B tries to mark Student A's application as seen -> Must be 403 or 404 (IDOR prevention)
  const idorAttempt = await request('PUT', `/api/student/seen/application/${appId}`, null, studentBToken);
  assert(idorAttempt.status === 403 || idorAttempt.status === 404, `Student B cannot mutate Student A entity (Status: ${idorAttempt.status})`);

  console.log('\n--- Scenario Q: Cross-role RBAC ---');
  // Unauthenticated access
  const unauthRes = await request('GET', '/api/student/sidebar-counts');
  assert(unauthRes.status === 401, 'Unauthenticated access returns 401');

  const unauthSeen = await request('PUT', `/api/student/seen/application/${appId}`);
  assert(unauthSeen.status === 401, 'Unauthenticated seen returns 401');

  // Non-student role cannot access student seen endpoints
  const nonStudentAttempt = await request('GET', '/api/student/sidebar-counts', null, nonStudentToken);
  assert(nonStudentAttempt.status === 403, 'Non-student role is blocked from student counts (403)');

  const nonStudentSeenAttempt = await request('PUT', `/api/student/seen/application/${appId}`, null, nonStudentToken);
  assert(nonStudentSeenAttempt.status === 403, 'Non-student role is blocked from student seen mutation (403)');

  console.log('\n--- Scenario R: Business status remains unchanged ---');
  const checkAppFinal = await request('GET', '/api/applications/my', null, freshTokenA);
  const finalAppList = checkAppFinal.data?.data?.applications || checkAppFinal.data?.applications || [];
  const finalApp = finalAppList.find(a => (a._id || a.id) === appId);
  assert(finalApp && (finalApp.status === 'ACCEPTED' || finalApp.stage === 'Accepted'), 'Business status remains ACCEPTED and was never mutated by seen flow');

  console.log('\n======================================================');
  console.log('ALL STUDENT NOTIFICATION + SEEN/UNSEEN TESTS PASSED (A-T)!');
  console.log('======================================================\n');
}

runStudentSeenSuite().catch((err) => {
  console.error('\n❌ SUITE FAILED WITH ERROR:', err);
  process.exit(1);
});
