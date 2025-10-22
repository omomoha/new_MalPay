// API Request and Response Types for MalPay Mobile

// Authentication Types
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  success: boolean;
  user: UserProfile;
  profileStatus: {
    isComplete: boolean;
    hasBankAccount: boolean;
    hasCards: boolean;
    cardCount: number;
    maxCards: number;
    missingSteps: string[];
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
  message?: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
}

export interface RegisterResponse {
  success: boolean;
  user: UserProfile;
  message: string;
  requiresEmailVerification: boolean;
}

export interface RefreshResponse {
  success: boolean;
  accessToken: string;
  expiresIn: number;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface VerifyEmailResponse {
  success: boolean;
  user: {
    id: string;
    email: string;
    name: string;
    isEmailVerified: boolean;
  };
  token: string;
  message: string;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface ResendVerificationResponse {
  success: boolean;
  message: string;
}

// User Types
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phoneNumber: string;
  profilePicture?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  kycStatus: KYCStatus;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserRequest {
  name?: string;
  phoneNumber?: string;
  profilePicture?: string;
}

// Wallet Types
export interface WalletBalance {
  id: string;
  userId: string;
  balances: {
    NGN: number;
    USD: number;
    USDT: number;
  };
  lastUpdated: string;
}

export interface TransactionFilters {
  page?: number;
  limit?: number;
  type?: 'transfer' | 'deposit' | 'withdrawal' | 'fee';
  status?: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'all';
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
}

// Transaction Types
export interface Transaction {
  id: string;
  txHash?: string;
  type: 'transfer' | 'deposit' | 'withdrawal' | 'fee';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  amount: number;
  currency: string;
  description?: string;
  recipientEmail?: string;
  recipientName?: string;
  senderEmail?: string;
  senderName?: string;
  fees: {
    cryptoProcessorFee: number;
    malpayCharge: number;
    totalFees: number;
  };
  exchangeRate?: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  failureReason?: string;
}

// Payment Types
export interface TransferRequest {
  recipientEmail: string;
  amount: number;
  currency: string;
  description?: string;
  pin: string;
  processor: 'tron' | 'polygon' | 'ethereum';
}

export interface TransferResponse {
  success: boolean;
  transaction: Transaction;
  message: string;
}

// Card Types
export interface Card {
  id: string;
  userId: string;
  cardType: 'visa' | 'mastercard' | 'amex' | 'discover';
  lastFourDigits: string;
  expiryMonth: number;
  expiryYear: number;
  cardholderName: string;
  isActive: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AddCardRequest {
  cardNumber: string;
  expiryMonth: number;
  expiryYear: number;
  cvv: string;
  cardholderName: string;
}

// Bank Account Types
export interface BankAccount {
  id: string;
  userId: string;
  bankName: string;
  bankCode: string;
  accountNumber: string;
  accountName: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AddBankAccountRequest {
  bankCode: string;
  accountNumber: string;
  accountName: string;
}

export interface VerifyBankAccountRequest {
  accountId: string;
  verificationCode: string;
}

// Withdrawal Types
export interface WithdrawalRequest {
  amount: number;
  currency: string;
  bankAccountId: string;
  pin: string;
}

export interface WithdrawalResponse {
  success: boolean;
  transaction: Transaction;
  message: string;
}

// KYC Types
export interface KYCStatus {
  status: 'not_started' | 'pending' | 'approved' | 'rejected' | 'expired';
  level: 'basic' | 'intermediate' | 'advanced';
  documents: KYCDocument[];
  rejectionReason?: string;
  expiresAt?: string;
}

export interface KYCDocument {
  id: string;
  type: 'passport' | 'national_id' | 'drivers_license' | 'utility_bill' | 'bank_statement';
  status: 'pending' | 'approved' | 'rejected';
  uploadedAt: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

export interface KYCDocumentRequest {
  documentType: 'passport' | 'national_id' | 'drivers_license' | 'utility_bill' | 'bank_statement';
  documentData: string; // Base64 encoded image
  documentNumber?: string;
  expiryDate?: string;
}

export interface KYCResponse {
  success: boolean;
  document: KYCDocument;
  message: string;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: 'transaction' | 'security' | 'kyc' | 'system' | 'marketing';
  title: string;
  message: string;
  isRead: boolean;
  data?: any;
  createdAt: string;
  readAt?: string;
}

export interface NotificationFilters {
  page?: number;
  limit?: number;
  type?: 'transaction' | 'security' | 'kyc' | 'system' | 'marketing';
  isRead?: boolean;
  startDate?: string;
  endDate?: string;
}

// Admin Types
export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalTransactions: number;
  totalVolume: {
    NGN: number;
    USD: number;
    USDT: number;
  };
  totalFees: {
    cryptoProcessorFees: number;
    malpayCharges: number;
  };
  kycStats: {
    pending: number;
    approved: number;
    rejected: number;
  };
  recentActivity: AdminActivity[];
}

export interface AdminActivity {
  id: string;
  type: 'user_registration' | 'transaction' | 'kyc_submission' | 'card_addition';
  description: string;
  userId?: string;
  transactionId?: string;
  timestamp: string;
}

export interface AdminTransactionFilters {
  page?: number;
  limit?: number;
  userId?: string;
  type?: 'transfer' | 'deposit' | 'withdrawal' | 'fee';
  status?: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
}

// Error Types
export interface APIError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

// Generic API Response
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: APIError['error'];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Utility Types
export type UserRole = 'user' | 'admin' | 'support';

export type TransactionStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export type TransactionType = 'transfer' | 'deposit' | 'withdrawal' | 'fee';

export type CardType = 'visa' | 'mastercard' | 'amex' | 'discover';

export type KYCLevel = 'basic' | 'intermediate' | 'advanced';

export type NotificationType = 'transaction' | 'security' | 'kyc' | 'system' | 'marketing';

export type CryptoProcessor = 'tron' | 'polygon' | 'ethereum';

export type Currency = 'NGN' | 'USD' | 'USDT';
