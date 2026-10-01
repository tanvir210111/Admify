# ADMIFY — PHASE 2 ADVANCED MESSAGING IMPLEMENTATION REPORT

**Project:** Admify Final Year Project
**Date:** September 30, 2026
**Implementation Phase:** Phase 2 — Advanced Messaging
**Build Status:** Vite v8.0.13 Production Build Succeeded (0 Errors, 6.12s)
**Test Status:** 40 / 40 Total Automated Tests Passed (100% Pass Rate: 21 Phase 1 Regression + 19 Phase 2 Advanced)
**Repository State:** Verified, Clean, Non-Breaking

---

## 1. Executive Summary

Phase 2 builds directly upon the unified 1-to-1 conversation foundation established in Phase 1 without altering core schema contracts or breaking legacy pathways. Phase 2 delivers enterprise-grade message lifecycle capabilities, resolving critical pagination inversions, introducing sender-restricted inline message editing and soft deletion with comprehensive audit trails, and implementing a sandboxed, authenticated attachment distribution pipeline.

Across the frontend, all four operational panels (**Student**, **Agency**, **Agent**, and **University Representative**) now share modular, unified chat components (`MessageBubble` and `MessageAttachmentPicker`), standardizing message formatting, attachment previews, time-bounded edit controls, and soft-delete prompts across the entire platform.

---

## 2. Implemented Features

1. **Fixed Conversation Pagination Pipeline**:
   - Reverse-chronological database fetch (`createdAt: -1`) sorted chronologically (`oldest -> newest`) prior to response serialization.
   - Page 1 delivers the latest messages in natural conversational sequence; successive pages page backwards into history.
   - Enforced maximum limit clamping at 100 items per request to guard against memory exhaustion.

2. **Time-Bounded Message Editing**:
   - `PATCH /api/conversations/:conversationId/messages/:messageId` endpoint.
   - Strict 5-minute edit window (`EDIT_WINDOW_MS = 5 * 60 * 1000`).
   - Authorization restricted exclusively to the original sender (`senderId.toString() === userId.toString()`).
   - Rejects empty edits, whitespace-only edits, non-sender edits, expired edits, and edits on soft-deleted messages.

3. **Server-Side Audit Edit History**:
   - Every mutation appends previous content, modification timestamp, and editor identifier to `editHistory` array on `ChatMessage`.
   - Flags `isEdited: true` and updates `editedAt`.
   - Sensitive previous message versions in `editHistory` are sequestered server-side and never leaked in client API responses.

4. **Sender-Restricted Soft Deletion**:
   - `DELETE /api/conversations/:conversationId/messages/:messageId` endpoint.
   - Authorization restricted exclusively to the original sender.
   - Soft-delete semantics: preserves database record integrity (`isDeleted: true`, `deletedAt`, `deletedBy`), suppresses attachment rendering, and displays `"This message was deleted"` across all clients.
   - Soft-deleted messages are permanently locked against subsequent edits.

5. **Sandboxed Secure Attachment Pipeline**:
   - Native multipart upload handling powered by `multer` v2.2.0.
   - Dedicated local storage directory: `backend/uploads/attachments/`.
   - Cryptographically random filenames (`Date.now() + '-' + crypto.randomBytes(8).toString('hex') + ext`) preventing filename collisions and stripping client directory hints.
   - Strict 10MB file size ceiling (`limits: { fileSize: 10 * 1024 * 1024 }`) with explicit `413 Payload Too Large` responses.
   - Strict MIME and extension whitelisting (`image/jpeg`, `image/png`, `image/webp`, `application/pdf`).

6. **Authorized Attachment Streaming**:
   - Public static access to attachment directories is forbidden; directory is never mounted via `express.static`.
   - Authenticated route: `GET /api/conversations/:conversationId/attachments/:filename`.
   - Two-tier authorization check: verifies requestor is an active participant in the conversation, and confirms the attachment filename belongs to a message within that conversation.
   - Anti-path-traversal protection (`path.basename` enforcement and directory containment checks).

7. **Unified Frontend Messaging UI**:
   - Extracted reusable `MessageBubble` supporting inline editing, 5-minute countdown awareness, delete modals, image lightbox modals, and inline PDF cards.
   - Extracted reusable `MessageAttachmentPicker` with client-side file type and size validation (<10MB), preview cards, and removal triggers.
   - Integrated into Student, Agency, Agent, and University Representative messaging interfaces.

---

## 3. Pagination Fix

### Before vs. After Analysis
- **Before (Phase 1 Inspection Finding)**:
  `messagingService.getConversationMessages` fetched messages with `.sort({ createdAt: 1 })`. When requesting `page = 1, limit = 50`, MongoDB retrieved the *oldest 50 messages from the beginning of time*. For conversations with >50 messages, users were trapped looking at message #1 instead of the latest message #51.
- **After (Phase 2 Implementation)**:
  `messagingService.getConversationMessages` calculates `skip = (page - 1) * limit` and queries with `.sort({ createdAt: -1 })`. This retrieves the newest records for `page = 1`. Before returning to the caller, the retrieved page slice is reversed: `messages.reverse()`.
- **Display Sequence**: Oldest to newest (natural chat flow from top to bottom).
- **Pagination Direction**: Page 1 = Latest batch. Page 2 = Previous older batch.
- **Limit Clamping**: Enforced `Math.min(parsedLimit, 100)`.

### Test Evidence
- **Test P1**: Page 1 of a 120-message conversation returned messages 71 through 120 in chronological order (`[PASS]`).
- **Test P2**: Page 2 returned messages 21 through 70 in chronological order (`[PASS]`).
- **Test P3**: Page 3 returned the oldest 20 messages (1 through 20) with `hasNextPage: false` (`[PASS]`).
- **Test P4**: Requesting `limit = 999` returned clamped 100 items (`[PASS]`).

---

## 4. Message Editing

### Implementation Details
- Handled by `messagingService.editMessage(conversationId, messageId, userId, newText)`.
- Route: `PATCH /api/conversations/:conversationId/messages/:messageId`.
- Controller: `conversationController.editMessageInConversation`.

### Window Enforcement
- Defined `EDIT_WINDOW_MS = 5 * 60 * 1000` (300,000 milliseconds / 5 minutes).
- Checks:
  ```javascript
  const now = new Date();
  const messageAge = now - new Date(message.createdAt);
  if (messageAge > EDIT_WINDOW_MS) {
    const error = new Error('The 5-minute edit window for this message has expired.');
    error.statusCode = 400;
    throw error;
  }
  ```

### Authorization
- Validates sender identity:
  ```javascript
  if (message.senderId && message.senderId.toString() !== userId.toString()) {
    const error = new Error('Access denied: You can only edit your own messages.');
    error.statusCode = 403;
    throw error;
  }
  ```
- Soft-deleted messages cannot be edited:
  ```javascript
  if (message.isDeleted) {
    const error = new Error('Deleted messages cannot be edited.');
    error.statusCode = 400;
    throw error;
  }
  ```

---

## 5. Edit History

### Storage Architecture
Stored directly in MongoDB on the `ChatMessage` document:
```javascript
editHistory: [
  {
    previousText: { type: String, required: true },
    editedAt: { type: Date, default: Date.now },
    editedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }
]
```

### Privacy & Audit Security
- **Audit Capability**: System administrators and compliance processes retain full visibility into prior revisions in the primary database.
- **Client Privacy**: The client formatting helper `messagingService.formatMessageForResponse(msg)` omits `editHistory` from API payloads. Regular chat participants only receive `isEdited: true` and `editedAt`, preventing exposure of sensitive redacted information.

---

## 6. Soft Deletion

### Implementation Details
- Handled by `messagingService.softDeleteMessage(conversationId, messageId, userId)`.
- Route: `DELETE /api/conversations/:conversationId/messages/:messageId`.
- Controller: `conversationController.deleteMessageInConversation`.

### Placeholder Behavior
- When formatted via `formatMessageForResponse`:
  ```javascript
  if (formatted.isDeleted) {
    formatted.text = 'This message was deleted';
    formatted.attachments = [];
  }
  ```
- Frontend UI renders the message with italicized styling, muted gray color, and a strikethrough icon, suppressing edit and delete action menus.

### Database Retention
- The original document is never deleted from MongoDB or `devStore`.
- Persisted metadata:
  ```javascript
  message.isDeleted = true;
  message.deletedAt = new Date();
  message.deletedBy = userId;
  ```

### Authorization
- Only the sender can delete:
  ```javascript
  if (message.senderId && message.senderId.toString() !== userId.toString()) {
    const error = new Error('Access denied: You can only delete your own messages.');
    error.statusCode = 403;
    throw error;
  }
  ```

---

## 7. Attachment Infrastructure

### Upload Pipeline
- Middleware: `backend/middleware/attachmentMiddleware.js`.
- Multipart parser: `multer` disk storage.
- File destination: `backend/uploads/attachments/` (ensured at boot with `{ recursive: true }`).

### Whitelist & Size Validation
- Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`, `application/pdf`.
- Allowed extensions: `.jpg`, `.jpeg`, `.png`, `.webp`, `.pdf`.
- File size limit: 10MB (10,485,760 bytes).
- Oversized uploads trigger Multer `LIMIT_FILE_SIZE` caught and mapped to HTTP `413 Payload Too Large`.
- Unaccepted file types trigger explicit HTTP `415 Unsupported Media Type`.

---

## 8. Attachment Security

### Authorization Verification
- Route: `GET /api/conversations/:conversationId/attachments/:filename`.
- Middleware stack: `protect` (JWT validation).
- Controller: `conversationController.getAttachmentInConversation`.
- Verification sequence:
  1. Authenticates requesting user from JWT.
  2. Resolves conversation and verifies user is in `conversation.participants`. If not, responds `403 Forbidden: You are not a participant in this conversation`.
  3. Verifies that `filename` is linked to an existing, non-deleted `ChatMessage` within that exact `conversationId`.
  4. Resolves absolute path inside `backend/uploads/attachments/`.
  5. Confirms file exists on local disk; returns `404 Not Found` if missing.

### Path Traversal Defenses
- Enforces `path.basename(filename) === filename` to reject path separators (`/`, `\`, `..`).
- Normalizes resolved path with `path.resolve` and verifies `resolvedPath.startsWith(ATTACHMENTS_DIR)`. Any deviation immediately throws HTTP `400 Bad Request`.

---

## 9. Frontend Changes

### 1. `src/components/chat/MessageBubble.jsx`
- Reusable message presentation component for all roles.
- Features:
  - Sender vs. receiver visual distinction with responsive tail alignment.
  - Timestamp rendering and `(edited)` badge with tooltip on edited messages.
  - Visual placeholder styling for soft-deleted messages.
  - Inline edit mode with auto-focus textarea, Save and Cancel controls, and keyboard shortcuts (`Enter` to submit, `Esc` to cancel).
  - 5-minute dynamic timer logic hiding the Edit action once the window elapses.
  - Delete confirmation modal dialog.
  - Image thumbnail with modal image preview lightbox.
  - PDF attachment card with document icon, filename, and download button pointing to authenticated attachment endpoint.

### 2. `src/components/chat/MessageAttachmentPicker.jsx`
- Interactive attachment tray for message composer inputs.
- Validates file selection client-side against the 10MB limit and whitelisted extensions (`.jpg`, `.jpeg`, `.png`, `.webp`, `.pdf`).
- Displays a dismissible pending attachment chip with file icon, truncated filename, file size, and remove button (`✕`).

### 3. API Client Multi-Part Support
- Updated `src/lib/api.js` and `src/services/api.js`:
  - When the request body is an instance of `FormData`, automatic setting of `'Content-Type': 'application/json'` is omitted, allowing the browser to inject the boundary-separated `multipart/form-data` header.
  - Added `patch(endpoint, data)` helper to `src/services/api.js`.

### 4. Role Panels Updated
- **Student** (`src/pages/student/StudentMessagesPage.jsx`): Replaced custom inline message rendering with `MessageBubble` and integrated `MessageAttachmentPicker`.
- **Agency** (`src/pages/agency/AgencyMessages.jsx`): Replaced legacy message list with `MessageBubble` and `MessageAttachmentPicker`.
- **Agent** (`src/pages/agent/AgentMessages.jsx`): Standardized on `MessageBubble` and `MessageAttachmentPicker`.
- **University Representative** (`src/pages/university-rep/UniRepMessages.jsx`): Standardized on `MessageBubble` and `MessageAttachmentPicker`.

---

## 10. Notification Compatibility

- **Edits**: Editing a message updates the text in place and flags `isEdited: true`. It does NOT trigger a new unread notification for the receiver, preventing notification spam.
- **Deletions**: Soft-deleting a message sets `isDeleted: true` and replaces the text with `"This message was deleted"`. Existing notification counters are decremented or preserved based on unread state.
- **Attachments**: Notifications for messages with attachments format the notification summary as `"Sent an attachment: [filename]"` or include the accompanying message text.

---

## 11. Seen/Unseen Compatibility

- **Unread Counts**: Soft-deleting an already seen message does not alter unread counts. Soft-deleting an unseen message decrements the receiver's unread counter if `read: false`.
- **Conversation Last Message**: Soft-deleted messages retain conversation `lastMessage` references, ensuring the conversation list displays `"This message was deleted"` rather than a broken or blank entry.
- **Edit Immutability**: Editing a message does not reset the message's `read` status back to `false`.

---

## 12. Security Validation

| Security Check | Expected Outcome | Actual Result |
| :--- | :--- | :--- |
| **Non-sender edits message** | HTTP 403 Forbidden | `[PASS]` |
| **Edit after 5 minutes** | HTTP 400 Bad Request | `[PASS]` |
| **Empty string message edit** | HTTP 400 Bad Request | `[PASS]` |
| **Edit soft-deleted message** | HTTP 400 Bad Request | `[PASS]` |
| **Non-sender deletes message** | HTTP 403 Forbidden | `[PASS]` |
| **Access attachment without auth** | HTTP 401 Unauthorized | `[PASS]` |
| **Non-participant downloads attachment** | HTTP 403 Forbidden | `[PASS]` |
| **Path traversal attachment attempt** (`../../etc/passwd`) | HTTP 400 Bad Request | `[PASS]` |
| **Upload file exceeding 10MB** | HTTP 413 Payload Too Large | `[PASS]` |
| **Upload unwhitelisted file extension** (`.exe`) | HTTP 415 Unsupported Media Type | `[PASS]` |
| **Client access to `editHistory` array** | Stripped from API response | `[PASS]` |

---

## 13. Database Changes

### Mongoose Model: `ChatMessage` (`backend/models/ChatMessage.js`)
- Added Schema fields:
  ```javascript
  attachments: [{
    url: { type: String, required: true },
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true }
  }],
  isEdited: { type: Boolean, default: false },
  editedAt: { type: Date },
  editHistory: [{
    previousText: { type: String, required: true },
    editedAt: { type: Date, default: Date.now },
    editedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date },
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  ```
- Made `text` field optional (`required: false`) when `attachments` are present, validated via pre-save hook.
- Added compound index:
  ```javascript
  chatMessageSchema.index({ conversationId: 1, createdAt: -1 });
  ```

---

## 14. Files Modified

1. **`backend/package.json` & `backend/package-lock.json`**: Added `multer` (v2.2.0) dependency.
2. **`backend/models/ChatMessage.js`**: Updated schema with attachments, edit history, soft deletion flags, and compound index.
3. **`backend/services/messagingService.js`**: Added pagination inversion fix, attachment upload storage, attachment URL formatting, response masking, message editing, soft deletion, and attachment stream resolution.
4. **`backend/controllers/conversationController.js`**: Implemented `sendMessageInConversation` (with attachment handling), `editMessageInConversation`, `deleteMessageInConversation`, and `getAttachmentInConversation`.
5. **`backend/routes/conversationRoutes.js`**: Registered upload middleware, patch route, delete route, and attachment retrieval route.
6. **`backend/controllers/agencyController.js`**: Added attachment support to legacy endpoint.
7. **`backend/controllers/agentController.js`**: Added attachment support to legacy endpoint.
8. **`backend/controllers/universityRepController.js`**: Added attachment support to legacy endpoint.
9. **`backend/routes/agencyRoutes.js`**: Mounted attachment middleware on legacy routes.
10. **`backend/routes/agentRoutes.js`**: Mounted attachment middleware on legacy routes.
11. **`backend/routes/universityRepRoutes.js`**: Mounted attachment middleware on legacy routes.
12. **`src/lib/api.js`**: Added `FormData` detection to prevent invalid `Content-Type` overriding.
13. **`src/services/api.js`**: Added `patch` method and updated multipart request handling.
14. **`src/pages/student/StudentMessagesPage.jsx`**: Integrated `MessageBubble` and `MessageAttachmentPicker`.
15. **`src/pages/agency/AgencyMessages.jsx`**: Integrated `MessageBubble` and `MessageAttachmentPicker`.
16. **`src/pages/agent/AgentMessages.jsx`**: Integrated `MessageBubble` and `MessageAttachmentPicker`.
17. **`src/pages/university-rep/UniRepMessages.jsx`**: Integrated `MessageBubble` and `MessageAttachmentPicker`.

---

## 15. Files Created

1. **`backend/middleware/attachmentMiddleware.js`**: Multer configuration with whitelist filtering, size limits, and sanitization.
2. **`src/components/chat/MessageBubble.jsx`**: Shared modular component for bubble rendering, editing, deletion, and media display.
3. **`src/components/chat/MessageAttachmentPicker.jsx`**: Shared attachment selector and preview thumbnail component.
4. **`backend/test_phase2.js`**: Complete 19-test automated Phase 2 test suite.
5. **`PHASE_2_MESSAGING_IMPLEMENTATION_REPORT.md`**: This comprehensive implementation documentation.

---

## 16. Files Intentionally Not Modified

1. **`backend/server.js`**: Socket.io / WebSocket initialization is strictly reserved for Phase 3.
2. **`backend/routes/adminRoutes.js` & `backend/controllers/adminController.js`**: Admin supervisory messaging monitoring is strictly reserved for Phase 3.
3. **`backend/models/Application.js` & Application Flow**: Unrelated to messaging; left intact to guarantee stability.
4. **Authentication Middleware (`backend/middleware/authMiddleware.js`)**: Base RBAC and JWT validation contracts left untouched.

---

## 17. Tests Executed

| Test ID | Category | Description |
| :--- | :--- | :--- |
| **P1** | Pagination | Page 1 returns newest 50 messages in natural chronological order |
| **P2** | Pagination | Page 2 returns previous 50 messages in natural chronological order |
| **P3** | Pagination | Page 3 returns oldest remaining messages with `hasNextPage = false` |
| **P4** | Pagination | Page limit clamped to maximum 100 items when requesting 999 |
| **E1** | Edit | Sender can edit message within 5-minute window |
| **E2** | Edit | Server preserves complete edit history with audit timestamps |
| **E3** | Edit | Non-sender cannot edit message (HTTP 403 Forbidden) |
| **E4** | Edit | Empty edit string rejected (HTTP 400 Bad Request) |
| **E5** | Edit | Edit after 5-minute window rejected (HTTP 400 Bad Request) |
| **D1** | Soft Delete | Non-sender cannot delete message (HTTP 403 Forbidden) |
| **D2** | Soft Delete | Sender soft-deletes message; returns `"This message was deleted"` |
| **D3** | Soft Delete | Database document retained with `isDeleted = true` and `deletedBy` |
| **D4** | Soft Delete | Soft-deleted message cannot be edited (HTTP 400 Bad Request) |
| **A1** | Attachment | Multipart message with text + attachment created with secure URL |
| **A2** | Attachment | Attachment-only message without text is accepted |
| **A3** | Attachment | Message with neither text nor attachment rejected (HTTP 400) |
| **A4** | Attachment | Authorized conversation participant can download attachment stream |
| **A5** | Attachment | Non-participant download attempt rejected (HTTP 403 Forbidden) |
| **A6** | Attachment | Path traversal filename attempt rejected (HTTP 400 Bad Request) |
| **Regr** | Phase 1 | 21 Phase 1 regression tests re-verified |

---

## 18. Test Results

- **Phase 1 Regression Tests (`backend/test_phase1.js`)**: 21 / 21 Passed (100%)
- **Phase 2 Advanced Tests (`backend/test_phase2.js`)**: 19 / 19 Passed (100%)
- **Combined Test Total**: **40 / 40 Passed (100% Pass Rate, 0 Failures)**

---

## 19. Build Result

- Command: `npm run build`
- Output:
  ```
  vite v8.0.13 building client environment for production...
  transforming...✓ 2312 modules transformed.
  rendering chunks...
  computing gzip size...
  dist/index.html                     0.66 kB │ gzip:   0.38 kB
  dist/assets/index-D3OUD2cf.css    268.82 kB │ gzip:  29.04 kB
  dist/assets/index-CFWbDHNG.js   2,343.21 kB │ gzip: 514.22 kB
  ✓ built in 6.12s
  ```
- **Build Status**: **PASS** (Zero compiler or bundling errors).

---

## 20. Regression Result

All Phase 1 foundational features were re-tested after Phase 2 implementation:
- Conversation creation: **PASS**
- Canonical duplicate conversation prevention: **PASS**
- Cross-role authorization: **PASS**
- Legacy endpoint backward compatibility (`/api/student/messages`, `/api/agency/messages`, `/api/agent/messages`, `/api/university-rep/messages`): **PASS**
- Seen/unseen counter increments: **PASS**
- Conversation summary retrieval: **PASS**

---

## 21. Known Limitations

1. **Polling-Based Delivery**: Real-time push delivery via WebSockets / Socket.io is not part of Phase 2; clients currently retrieve updates via conversational polling.
2. **Local Disk Storage**: Attachment files are stored in the local file system (`backend/uploads/attachments/`). In a production multi-server cluster, an S3-compatible cloud object store (AWS S3, Google Cloud Storage, or MinIO) would be recommended.
3. **Single File per Message**: Currently, one attachment is permitted per message upload.
4. **No Media Transcoding**: Video/audio transcoding and image thumbnail generation are deferred to future phases.

---

## 22. Phase 3 Preparation

Phase 2 establishes the data structures and endpoints necessary for Phase 3 real-time capabilities:
- `MessageBubble` and `MessageAttachmentPicker` are modularized and ready to accept real-time event updates (`message_edited`, `message_deleted`, `new_message`).
- The attachment authorization streaming endpoint is compatible with WebSocket URL delivery.
- MongoDB compound indexing `{ conversationId: 1, createdAt: -1 }` is primed for high-throughput real-time listeners.

---

## 23. Final Status

# **SUCCESS**

All Phase 2 requirements have been implemented, tested, verified against regressions, and validated with a clean production build.
