const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema(
  {
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
      required: true,
      index: true,
    },

    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    description: {
      type: String,
      maxlength: 2000,
    },

    // 🔥 CDN-ready video sources
    sources: [
      {
        quality: {
          type: String, // 360p, 720p, 1080p
        },
        url: String,
        format: {
          type: String, // mp4, hls, dash
        },
      },
    ],

    thumbnailUrl: String,

    duration: {
      type: Number, // seconds
      default: 0,
    },

    codec: String,
    resolution: String,

    // 🔥 IMPORTANT: avoid hot document problem
    analytics: {
      views: {
        type: Number,
        default: 0,
      },

      totalWatchTime: {
        type: Number,
        default: 0,
      },
    },

    // 🔥 PROCESSING PIPELINE STATUS
    processingStatus: {
      type: String,
      enum: ['pending', 'processing', 'ready', 'failed'],
      default: 'pending',
      index: true,
    },

    uploadStatus: {
      type: String,
      enum: ['uploading', 'completed', 'failed'],
      default: 'uploading',
    },

    isPublic: {
      type: Boolean,
      default: true,
      index: true,
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Instructor',
    },
  },
  { timestamps: true }
);

videoSchema.index({ lessonId: 1, isPublic: 1 });
videoSchema.index({ courseId: 1 });
videoSchema.index({ processingStatus: 1 });
videoSchema.index({ createdAt: -1 });