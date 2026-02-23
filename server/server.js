const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const app = express();

// =============================================
// MIDDLEWARE
// =============================================

// Allow requests from our React frontends
app.use(cors({
  origin: [
    process.env.CLIENT_URL,
    process.env.ADMIN_URL,
    'http://localhost:5173',
    'http://localhost:5174',
  ],
  credentials: true,
}));

// Parse incoming JSON request bodies
app.use(express.json());

// Parse URL-encoded bodies (for Stripe webhooks)
app.use(express.urlencoded({ extended: true }));

// =============================================
// ROUTES
// =============================================
app.use('/api/auth',   require('./routes/auth'));
app.use('/api/menu',   require('./routes/menu'));
app.use('/api/orders', require('./routes/orders'));

// =============================================
// HEALTH CHECK
// =============================================
// Visit http://localhost:5000/api/health to confirm the server is running
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: '🍲 Taste of West Africa API is running',
    time: new Date().toISOString(),
  });
});

// =============================================
// 404 HANDLER
// =============================================
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// =============================================
// GLOBAL ERROR HANDLER
// =============================================
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    // Only show full error stack in development
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// =============================================
// DATABASE CONNECTION + START SERVER
// =============================================
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1); // Stop the server if DB connection fails
  });