import {
  getUserConversations,
  getConversationMessages,
  resolveConversation,
  createMessage,
  editMessage,
  softDeleteMessage,
  getAttachmentStream,
  verifyMessagingPermission,
  getUserById,
  getAuthorizedContacts,
  addOrToggleReaction,
  markConversationAsRead,
} from '../services/messagingService.js';

/**
 * @desc    Get all active conversations for the authenticated user
 * @route   GET /api/conversations
 * @access  Private
 */
export const getMyConversations = async (req, res, next) => {
  try {
    const conversations = await getUserConversations(req.user._id);
    return res.status(200).json({
      success: true,
      count: conversations.length,
      data: { conversations },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get authorized contacts for messaging
 * @route   GET /api/conversations/contacts
 * @access  Private
 */
export const getMyContacts = async (req, res, next) => {
  try {
    const contacts = await getAuthorizedContacts(req.user);
    return res.status(200).json({
      success: true,
      count: contacts.length,
      data: { contacts },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Resolve or start a direct 1-to-1 conversation with an authorized user
 * @route   POST /api/conversations/direct
 * @access  Private
 */
export const resolveDirectConversation = async (req, res, next) => {
  try {
    const { receiverId, context } = req.body;
    if (!receiverId) {
      return res.status(400).json({
        success: false,
        message: 'Recipient ID (receiverId) is required.',
      });
    }

    const receiverUser = await getUserById(receiverId);
    if (!receiverUser) {
      return res.status(404).json({
        success: false,
        message: 'Recipient user not found.',
      });
    }

    const permission = await verifyMessagingPermission(req.user, receiverUser);
    if (!permission.authorized) {
      return res.status(403).json({
        success: false,
        message: permission.message,
      });
    }

    const conversation = await resolveConversation(req.user, receiverUser, context);

    return res.status(200).json({
      success: true,
      data: { conversation },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get paginated chronological messages for a conversation
 * @route   GET /api/conversations/:conversationId/messages
 * @access  Private
 */
export const getMessagesForConversation = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { page, limit } = req.query;

    const result = await getConversationMessages(conversationId, req.user._id, { page, limit });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * @desc    Send a message within an existing conversation (supports text, attachment, or both)
 * @route   POST /api/conversations/:conversationId/messages
 * @access  Private
 */
export const sendMessageInConversation = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { text } = req.body;

    const attachments = req.file
      ? [
          {
            originalName: req.file.originalname,
            filename: req.file.filename,
            mimeType: req.file.mimetype,
            size: req.file.size,
            path: req.file.path,
          },
        ]
      : [];

    if ((!text || !text.trim()) && attachments.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message must contain either text or an attachment.',
      });
    }

    const newMsg = await createMessage({
      conversationId,
      senderUser: req.user,
      text: text ? text.trim() : '',
      attachments,
    });

    return res.status(201).json({
      success: true,
      data: { message: newMsg },
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * @desc    Edit a sent message within 5-minute window
 * @route   PATCH /api/conversations/:conversationId/messages/:messageId
 * @access  Private
 */
export const editMessageInConversation = async (req, res, next) => {
  try {
    const { conversationId, messageId } = req.params;
    const { text } = req.body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Updated message text is required.',
      });
    }

    const updatedMsg = await editMessage(conversationId, messageId, req.user._id, text.trim());

    return res.status(200).json({
      success: true,
      data: { message: updatedMsg },
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * @desc    Soft delete a sent message (sender only)
 * @route   DELETE /api/conversations/:conversationId/messages/:messageId
 * @access  Private
 */
export const deleteMessageInConversation = async (req, res) => {
  return res.status(405).json({
    success: false,
    message: 'Message deletion is not permitted on this platform.',
  });
};


/**
 * @desc    Securely download/stream an authorized attachment
 * @route   GET /api/conversations/:conversationId/attachments/:filename
 * @access  Private
 */
export const getAttachmentInConversation = async (req, res, next) => {
  try {
    const { conversationId, filename } = req.params;

    const streamInfo = await getAttachmentStream(conversationId, filename, req.user._id);

    res.setHeader('Content-Type', streamInfo.mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(streamInfo.originalName)}"`);

    return res.sendFile(streamInfo.filePath);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * @desc    Add or toggle emoji reaction on a message
 * @route   POST /api/conversations/:conversationId/messages/:messageId/reactions
 * @access  Private
 */
export const reactToMessageInConversation = async (req, res, next) => {
  try {
    const { conversationId, messageId } = req.params;
    const { emoji } = req.body;

    if (!emoji || typeof emoji !== 'string' || !emoji.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Emoji is required.',
      });
    }

    const result = await addOrToggleReaction(conversationId, messageId, req.user._id, emoji.trim());

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * @desc    Mark conversation messages as read
 * @route   POST /api/conversations/:conversationId/read
 * @access  Private
 */
export const markConversationSeen = async (req, res, next) => {
  try {
    const { conversationId } = req.params;

    const result = await markConversationAsRead(conversationId, req.user._id);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};
