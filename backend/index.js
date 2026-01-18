require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDatabase = require('./config/database');

// Import routes
const authRoutes = require('./routes/authRoutes');
const queryRoutes = require('./routes/queryRoutes');

// Initialize express app
const app = express();

// Connect to database
connectDatabase();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (development)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/queries', queryRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Query Management System API is running',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
    ╔═══════════════════════════════════════════════╗
    ║   Query Management System API                 ║
    ║   Server running on port ${PORT}                 ║
    ║   Environment: ${process.env.NODE_ENV || 'development'}                    ║
    ╚═══════════════════════════════════════════════╝
  `);
});

module.exports = app;
