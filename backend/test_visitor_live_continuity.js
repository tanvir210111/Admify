/**
 * ADMIFY - VISITOR AI → LIVE AGENT CONTINUITY & PERSISTENCE TEST
 * 
 * Verifies:
 * 1. Visitor creates one AI session.
 * 2. Visitor sends multiple AI messages (up to 4-message ceiling).
 * 3. AI replies remain in the same conversation (same sessionId/visitorToken).
 * 4. Visitor reaches AI handover state (5th message ceiling warning).
 * 5. Visitor submits Live Agent form.
 * 6. Live Agent request reuses the SAME session/conversation ID.
 * 7. No second conversation is created (idempotent handover).
 * 8. Admin Support Inbox returns one conversation entry per active visitor.
 * 9. Admin opening it receives the complete chronological AI history.
 * 10. Live Agent escalation event and live visitor messages appear after AI history.
 * 11. Admin reply appears in the same conversation thread and emits via socket.
 * 12. Repeated Live Agent form submissions are idempotent.
 * 13. Visitor session isolation (visitor cannot access another visitor's history).
 * 14. Socket.io uses the same authorized visitor room before and after escalation.
 * 15. Complete chronological sequence verified:
 *     AI msg 1 -> AI reply 1 -> AI msg 2 -> AI reply 2 -> AI msg 3 -> AI reply 3 ->
 *     AI msg 4 -> AI reply 4 -> Escalation Notice -> Visitor live reply -> Admin reply
 */

import http from 'http';
import express from 'express';
import cors from 'cors';
import { io as ClientIO } from 'socket.io-client';
import jwt from 'jsonwebtoken';

// App imports
import chatRoutes from './routes/chatRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { initSocketServer, emitToVisitor } from './socket/socketServer.js';
import devStore from './utils/devStore.js';

const PORT = 5098;
const JWT_SECRET = process.env.JWT_SECRET || 'admify_super_secret_jwt_fallback_key_2026';

const app = express();
app.use(cors());
app.use(express.json());

// Mount routes
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);

// Error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ success: false, message: err.message });
});

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
    console.log(`   ADMIFY VISITOR AI → LIVE AGENT CONVERSATION CONTINUITY TEST SUITE   `);
    console.log(`========================================================================\n`);

    const baseUrl = `http://localhost:${PORT}`;

    try {
      const db = devStore.read();
      const adminUser = (db.users || []).find((u) => u.role === 'admin') || {
        _id: '674e1a0b1234567890aa0001',
        name: 'Super Admin',
        email: 'admin@admify.com',
        role: 'admin',
      };
      const adminToken = generateToken(adminUser);

      // Clean test slate in devStore
      db.chatMessages = (db.chatMessages || []).filter(
        (m) => !m.sessionId?.startsWith('vis_continuity_')
      );
      db.visitorSessions = (db.visitorSessions || []).filter(
        (s) => !s.visitorToken?.startsWith('vis_continuity_')
      );
      devStore.write(db);

      const visitorSessionId = `vis_continuity_${Date.now()}`;

      // ── TEST 1: Visitor creates one AI session ──
      let msg1Res = await fetch(`${baseUrl}/api/chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: 'Tell me about Germany study options',
          visitorToken: visitorSessionId,
          sessionId: visitorSessionId,
        }),
      }).then((r) => r.json());

      const t1Pass =
        msg1Res.success &&
        msg1Res.visitorToken === visitorSessionId &&
        msg1Res.sessionId === visitorSessionId &&
        msg1Res.aiMessageCount === 1;
      record(1, 'Visitor creates one AI session and sends 1st question', t1Pass ? 'PASS' : 'FAIL', `Session: ${msg1Res.visitorToken}`);

      // ── TEST 2 & 3: Visitor sends multiple AI messages, replies stay in same conversation ──
      let msg2Res = await fetch(`${baseUrl}/api/chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: 'What about scholarships in Germany?',
          visitorToken: visitorSessionId,
          sessionId: visitorSessionId,
        }),
      }).then((r) => r.json());

      let msg3Res = await fetch(`${baseUrl}/api/chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: 'What are admission requirements?',
          visitorToken: visitorSessionId,
          sessionId: visitorSessionId,
        }),
      }).then((r) => r.json());

      let msg4Res = await fetch(`${baseUrl}/api/chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: 'Can I get post-study work opportunities?',
          visitorToken: visitorSessionId,
          sessionId: visitorSessionId,
        }),
      }).then((r) => r.json());

      const t2Pass =
        msg4Res.success &&
        msg4Res.aiMessageCount === 4 &&
        msg4Res.visitorToken === visitorSessionId;
      record(2, 'Visitor sends 4 AI messages and all decrement quota under same session', t2Pass ? 'PASS' : 'FAIL', `Count: ${msg4Res.aiMessageCount}`);

      const historyCheck = await fetch(`${baseUrl}/api/chat/history/${visitorSessionId}`).then((r) => r.json());
      const t3Pass =
        historyCheck.success &&
        historyCheck.count === 8 && // 4 user questions + 4 AI replies
        historyCheck.data.messages.every((m) => m.sessionId === visitorSessionId);
      record(3, 'All 4 AI questions and 4 AI replies remain stored under the SAME session', t3Pass ? 'PASS' : 'FAIL', `Stored: ${historyCheck.count} messages`);

      // ── TEST 4: Visitor reaches AI limit handover state ──
      let msg5Res = await fetch(`${baseUrl}/api/chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: 'Can you write my SOP for me?',
          visitorToken: visitorSessionId,
          sessionId: visitorSessionId,
        }),
      }).then((r) => r.json());

      const t4Pass =
        msg5Res.success &&
        msg5Res.limitReached === true &&
        msg5Res.offerLiveAgent === true;
      record(4, 'Visitor reaches AI handover state (5th message strictly blocked with offerLiveAgent)', t4Pass ? 'PASS' : 'FAIL', `Warning delivered: ${Boolean(msg5Res.warning)}`);

      // ── TEST 5 & 6: Visitor submits Live Agent form; reuses SAME session ID ──
      const visitorInfo = {
        fullName: 'Elena Rostova',
        email: 'elena.rostova@example.com',
        phone: '+49 176 98765432',
      };

      let liveReq1 = await fetch(`${baseUrl}/api/chat/live-agent-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitorToken: visitorSessionId,
          sessionId: visitorSessionId,
          ...visitorInfo,
        }),
      }).then((r) => r.json());

      const t5Pass =
        liveReq1.success &&
        liveReq1.visitorToken === visitorSessionId &&
        liveReq1.sessionId === visitorSessionId &&
        liveReq1.status === 'waiting_live_agent';
      record(5, 'Visitor submits Live Agent form successfully', t5Pass ? 'PASS' : 'FAIL', `Status: ${liveReq1.status}`);
      record(6, 'Live Agent request strictly reuses the SAME session/conversation ID', liveReq1.visitorToken === visitorSessionId ? 'PASS' : 'FAIL', `Token: ${liveReq1.visitorToken}`);

      // ── TEST 7: Repeated Live Agent form submission is idempotent (no duplicates) ──
      let liveReq2 = await fetch(`${baseUrl}/api/chat/live-agent-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitorToken: visitorSessionId,
          sessionId: visitorSessionId,
          ...visitorInfo,
        }),
      }).then((r) => r.json());

      const historyAfterDup = await fetch(`${baseUrl}/api/chat/history/${visitorSessionId}`).then((r) => r.json());
      const escalationNotices = historyAfterDup.data.messages.filter(
        (m) => m.isLiveAgentRequest === true
      );
      const t7Pass =
        liveReq2.success &&
        liveReq2.alreadyActive === true &&
        escalationNotices.length === 1;
      record(7, 'Repeated Live Agent form submission is idempotent (no duplicate escalation entries)', t7Pass ? 'PASS' : 'FAIL', `Escalation notices count: ${escalationNotices.length}`);

      // ── TEST 8: Admin Support Inbox returns ONE conversation entry for this visitor ──
      let adminConvsRes = await fetch(`${baseUrl}/api/admin/support/conversations`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      }).then((r) => r.json());

      const matchedConvs = (adminConvsRes.data?.conversations || []).filter(
        (c) => c.sessionId === visitorSessionId || c.student?.email === visitorInfo.email
      );
      const t8Pass =
        adminConvsRes.success &&
        matchedConvs.length === 1 &&
        matchedConvs[0].student?.name === visitorInfo.fullName &&
        matchedConvs[0].student?.email === visitorInfo.email;
      record(8, 'Admin Support Inbox returns exactly ONE conversation for the visitor (no duplicates)', t8Pass ? 'PASS' : 'FAIL', `Matches: ${matchedConvs.length}, Name: "${matchedConvs[0]?.student?.name}"`);

      // ── TEST 9: Admin opening conversation receives COMPLETE AI history ──
      let adminMsgsRes = await fetch(`${baseUrl}/api/admin/support/conversations/${visitorSessionId}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      }).then((r) => r.json());

      const msgs = adminMsgsRes.data?.messages || [];
      const aiVisitorMsgs = msgs.filter((m) => m.sender === 'visitor');
      const aiReplies = msgs.filter((m) => m.sender === 'ai');
      const hasEscalation = msgs.some((m) => m.isLiveAgentRequest);

      const t9Pass =
        adminMsgsRes.success &&
        msgs.length >= 9 && // 4 user + 4 ai + 1 escalation notice
        aiVisitorMsgs.length === 4 &&
        aiReplies.length === 4 &&
        hasEscalation;
      record(9, 'Admin opening conversation receives COMPLETE AI history (4 questions + 4 replies + escalation)', t9Pass ? 'PASS' : 'FAIL', `Total: ${msgs.length} messages, AI Q: ${aiVisitorMsgs.length}, AI R: ${aiReplies.length}`);

      // ── TEST 10: Visitor sends Live Agent message -> appears after AI history ──
      let visitorLiveReply = await fetch(`${baseUrl}/api/chat/visitor-reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitorToken: visitorSessionId,
          sessionId: visitorSessionId,
          text: 'Hello advisor, I need help with DAAD scholarship deadlines',
        }),
      }).then((r) => r.json());

      const t10Pass =
        visitorLiveReply.success &&
        visitorLiveReply.data?.message?.sessionId === visitorSessionId &&
        visitorLiveReply.data?.message?.sender === 'visitor';
      record(10, 'Visitor Live Agent message persists in the SAME conversation', t10Pass ? 'PASS' : 'FAIL', `Message ID: ${visitorLiveReply.data?.message?._id}`);

      // ── TEST 11: Admin replies in same conversation and socket delivers ──
      let adminReplyRes = await fetch(`${baseUrl}/api/admin/support/conversations/${visitorSessionId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          text: 'Hello Elena! The DAAD scholarship deadline for Fall is October 31st. I will guide you through each requirement.',
        }),
      }).then((r) => r.json());

      const t11Pass =
        adminReplyRes.success &&
        (adminReplyRes.data?.message?.sessionId === visitorSessionId || adminReplyRes.data?.reply?.sessionId === visitorSessionId) &&
        adminReplyRes.data?.message?.sender === 'agent';
      record(11, 'Admin reply persists in the SAME conversation with sender="agent"', t11Pass ? 'PASS' : 'FAIL', `Reply saved: ${t11Pass}`);

      // ── TEST 12: Chronological Sequence Verification (ALL INSIDE ONE THREAD) ──
      let finalMsgsRes = await fetch(`${baseUrl}/api/admin/support/conversations/${visitorSessionId}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      }).then((r) => r.json());

      const finalMsgs = finalMsgsRes.data?.messages || [];
      const expectedSequence = [
        'visitor', // AI Q1
        'ai',      // AI R1
        'visitor', // AI Q2
        'ai',      // AI R2
        'visitor', // AI Q3
        'ai',      // AI R3
        'visitor', // AI Q4
        'ai',      // AI R4
        'system',  // Escalation notice
        'visitor', // Visitor live message
        'agent',   // Admin advisor reply
      ];

      const actualSenders = finalMsgs.map((m) => m.sender);
      let sequenceMatches =
        finalMsgs.length === expectedSequence.length &&
        expectedSequence.every((expectedSender, idx) => actualSenders[idx] === expectedSender);

      record(12, 'Chronological Sequence: Q1->R1->Q2->R2->Q3->R3->Q4->R4->Escalation->VisitorLive->AdminReply', sequenceMatches ? 'PASS' : 'FAIL', `Actual senders: [${actualSenders.join(', ')}]`);

      // ── TEST 13: Visitor Session Isolation (cannot access other visitor sessions) ──
      const otherVisitorSession = `vis_other_${Date.now()}`;
      await fetch(`${baseUrl}/api/chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: 'Private inquiry from other visitor',
          visitorToken: otherVisitorSession,
          sessionId: otherVisitorSession,
        }),
      });

      const otherHistory = await fetch(`${baseUrl}/api/chat/history/${otherVisitorSession}`).then((r) => r.json());
      const elenaHistory = await fetch(`${baseUrl}/api/chat/history/${visitorSessionId}`).then((r) => r.json());

      const isolationPass =
        otherHistory.data.messages.every((m) => m.sessionId === otherVisitorSession) &&
        elenaHistory.data.messages.every((m) => m.sessionId === visitorSessionId) &&
        !otherHistory.data.messages.some((m) => m.text.includes('Elena Rostova')) &&
        !elenaHistory.data.messages.some((m) => m.text.includes('Private inquiry from other visitor'));

      record(13, 'Strict visitor session isolation preserved (separate visitors cannot leak messages)', isolationPass ? 'PASS' : 'FAIL', `Elena: ${elenaHistory.count} msgs, Other: ${otherHistory.count} msgs`);

      // ── TEST 14: Socket.io Room Continuity (same room before and after escalation) ──
      let socketReplyDelivered = false;
      const testSocket = ClientIO(`http://localhost:${PORT}`, {
        auth: { visitorToken: visitorSessionId },
        transports: ['websocket'],
        forceNew: true,
        reconnection: false,
      });

      await new Promise((resolve) => {
        testSocket.once('connect', resolve);
        testSocket.once('connect_error', () => resolve());
      });

      testSocket.on('admin_support_reply', (payload) => {
        if (payload?.text?.includes('October 31st') || payload?.message?.text?.includes('October 31st')) {
          socketReplyDelivered = true;
        }
      });

      // Emit another live reply to test socket delivery
      emitToVisitor(visitorSessionId, 'admin_support_reply', {
        sessionId: visitorSessionId,
        text: 'Reminder: October 31st is the strict deadline.',
        sender: 'agent',
      });

      await new Promise((r) => setTimeout(r, 600));
      testSocket.disconnect();

      record(14, 'Socket.io uses same visitor room (visitor:${token}) before and after Live Agent escalation', socketReplyDelivered ? 'PASS' : 'FAIL', `Delivered: ${socketReplyDelivered}`);

      // ── TEST 15: No "No message history found" for valid conversation ──
      const t15Pass = finalMsgs.length > 0 && adminConvsRes.data?.conversations.some((c) => c.sessionId === visitorSessionId);
      record(15, 'Admin selecting valid conversation always loads non-empty history (no false empty state)', t15Pass ? 'PASS' : 'FAIL', `Loaded ${finalMsgs.length} messages`);

      // Summary
      const passed = testResults.filter((r) => r.status === 'PASS').length;
      const failed = testResults.filter((r) => r.status === 'FAIL').length;
      console.log(`\n========================================================================`);
      console.log(`VISITOR AI → LIVE AGENT CONTINUITY TESTS: ${passed}/${testResults.length} PASSED (${failed} FAILED)`);
      console.log(`========================================================================\n`);

      server.close(() => {
        process.exit(failed > 0 ? 1 : 0);
      });
    } catch (err) {
      console.error('Fatal test error:', err);
      server.close(() => process.exit(1));
    }
  });
}

runTests();
