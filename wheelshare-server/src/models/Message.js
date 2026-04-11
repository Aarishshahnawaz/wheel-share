const mongoose = require('mongoose');

if (mongoose.models.Message) delete mongoose.models.Message;

const messageSchema = new mongoose.Schema({
  chatId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type:    String,
    enum:    ['text', 'location', 'contact', 'system'],
    default: 'text',
  },
  text:     { type: String, default: '' },
  // For location messages
  location: {
    lat:     Number,
    lng:     Number,
    address: String,
  },
  // For contact sharing
  contact: {
    name:  String,
    phone: String,
  },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

messageSchema.index({ chatId: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);
