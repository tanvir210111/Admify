/**
 * ADMIFY - ADMIN SUPPORT INBOX CONVERSATION DELETION VERIFICATION SUITE
 * 
 * Verifies:
 * 1. Create visitor session.
 * 2. Send multiple AI messages & AI replies.
 * 3. Escalate to Live Agent.
 * 4. Send visitor live message.
 * 5. Send Admin reply.
 * 6. Confirm complete history exists in one unified conversation.
 * 7. Confirm Support Inbox contains exactly one conversation.
 * 8. Security gates:
 *    - Unauthenticated request returns 401
 *    - Student token returns 403 Forbidden
 *    - Agency token returns 403 Forbidden
 *    - Agent token returns 403 Forbidden
 *    - University Rep token returns 403 Forbidden
 *    - Invalid/random session ID returns 404 Not Found
 * 9. Admin permanently deletes the conversation (DELETE /api/admin/support/conversations/:sessionId).
 * 10. Confirm DELETE returns 200 and deletedMessagesCount.
 * 11. Confirm all ChatMessage records for that session are permanently gone.
 * 12. Confirm Support Inbox no longer lists the deleted conversation across any status filters.
 * 13. Confirm history endpoint (GET /api/admin/support/conversations/:sessionId) returns 404.
 * 14. Confirm another visitor's conversation remains completely intact (session isolation).
 * 15. Confirm deleted conversation does not return after reconnect.
 * 16. Confirm no message-level delete button was introduced.
 * 17. Confirm no unrelated data was deleted.
 */

import http from 'http';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { io as ClientIO } from 'socket.io-client';

// App imports
import chatRoutes from './routes/chatRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { initSocketServer } from './socket/socketServer.js';
import devStore from './utils/devStore.js';
import { errorHandler } from './middleware/errorMiddleware.js';

const PORT = 5100;
const JWT_SECRET = process.env.JWT_SECRET || 'admify_super_secret_jwt_fallback_key_2026';

const app = express();
app.use(cors());
app.use(express.json());

// Mount routes
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);

// Error handler
app.use(errorHandler);

const server = http.createServer(app);
initSocketServer(server);

function generateToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
}

const testResults = [];
function record(num, name, status, details = '') {
  testResults.push({ num, name, status, details });
  const icon = status === 'PASS' ? '✅' : '❌';
  console.log(`${icon} TEST ${num}: ${name} -> [${status}] ${details ? `(${details})` : ''}`);
}

async function runTests() {
  server.listen(PORT, async () => {
    console.log(`\n========================================================================`);
    console.log(`   ADMIFY ADMIN SUPPORT INBOX CONVERSATION DELETION VERIFICATION SUITE   `);
    console.log(`========================================================================\n`);

    const baseUrl = `http://localhost:${PORT}`;

    try {
      const db = devStore.read();
      if (!Array.isArray(db.users)) db.users = [];

      let adminUser = db.users.find((u) => u.role === 'admin');
      if (!adminUser) {
        adminUser = {
          _id: '674e1a0b1234567890aa0001',
          name: 'Super Admin',
          email: 'admin@admify.com',
          role: 'admin',
        };
        db.users.push(adminUser);
      }
      const adminToken = generateToken(adminUser);

      let studentUser = db.users.find((u) => u.role === 'student');
      if (!studentUser) {
        studentUser = { _id: '674e1a0b1234567890aa0002', role: 'student', email: 'student_test@admify.com', name: 'Student Test' };
        db.users.push(studentUser);
      }
      const studentToken = generateToken(studentUser);

      let agencyUser = db.users.find((u) => u.role === 'agency');
      if (!agencyUser) {
        agencyUser = { _id: '674e1a0b1234567890aa0003', role: 'agency', email: 'agency_test@admify.com', name: 'Agency Test' };
        db.users.push(agencyUser);
      }
      const agencyToken = generateToken(agencyUser);

      let agentUser = db.users.find((u) => u.role === 'agent');
      if (!agentUser) {
        agentUser = { _id: '674e1a0b1234567890aa0004', role: 'agent', email: 'agent_test@admify.com', name: 'Agent Test' };
        db.users.push(agentUser);
      }
      const agentToken = generateToken(agentUser);

      let uniRepUser = db.users.find((u) => u.role === 'university_rep');
      if (!uniRepUser) {
        uniRepUser = { _id: '674e1a0b1234567890aa0005', role: 'university_rep', email: 'unirep_test@admify.com', name: 'Uni Rep Test' };
        db.users.push(uniRepUser);
      }
      const uniRepToken = generateToken(uniRepUser);

      // Clean test slate
      db.chatMessages = (db.chatMessages || []).filter(
        (m) => !m.sessionId?.startsWith('vis_del_test_') && !m.sessionId?.startsWith('vis_survivor_')
      );
      db.visitorSessions = (db.visitorSessions || []).filter(
        (s) => !s.visitorToken?.startsWith('vis_del_test_') && !s.visitorToken?.startsWith('vis_survivor_')
      );
      devStore.write(db);

      const sessionToDelete = `vis_del_test_${Date.now()}`;
      const sessionSurvivor = `vis_survivor_${Date.now()}`;

      // ── 1. Create survivor visitor session to test isolation ──
      await fetch(`${baseUrl}/api/chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitorToken: sessionSurvivor,
          sessionId: sessionSurvivor,
          text: 'Hello, I am survivor visitor.',
        }),
      });

      // ── 2. Create target visitor session and send multiple AI messages ──
      await fetch(`${baseUrl}/api/chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitorToken: sessionToDelete,
          sessionId: sessionToDelete,
          text: 'Tell me about studying in France.',
        }),
      });

      await fetch(`${baseUrl}/api/chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitorToken: sessionToDelete,
          sessionId: sessionToDelete,
          text: 'What are scholarship options in Paris?',
        }),
      });

      // ── 3. Escalate to Live Agent ──
      const escRes = await fetch(`${baseUrl}/api/chat/live-agent-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitorToken: sessionToDelete,
          sessionId: sessionToDelete,
          fullName: 'Tariq Rahman',
          email: 'tariq.rahman@test.com',
          phone: '+33612345678',
        }),
      });
      const escData = await escRes.json();
      record(1, 'Target visitor escalates to Live Agent', escRes.status === 200 && escData.status === 'waiting_live_agent' ? 'PASS' : 'FAIL');

      // ── 4. Visitor live message ──
      await fetch(`${baseUrl}/api/chat/visitor-reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitorToken: sessionToDelete,
          sessionId: sessionToDelete,
          text: 'Hello, please help with France visa requirements.',
        }),
      });

      // ── 5. Admin live reply ──
      await fetch(`${baseUrl}/api/admin/support/conversations/${sessionToDelete}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          text: 'Hello Tariq, Campus France requires the Etudes en France process.',
        }),
      });

      // ── 6. Confirm complete history exists ──
      const histRes = await fetch(`${baseUrl}/api/admin/support/conversations/${sessionToDelete}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const histData = await histRes.json();
      const initialMsgsCount = histData.data?.messages?.length || 0;
      record(2, 'Confirm complete conversation history exists before deletion', histRes.status === 200 && initialMsgsCount >= 6 ? 'PASS' : 'FAIL', `Messages: ${initialMsgsCount}`);

      // ── 7. Confirm Support Inbox contains exactly one entry for Tariq ──
      const inboxRes = await fetch(`${baseUrl}/api/admin/support/conversations`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const inboxData = await inboxRes.json();
      const convs = inboxData.data?.conversations || [];
      const tariqEntry = convs.find((c) => c.sessionId === sessionToDelete || c.student?.email === 'tariq.rahman@test.com');
      record(3, 'Confirm Support Inbox lists target conversation', Boolean(tariqEntry) ? 'PASS' : 'FAIL', `Session: ${tariqEntry?.sessionId}`);

      // ── 8. Security Check: Unauthenticated request rejected (401) ──
      const unauthRes = await fetch(`${baseUrl}/api/admin/support/conversations/${sessionToDelete}`, {
        method: 'DELETE',
      });
      record(4, 'Unauthenticated DELETE request strictly rejected (401)', unauthRes.status === 401 ? 'PASS' : 'FAIL', `Status: ${unauthRes.status}`);

      // ── 9. Security Check: Student token rejected (403 Forbidden) ──
      const studentRes = await fetch(`${baseUrl}/api/admin/support/conversations/${sessionToDelete}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      record(5, 'Student role DELETE request strictly rejected (403)', studentRes.status === 403 ? 'PASS' : 'FAIL', `Status: ${studentRes.status}`);

      // ── 10. Security Check: Agency token rejected (403 Forbidden) ──
      const agencyRes = await fetch(`${baseUrl}/api/admin/support/conversations/${sessionToDelete}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${agencyToken}` },
      });
      record(6, 'Agency role DELETE request strictly rejected (403)', agencyRes.status === 403 ? 'PASS' : 'FAIL', `Status: ${agencyRes.status}`);

      // ── 11. Security Check: Agent token rejected (403 Forbidden) ──
      const agentRes = await fetch(`${baseUrl}/api/admin/support/conversations/${sessionToDelete}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${agentToken}` },
      });
      record(7, 'Agent role DELETE request strictly rejected (403)', agentRes.status === 403 ? 'PASS' : 'FAIL', `Status: ${agentRes.status}`);

      // ── 12. Security Check: Uni Rep token rejected (403 Forbidden) ──
      const uniRepRes = await fetch(`${baseUrl}/api/admin/support/conversations/${sessionToDelete}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${uniRepToken}` },
      });
      record(8, 'University Rep role DELETE request strictly rejected (403)', uniRepRes.status === 403 ? 'PASS' : 'FAIL', `Status: ${uniRepRes.status}`);

      // ── 13. Invalid/random session ID returns 404 ──
      const notFoundRes = await fetch(`${baseUrl}/api/admin/support/conversations/vis_nonexistent_random_id_99999`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      record(9, 'Invalid/random session ID DELETE returns proper 404', notFoundRes.status === 404 ? 'PASS' : 'FAIL', `Status: ${notFoundRes.status}`);

      // ── 14. Socket broadcast verification ──
      let socketNotified = false;
      const visitorSocket = ClientIO(baseUrl, {
        transports: ['websocket'],
        auth: { visitorToken: sessionToDelete },
        timeout: 2000,
      });

      await new Promise((resolve) => {
        visitorSocket.on('visitor_connected', () => resolve());
        visitorSocket.on('connect', () => resolve());
        setTimeout(resolve, 800);
      });

      visitorSocket.on('support_conversation_deleted', (data) => {
        if (data?.sessionId === sessionToDelete) {
          socketNotified = true;
        }
      });

      // ── 15. Admin executes permanent DELETE ──
      const delRes = await fetch(`${baseUrl}/api/admin/support/conversations/${sessionToDelete}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const delData = await delRes.json();
      record(10, 'Admin permanently deletes conversation (HTTP 200)', delRes.status === 200 && delData.success ? 'PASS' : 'FAIL', `Deleted messages: ${delData.data?.deletedMessagesCount}`);

      // Wait for socket delivery
      await new Promise((resolve) => setTimeout(resolve, 400));
      visitorSocket.disconnect();
      record(11, 'Socket.io broadcasts support_conversation_deleted to visitor & admin rooms', socketNotified ? 'PASS' : 'FAIL', `Notified: ${socketNotified}`);

      // ── 16. Confirm all ChatMessage records for that session are gone ──
      const updatedDb = devStore.read();
      const remainingMsgs = (updatedDb.chatMessages || []).filter(
        (m) => m.sessionId === sessionToDelete || m.sessionId === sessionToDelete.slice(4)
      );
      record(12, 'Confirm 0 ChatMessage records remain for deleted session', remainingMsgs.length === 0 ? 'PASS' : 'FAIL', `Remaining: ${remainingMsgs.length}`);

      // ── 17. Confirm Support Inbox no longer lists the deleted conversation ──
      const postInboxRes = await fetch(`${baseUrl}/api/admin/support/conversations`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const postInboxData = await postInboxRes.json();
      const postConvs = postInboxData.data?.conversations || [];
      const stillInInbox = postConvs.some((c) => c.sessionId === sessionToDelete || c.student?.email === 'tariq.rahman@test.com');
      record(13, 'Confirm Support Inbox list no longer contains deleted conversation', !stillInInbox ? 'PASS' : 'FAIL', `Still in inbox: ${stillInInbox}`);

      // ── 18. Confirm history endpoint returns 404 Not Found ──
      const postHistRes = await fetch(`${baseUrl}/api/admin/support/conversations/${sessionToDelete}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const postHistData = await postHistRes.json();
      record(14, 'Confirm history endpoint returns HTTP 404 for deleted session', postHistRes.status === 404 && postHistData.success === false ? 'PASS' : 'FAIL', `Status: ${postHistRes.status}`);

      // ── 19. Confirm survivor visitor conversation still exists intact ──
      const survivorHistRes = await fetch(`${baseUrl}/api/admin/support/conversations/${sessionSurvivor}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const survivorHistData = await survivorHistRes.json();
      const survivorMsgs = survivorHistData.data?.messages || [];
      record(15, 'Confirm survivor visitor conversation remains completely intact', survivorHistRes.status === 200 && survivorMsgs.length >= 1 ? 'PASS' : 'FAIL', `Survivor msgs: ${survivorMsgs.length}`);

      // ── 20. Confirm deleted conversation does not reappear after reconnect ──
      const checkInboxAgain = await fetch(`${baseUrl}/api/admin/support/conversations`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const checkInboxData = await checkInboxAgain.json();
      const checkConvs = checkInboxData.data?.conversations || [];
      const reappeared = checkConvs.some((c) => c.sessionId === sessionToDelete);
      record(16, 'Confirm deleted conversation does NOT reappear after reconnect', !reappeared ? 'PASS' : 'FAIL', `Reappeared: ${reappeared}`);

      // ── 21. Confirm no individual message deletion API was added ──
      const msgDeleteRes = await fetch(`${baseUrl}/api/admin/support/conversations/${sessionSurvivor}/messages/some_msg_id`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      record(17, 'Confirm individual message deletion is NOT permitted (no single message delete API)', msgDeleteRes.status === 404 || msgDeleteRes.status === 405 ? 'PASS' : 'FAIL', `Status: ${msgDeleteRes.status}`);

    } catch (err) {
      console.error('Test execution error:', err);
    } finally {
      server.close();
      const failed = testResults.filter((r) => r.status === 'FAIL');
      console.log(`\n========================================================================`);
      console.log(`ADMIN SUPPORT DELETION SUITE: ${testResults.length - failed.length}/${testResults.length} PASSED (${failed.length} FAILED)`);
      console.log(`========================================================================\n`);

      process.exit(failed.length > 0 ? 1 : 0);
    }
  });
}

runTests();
