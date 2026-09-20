import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';
import connectDB from './config/db.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import universityRoutes from './routes/universityRoutes.js';
import scholarshipRoutes from './routes/scholarshipRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import walletRoutes from './routes/walletRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

// Middleware imports
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from backend directory and fallback to cwd
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config();

const app = express();

// HTTP Request Logger
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration for production and development
const allowedOrigins = (
  process.env.CLIENT_URL ||
  'https://admify.world,https://www.admify.world,http://localhost:5173,http://localhost:3000'
)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      origin === 'https://admify.world' ||
      origin === 'http://admify.world' ||
      origin.endsWith('.admify.world') ||
      process.env.NODE_ENV !== 'production'
    ) {
      return callback(null, true);
    }
    return callback(new Error(`Origin ${origin} not permitted by CORS policy`), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));
// Enable pre-flight for all routes
app.options('*', cors(corsOptions));

// ── Health Check Endpoint ────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  res.status(200).json({
    success: true,
    message: 'Admify API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    database: dbStatusMap[dbState] || 'unknown',
  });
});

// Root informational endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Admify Production API Engine',
    version: '1.0.0',
    documentation: '/api/health',
  });
});

// ── Mount Application API Routes ─────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/universities', universityRoutes);
app.use('/api/scholarships', scholarshipRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);

// ── Error Handling Middleware ────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  // Connect to MongoDB
  await connectDB();

  if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
      console.log(`[Admify API] Server running in ${process.env.NODE_ENV || 'production'} mode on port ${PORT}`);
    });
  }
};

startServer();

export default app;
