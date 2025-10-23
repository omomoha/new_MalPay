import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { InputSanitizationService } from './middleware/inputSanitization';
// import { SecurityMonitoringService } from './services/SecurityMonitoringService'; // Disabled for development

const app = express();

// Simple authentication middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // SecurityMonitoringService.logUnauthorizedAccess(req); // Disabled for development
    return res.status(401).json({
      success: false,
      error: { message: 'Access token required' }
    });
  }

  // In a real implementation, verify JWT token here
  // For now, accept any token for testing
  req.user = { id: 'user-123', email: 'user@example.com' };
  // SecurityMonitoringService.logUnauthorizedAccess(req); // Disabled for development
  next();
};
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true,
}));

// Input sanitization middleware
app.use(InputSanitizationService.sanitizeRequestBody);

// Rate limiting - DISABLED for development
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 10000, // limit each IP to 10000 requests per windowMs (very generous for development)
//   message: 'Too many requests from this IP, please try again later.',
//   standardHeaders: true,
//   legacyHeaders: false,
// });
// app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security monitoring endpoint (admin only) - Disabled for development
// app.get('/api/v1/admin/security-events', authenticateToken, (req, res) => {
//   const stats = SecurityMonitoringService.getSecurityStats();
//   const recentEvents = SecurityMonitoringService.getSecurityEvents(50);
//   
//   res.json({
//     success: true,
//     stats,
//     recentEvents
//   });
// });

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
  
  // Validation
  if (!name || !email || !phoneNumber || !password || !confirmPassword) {
    return res.status(400).json({ 
      success: false, 
      error: { message: 'All fields are required' } 
    });
  }
  
  if (password !== confirmPassword) {
    return res.status(400).json({ 
      success: false, 
      error: { message: 'Passwords do not match' } 
    });
  }
  
  if (password.length < 8) {
    return res.status(400).json({ 
      success: false, 
      error: { message: 'Password must be at least 8 characters long' } 
    });
  }
  
  // Check if email already exists (mock check)
  const existingEmails = ['admin@malpay.com', 'user@malpay.com', 'demo@malpay.com'];
  if (existingEmails.includes(email.toLowerCase())) {
    return res.status(400).json({ 
      success: false, 
      error: { message: 'Email already exists' } 
    });
  }
  
  res.status(201).json({
    success: true,
    message: 'User registered successfully. Please check your email to verify your account.',
    user: {
      id: 'mock-user-id-' + Date.now(),
      email: email.toLowerCase(),
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
  
  // Test accounts for local development
  const testAccounts = {
    'admin@malpay.com': {
      password: 'Admin123!',
      user: {
        id: '00000000-0000-0000-0000-000000000001',
        email: 'admin@malpay.com',
        name: 'MalPay Admin',
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
      }
    },
    'user@malpay.com': {
      password: 'User123!',
      user: {
        id: '00000000-0000-0000-0000-000000000002',
        email: 'user@malpay.com',
        name: 'Test User',
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
      }
    },
    'demo@malpay.com': {
      password: 'Demo123!',
      user: {
        id: '00000000-0000-0000-0000-000000000003',
        email: 'demo@malpay.com',
        name: 'Demo User',
        phoneNumber: '+2348098765432',
        isEmailVerified: true,
        isPhoneVerified: true,
        is2FAEnabled: false,
        createdAt: new Date().toISOString(),
      },
      profileStatus: {
        isComplete: true,
        hasBankAccount: true,
        hasCards: true,
        cardCount: 1,
        maxCards: 3,
        missingSteps: [],
      }
    }
  };
  
  const account = testAccounts[email];
  
  if (account && account.password === password) {
    res.json({
      success: true,
      message: 'Login successful',
      user: account.user,
      profileStatus: account.profileStatus,
      tokens: {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      },
    });
  } else {
    res.status(401).json({
      success: false,
      error: { message: 'Invalid email or password' }
    });
  }
});

// Mock endpoints for development (no auth required)
app.get('/api/v1/auth/profile-completion', (req, res) => {
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

app.get('/api/v1/bank-accounts', (req, res) => {
  res.json({
    success: true,
    bankAccounts: [],
  });
});

app.get('/api/v1/cards', (req, res) => {
  res.json({
    success: true,
    cards: [],
  });
});

app.get('/api/v1/payments/transactions', (req, res) => {
  res.json({
    success: true,
    transactions: [],
    pagination: {
      page: 1,
      limit: 5,
      total: 0,
      totalPages: 0,
    },
  });
});

// Additional mock endpoints for development
app.get('/api/v1/withdrawals', (req, res) => {
  res.json({
    success: true,
    withdrawals: [],
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    },
  });
});

app.get('/api/v1/blockchain/balance/:network/:address', (req, res) => {
  res.json({
    success: true,
    balance: '0.00',
    currency: 'USDT',
    network: req.params.network,
  });
});

app.get('/api/v1/blockchain/transactions/:network/:address', (req, res) => {
  res.json({
    success: true,
    transactions: [],
    network: req.params.network,
  });
});

app.get('/api/v1/blockchain/recommended-network', (req, res) => {
  res.json({
    success: true,
    network: 'tron',
    reason: 'Lowest fees for this amount',
  });
});

app.get('/api/v1/blockchain/fees/:network', (req, res) => {
  res.json({
    success: true,
    network: req.params.network,
    fee: '1.00',
    currency: 'USDT',
  });
});

app.get('/api/v1/admin/security-events', (req, res) => {
  res.json({
    success: true,
    events: [],
    stats: {
      totalEvents: 0,
      criticalEvents: 0,
      warningEvents: 0,
    },
  });
});

app.get('/api/v1/admin/system-stats', (req, res) => {
  res.json({
    success: true,
    stats: {
      totalUsers: 0,
      totalTransactions: 0,
      totalVolume: 0,
      activeUsers: 0,
    },
  });
});

app.get('/api/v1/admin/users', (req, res) => {
  res.json({
    success: true,
    users: [],
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    },
  });
});

// Mock card endpoints (removed duplicate)

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