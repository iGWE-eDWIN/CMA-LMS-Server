const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    // =====================
    // PARTICIPANTS (SCALABLE STRUCTURE)
    // =====================
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],

    // UNIQUE KEY FOR DIRECT CHAT (VERY IMPORTANT 🔥)
    conversationKey: {
      type: String,
      unique: true,
      index: true,
    },

    conversationType: {
      type: String,
      enum: ['direct', 'group', 'support'],
      default: 'direct',
      index: true,
    },

  

    // =====================
    // LAST MESSAGE SNAPSHOT (NO EXTRA QUERY NEEDED)
    // =====================
    lastMessage: {
      text: String,
      senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      messageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
      },
      createdAt: Date,
    },
conversationType: {
  type: String,
  enum: ['direct'],
  default: 'direct',
},
    lastMessageAt: {
      type: Date,
      index: true,
    },

    // =====================
    // UNREAD COUNTS (SCALABLE FIX)
    // =====================
    unreadCounts: {
      type: Map,
      of: Number,
      default: {},
    },

    // =====================
    // STATUS FLAGS
    // =====================
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },

    isPinned: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

/* =====================
   SCALABILITY INDEXES
===================== */

// Fast lookup: all conversations for a user
conversationSchema.index({ participants: 1, lastMessageAt: -1 });

// Efficient sorting for chat list
conversationSchema.index({ lastMessageAt: -1 });

// Prevent duplicate direct conversations (VERY IMPORTANT 🔥)
conversationSchema.index(
  { conversationKey: 1 },
  { unique: true }
);

/* =====================
   METHODS
===================== */

// Generate stable key for direct chat (A-B = B-A same chat)
conversationSchema.statics.generateKey = function (userId1, userId2) {
  return [userId1.toString(), userId2.toString()]
    .sort()
    .join('_');
};

// Update last message safely
conversationSchema.methods.updateLastMessage = function (message) {
  this.lastMessage = {
    text: message.text,
    senderId: message.senderId,
    messageId: message._id,
    createdAt: message.createdAt,
  };

  this.lastMessageAt = new Date();
};

// Increment unread count for a user
conversationSchema.methods.incrementUnread = function (userId) {
  const current = this.unreadCounts.get(userId.toString()) || 0;
  this.unreadCounts.set(userId.toString(), current + 1);
};

// Reset unread count
conversationSchema.methods.resetUnread = function (userId) {
  this.unreadCounts.set(userId.toString(), 0);
};

module.exports = mongoose.model('Conversation', conversationSchema);