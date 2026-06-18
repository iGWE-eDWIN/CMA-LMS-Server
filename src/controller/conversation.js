const Conversation = require('../models/conversation');
const User = require('../models/user');

class ConversationController {
  async createConversation(req, res) {
    try {
      const { participantId } = req.body;

      if (!participantId) {
        return res.status(400).json({
          success: false,
          message: 'Participant is required',
        });
      }

      if (participantId === req.user._id.toString()) {
        return res.status(400).json({
          success: false,
          message: 'Cannot create conversation with yourself',
        });
      }

      const conversationKey =
        Conversation.generateKey(
          req.user._id,
          participantId
        );

      let conversation = await Conversation.findOne({
        conversationKey,
      });

      if (conversation) {
        return res.status(200).json({
          success: true,
          data: conversation,
        });
      }

      conversation = await Conversation.create({
        participants: [
          req.user._id,
          participantId,
        ],
        conversationKey,
        conversationType: 'direct',
      });

      return res.status(201).json({
        success: true,
        data: conversation,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: 'Failed to create conversation',
      });
    }
  }

  async getMyConversations(req, res) {
    try {
      const conversations =
        await Conversation.find({
          participants: req.user._id,
        })
          .populate(
            'participants',
            'firstName lastName email avatar'
          )
          .sort({
            lastMessageAt: -1,
          });

      return res.status(200).json({
        success: true,
        count: conversations.length,
        data: conversations,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message:
          'Failed to fetch conversations',
      });
    }
  }

  async getConversation(req, res) {
    try {
      const conversation =
        await Conversation.findById(
          req.params.conversationId
        ).populate(
          'participants',
          'firstName lastName email avatar'
        );

      if (!conversation) {
        return res.status(404).json({
          success: false,
          message:
            'Conversation not found',
        });
      }

      return res.status(200).json({
        success: true,
        data: conversation,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message:
          'Failed to fetch conversation',
      });
    }
  }

  async archiveConversation(req, res) {
    try {
      const conversation =
        await Conversation.findById(
          req.params.conversationId
        );

      if (!conversation) {
        return res.status(404).json({
          success: false,
          message:
            'Conversation not found',
        });
      }

      conversation.isArchived = true;

      await conversation.save();

      return res.status(200).json({
        success: true,
        message:
          'Conversation archived',
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message:
          'Failed to archive conversation',
      });
    }
  }
}

module.exports = new ConversationController();