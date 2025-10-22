// Wallet types - Updated to hide USDT from users

export interface Wallet {
  id: string;
  userId: string;
  walletAddress: string;
  blockchainType: 'tron' | 'polygon';
  balance: number; // Fiat balance only (USDT hidden)
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WalletBalance {
  balance: number; // Fiat balance only
  currency: string;
  // USDT amounts are completely hidden from user
}

export interface ExchangeRate {
  currency: string;
  rate: number;
  lastUpdated: string;
}

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  rate: number;
}

export interface WalletTransaction {
  id: string;
  type: 'transfer' | 'deposit' | 'withdrawal' | 'fee';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  amount: number; // Fiat amount only
  currency: string;
  fee: number; // Fiat fee only
  description?: string;
  recipient?: {
    username: string;
    email: string;
  };
  createdAt: string;
  completedAt?: string;
  failedAt?: string;
  failureReason?: string;
  // USDT amounts and exchange rates are hidden
}
