const mongoose = require('mongoose');

if (mongoose.models.Chat) delete mongoose.models.Chat;

const chatSchema = new mongoose.Schema({
  bookingId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],  // [renterId, ownerId]
  lastMessage: {
    text:      String,
    senderId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: Date,
  },
  renterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ownerId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

chatSchema.index({ bookingId: 1 });
chatSchema.index({ participants: 1 });

module.exports = mongoose.model('Chat', chatSchema);
