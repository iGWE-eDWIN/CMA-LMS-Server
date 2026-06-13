const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    // =====================
    // CORE RELATION
    // =====================
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true,
    },

    editedMessage: String,

    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // =====================
    // MESSAGE CONTENT
    // =====================
    messageText: {
      type: String,
    },

    messageType: {
      type: String,
      enum: ['text', 'file', 'image', 'video'],
      default: 'text',
    },

    attachments: [
      {
        filename: String,
        url: String,
        fileType: String,
        fileSize: Number,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // =====================
    // DELIVERY STATUS (SCALABLE FIX)
    // =====================
    status: {
      type: String,
      enum: ['sent', 'delivered', 'read'],
      default: 'sent',
      index: true,
    },

    readBy: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        readAt: Date,
      },
    ],

    // =====================
    // EDIT / DELETE
    // =====================
    isEdited: {
      type: Boolean,
      default: false,
    },

    editedAt: Date,

    isDeleted: {
      type: Boolean,
      default: false,
    },

    deletedAt: Date,

    // =====================
    // REACTIONS (SCALABLE FIX)
    // =====================
    reactions: {
      type: Map,
      of: String, // userId -> emoji
      default: {},
    },

    // =====================
    // REPLY SYSTEM
    // =====================
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
    },

    // =====================
    // ORDERING (VERY IMPORTANT FOR SCALE)
    // =====================
    sequenceId: {
      type: Number,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

/* =====================
   SCALABILITY INDEXES
===================== */

// Fast chat loading (MOST IMPORTANT INDEX 🔥)
messageSchema.index({ conversationId: 1, createdAt: -1 });

// Pagination optimization
messageSchema.index({ conversationId: 1, sequenceId: -1 });

// Sender filtering (optional admin analytics)
messageSchema.index({ senderId: 1 });

/* =====================
   METHODS
===================== */

// Mark message as read by user
messageSchema.methods.markAsRead = function (userId) {
  const alreadyRead = this.readBy.some(
    (r) => r.userId.toString() === userId.toString()
  );

  if (!alreadyRead) {
    this.readBy.push({
      userId,
      readAt: new Date(),
    });
  }

  this.status = 'read';
};

// Add reaction safely
messageSchema.methods.addReaction = function (userId, emoji) {
  this.reactions.set(userId.toString(), emoji);
};

// Remove reaction
messageSchema.methods.removeReaction = function (userId) {
  this.reactions.delete(userId.toString());
};

// Soft delete
messageSchema.methods.softDelete = function () {
  this.isDeleted = true;
  this.deletedAt = new Date();
};

module.exports = mongoose.model('Message', messageSchema);