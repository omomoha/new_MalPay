import { api } from '@store/api/api';
import { 
  TransferRequest, 
  TransferResponse, 
  DepositRequest, 
  WithdrawalRequest, 
  WithdrawalResponse,
  Transaction,
  TransactionFilters,
  Pagination
} from '@types/transaction.types';

// Payment API endpoints
export const paymentApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Transfer money between users
    transfer: builder.mutation<TransferResponse, TransferRequest>({
      query: (data) => ({
        url: '/payments/transfer',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Wallet', 'Transactions'],
    }),

    // Get transaction history (fiat amounts only)
    getTransactions: builder.query<{
      transactions: Transaction[];
      pagination: Pagination;
    }, TransactionFilters>({
      query: (filters) => ({
        url: '/payments/transactions',
        params: filters,
      }),
      providesTags: ['Transactions'],
    }),

    // Get specific transaction
    getTransaction: builder.query<Transaction, string>({
      query: (id) => `/payments/transactions/${id}`,
      providesTags: (result, error, id) => [{ type: 'Transactions', id }],
    }),

    // Process deposit
    deposit: builder.mutation<{
      transactionId: string;
      amount: number;
      currency: string;
      status: string;
      createdAt: string;
    }, DepositRequest>({
      query: (data) => ({
        url: '/payments/deposit',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Wallet', 'Transactions'],
    }),

    // Process withdrawal
    withdraw: builder.mutation<{
      transactionId: string;
      amount: number;
      currency: string;
      status: string;
      createdAt: string;
    }, WithdrawalRequest>({
      query: (data) => ({
        url: '/payments/withdraw',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Wallet', 'Transactions'],
    }),
  }),
});

export const {
  useTransferMutation,
  useGetTransactionsQuery,
  useGetTransactionQuery,
  useDepositMutation,
  useWithdrawMutation,
} = paymentApi;

// Payment service class for additional functionality
export class PaymentService {
  /**
   * Validate transfer request
   */
  static validateTransferRequest(data: TransferRequest): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.recipientEmail)) {
      errors.push('Valid email address required');
    }

    // Validate amount
    if (data.amount <= 0) {
      errors.push('Amount must be greater than 0');
    }

    if (data.amount < 0.01) {
      errors.push('Minimum amount is 0.01');
    }

    // Validate currency
    const supportedCurrencies = ['NGN', 'USD', 'EUR', 'GBP'];
    if (!supportedCurrencies.includes(data.currency.toUpperCase())) {
      errors.push('Unsupported currency');
    }

    // Validate PIN
    if (!/^\d{4}$/.test(data.pin)) {
      errors.push('PIN must be 4 digits');
    }

    // Validate description
    if (data.description && data.description.length > 500) {
      errors.push('Description too long');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate withdrawal request
   */
  static validateWithdrawalRequest(data: WithdrawalRequest): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Validate bank account ID
    if (!data.bankAccountId) {
      errors.push('Bank account required');
    }

    // Validate amount
    if (data.amount <= 0) {
      errors.push('Amount must be greater than 0');
    }

    if (data.amount < 0.01) {
      errors.push('Minimum amount is 0.01');
    }

    // Validate currency
    const supportedCurrencies = ['NGN', 'USD', 'EUR', 'GBP'];
    if (!supportedCurrencies.includes(data.currency.toUpperCase())) {
      errors.push('Unsupported currency');
    }

    // Validate PIN
    if (!/^\d{4}$/.test(data.pin)) {
      errors.push('PIN must be 4 digits');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Calculate transfer fee
   */
  static calculateTransferFee(amount: number, currency: string): number {
    // 2.5% fee for transfers
    return amount * 0.025;
  }

  /**
   * Calculate withdrawal fees
   */
  static calculateWithdrawalFees(amount: number, currency: string): {
    fee: number;
    processingFee: number;
    total: number;
  } {
    const fee = amount * 0.025; // 2.5% fee
    const processingFee = amount * 0.01; // 1% processing fee
    const total = fee + processingFee;

    return { fee, processingFee, total };
  }

  /**
   * Get minimum transfer amount
   */
  static getMinimumTransferAmount(currency: string): number {
    const minimums: { [key: string]: number } = {
      NGN: 100,
      USD: 1,
      EUR: 1,
      GBP: 1,
    };

    return minimums[currency] || 0.01;
  }

  /**
   * Get maximum transfer amount
   */
  static getMaximumTransferAmount(currency: string): number {
    const maximums: { [key: string]: number } = {
      NGN: 1000000,
      USD: 10000,
      EUR: 10000,
      GBP: 10000,
    };

    return maximums[currency] || 10000;
  }

  /**
   * Format transaction amount for display
   */
  static formatTransactionAmount(amount: number, currency: string): string {
    const symbols: { [key: string]: string } = {
      NGN: '₦',
      USD: '$',
      EUR: '€',
      GBP: '£',
    };

    const symbol = symbols[currency] || currency;
    
    const locale = currency === 'NGN' ? 'en-NG' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount).replace(/[A-Z]{3}/, symbol);
  }

  /**
   * Get transaction status color
   */
  static getTransactionStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      pending: '#FFC107',
      processing: '#2196F3',
      completed: '#4CAF50',
      failed: '#F44336',
      cancelled: '#9E9E9E',
    };

    return colors[status] || '#9E9E9E';
  }

  /**
   * Get transaction status text
   */
  static getTransactionStatusText(status: string): string {
    const texts: { [key: string]: string } = {
      pending: 'Pending',
      processing: 'Processing',
      completed: 'Completed',
      failed: 'Failed',
      cancelled: 'Cancelled',
    };

    return texts[status] || status;
  }

  /**
   * Get transaction type text
   */
  static getTransactionTypeText(type: string): string {
    const texts: { [key: string]: string } = {
      transfer: 'Transfer',
      deposit: 'Deposit',
      withdrawal: 'Withdrawal',
      fee: 'Fee',
    };

    return texts[type] || type;
  }

  /**
   * Get transaction icon
   */
  static getTransactionIcon(type: string): string {
    const icons: { [key: string]: string } = {
      transfer: 'swap-horiz',
      deposit: 'arrow-down',
      withdrawal: 'arrow-up',
      fee: 'money',
    };

    return icons[type] || 'money';
  }

  /**
   * Format relative time
   */
  static formatRelativeTime(date: string): string {
    const now = new Date();
    const transactionDate = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - transactionDate.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}d ago`;
    } else {
      return transactionDate.toLocaleDateString();
    }
  }

  /**
   * Filter transactions by search term
   */
  static filterTransactions(transactions: Transaction[], searchTerm: string): Transaction[] {
    if (!searchTerm) return transactions;

    const term = searchTerm.toLowerCase();
    return transactions.filter(transaction => 
      transaction.description?.toLowerCase().includes(term) ||
      transaction.recipient?.username.toLowerCase().includes(term) ||
      transaction.recipient?.email.toLowerCase().includes(term) ||
      transaction.sender?.username.toLowerCase().includes(term) ||
      transaction.sender?.email.toLowerCase().includes(term)
    );
  }

  /**
   * Sort transactions by date
   */
  static sortTransactionsByDate(transactions: Transaction[], ascending: boolean = false): Transaction[] {
    return [...transactions].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return ascending ? dateA - dateB : dateB - dateA;
    });
  }

  /**
   * Group transactions by date
   */
  static groupTransactionsByDate(transactions: Transaction[]): { [key: string]: Transaction[] } {
    return transactions.reduce((groups, transaction) => {
      const date = new Date(transaction.createdAt).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(transaction);
      return groups;
    }, {} as { [key: string]: Transaction[] });
  }
}
