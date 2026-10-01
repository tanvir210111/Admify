import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { handleAttachmentUpload } from '../middleware/attachmentMiddleware.js';
import {
  getMyConversations,
  getMyContacts,
  resolveDirectConversation,
  getMessagesForConversation,
  sendMessageInConversation,
  editMessageInConversation,
  deleteMessageInConversation,
  getAttachmentInConversation,
  reactToMessageInConversation,
  markConversationSeen,
} from '../controllers/conversationController.js';

const router = express.Router();

// Strict authentication required on all conversation endpoints
router.use(protect);

router.get('/', getMyConversations);
router.get('/contacts', getMyContacts);
router.post('/direct', resolveDirectConversation);
router.get('/:conversationId/messages', getMessagesForConversation);
router.post('/:conversationId/messages', handleAttachmentUpload('attachment'), sendMessageInConversation);
router.patch('/:conversationId/messages/:messageId', editMessageInConversation);
router.delete('/:conversationId/messages/:messageId', deleteMessageInConversation);
router.get('/:conversationId/attachments/:filename', getAttachmentInConversation);
router.post('/:conversationId/messages/:messageId/reactions', reactToMessageInConversation);
router.post('/:conversationId/read', markConversationSeen);

export default router;
