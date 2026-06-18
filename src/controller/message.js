const Message = require('../models/message');
const Conversation = require('../models/conversation');

class MessageController {
  async sendMessage(req, res) {
    try {
      const {
        conversationId,
        messageText,
        messageType,
        replyTo,
      } = req.body;

      const conversation =
        await Conversation.findById(
          conversationId
        );

      if (!conversation) {
        return res.status(404).json({
          success: false,
          message:
            'Conversation not found',
        });
      }

      const lastMessage =
        await Message.findOne({
          conversationId,
        }).sort({ sequenceId: -1 });

      const sequenceId = lastMessage
        ? lastMessage.sequenceId + 1
        : 1;

      const message =
        await Message.create({
          conversationId,
          senderId: req.user._id,
          messageText,
          messageType:
            messageType || 'text',
          replyTo,
          sequenceId,
        });

      conversation.updateLastMessage({
        text: message.messageText,
        senderId: req.user._id,
        _id: message._id,
        createdAt: message.createdAt,
      });

      conversation.participants.forEach(
        participant => {
          if (
            participant.toString() !==
            req.user._id.toString()
          ) {
            conversation.incrementUnread(
              participant
            );
          }
        }
      );

      await conversation.save();

      return res.status(201).json({
        success: true,
        data: message,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message:
          'Failed to send message',
      });
    }
  }

  async getMessages(req, res) {
    try {
      const messages =
        await Message.find({
          conversationId:
            req.params.conversationId,
        })
          .populate(
            'senderId',
            'firstName lastName'
          )
          .populate('replyTo')
          .sort({ sequenceId: 1 });

      return res.status(200).json({
        success: true,
        count: messages.length,
        data: messages,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message:
          'Failed to fetch messages',
      });
    }
  }

  async markAsRead(req, res) {
    try {
      const message =
        await Message.findById(
          req.params.messageId
        );

      if (!message) {
        return res.status(404).json({
          success: false,
          message: 'Message not found',
        });
      }

      message.markAsRead(req.user._id);

      await message.save();

      return res.status(200).json({
        success: true,
        message: 'Message marked read',
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message:
          'Failed to update message',
      });
    }
  }

  async reactToMessage(req, res) {
    try {
      const { emoji } = req.body;

      const message =
        await Message.findById(
          req.params.messageId
        );

      if (!message) {
        return res.status(404).json({
          success: false,
          message: 'Message not found',
        });
      }

      message.addReaction(
        req.user._id,
        emoji
      );

      await message.save();

      return res.status(200).json({
        success: true,
        data: message,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message:
          'Failed to react message',
      });
    }
  }

  async deleteMessage(req, res) {
    try {
      const message =
        await Message.findById(
          req.params.messageId
        );

      if (!message) {
        return res.status(404).json({
          success: false,
          message: 'Message not found',
        });
      }

      if (
        message.senderId.toString() !==
        req.user._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message:
            'Not authorized to delete',
        });
      }

      message.softDelete();

      await message.save();

      return res.status(200).json({
        success: true,
        message: 'Message deleted',
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message:
          'Failed to delete message',
      });
    }
  }
}

module.exports = new MessageController();