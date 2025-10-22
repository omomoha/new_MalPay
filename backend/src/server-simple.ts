import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { InputSanitizationService } from './middleware/inputSanitization';
import { SecurityMonitoringService } from './services/SecurityMonitoringService';

const app = express();

// Simple authentication middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    SecurityMonitoringService.logUnauthorizedAccess(req);
    return res.status(401).json({
      success: false,
      error: { message: 'Access token required' }
    });
  }

  // In a real implementation, verify JWT token here
  // For now, accept any token for testing
  req.user = { id: 'user-123', email: 'user@example.com' };
  next();
};
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// Input sanitization middleware
app.use(InputSanitizationService.sanitizeRequestBody);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security monitoring endpoint (admin only)
app.get('/api/v1/admin/security-events', authenticateToken, (req, res) => {
  const stats = SecurityMonitoringService.getSecurityStats();
  const recentEvents = SecurityMonitoringService.getSecurityEvents(50);
  
  res.json({
    success: true,
    stats,
    recentEvents
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'MalPay Backend',
    version: '1.0.0',
  });
});

// Mock authentication endpoints
app.post('/api/v1/auth/register', (req, res) => {
  const { name, email, phoneNumber, password, confirmPassword } = req.body;
  res.status(201).json({
    success: true,
    message: 'User registered successfully. Please check your email to verify your account.',
    user: {
      id: 'mock-user-id',
      email,
      name,
      phoneNumber,
      isEmailVerified: false,
      createdAt: new Date().toISOString(),
    },
    requiresEmailVerification: true,
  });
});

app.post('/api/v1/auth/verify-email', (req, res) => {
  const { token } = req.body;
  res.json({
    success: true,
    user: {
      id: 'mock-user-id',
      email: 'user@example.com',
      name: 'John Doe',
      isEmailVerified: true,
    },
    token: 'mock-jwt-token',
    message: 'Email verified successfully',
  });
});

app.post('/api/v1/auth/resend-verification', (req, res) => {
  const { email } = req.body;
  res.json({
    success: true,
    message: 'Verification email sent successfully',
  });
});

app.post('/api/v1/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Use environment variables for admin credentials
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@malpay.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  
  if (email === adminEmail && password === adminPassword) {
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: '00000000-0000-0000-0000-000000000001',
        email: 'admin@malpay.com',
        name: 'Admin User',
        phoneNumber: '+2348000000000',
        isEmailVerified: true,
        isPhoneVerified: true,
        is2FAEnabled: false,
        createdAt: new Date().toISOString(),
      },
      profileStatus: {
        isComplete: true,
        hasBankAccount: true,
        hasCards: true,
        cardCount: 2,
        maxCards: 3,
        missingSteps: [],
      },
      tokens: {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      },
    });
  } else {
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: 'mock-user-id',
        email: 'user@example.com',
        name: 'John Doe',
        phoneNumber: '+2348012345678',
        isEmailVerified: true,
        isPhoneVerified: true,
        is2FAEnabled: false,
        createdAt: new Date().toISOString(),
      },
      profileStatus: {
        isComplete: false,
        hasBankAccount: false,
        hasCards: false,
        cardCount: 0,
        maxCards: 3,
        missingSteps: ['Link a bank account', 'Add at least one card'],
      },
      tokens: {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      },
    });
  }
});

app.get('/api/v1/auth/profile-completion', authenticateToken, (req, res) => {
  res.json({
    success: true,
    profileStatus: {
      isComplete: false,
      hasBankAccount: false,
      hasCards: false,
      cardCount: 0,
      maxCards: 3,
      missingSteps: ['Link a bank account', 'Add at least one card'],
    },
  });
});

// Mock card endpoints
app.get('/api/v1/cards', authenticateToken, (req, res) => {
  res.json({
    success: true,
    cards: [
      {
        id: '1',
        cardNumberMasked: '4532 **** **** 1234',
        cardType: 'visa',
        expiryMonth: 12,
        expiryYear: 2026,
        cardholderName: 'John Doe',
        isDefault: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        cardNumberMasked: '5555 **** **** 5678',
        cardType: 'mastercard',
        expiryMonth: 10,
        expiryYear: 2027,
        cardholderName: 'John Doe',
        isDefault: false,
        createdAt: new Date().toISOString(),
      },
    ],
    count: 2,
    maxCards: 3,
  });
});

app.post('/api/v1/cards', authenticateToken, (req, res) => {
  const { cardNumber, expiryMonth, expiryYear, cvv, cardholderName } = req.body;
  res.status(201).json({
    success: true,
    card: {
      id: '3',
      cardNumberMasked: '4532 **** **** 9876',
      cardType: 'visa',
      expiryMonth,
      expiryYear,
      cardholderName,
      isDefault: false,
      createdAt: new Date().toISOString(),
    },
    fee: { amount: 50, currency: 'NGN', description: 'Card addition fee' },
    message: 'Card added successfully',
  });
});

app.put('/api/v1/cards/:cardId/set-default', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Default card updated successfully',
  });
});

app.delete('/api/v1/cards/:cardId', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Card removed successfully',
  });
});

// Mock bank account endpoints
app.get('/api/v1/bank-accounts', authenticateToken, (req, res) => {
  res.json({
    success: true,
    bankAccounts: [
      {
        id: '1',
        accountNumber: '1234567890',
        bankCode: '058',
        bankName: 'GTBank',
        accountName: 'John Doe',
        accountType: 'savings',
        isPrimary: true,
        isVerified: true,
        createdAt: new Date().toISOString(),
      },
    ],
  });
});

app.post('/api/v1/bank-accounts', authenticateToken, (req, res) => {
  const { accountNumber, bankCode } = req.body;
  res.status(201).json({
    success: true,
    bankAccount: {
      id: '2',
      accountNumber,
      bankCode: '058',
      bankName: 'GTBank',
      accountName: 'John Doe',
      accountType: 'savings',
      isPrimary: false,
      isVerified: true,
      createdAt: new Date().toISOString(),
    },
    message: 'Bank account added successfully',
  });
});

// Mock payment endpoints
app.post('/api/v1/payments/transfer', authenticateToken, (req, res) => {
  const { recipientEmail, amount, currency, description, processor } = req.body;
  res.json({
    success: true,
    transactionId: 'transfer_' + Date.now(),
    txHash: '0x' + Math.random().toString(16).substr(2, 64),
    amount,
    currency,
    fees: {
      cryptoProcessorFee: amount * 0.005, // 0.5%
      malpayCharge: amount > 1000 ? Math.min(amount * 0.001, 2000) : 0,
      totalFees: amount * 0.005 + (amount > 1000 ? Math.min(amount * 0.001, 2000) : 0),
    },
    recipient: {
      email: recipientEmail,
      name: 'Recipient Name',
    },
  });
});

app.get('/api/v1/payments/transactions', authenticateToken, (req, res) => {
  res.json({
    success: true,
    transactions: [
      {
        id: '1',
        txHash: '0x1234567890abcdef',
        type: 'transfer',
        status: 'completed',
        amount: 5000.00,
        currency: 'NGN',
        description: 'Transfer to John Doe',
        recipientEmail: 'john@example.com',
        recipientName: 'John Doe',
        fees: {
          cryptoProcessorFee: 25.00,
          malpayCharge: 5.00,
          totalFees: 30.00,
        },
        processor: 'tron',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        completedAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ],
    pagination: {
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
    },
  });
});

// Mock withdrawal endpoints
app.post('/api/v1/withdrawals', authenticateToken, (req, res) => {
  const { amount, currency, bankAccountId } = req.body;
  res.status(201).json({
    success: true,
    withdrawal: {
      id: 'withdrawal_' + Date.now(),
      amount,
      currency,
      status: 'processing',
      createdAt: new Date().toISOString(),
    },
    message: 'Withdrawal request submitted successfully',
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: {
      message: 'Internal server error',
      code: 'INTERNAL_ERROR',
    },
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Endpoint not found',
      code: 'NOT_FOUND',
    },
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 MalPay Backend Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api/v1`);
});