process.env.NODE_PATH = 'backend/node_modules';
require('module').Module._initPaths();

async function run() {
  const adminController = await import('../backend/controllers/adminController.js');
  
  const tests = [
    { name: '1. Dashboard / Stats', fn: 'getAdminStats', query: {} },
    { name: '2. Central Users', fn: 'getAdminUsers', query: { role: 'all', status: 'all', search: '' } },
    { name: '3. Students', fn: 'getAdminUsers', query: { role: 'student', status: 'all', search: '' } },
    { name: '4. Agencies (Verifications)', fn: 'getAllAgencyVerifications', query: { status: 'all' } },
    { name: '5. Agents (Applications)', fn: 'getAdminAgentApplications', query: { status: 'ALL' } },
    { name: '6. University Reps (Applications)', fn: 'getAdminUniRepApplications', query: { status: 'all' } },
    { name: '7. Universities', fn: 'getAdminUniversities', query: { country: 'all', search: '' } },
    { name: '8. Applications', fn: 'getAdminApplications', query: { stage: 'all', search: '' } },
    { name: '9. Partnerships', fn: 'getAdminPartnerships', query: { status: 'all' } },
    { name: '10. Payments (Orders)', fn: 'getAllPaymentOrders', query: { status: 'all' } },
    { name: '11. Wallet & Credits (Tx)', fn: 'getAdminCreditTransactions', query: { type: 'all', search: '' } },
    { name: '12. Coupons', fn: 'getAdminCoupons', query: { search: '' } },
    { name: '13. Scholarships', fn: 'getAdminScholarships', query: { search: '' } },
    { name: '14. Countries', fn: 'getAdminCountries', query: { search: '', status: 'all' } },
    { name: '15. Reports & Complaints', fn: 'getAdminReports', query: { status: 'all' } },
    { name: '16. Support Conversations', fn: 'getAdminSupportConversations', query: {} },
    { name: '17. Notifications', fn: 'getAdminNotifications', query: {} },
    { name: '18. AI Metrics', fn: 'getAdminAIMetrics', query: {} },
    { name: '19. Audit Logs', fn: 'getAdminAuditLogs', query: { module: 'all' } },
    { name: '20. Admin Accounts', fn: 'getAdminAccounts', query: {} },
    { name: '21. Platform Settings', fn: 'getAdminPlatformSettings', query: {} },
    { name: '22. Global Search', fn: 'globalAdminSearch', query: { q: 'admin' } },
  ];

  console.log('Testing all 22 admin controller methods against local runtime...');
  
  for (const t of tests) {
    if (typeof adminController[t.fn] !== 'function') {
      console.error(`[FAIL] ${t.name}: Function ${t.fn} not found in adminController!`);
      continue;
    }

    let resultStatus = null;
    let resultBody = null;
    let capturedError = null;

    const req = {
      query: t.query,
      params: {},
      body: {},
      user: { _id: 'admin_test_id', role: 'admin', name: 'Super Admin' },
    };

    const res = {
      status: (code) => {
        resultStatus = code;
        return {
          json: (body) => {
            resultBody = body;
          }
        };
      },
      json: (body) => {
        resultStatus = 200;
        resultBody = body;
      }
    };

    const next = (err) => {
      capturedError = err;
    };

    try {
      await adminController[t.fn](req, res, next);
      if (capturedError) {
        console.error(`[FAIL] ${t.name} -> threw error:`, capturedError.message || capturedError);
      } else {
        const keys = resultBody?.data ? Object.keys(resultBody.data) : [];
        console.log(`[PASS] ${t.name} -> Status: ${resultStatus} | success: ${resultBody?.success} | keys: [${keys.join(', ')}] | count: ${resultBody?.count ?? resultBody?.total ?? 'N/A'}`);
      }
    } catch (e) {
      console.error(`[CRASH] ${t.name} -> Exception:`, e.message);
    }
  }
}

run();
