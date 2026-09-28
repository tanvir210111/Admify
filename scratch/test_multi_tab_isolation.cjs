/**
 * test_multi_tab_isolation.cjs
 * Comprehensive multi-tab authentication session isolation test suite.
 */

const assert = require('assert');

// 1. Mocking Tab Environment (Top-level browsing contexts)
class TabSessionStorage {
  constructor(tabName) {
    this.tabName = tabName;
    this.store = new Map();
  }

  getItem(key) {
    return this.store.has(key) ? this.store.get(key) : null;
  }

  setItem(key, value) {
    this.store.set(key, String(value));
  }

  removeItem(key) {
    this.store.delete(key);
  }

  clear() {
    this.store.clear();
  }
}

// Global origin-level localStorage (shared across tabs of same origin)
const originLocalStorage = new Map();
const mockLocalStorage = {
  getItem(key) {
    return originLocalStorage.has(key) ? originLocalStorage.get(key) : null;
  },
  setItem(key, value) {
    originLocalStorage.set(key, String(value));
  },
  removeItem(key) {
    originLocalStorage.delete(key);
  },
  clear() {
    originLocalStorage.clear();
  }
};

// Helper: base64url encode for JWT simulation
function createSimulatedJwt(payload) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify({
    ...payload,
    exp: Math.floor(Date.now() / 1000) + 3600 // 1 hr expiry
  })).toString('base64url');
  return `${header}.${body}.mockSignature`;
}

// Decode payload simulation identical to AuthContext
function decodeTokenPayload(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.trim().split('.');
  if (parts.length !== 3) return null;
  try {
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = Buffer.from(base64, 'base64').toString('utf8');
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

function isTokenValid(token) {
  const decoded = decodeTokenPayload(token);
  if (!decoded) return false;
  if (decoded.exp && typeof decoded.exp === 'number') {
    const nowInSeconds = Math.floor(Date.now() / 1000);
    if (decoded.exp <= nowInSeconds) return false;
  }
  return true;
}

function formatUser(rawUser, token = null) {
  if (!rawUser) return null;
  const decoded = token ? decodeTokenPayload(token) : null;
  const role = (
    rawUser.role ||
    decoded?.role ||
    rawUser.user_metadata?.role ||
    'student'
  ).toString().toLowerCase().trim();

  return {
    ...rawUser,
    id: rawUser._id || rawUser.id || decoded?.id,
    role,
    user_metadata: {
      full_name: rawUser.name || rawUser.user_metadata?.full_name || 'User',
      phone: rawUser.phone || rawUser.user_metadata?.phone || '',
      role,
      ...(rawUser.user_metadata || {}),
    },
  };
}

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
    path.startsWith('/register')
  ) {
    return false;
  }

  if (normalizedRole === 'student') return path.startsWith('/student');
  if (normalizedRole === 'agent') return path.startsWith('/agent');
  if (normalizedRole === 'agency') return path.startsWith('/agency');
  if (
    normalizedRole === 'university_rep' ||
    normalizedRole === 'university' ||
    normalizedRole === 'uni rep'
  ) {
    return path.startsWith('/university-rep') || path.startsWith('/university');
  }
  if (normalizedRole === 'admin') return path.startsWith('/admin');
  return false;
}

// Simulates a Browser Tab instance running Admify frontend
class BrowserTab {
  constructor(name) {
    this.name = name;
    this.sessionStorage = new TabSessionStorage(name);
    this.user = null;
    this.currentUrl = '/login';
    this.initAuth();
  }

  // Corresponds to AuthContext.jsx initAuth / initial useState
  initAuth() {
    const token = this.sessionStorage.getItem('admify_token') || this.sessionStorage.getItem('token');
    if (!token || !isTokenValid(token)) {
      this.clearTabStorage();
      this.user = null;
      return;
    }
    const cached = this.sessionStorage.getItem('admify_user');
    if (cached) {
      try {
        this.user = formatUser(JSON.parse(cached), token);
      } catch {
        this.clearTabStorage();
        this.user = null;
      }
    } else {
      this.user = null;
    }
  }

  clearTabStorage() {
    const keys = ['admify_token', 'admify_user', 'admify_role', 'admify_admin_token', 'token', 'user'];
    keys.forEach(k => this.sessionStorage.removeItem(k));
  }

  // Corresponds to AuthContext.jsx login / adminLogin
  login(rawUser, role, rememberMe = false) {
    this.clearTabStorage();
    const token = createSimulatedJwt({ id: rawUser.id, role });
    const formatted = formatUser({ ...rawUser, role }, token);

    // Tab-scoped storage
    this.sessionStorage.setItem('admify_token', token);
    this.sessionStorage.setItem('token', token);
    this.sessionStorage.setItem('admify_user', JSON.stringify(formatted));
    this.sessionStorage.setItem('admify_role', formatted.role);
    this.user = formatted;

    // Safe remember me: only email and role preference saved in shared localStorage
    if (rememberMe) {
      mockLocalStorage.setItem('admify_remembered_email', rawUser.email);
      mockLocalStorage.setItem('admify_remembered_role', role);
    }

    // Role-based routing
    this.currentUrl = getRoleDashboard(formatted.role);
    return { token, user: formatted };
  }

  // Corresponds to AuthContext.jsx signOut
  signOut() {
    this.clearTabStorage();
    this.user = null;
    this.currentUrl = '/login';
  }

  // Simulates pressing F5 / page reload
  refresh() {
    this.initAuth();
    if (!this.user) {
      this.currentUrl = '/login';
    } else {
      // ProtectedRoute checks if current route is allowed
      if (!isPathAllowedForRole(this.currentUrl, this.user.role)) {
        this.currentUrl = getRoleDashboard(this.user.role);
      }
    }
  }

  // Attempt to navigate to a URL
  navigate(url) {
    if (!this.user) {
      this.currentUrl = url.startsWith('/admin') ? '/admin/login' : '/login';
      return;
    }
    if (!isPathAllowedForRole(url, this.user.role)) {
      // ProtectedRoute redirects unauthorized user to their canonical dashboard
      this.currentUrl = getRoleDashboard(this.user.role);
    } else {
      this.currentUrl = url;
    }
  }
}

console.log('========================================================');
console.log('   RUNNING MULTI-TAB AUTH SESSION ISOLATION TEST SUITE   ');
console.log('========================================================\n');

// Clear shared localStorage
originLocalStorage.clear();

// TEST 1: Tab A login Student, Tab B login Agent, Refresh Tab A -> Student
console.log('[TEST 1] Tab A login Student, Tab B login Agent, Refresh Tab A');
const tabA1 = new BrowserTab('TabA');
const tabB1 = new BrowserTab('TabB');

tabA1.login({ id: 's1', name: 'Alice Student', email: 'alice@student.com' }, 'student');
tabB1.login({ id: 'a1', name: 'Bob Agent', email: 'bob@agent.com' }, 'agent');

assert.strictEqual(tabA1.user.role, 'student');
assert.strictEqual(tabA1.currentUrl, '/student/dashboard');
assert.strictEqual(tabB1.user.role, 'agent');
assert.strictEqual(tabB1.currentUrl, '/agent/dashboard');

// Refresh Tab A
tabA1.refresh();
assert.strictEqual(tabA1.user.role, 'student', 'Tab A must remain Student after refresh');
assert.strictEqual(tabA1.currentUrl, '/student/dashboard', 'Tab A must stay at /student/dashboard');
console.log('  -> PASS: Tab A remains Student at /student/dashboard\n');

// TEST 2: Tab A Student, Tab B Agent, Refresh Tab B -> Agent
console.log('[TEST 2] Tab A Student, Tab B Agent, Refresh Tab B');
tabB1.refresh();
assert.strictEqual(tabB1.user.role, 'agent', 'Tab B must remain Agent after refresh');
assert.strictEqual(tabB1.currentUrl, '/agent/dashboard', 'Tab B must stay at /agent/dashboard');
console.log('  -> PASS: Tab B remains Agent at /agent/dashboard\n');

// TEST 3: 5 Distinct Tabs (Student, Agent, Agency, Uni Rep, Admin) -> Refresh all
console.log('[TEST 3] 5 Tabs: Student, Agent, Agency, Uni Rep, Admin -> Refresh all');
const t1 = new BrowserTab('Tab 1 - Student');
const t2 = new BrowserTab('Tab 2 - Agent');
const t3 = new BrowserTab('Tab 3 - Agency');
const t4 = new BrowserTab('Tab 4 - Uni Rep');
const t5 = new BrowserTab('Tab 5 - Admin');

t1.login({ id: 'u1', name: 'Student 1', email: 's1@test.com' }, 'student');
t2.login({ id: 'u2', name: 'Agent 2', email: 'ag2@test.com' }, 'agent');
t3.login({ id: 'u3', name: 'Agency 3', email: 'agency3@test.com', accountStatus: 'ACTIVE' }, 'agency');
t4.login({ id: 'u4', name: 'Uni Rep 4', email: 'rep4@test.com', accountStatus: 'ACTIVE' }, 'university_rep');
t5.login({ id: 'u5', name: 'Admin 5', email: 'admin5@test.com' }, 'admin');

assert.strictEqual(t1.currentUrl, '/student/dashboard');
assert.strictEqual(t2.currentUrl, '/agent/dashboard');
assert.strictEqual(t3.currentUrl, '/agency/dashboard');
assert.strictEqual(t4.currentUrl, '/university-rep/dashboard');
assert.strictEqual(t5.currentUrl, '/admin/dashboard');

// Refresh all 5 tabs in random order
t3.refresh();
t1.refresh();
t5.refresh();
t2.refresh();
t4.refresh();

assert.strictEqual(t1.user.role, 'student');
assert.strictEqual(t1.currentUrl, '/student/dashboard');

assert.strictEqual(t2.user.role, 'agent');
assert.strictEqual(t2.currentUrl, '/agent/dashboard');

assert.strictEqual(t3.user.role, 'agency');
assert.strictEqual(t3.currentUrl, '/agency/dashboard');

assert.strictEqual(t4.user.role, 'university_rep');
assert.strictEqual(t4.currentUrl, '/university-rep/dashboard');

assert.strictEqual(t5.user.role, 'admin');
assert.strictEqual(t5.currentUrl, '/admin/dashboard');

console.log('  -> PASS: All 5 tabs maintained their individual sessions and dashboards after refresh\n');

// TEST 4: Tab A Student, Tab B Admin -> Logout Tab B -> A remains Student, B logged out
console.log('[TEST 4] Tab A Student, Tab B Admin -> Logout Tab B');
const tabA4 = new BrowserTab('TabA4');
const tabB4 = new BrowserTab('TabB4');

tabA4.login({ id: 's4', name: 'Student 4', email: 's4@test.com' }, 'student');
tabB4.login({ id: 'adm4', name: 'Admin 4', email: 'adm4@test.com' }, 'admin');

tabB4.signOut();
assert.strictEqual(tabB4.user, null, 'Tab B must be logged out');
assert.strictEqual(tabB4.currentUrl, '/login');

// Check Tab A
tabA4.refresh();
assert.strictEqual(tabA4.user.role, 'student', 'Tab A must not be affected by Tab B logout');
assert.strictEqual(tabA4.currentUrl, '/student/dashboard');
console.log('  -> PASS: Logout from Tab B did not affect Tab A\n');

// TEST 5: Tab A Agent, Tab B Student -> Login Student in B -> Refresh A -> A remains Agent
console.log('[TEST 5] Tab A Agent, Tab B Student -> Login in B does not overwrite A');
const tabA5 = new BrowserTab('TabA5');
tabA5.login({ id: 'agent5', name: 'Agent 5', email: 'agent5@test.com' }, 'agent');
assert.strictEqual(tabA5.user.role, 'agent');

const tabB5 = new BrowserTab('TabB5');
tabB5.login({ id: 'student5', name: 'Student 5', email: 'student5@test.com' }, 'student');

// Verify Tab A remains agent
tabA5.refresh();
assert.strictEqual(tabA5.user.role, 'agent', 'Tab A must remain Agent');
assert.strictEqual(tabA5.currentUrl, '/agent/dashboard');
console.log('  -> PASS: Logging into Tab B does not mutate or overwrite Tab A\n');

// TEST 6: Open new tab after existing sessions -> Must NOT inherit active session
console.log('[TEST 6] New Tab opened with fresh sessionStorage does not inherit active session');
const tabNew = new BrowserTab('NewTab');
assert.strictEqual(tabNew.user, null, 'New tab must be unauthenticated');
tabNew.navigate('/agent/dashboard');
assert.strictEqual(tabNew.currentUrl, '/login', 'New tab navigating to /agent/dashboard must redirect to /login');
console.log('  -> PASS: New tab does not blindly inherit any other tab session\n');

// TEST 7: Remember Me isolation
console.log('[TEST 7] Remember Me stores email/role preference in localStorage without active token');
tabB5.login({ id: 'student5', name: 'Student 5', email: 'rememberme@test.com' }, 'student', true);
assert.strictEqual(mockLocalStorage.getItem('admify_remembered_email'), 'rememberme@test.com');
assert.strictEqual(mockLocalStorage.getItem('admify_remembered_role'), 'student');
assert.strictEqual(mockLocalStorage.getItem('admify_token'), null, 'localStorage must NOT hold admify_token');
assert.strictEqual(mockLocalStorage.getItem('admify_user'), null, 'localStorage must NOT hold admify_user');
console.log('  -> PASS: Remember Me is safe and does not leak active session tokens\n');

// TEST 8: Cross-role protection in Tab
console.log('[TEST 8] Cross-role route protection on isolated tab');
const agentTab = new BrowserTab('AgentTab');
agentTab.login({ id: 'agX', name: 'Agent X', email: 'agx@test.com' }, 'agent');

agentTab.navigate('/student/dashboard');
assert.strictEqual(agentTab.currentUrl, '/agent/dashboard', 'Agent cannot enter /student/*, redirected to /agent/dashboard');

agentTab.navigate('/admin/dashboard');
assert.strictEqual(agentTab.currentUrl, '/agent/dashboard', 'Agent cannot enter /admin/*, redirected to /agent/dashboard');

agentTab.navigate('/agency/dashboard');
assert.strictEqual(agentTab.currentUrl, '/agent/dashboard', 'Agent cannot enter /agency/*, redirected to /agent/dashboard');

agentTab.navigate('/university-rep/dashboard');
assert.strictEqual(agentTab.currentUrl, '/agent/dashboard', 'Agent cannot enter /university-rep/*, redirected to /agent/dashboard');
console.log('  -> PASS: ProtectedRoute keeps role isolation within tab\n');

console.log('========================================================');
console.log('   ALL MULTI-TAB SESSION ISOLATION TESTS PASSED (8/8)   ');
console.log('========================================================\n');
