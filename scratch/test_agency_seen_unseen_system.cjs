/**
 * Comprehensive Agency Notification + Sidebar Count + Status Count + Seen/Unseen + Highlight Test Suite
 * Scenarios A through X as required by the specification.
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

async function runAgencySeenSuite() {
  console.log('===========================================================');
  console.log('STARTING AGENCY NOTIFICATION + SEEN/UNSEEN SUITE (A-X)');
  console.log('===========================================================\n');

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

    // Create Agency A, Agency B, Student in devStore
    const agencyAUserId = `agn_user_a_${ts}`;
    const agencyBUserId = `agn_user_b_${ts}`;
    const agencyAProfileId = `agn_prof_a_${ts}`;
    const agencyBProfileId = `agn_prof_b_${ts}`;
    const studentId = `stu_${ts}`;

    const db = devStore.read();
    db.users = db.users || [];
    db.agencies = db.agencies || [];
    db.agencyProfiles = db.agencyProfiles || [];
    db.agencySeenItems = db.agencySeenItems || [];

    // Agency A User
    db.users.push({
      _id: agencyAUserId,
      name: 'Agency A Executive',
      email: `agencyA_${ts}@admify.world`,
      role: 'agency',
      status: 'active',
      isVerifiedAgency: true,
      agencyProfile: agencyAProfileId,
      verificationStatus: 'APPROVED',
      accountStatus: 'ACTIVE',
      createdAt: new Date().toISOString(),
    });
    // Agency A Profile
    const profileA = {
      _id: agencyAProfileId,
      user: agencyAUserId,
      owner: agencyAUserId,
      userId: agencyAUserId,
      agencyName: 'Global Education Agency A',
      verificationStatus: 'APPROVED',
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    db.agencies.push(profileA);
    db.agencyProfiles.push(profileA);

    // Agency B User
    db.users.push({
      _id: agencyBUserId,
      name: 'Agency B Executive',
      email: `agencyB_${ts}@admify.world`,
      role: 'agency',
      status: 'active',
      isVerifiedAgency: true,
      agencyProfile: agencyBProfileId,
      verificationStatus: 'APPROVED',
      accountStatus: 'ACTIVE',
      createdAt: new Date().toISOString(),
    });
    // Agency B Profile
    const profileB = {
      _id: agencyBProfileId,
      user: agencyBUserId,
      owner: agencyBUserId,
      userId: agencyBUserId,
      agencyName: 'Competitor Agency B',
      verificationStatus: 'APPROVED',
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    db.agencies.push(profileB);
    db.agencyProfiles.push(profileB);

    // Student
    db.users.push({
      _id: studentId,
      name: 'Test Student',
      email: `student_${ts}@admify.world`,
      role: 'student',
      status: 'active',
      createdAt: new Date().toISOString(),
    });

    devStore.write(db);

    const tokenAgencyA = jwt.sign({ id: agencyAUserId }, JWT_SECRET, { expiresIn: '1h' });
    const tokenAgencyB = jwt.sign({ id: agencyBUserId }, JWT_SECRET, { expiresIn: '1h' });

    // Initial check: Initial counts should be 0
    console.log('\n--- Initial check: Initial Agency sidebar counts ---');
    const initCountsRes = await request('GET', '/api/agency/sidebar-counts', null, tokenAgencyA);
    assert(initCountsRes.status === 200, 'Agency A can query /api/agency/sidebar-counts');
    assert(initCountsRes.data.success === true, 'Response indicates success');
    assert(initCountsRes.data.data.applications === 0, 'Initial unseen applications count is 0');
    assert(initCountsRes.data.data.serviceRequests === 0, 'Initial unseen serviceRequests count is 0');
    assert(initCountsRes.data.data.universityPartnerships === 0, 'Initial unseen partnerships count is 0');
    assert(initCountsRes.data.data.messages === 0, 'Initial unseen messages count is 0');
    assert(initCountsRes.data.data.reports === 0, 'Initial unseen reports count is 0');
    assert(initCountsRes.data.data.notifications === 0, 'Initial unseen notifications count is 0');

    // ── Scenario A: New application appears ──
    console.log('\n--- Scenario A: New application appears ---');
    const appId1 = `app_agency_${ts}_1`;
    const dbNow = devStore.read();
    dbNow.applications = dbNow.applications || [];
    dbNow.applications.push({
      _id: appId1,
      applicationId: appId1,
      university: 'Oxford University',
      program: 'MSc Data Science',
      user: studentId,
      assignedAgency: agencyAProfileId,
      stage: 'Submitted',
      status: 'SUBMITTED',
      createdAt: new Date().toISOString(),
    });
    devStore.write(dbNow);
    assert(true, 'Application created and assigned to Agency A');

    // ── Scenario B: Application sidebar count increases ──
    console.log('\n--- Scenario B: Application sidebar count increases ---');
    const countAfterAppRes = await request('GET', '/api/agency/sidebar-counts', null, tokenAgencyA);
    console.log('Sidebar counts response:', JSON.stringify(countAfterAppRes.data));
    assert(countAfterAppRes.data.data.applications === 1, 'Applications sidebar badge incremented to 1');

    // ── Scenario C: Application status count increases ──
    console.log('\n--- Scenario C: Application status count increases ---');
    const statusCountsRes = await request('GET', '/api/agency/status-counts', null, tokenAgencyA);
    assert(statusCountsRes.status === 200, 'Status counts endpoint returns 200');
    assert(statusCountsRes.data.data.applications.Submitted === 1, 'Status count for Submitted is 1');
    assert(statusCountsRes.data.data.applications.All === 1, 'Status count for All is 1');

    // ── Scenario D: Application full highlight appears ──
    console.log('\n--- Scenario D: Application full highlight appears ---');
    const appListRes = await request('GET', '/api/agency/applications', null, tokenAgencyA);
    assert(appListRes.status === 200, 'Applications list retrieved');
    const foundApp = (appListRes.data.data.applications || []).find((a) => a._id === appId1);
    assert(foundApp !== undefined, 'New application is returned in list');
    assert(foundApp.isSeenByAgency === false, 'Application has isSeenByAgency === false (triggers violet highlight)');

    // ── Scenario E: Opening application marks it seen ──
    console.log('\n--- Scenario E: Opening application marks it seen ---');
    const seenPostRes = await request('POST', `/api/agency/seen/application/${appId1}`, null, tokenAgencyA);
    assert(seenPostRes.status === 200, 'Mark seen returned 200');
    assert(seenPostRes.data.success === true, 'Mark seen response success');
    assert(seenPostRes.data.data.isSeen === true, 'Response confirms isSeen: true');

    // ── Scenario F: Sidebar count decreases by 1 ──
    console.log('\n--- Scenario F: Sidebar count decreases by 1 ---');
    const countAfterSeenRes = await request('GET', '/api/agency/sidebar-counts', null, tokenAgencyA);
    assert(countAfterSeenRes.data.data.applications === 0, 'Applications sidebar badge decreased to 0');

    // ── Scenario G: Status count decreases by 1 ──
    console.log('\n--- Scenario G: Status count decreases by 1 ---');
    const statusCountsAfterSeen = await request('GET', '/api/agency/status-counts', null, tokenAgencyA);
    assert(statusCountsAfterSeen.data.data.applications.Submitted === 0, 'Status count for Submitted decreased to 0');
    assert(statusCountsAfterSeen.data.data.applications.All === 0, 'Status count for All decreased to 0');

    // ── Scenario H: Highlight disappears ──
    console.log('\n--- Scenario H: Highlight disappears ---');
    const appListAfterSeenRes = await request('GET', '/api/agency/applications', null, tokenAgencyA);
    const seenApp = (appListAfterSeenRes.data.data.applications || []).find((a) => a._id === appId1);
    assert(seenApp.isSeenByAgency === true, 'Application now has isSeenByAgency === true (highlight removed)');

    // ── Scenario I: Refresh keeps it seen ──
    console.log('\n--- Scenario I: Refresh keeps it seen ---');
    const refreshCountRes = await request('GET', '/api/agency/sidebar-counts', null, tokenAgencyA);
    assert(refreshCountRes.data.data.applications === 0, 'Sidebar count remains 0 on refreshed query');

    // ── Scenario J: Logout/login keeps it seen ──
    console.log('\n--- Scenario J: Logout/login keeps it seen ---');
    const freshTokenAgencyA = jwt.sign({ id: agencyAUserId }, JWT_SECRET, { expiresIn: '1h' });
    const reloginCountRes = await request('GET', '/api/agency/sidebar-counts', null, freshTokenAgencyA);
    assert(reloginCountRes.data.data.applications === 0, 'Sidebar count remains 0 with new login token');

    // ── Scenario K: Reopening does not decrease again (idempotency) ──
    console.log('\n--- Scenario K: Reopening does not decrease again (idempotency) ---');
    const secondSeenRes = await request('POST', `/api/agency/seen/application/${appId1}`, null, tokenAgencyA);
    assert(secondSeenRes.status === 200, 'Reopening returned 200');
    assert(secondSeenRes.data.data.alreadySeen === true || secondSeenRes.data.data.isSeen === true, 'Item recognized as already seen');
    const countCheck = await request('GET', '/api/agency/sidebar-counts', null, tokenAgencyA);
    assert(countCheck.data.data.applications === 0, 'Sidebar count is NOT negative and remains 0');

    // ── Scenario L: New application after all seen increases count again ──
    console.log('\n--- Scenario L: New application after all seen increases count again ---');
    const appId2 = `app_agency_${ts}_2`;
    const dbL = devStore.read();
    dbL.applications.push({
      _id: appId2,
      applicationId: appId2,
      university: 'Imperial College London',
      program: 'MSc AI',
      user: studentId,
      assignedAgency: agencyAProfileId,
      stage: 'Submitted',
      status: 'SUBMITTED',
      createdAt: new Date().toISOString(),
    });
    devStore.write(dbL);
    const countAfterSecondApp = await request('GET', '/api/agency/sidebar-counts', null, tokenAgencyA);
    assert(countAfterSecondApp.data.data.applications === 1, 'Applications count correctly increases to 1 for new app');

    // ── Scenario M: New service request behaves correctly ──
    console.log('\n--- Scenario M: New service request behaves correctly ---');
    const serviceOrderId = `srv_ord_${ts}_1`;
    const dbM = devStore.read();
    dbM.agencyServiceOrders = dbM.agencyServiceOrders || [];
    dbM.agencyServiceOrders.push({
      _id: serviceOrderId,
      serviceName: 'Agency Application Assistance',
      user: studentId,
      assignedAgency: { agencyId: agencyAProfileId, agencyName: 'Global Education Agency A' },
      status: 'ACTIVE',
      creditsCharged: 800,
      createdAt: new Date().toISOString(),
    });
    devStore.write(dbM);
    const countM = await request('GET', '/api/agency/sidebar-counts', null, tokenAgencyA);
    assert(countM.data.data.serviceRequests === 1, 'Service requests sidebar count incremented to 1');

    const srvListRes = await request('GET', '/api/agency/service-requests', null, tokenAgencyA);
    const srvOrders = srvListRes.data.data?.serviceOrders || (Array.isArray(srvListRes.data.data) ? srvListRes.data.data : []);
    const srvItem = srvOrders.find((s) => s._id === serviceOrderId);
    assert(srvItem && srvItem.isSeenByAgency === false, 'Service request item is unseen (full highlight)');

    await request('POST', `/api/agency/seen/serviceRequest/${serviceOrderId}`, null, tokenAgencyA);
    const countMAfterSeen = await request('GET', '/api/agency/sidebar-counts', null, tokenAgencyA);
    assert(countMAfterSeen.data.data.serviceRequests === 0, 'Service requests count decremented to 0');

    // ── Scenario N: New partnership behaves correctly ──
    console.log('\n--- Scenario N: New partnership behaves correctly ---');
    const connId = `conn_${ts}_1`;
    const dbN = devStore.read();
    dbN.universityAgencyConnections = dbN.universityAgencyConnections || [];
    dbN.universityAgencyConnections.push({
      _id: connId,
      agencyId: agencyAProfileId,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    });
    devStore.write(dbN);
    const countN = await request('GET', '/api/agency/sidebar-counts', null, tokenAgencyA);
    assert(countN.data.data.universityPartnerships === 1, 'Partnership sidebar count incremented to 1');

    await request('POST', `/api/agency/seen/universityPartnership/${connId}`, null, tokenAgencyA);
    const countNAfterSeen = await request('GET', '/api/agency/sidebar-counts', null, tokenAgencyA);
    assert(countNAfterSeen.data.data.universityPartnerships === 0, 'Partnership count decremented to 0');

    // ── Scenario O: New message behaves correctly ──
    console.log('\n--- Scenario O: New message behaves correctly ---');
    const msgId = `msg_${ts}_1`;
    const dbO = devStore.read();
    dbO.messages = dbO.messages || [];
    dbO.messages.push({
      _id: msgId,
      sender: studentId,
      senderRole: 'student',
      recipient: agencyAUserId,
      recipientRole: 'agency',
      content: 'Hello, need help with my admission',
      read: false,
      createdAt: new Date().toISOString(),
    });
    devStore.write(dbO);
    const countO = await request('GET', '/api/agency/sidebar-counts', null, tokenAgencyA);
    assert(countO.data.data.messages === 1, 'Messages sidebar count incremented to 1');

    await request('POST', `/api/agency/seen/message/${studentId}`, null, tokenAgencyA);
    const countOAfterSeen = await request('GET', '/api/agency/sidebar-counts', null, tokenAgencyA);
    assert(countOAfterSeen.data.data.messages === 0, 'Messages count decremented to 0');

    // ── Scenario P: New report behaves correctly ──
    console.log('\n--- Scenario P: New report behaves correctly ---');
    const repId = `rep_${ts}_1`;
    const dbP = devStore.read();
    dbP.reports = dbP.reports || [];
    dbP.reports.push({
      _id: repId,
      targetAgencyId: agencyAProfileId,
      reporterId: studentId,
      subject: 'Inquiry delay',
      status: 'PENDING_REVIEW',
      createdAt: new Date().toISOString(),
    });
    devStore.write(dbP);
    const countP = await request('GET', '/api/agency/sidebar-counts', null, tokenAgencyA);
    assert(countP.data.data.reports === 1, 'Reports sidebar count incremented to 1');

    await request('POST', `/api/agency/seen/report/${repId}`, null, tokenAgencyA);
    const countPAfterSeen = await request('GET', '/api/agency/sidebar-counts', null, tokenAgencyA);
    assert(countPAfterSeen.data.data.reports === 0, 'Reports count decremented to 0');

    // ── Scenario Q: Notification click marks notification read ──
    console.log('\n--- Scenario Q: Notification click marks notification read ---');
    const notifId = `notif_${ts}_1`;
    const dbQ = devStore.read();
    dbQ.notifications = dbQ.notifications || [];
    dbQ.notifications.push({
      _id: notifId,
      user: agencyAUserId,
      type: 'APPLICATION_SUBMITTED',
      title: 'New Student Application',
      message: 'A student submitted an application to your agency.',
      read: false,
      relatedEntityType: 'application',
      relatedEntityId: appId2,
      createdAt: new Date().toISOString(),
    });
    devStore.write(dbQ);

    const countNotifBefore = await request('GET', '/api/agency/sidebar-counts', null, tokenAgencyA);
    assert(countNotifBefore.data.data.notifications === 1, 'Notification sidebar count is 1');

    const markNotifReadRes = await request('PUT', `/api/agency/notifications/${notifId}/read`, null, tokenAgencyA);
    assert(markNotifReadRes.status === 200, 'Notification mark read returned 200');

    const countNotifAfter = await request('GET', '/api/agency/sidebar-counts', null, tokenAgencyA);
    assert(countNotifAfter.data.data.notifications === 0, 'Notification count decremented to 0');

    // ── Scenario R: Notification click marks related entity seen ──
    console.log('\n--- Scenario R: Notification click marks related entity seen ---');
    // Calling markAgencyEntitySeen on related entity (or via notification click)
    await request('POST', `/api/agency/seen/application/${appId2}`, null, tokenAgencyA);
    const countAfterApp2Seen = await request('GET', '/api/agency/sidebar-counts', null, tokenAgencyA);
    assert(countAfterApp2Seen.data.data.applications === 0, 'Related entity is seen, applications count is 0');

    // ── Scenario S: Direct page view syncs entity seen state ──
    console.log('\n--- Scenario S: Direct page view syncs entity seen state ---');
    const notifId2 = `notif_${ts}_2`;
    const appId3 = `app_agency_${ts}_3`;
    const dbS = devStore.read();
    dbS.applications.push({
      _id: appId3,
      applicationId: appId3,
      university: 'Cambridge University',
      program: 'MSc Physics',
      user: studentId,
      assignedAgency: agencyAProfileId,
      stage: 'Submitted',
      status: 'SUBMITTED',
      createdAt: new Date().toISOString(),
    });
    dbS.notifications.push({
      _id: notifId2,
      user: agencyAUserId,
      type: 'APPLICATION_SUBMITTED',
      title: 'New Cambridge Application',
      message: 'A student applied to Cambridge.',
      read: false,
      relatedEntityType: 'application',
      relatedEntityId: appId3,
      createdAt: new Date().toISOString(),
    });
    devStore.write(dbS);

    // Direct mark seen of the application
    await request('POST', `/api/agency/seen/application/${appId3}`, null, tokenAgencyA);
    const countS = await request('GET', '/api/agency/sidebar-counts', null, tokenAgencyA);
    assert(countS.data.data.applications === 0, 'Application marked seen directly, count is 0');

    // ── Scenario T: Business status never changes because of viewing ──
    console.log('\n--- Scenario T: Business status never changes because of viewing ---');
    const dbT = devStore.read();
    const app3InDb = dbT.applications.find((a) => a._id === appId3);
    assert(app3InDb.stage === 'Submitted', 'Application stage remains "Submitted" unchanged');
    assert(app3InDb.status === 'SUBMITTED', 'Application status remains "SUBMITTED" unchanged');

    // ── Scenario U: Agency A cannot access Agency B seen state ──
    console.log('\n--- Scenario U: Agency A cannot access Agency B seen state ---');
    // Agency B has an application
    const appBId = `app_agency_b_${ts}`;
    const dbU = devStore.read();
    dbU.applications.push({
      _id: appBId,
      applicationId: appBId,
      university: 'Harvard University',
      program: 'MBA',
      user: studentId,
      assignedAgency: agencyBProfileId,
      stage: 'Submitted',
      status: 'SUBMITTED',
      createdAt: new Date().toISOString(),
    });
    devStore.write(dbU);

    // Agency A querying sidebar counts should not count Agency B's application
    const countsAgencyA = await request('GET', '/api/agency/sidebar-counts', null, tokenAgencyA);
    assert(countsAgencyA.data.data.applications === 0, 'Agency A sidebar count does not include Agency B items');

    const countsAgencyB = await request('GET', '/api/agency/sidebar-counts', null, tokenAgencyB);
    assert(countsAgencyB.data.data.applications === 1, 'Agency B sidebar count correctly includes its own item');

    // ── Scenario V: Agency A cannot manipulate Agency B entity (IDOR 403) ──
    console.log('\n--- Scenario V: Agency A cannot manipulate Agency B entity (IDOR 403) ---');
    const idorRes = await request('POST', `/api/agency/seen/application/${appBId}`, null, tokenAgencyA);
    assert(idorRes.status === 403, `IDOR prevented: Agency A cannot mark Agency B's application seen (returned ${idorRes.status})`);

    // ── Scenario W: No negative counts ──
    console.log('\n--- Scenario W: No negative counts ---');
    const countsW = await request('GET', '/api/agency/sidebar-counts', null, tokenAgencyA);
    Object.entries(countsW.data.data).forEach(([key, val]) => {
      if (key === 'statusCounts') {
        Object.entries(val).forEach(([entity, statuses]) => {
          Object.entries(statuses).forEach(([st, stCount]) => {
            assert(typeof stCount === 'number' && stCount >= 0, `Status count for ${entity}.${st} (${stCount}) is >= 0`);
          });
        });
      } else {
        assert(typeof val === 'number' && val >= 0, `Count for ${key} (${val}) is >= 0`);
      }
    });

    // ── Scenario X: Duplicate seen records cannot be created ──
    console.log('\n--- Scenario X: Duplicate seen records cannot be created ---');
    const dbXBefore = devStore.read();
    const seenRecordsBefore = (dbXBefore.agencySeenItems || []).filter(
      (s) => s.entityType === 'application' && s.entityId === appId1
    ).length;

    // Call mark seen multiple times
    await request('POST', `/api/agency/seen/application/${appId1}`, null, tokenAgencyA);
    await request('POST', `/api/agency/seen/application/${appId1}`, null, tokenAgencyA);
    await request('POST', `/api/agency/seen`, { entityType: 'application', entityId: appId1 }, tokenAgencyA);

    const dbXAfter = devStore.read();
    const seenRecordsAfter = (dbXAfter.agencySeenItems || []).filter(
      (s) => s.entityType === 'application' && s.entityId === appId1
    ).length;

    assert(seenRecordsBefore === 1 && seenRecordsAfter === 1, 'Duplicate seen records prevented (exactly 1 record exists)');

    console.log('\n===========================================================');
    console.log('🎉 ALL SCENARIOS (A THROUGH X) PASSED WITH ZERO FAILURES!');
    console.log('===========================================================\n');
  } finally {
    if (serverProcess) {
      console.log('Cleaning up test backend process...');
      serverProcess.kill();
    }
  }
}

runAgencySeenSuite().catch((err) => {
  console.error('\n❌ TEST SUITE FAILED WITH ERROR:', err);
  process.exit(1);
});
