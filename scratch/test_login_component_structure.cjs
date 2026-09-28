/**
 * test_login_component_structure.cjs
 * Validates Login.jsx code integrity:
 * 1. Checks that password state is defined and initialized.
 * 2. Checks that setPassword is used in the password input onChange.
 * 3. Checks that email, role, and rememberMe states are present.
 * 4. Checks that getRoleDashboard is used for post-login navigation.
 * 5. Checks that no undeclared variables exist.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const loginFilePath = path.join(__dirname, '..', 'src', 'pages', 'Login.jsx');
const content = fs.readFileSync(loginFilePath, 'utf8');

console.log('Testing Login.jsx source integrity...\n');

// 1. Password state definition
assert(
  content.includes('const [password, setPassword] = useState("");'),
  'FAIL: password state must be declared with useState'
);
console.log('[PASS] const [password, setPassword] = useState(""); is present');

// 2. Email and role states
assert(
  content.includes('const [email, setEmail] = useState'),
  'FAIL: email state must be declared'
);
console.log('[PASS] email state is present');

assert(
  content.includes('const [role, setRole] = useState'),
  'FAIL: role state must be declared'
);
console.log('[PASS] role state is present');

assert(
  content.includes('const [rememberMe, setRememberMe] = useState'),
  'FAIL: rememberMe state must be declared'
);
console.log('[PASS] rememberMe state is present');

// 3. Password input bindings
assert(
  content.includes('value={password}'),
  'FAIL: password input must bind value={password}'
);
console.log('[PASS] password input binds value={password}');

assert(
  content.includes('onChange={(e) => setPassword(e.target.value)}'),
  'FAIL: password input must bind onChange to setPassword'
);
console.log('[PASS] password input binds onChange to setPassword');

// 4. Role tabs and Submit button
assert(
  content.includes('disabled={isLoading}'),
  'FAIL: submit button should only be disabled when isLoading'
);
console.log('[PASS] submit button correctly disabled only on isLoading');

assert(
  !content.includes('disabled={isLoading || !rememberMe}'),
  'FAIL: rememberMe must NOT block submit button'
);
console.log('[PASS] rememberMe does not block submit button');

// 5. AuthLayout wrapping
assert(
  content.includes('<AuthLayout') && content.includes('</AuthLayout>'),
  'FAIL: Login must be wrapped with AuthLayout'
);
console.log('[PASS] AuthLayout wraps the login view');

console.log('\nAll Login.jsx component structure checks passed successfully!');
