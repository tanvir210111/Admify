import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import devStore from './utils/devStore.js';
import * as messagingService from './services/messagingService.js';
import { ATTACHMENTS_DIR } from './middleware/attachmentMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const JWT_SECRET = process.env.JWT_SECRET || 'admify_secret_key_12345';

function generateToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

async function runPhase2Tests() {
  console.log('====================================================');
  console.log('ADMIFY PHASE 2 ADVANCED MESSAGING VERIFICATION SUITE');
  console.log('====================================================\n');

  const results = [];
  function record(testNum, name, status, details = '') {
    results.push({ testNum, name, status, details });
    const sym = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
    console.log(`${sym} TEST ${testNum}: ${name} -> [${status}] ${details ? '(' + details + ')' : ''}`);
  }

  try {
    const db = devStore.read();

    const studentUser = db.users.find(u => u.role === 'student' && u._id === 'stu_1790672153631') ||
      db.users.find(u => u.role === 'student');
    const agentUser = db.users.find(u => u.role === 'agent' && u._id === 'agt_a_1790672153631') ||
      db.users.find(u => u.role === 'agent');
    const otherStudent = db.users.find(u => u.role === 'student' && u._id !== studentUser._id);

    // ─────────────────────────────────────────────────────────────
    // PART 1: REVERSE CHRONOLOGICAL PAGINATION TESTS
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- PART 1: PAGINATION TESTS ---');
    const pagConv = await messagingService.resolveConversation(studentUser, agentUser);
    const pagConvId = pagConv._id.toString();

    // Create a dedicated conversation and seed 120 messages cleanly
    const bulkConvId = 'bulk_conv_test_p2_' + Date.now();
    const bulkParticipantKey = messagingService.buildParticipantKey(studentUser._id, agentUser._id);
    const mockMessages = [];
    const baseTime = Date.now() - (150 * 60 * 1000); // 2.5 hours ago

    for (let i = 1; i <= 120; i++) {
      const msgTime = new Date(baseTime + i * 60 * 1000); // 1 min apart
      mockMessages.push({
        _id: `bulk_msg_${bulkConvId}_${i}`,
        conversationId: bulkConvId,
        sessionId: bulkConvId,
        senderId: studentUser._id.toString(),
        receiverId: agentUser._id.toString(),
        user: studentUser._id.toString(),
        sender: 'student',
        text: `Numbered message ${i}`,
        attachments: [],
        isEdited: false,
        editedAt: null,
        editHistory: [],
        isDeleted: false,
        deletedAt: null,
        deletedBy: null,
        createdAt: msgTime.toISOString(),
        updatedAt: msgTime.toISOString(),
      });
    }

    // Insert mock conversation and messages into devStore in a single write
    if (!Array.isArray(db.conversations)) db.conversations = [];
    db.conversations.push({
      _id: bulkConvId,
      participantKey: `test_bulk_${Date.now()}`,
      participants: [
        { user: studentUser._id.toString(), role: 'student' },
        { user: agentUser._id.toString(), role: 'agent' },
      ],
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    if (!Array.isArray(db.chatMessages)) db.chatMessages = [];
    db.chatMessages.push(...mockMessages);
    devStore.write(db);

    // TEST 1.1: Page 1 with default limit (50) returns the latest 50 messages (71 to 120)
    try {
      const p1 = await messagingService.getConversationMessages(bulkConvId, studentUser, { page: 1, limit: 50 });
      const firstMsg = p1.messages[0];
      const lastMsg = p1.messages[p1.messages.length - 1];

      const isChronological = p1.messages.every((m, idx) => {
        if (idx === 0) return true;
        return new Date(m.createdAt) >= new Date(p1.messages[idx - 1].createdAt);
      });

      if (
        p1.messages.length === 50 &&
        firstMsg.text === 'Numbered message 71' &&
        lastMsg.text === 'Numbered message 120' &&
        isChronological
      ) {
        record('P1', 'Page 1 returns latest 50 messages in chronological order (71-120)', 'PASS', `First: ${firstMsg.text}, Last: ${lastMsg.text}`);
      } else {
        record('P1', 'Page 1 returns latest 50 messages in chronological order', 'FAIL', `Count: ${p1.messages.length}, First: ${firstMsg?.text}, Last: ${lastMsg?.text}, Chrono: ${isChronological}`);
      }
    } catch (err) {
      record('P1', 'Page 1 pagination', 'FAIL', err.message);
    }

    // TEST 1.2: Page 2 returns the previous 50 messages (21 to 70) in chronological order
    try {
      const p2 = await messagingService.getConversationMessages(bulkConvId, studentUser, { page: 2, limit: 50 });
      const firstMsg = p2.messages[0];
      const lastMsg = p2.messages[p2.messages.length - 1];

      if (
        p2.messages.length === 50 &&
        firstMsg.text === 'Numbered message 21' &&
        lastMsg.text === 'Numbered message 70'
      ) {
        record('P2', 'Page 2 returns older messages in chronological order (21-70)', 'PASS', `First: ${firstMsg.text}, Last: ${lastMsg.text}`);
      } else {
        record('P2', 'Page 2 returns older messages', 'FAIL', `Count: ${p2.messages.length}, First: ${firstMsg?.text}, Last: ${lastMsg?.text}`);
      }
    } catch (err) {
      record('P2', 'Page 2 pagination', 'FAIL', err.message);
    }

    // TEST 1.3: Page 3 returns remaining oldest 20 messages (1 to 20) with hasNextPage=false
    try {
      const p3 = await messagingService.getConversationMessages(bulkConvId, studentUser, { page: 3, limit: 50 });
      const firstMsg = p3.messages[0];
      const lastMsg = p3.messages[p3.messages.length - 1];

      if (
        p3.messages.length === 20 &&
        firstMsg.text === 'Numbered message 1' &&
        lastMsg.text === 'Numbered message 20' &&
        p3.pagination.hasNextPage === false
      ) {
        record('P3', 'Page 3 returns oldest 20 messages (1-20) with hasNextPage=false', 'PASS', `Count: ${p3.messages.length}, hasNext: ${p3.pagination.hasNextPage}`);
      } else {
        record('P3', 'Page 3 returns oldest 20 messages', 'FAIL', `Count: ${p3.messages.length}, First: ${firstMsg?.text}, Last: ${lastMsg?.text}`);
      }
    } catch (err) {
      record('P3', 'Page 3 pagination', 'FAIL', err.message);
    }

    // TEST 1.4: Pagination limits (max 100 enforced)
    try {
      const pMax = await messagingService.getConversationMessages(bulkConvId, studentUser, { page: 1, limit: 999 });
      if (pMax.messages.length === 100 && pMax.pagination.limit === 100) {
        record('P4', 'Maximum page size capped at 100 items', 'PASS', `Requested 999 -> Returned ${pMax.messages.length}`);
      } else {
        record('P4', 'Maximum page size capped at 100 items', 'FAIL', `Limit: ${pMax.pagination.limit}`);
      }
    } catch (err) {
      record('P4', 'Max limit test', 'FAIL', err.message);
    }

    // ─────────────────────────────────────────────────────────────
    // PART 2: MESSAGE EDITING TESTS
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- PART 2: MESSAGE EDITING TESTS ---');

    // TEST 2.1: Sender can edit their own message within 5 minutes
    let freshMsg = null;
    try {
      freshMsg = await messagingService.createMessage({
        conversationId: pagConv._id,
        senderUser: studentUser,
        text: 'Original message before edit',
      });

      const edited = await messagingService.editMessage(
        pagConv._id,
        freshMsg._id,
        studentUser._id,
        'Updated message after edit'
      );

      if (
        edited.text === 'Updated message after edit' &&
        edited.isEdited === true &&
        edited.editedAt !== null
      ) {
        record('E1', 'Sender can edit message within 5-minute window', 'PASS', `EditedAt: ${edited.editedAt}`);
      } else {
        record('E1', 'Sender can edit message within 5-minute window', 'FAIL', `Text: ${edited.text}, isEdited: ${edited.isEdited}`);
      }
    } catch (err) {
      record('E1', 'Sender edit within 5m', 'FAIL', err.message);
    }

    // TEST 2.2: Edit history is recorded server-side
    try {
      const refreshedDb = devStore.read();
      const rawInDb = (refreshedDb.chatMessages || []).find(m => m._id === freshMsg._id);
      if (
        rawInDb &&
        Array.isArray(rawInDb.editHistory) &&
        rawInDb.editHistory.length === 1 &&
        rawInDb.editHistory[0].previousContent === 'Original message before edit'
      ) {
        record('E2', 'Message edit history is preserved server-side', 'PASS', `Previous: "${rawInDb.editHistory[0].previousContent}"`);
      } else {
        record('E2', 'Message edit history is preserved server-side', 'FAIL', `History length: ${rawInDb?.editHistory?.length}`);
      }
    } catch (err) {
      record('E2', 'Edit history test', 'FAIL', err.message);
    }

    // TEST 2.3: Non-sender cannot edit someone else message (403 Forbidden)
    try {
      await messagingService.editMessage(
        pagConv._id,
        freshMsg._id,
        agentUser._id, // Agent attempting to edit Student's message
        'Malicious agent overwrite'
      );
      record('E3', 'Non-sender edit rejected with 403 Forbidden', 'FAIL', 'Unexpected success');
    } catch (err) {
      if (err.statusCode === 403 || err.message.includes('own messages')) {
        record('E3', 'Non-sender edit rejected with 403 Forbidden', 'PASS', err.message);
      } else {
        record('E3', 'Non-sender edit rejected with 403 Forbidden', 'FAIL', `Wrong error: ${err.message}`);
      }
    }

    // TEST 2.4: Empty edit text rejected (400 Bad Request)
    try {
      await messagingService.editMessage(
        pagConv._id,
        freshMsg._id,
        studentUser._id,
        '   ' // empty whitespace
      );
      record('E4', 'Empty edit content rejected with 400 Bad Request', 'FAIL', 'Unexpected success');
    } catch (err) {
      if (err.statusCode === 400) {
        record('E4', 'Empty edit content rejected with 400 Bad Request', 'PASS', err.message);
      } else {
        record('E4', 'Empty edit content rejected', 'FAIL', err.message);
      }
    }

    // TEST 2.5: Message within 3 minutes CAN be edited, older than 3 minutes CANNOT (400 Bad Request)
    try {
      // 2.5a: Message at 2 minutes and 40 seconds ago (160 seconds) CAN be edited
      const testEditDb = devStore.read();
      const expIdx = testEditDb.chatMessages.findIndex(m => m._id === freshMsg._id);
      testEditDb.chatMessages[expIdx].createdAt = new Date(Date.now() - 160 * 1000).toISOString();
      devStore.write(testEditDb);

      const validEditRes = await messagingService.editMessage(
        pagConv._id,
        freshMsg._id,
        studentUser._id,
        'Valid edit at 2m 40s within 3-minute window'
      );
      if (validEditRes.text.includes('Valid edit')) {
        record('E5a', 'Edit within 3-minute window (at 2m 40s) succeeds', 'PASS', validEditRes.text);
      } else {
        record('E5a', 'Edit within 3-minute window', 'FAIL', 'Unexpected content');
      }

      // 2.5b: Message at 3 minutes and 10 seconds ago (190 seconds) CANNOT be edited
      const expiredDb = devStore.read();
      expiredDb.chatMessages[expIdx].createdAt = new Date(Date.now() - 190 * 1000).toISOString();
      devStore.write(expiredDb);

      await messagingService.editMessage(
        pagConv._id,
        freshMsg._id,
        studentUser._id,
        'Attempting late edit after 3 minutes'
      );
      record('E5b', 'Edit after 3-minute window rejected with 400 Bad Request', 'FAIL', 'Unexpected success');
    } catch (err) {
      if (err.statusCode === 400 && (err.message.includes('expired') || err.message.includes('3-minute'))) {
        record('E5b', 'Edit after 3-minute window rejected with 400 Bad Request', 'PASS', err.message);
      } else {
        record('E5b', 'Edit after 3-minute window rejected', 'FAIL', err.message);
      }
    }

    // ─────────────────────────────────────────────────────────────
    // PART 3: MASTER RULE 1 — NO MESSAGE DELETION TESTS
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- PART 3: MASTER RULE 1 — NO MESSAGE DELETION TESTS ---');

    let deleteTestMsg = null;
    try {
      deleteTestMsg = await messagingService.createMessage({
        conversationId: pagConv._id,
        senderUser: studentUser,
        text: 'This message cannot be deleted per Master Platform Rule',
      });

      // TEST 3.1: softDeleteMessage service call rejected with 405 Method Not Allowed
      try {
        await messagingService.softDeleteMessage(pagConv._id, deleteTestMsg._id, studentUser._id);
        record('D1', 'Deletion attempt rejected with 405 Method Not Allowed', 'FAIL', 'Unexpected success');
      } catch (dErr) {
        if (dErr.statusCode === 405 || dErr.message.includes('not permitted')) {
          record('D1', 'Deletion attempt rejected with 405 Method Not Allowed', 'PASS', dErr.message);
        } else {
          record('D1', 'Deletion attempt rejected with 405', 'FAIL', dErr.message);
        }
      }

      // TEST 3.2: Non-sender deletion also rejected with 405 Method Not Allowed
      try {
        await messagingService.softDeleteMessage(pagConv._id, deleteTestMsg._id, agentUser._id);
        record('D2', 'Non-sender deletion attempt rejected with 405', 'FAIL', 'Unexpected success');
      } catch (dErr) {
        if (dErr.statusCode === 405 || dErr.message.includes('not permitted')) {
          record('D2', 'Non-sender deletion attempt rejected with 405', 'PASS', dErr.message);
        } else {
          record('D2', 'Non-sender deletion attempt rejected', 'FAIL', dErr.message);
        }
      }

      // TEST 3.3: Record remains completely intact in database (never purged)
      const afterDelDb = devStore.read();
      const stillInDb = afterDelDb.chatMessages.find(m => m._id === deleteTestMsg._id);
      if (stillInDb && stillInDb.text === 'This message cannot be deleted per Master Platform Rule') {
        record('D3', 'Database record remains intact and unmutated', 'PASS', `ID: ${stillInDb._id}`);
      } else {
        record('D3', 'Database record integrity on delete attempt', 'FAIL', 'Record was deleted or mutated');
      }

      // TEST 3.4: Message can still be edited within 3 minutes
      try {
        const editedAfterAttempt = await messagingService.editMessage(
          pagConv._id,
          deleteTestMsg._id,
          studentUser._id,
          'Successfully edited after deletion attempt'
        );
        if (editedAfterAttempt.text === 'Successfully edited after deletion attempt') {
          record('D4', 'Message remains active and editable within 3 minutes', 'PASS', editedAfterAttempt.text);
        } else {
          record('D4', 'Message active check', 'FAIL', 'Unexpected text');
        }
      } catch (editErr) {
        record('D4', 'Message active check', 'FAIL', editErr.message);
      }
    } catch (err) {
      record('D1', 'No deletion general test', 'FAIL', err.message);
    }


    // ─────────────────────────────────────────────────────────────
    // PART 4: ATTACHMENT TESTS
    // ─────────────────────────────────────────────────────────────
    console.log('\n--- PART 4: ATTACHMENT TESTS ---');

    // Create a real dummy file in ATTACHMENTS_DIR for testing authenticated download
    const testAttachmentFilename = `test-${Date.now()}-mock.pdf`;
    const testAttachmentPath = path.join(ATTACHMENTS_DIR, testAttachmentFilename);
    fs.writeFileSync(testAttachmentPath, '%PDF-1.4 mock content for testing');

    // TEST 4.1: Message with attachment metadata created successfully
    let attachmentMsg = null;
    try {
      attachmentMsg = await messagingService.createMessage({
        conversationId: pagConv._id,
        senderUser: studentUser,
        text: 'Please review my transcript',
        attachments: [
          {
            originalName: 'MyTranscript.pdf',
            filename: testAttachmentFilename,
            mimeType: 'application/pdf',
            size: 1024,
            path: testAttachmentFilename,
          },
        ],
      });

      if (
        attachmentMsg.attachments &&
        attachmentMsg.attachments.length === 1 &&
        attachmentMsg.attachments[0].originalName === 'MyTranscript.pdf' &&
        attachmentMsg.attachments[0].url.includes('/attachments/')
      ) {
        record('A1', 'Text + Attachment message created successfully with safe URL', 'PASS', `URL: ${attachmentMsg.attachments[0].url}`);
      } else {
        record('A1', 'Text + Attachment message creation', 'FAIL', 'Missing attachment data');
      }
    } catch (err) {
      record('A1', 'Text + Attachment creation', 'FAIL', err.message);
    }

    // TEST 4.2: Attachment-only message (empty text) is allowed
    try {
      const attOnlyMsg = await messagingService.createMessage({
        conversationId: pagConv._id,
        senderUser: studentUser,
        text: '', // No text
        attachments: [
          {
            originalName: 'PassportScan.jpg',
            filename: testAttachmentFilename,
            mimeType: 'image/jpeg',
            size: 2048,
            path: testAttachmentFilename,
          },
        ],
      });

      if (attOnlyMsg.attachments.length === 1 && attOnlyMsg.text === '') {
        record('A2', 'Attachment-only message (without text) is accepted', 'PASS', `Msg ID: ${attOnlyMsg._id}`);
      } else {
        record('A2', 'Attachment-only message', 'FAIL', 'Rejected or text filled unexpectedly');
      }
    } catch (err) {
      record('A2', 'Attachment-only message', 'FAIL', err.message);
    }

    // TEST 4.3: Empty message (no text AND no attachments) is rejected
    try {
      await messagingService.createMessage({
        conversationId: pagConv._id,
        senderUser: studentUser,
        text: '    ',
        attachments: [],
      });
      record('A3', 'Empty text and no attachment rejected with 400 Bad Request', 'FAIL', 'Unexpected success');
    } catch (err) {
      if (err.statusCode === 400) {
        record('A3', 'Empty text and no attachment rejected with 400 Bad Request', 'PASS', err.message);
      } else {
        record('A3', 'Empty message validation', 'FAIL', err.message);
      }
    }

    // TEST 4.4: Authenticated participant can stream attachment
    try {
      const streamInfo = await messagingService.getAttachmentStream(
        pagConv._id,
        testAttachmentFilename,
        studentUser._id
      );

      if (
        streamInfo.filePath === testAttachmentPath &&
        streamInfo.mimeType === 'application/pdf' &&
        streamInfo.originalName === 'MyTranscript.pdf'
      ) {
        record('A4', 'Authorized participant can access attachment stream', 'PASS', `Path: ${streamInfo.filePath}`);
      } else {
        record('A4', 'Authorized attachment stream', 'FAIL', 'Mismatch in stream info');
      }
    } catch (err) {
      record('A4', 'Authorized attachment stream', 'FAIL', err.message);
    }

    // TEST 4.5: Unauthorized user cannot download attachment (403 Forbidden)
    try {
      await messagingService.getAttachmentStream(
        pagConv._id,
        testAttachmentFilename,
        otherStudent._id // Unrelated student
      );
      record('A5', 'Non-participant attachment download rejected with 403 Forbidden', 'FAIL', 'Unexpected success');
    } catch (err) {
      if (err.statusCode === 403 || err.message.includes('participant')) {
        record('A5', 'Non-participant attachment download rejected with 403 Forbidden', 'PASS', err.message);
      } else {
        record('A5', 'Non-participant attachment download', 'FAIL', err.message);
      }
    }

    // TEST 4.6: Path traversal attempt is rejected (400 Bad Request)
    try {
      await messagingService.getAttachmentStream(
        pagConv._id,
        '../../package.json',
        studentUser._id
      );
      record('A6', 'Path traversal attempt rejected with 400 Bad Request', 'FAIL', 'Unexpected success');
    } catch (err) {
      if (err.statusCode === 400) {
        record('A6', 'Path traversal attempt rejected with 400 Bad Request', 'PASS', err.message);
      } else {
        record('A6', 'Path traversal attempt check', 'FAIL', err.message);
      }
    }

    // Clean up test dummy file
    if (fs.existsSync(testAttachmentPath)) {
      fs.unlinkSync(testAttachmentPath);
    }

    // ─────────────────────────────────────────────────────────────
    // SUMMARY
    // ─────────────────────────────────────────────────────────────
    console.log('\n====================================================');
    const passed = results.filter(r => r.status === 'PASS').length;
    const failed = results.filter(r => r.status === 'FAIL').length;
    console.log(`TOTAL PHASE 2 TESTS: ${results.length} | PASSED: ${passed} | FAILED: ${failed}`);
    console.log('====================================================\n');

    return { total: results.length, passed, failed };
  } catch (fatalErr) {
    console.error('[FATAL ERROR IN TEST RUNNER]', fatalErr);
    return { total: 0, passed: 0, failed: 1, error: fatalErr.message };
  }
}

runPhase2Tests();
