// API Configuration
export const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000/api/v1'
  : 'https://malpay-backend-production.up.railway.app/api/v1';

export const API_TIMEOUT = 30000; // 30 seconds

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh-token',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
    RESEND_VERIFICATION: '/auth/resend-verification',
    TWO_FACTOR_ENABLE: '/auth/2fa/enable',
    TWO_FACTOR_VERIFY: '/auth/2fa/verify',
    TWO_FACTOR_DISABLE: '/auth/2fa/disable',
  },
  
  // User
  USER: {
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    CHANGE_PASSWORD: '/users/password',
    SEARCH: '/users/search',
    DELETE_ACCOUNT: '/users/account',
  },
  
  // Wallet
  WALLET: {
    CREATE: '/wallets/create',
    LIST: '/wallets',
    GET: '/wallets/:id',
    BALANCE: '/wallets/:id/balance',
    TRANSACTIONS: '/wallets/:id/transactions',
  },
  
  // Cards
  CARD: {
    LINK: '/cards/link',
    LIST: '/cards',
    GET: '/cards/:id',
    DELETE: '/cards/:id',
    SET_PRIMARY: '/cards/:id/set-primary',
    BALANCE: '/cards/:id/balance',
  },
  
  // Bank Accounts
  BANK_ACCOUNT: {
    ADD: '/bank-accounts/add',
    LIST: '/bank-accounts',
    GET: '/bank-accounts/:id',
    DELETE: '/bank-accounts/:id',
    SET_PRIMARY: '/bank-accounts/:id/set-primary',
    VERIFY: '/bank-accounts/:id/verify',
  },
  
  // Payments
  PAYMENT: {
    TRANSFER: '/payments/transfer',
    WITHDRAW: '/payments/withdraw',
    DEPOSIT: '/payments/deposit',
  },
  
  // Transactions
  TRANSACTION: {
    LIST: '/transactions',
    GET: '/transactions/:id',
    RECEIPT: '/transactions/:id/receipt',
    EXPORT: '/transactions/export',
    DISPUTE: '/transactions/:id/dispute',
  },
  
  // Withdrawals
  WITHDRAWAL: {
    REQUEST: '/withdrawals/request',
    LIST: '/withdrawals',
    GET: '/withdrawals/:id',
    CANCEL: '/withdrawals/:id/cancel',
  },
  
  // KYC
  KYC: {
    UPLOAD: '/kyc/upload',
    STATUS: '/kyc/status',
    DOCUMENTS: '/kyc/documents',
    DELETE_DOCUMENT: '/kyc/documents/:id',
  },
  
  // Notifications
  NOTIFICATION: {
    LIST: '/notifications',
    GET: '/notifications/:id',
    MARK_READ: '/notifications/:id/read',
    MARK_ALL_READ: '/notifications/read-all',
    DELETE: '/notifications/:id',
  },
  
  // Admin
  ADMIN: {
    USERS: '/admin/users',
    USER_DETAIL: '/admin/users/:id',
    USER_STATUS: '/admin/users/:id/status',
    USER_ACTIVITY: '/admin/users/:id/activity',
    TRANSACTIONS: '/admin/transactions',
    TRANSACTION_DETAIL: '/admin/transactions/:id',
    TRANSACTION_REVIEW: '/admin/transactions/:id/review',
    KYC_PENDING: '/admin/kyc/pending',
    KYC_APPROVE: '/admin/kyc/:id/approve',
    KYC_REJECT: '/admin/kyc/:id/reject',
    DISPUTES: '/admin/disputes',
    DISPUTE_RESOLVE: '/admin/disputes/:id/resolve',
    ANALYTICS_OVERVIEW: '/admin/analytics/overview',
    ANALYTICS_TRANSACTIONS: '/admin/analytics/transactions',
    ANALYTICS_USERS: '/admin/analytics/users',
    REPORTS_GENERATE: '/admin/reports/generate',
  },
} as const;
