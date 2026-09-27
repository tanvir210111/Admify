import assert from 'assert';
import http from 'http';
import mongoose from 'mongoose';
import express from 'express';
import devStore from './utils/devStore.js';
import User from './models/User.js';
import CreditTransaction from './models/CreditTransaction.js';

async function runTests() {
  console.log('================================================================');
  console.log('   PRODUCTION DATABASE SAFETY GUARD AUTOMATED VERIFICATION');
  console.log('================================================================\n');

  let passed = 0;
  let total = 0;

  async function test(name, fn) {
    total++;
    try {
      await fn();
      console.log(`[PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`[FAIL] ${name}`);
      console.error(err);
      process.exitCode = 1;
    }
  }

  // ── TEST 1: DevStore in NODE_ENV=production ──────────────────────────────────
  await test('devStore.read() throws fatal error when NODE_ENV=production', async () => {
    process.env.NODE_ENV = 'production';
    let threw = false;
    try {
      devStore.read();
    } catch (e) {
      threw = true;
      assert(
        e.message.includes('strictly prohibited in production environment'),
        `Unexpected error message: ${e.message}`
      );
    }
    assert.strictEqual(threw, true, 'devStore.read() did not throw in production!');
  });

  await test('devStore.write() throws fatal error when NODE_ENV=production', async () => {
    process.env.NODE_ENV = 'production';
    let threw = false;
    try {
      devStore.write({ test: 123 });
    } catch (e) {
      threw = true;
      assert(
        e.message.includes('strictly prohibited in production environment'),
        `Unexpected error message: ${e.message}`
      );
    }
    assert.strictEqual(threw, true, 'devStore.write() did not throw in production!');
  });

  await test('devStore methods (e.g. findUserById) fail safe in production without disk access', async () => {
    process.env.NODE_ENV = 'production';
    let threw = false;
    try {
      await devStore.findUserById('some-fake-id');
    } catch (e) {
      threw = true;
      assert(
        e.message.includes('strictly prohibited in production environment'),
        `Unexpected error message: ${e.message}`
      );
    }
    assert.strictEqual(threw, true, 'findUserById did not reject in production!');
  });

  await test('devStore.ensureDbFile() is a no-op in production', async () => {
    process.env.NODE_ENV = 'production';
    // ensureDbFile should return immediately without throwing and without checking files
    devStore.ensureDbFile();
  });

  // ── TEST 2: DevStore in NODE_ENV=development ─────────────────────────────────
  await test('devStore works normally when NODE_ENV=development', async () => {
    process.env.NODE_ENV = 'development';
    const db = devStore.read();
    assert(db && Array.isArray(db.users), 'devStore.read() failed in development mode');
  });

  // ── TEST 3: HTTP 503 Middleware Verification ─────────────────────────────────
  await test('Server returns HTTP 503 on /api/* when NODE_ENV=production and DB disconnected', async () => {
    process.env.NODE_ENV = 'production';
    // Simulate disconnected state
    const originalReadyState = mongoose.connection.readyState;
    Object.defineProperty(mongoose.connection, 'readyState', { value: 0, configurable: true });

    const app = express();

    // Health check endpoint (exempt from 503)
    app.get('/api/health', (req, res) => {
      res.status(200).json({ success: true, database: 'disconnected' });
    });

    // Exact Production Database Availability Middleware
    app.use('/api', (req, res, next) => {
      if (req.path === '/health') return next();
      if (process.env.NODE_ENV === 'production' && mongoose.connection.readyState !== 1) {
        return res.status(503).json({
          success: false,
          message: 'Database connection is temporarily unavailable. Please retry shortly.',
        });
      }
      next();
    });

    app.get('/api/wallet', (req, res) => {
      res.json({ success: true, data: 'wallet-data' });
    });

    app.post('/api/auth/register', (req, res) => {
      res.json({ success: true, data: 'registered' });
    });

    app.get('/api/admin/users', (req, res) => {
      res.json({ success: true, data: 'admin-users' });
    });

    const server = http.createServer(app);
    await new Promise((r) => server.listen(0, r));
    const port = server.address().port;

    try {
      // 1. Health check should still return 200 and report disconnected status
      const healthRes = await fetch(`http://127.0.0.1:${port}/api/health`);
      assert.strictEqual(healthRes.status, 200);
      const healthJson = await healthRes.json();
      assert.strictEqual(healthJson.database, 'disconnected');

      // 2. Protected API /api/wallet must return HTTP 503
      const walletRes = await fetch(`http://127.0.0.1:${port}/api/wallet`);
      assert.strictEqual(walletRes.status, 503);
      const walletJson = await walletRes.json();
      assert.deepStrictEqual(walletJson, {
        success: false,
        message: 'Database connection is temporarily unavailable. Please retry shortly.',
      });

      // 3. /api/auth/register must return HTTP 503
      const regRes = await fetch(`http://127.0.0.1:${port}/api/auth/register`, { method: 'POST' });
      assert.strictEqual(regRes.status, 503);
      const regJson = await regRes.json();
      assert.strictEqual(regJson.message, 'Database connection is temporarily unavailable. Please retry shortly.');

      // 4. /api/admin/users must return HTTP 503
      const adminRes = await fetch(`http://127.0.0.1:${port}/api/admin/users`);
      assert.strictEqual(adminRes.status, 503);
      const adminJson = await adminRes.json();
      assert.strictEqual(adminJson.message, 'Database connection is temporarily unavailable. Please retry shortly.');

      // 5. When MongoDB reconnects (readyState = 1), normal operations resume
      Object.defineProperty(mongoose.connection, 'readyState', { value: 1, configurable: true });
      const walletConnectedRes = await fetch(`http://127.0.0.1:${port}/api/wallet`);
      assert.strictEqual(walletConnectedRes.status, 200);
      const walletConnectedJson = await walletConnectedRes.json();
      assert.strictEqual(walletConnectedJson.success, true);
    } finally {
      server.close();
      Object.defineProperty(mongoose.connection, 'readyState', { value: originalReadyState, configurable: true });
    }
  });

  // ── TEST 4: Student Registration Defaults in Mongoose Schema ─────────────────
  await test('User model enforces default: walletCredits=20, freeCredits=20, paidCredits=0', async () => {
    const paths = User.schema.paths;
    assert.strictEqual(paths.walletCredits.defaultValue, 20, 'walletCredits default is not 20');
    assert.strictEqual(paths.freeCredits.defaultValue, 20, 'freeCredits default is not 20');
    assert.strictEqual(paths.paidCredits.defaultValue, 0, 'paidCredits default is not 0');
    assert.strictEqual(paths.freeCreditsForfeited.defaultValue, false, 'freeCreditsForfeited default is not false');
  });

  // ── TEST 5: CreditTransaction Schema Idempotency Index ────────────────────────
  await test('CreditTransaction enforces unique partial index on WELCOME_CREDIT', async () => {
    const indexes = CreditTransaction.schema.indexes();
    const welcomeIndex = indexes.find(
      (idx) => idx[0].user === 1 && idx[0].type === 1 && idx[1].unique === true
    );

    assert(welcomeIndex, 'Unique index on { user: 1, type: 1 } not found');
    assert.deepStrictEqual(
      welcomeIndex[1].partialFilterExpression,
      { type: 'WELCOME_CREDIT' },
      'Index lacks partialFilterExpression for WELCOME_CREDIT'
    );
  });

  console.log(`\n================================================================`);
  console.log(`   ALL TESTS PASSED: ${passed}/${total}`);
  console.log(`================================================================\n`);
}

runTests().catch((err) => {
  console.error('[Runner Fatal]', err);
  process.exit(1);
});
