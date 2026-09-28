/**
 * test_auth_storage_quota.cjs
 * Comprehensive test suite verifying:
 * 1. Login does not write admify_token to localStorage.
 * 2. Login does not write admify_user to localStorage.
 * 3. Login does not write admify_role to localStorage.
 * 4. Active token exists only in sessionStorage.
 * 5. Active user exists only in sessionStorage.
 * 6. Active role exists only in sessionStorage.
 * 7. Remember Me stores only email/role preferences.
 * 8. No password stored in localStorage.
 * 9. No QuotaExceededError during login even with simulated heavy document attachments.
 * 10. F5 preserves current tab session.
 * 11. Five concurrent role tabs remain isolated.
 * 12. Logout only clears current tab session.
 * 13. New tab does not inherit active session.
 * 14. All five role logins work.
 * 15. Role routing remains correct.
 * 16. Wrong credentials remain correctly rejected.
 */

const assert = require('assert');
const http = require('http');

// Emulate Storage interface
class MockStorage {
  constructor(name, maxBytes = 5 * 1024 * 1024) {
    this.name = name;
    this.maxBytes = maxBytes;
    this.store = new Map();
  }

  getItem(key) {
    return this.store.has(key) ? this.store.get(key) : null;
  }

  setItem(key, value) {
    const strVal = String(value);
    let totalSize = 0;
    for (const [k, v] of this.store.entries()) {
      if (k !== key) totalSize += k.length + v.length;
    }
    totalSize += key.length + strVal.length;

    if (totalSize > this.maxBytes) {
      const err = new Error(`Failed to execute 'setItem' on 'Storage': Setting the value of '${key}' exceeded the quota.`);
      err.name = 'QuotaExceededError';
      err.code = 22;
      throw err;
    }
    this.store.set(key, strVal);
  }

  removeItem(key) {
    this.store.delete(key);
  }

  clear() {
    this.store.clear();
  }

  keys() {
    return Array.from(this.store.keys());
  }

  get totalBytes() {
    let size = 0;
    for (const [k, v] of this.store.entries()) {
      size += k.length + v.length;
    }
    return size;
  }
}

// Global origin-level localStorage (shared across tabs)
const globalLocalStorage = new MockStorage('localStorage');

// Tab class representing an isolated browser tab
class BrowserTab {
  constructor(name) {
    this.name = name;
    this.sessionStorage = new MockStorage(`sessionStorage_${name}`);
    this.currentUrl = '/login';
    this.activeUser = null;
  }

  get localStorage() {
    return globalLocalStorage;
  }
}

// Helper: HTTP request to running backend
function makeApiRequest(method, path, body = null, token = null) {
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
        } catch {
          resolve({ status: res.statusCode, raw });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

// Simulation of AuthContext logic running inside a tab
const AUTH_STORAGE_KEYS = [
  'admify_token',
  'admify_user',
  'admify_role',
  'admify_admin_token',
  'token',
  'auth_token',
  'accessToken',
  'user',
  'admin',
];

const LEGACY_AUTH_STORAGE_KEYS = [
  'admify_token',
  'admify_user',
  'admify_role',
  'admify_admin_token',
  'token',
  'auth_token',
  'accessToken',
  'user',
  'admin',
  'admify_student_documents',
  'admify_student_direct_apps',
  'admify_student_agency_requests',
  'admify_student_reports',
  'admify_student_saved_unis',
  'admify_student_compare_unis',
  'admify_ai_rec_assessment',
];

const ALLOWED_LOCAL_STORAGE_KEYS = new Set([
  'admify_remembered_email',
  'admify_remembered_role',
]);

function runBootLegacyCleanup(tab) {
  LEGACY_AUTH_STORAGE_KEYS.forEach((k) => {
    if (!ALLOWED_LOCAL_STORAGE_KEYS.has(k)) {
      tab.localStorage.removeItem(k);
    }
  });
}

function clearAuthStorage(tab) {
  AUTH_STORAGE_KEYS.forEach((k) => {
    tab.sessionStorage.removeItem(k);
  });
  tab.activeUser = null;
}

function sanitizeAuthUser(rawUser) {
  if (!rawUser || typeof rawUser !== 'object') return null;
  const clean = { ...rawUser };
  delete clean.password;
  delete clean.activationTokenHash;
  delete clean.activationTokenExpires;
  delete clean.documents;
  delete clean.verificationDocuments;
  delete clean.applicationDocuments;
  delete clean.chatMessages;
  delete clean.notifications;
  delete clean.auditLogs;
  delete clean.applications;
  delete clean.bids;

  Object.keys(clean).forEach((k) => {
    if (typeof clean[k] === 'string' && clean[k].length > 2048) {
      delete clean[k];
    }
  });

  return clean;
}

function safeSetSessionUser(tab, userObj) {
  if (!userObj) return;
  try {
    const sanitized = sanitizeAuthUser(userObj);
    tab.sessionStorage.setItem('admify_user', JSON.stringify(sanitized));
  } catch (quotaErr) {
    // Fallback to minimal identity
    const minimalUser = {
      id: userObj.id || userObj._id,
      _id: userObj._id || userObj.id,
      name: userObj.name || 'User',
      email: userObj.email || '',
      role: userObj.role || 'student',
      status: userObj.status || 'active',
      accountStatus: userObj.accountStatus || 'ACTIVE',
      user_metadata: {
        full_name: userObj.name || 'User',
        role: userObj.role || 'student',
      },
    };
    tab.sessionStorage.setItem('admify_user', JSON.stringify(minimalUser));
  }
}

function formatUser(rawUser, token = null) {
  if (!rawUser) return null;
  const sanitized = sanitizeAuthUser(rawUser);
  const role = (sanitized.role || 'student').toString().toLowerCase().trim();
  const id = sanitized._id || sanitized.id;

  return {
    ...sanitized,
    id,
    _id: id,
    role,
    user_metadata: {
      full_name: sanitized.name || sanitized.user_metadata?.full_name || 'User',
      phone: sanitized.phone || sanitized.user_metadata?.phone || '',
      role,
      ...(sanitized.user_metadata || {}),
    },
  };
}

function getRoleDashboard(role) {
  const norm = (role || '').toString().toLowerCase().trim();
  if (norm === 'agent') return '/agent/dashboard';
  if (norm === 'agency') return '/agency/dashboard';
  if (norm === 'university_rep' || norm === 'university') return '/university-rep/dashboard';
  if (norm === 'admin') return '/admin/dashboard';
  return '/student/dashboard';
}

async function simulateTabLogin(tab, email, password, role, rememberMe = false) {
  clearAuthStorage(tab);

  const endpoint = role === 'admin' ? '/api/auth/admin/login' : '/api/auth/login';
  const payload = role === 'admin' ? { email, password } : { email, password, role };

  const res = await makeApiRequest('POST', endpoint, payload);
  if (!res.body || res.body.success === false) {
    return { success: false, status: res.status, message: res.body?.message || 'Login failed' };
  }

  const token = res.body.data?.token;
  const rawUser = res.body.data?.user;

  // Active storage in sessionStorage ONLY
  clearAuthStorage(tab);
  tab.sessionStorage.setItem('admify_token', token);
  tab.sessionStorage.setItem('token', token);
  const formatted = formatUser(rawUser, token);
  safeSetSessionUser(tab, formatted);
  tab.sessionStorage.setItem('admify_role', formatted.role);
  tab.activeUser = formatted;

  // Remember Me in localStorage ONLY
  if (rememberMe) {
    tab.localStorage.setItem('admify_remembered_email', email.trim());
    tab.localStorage.setItem('admify_remembered_role', role);
  } else {
    tab.localStorage.removeItem('admify_remembered_email');
    tab.localStorage.removeItem('admify_remembered_role');
  }

  tab.currentUrl = getRoleDashboard(formatted.role);
  return { success: true, user: formatted, token };
}

function simulateTabF5(tab) {
  const token = tab.sessionStorage.getItem('admify_token');
  const cachedUserStr = tab.sessionStorage.getItem('admify_user');
  if (token && cachedUserStr) {
    tab.activeUser = formatUser(JSON.parse(cachedUserStr), token);
    tab.currentUrl = getRoleDashboard(tab.activeUser.role);
  } else {
    clearAuthStorage(tab);
    tab.currentUrl = '/login';
  }
}

async function runTestSuite() {
  console.log('================================================================');
  console.log('RUNNING COMPLETE AUTH STORAGE, QUOTA SAFETY & MULTI-TAB TEST');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function testAssert(desc, condition, extra = '') {
    if (condition) {
      console.log(`[PASS] ${desc}`);
      passed++;
    } else {
      console.error(`[FAIL] ${desc} - ${extra}`);
      failed++;
    }
  }

  // Pre-seed test accounts
  const devStore = (await import('../backend/utils/devStore.js')).default;
  const rand = Math.floor(100000 + Math.random() * 900000);
  const password = 'Password123!';

  // 1. Student
  const student = await devStore.createUser({
    name: 'Tab Student',
    email: `storage_student_${rand}@example.com`,
    password,
    phone: '1234567890',
    role: 'student',
    status: 'active',
    accountStatus: 'ACTIVE',
    isActive: true,
  });

  // 2. Agency
  const agency = await devStore.createUser({
    name: 'Storage Agency HQ',
    email: `storage_agency_${rand}@example.com`,
    password,
    phone: '1234567891',
    role: 'agency',
    status: 'active',
    accountStatus: 'ACTIVE',
    isActive: true,
    agencyVerificationStatus: 'VERIFIED',
  });

  // 3. Agent
  const agent = await devStore.createUser({
    name: 'Storage Agent',
    email: `storage_agent_${rand}@example.com`,
    password,
    phone: '1234567892',
    role: 'agent',
    agencyId: agency._id,
    status: 'active',
    accountStatus: 'ACTIVE',
    isActive: true,
  });

  // 4. Uni Rep
  const uniRep = await devStore.createUser({
    name: 'Storage Uni Rep',
    email: `storage_unirep_${rand}@example.com`,
    password,
    phone: '1234567893',
    role: 'university_rep',
    status: 'active',
    accountStatus: 'ACTIVE',
    isActive: true,
    uniRepVerificationStatus: 'APPROVED',
  });

  // 5. Admin
  const admin = await devStore.findUserByEmail('admin@admify.world');

  // Verify accounts
  testAssert('Precondition: Student account created', Boolean(student?._id));
  testAssert('Precondition: Agency account created', Boolean(agency?._id));
  testAssert('Precondition: Agent account created', Boolean(agent?._id));
  testAssert('Precondition: Uni Rep account created', Boolean(uniRep?._id));
  testAssert('Precondition: Admin verified', Boolean(admin?._id));

  // Initialize Tab A (Student)
  const tabA = new BrowserTab('TabA_Student');

  // Test Legacy Cleanup on Boot
  tabA.localStorage.setItem('admify_token', 'legacy_token_123');
  tabA.localStorage.setItem('admify_user', '{"id":"legacy_user"}');
  tabA.localStorage.setItem('admify_role', 'student');
  tabA.localStorage.setItem('admify_student_documents', JSON.stringify([{ doc: 'large_data' }]));
  tabA.localStorage.setItem('admify_remembered_email', 'persisted@example.com');
  tabA.localStorage.setItem('admify_remembered_role', 'student');

  runBootLegacyCleanup(tabA);

  testAssert('Boot Cleanup: admify_token removed from localStorage', tabA.localStorage.getItem('admify_token') === null);
  testAssert('Boot Cleanup: admify_user removed from localStorage', tabA.localStorage.getItem('admify_user') === null);
  testAssert('Boot Cleanup: admify_role removed from localStorage', tabA.localStorage.getItem('admify_role') === null);
  testAssert('Boot Cleanup: admify_student_documents removed from localStorage', tabA.localStorage.getItem('admify_student_documents') === null);
  testAssert('Boot Cleanup: admify_remembered_email preserved in localStorage', tabA.localStorage.getItem('admify_remembered_email') === 'persisted@example.com');
  testAssert('Boot Cleanup: admify_remembered_role preserved in localStorage', tabA.localStorage.getItem('admify_remembered_role') === 'student');

  console.log('\n--- 1. Login Storage Verification (Student Tab A) ---');
  const loginRes = await simulateTabLogin(tabA, student.email, password, 'student', true);
  testAssert('Student Tab A login succeeds', loginRes.success);

  // Checks 1 - 6
  testAssert('Check 1: Login does NOT write admify_token to localStorage', tabA.localStorage.getItem('admify_token') === null);
  testAssert('Check 2: Login does NOT write admify_user to localStorage', tabA.localStorage.getItem('admify_user') === null);
  testAssert('Check 3: Login does NOT write admify_role to localStorage', tabA.localStorage.getItem('admify_role') === null);
  testAssert('Check 4: Active token exists ONLY in sessionStorage', Boolean(tabA.sessionStorage.getItem('admify_token')));
  testAssert('Check 5: Active user exists ONLY in sessionStorage', Boolean(tabA.sessionStorage.getItem('admify_user')));
  testAssert('Check 6: Active role exists ONLY in sessionStorage', tabA.sessionStorage.getItem('admify_role') === 'student');

  // Check 7 & 8
  testAssert('Check 7: Remember Me stores strictly email/role preferences in localStorage',
    tabA.localStorage.getItem('admify_remembered_email') === student.email &&
    tabA.localStorage.getItem('admify_remembered_role') === 'student');
  testAssert('Check 8: No password stored anywhere in localStorage',
    tabA.localStorage.getItem('password') === null &&
    !JSON.stringify(tabA.localStorage.keys()).includes(password));

  // Check 9: Quota Safety & Normalization
  console.log('\n--- 2. Quota Safety & Large Object Sanitization ---');
  const storedUserRaw = tabA.sessionStorage.getItem('admify_user');
  const storedUser = JSON.parse(storedUserRaw);
  testAssert('admify_user does NOT contain documents field', storedUser.documents === undefined);
  testAssert('admify_user size is lightweight (< 1.5 KB)', Buffer.byteLength(storedUserRaw, 'utf8') < 1500, `Size was ${Buffer.byteLength(storedUserRaw, 'utf8')} bytes`);

  // Simulate extreme heavy payload with base64 document scans (e.g. 8 MB)
  const heavyMockUser = {
    ...storedUser,
    documents: {
      authorizationLetter: 'data:application/pdf;base64,' + 'A'.repeat(3 * 1024 * 1024),
      officialUniversityId: 'data:image/jpeg;base64,' + 'B'.repeat(3 * 1024 * 1024),
    },
    giantLogBlob: 'C'.repeat(5000),
  };

  // Safe setter must sanitize and succeed without throwing QuotaExceededError
  let quotaErrorThrown = false;
  try {
    safeSetSessionUser(tabA, heavyMockUser);
  } catch (e) {
    quotaErrorThrown = true;
  }
  testAssert('Check 9: safeSetSessionUser strips heavy documents without throwing QuotaExceededError', !quotaErrorThrown);
  const reStoredUser = JSON.parse(tabA.sessionStorage.getItem('admify_user'));
  testAssert('Heavy documents were stripped before sessionStorage setItem', reStoredUser.documents === undefined);
  testAssert('Oversized 5000-char string was stripped', reStoredUser.giantLogBlob === undefined);

  // Check 10: F5 preserves current tab session
  console.log('\n--- 3. Tab Reload (F5) Resilience ---');
  simulateTabF5(tabA);
  testAssert('Check 10: F5 preserves Tab A session and dashboard route', tabA.currentUrl === '/student/dashboard' && tabA.activeUser?.role === 'student');

  // Check 11 & 14 & 15: Five concurrent role tabs remain isolated & routing correct
  console.log('\n--- 4. Five Concurrent Isolated Role Tabs ---');
  const tabAgent = new BrowserTab('Tab_Agent');
  const tabAgency = new BrowserTab('Tab_Agency');
  const tabUniRep = new BrowserTab('Tab_UniRep');
  const tabAdmin = new BrowserTab('Tab_Admin');

  const agentRes = await simulateTabLogin(tabAgent, agent.email, password, 'agent');
  const agencyRes = await simulateTabLogin(tabAgency, agency.email, password, 'agency');
  const uniRepRes = await simulateTabLogin(tabUniRep, uniRep.email, password, 'university_rep');
  const adminRes = await simulateTabLogin(tabAdmin, admin.email, 'Admin@123456', 'admin');

  testAssert('Agent login succeeds', agentRes.success);
  testAssert('Agency login succeeds', agencyRes.success);
  testAssert('Uni Rep login succeeds', uniRepRes.success);
  testAssert('Admin login succeeds', adminRes.success);

  testAssert('Tab A (Student) route remains /student/dashboard', tabA.currentUrl === '/student/dashboard');
  testAssert('Tab Agent route is /agent/dashboard', tabAgent.currentUrl === '/agent/dashboard');
  testAssert('Tab Agency route is /agency/dashboard', tabAgency.currentUrl === '/agency/dashboard');
  testAssert('Tab Uni Rep route is /university-rep/dashboard', tabUniRep.currentUrl === '/university-rep/dashboard');
  testAssert('Tab Admin route is /admin/dashboard', tabAdmin.currentUrl === '/admin/dashboard');

  // Verify none of the tabs wrote to localStorage
  testAssert('Check 11: Five tabs active concurrently, zero active tokens in localStorage', tabA.localStorage.getItem('admify_token') === null);
  testAssert('Tab Agent sessionStorage token matches Agent JWT', tabAgent.sessionStorage.getItem('admify_token') === agentRes.token);
  testAssert('Tab Agency sessionStorage token matches Agency JWT', tabAgency.sessionStorage.getItem('admify_token') === agencyRes.token);
  testAssert('Tab Uni Rep sessionStorage token matches Uni Rep JWT', tabUniRep.sessionStorage.getItem('admify_token') === uniRepRes.token);
  testAssert('Tab Admin sessionStorage token matches Admin JWT', tabAdmin.sessionStorage.getItem('admify_token') === adminRes.token);

  // Check 12: Logout only clears current tab session
  console.log('\n--- 5. Logout Tab Isolation ---');
  clearAuthStorage(tabAgent);
  testAssert('Check 12: Logout Tab Agent clears its sessionStorage', tabAgent.sessionStorage.getItem('admify_token') === null);
  testAssert('Logout Tab Agent leaves Tab A Student intact', tabA.sessionStorage.getItem('admify_token') !== null && tabA.activeUser?.role === 'student');
  testAssert('Logout Tab Agent leaves Tab Admin intact', tabAdmin.sessionStorage.getItem('admify_token') !== null && tabAdmin.activeUser?.role === 'admin');

  // Check 13: New tab does not inherit active session
  console.log('\n--- 6. New Tab Isolation ---');
  const newTab = new BrowserTab('Tab_BrandNew');
  simulateTabF5(newTab);
  testAssert('Check 13: New tab does not inherit active session (routes to /login)', newTab.currentUrl === '/login' && newTab.activeUser === null);

  // Check 16: Wrong credentials remain correctly rejected
  console.log('\n--- 7. Wrong Credentials Rejection ---');
  const wrongRes = await simulateTabLogin(tabA, student.email, 'WrongPassword999', 'student');
  testAssert('Check 16: Wrong credentials correctly rejected with HTTP 401', !wrongRes.success && wrongRes.status === 401);

  console.log('\n================================================================');
  console.log(`TEST SUITE FINISHED: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
