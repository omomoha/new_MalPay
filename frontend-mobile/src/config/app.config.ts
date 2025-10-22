// App Configuration
export const APP_CONFIG = {
  name: 'MalPay',
  version: '1.0.0',
  description: 'Unified Payment Platform for Nigeria',
  country: 'Nigeria',
  currency: 'NGN',
  currencySymbol: '₦',
  
  // App Settings
  settings: {
    defaultCurrency: 'NGN',
    supportedCurrencies: ['NGN', 'USD', 'EUR', 'GBP'],
    maxTransactionAmount: 1000000, // 1M in base currency
    minTransactionAmount: 100, // 100 in base currency
    transactionTimeout: 300000, // 5 minutes
    sessionTimeout: 3600000, // 1 hour
  },
  
  // Security Settings
  security: {
    maxLoginAttempts: 5,
    lockoutDuration: 900000, // 15 minutes
    passwordMinLength: 8,
    pinLength: 4,
    biometricEnabled: true,
    twoFactorEnabled: true,
  },
  
  // UI Settings
  ui: {
    defaultTheme: 'light',
    animationDuration: 300,
    debounceDelay: 500,
    pullToRefreshThreshold: 50,
    infiniteScrollThreshold: 20,
  },
  
  // Feature Flags
  features: {
    biometricAuth: true,
    pushNotifications: true,
    qrCodePayments: true,
    cardScanning: true,
    darkMode: true,
    offlineMode: false,
    multiLanguage: false,
  },
  
  // Validation Rules
  validation: {
    email: {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Please enter a valid email address',
    },
    phone: {
      pattern: /^\+?[1-9]\d{1,14}$/,
      message: 'Please enter a valid phone number',
    },
    username: {
      pattern: /^[a-zA-Z0-9_]{3,20}$/,
      message: 'Username must be 3-20 characters and contain only letters, numbers, and underscores',
    },
    password: {
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      message: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character',
    },
    pin: {
      pattern: /^\d{4}$/,
      message: 'PIN must be exactly 4 digits',
    },
    amount: {
      pattern: /^\d+(\.\d{1,2})?$/,
      message: 'Please enter a valid amount',
    },
  },
  
  // Error Messages
  errors: {
    network: 'Network error. Please check your connection.',
    timeout: 'Request timeout. Please try again.',
    unauthorized: 'Session expired. Please login again.',
    forbidden: 'You do not have permission to perform this action.',
    notFound: 'The requested resource was not found.',
    serverError: 'Server error. Please try again later.',
    validationError: 'Please check your input and try again.',
    insufficientBalance: 'Insufficient balance for this transaction.',
    invalidCredentials: 'Invalid email or password.',
    accountLocked: 'Account is locked. Please try again later.',
    twoFactorRequired: 'Two-factor authentication required.',
    invalidTwoFactor: 'Invalid two-factor authentication code.',
  },
  
  // Success Messages
  success: {
    login: 'Login successful',
    register: 'Registration successful. Please verify your email.',
    logout: 'Logout successful',
    profileUpdate: 'Profile updated successfully',
    passwordChange: 'Password changed successfully',
    cardLinked: 'Card linked successfully',
    cardRemoved: 'Card removed successfully',
    bankAccountAdded: 'Bank account added successfully',
    bankAccountVerified: 'Bank account verified successfully',
    transferSent: 'Transfer sent successfully',
    withdrawalRequested: 'Withdrawal requested successfully',
    kycSubmitted: 'KYC documents submitted successfully',
    notificationRead: 'Notification marked as read',
  },
} as const;
