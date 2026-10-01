/**
 * ADMIFY FINAL MASTER VERIFICATION SUITE
 *
 * Verifies all Master Requirements:
 * 1. Real Gemini Integration (@google/genai, gemini-3.5-flash-lite, fallback, database grounding)
 * 2. Public Chatbot 4-message ceiling, 5th message blocked with exact warning, quota preservation
 * 3. Live Agent escalation, intake validation (Name, Email, Phone), session token & DB persistence
 * 4. Visitor <-> Admin Socket.io bidirectional support messaging
 * 5. Public Chat IP Rate Limiting (429 Too Many Requests)
 * 6. Master Rule 1: Message deletion strictly prohibited (405 Method Not Allowed)
 * 7. Master Rule 2: Exactly 3-Minute Edit Window (180,000 ms)
 * 8. Communication Matrix (Admin Mode 2 direct chat, Student <-> Uni Rep, Agent <-> Uni Rep)
 * 9. AI Endpoints (SOP, LOR, Admission Probability, Profile Strength)
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import express from 'express';
import { io as ClientIO } from 'socket.io-client';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

import devStore from './utils/devStore.js';
import * as geminiService from './services/geminiService.js';
import * as messagingService from './services/messagingService.js';
import { initSocketServer, emitToVisitor } from './socket/socketServer.js';
import chatRoutes from './routes/chatRoutes.js';
import conversationRoutes from './routes/conversationRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

const JWT_SECRET = process.env.JWT_SECRET || 'admify_secret_key_12345';

function generateToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

const results = [];
function record(testNum, name, status, details = '') {
  results.push({ testNum, name, status, details });
  const sym = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  console.log(`${sym} TEST ${testNum}: ${name} -> [${status}] ${details ? '(' + details + ')' : ''}`);
}

async function runMasterVerification() {
  console.log('========================================================================');
  console.log('          ADMIFY FINAL MASTER COMPREHENSIVE VERIFICATION SUITE          ');
  console.log('========================================================================\n');

  const app = express();
  app.use(express.json());

  // Set up test server
  const httpServer = http.createServer(app);
  initSocketServer(httpServer, '*');

  app.use('/api/chat', chatRoutes);
  app.use('/api/conversations', conversationRoutes);
  app.use('/api/ai', aiRoutes);

  const PORT = 5095;
  await new Promise(resolve => httpServer.listen(PORT, resolve));
  const baseUrl = `http://127.0.0.1:${PORT}`;

  const db = devStore.read();
  const studentUser = db.users.find(u => u.role === 'student' && u._id === 'stu_1790672153631') ||
    db.users.find(u => u.role === 'student');
  const agentUser = db.users.find(u => u.role === 'agent' && u._id === 'agt_a_1790672153631') ||
    db.users.find(u => u.role === 'agent');
  const adminUser = db.users.find(u => u.role === 'admin') ||
    db.users.find(u => u.role === 'super_admin');
  const uniRepUser = db.users.find(u => u.role === 'university_rep' || u.role === 'university_representative') ||
    { _id: 'rep_master_test_1', role: 'university_representative', email: 'rep@admify.com' };
  const agencyUser = db.users.find(u => u.role === 'agency') ||
    { _id: 'agency_master_test_1', role: 'agency', email: 'agency@admify.com' };

  try {
    // ─────────────────────────────────────────────────────────────
    // SECTION 1: GEMINI SERVICE & LIVE AI ENGINE
    // ─────────────────────────────────────────────────────────────
    console.log('--- SECTION 1: GEMINI SERVICE & LIVE AI ENGINE ---');

    // 1. Gemini is configured with API key
    const isConfigured = geminiService.isGeminiConfigured();
    record(1, 'Gemini service is configured with valid API key', isConfigured ? 'PASS' : 'FAIL', isConfigured ? 'Configured (backend only)' : 'Key missing');

    // 2. Live AI Chat response generation
    let liveChatResp = null;
    try {
      liveChatResp = await geminiService.generateChatResponse({
        prompt: 'What are the top 3 universities in Canada for Computer Science?',
        conversationHistory: [],
      });
    } catch (err) {
      console.error('Gemini call error:', err);
    }
    const hasValidChatResp = liveChatResp && liveChatResp.length > 20;
    record(2, 'Gemini live AI chat response generated successfully', hasValidChatResp ? 'PASS' : 'FAIL', `Length: ${liveChatResp?.length || 0} chars`);

    // 3. Admission Probability AI reasoning
    let probResult = null;
    try {
      probResult = await geminiService.generateAdmissionProbability({
        gpa: 3.8,
        ielts: 7.5,
        gre: 320,
        universityRank: 25,
        workExperienceYears: 2,
        calculatedScore: 78,
        mathBreakdown: { category: 'Target', academicFactor: 85, testFactor: 80 },
      });
    } catch (err) {
      console.error('Probability AI call error:', err);
    }
    const probValid = probResult && typeof probResult.probability === 'number' && (probResult.aiAnalysis || probResult.qualitativeAnalysis || probResult.reasoning);
    record(3, 'Gemini live Admission Probability calculation returns grounded score & analysis', probValid ? 'PASS' : 'FAIL', `Score: ${probResult?.probability}%, Recommendations: ${probResult?.recommendations?.length || 0}`);

    // ─────────────────────────────────────────────────────────────
    // SECTION 2: PUBLIC CHATBOT 4-MESSAGE LIMIT & CEILING WARNING
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- SECTION 2: PUBLIC CHATBOT 4-MESSAGE CEILING & WARNING ---');

    const testSessionId = `test_ses_${Date.now()}`;
    const exactCeilingWarning = "I’m an AI chatbot and may not always provide accurate or up-to-date information. For accurate information and personalized assistance, please talk to a live agent.";

    let msg1Res = await fetch(`${baseUrl}/api/chat/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Hello, what programs are offered?', sessionId: testSessionId }),
    }).then(r => r.json());
    record(4, 'Chatbot accepts 1st message and decrements quota', msg1Res.success && msg1Res.remainingMessages === 3 ? 'PASS' : 'FAIL', `Remaining: ${msg1Res.remainingMessages}`);

    let msg2Res = await fetch(`${baseUrl}/api/chat/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'What is the IELTS requirement?', sessionId: testSessionId }),
    }).then(r => r.json());
    record(5, 'Chatbot accepts 2nd message and decrements quota', msg2Res.success && msg2Res.remainingMessages === 2 ? 'PASS' : 'FAIL', `Remaining: ${msg2Res.remainingMessages}`);

    let msg3Res = await fetch(`${baseUrl}/api/chat/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Are there scholarships for international students?', sessionId: testSessionId }),
    }).then(r => r.json());
    record(6, 'Chatbot accepts 3rd message and decrements quota', msg3Res.success && msg3Res.remainingMessages === 1 ? 'PASS' : 'FAIL', `Remaining: ${msg3Res.remainingMessages}`);

    let msg4Res = await fetch(`${baseUrl}/api/chat/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'How do I apply?', sessionId: testSessionId }),
    }).then(r => r.json());
    record(7, 'Chatbot accepts 4th message and quota reaches 0', msg4Res.success && msg4Res.remainingMessages === 0 ? 'PASS' : 'FAIL', `Remaining: ${msg4Res.remainingMessages}`);

    // 5th message MUST be blocked with exact warning
    let msg5Res = await fetch(`${baseUrl}/api/chat/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Tell me more details please', sessionId: testSessionId }),
    }).then(r => r.json());

    const warningMatches = (msg5Res.reply === exactCeilingWarning) || (msg5Res.warning === exactCeilingWarning);
    const ceilingEnforced = msg5Res.limitReached === true && (msg5Res.offerLiveAgent === true || msg5Res.canEscalateToLive === true) && warningMatches;
    record(8, 'Chatbot strictly blocks 5th message with exact warning and live agent trigger', ceilingEnforced ? 'PASS' : 'FAIL', `Warning match: ${warningMatches}`);

    // ─────────────────────────────────────────────────────────────
    // SECTION 3: VISITOR LIVE AGENT ESCALATION & INTAKE FORM
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- SECTION 3: VISITOR ESCALATION & INTAKE VALIDATION ---');

    // Intake validation: Missing required fields
    let invalidIntakeRes = await fetch(`${baseUrl}/api/chat/live-agent-request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName: 'John Doe', email: 'not-an-email', sessionId: testSessionId }),
    });
    record(9, 'Live Agent intake rejects invalid email/missing phone with 400', invalidIntakeRes.status === 400 ? 'PASS' : 'FAIL', `Status: ${invalidIntakeRes.status}`);

    // Valid intake request
    let validIntakeRes = await fetch(`${baseUrl}/api/chat/live-agent-request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Alex Mercer',
        email: 'alex.mercer@gmail.com',
        phone: '+1 555-019-2834',
        initialQuery: 'Need help with UK university visa requirement',
        sessionId: testSessionId,
      }),
    });
    const intakeData = await validIntakeRes.json();
    const intakeSuccess = validIntakeRes.status === 200 && intakeData.success && intakeData.visitorToken && intakeData.visitorToken.startsWith('vis_');
    record(10, 'Live Agent intake creates valid session token and persists ticket', intakeSuccess ? 'PASS' : 'FAIL', `Token: ${intakeData.visitorToken}`);

    // ─────────────────────────────────────────────────────────────
    // SECTION 4: VISITOR <-> ADMIN REAL-TIME SUPPORT (SOCKET.IO)
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- SECTION 4: VISITOR <-> ADMIN REAL-TIME SUPPORT ---');

    const visitorToken = intakeData.visitorToken;
    let visitorReceivedReply = null;

    const visitorSocket = ClientIO(`http://localhost:${PORT}`, {
      auth: { visitorToken },
      transports: ['websocket'],
      forceNew: true,
      reconnection: false,
      timeout: 3000,
    });

    const adminSocket = ClientIO(`http://localhost:${PORT}`, {
      auth: { token: generateToken(adminUser) },
      transports: ['websocket'],
      forceNew: true,
      reconnection: false,
      timeout: 3000,
    });

    await new Promise((resolve, reject) => {
      visitorSocket.once('connect', resolve);
      visitorSocket.once('connect_error', (err) => {
        console.error('visitorSocket connect_error:', err.message);
        resolve();
      });
    });
    await new Promise((resolve, reject) => {
      adminSocket.once('connect', resolve);
      adminSocket.once('connect_error', (err) => {
        console.error('adminSocket connect_error:', err.message);
        resolve();
      });
    });

    visitorSocket.on('admin_support_reply', (data) => {
      visitorReceivedReply = data;
    });

    // Visitor sends a reply
    let visitorReplyRes = await fetch(`${baseUrl}/api/chat/visitor-reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        visitorToken,
        text: 'Hello admin, I am waiting for human assistance!',
      }),
    }).then(r => r.json());
    record(11, 'Visitor sends message via /api/chat/visitor-reply', visitorReplyRes.success ? 'PASS' : 'FAIL', `Reply persisted: ${visitorReplyRes.success}`);

    // Admin sends response to visitor via emitToVisitor
    emitToVisitor(visitorToken, 'admin_support_reply', {
      text: 'Hello Alex! I am an Admify Senior Advisor. How can I assist with your UK visa?',
      senderName: 'Admin Desk',
      timestamp: new Date().toISOString(),
    });

    await new Promise(resolve => setTimeout(resolve, 500));
    const socketDelivered = visitorReceivedReply !== null && visitorReceivedReply.text.includes('Senior Advisor');
    record(12, 'Admin reply delivered to visitor socket in real time', socketDelivered ? 'PASS' : 'FAIL', `Received: "${visitorReceivedReply?.text?.substring(0, 30)}..."`);

    visitorSocket.disconnect();
    adminSocket.disconnect();

    // ─────────────────────────────────────────────────────────────
    // SECTION 5: PUBLIC CHAT RATE LIMITING (429)
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- SECTION 5: PUBLIC CHAT RATE LIMITING ---');

    const floodPromises = [];
    for (let i = 0; i < 35; i++) {
      floodPromises.push(
        fetch(`${baseUrl}/api/chat/message`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: `Flood ping ${i}`, sessionId: testSessionId }),
        })
      );
    }
    const floodResponses = await Promise.all(floodPromises);
    const has429 = floodResponses.some(r => r.status === 429);
    record(13, 'Public chat rate limiter blocks excessive requests with HTTP 429', has429 ? 'PASS' : 'FAIL', `Found 429: ${has429}`);

    // ─────────────────────────────────────────────────────────────
    // SECTION 6: MASTER RULE 1 - MESSAGE DELETION STRICTLY PROHIBITED
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- SECTION 6: MASTER RULE 1 (MESSAGE DELETION STRICTLY PROHIBITED) ---');

    // Setup a conversation and message
    const conv = await messagingService.resolveConversation(studentUser, agentUser);
    const msg = await messagingService.createMessage({
      conversationId: conv._id,
      senderUser: studentUser,
      text: 'Message that must never be deleted',
    });

    // Attempt softDeleteMessage service call
    let serviceDeleteBlocked = false;
    try {
      await messagingService.softDeleteMessage(conv._id, msg._id, studentUser._id);
    } catch (err) {
      serviceDeleteBlocked = err.statusCode === 405 || err.message.includes('Message deletion is not permitted');
    }
    record(14, 'messagingService.softDeleteMessage rejects deletion with 405 Method Not Allowed', serviceDeleteBlocked ? 'PASS' : 'FAIL', 'Deletion blocked by service');

    // Attempt API DELETE call
    const deleteApiRes = await fetch(`${baseUrl}/api/conversations/${conv._id}/messages/${msg._id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${generateToken(studentUser)}`,
      },
    });
    const deleteApiData = await deleteApiRes.json();
    const deleteApiBlocked = deleteApiRes.status === 405 && deleteApiData.message.includes('not permitted');
    record(15, 'DELETE /api/conversations/:id/messages/:messageId returns 405 Method Not Allowed', deleteApiBlocked ? 'PASS' : 'FAIL', `Status: ${deleteApiRes.status}, Message: "${deleteApiData.message}"`);

    // Verify message is intact in database
    const dbCheck = devStore.read();
    const storedMsg = (dbCheck.chatMessages || []).find(m => m._id === msg._id);
    const msgPreserved = storedMsg && !storedMsg.isDeleted;
    record(16, 'Message content remains intact and undeleted in persistent store', msgPreserved ? 'PASS' : 'FAIL', `isDeleted: ${storedMsg?.isDeleted || false}`);

    // ─────────────────────────────────────────────────────────────
    // SECTION 7: MASTER RULE 2 - EXACTLY 3-MINUTE EDIT WINDOW (180,000 MS)
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- SECTION 7: MASTER RULE 2 (EXACTLY 3-MINUTE EDIT WINDOW) ---');

    // Create fresh message to test within 3 minutes
    const freshMsg = await messagingService.createMessage({
      conversationId: conv._id,
      senderUser: studentUser,
      text: 'Original fresh text',
    });

    const editWithin3Min = await messagingService.editMessage(
      conv._id,
      freshMsg._id,
      studentUser._id,
      'Edited within 3 minutes'
    );
    const editWithinSuccess = editWithin3Min.text === 'Edited within 3 minutes' && editWithin3Min.isEdited === true;
    record(17, 'Message edit within 3 minutes succeeds and sets isEdited flag', editWithinSuccess ? 'PASS' : 'FAIL', `Edited text: "${editWithin3Min?.text}"`);

    // Simulate message aged 3 minutes and 5 seconds (185,000 ms)
    const agedMsg = await messagingService.createMessage({
      conversationId: conv._id,
      senderUser: studentUser,
      text: 'Aged text created over 3 mins ago',
    });
    const dbAged = devStore.read();
    const agedIndex = dbAged.chatMessages.findIndex(m => m._id === agedMsg._id);
    if (agedIndex !== -1) {
      dbAged.chatMessages[agedIndex].createdAt = new Date(Date.now() - 185000).toISOString();
      devStore.write(dbAged);
    }

    let agedEditBlocked = false;
    let agedEditErrorMsg = '';
    try {
      await messagingService.editMessage(
        conv._id,
        agedMsg._id,
        studentUser._id,
        'Attempting illegal edit after 3 mins'
      );
    } catch (err) {
      agedEditBlocked = true;
      agedEditErrorMsg = err.message;
    }
    const editWindowExact = agedEditBlocked && (agedEditErrorMsg.includes('3-minute') || agedEditErrorMsg.includes('3 minute'));
    record(18, 'Message edit after 3 minutes (185s) is strictly rejected', editWindowExact ? 'PASS' : 'FAIL', agedEditErrorMsg);

    // ─────────────────────────────────────────────────────────────
    // SECTION 8: COMMUNICATION MATRIX & ADMIN DIRECT CHAT MODE 2
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- SECTION 8: COMMUNICATION MATRIX & ADMIN MODE 2 ---');

    // Admin Direct Chat (Mode 2) with Student
    const adminStudentPerm = await messagingService.verifyMessagingPermission(adminUser, studentUser);
    record(19, 'Admin Mode 2 Direct Chat permitted with Student', adminStudentPerm.authorized ? 'PASS' : 'FAIL', adminStudentPerm.reason || 'Mode 2 authorized');

    // Admin Direct Chat (Mode 2) with Uni Rep
    const adminUniRepPerm = await messagingService.verifyMessagingPermission(adminUser, uniRepUser);
    record(20, 'Admin Mode 2 Direct Chat permitted with University Representative', adminUniRepPerm.authorized ? 'PASS' : 'FAIL', adminUniRepPerm.reason || 'Mode 2 authorized');

    // Student <-> Uni Rep linked by application
    const dbMatrix = devStore.read();
    if (!Array.isArray(dbMatrix.applications)) dbMatrix.applications = [];
    dbMatrix.applications.push({
      _id: 'app_matrix_test_' + Date.now(),
      student: studentUser._id,
      studentId: studentUser._id,
      universityRepresentativeId: uniRepUser._id,
      universityRepresentative: uniRepUser._id,
      status: 'SUBMITTED',
    });
    devStore.write(dbMatrix);

    const studentUniRepPerm = await messagingService.verifyMessagingPermission(studentUser, uniRepUser);
    record(21, 'Student <-> University Rep messaging authorized via linked application', studentUniRepPerm.authorized ? 'PASS' : 'FAIL', studentUniRepPerm.reason || 'Application linked');

    // Agent <-> Uni Rep linked by agency partnership
    if (!Array.isArray(dbMatrix.universityAgencyConnections)) dbMatrix.universityAgencyConnections = [];
    dbMatrix.universityAgencyConnections.push({
      _id: 'conn_matrix_test_' + Date.now(),
      agencyId: agencyUser._id,
      agency: agencyUser._id,
      universityRepresentativeId: uniRepUser._id,
      universityRepresentative: uniRepUser._id,
      status: 'ACCEPTED',
    });
    // Link agent to agency
    const agtIdx = dbMatrix.users.findIndex(u => u._id === agentUser._id);
    if (agtIdx !== -1) {
      dbMatrix.users[agtIdx].agencyId = agencyUser._id;
    }
    devStore.write(dbMatrix);

    const agentUniRepPerm = await messagingService.verifyMessagingPermission(agentUser, uniRepUser);
    record(22, 'Agent <-> University Rep messaging authorized via agency partnership', agentUniRepPerm.authorized ? 'PASS' : 'FAIL', agentUniRepPerm.reason || 'Partnership linked');

    // ─────────────────────────────────────────────────────────────
    // SECTION 9: AI REASONING ENDPOINTS (SOP & PROFILE STRENGTH)
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- SECTION 9: AI REASONING ENDPOINTS ---');

    // SOP Generator endpoint
    const sopRes = await fetch(`${baseUrl}/api/ai/sop`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${generateToken(studentUser)}`,
      },
      body: JSON.stringify({
        targetProgram: 'MSc Data Science',
        targetUniversity: 'Oxford University',
        academicBackground: 'BSc Computer Science with First Class Honours',
        careerGoals: 'Lead machine learning research in healthcare',
        keyAchievements: 'Published research paper on convolutional neural networks',
      }),
    });
    const sopData = await sopRes.json();
    const sopDoc = sopData.data?.document || sopData.sop || sopData.document;
    const sopValid = sopRes.status === 200 && Boolean(sopDoc && sopDoc.length > 50);
    record(23, 'POST /api/ai/sop generates structured Statement of Purpose', sopValid ? 'PASS' : 'FAIL', `Length: ${sopDoc?.length || 0} chars`);

    // Profile Strength AI endpoint
    const profileRes = await fetch(`${baseUrl}/api/ai/profile-strength`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${generateToken(studentUser)}`,
      },
      body: JSON.stringify({
        gpa: 3.7,
        ieltsScore: 7.5,
        greScore: 320,
        workExperienceMonths: 18,
        certifications: ['AWS Certified Solutions Architect', 'TensorFlow Developer'],
      }),
    });
    const profileData = await profileRes.json();
    const profileScore = profileData.data?.score ?? profileData.score;
    const profileValid = profileRes.status === 200 && typeof profileScore === 'number';
    record(24, 'POST /api/ai/profile-strength evaluates student profile completeness & strength', profileValid ? 'PASS' : 'FAIL', `Overall score: ${profileScore}`);

    // Clean up
    httpServer.close();

    console.log('\n========================================================================');
    const passed = results.filter(r => r.status === 'PASS').length;
    const failed = results.filter(r => r.status === 'FAIL').length;
    console.log(`MASTER VERIFICATION COMPLETE: ${passed}/${results.length} PASSED (${failed} FAILED)`);
    console.log('========================================================================\n');

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error('Master verification suite encountered unexpected error:', err);
    httpServer.close();
    process.exit(1);
  }
}

runMasterVerification();
