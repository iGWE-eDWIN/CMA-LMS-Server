const express = require('express');
const router = express.Router();

const MessageController = require('../controller/message');
const {auth} = require('../middleware/auth')

// Send message
router.post(
  '/api/message/',
  auth,
  MessageController.sendMessage
);

// Get messages in a conversation
router.get(
  '/api/message/conversation/:conversationId',
  auth,
  MessageController.getMessages
);

// Mark message as read
router.patch(
  '/api/message/:messageId/read',
  auth,
  MessageController.markAsRead
);

// React to message
router.patch(
  '/api/message/:messageId/react',
  auth,
  MessageController.reactToMessage
);

// Delete message
router.delete(
  '/api/message/:messageId',
  auth,
  MessageController.deleteMessage
);

module.exports = router;