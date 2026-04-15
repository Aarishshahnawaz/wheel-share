const express = require('express');
const cors    = require('cors');
const path    = require('path');
const client  = require('prom-client');

// Collect default Node.js metrics (CPU, memory, event loop, etc.)
client.collectDefaultMetrics();

const authRoutes  = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const userRoutes  = require('./routes/user');

const app = express();

// CORS Configuration - Allow multiple origins based on environment
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

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-secret']
}));

app.use(express.json({ limit: '10mb' }));

// Serve uploaded images as static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Attach Socket.io instance to every request so controllers can emit events
app.use((req, _, next) => { req.io = app.get('io'); next(); });

app.use('/api/auth',          authRoutes);
app.use('/api/admin',         adminRoutes);
app.use('/api/users',         userRoutes);
app.use('/api/upload',        require('./routes/upload'));
app.use('/api/vehicles',      require('./routes/vehicles'));
app.use('/api/bookings',      require('./routes/bookings'));
app.use('/api/reviews',       require('./routes/reviews'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/chats',         require('./routes/chats'));

if (process.env.NODE_ENV !== 'production') {
  app.use('/api/dev', require('./routes/dev'));
}

app.get('/api/health', (_, res) => res.json({ status: 'ok', time: new Date() }));

// Prometheus metrics endpoint — scraped by Prometheus server
app.get('/metrics', async (_, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});
app.use((_, res) => res.status(404).json({ success: false, message: 'Route not found' }));
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Internal server error' });
});

module.exports = app;
