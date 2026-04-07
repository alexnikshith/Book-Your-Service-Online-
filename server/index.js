const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const connectDB = require('./utils/db');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const authRoutes = require('./routes/authRoutes');
const providerRoutes = require('./routes/providerRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const adminRoutes = require('./routes/adminRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const messageRoutes = require('./routes/messageRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const { initReminders } = require('./utils/reminderService');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(express.json());
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Static Files Hub (for uploaded expert evidence)
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// Socket.io Real-time Pipeline & Scheduling Pulse
io.on('connection', (socket) => {
  console.log('[SOCKET]: Heartbeat Initialized - ID:', socket.id);

  socket.on('join_room', (userId) => {
    socket.join(userId);
    console.log(`[SOCKET]: Expert/Customer joined secure room flow: ${userId}`);
  });

  socket.on('send_message', (data) => {
    const { recipientId } = data;
    io.to(recipientId).emit('receive_message', data);
  });

  socket.on('message_update', (data) => {
    const { recipientId } = data;
    io.to(recipientId).emit('receive_update', data);
  });

  socket.on('message_delete', (data) => {
    const { recipientId } = data;
    io.to(recipientId).emit('receive_delete', data);
  });

  socket.on('disconnect', () => {
    console.log('[SOCKET]: Pulse Disconnected - ID:', socket.id);
  });
});

// Initialize Background Automation Hub
initReminders(io);

// API Routes Hub
app.use('/api/auth', authRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/upload', uploadRoutes);

// Production Handshake Hub - Serve Frontend Evidence
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));

  app.get('*', (req, res) =>
    res.sendFile(path.resolve(__dirname, '../', 'client', 'dist', 'index.html'))
  );
} else {
  app.get('/', (req, res) => {
    res.send('Local Service Finder API is running and broadcasting...');
  });
}

// Error middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
