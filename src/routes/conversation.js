const express = require('express');
const router = express.Router();

const ConversationController = require('../controller/conversation');
const {auth} = require('../middleware/auth');

// Create conversation
router.post(
  '/api/conversation/',
  auth,
  ConversationController.createConversation
);

// Get my conversations
router.get(
  '/api/conversation',
  auth,
  ConversationController.getMyConversations
);

// Get single conversation
router.get(
  '/api/conversation/:conversationId',
  auth,
  ConversationController.getConversation
);

// Archive conversation
router.patch(
  '/api/conversation/:conversationId/archive',
  auth,
  ConversationController.archiveConversation
);

module.exports = router;