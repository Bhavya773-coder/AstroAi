const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversation_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 5000
  },
  ai_analysis_tags: {
    type: [String],
    default: []
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: false, // We use our own created_at field
  collection: 'messages'
});

// Index for faster queries
messageSchema.index({ conversation_id: 1, created_at: 1 });

module.exports = mongoose.model('Message', messageSchema);
