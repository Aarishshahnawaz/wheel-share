const mongoose = require('mongoose');

if (mongoose.models.Notification) delete mongoose.models.Notification;

const notificationSchema = new mongoose.Schema({
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: {
    type: String,
    enum: ['booking_request', 'booking_accepted', 'booking_rejected',
           'booking_cancelled', 'new_message', 'booking_completed'],
    required: true,
  },
  title:     { type: String, required: true },
  body:      { type: String, required: true },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  isRead:    { type: Boolean, default: false },
  data:      { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

notificationSchema.index({ recipientId: 1, createdAt: -1 });
notificationSchema.index({ recipientId: 1, isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
