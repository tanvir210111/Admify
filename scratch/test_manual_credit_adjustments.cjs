const http = require('http');

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('=== STARTING MANUAL CREDIT ADJUSTMENT TEST SUITE ===');
  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
    }
  }

  // 1. Authenticate Admin
  console.log('\nStep 1: Authenticate Admin');
  const adminLogin = await request(
    {
      hostname: 'localhost',
      port: 5001,
      path: '/api/auth/admin/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: 'admin@admify.world', password: 'Admin@123456' }
  );

  let adminToken = adminLogin.body?.token || adminLogin.body?.data?.token;

  assert(Boolean(adminToken), 'Admin authenticated and received JWT');

  // 2. Register a new test Student
  console.log('\nStep 2: Register test student');
  const rand = Math.floor(1000 + Math.random() * 9000);
  const studentEmail = `student.adj.test.${Date.now()}.${rand}@admify.world`;
  const regRes = await request(
    {
      hostname: 'localhost',
      port: 5001,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    {
      name: `Test Adj Student ${rand}`,
      email: studentEmail,
      password: 'Password123!',
      phone: `+880170000${rand}`,
      role: 'student',
    }
  );

  const studentUser = regRes.body?.user || regRes.body?.data?.user;
  const studentToken = regRes.body?.token || regRes.body?.data?.token;
  assert(Boolean(studentUser?._id), 'Student registered successfully');
  assert(studentUser?.walletCredits === 20, 'Student starts with 20 welcome credits');

  const studentId = studentUser?._id;

  // 3. Test RBAC: Non-admin calls adjustUserCredits
  console.log('\nStep 3: RBAC enforcement');
  const unauthRes = await request(
    {
      hostname: 'localhost',
      port: 5001,
      path: '/api/admin/credits/adjust',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { userId: studentId, amount: 50, action: 'ADD', reason: 'Attempt unauthorized add' }
  );
  assert(unauthRes.status === 401, 'Unauthenticated request rejected with 401 Unauthorized');

  const studentCallRes = await request(
    {
      hostname: 'localhost',
      port: 5001,
      path: '/api/admin/credits/adjust',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
    },
    { userId: studentId, amount: 50, action: 'ADD', reason: 'Attempt student role add' }
  );
  assert(studentCallRes.status === 403, 'Student role request rejected with 403 Forbidden');

  // 4. Test Validation: Invalid amounts, missing reasons, non-student targets
  console.log('\nStep 4: Payload Validation');
  const missingReasonRes = await request(
    {
      hostname: 'localhost',
      port: 5001,
      path: '/api/admin/credits/adjust',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
    },
    { userId: studentId, amount: 50, action: 'ADD', reason: '' }
  );
  assert(missingReasonRes.status === 400, 'Missing reason rejected with 400 Bad Request');

  const shortReasonRes = await request(
    {
      hostname: 'localhost',
      port: 5001,
      path: '/api/admin/credits/adjust',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
    },
    { userId: studentId, amount: 50, action: 'ADD', reason: 'bad' }
  );
  assert(shortReasonRes.status === 400, 'Reason < 5 chars rejected with 400 Bad Request');

  const zeroAmountRes = await request(
    {
      hostname: 'localhost',
      port: 5001,
      path: '/api/admin/credits/adjust',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
    },
    { userId: studentId, amount: 0, action: 'ADD', reason: 'Valid reason here' }
  );
  assert(zeroAmountRes.status === 400, 'Zero amount rejected with 400 Bad Request');

  const decimalAmountRes = await request(
    {
      hostname: 'localhost',
      port: 5001,
      path: '/api/admin/credits/adjust',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
    },
    { userId: studentId, amount: 15.5, action: 'ADD', reason: 'Valid reason here' }
  );
  assert(decimalAmountRes.status === 400, 'Non-integer decimal amount rejected with 400 Bad Request');

  // 5. Test Admin ADD credits
  console.log('\nStep 5: Admin ADD 50 CR');
  const addRes = await request(
    {
      hostname: 'localhost',
      port: 5001,
      path: '/api/admin/credits/adjust',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
    },
    {
      userId: studentId,
      action: 'ADD',
      amount: 50,
      creditType: 'paid',
      reason: 'Promotional credit bonus for high GPA applicant',
      note: 'Verified transcripts on file',
    }
  );

  assert(addRes.status === 200, 'Admin ADD credits succeeded with 200 OK');
  assert(addRes.body?.data?.balanceBefore === 20, 'balanceBefore is 20 CR');
  assert(addRes.body?.data?.balanceAfter === 70, 'balanceAfter is 70 CR (20 + 50)');
  assert(addRes.body?.data?.transaction?.direction === 'CREDIT', 'transaction direction is CREDIT');
  assert(addRes.body?.data?.transaction?.credits === 50, 'transaction credits is +50');
  assert(Boolean(addRes.body?.data?.transaction?.adminName), 'transaction includes adminName');

  // 6. Test Duplicate Request Protection (Double-click guard)
  console.log('\nStep 6: Duplicate request protection (2.5s window)');
  const dupRes = await request(
    {
      hostname: 'localhost',
      port: 5001,
      path: '/api/admin/credits/adjust',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
    },
    {
      userId: studentId,
      action: 'ADD',
      amount: 50,
      creditType: 'paid',
      reason: 'Promotional credit bonus for high GPA applicant',
    }
  );
  assert(dupRes.status === 409, 'Immediate duplicate request rejected with 409 Conflict');

  // 7. Verify Student Wallet Endpoint (student view)
  console.log('\nStep 7: Verify Student Wallet');
  const studentWalletRes = await request({
    hostname: 'localhost',
    port: 5001,
    path: '/api/wallet',
    method: 'GET',
    headers: {
      Authorization: `Bearer ${studentToken}`,
    },
  });
  assert(studentWalletRes.status === 200, 'Student wallet fetched with 200 OK');
  assert(studentWalletRes.body?.data?.availableCredits === 70, 'Student wallet shows 70 CR available');
  assert(studentWalletRes.body?.data?.paidCredits === 50, 'Student wallet shows 50 paidCredits');
  assert(studentWalletRes.body?.data?.freeCredits === 20, 'Student wallet shows 20 freeCredits');

  // 8. Test Admin REMOVE credits within balance
  console.log('\nStep 8: Admin REMOVE 10 CR');
  const removeRes = await request(
    {
      hostname: 'localhost',
      port: 5001,
      path: '/api/admin/credits/adjust',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
    },
    {
      userId: studentId,
      action: 'REMOVE',
      amount: 10,
      reason: 'Duplicate credit correction by admin',
    }
  );
  assert(removeRes.status === 200, 'Admin REMOVE credits succeeded with 200 OK');
  assert(removeRes.body?.data?.balanceBefore === 70, 'balanceBefore is 70 CR');
  assert(removeRes.body?.data?.balanceAfter === 60, 'balanceAfter is 60 CR (70 - 10)');
  assert(removeRes.body?.data?.transaction?.direction === 'DEBIT', 'transaction direction is DEBIT');
  assert(removeRes.body?.data?.transaction?.credits === -10, 'transaction credits is -10');

  // 9. Test REMOVE exceeding available balance
  console.log('\nStep 9: REMOVE exceeding balance (try removing 100 CR from 60 CR)');
  const exceedRes = await request(
    {
      hostname: 'localhost',
      port: 5001,
      path: '/api/admin/credits/adjust',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
    },
    {
      userId: studentId,
      action: 'REMOVE',
      amount: 100,
      reason: 'Attempt excessive withdrawal',
    }
  );
  assert(exceedRes.status === 400, 'REMOVE exceeding balance rejected with 400 Bad Request');
  assert(
    exceedRes.body?.message?.includes('Cannot remove 100 CR'),
    'Error message explains insufficient balance'
  );

  // 10. Verify Admin Central Users Endpoint
  console.log('\nStep 10: Verify Admin Central Users (GET /api/admin/users/:id)');
  const adminUserRes = await request({
    hostname: 'localhost',
    port: 5001,
    path: `/api/admin/users/${studentId}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${adminToken}`,
    },
  });
  assert(adminUserRes.status === 200, 'Admin user details fetched with 200 OK');
  assert(adminUserRes.body?.data?.user?.walletCredits === 60, 'User walletCredits in Central Users is 60 CR');

  const txs = adminUserRes.body?.data?.related?.creditTransactions || [];
  assert(txs.length >= 3, `Central Users shows full history (found ${txs.length} transactions)`);
  assert(txs[0].type === 'ADMIN_ADJUSTMENT' && txs[0].credits === -10, 'Latest tx is -10 CR ADMIN_ADJUSTMENT');
  assert(txs[1].type === 'ADMIN_ADJUSTMENT' && txs[1].credits === 50, 'Second tx is +50 CR ADMIN_ADJUSTMENT');
  assert(txs[2].type === 'WELCOME_CREDIT' && txs[2].credits === 20, 'Initial tx is +20 CR WELCOME_CREDIT');

  // 11. Verify Admin Wallet Ledger API (GET /api/admin/credits/transactions)
  console.log('\nStep 11: Verify Admin Wallet Ledger (GET /api/admin/credits/transactions)');
  const ledgerRes = await request({
    hostname: 'localhost',
    port: 5001,
    path: `/api/admin/credits/transactions?user=${studentId}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${adminToken}`,
    },
  });
  const ledgerTxs = ledgerRes.body?.data?.transactions || [];
  assert(ledgerTxs.length >= 3, `Ledger returns all ${ledgerTxs.length} entries for student`);
  const debitTx = ledgerTxs.find((t) => t.direction === 'DEBIT');
  assert(Boolean(debitTx), 'Ledger includes DEBIT transaction');
  assert(debitTx?.reason === 'Duplicate credit correction by admin', 'Ledger record preserves audit reason');
  assert(Boolean(debitTx?.adminName), 'Ledger record preserves adminName');

  // 12. Verify Audit Log Event ADMIN_CREDIT_ADJUSTMENT
  console.log('\nStep 12: Verify Audit Logs (GET /api/admin/audit-logs)');
  const auditRes = await request({
    hostname: 'localhost',
    port: 5001,
    path: '/api/admin/audit-logs?limit=10',
    method: 'GET',
    headers: {
      Authorization: `Bearer ${adminToken}`,
    },
  });
  const logs = auditRes.body?.data?.logs || auditRes.body?.logs || [];
  const creditAudit = logs.find(
    (l) => l.action === 'ADMIN_CREDIT_ADJUSTMENT' && l.targetId === studentId
  );
  assert(Boolean(creditAudit), 'ADMIN_CREDIT_ADJUSTMENT audit log entry created');
  assert(
    creditAudit?.reason === 'Duplicate credit correction by admin',
    'Audit log contains administrative reason'
  );

  console.log(`\n========================================`);
  console.log(`SUMMARY: ${passed} / ${total} tests passed.`);
  console.log(`========================================\n`);

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
