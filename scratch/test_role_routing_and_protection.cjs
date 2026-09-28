/**
 * Test Suite: Role-Based Login Routing & Route Protection
 * 
 * Verifies:
 * 1. Student login routing -> /student/dashboard
 * 2. Agent login routing -> /agent/dashboard
 * 3. Agency login routing -> /agency/dashboard
 * 4. Uni Rep login routing -> /university-rep/dashboard
 * 5. Admin login routing -> /admin/dashboard
 * 6. Agent cannot access Student dashboard -> redirected to /agent/dashboard
 * 7. Student cannot access Agent dashboard -> redirected to /student/dashboard
 * 8. Stale Student session cannot override Agent role -> cleared before login, agent role enforced
 * 9. Wrong credentials do not show success toast -> HTTP 401 'Invalid email or password.', no redirect
 * 10. Suspended Agent blocked -> HTTP 403 suspension message, no dashboard access
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

// Emulate Frontend Route Helpers
function getRoleDashboard(role) {
  const normalized = (role || '').toString().toLowerCase().trim();
  if (normalized === 'agent') return '/agent/dashboard';
  if (normalized === 'agency') return '/agency/dashboard';
  if (
    normalized === 'university_rep' ||
    normalized === 'university' ||
    normalized === 'uni rep' ||
    normalized === 'university representative'
  ) {
    return '/university-rep/dashboard';
  }
  if (normalized === 'admin') return '/admin/dashboard';
  return '/student/dashboard';
}

function isPathAllowedForRole(pathname, role) {
  if (!pathname || typeof pathname !== 'string') return false;
  const normalizedRole = (role || '').toString().toLowerCase().trim();
  const path = pathname.toLowerCase();

  if (
    path === '/' ||
    path.startsWith('/login') ||
    path.startsWith('/register') ||
    path.startsWith('/features') ||
    path.startsWith('/pricing') ||
    path.startsWith('/universities') ||
    path.startsWith('/about') ||
    path.startsWith('/careers') ||
    path.startsWith('/blog') ||
    path.startsWith('/contact')
  ) {
    return false;
  }

  if (normalizedRole === 'student') return path.startsWith('/student');
  if (normalizedRole === 'agent') return path.startsWith('/agent');
  if (normalizedRole === 'agency') return path.startsWith('/agency');
  if (
    normalizedRole === 'university_rep' ||
    normalizedRole === 'university' ||
    normalizedRole === 'uni rep' ||
    normalizedRole === 'university representative'
  ) {
    return path.startsWith('/university-rep') || path.startsWith('/university');
  }
  if (normalizedRole === 'admin') return path.startsWith('/admin');
  return false;
}

// Emulate ProtectedRoute check
function evaluateProtectedRoute(currentPath, allowedRoles, user) {
  if (!user) {
    return { action: 'REDIRECT_TO_LOGIN', destination: currentPath.startsWith('/admin') ? '/admin/login' : '/login' };
  }

  const userRole = (user.role || '').toString().toLowerCase().trim();

  if (allowedRoles && allowedRoles.length > 0) {
    const isAuthorized = allowedRoles.some((r) => r.toString().toLowerCase().trim() === userRole);
    if (!isAuthorized) {
      // Redirect to user's canonical dashboard
      return { action: 'REDIRECT_TO_DASHBOARD', destination: getRoleDashboard(userRole) };
    }
  }

  return { action: 'ALLOW', destination: currentPath };
}

// Emulate Login.jsx handleLogin flow
async function simulateFullLoginFlow(email, password, roleTab, simulatedFromState = null, localStorageState = {}) {
  const toasts = [];
  let navigatedTo = null;

  const toast = {
    success: (msg) => toasts.push({ type: 'success', msg }),
    error: (msg) => toasts.push({ type: 'error', msg }),
  };

  const navigate = (dest) => {
    navigatedTo = dest;
  };

  // AuthContext.login: Purge existing stale session
  delete localStorageState['admify_token'];
  delete localStorageState['admify_user'];
  delete localStorageState['token'];

  const loginEndpoint = roleTab === 'admin' ? '/api/auth/admin/login' : '/api/auth/login';
  const payload = roleTab === 'admin' ? { email, password } : { email, password, role: roleTab };

  try {
    const res = await makeRequest('POST', loginEndpoint, payload);
    if (res.status >= 400) {
      const err = new Error(res.body?.message || 'Login failed');
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

    // Persist new user in store
    const canonicalRole = (rawUser.role || '').toString().toLowerCase().trim();
    const formattedUser = { ...rawUser, role: canonicalRole };
    localStorageState['admify_token'] = token;
    localStorageState['admify_user'] = JSON.stringify(formattedUser);

    toast.success('Welcome back!');

    const defaultDashboard = getRoleDashboard(canonicalRole);
    const requestedPath = simulatedFromState?.pathname;

    if (requestedPath && isPathAllowedForRole(requestedPath, canonicalRole)) {
      navigate(requestedPath);
    } else {
      navigate(defaultDashboard);
    }

    return { success: true, user: formattedUser, toasts, navigatedTo, localStorageState };
  } catch (error) {
    if (error?.status === 401 || error?.data?.status === 401) {
      toast.error('Invalid email or password.');
    } else if (error?.status === 403 || error?.data?.status === 403) {
      toast.error(error?.data?.message || error?.message || 'Account access restricted.');
    } else {
      toast.error(error?.data?.message || error?.message || 'An unexpected error occurred during login.');
    }
    return { success: false, toasts, navigatedTo, localStorageState, error };
  }
}

async function runTests() {
  console.log('================================================================');
  console.log('RUNNING COMPLETE ROLE-BASED LOGIN ROUTING & RBAC TEST SUITE');
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

  const devStore = (await import('../backend/utils/devStore.js')).default;

  const rand = Math.floor(Math.random() * 1000000);
  const password = 'Password123!';

  // Create Users in DevStore for all roles
  console.log('--- Step 0: Seeding test accounts for all roles ---');
  // 1. Student
  const student = await devStore.createUser({
    name: 'Sarah Student',
    email: `student_${rand}@example.com`,
    password,
    role: 'student',
    accountStatus: 'ACTIVE',
    status: 'active',
    isActive: true,
  });

  // 2. Agency
  const agency = await devStore.createUser({
    name: 'Global Agency',
    email: `agency_${rand}@example.com`,
    password,
    role: 'agency',
    accountStatus: 'ACTIVE',
    status: 'active',
    isActive: true,
    agencyVerificationStatus: 'VERIFIED',
  });

  // 3. Agent (Sara Khan)
  const agent = await devStore.createUser({
    name: 'Sara Khan',
    email: `sara_agent_${rand}@example.com`,
    password,
    role: 'agent',
    agencyId: agency._id,
    accountStatus: 'ACTIVE',
    status: 'active',
    isActive: true,
  });

  // 4. Suspended Agent
  const suspendedAgent = await devStore.createUser({
    name: 'Suspended Agent',
    email: `agent_susp_${rand}@example.com`,
    password,
    role: 'agent',
    agencyId: agency._id,
    accountStatus: 'SUSPENDED',
    status: 'suspended',
    isActive: false,
  });

  // 5. Uni Rep
  const uniRep = await devStore.createUser({
    name: 'Dr. John UniRep',
    email: `unirep_${rand}@example.com`,
    password,
    role: 'university_rep',
    accountStatus: 'ACTIVE',
    status: 'active',
    isActive: true,
    uniRepVerificationStatus: 'APPROVED',
  });

  // 6. Admin
  const admin = await devStore.findUserByEmail('admin@admify.world');

  assert('Student created', Boolean(student?._id));
  assert('Agency created', Boolean(agency?._id));
  assert('Agent (Sara Khan) created', Boolean(agent?._id));
  assert('Suspended Agent created', Boolean(suspendedAgent?._id));
  assert('Uni Rep created', Boolean(uniRep?._id));
  assert('Admin verified', Boolean(admin?._id));

  console.log('\n--- 1. Student Login Routing ---');
  const res1 = await simulateFullLoginFlow(student.email, password, 'student');
  assert('Student login succeeds', res1.success);
  assert('Student routed to /student/dashboard', res1.navigatedTo === '/student/dashboard');
  assert('Student sees "Welcome back!"', res1.toasts.some((t) => t.type === 'success' && t.msg === 'Welcome back!'));

  console.log('\n--- 2. Agent (Sara Khan) Login Routing ---');
  // Notice: even if simulatedFromState is /student/dashboard, Agent MUST go to /agent/dashboard!
  const res2 = await simulateFullLoginFlow(agent.email, password, 'agent', { pathname: '/student/dashboard' });
  assert('Agent login succeeds', res2.success);
  assert('Agent NEVER routed to /student/dashboard', res2.navigatedTo !== '/student/dashboard');
  assert('Agent routed to /agent/dashboard despite stale "from: /student/dashboard"', res2.navigatedTo === '/agent/dashboard');
  assert('Agent sees "Welcome back!"', res2.toasts.some((t) => t.type === 'success' && t.msg === 'Welcome back!'));

  console.log('\n--- 3. Agency Login Routing ---');
  const res3 = await simulateFullLoginFlow(agency.email, password, 'agency');
  assert('Agency login succeeds', res3.success);
  assert('Agency routed to /agency/dashboard', res3.navigatedTo === '/agency/dashboard');

  console.log('\n--- 4. Uni Rep Login Routing ---');
  const res4 = await simulateFullLoginFlow(uniRep.email, password, 'university');
  assert('Uni Rep login succeeds', res4.success);
  assert('Uni Rep routed to /university-rep/dashboard', res4.navigatedTo === '/university-rep/dashboard');

  console.log('\n--- 5. Admin Login Routing ---');
  const res5 = await simulateFullLoginFlow('admin@admify.world', 'Admin@123456', 'admin');
  assert('Admin login succeeds', res5.success);
  assert('Admin routed to /admin/dashboard', res5.navigatedTo === '/admin/dashboard');

  console.log('\n--- 6. Agent Cannot Access Student Dashboard (ProtectedRoute) ---');
  const checkAgentOnStudent = evaluateProtectedRoute('/student/dashboard', ['student'], agent);
  assert(
    'Agent is blocked from /student/dashboard',
    checkAgentOnStudent.action === 'REDIRECT_TO_DASHBOARD' && checkAgentOnStudent.destination === '/agent/dashboard'
  );

  console.log('\n--- 7. Student Cannot Access Agent Dashboard (ProtectedRoute) ---');
  const checkStudentOnAgent = evaluateProtectedRoute('/agent/dashboard', ['agent'], student);
  assert(
    'Student is blocked from /agent/dashboard',
    checkStudentOnAgent.action === 'REDIRECT_TO_DASHBOARD' && checkStudentOnAgent.destination === '/student/dashboard'
  );

  const checkStudentOnAgency = evaluateProtectedRoute('/agency/dashboard', ['agency'], student);
  assert(
    'Student is blocked from /agency/dashboard',
    checkStudentOnAgency.action === 'REDIRECT_TO_DASHBOARD' && checkStudentOnAgency.destination === '/student/dashboard'
  );

  const checkAgencyOnAgent = evaluateProtectedRoute('/agent/dashboard', ['agent'], agency);
  assert(
    'Agency is blocked from /agent/dashboard',
    checkAgencyOnAgent.action === 'REDIRECT_TO_DASHBOARD' && checkAgencyOnAgent.destination === '/agency/dashboard'
  );

  console.log('\n--- 8. Stale Student Session Cannot Override Agent Role ---');
  const staleSession = {
    admify_token: 'fake_old_student_token',
    admify_user: JSON.stringify({ role: 'student', name: 'Old Student' }),
  };
  const res8 = await simulateFullLoginFlow(agent.email, password, 'agent', null, staleSession);
  assert('Stale session token replaced', res8.localStorageState.admify_token !== 'fake_old_student_token');
  const savedUser = JSON.parse(res8.localStorageState.admify_user);
  assert('Persisted user has canonical role "agent"', savedUser.role === 'agent');
  assert('Persisted user has name "Sara Khan"', savedUser.name === 'Sara Khan');
  assert('Navigated strictly to /agent/dashboard', res8.navigatedTo === '/agent/dashboard');

  console.log('\n--- 9. Wrong Credentials Toast & Behavior (HTTP 401) ---');
  const res9 = await simulateFullLoginFlow(agent.email, 'WrongPass!', 'agent');
  assert('Wrong credentials fails', !res9.success);
  assert('Never shows "Welcome back!"', !res9.toasts.some((t) => t.type === 'success'));
  assert(
    'Shows "Invalid email or password."',
    res9.toasts.some((t) => t.type === 'error' && t.msg === 'Invalid email or password.')
  );
  assert('Does NOT redirect anywhere', res9.navigatedTo === null);

  console.log('\n--- 10. Suspended Agent Blocked (HTTP 403) ---');
  const res10 = await simulateFullLoginFlow(suspendedAgent.email, password, 'agent');
  assert('Suspended agent login fails', !res10.success);
  assert('Never shows "Welcome back!"', !res10.toasts.some((t) => t.type === 'success'));
  assert(
    'Shows backend suspension message',
    res10.toasts.some((t) =>
      t.type === 'error' &&
      t.msg === 'Your agent account has been suspended or deactivated by your Agency or Admin.'
    )
  );
  assert('Does NOT redirect to any dashboard', res10.navigatedTo === null);

  console.log('\n================================================================');
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((err) => {
  console.error('Fatal error during test run:', err);
  process.exit(1);
});
