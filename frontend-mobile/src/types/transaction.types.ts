// Transaction types - Updated to show only fiat amounts

export interface Transaction {
  id: string;
  txHash?: string;
  type: 'transfer' | 'deposit' | 'withdrawal' | 'fee';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  amount: number; // Fiat amount only (USDT hidden)
  currency: string;
  fee: number; // Fiat fee only
  description?: string;
  recipient?: {
    username: string;
    email: string;
  };
  sender?: {
    username: string;
    email: string;
  };
  sourceType?: string; // card, bank_account, wallet
  sourceId?: string;
  createdAt: string;
  completedAt?: string;
  failedAt?: string;
  failureReason?: string;
  // USDT amounts and exchange rates are completely hidden from user
}

export interface TransactionFilters {
  page: number;
  limit: number;
  status?: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'all';
  type?: 'transfer' | 'deposit' | 'withdrawal' | 'fee' | 'all';
  currency?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface TransferRequest {
  recipientEmail: string;
  amount: number;
  currency: string;
  description?: string;
  pin: string;
}

export interface TransferResponse {
  transactionId: string;
  status: string;
  amount: number;
  currency: string;
  recipient: {
    username: string;
    email: string;
  };
  fee: number;
  estimatedCompletion?: string;
}

export interface DepositRequest {
  amount: number;
  currency: string;
  sourceType: string;
  sourceId: string;
}

export interface WithdrawalRequest {
  bankAccountId: string;
  amount: number;
  currency: string;
  pin: string;
}

export interface WithdrawalResponse {
  withdrawalId: string;
  status: string;
  amount: number;
  currency: string;
  fee: number;
  estimatedCompletion: string;
}
