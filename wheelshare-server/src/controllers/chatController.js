const Chat    = require('../models/Chat');
const Message = require('../models/Message');
const Booking = require('../models/Booking');
const { createNotification } = require('./notificationController');

// GET /api/chats — all chats for current user
exports.getMyChats = async (req, res) => {
  try {
    const chats = await Chat.find({ participants: req.user._id })
      .populate('bookingId', 'startDate endDate status vehicleSnapshot')
      .populate('renterId', 'name profileImage')
      .populate('ownerId',  'name profileImage')
      .sort({ updatedAt: -1 })
      .lean();
    res.json({ success: true, data: chats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/chats/booking/:bookingId — get or create chat for a booking
exports.getChatByBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    const uid = req.user._id.toString();
    const isParticipant = booking.userId.toString() === uid || booking.ownerId.toString() === uid;
    if (!isParticipant) return res.status(403).json({ success: false, message: 'Access denied' });

    let chat = await Chat.findOne({ bookingId: booking._id })
      .populate('renterId', 'name profileImage phone')
      .populate('ownerId',  'name profileImage phone');

    if (!chat) {
      chat = await Chat.create({
        bookingId:    booking._id,
        participants: [booking.userId, booking.ownerId],
        renterId:     booking.userId,
        ownerId:      booking.ownerId,
      });
      // Add system message
      await Message.create({
        chatId:   chat._id,
        senderId: booking.userId,
        type:     'system',
        text:     '💬 Chat started. You can now communicate about the booking.',
      });
      chat = await Chat.findById(chat._id)
        .populate('renterId', 'name profileImage phone')
        .populate('ownerId',  'name profileImage phone');
    }

    res.json({ success: true, data: chat });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/chats/:chatId/messages
exports.getMessages = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });

    const uid = req.user._id.toString();
    if (!chat.participants.map(p => p.toString()).includes(uid)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { page = 1, limit = 50 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const messages = await Message.find({ chatId: chat._id })
      .populate('senderId', 'name profileImage')
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    // Mark messages as read
    await Message.updateMany(
      { chatId: chat._id, senderId: { $ne: req.user._id }, isRead: false },
      { isRead: true }
    );

    res.json({ success: true, data: messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/chats/:chatId/messages
exports.sendMessage = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });

    const uid = req.user._id.toString();
    const participants = chat.participants.map(p => p.toString());
    if (!participants.includes(uid)) return res.status(403).json({ success: false, message: 'Access denied' });

    const { type = 'text', text, location, contact } = req.body;

    const msg = await Message.create({
      chatId:   chat._id,
      senderId: req.user._id,
      type, text: text || '',
      ...(location && { location }),
      ...(contact  && { contact }),
    });

    // Update chat's lastMessage
    await Chat.findByIdAndUpdate(chat._id, {
      lastMessage: { text: text || `[${type}]`, senderId: req.user._id, createdAt: new Date() },
      updatedAt:   new Date(),
    });

    // Populate senderId before broadcasting
    const populated = await msg.populate('senderId', 'name profileImage');

    // Notify the other participant
    const recipientId = participants.find(p => p !== uid);
    if (req.io) {
      // Broadcast to the chat room — both users see it in real-time
      req.io.to(`chat_${chat._id}`).emit('new_message', {
        chatId:  chat._id.toString(),
        message: populated,
      });

      // Also send push notification to recipient
      if (recipientId) {
        await createNotification({
          recipientId, senderId: req.user._id,
          type: 'new_message',
          title: `New message from ${req.user.name}`,
          body: text || `Sent a ${type}`,
          bookingId: chat.bookingId,
          io: req.io,
        });
      }
    }

    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
