/**
 * ADMIFY - ADMIN SUPPORT INBOX HISTORY & RESOLUTION VERIFICATION TEST
 * 
 * Specifically tests:
 * A. Create visitor session
 * B. Send AI message
 * C. Receive AI reply
 * D. Send another AI message
 * E. Escalate to Live Agent
 * F. Send visitor live-agent message
 * G. Send Admin reply
 * H. Fetch Support Inbox list (GET /api/admin/support/conversations)
 * I. Select the exact visitor/session ID returned by the list
 * J. Fetch history using the SAME ID that AdminSupport uses
 * K. Verify ALL messages are returned chronologically
 * L. Verify AI + Live Agent messages are in ONE history
 * M. Verify no duplicate conversation is created
 * N. Verify invalid/random ID still returns proper 404/resource-not-found behavior
 * O. Verify another visitor cannot access this visitor's history
 */

import http from 'http';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

// App imports
import chatRoutes from './routes/chatRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { initSocketServer } from './socket/socketServer.js';
import devStore from './utils/devStore.js';
import { errorHandler } from './middleware/errorMiddleware.js';

const PORT = 5099;
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
function record(step, name, status, details = '') {
  testResults.push({ step, name, status, details });
  const icon = status === 'PASS' ? '✅' : '❌';
  console.log(`${icon} STEP ${step}: ${name} -> [${status}] ${details ? `(${details})` : ''}`);
}

async function runTests() {
  server.listen(PORT, async () => {
    console.log(`\n========================================================================`);
    console.log(`      ADMIFY ADMIN SUPPORT INBOX HISTORY & CONTINUITY REGRESSION TEST     `);
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

      // Clean test slate
      db.chatMessages = (db.chatMessages || []).filter(
        (m) => !m.sessionId?.startsWith('vis_support_test_')
      );
      db.visitorSessions = (db.visitorSessions || []).filter(
        (s) => !s.visitorToken?.startsWith('vis_support_test_')
      );
      devStore.write(db);

      const visitorSessionId = `vis_support_test_${Date.now()}`;

      // ── STEP A & B: Create visitor session & send AI message ──
      const resB = await fetch(`${baseUrl}/api/chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitorToken: visitorSessionId,
          sessionId: visitorSessionId,
          text: 'Tell me about studying in Germany and English taught programs.',
        }),
      });
      const dataB = await resB.json();
      const passB = resB.status === 200 && dataB.success && dataB.data?.reply?.text;
      record('A/B', 'Create visitor session & send AI message 1', passB ? 'PASS' : 'FAIL', `Status: ${resB.status}`);

      // ── STEP C: Receive AI reply ──
      const reply1 = dataB.data?.reply?.text;
      const passC = Boolean(reply1 && reply1.length > 20);
      record('C', 'Receive valid grounded AI reply 1', passC ? 'PASS' : 'FAIL', `Length: ${reply1?.length || 0}`);

      // ── STEP D: Send another AI message ──
      const resD = await fetch(`${baseUrl}/api/chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitorToken: visitorSessionId,
          sessionId: visitorSessionId,
          text: 'What scholarships are available for international students?',
        }),
      });
      const dataD = await resD.json();
      const passD = resD.status === 200 && dataD.success && dataD.data?.reply?.text;
      record('D', 'Send AI message 2 and receive AI reply 2', passD ? 'PASS' : 'FAIL', `Status: ${resD.status}`);

      // ── STEP E: Escalate to Live Agent ──
      const resE = await fetch(`${baseUrl}/api/chat/live-agent-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitorToken: visitorSessionId,
          sessionId: visitorSessionId,
          fullName: 'Rafi Khan',
          email: 'rafi.khan.test@gmail.com',
          phone: '+4917612345678',
        }),
      });
      const dataE = await resE.json();
      const passE = resE.status === 200 && dataE.success && dataE.status === 'waiting_live_agent';
      record('E', 'Escalate to Live Agent with contact details', passE ? 'PASS' : 'FAIL', `Status: ${dataE.status}`);

      // ── STEP F: Send visitor live-agent message ──
      const resF = await fetch(`${baseUrl}/api/chat/visitor-reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitorToken: visitorSessionId,
          sessionId: visitorSessionId,
          text: 'poland',
        }),
      });
      const dataF = await resF.json();
      const passF = resF.status === 201 && dataF.success && dataF.data?.message?.text === 'poland';
      record('F', 'Send visitor live-agent message ("poland")', passF ? 'PASS' : 'FAIL', `Delivered: ${passF}`);

      // ── STEP G: Send Admin reply ──
      const resG = await fetch(`${baseUrl}/api/admin/support/conversations/${visitorSessionId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          text: 'Hello Rafi! Poland offers top universities like University of Warsaw with affordable tuition.',
        }),
      });
      const dataG = await resG.json();
      const passG = resG.status === 201 && dataG.success;
      record('G', 'Send Admin live-agent reply', passG ? 'PASS' : 'FAIL', `Status: ${resG.status}`);

      // ── STEP H: Fetch Support Inbox list ──
      const resH = await fetch(`${baseUrl}/api/admin/support/conversations`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const dataH = await resH.json();
      const conversations = dataH.data?.conversations || [];
      const rafiConv = conversations.find(
        (c) => c.sessionId === visitorSessionId || c.id === visitorSessionId || c.student?.email === 'rafi.khan.test@gmail.com'
      );
      const passH = resH.status === 200 && Boolean(rafiConv);
      record('H', 'Fetch Support Inbox list and locate visitor', passH ? 'PASS' : 'FAIL', `Found Rafi: ${Boolean(rafiConv)}`);

      // ── STEP I: Select exact visitor/session ID returned by the list ──
      const selectedId = rafiConv?.sessionId || rafiConv?.id || rafiConv?._id;
      const passI = selectedId === visitorSessionId;
      record('I', 'Select exact visitor/session ID returned by inbox list', passI ? 'PASS' : 'FAIL', `Selected: ${selectedId}`);

      // ── STEP J: Fetch history using the SAME ID that AdminSupport uses ──
      // Also verify markEntityAsSeen PUT request succeeds without CastError
      const seenRes = await fetch(`${baseUrl}/api/admin/seen/support/${selectedId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
      });
      const seenData = await seenRes.json();
      const passSeen = seenRes.status === 200 && seenData.success;

      const resJ = await fetch(`${baseUrl}/api/admin/support/conversations/${selectedId}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const dataJ = await resJ.json();
      const messages = dataJ.data?.messages || [];
      const passJ = resJ.status === 200 && dataJ.success && passSeen && messages.length > 0;
      record('J', 'Fetch conversation history using selected ID (no CastError, no false 404)', passJ ? 'PASS' : 'FAIL', `Status: ${resJ.status}, Messages: ${messages.length}`);

      // ── STEP K: Verify ALL messages are returned chronologically ──
      const senders = messages.map((m) => m.sender);
      let isChronological = true;
      for (let i = 1; i < messages.length; i++) {
        if (new Date(messages[i].createdAt) < new Date(messages[i - 1].createdAt)) {
          isChronological = false;
          break;
        }
      }
      const passK = isChronological && messages.length >= 6;
      record('K', 'Verify messages are returned in chronological order', passK ? 'PASS' : 'FAIL', `Total: ${messages.length}, Order: ${senders.join('->')}`);

      // ── STEP L: Verify AI + Live Agent messages are in ONE history ──
      const hasAiQ = messages.some((m) => m.sender === 'visitor' && m.text.includes('Germany'));
      const hasAiReply = messages.some((m) => m.sender === 'ai');
      const hasEscalation = messages.some((m) => m.sender === 'system' || m.isLiveAgentRequest);
      const hasVisitorLive = messages.some((m) => m.sender === 'visitor' && m.text === 'poland');
      const hasAdminReply = messages.some((m) => m.sender === 'agent' || m.sender === 'admin');
      const passL = hasAiQ && hasAiReply && hasEscalation && hasVisitorLive && hasAdminReply;
      record('L', 'Verify AI + Live Agent messages are unified in ONE history', passL ? 'PASS' : 'FAIL', `All parts present: ${passL}`);

      // ── STEP M: Verify no duplicate conversation is created ──
      const rafiMatches = conversations.filter(
        (c) => c.sessionId === visitorSessionId || c.student?.email === 'rafi.khan.test@gmail.com'
      );
      const passM = rafiMatches.length === 1;
      record('M', 'Verify exactly ONE conversation entry in Admin Support Inbox (no duplicates)', passM ? 'PASS' : 'FAIL', `Matches: ${rafiMatches.length}`);

      // ── STEP N: Verify invalid/random ID still returns proper 404/resource-not-found behavior ──
      const invalidId = 'vis_invalid_random_session_99999999';
      const resN = await fetch(`${baseUrl}/api/admin/support/conversations/${invalidId}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const dataN = await resN.json();
      const passN = resN.status === 404 && dataN.success === false && dataN.message?.includes('Resource not found');
      record('N', 'Verify invalid/random ID returns HTTP 404 resource-not-found', passN ? 'PASS' : 'FAIL', `Status: ${resN.status}, Message: "${dataN.message}"`);

      // ── STEP O: Verify another visitor cannot access this visitor's history ──
      const otherVisitorSession = `vis_other_visitor_${Date.now()}`;
      const resO = await fetch(`${baseUrl}/api/chat/history/${otherVisitorSession}`);
      const dataO = await resO.json();
      const otherMessages = dataO.data?.messages || [];
      const hasRafiMessage = otherMessages.some((m) => m.text?.includes('poland') || m.text?.includes('Germany'));
      const passO = resO.status === 200 && !hasRafiMessage && otherMessages.length === 0;
      record('O', 'Verify strict visitor session isolation (other visitor cannot see history)', passO ? 'PASS' : 'FAIL', `Isolated: ${passO}`);

    } catch (err) {
      console.error('Test execution error:', err);
    } finally {
      server.close();
      const failed = testResults.filter((r) => r.status === 'FAIL');
      console.log(`\n========================================================================`);
      console.log(`ADMIN SUPPORT INBOX HISTORY TESTS: ${testResults.length - failed.length}/${testResults.length} PASSED (${failed.length} FAILED)`);
      console.log(`========================================================================\n`);

      process.exit(failed.length > 0 ? 1 : 0);
    }
  });
}

runTests();
