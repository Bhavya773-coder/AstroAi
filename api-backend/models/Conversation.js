const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date }
  },
  { collection: 'conversations' }
);

ConversationSchema.pre('save', function (next) {
  if (!this.created_at) this.created_at = new Date();
  this.updated_at = new Date();
  next();
});

ConversationSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updated_at: new Date() });
  next();
});

module.exports = mongoose.model('Conversation', ConversationSchema);
