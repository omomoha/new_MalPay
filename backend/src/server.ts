import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import 'express-async-errors';
import dotenv from 'dotenv';

// Import middleware
import { corsConfig } from './src/middleware/cors';
import { rateLimiting } from './src/middleware/rateLimiting';
import { securityHeaders } from './src/middleware/securityHeaders';

// Import routes
import authRoutes from './src/routes/auth';
import userRoutes from './src/routes/users';
import walletRoutes from './src/routes/wallet';
import paymentRoutes from './src/routes/payments';
import cardRoutes from './src/routes/cards';
import bankAccountRoutes from './src/routes/bank-accounts';
import withdrawalRoutes from './src/routes/withdrawals';
import kycRoutes from './src/routes/kyc';
import notificationRoutes from './src/routes/notifications';
import adminRoutes from './src/routes/adminRoutes';

// Import database connection
import { connectDatabase } from './src/config/database';
import { connectRedis } from './src/config/redis';

// Import error handling
import { errorHandler } from './src/middleware/errorHandler';
import { notFoundHandler } from './src/middleware/notFoundHandler';

// Import logger
import { logger } from './src/utils/logger';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy for Railway deployment
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

app.use(securityHeaders);
app.use(cors(corsConfig));
app.use(rateLimiting);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression and logging
app.use(compression());
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
  });
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/wallet', walletRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/cards', cardRoutes);
app.use('/api/v1/bank-accounts', bankAccountRoutes);
app.use('/api/v1/withdrawals', withdrawalRoutes);
app.use('/api/v1/kyc', kycRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/admin', adminRoutes);

// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Database and Redis connection
const startServer = async () => {
  try {
    // Connect to PostgreSQL
    await connectDatabase();
    logger.info('✅ Database connected successfully');

    // Connect to Redis
    await connectRedis();
    logger.info('✅ Redis connected successfully');

    // Start server
    app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`📊 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
startServer();

export default app;
