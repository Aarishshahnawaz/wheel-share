require('dotenv').config();
const http      = require('http');
const { Server } = require('socket.io');
const mongoose  = require('mongoose');
const app       = require('./src/app');
const jwt       = require('jsonwebtoken');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Socket.io CORS Configuration - Match Express CORS settings
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',')
  : [
      'http://localhost:5173',
      'http://localhost:5174', 
      'http://localhost:5175',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      'http://127.0.0.1:5175'
    ];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST']
  },
});

// Attach io to app so controllers can access it via req.io
app.set('io', io);

// Socket.io auth middleware
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('No token'));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch {
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  const userId = socket.userId;
  // Each user joins their own room so we can push targeted notifications
  socket.join(`user_${userId}`);
  console.log(`🔌 Socket connected: user_${userId}`);

  // Join a chat room
  socket.on('join_chat', (chatId) => {
    socket.join(`chat_${chatId}`);
  });

  // Leave a chat room
  socket.on('leave_chat', (chatId) => {
    socket.leave(`chat_${chatId}`);
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Socket disconnected: user_${userId}`);
  });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    server.listen(PORT, () => console.log(`🚀 Server + Socket.io running on http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
