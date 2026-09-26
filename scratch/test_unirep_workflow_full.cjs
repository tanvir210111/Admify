const http = require('http');
const assert = require('assert');

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, text: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTestSuite() {
  console.log('=== STARTING COMPLETE WORKFLOW TEST: REJECT STATUS PERSISTENCE & DELETION ===\n');

  // 1. Authenticate Admin
  console.log('1. Authenticating Admin...');
  const loginRes = await request(
    {
      hostname: 'localhost',
      port: 5001,
      path: '/api/auth/admin/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: 'admin@admify.world', password: 'Admin@123456' }
  );
  assert.strictEqual(loginRes.status, 200, 'Admin login must succeed');
  const token = loginRes.data?.data?.token || loginRes.data?.token;
  assert(token, 'Admin token required');
  console.log('✔ PASS: Admin authenticated.\n');

  // 2. Fetch list and locate a PROFILE_INCOMPLETE or PENDING legacy record
  console.log('2. Fetching Uni Rep list...');
  const listRes = await request({
    hostname: 'localhost',
    port: 5001,
    path: '/api/admin/university-rep-applications',
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.strictEqual(listRes.status, 200, 'List request must succeed');
  const apps = listRes.data?.data?.applications || listRes.data?.applications || [];
  console.log(`Found ${apps.length} total applications.`);

  // Find a target record
  let target = apps.find(a => a.status === 'PROFILE_INCOMPLETE' || a.profileStatus === 'PROFILE_INCOMPLETE');
  if (!target) {
    target = apps.find(a => a.status === 'PENDING');
  }
  assert(target, 'Must find a candidate application for testing');
  console.log(`Target Uni Rep for test:
  _id: ${target._id}
  ApplicationId: ${target.applicationId}
  Name: ${target.representative?.fullName || target.user?.name}
  Initial Status: ${target.status}
  ProfileStatus: ${target.profileStatus}
  `);

  // 3. Verify DELETE on non-rejected record returns 409
  console.log('3. Attempting DELETE before rejection...');
  const deleteBlockedRes = await request({
    hostname: 'localhost',
    port: 5001,
    path: `/api/admin/university-rep-applications/${target._id}`,
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log(`Status: ${deleteBlockedRes.status} (Expected: 409)`);
  assert.strictEqual(deleteBlockedRes.status, 409, 'Must return 409 Conflict');
  console.log(`Response message: "${deleteBlockedRes.data?.message}"`);
  console.log('✔ PASS: Deletion blocked before rejection.\n');

  // 4. Reject the target application
  console.log('4. Calling POST /api/admin/university-rep-applications/:id/reject ...');
  const rejectRes = await request(
    {
      hostname: 'localhost',
      port: 5001,
      path: `/api/admin/university-rep-applications/${target._id}/reject`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
    {
      rejectionReason: 'Missing official university credential credentials and employee badge.',
      adminNotes: 'Candidate failed institutional email verification.',
    }
  );
  console.log(`Status: ${rejectRes.status} (Expected: 200)`);
  assert.strictEqual(rejectRes.status, 200, 'Rejection must succeed with 200');
  const rejectedApp = rejectRes.data?.data?.application || rejectRes.data?.application;
  console.log(`Returned application status: ${rejectedApp?.status}`);
  assert.strictEqual(rejectedApp?.status, 'REJECTED', 'Returned application status must be REJECTED');
  console.log('✔ PASS: Rejection endpoint returned status REJECTED.\n');

  // 5. Test status persistence on single record inspection GET /:id
  console.log('5. Verifying single record inspection GET /:id ...');
  const inspectRes = await request({
    hostname: 'localhost',
    port: 5001,
    path: `/api/admin/university-rep-applications/${target._id}`,
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.strictEqual(inspectRes.status, 200);
  const inspected = inspectRes.data?.data?.application || inspectRes.data?.application;
  console.log(`Persisted status in GET /:id: ${inspected?.status}`);
  console.log(`Persisted profileStatus: ${inspected?.profileStatus}`);
  assert.strictEqual(inspected?.status, 'REJECTED', 'GET /:id must return REJECTED status');
  assert.strictEqual(inspected?.profileStatus, 'REJECTED', 'profileStatus must also be REJECTED');
  console.log('✔ PASS: Status persisted as REJECTED in GET /:id.\n');

  // 6. Test status persistence on full list refresh GET /api/admin/university-rep-applications
  console.log('6. Verifying fresh list fetch GET /api/admin/university-rep-applications ...');
  const refreshListRes = await request({
    hostname: 'localhost',
    port: 5001,
    path: '/api/admin/university-rep-applications',
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.strictEqual(refreshListRes.status, 200);
  const refreshedApps = refreshListRes.data?.data?.applications || refreshListRes.data?.applications || [];
  const refreshedTarget = refreshedApps.find(a => a._id === target._id);
  assert(refreshedTarget, 'Target record must exist in refreshed list');
  console.log(`Refreshed row status: ${refreshedTarget.status}`);
  console.log(`Refreshed row profileStatus: ${refreshedTarget.profileStatus}`);
  assert.strictEqual(refreshedTarget.status, 'REJECTED', 'Row in refreshed list must be REJECTED');
  assert.strictEqual(refreshedTarget.profileStatus, 'REJECTED', 'profileStatus must be REJECTED');
  console.log('✔ PASS: Status persisted as REJECTED in full list fetch.\n');

  // 7. Verify filtering
  console.log('7. Verifying status filter queries...');
  const rejectedFilterRes = await request({
    hostname: 'localhost',
    port: 5001,
    path: '/api/admin/university-rep-applications?status=REJECTED',
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  const rejectedList = rejectedFilterRes.data?.data?.applications || rejectedFilterRes.data?.applications || [];
  const foundInRejected = rejectedList.some(a => a._id === target._id);
  assert(foundInRejected, 'Target MUST appear in ?status=REJECTED filter');
  console.log(`✔ PASS: Record correctly appears in ?status=REJECTED filter (count: ${rejectedList.length})`);

  const incompleteFilterRes = await request({
    hostname: 'localhost',
    port: 5001,
    path: '/api/admin/university-rep-applications?status=PROFILE_INCOMPLETE',
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  const incompleteList = incompleteFilterRes.data?.data?.applications || incompleteFilterRes.data?.applications || [];
  const foundInIncomplete = incompleteList.some(a => a._id === target._id);
  assert(!foundInIncomplete, 'Target must NOT appear in ?status=PROFILE_INCOMPLETE filter');
  console.log(`✔ PASS: Record correctly excluded from ?status=PROFILE_INCOMPLETE filter (count: ${incompleteList.length})\n`);

  // 8. Delete the rejected record
  console.log('8. Calling DELETE /api/admin/university-rep-applications/:id on REJECTED record...');
  const deleteRes = await request({
    hostname: 'localhost',
    port: 5001,
    path: `/api/admin/university-rep-applications/${target._id}`,
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log(`Status: ${deleteRes.status} (Expected: 200)`);
  assert.strictEqual(deleteRes.status, 200, 'DELETE on rejected record must succeed');
  console.log(`Response message: "${deleteRes.data?.message}"`);
  console.log('✔ PASS: Rejected record permanently deleted.\n');

  // 9. Verify record is permanently gone
  console.log('9. Verifying record disappeared from list...');
  const finalListRes = await request({
    hostname: 'localhost',
    port: 5001,
    path: '/api/admin/university-rep-applications',
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  const finalApps = finalListRes.data?.data?.applications || finalListRes.data?.applications || [];
  const stillExists = finalApps.some(a => a._id === target._id);
  assert(!stillExists, 'Deleted record must not appear in list');
  console.log(`✔ PASS: Record no longer in list. Total remaining: ${finalApps.length}\n`);

  // 10. Verify Universities catalog intact
  console.log('10. Verifying university catalog remains intact...');
  const uniRes = await request({
    hostname: 'localhost',
    port: 5001,
    path: '/api/admin/audit-logs',
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.strictEqual(uniRes.status, 200);
  const auditLogs = uniRes.data?.data?.logs || uniRes.data?.logs || [];
  const deleteLog = auditLogs.find(l => l.action === 'ADMIN_DELETE_UNIREP');
  assert(deleteLog, 'ADMIN_DELETE_UNIREP audit log must exist');
  console.log(`✔ PASS: Immutable audit log verified: [${deleteLog.action}] Target: ${deleteLog.targetName}`);

  console.log('\n======================================================');
  console.log('🎉 ALL 10 TESTS FOR REJECT STATUS & DELETION PASSED!');
  console.log('======================================================\n');
}

runTestSuite().catch((err) => {
  console.error('\n❌ TEST FAILED:', err);
  process.exit(1);
});
