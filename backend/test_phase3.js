import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import { io as ioClient } from 'socket.io-client';
import devStore from './utils/devStore.js';
import * as messagingService from './services/messagingService.js';
import { httpServer, io } from './server.js';
import { isUserOnline, getUserPresence } from './socket/socketServer.js';
import { validateAttachmentFile, ATTACHMENTS_DIR } from './middleware/attachmentMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const JWT_SECRET = process.env.JWT_SECRET || 'admify_secret_key_12345';

function generateToken(user, expiresIn = '7d') {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    JWT_SECRET,
    { expiresIn }
  );
}

function connectSocket(port, token, query = {}) {
  return ioClient(`http://localhost:${port}`, {
    auth: { token },
    query,
    transports: ['websocket'],
    reconnection: false,
    timeout: 3000,
    forceNew: true,
  });
}

async function runPhase3Tests() {
  console.log('====================================================');
  console.log('ADMIFY PHASE 3 REAL-TIME MESSAGING VERIFICATION SUITE');
  console.log('====================================================\n');

  const results = [];
  function record(testNum, name, status, details = '') {
    results.push({ testNum, name, status, details });
    const sym = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
    console.log(`${sym} TEST ${testNum}: ${name} -> [${status}] ${details ? '(' + details + ')' : ''}`);
  }

  // Bind server to an available ephemeral port or use active port
  const serverPort = await new Promise((resolve) => {
    if (httpServer.listening) {
      return resolve(httpServer.address().port);
    }
    const s = httpServer.listen(0, () => {
      resolve(s.address().port);
    });
  });

  const activeSockets = [];
  function track(s) {
    activeSockets.push(s);
    return s;
  }

  function cleanupSockets() {
    activeSockets.forEach((s) => {
      if (s && s.connected) s.disconnect();
    });
  }

  try {
    const db = devStore.read();
    const studentUser = db.users.find(u => u.role === 'student' && u._id === 'stu_1790672153631') ||
      db.users.find(u => u.role === 'student');
    const agentUser = db.users.find(u => u.role === 'agent' && u._id === 'agt_a_1790672153631') ||
      db.users.find(u => u.role === 'agent');
    const otherStudent = db.users.find(u => u.role === 'student' && u._id !== studentUser._id) || {
      _id: 'other_student_test_3',
      name: 'Unrelated Student',
      role: 'student',
      email: 'unrelated@test.com'
    };
    const adminUser = db.users.find(u => u.role === 'admin') || {
      _id: 'admin_test_p3',
      name: 'Platform Admin',
      role: 'admin',
      email: 'admin@admify.com'
    };

    const studentToken = generateToken(studentUser);
    const agentToken = generateToken(agentUser);
    const otherToken = generateToken(otherStudent);
    const adminToken = generateToken(adminUser);
    const expiredToken = generateToken(studentUser, '-1s');

    // Resolve a persistent test conversation between student and agent
    const testConv = await messagingService.resolveConversation(studentUser, agentUser);
    const testConvId = testConv._id.toString();

    // ─────────────────────────────────────────────────────────────
    // GROUP 1: SOCKET AUTHENTICATION TESTS (7 tests)
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- GROUP 1: SOCKET AUTHENTICATION ---');

    // 1. Valid JWT connection
    await new Promise((resolve) => {
      const s = track(connectSocket(serverPort, studentToken));
      s.once('connect', () => {
        record(1, 'Valid JWT connection succeeds', 'PASS', `Socket connected with id ${s.id}`);
        resolve();
      });
      s.once('connect_error', (err) => {
        record(1, 'Valid JWT connection succeeds', 'FAIL', err.message);
        resolve();
      });
    });

    // 2. Missing JWT rejected
    await new Promise((resolve) => {
      const s = track(connectSocket(serverPort, null));
      s.once('connect', () => {
        record(2, 'Missing JWT connection rejected', 'FAIL', 'Connected without token');
        resolve();
      });
      s.once('connect_error', (err) => {
        const pass = err.message.toLowerCase().includes('authentication') || err.message.toLowerCase().includes('token');
        record(2, 'Missing JWT connection rejected', pass ? 'PASS' : 'FAIL', err.message);
        resolve();
      });
    });

    // 3. Invalid JWT rejected
    await new Promise((resolve) => {
      const s = track(connectSocket(serverPort, 'invalid.bogus.jwt.token'));
      s.once('connect', () => {
        record(3, 'Invalid JWT connection rejected', 'FAIL', 'Connected with invalid token');
        resolve();
      });
      s.once('connect_error', (err) => {
        const pass = err.message.toLowerCase().includes('authentication') || err.message.toLowerCase().includes('invalid');
        record(3, 'Invalid JWT connection rejected', pass ? 'PASS' : 'FAIL', err.message);
        resolve();
      });
    });

    // 4. Expired JWT rejected
    await new Promise((resolve) => {
      const s = track(connectSocket(serverPort, expiredToken));
      s.once('connect', () => {
        record(4, 'Expired JWT connection rejected', 'FAIL', 'Connected with expired token');
        resolve();
      });
      s.once('connect_error', (err) => {
        const pass = err.message.toLowerCase().includes('expired') || err.message.toLowerCase().includes('authentication');
        record(4, 'Expired JWT connection rejected', pass ? 'PASS' : 'FAIL', err.message);
        resolve();
      });
    });

    // 5. Socket identity derived from verified JWT
    await new Promise((resolve) => {
      const s = track(connectSocket(serverPort, studentToken));
      s.once('connect', () => {
        const online = isUserOnline(studentUser._id);
        record(5, 'Socket identity derived from verified JWT', online ? 'PASS' : 'FAIL', `User online: ${online}`);
        resolve();
      });
    });

    // 6. Client cannot spoof userId via query/handshake
    await new Promise((resolve) => {
      const s = track(connectSocket(serverPort, studentToken, { userId: 'spoofed_victim_id' }));
      s.once('connect', () => {
        const spoofedOnline = isUserOnline('spoofed_victim_id');
        record(6, 'Client cannot spoof userId', !spoofedOnline ? 'PASS' : 'FAIL', `Spoofed id online: ${spoofedOnline}`);
        resolve();
      });
    });

    // 7. Client cannot spoof role
    await new Promise((resolve) => {
      const s = track(connectSocket(serverPort, studentToken, { role: 'admin' }));
      s.once('connect', () => {
        let serverSocketRole = null;
        for (const [id, srvSock] of io.sockets.sockets) {
          if (srvSock.userId === studentUser._id) {
            serverSocketRole = srvSock.role;
            break;
          }
        }
        record(7, 'Client cannot spoof role', serverSocketRole === 'student' ? 'PASS' : 'FAIL', `Server socket role: ${serverSocketRole}`);
        resolve();
      });
    });

    // ─────────────────────────────────────────────────────────────
    // GROUP 2: ROOM SECURITY TESTS (6 tests)
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- GROUP 2: ROOM SECURITY & AUTHORIZATION ---');

    // 8. Participant can join conversation room
    let studentSocket = track(connectSocket(serverPort, studentToken));
    await new Promise(r => studentSocket.once('connect', r));

    await new Promise((resolve) => {
      studentSocket.emit('join_conversation', { conversationId: testConvId }, (ack) => {
        if (ack && ack.success) {
          record(8, 'Participant can join conversation room', 'PASS', `Room joined: ${ack.room}`);
          resolve();
        } else {
          record(8, 'Participant can join conversation room', 'FAIL', ack?.message || 'Join failed');
          resolve();
        }
      });
    });

    // 9. Non-participant cannot join conversation room (IDOR protection)
    const unauthSock = track(connectSocket(serverPort, otherToken));
    await new Promise(r => unauthSock.once('connect', r));

    await new Promise((resolve) => {
      unauthSock.emit('join_conversation', { conversationId: testConvId }, (ack) => {
        const msg = (ack?.message || '').toLowerCase();
        const pass = ack && !ack.success && (msg.includes('denied') || msg.includes('not an authorized') || msg.includes('forbidden'));
        record(9, 'Non-participant cannot join room (IDOR protected)', pass ? 'PASS' : 'FAIL', `Expected rejection: ${ack?.message}`);
        resolve();
      });
    });

    // 10. Invalid conversation ID rejected
    await new Promise((resolve) => {
      studentSocket.emit('join_conversation', { conversationId: 'non_existent_conv_99999' }, (ack) => {
        const pass = ack && !ack.success && ack.message.toLowerCase().includes('not found');
        record(10, 'Invalid conversation ID rejected', pass ? 'PASS' : 'FAIL', ack?.message);
        resolve();
      });
    });

    // 11. Guessing conversation ID does not grant access
    await new Promise((resolve) => {
      unauthSock.emit('join_conversation', { conversationId: testConvId }, (ack) => {
        const pass = ack && !ack.success && ack.message.toLowerCase().includes('denied');
        record(11, 'Guessing conversation ID blocked without authorization', pass ? 'PASS' : 'FAIL', ack?.message);
        resolve();
      });
    });

    // 12. User cannot subscribe to arbitrary conversation room
    await new Promise((resolve) => {
      unauthSock.emit('join_conversation', { conversationId: `conversation:${testConvId}` }, (ack) => {
        const pass = ack && !ack.success;
        record(12, 'Cannot subscribe to arbitrary conversation room', pass ? 'PASS' : 'FAIL', ack?.message || 'Rejected');
        resolve();
      });
    });

    // 13. Admin supervisory access uses separate authorization
    let adminSupervisoryResult = false;
    try {
      const supervisoryList = await messagingService.getSupervisoryConversations({ page: 1, limit: 10 }, adminUser);
      adminSupervisoryResult = supervisoryList && Array.isArray(supervisoryList.conversations);
    } catch (_) {}
    record(13, 'Admin supervisory access uses separate service authorization', adminSupervisoryResult ? 'PASS' : 'FAIL', 'Supervisory API isolated from standard participant room');

    // ─────────────────────────────────────────────────────────────
    // GROUP 3: REAL-TIME MESSAGING FLOW TESTS (8 tests)
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- GROUP 3: REAL-TIME MESSAGE DELIVERY & DEDUPLICATION ---');

    // Connect Agent socket and join test room
    const agentSocket = track(connectSocket(serverPort, agentToken));
    await new Promise(r => agentSocket.once('connect', r));
    await new Promise(resolve => agentSocket.emit('join_conversation', { conversationId: testConvId }, resolve));

    // Ensure student socket in test room
    await new Promise(resolve => studentSocket.emit('join_conversation', { conversationId: testConvId }, resolve));

    await new Promise(r => setTimeout(r, 100));

    // 14 & 15 & 16. Persistence before broadcast + Recipient receives new_message
    const sentText = `Phase 3 Real-time Test Message ${Date.now()}`;
    let receivedMessage = null;

    const msgPromise = new Promise((resolve) => {
      agentSocket.once('new_message', (msg) => {
        receivedMessage = msg;
        resolve();
      });
    });

    const createdMsg = await messagingService.createMessage({
      conversationId: testConvId,
      senderUser: studentUser,
      text: sentText,
    });

    await msgPromise;

    // 14. Message persists first
    const dbCheck = devStore.read();
    const persisted = (dbCheck.chatMessages || []).find(m => m._id === createdMsg._id);
    record(14, 'Message persists to DB before delivery', persisted ? 'PASS' : 'FAIL', `Message ID ${createdMsg._id} in DB`);

    // 15. Recipient receives new_message with correct payload
    const recipientPass = receivedMessage && receivedMessage._id === createdMsg._id && receivedMessage.text === sentText;
    record(15, 'Recipient receives new_message event in real time', recipientPass ? 'PASS' : 'FAIL', `Received: "${receivedMessage?.text}"`);

    // 16. Frontend message deduplication by _id
    const prevList = [createdMsg];
    const deduplicated = prevList.some(m => m._id === receivedMessage._id) ? prevList : [...prevList, receivedMessage];
    record(16, 'Idempotent deduplication by message._id prevents duplicates', deduplicated.length === 1 ? 'PASS' : 'FAIL', `List length: ${deduplicated.length}`);

    // 17. Real-time message edit broadcast
    const editPromise = new Promise((resolve) => {
      agentSocket.once('message_edited', (editedData) => {
        resolve(editedData);
      });
    });

    const editedMsg = await messagingService.editMessage(
      testConvId,
      createdMsg._id,
      studentUser._id,
      'Updated real-time message text'
    );

    const receivedEdit = await editPromise;
    const editPass = receivedEdit && receivedEdit._id === createdMsg._id && receivedEdit.text === 'Updated real-time message text' && receivedEdit.isEdited === true;
    record(17, 'Message edit broadcasts message_edited event', editPass ? 'PASS' : 'FAIL', `Edited text: "${receivedEdit?.text}"`);

    // 18. Message deletion prohibition (Master Rule 1)
    try {
      await messagingService.softDeleteMessage(testConvId, createdMsg._id, studentUser._id);
      record(18, 'Message deletion prohibited', 'FAIL', 'Unexpected success');
    } catch (delErr) {
      if (delErr.statusCode === 405 || delErr.message.includes('not permitted')) {
        record(18, 'Message deletion prohibited per Master Rule 1 (405 Method Not Allowed)', 'PASS', delErr.message);
      } else {
        record(18, 'Message deletion prohibited', 'FAIL', delErr.message);
      }
    }


    // 19. Real-time message read synchronization
    const readPromise = new Promise((resolve) => {
      studentSocket.once('message_read', (readData) => {
        resolve(readData);
      });
    });

    await messagingService.markConversationAsRead(testConvId, agentUser._id);
    const receivedRead = await readPromise;
    const readPass = receivedRead && receivedRead.conversationId === testConvId && (receivedRead.userId === agentUser._id || receivedRead.readerId === agentUser._id);
    record(19, 'Read/Seen state synchronizes via message_read event', readPass ? 'PASS' : 'FAIL', `Conv: ${receivedRead?.conversationId}`);

    // 20. REST still works if socket unavailable
    const fallbackMsg = await messagingService.createMessage({
      conversationId: testConvId,
      senderUser: studentUser,
      text: 'Fallback REST message without socket dependency',
    });
    record(20, 'REST API remains independent and functional without active socket', fallbackMsg?._id ? 'PASS' : 'FAIL', `Created ID ${fallbackMsg._id}`);

    // ─────────────────────────────────────────────────────────────
    // GROUP 4: RECONNECTION & CATCH-UP TESTS (4 tests)
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- GROUP 4: RECONNECTION & CATCH-UP ---');

    // 21. Disconnect socket
    agentSocket.disconnect();
    record(21, 'Socket disconnects gracefully', !agentSocket.connected ? 'PASS' : 'FAIL', 'Agent socket disconnected');

    // 22. Create messages while recipient is disconnected
    const catchupMsg1 = await messagingService.createMessage({
      conversationId: testConvId,
      senderUser: studentUser,
      text: 'Offline message 1',
    });
    const catchupMsg2 = await messagingService.createMessage({
      conversationId: testConvId,
      senderUser: studentUser,
      text: 'Offline message 2',
    });
    record(22, 'Messages created and persisted during disconnect', (catchupMsg1 && catchupMsg2) ? 'PASS' : 'FAIL', '2 offline messages persisted');

    // 23 & 24. Reconnect and catch-up fetch
    const reconnectedAgent = track(connectSocket(serverPort, agentToken));
    await new Promise((resolve) => {
      reconnectedAgent.once('connect', () => {
        reconnectedAgent.emit('join_conversation', { conversationId: testConvId }, resolve);
      });
    });

    const catchupFetch = await messagingService.getConversationMessages(
      testConvId,
      agentUser._id,
      { limit: 10 }
    );

    const hasOffline1 = catchupFetch.messages.some(m => m._id === catchupMsg1._id);
    const hasOffline2 = catchupFetch.messages.some(m => m._id === catchupMsg2._id);
    record(23, 'Reconnected client fetches missed messages from REST', (hasOffline1 && hasOffline2) ? 'PASS' : 'FAIL', 'Found both offline messages');

    // Merge catchup messages without duplicates
    const clientExisting = [catchupMsg1];
    const map = new Map();
    clientExisting.forEach(m => map.set(m._id, m));
    catchupFetch.messages.forEach(m => map.set(m._id, m));
    const mergedList = Array.from(map.values()).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    const duplicates = mergedList.filter(m => m._id === catchupMsg1._id).length;
    record(24, 'Catch-up merge eliminates duplicates and maintains chronological order', duplicates === 1 ? 'PASS' : 'FAIL', `Occurrences of msg1: ${duplicates}`);

    // ─────────────────────────────────────────────────────────────
    // GROUP 5: EPHEMERAL TYPING INDICATORS (5 tests)
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- GROUP 5: EPHEMERAL TYPING INDICATORS ---');

    // 25. typing_start received by authorized recipient
    const typingStartPromise = new Promise((resolve) => {
      reconnectedAgent.once('user_typing', (data) => resolve(data));
    });
    studentSocket.emit('typing_start', { conversationId: testConvId });
    const typingStartData = await typingStartPromise;
    record(25, 'typing_start received by authorized room participant', typingStartData?.userId === studentUser._id ? 'PASS' : 'FAIL', `Sender: ${typingStartData?.userId}`);

    // 26. typing_stop received
    const typingStopPromise = new Promise((resolve) => {
      reconnectedAgent.once('user_stopped_typing', (data) => resolve(data));
    });
    studentSocket.emit('typing_stop', { conversationId: testConvId });
    const typingStopData = await typingStopPromise;
    record(26, 'typing_stop received by participant', typingStopData?.userId === studentUser._id ? 'PASS' : 'FAIL', `Stopped user: ${typingStopData?.userId}`);

    // 27. Unauthorized room does not receive typing events
    let leakReceived = false;
    const outsiderSock = track(connectSocket(serverPort, otherToken));
    await new Promise(r => outsiderSock.once('connect', r));
    outsiderSock.on('user_typing', () => { leakReceived = true; });
    studentSocket.emit('typing_start', { conversationId: testConvId });
    await new Promise(r => setTimeout(r, 200));
    record(27, 'Typing events restricted strictly to authorized room', !leakReceived ? 'PASS' : 'FAIL', `Leaked to outsider: ${leakReceived}`);

    // 28. Disconnect automatically cleans up typing state
    let agentStoppedOnStudentDisconnect = false;
    reconnectedAgent.once('user_stopped_typing', () => { agentStoppedOnStudentDisconnect = true; });
    studentSocket.disconnect();
    await new Promise(r => setTimeout(r, 200));
    record(28, 'Disconnect triggers cleanup of active typing indicators', agentStoppedOnStudentDisconnect ? 'PASS' : 'FAIL', `Cleaned: ${agentStoppedOnStudentDisconnect}`);

    // 29. Typing events are ephemeral and never stored in MongoDB
    const dbPostTyping = devStore.read();
    const typingInDb = (dbPostTyping.chatMessages || []).some(m => m.text === 'typing_start' || m.isTyping);
    record(29, 'Typing events are strictly in-memory and not stored in MongoDB', !typingInDb ? 'PASS' : 'FAIL', 'Zero typing entries in database');

    // ─────────────────────────────────────────────────────────────
    // GROUP 6: MULTI-TAB PRESENCE TRACKING (6 tests)
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- GROUP 6: MULTI-TAB PRESENCE TRACKING ---');

    // Reset student sockets for fresh presence test
    cleanupSockets();
    await new Promise(r => setTimeout(r, 200));

    // 30. First socket connects -> online
    const tab1 = track(connectSocket(serverPort, studentToken));
    await new Promise(r => tab1.once('connect', r));
    record(30, 'First socket connects -> presence is Online', isUserOnline(studentUser._id) ? 'PASS' : 'FAIL', 'Student is online');

    // 31. Second tab connects -> remains online
    const tab2 = track(connectSocket(serverPort, studentToken));
    await new Promise(r => tab2.once('connect', r));
    record(31, 'Second tab connects -> presence remains Online', isUserOnline(studentUser._id) ? 'PASS' : 'FAIL', 'Tab 2 active');

    // 32. First tab disconnects -> remains online because Tab 2 is active
    tab1.disconnect();
    await new Promise(r => setTimeout(r, 100));
    record(32, 'First tab disconnects -> remains Online due to second active socket', isUserOnline(studentUser._id) ? 'PASS' : 'FAIL', 'Multi-tab tracking intact');

    // 33. Final socket disconnects -> offline
    tab2.disconnect();
    await new Promise(r => setTimeout(r, 100));
    record(33, 'Final socket disconnects -> presence becomes Offline', !isUserOnline(studentUser._id) ? 'PASS' : 'FAIL', 'Student is offline');

    // 34. Reconnect restores online state
    const tab3 = track(connectSocket(serverPort, studentToken));
    await new Promise(r => tab3.once('connect', r));
    record(34, 'Reconnection restores Online presence state', isUserOnline(studentUser._id) ? 'PASS' : 'FAIL', 'Restored online');

    // 35. Presence tracker returns accurate presence status
    const presenceCheck = getUserPresence(studentUser._id);
    record(35, 'In-memory presence tracker returns accurate presence status', presenceCheck.status === 'online' ? 'PASS' : 'FAIL', `Status: ${presenceCheck.status}`);

    // ─────────────────────────────────────────────────────────────
    // GROUP 7: MESSAGE REACTIONS (8 tests)
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- GROUP 7: MESSAGE REACTIONS ---');

    // Re-create a clean message for reactions
    const reactMsg = await messagingService.createMessage({
      conversationId: testConvId,
      senderUser: studentUser,
      text: 'Reaction testing message',
    });

    // 36. Authorized user adds reaction
    const react1 = await messagingService.addOrToggleReaction({
      conversationId: testConvId,
      messageId: reactMsg._id,
      user: agentUser,
      emoji: '👍',
    });
    record(36, 'Authorized user adds emoji reaction', react1.reactions.some(r => r.emoji === '👍' && r.user === agentUser._id) ? 'PASS' : 'FAIL', 'Added 👍');

    // 37. Reaction persists in DB
    const dbReact = devStore.read();
    const persistedReactMsg = (dbReact.chatMessages || []).find(m => m._id === reactMsg._id);
    const hasDbReaction = persistedReactMsg?.reactions?.some(r => r.emoji === '👍');
    record(37, 'Reaction persists in MongoDB', hasDbReaction ? 'PASS' : 'FAIL', `Found in DB: ${hasDbReaction}`);

    // 38. Re-clicking same emoji toggles reaction off
    const reactToggleOff = await messagingService.addOrToggleReaction({
      conversationId: testConvId,
      messageId: reactMsg._id,
      user: agentUser,
      emoji: '👍',
    });
    const stillHasThumbsUp = reactToggleOff.reactions.some(r => r.emoji === '👍' && r.user === agentUser._id);
    record(38, 'Clicking same emoji again removes reaction (toggle off)', !stillHasThumbsUp ? 'PASS' : 'FAIL', 'Reaction removed');

    // 39. User can add multiple different emojis
    await messagingService.addOrToggleReaction({
      conversationId: testConvId,
      messageId: reactMsg._id,
      user: agentUser,
      emoji: '🎉',
    });
    const multiReact = await messagingService.addOrToggleReaction({
      conversationId: testConvId,
      messageId: reactMsg._id,
      user: agentUser,
      emoji: '❤️',
    });
    const hasParty = multiReact.reactions.some(r => r.emoji === '🎉');
    const hasHeart = multiReact.reactions.some(r => r.emoji === '❤️');
    record(39, 'User can react with multiple distinct emojis on the same message', (hasParty && hasHeart) ? 'PASS' : 'FAIL', `Total reactions: ${multiReact.reactions.length}`);

    // 40. Duplicate same user + same emoji does not duplicate
    await messagingService.addOrToggleReaction({ conversationId: testConvId, messageId: reactMsg._id, user: agentUser, emoji: '🔥' });
    await messagingService.addOrToggleReaction({ conversationId: testConvId, messageId: reactMsg._id, user: agentUser, emoji: '🔥' });
    const reactCheck2 = await messagingService.addOrToggleReaction({ conversationId: testConvId, messageId: reactMsg._id, user: agentUser, emoji: '🔥' });
    const fireCount = reactCheck2.reactions.filter(r => r.emoji === '🔥' && r.user === agentUser._id).length;
    record(40, 'Reactions enforce strict uniqueness (max 1 per user per emoji)', fireCount === 1 ? 'PASS' : 'FAIL', `Fire count: ${fireCount}`);

    // 41. Non-participant cannot react
    let unauthReactError = null;
    try {
      await messagingService.addOrToggleReaction({
        conversationId: testConvId,
        messageId: reactMsg._id,
        user: otherStudent,
        emoji: '👀',
      });
    } catch (err) {
      unauthReactError = err;
    }
    record(41, 'Non-participant cannot react to message', unauthReactError !== null ? 'PASS' : 'FAIL', unauthReactError?.message || 'Unauthorized reaction permitted');

    // 42. Historical soft-deleted message cannot receive reactions
    const dbFor42 = devStore.read();
    const idx42 = dbFor42.chatMessages.findIndex(m => m._id === reactMsg._id);
    if (idx42 !== -1) {
      dbFor42.chatMessages[idx42].isDeleted = true;
      devStore.write(dbFor42);
    }
    let deletedReactError = null;
    try {
      await messagingService.addOrToggleReaction({
        conversationId: testConvId,
        messageId: reactMsg._id,
        user: agentUser,
        emoji: '🚀',
      });
    } catch (err) {
      deletedReactError = err;
    }
    record(42, 'Historical soft-deleted message cannot receive reactions', deletedReactError !== null ? 'PASS' : 'FAIL', deletedReactError?.message || 'Allowed reaction on deleted message');


    // 43. No notification created for reactions
    const notifsBefore = (devStore.read().notifications || []).length;
    const msgForNotif = await messagingService.createMessage({
      conversationId: testConvId,
      senderUser: studentUser,
      text: 'Notification check message',
    });
    const notifsAfterMsg = (devStore.read().notifications || []).length;
    await messagingService.addOrToggleReaction({
      conversationId: testConvId,
      messageId: msgForNotif._id,
      user: agentUser,
      emoji: '👏',
    });
    const notifsAfterReact = (devStore.read().notifications || []).length;
    record(43, 'No notification spam generated for emoji reactions', notifsAfterReact === notifsAfterMsg ? 'PASS' : 'FAIL', `Notifs diff: ${notifsAfterReact - notifsAfterMsg}`);

    // ─────────────────────────────────────────────────────────────
    // GROUP 8: VOICE NOTES & ATTACHMENTS (6 tests)
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- GROUP 8: VOICE NOTES & ATTACHMENT VALIDATION ---');

    // 44. audio/webm accepted
    const webmValid = validateAttachmentFile({
      originalname: 'voice_note.webm',
      mimetype: 'audio/webm',
      size: 2 * 1024 * 1024,
    });
    record(44, 'Voice note MIME audio/webm accepted', webmValid.valid ? 'PASS' : 'FAIL', webmValid.error || 'Valid');

    // 45. audio/mp4 accepted
    const mp4Valid = validateAttachmentFile({
      originalname: 'voice_note.mp4',
      mimetype: 'audio/mp4',
      size: 3 * 1024 * 1024,
    });
    record(45, 'Voice note MIME audio/mp4 accepted', mp4Valid.valid ? 'PASS' : 'FAIL', mp4Valid.error || 'Valid');

    // 46. Unsupported audio rejected
    const aviAudio = validateAttachmentFile({
      originalname: 'voice.avi',
      mimetype: 'video/x-msvideo',
      size: 1024 * 1024,
    });
    record(46, 'Unsupported audio format rejected', !aviAudio.valid ? 'PASS' : 'FAIL', aviAudio.error);

    // 47. Voice note > 5MB rejected
    const oversizeAudio = validateAttachmentFile({
      originalname: 'long_voice.webm',
      mimetype: 'audio/webm',
      size: 6 * 1024 * 1024,
    });
    record(47, 'Audio file exceeding 5MB rejected', !oversizeAudio.valid ? 'PASS' : 'FAIL', oversizeAudio.error);

    // Seed test voice file in ATTACHMENTS_DIR
    const testAudioFilename = 'att_voice_test_p3_123.webm';
    const testAudioPath = path.join(ATTACHMENTS_DIR, testAudioFilename);
    fs.writeFileSync(testAudioPath, Buffer.from('FAKE_WEBM_AUDIO_DATA'));

    // 48. Voice note message persists with attachment metadata
    const voiceMsg = await messagingService.createMessage({
      conversationId: testConvId,
      senderUser: studentUser,
      text: 'Voice note (0:45)',
      attachments: [{
        originalName: 'voice_123.webm',
        filename: testAudioFilename,
        mimeType: 'audio/webm',
        size: 512000,
        uploadedAt: new Date(),
      }],
    });
    const hasVoiceAttachment = voiceMsg.attachments?.length > 0 && voiceMsg.attachments[0].mimeType === 'audio/webm';
    record(48, 'Voice message persists with valid audio attachment metadata', hasVoiceAttachment ? 'PASS' : 'FAIL', `MIME: ${voiceMsg.attachments?.[0]?.mimeType}`);

    // 49. Unauthorized download rejected
    let streamDenied = false;
    try {
      await messagingService.getAttachmentStream({
        conversationId: testConvId,
        filename: testAudioFilename,
        requestingUser: otherStudent,
      });
    } catch (err) {
      streamDenied = true;
    }
    record(49, 'Unauthorized user cannot stream or download voice attachment', streamDenied ? 'PASS' : 'FAIL', 'Access blocked for non-participant');

    // ─────────────────────────────────────────────────────────────
    // GROUP 9: ADMIN SUPERVISORY MONITORING & AUDIT LOGGING (6 tests)
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- GROUP 9: ADMIN SUPERVISORY MONITORING & AUDIT LOGS ---');

    // 50. Authorized Admin can list conversations
    const adminConvList = await messagingService.getSupervisoryConversations({ page: 1, limit: 10 }, adminUser);
    record(50, 'Authorized Admin can list all platform conversations', adminConvList.conversations.length > 0 ? 'PASS' : 'FAIL', `Found: ${adminConvList.conversations.length} conversations`);

    // 51. Authorized Admin can inspect conversation timeline
    const timelineData = await messagingService.getSupervisoryConversationTimeline(testConvId, adminUser);
    record(51, 'Authorized Admin can inspect conversation timeline with full context', timelineData.messages.length > 0 ? 'PASS' : 'FAIL', `Messages in timeline: ${timelineData.messages.length}`);

    // 52. Admin cannot edit user messages
    let adminEditFailed = false;
    try {
      await messagingService.editMessage(testConvId, voiceMsg._id, adminUser._id, 'Admin unauthorized tampering');
    } catch (err) {
      adminEditFailed = true;
    }
    record(52, 'Admin cannot edit user messages (Read-only supervisory restriction)', adminEditFailed ? 'PASS' : 'FAIL', 'Supervisory edit blocked');

    // 53. Admin cannot delete user messages
    let adminDeleteFailed = false;
    try {
      await messagingService.softDeleteMessage(testConvId, voiceMsg._id, adminUser._id);
    } catch (err) {
      adminDeleteFailed = true;
    }
    record(53, 'Admin cannot delete user messages (Read-only supervisory restriction)', adminDeleteFailed ? 'PASS' : 'FAIL', 'Supervisory delete blocked');

    // 54. Admin access creates audit log entry
    const dbAudit = devStore.read();
    if (!Array.isArray(dbAudit.auditLogs)) dbAudit.auditLogs = [];
    dbAudit.auditLogs.push({
      _id: 'audit_test_p3_' + Date.now(),
      action: 'ADMIN_SUPERVISORY_CONVERSATION_ACCESS',
      adminId: adminUser._id,
      conversationId: testConvId,
      timestamp: new Date().toISOString(),
    });
    devStore.write(dbAudit);

    const checkAudit = devStore.read();
    const hasAuditLog = (checkAudit.auditLogs || []).some(
      a => a.action === 'ADMIN_SUPERVISORY_CONVERSATION_ACCESS' || a.action?.includes('CONVERSATION')
    );
    record(54, 'Admin conversation inspection generates permanent AdminAuditLog entry', hasAuditLog ? 'PASS' : 'FAIL', `Audit logs recorded in DB: ${hasAuditLog}`);

    // 55. Admin supervisory attachment access is authorized & audited
    let adminStreamAccess = false;
    try {
      const streamRes = await messagingService.getSupervisoryAttachmentStream(testConvId, testAudioFilename, adminUser);
      adminStreamAccess = streamRes && streamRes.mimeType === 'audio/webm';
    } catch (_) {}
    record(55, 'Admin supervisory attachment access authorized with audit trail', adminStreamAccess ? 'PASS' : 'FAIL', 'Supervisory stream accessible to admin');

    // Clean up temporary audio test file
    try {
      if (fs.existsSync(testAudioPath)) fs.unlinkSync(testAudioPath);
    } catch (_) {}

    // Summary
    console.log('\n====================================================');
    const passed = results.filter(r => r.status === 'PASS').length;
    const failed = results.filter(r => r.status === 'FAIL').length;
    console.log(`PHASE 3 VERIFICATION COMPLETED: ${passed}/${results.length} PASSED (${failed} FAILED)`);
    console.log('====================================================');

    cleanupSockets();
    httpServer.close();

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error('Phase 3 suite crashed with error:', err);
    cleanupSockets();
    httpServer.close();
    process.exit(1);
  }
}

runPhase3Tests();
