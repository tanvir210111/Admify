/**
 * Test Suite: Login Toast & Error Handling Behavior
 * Validates:
 * 1. Invalid credentials (HTTP 401) -> 'Invalid email or password.', never 'Welcome back!', no redirect
 * 2. Suspended Agent (HTTP 403) -> Backend suspension message, no redirect
 * 3. Successful Agent login (HTTP 200) -> 'Welcome back!' & redirect to /agent/dashboard
 * 4. Role mismatch / unapproved / malformed requests -> Real backend error, never success toast
 */

const http = require('http');

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
        } catch (e) {
          resolve({ status: res.statusCode, raw });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

/**
 * Simulates frontend handleLogin & AuthContext.login logic
 */
async function simulateFrontendLogin(email, password, role) {
  const toasts = [];
  let navigatedTo = null;

  const toast = {
    success: (msg) => toasts.push({ type: 'success', msg }),
    error: (msg) => toasts.push({ type: 'error', msg }),
  };

  const navigate = (dest) => {
    navigatedTo = dest;
  };

  // AuthContext.login simulation (matching our updated AuthContext.jsx)
  const login = async (e, p, r) => {
    const res = await makeRequest('POST', '/api/auth/login', { email: e, password: p, role: r });
    if (res.status >= 400) {
      const err = new Error(res.body?.message || `Request failed with status ${res.status}`);
      err.status = res.status;
      err.data = res.body;
      throw err;
    }
    const token = res.body?.data?.token || res.body?.token;
    const rawUser = res.body?.data?.user || res.body?.user;
    if (!res.body || res.body.success === false || !token || !rawUser) {
      const err = new Error(res.body?.message || 'Invalid email or password.');
      err.status = res.status || 401;
      err.data = res.body;
      throw err;
    }
    return res.body;
  };

  // Login.jsx handleLogin simulation (matching our updated Login.jsx)
  try {
    const res = await login(email, password, role);
    const token = res?.data?.token || res?.token;
    if (!token) {
      throw new Error(res?.message || 'Invalid email or password.');
    }
    toast.success('Welcome back!');
    if (role === 'student') navigate('/student/dashboard');
    else if (role === 'agent') navigate('/agent/dashboard');
    else if (role === 'agency') navigate('/agency/dashboard');
    else if (role === 'university') navigate('/university/dashboard');
  } catch (error) {
    if (error?.status === 401 || error?.data?.status === 401) {
      toast.error('Invalid email or password.');
    } else if (error?.status === 403 || error?.data?.status === 403) {
      toast.error(error?.data?.message || error?.message || 'Account access restricted.');
    } else {
      toast.error(error?.data?.message || error?.message || 'An unexpected error occurred during login.');
    }
  }

  return { toasts, navigatedTo };
}

async function runTests() {
  console.log('================================================================');
  console.log('RUNNING LOGIN TOAST & AUTHENTICATION BEHAVIOR TEST SUITE');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(name, condition, details = '') {
    if (condition) {
      console.log(`[PASS] ${name}`);
      passed++;
    } else {
      console.error(`[FAIL] ${name} - ${details}`);
      failed++;
    }
  }

  // Load devStore to seed test users cleanly
  const devStore = (await import('../backend/utils/devStore.js')).default;

  const rand = Math.floor(Math.random() * 1000000);
  const agencyEmail = `agency_toast_${rand}@example.com`;
  const agentEmail = `agent_toast_${rand}@example.com`;
  const suspendedAgentEmail = `agent_susp_${rand}@example.com`;
  const defaultPassword = 'Password123!';

  console.log('--- Step 1: Setting up accounts in store ---');
  // 1. Create Agency
  const agencyUser = await devStore.createUser({
    name: 'Toast Test Agency',
    email: agencyEmail,
    password: defaultPassword,
    role: 'agency',
    accountStatus: 'ACTIVE',
    status: 'active',
    isActive: true,
    emailVerified: true,
    agencyVerificationStatus: 'VERIFIED',
  });
  assert('Agency created in store', Boolean(agencyUser?._id));

  // 2. Create Active Agent
  const activeAgent = await devStore.createUser({
    name: 'Active Agent',
    email: agentEmail,
    password: defaultPassword,
    role: 'agent',
    agencyId: agencyUser._id,
    accountStatus: 'ACTIVE',
    status: 'active',
    isActive: true,
    emailVerified: true,
  });
  assert('Active Agent created in store', Boolean(activeAgent?._id));

  // 3. Create Suspended Agent
  const suspendedAgent = await devStore.createUser({
    name: 'Suspended Agent',
    email: suspendedAgentEmail,
    password: defaultPassword,
    role: 'agent',
    agencyId: agencyUser._id,
    accountStatus: 'SUSPENDED',
    status: 'suspended',
    isActive: false,
    emailVerified: true,
  });
  assert('Suspended Agent created in store', Boolean(suspendedAgent?._id));

  console.log('\n--- Step 2: Testing Incorrect Agent Credentials (HTTP 401) ---');
  // Scenario A: Wrong password
  const simWrongPass = await simulateFrontendLogin(agentEmail, 'WrongPassword999!', 'agent');
  assert(
    'Incorrect password NEVER shows "Welcome back!"',
    !simWrongPass.toasts.some((t) => t.type === 'success' || t.msg.includes('Welcome back'))
  );
  assert(
    'Incorrect password shows "Invalid email or password."',
    simWrongPass.toasts.some((t) => t.type === 'error' && t.msg === 'Invalid email or password.')
  );
  assert(
    'Incorrect password does NOT redirect',
    simWrongPass.navigatedTo === null
  );

  // Scenario B: Non-existent agent email
  const simWrongEmail = await simulateFrontendLogin('does_not_exist_agent@nowhere.com', 'SomePass123!', 'agent');
  assert(
    'Non-existent agent NEVER shows "Welcome back!"',
    !simWrongEmail.toasts.some((t) => t.type === 'success' || t.msg.includes('Welcome back'))
  );
  assert(
    'Non-existent agent shows "Invalid email or password."',
    simWrongEmail.toasts.some((t) => t.type === 'error' && t.msg === 'Invalid email or password.')
  );
  assert(
    'Non-existent agent does NOT redirect',
    simWrongEmail.navigatedTo === null
  );

  console.log('\n--- Step 3: Testing Suspended Agent Login (HTTP 403) ---');
  const simSuspAgent = await simulateFrontendLogin(suspendedAgentEmail, defaultPassword, 'agent');
  assert(
    'Suspended Agent NEVER shows "Welcome back!"',
    !simSuspAgent.toasts.some((t) => t.type === 'success' || t.msg.includes('Welcome back'))
  );
  assert(
    'Suspended Agent shows backend suspension message',
    simSuspAgent.toasts.some((t) =>
      t.type === 'error' &&
      t.msg === 'Your agent account has been suspended or deactivated by your Agency or Admin.'
    ),
    JSON.stringify(simSuspAgent.toasts)
  );
  assert(
    'Suspended Agent does NOT redirect',
    simSuspAgent.navigatedTo === null
  );

  console.log('\n--- Step 4: Testing Successful Agent Login (HTTP 200) ---');
  const simValidAgent = await simulateFrontendLogin(agentEmail, defaultPassword, 'agent');
  assert(
    'Valid Agent shows "Welcome back!"',
    simValidAgent.toasts.some((t) => t.type === 'success' && t.msg === 'Welcome back!')
  );
  assert(
    'Valid Agent does NOT show error toast',
    !simValidAgent.toasts.some((t) => t.type === 'error')
  );
  assert(
    'Valid Agent redirects to /agent/dashboard',
    simValidAgent.navigatedTo === '/agent/dashboard'
  );

  console.log('\n--- Step 5: Testing Role Mismatch (HTTP 403) ---');
  // Agent logging in under 'student' role tab
  const simRoleMismatch = await simulateFrontendLogin(agentEmail, defaultPassword, 'student');
  assert(
    'Role mismatch NEVER shows "Welcome back!"',
    !simRoleMismatch.toasts.some((t) => t.type === 'success' || t.msg.includes('Welcome back'))
  );
  assert(
    'Role mismatch shows backend role mismatch message',
    simRoleMismatch.toasts.some((t) => t.type === 'error' && t.msg.includes("registered as 'agent', not 'student'"))
  );
  assert(
    'Role mismatch does NOT redirect',
    simRoleMismatch.navigatedTo === null
  );

  console.log('\n--- Step 6: Testing Missing Fields (HTTP 400) ---');
  const simMissing = await simulateFrontendLogin('', '', 'agent');
  assert(
    'Missing fields NEVER shows "Welcome back!"',
    !simMissing.toasts.some((t) => t.type === 'success')
  );
  assert(
    'Missing fields shows actual backend error message',
    simMissing.toasts.some((t) => t.type === 'error' && t.msg.includes('Please provide both email and password'))
  );

  console.log('\n================================================================');
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((err) => {
  console.error('Fatal error during test run:', err);
  process.exit(1);
});
