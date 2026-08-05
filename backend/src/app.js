require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

const connectDB = require('./config/db');
const logger = require('./utils/logger');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const noteRoutes = require('./routes/notes');
const notificationRoutes = require('./routes/notifications');
const analyticsRoutes = require('./routes/analytics');
const githubRoutes = require('./routes/github');
const aiRoutes = require('./routes/ai');
const habitRoutes = require('./routes/habits');
const leetcodeRoutes = require('./routes/leetcode');
const { initQueues } = require('./services/queueService');

const createApp = () => {
  const app = express();

  // Trust reverse proxy (AWS ALB, Nginx, Ingress)
  app.set('trust proxy', 1);

  // Connect to MongoDB
  connectDB();

  // Initialize background job queues (requires Redis - degrades gracefully)
  initQueues().catch(() => {});

  // ─── Security Middleware ──────────────────────────────────────────────────────
  app.use(helmet({
    crossOriginEmbedderPolicy: false,
  }));

  const allowedOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map((url) => url.trim())
    : ['http://localhost:5173', 'http://localhost:8081', 'http://localhost:5001'];

  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || process.env.FRONTEND_URL === '*' || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      // Allow any origin if front & back are served through same reverse proxy or dynamic AWS host
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  // Global rate limiter (Disabled)
  const globalLimiter = (req, res, next) => next();

  // Strict rate limiter for auth routes (Disabled)
  const authLimiter = (req, res, next) => next();

  app.use(globalLimiter);

  // ─── General Middleware ───────────────────────────────────────────────────────
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  }

  // ─── Socket.io Injection ────────────────────────────────────────────────────
  // This middleware runs before routes so all controllers can access req.io
  app.use((req, res, next) => {
    req.io = app.get('io');
    next();
  });

  // ─── Health Check ─────────────────────────────────────────────────────────────
  app.get('/api/health', (req, res) => {
    res.json({
      success: true,
      message: 'DevTrack Pro API is running',
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    });
  });

  // ─── API Routes ───────────────────────────────────────────────────────────────
  app.use('/api/auth', authLimiter, authRoutes);
  app.use('/api/tasks', taskRoutes);
  app.use('/api/notes', noteRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/github', githubRoutes);
  app.use('/api/ai', aiRoutes);
  app.use('/api/habits', habitRoutes);
  app.use('/api/leetcode', leetcodeRoutes);

  // ─── Error Handling ───────────────────────────────────────────────────────────
  app.use(notFound);
  app.use(errorHandler);

  return app;
};

module.exports = { createApp };
