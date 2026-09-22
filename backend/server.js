import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

import { connectDB } from './config/db.js';
import { seedDatabase } from './seed/seeder.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import interviewRoutes from './routes/interviewRoutes.js';
import resumeRoutes from './routes/resumeRoutes.js';
import skillRoutes from './routes/skillRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import emailGuardianRoutes from './routes/emailGuardianRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import searchRoutes from './routes/searchRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Parsing Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow any localhost/127.0.0.1 port (5173, 5174, etc.) or non-browser callers
    if (!origin || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate Limiter for general APIs
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP to 300 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  }
});
app.use('/api/', limiter);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'Career Flow Backend API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/email-guardian', emailGuardianRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/search', searchRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

// Start Server & Connect Database
const startServer = async () => {
  try {
    const conn = await connectDB();
    if (conn) {
      // Run idempotent seeder if database is fresh
      await seedDatabase(false);
    }

    const server = app.listen(PORT, () => {
      console.log(`[Career Flow] Server is active and listening on port ${PORT}`);
      console.log(`[Career Flow] Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`[Career Flow] Port ${PORT} is already in use by another running process.`);
      } else {
        console.error(`[Career Flow] Server error: ${err.message}`);
      }
    });
  } catch (error) {
    console.error(`[Career Flow] Fatal server startup error: ${error.message}`);
  }
};

startServer();
