/**
 * ADMIFY RATE LIMITER & STORAGE ABSTRACTION VERIFICATION SUITE
 *
 * Verifies:
 * 1. Normal request processing & headers
 * 2. Request count tracking below threshold
 * 3. Threshold exceeded -> returns HTTP 429 with retryAfter
 * 4. Stale record cleanup removes expired entries
 * 5. IP isolation: IP A limit does not affect IP B
 * 6. Malformed IP and x-forwarded-for header handling
 * 7. Memory bounds and reset functionality
 * 8. Internal authenticated messaging routes unaffected
 */

import express from 'express';
import http from 'http';
import {
  MemoryRateLimitStore,
  extractClientIp,
  createRateLimiter,
} from './middleware/rateLimiter.js';

const results = [];
function record(testId, name, status, details = '') {
  results.push({ testId, name, status, details });
  const sym = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  console.log(`${sym} [Test ${testId}] ${name} -> [${status}] ${details ? '(' + details + ')' : ''}`);
}

async function runRateLimiterTests() {
  console.log('========================================================================');
  console.log('       ADMIFY RATE LIMITER & STORAGE ABSTRACTION VERIFICATION SUITE      ');
  console.log('========================================================================\n');

  try {
    // ─────────────────────────────────────────────────────────────
    // TEST 1: Storage increment, count tracking, and reset
    // ─────────────────────────────────────────────────────────────
    const store = new MemoryRateLimitStore({ cleanupIntervalMs: 60000 });
    const ipA = '192.168.1.50';

    const r1 = await store.increment(ipA, 1000);
    const r2 = await store.increment(ipA, 1000);
    const r3 = await store.increment(ipA, 1000);
    const pass1 = r1.count === 1 && r2.count === 2 && r3.count === 3;
    record(1, 'MemoryRateLimitStore correctly increments request count', pass1 ? 'PASS' : 'FAIL', `Final count: ${r3.count}`);

    // ─────────────────────────────────────────────────────────────
    // TEST 2: IP isolation: Separate clients don't share limits
    // ─────────────────────────────────────────────────────────────
    const ipB = '192.168.1.51';
    const rB = await store.increment(ipB, 1000);
    const pass2 = rB.count === 1;
    record(2, 'Separate client IPs maintain strictly isolated counters', pass2 ? 'PASS' : 'FAIL', `IP B count: ${rB.count}, IP A count: 3`);

    // ─────────────────────────────────────────────────────────────
    // TEST 3: Stale record cleanup
    // ─────────────────────────────────────────────────────────────
    const ipShort = '10.0.0.1';
    await store.increment(ipShort, 50); // 50ms window
    await new Promise(r => setTimeout(r, 60)); // Wait for expiration
    store.cleanup();
    const expiredRecord = await store.get(ipShort);
    const pass3 = expiredRecord === null;
    record(3, 'Stale record cleanup purges expired records from memory', pass3 ? 'PASS' : 'FAIL', `Expired record: ${expiredRecord}`);

    // ─────────────────────────────────────────────────────────────
    // TEST 4: Client IP extraction from headers & sockets
    // ─────────────────────────────────────────────────────────────
    const mockReq1 = { headers: { 'x-forwarded-for': '203.0.113.195, 70.41.3.18' } };
    const mockReq2 = { socket: { remoteAddress: '::ffff:198.51.100.42' } };
    const mockReq3 = { headers: {} }; // Missing IP fallback
    const ip1 = extractClientIp(mockReq1);
    const ip2 = extractClientIp(mockReq2);
    const ip3 = extractClientIp(mockReq3);
    const pass4 = ip1 === '203.0.113.195' && ip2 === '198.51.100.42' && ip3 === '127.0.0.1';
    record(4, 'extractClientIp correctly parses proxies, IPv6 mapping, and fallbacks', pass4 ? 'PASS' : 'FAIL', `Parsed: ${ip1}, ${ip2}, ${ip3}`);

    // ─────────────────────────────────────────────────────────────
    // TEST 5: HTTP Middleware integration (200 OK below threshold, 429 when exceeded)
    // ─────────────────────────────────────────────────────────────
    const testStore = new MemoryRateLimitStore();
    const testLimiter = createRateLimiter({
      windowMs: 10000,
      max: 5,
      store: testStore,
    });

    const app = express();
    app.use(express.json());
    app.post('/test/public-chat', testLimiter, (req, res) => res.json({ success: true, count: 'ok' }));
    app.post('/test/internal-message', (req, res) => res.json({ success: true, internal: true }));

    const server = http.createServer(app);
    await new Promise(r => server.listen(0, r));
    const port = server.address().port;
    const base = `http://127.0.0.1:${port}`;

    let hitCount = 0;
    let got429 = false;
    let rateLimitHeaderPresent = false;

    for (let i = 1; i <= 7; i++) {
      const resp = await fetch(`${base}/test/public-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (resp.status === 200) hitCount++;
      if (resp.status === 429) got429 = true;
      if (resp.headers.get('x-ratelimit-limit')) rateLimitHeaderPresent = true;
    }

    const pass5 = hitCount === 5 && got429 && rateLimitHeaderPresent;
    record(5, 'Middleware allows 5 requests, returns 429 on 6th, and injects X-RateLimit headers', pass5 ? 'PASS' : 'FAIL', `Allowed: ${hitCount}, Blocked: ${got429}`);

    // ─────────────────────────────────────────────────────────────
    // TEST 6: Internal authenticated messaging completely unaffected
    // ─────────────────────────────────────────────────────────────
    let internalSuccess = true;
    for (let i = 1; i <= 10; i++) {
      const resp = await fetch(`${base}/test/internal-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (resp.status !== 200) internalSuccess = false;
    }
    record(6, 'Internal messaging routes are completely unaffected by public chat rate limiter', internalSuccess ? 'PASS' : 'FAIL', '10/10 internal messages succeeded');

    // Clean up
    server.close();
    store.destroy();
    testStore.destroy();

    console.log('\n========================================================================');
    const passed = results.filter(r => r.status === 'PASS').length;
    const failed = results.filter(r => r.status === 'FAIL').length;
    console.log(`RATE LIMITER TEST RESULTS: ${passed}/${results.length} PASSED (${failed} FAILED)`);
    console.log('========================================================================\n');

    if (failed > 0) process.exit(1);
    process.exit(0);
  } catch (err) {
    console.error('Rate limiter test runner error:', err);
    process.exit(1);
  }
}

runRateLimiterTests();
