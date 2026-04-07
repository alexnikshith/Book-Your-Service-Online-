const mongoose = require('mongoose');

const aiReportSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['chat_mod', 'provider_approval', 'user_flag'],
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low'
  },
  content: {
    type: String,
    required: true
  },
  relatedUser: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  relatedProvider: {
    type: mongoose.Schema.ObjectId,
    ref: 'Provider'
  },
  relatedMessage: {
    type: mongoose.Schema.ObjectId,
    ref: 'Message'
  },
  aiAnalysis: {
    type: String
  },
  actionTaken: {
    type: String,
    enum: ['pending', 'resolved', 'dismissed', 'scrubbed'],
    default: 'pending'
  },
  adminNotes: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('AIReport', aiReportSchema);
