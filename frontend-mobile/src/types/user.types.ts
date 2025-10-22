// User Types
export interface User {
  id: string;
  email: string;
  username: string;
  phone?: string;
  role: UserRole;
  isVerified: boolean;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  userId: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  profileImage?: string;
  kycStatus: KYCStatus;
  createdAt: string;
  updatedAt: string;
}

export enum UserRole {
  USER = 'user',
  MERCHANT = 'merchant',
  ADMIN = 'admin',
}

export enum KYCStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
}

// Auth Types
export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  twoFactorRequired: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
  twoFactorCode?: string;
  tempToken?: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  requiresTwoFactor?: boolean;
  tempToken?: string;
}

// Wallet Types
export interface Wallet {
  id: string;
  userId: string;
  walletAddress: string;
  blockchainType: 'tron' | 'polygon';
  balanceUSDT: number; // Internal USDT balance
  balanceFiat: number; // Display balance in fiat
  currency: string; // NGN, USD, etc.
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WalletBalance {
  crypto: number; // USDT (hidden from user)
  fiat: number; // Display amount
  currency: string;
}

// Transaction Types
export interface Transaction {
  id: string;
  txHash?: string;
  senderId: string;
  receiverId: string;
  amountUSDT: number; // Internal USDT amount
  amountFiat: number; // Display amount in fiat
  currency: string;
  type: TransactionType;
  status: TransactionStatus;
  sourceType?: string;
  sourceId?: string;
  fee: number;
  exchangeRate: number;
  description?: string;
  metadata?: any;
  createdAt: string;
  completedAt?: string;
  failedAt?: string;
  failureReason?: string;
  sender?: User;
  receiver?: User;
}

export enum TransactionType {
  TRANSFER = 'transfer',
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  FEE = 'fee',
}

export enum TransactionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export interface TransactionFilters {
  status: 'all' | TransactionStatus;
  type: 'all' | TransactionType;
  startDate: string | null;
  endDate: string | null;
  search: string;
}

// Card Types
export interface Card {
  id: string;
  userId: string;
  cardLastFour: string;
  cardType: string; // visa, mastercard, etc.
  bankName: string;
  cardholderName: string;
  isPrimary: boolean;
  isActive: boolean;
  addedAt: string;
}

export interface AddCardData {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
  isPrimary?: boolean;
}

// Bank Account Types
export interface BankAccount {
  id: string;
  userId: string;
  accountNumber: string;
  bankCode: string;
  bankName: string;
  accountName: string;
  accountType: 'savings' | 'current';
  isVerified: boolean;
  isPrimary: boolean;
  verificationReference?: string;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AddBankAccountData {
  accountNumber: string;
  bankCode: string;
  accountName: string;
  accountType: 'savings' | 'current';
  isPrimary?: boolean;
}

// Withdrawal Types
export interface WithdrawalRequest {
  id: string;
  userId: string;
  bankAccountId: string;
  amountUSDT: number;
  amountFiat: number;
  currency: string;
  exchangeRate: number;
  status: WithdrawalStatus;
  txHash?: string;
  fee: number;
  processingFee: number;
  createdAt: string;
  completedAt?: string;
  failureReason?: string;
  bankAccount?: BankAccount;
}

export enum WithdrawalStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
}

export enum NotificationType {
  TRANSACTION = 'transaction',
  SECURITY = 'security',
  KYC = 'kyc',
  SYSTEM = 'system',
}

// Payment Types
export interface PaymentRequest {
  recipient: string; // email or username
  amount: number;
  currency: string;
  description?: string;
  pin: string;
}

export interface PaymentResponse {
  transactionId: string;
  status: TransactionStatus;
  amount: number;
  currency: string;
  recipient: {
    username: string;
    email: string;
  };
  fee: number;
  estimatedCompletion?: string;
}

// API Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    statusCode: number;
    timestamp: string;
  };
}

export interface PaginationResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  statusCode: number;
  timestamp: string;
}

// Exchange Rate Types
export interface ExchangeRate {
  baseCurrency: string;
  targetCurrency: string;
  rate: number;
  source: string;
  timestamp: string;
}
