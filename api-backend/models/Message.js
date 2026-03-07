const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
    index: true
  },
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

messageSchema.index({ conversation_id: 1, created_at: 1 });
messageSchema.index({ user_id: 1, created_at: -1 });

module.exports = mongoose.model('Message', messageSchema);
