import { api } from '@store/api/api';
import { WalletBalance, ExchangeRate, Currency } from '@types/wallet.types';

// Wallet API endpoints
export const walletApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Get wallet balance (fiat only)
    getWalletBalance: builder.query<WalletBalance, void>({
      query: () => '/wallet/balance',
      providesTags: ['Wallet'],
    }),

    // Get supported currencies and exchange rates
    getCurrencies: builder.query<Currency[], void>({
      query: () => '/wallet/currencies',
      providesTags: ['ExchangeRates'],
    }),

    // Change user's preferred currency
    changeCurrency: builder.mutation<void, { currency: string }>({
      query: (data) => ({
        url: '/wallet/change-currency',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Wallet', 'ExchangeRates'],
    }),

    // Sync wallet balance with blockchain
    syncBalance: builder.mutation<WalletBalance, void>({
      query: () => ({
        url: '/wallet/sync',
        method: 'POST',
      }),
      invalidatesTags: ['Wallet'],
    }),

    // Get wallet transactions (fiat amounts only)
    getWalletTransactions: builder.query<{
      transactions: any[];
      pagination: any;
    }, {
      page?: number;
      limit?: number;
      type?: string;
      status?: string;
    }>({
      query: (params) => ({
        url: '/wallet/transactions',
        params,
      }),
      providesTags: ['Transactions'],
    }),
  }),
});

export const {
  useGetWalletBalanceQuery,
  useGetCurrenciesQuery,
  useChangeCurrencyMutation,
  useSyncBalanceMutation,
  useGetWalletTransactionsQuery,
} = walletApi;

// Wallet service class for additional functionality
export class WalletService {
  /**
   * Format currency amount for display
   */
  static formatCurrency(amount: number, currency: string): string {
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
   * Get currency symbol
   */
  static getCurrencySymbol(currency: string): string {
    const symbols: { [key: string]: string } = {
      NGN: '₦',
      USD: '$',
      EUR: '€',
      GBP: '£',
    };

    return symbols[currency] || currency;
  }

  /**
   * Validate currency code
   */
  static isValidCurrency(currency: string): boolean {
    const supportedCurrencies = ['NGN', 'USD', 'EUR', 'GBP'];
    return supportedCurrencies.includes(currency.toUpperCase());
  }

  /**
   * Get currency name
   */
  static getCurrencyName(currency: string): string {
    const names: { [key: string]: string } = {
      NGN: 'Nigerian Naira',
      USD: 'US Dollar',
      EUR: 'Euro',
      GBP: 'British Pound',
    };

    return names[currency] || currency;
  }

  /**
   * Calculate transaction fee
   */
  static calculateFee(amount: number, currency: string): number {
    // 2.5% fee for transfers
    return amount * 0.025;
  }

  /**
   * Calculate withdrawal fee
   */
  static calculateWithdrawalFee(amount: number, currency: string): {
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
   * Validate amount
   */
  static validateAmount(amount: number, currency: string): {
    isValid: boolean;
    error?: string;
  } {
    if (amount <= 0) {
      return { isValid: false, error: 'Amount must be greater than 0' };
    }

    if (amount < 0.01) {
      return { isValid: false, error: 'Minimum amount is 0.01' };
    }

    // Currency-specific minimum amounts
    const minimums: { [key: string]: number } = {
      NGN: 100,
      USD: 1,
      EUR: 1,
      GBP: 1,
    };

    const minimum = minimums[currency] || 0.01;
    if (amount < minimum) {
      return { 
        isValid: false, 
        error: `Minimum amount is ${this.formatCurrency(minimum, currency)}` 
      };
    }

    return { isValid: true };
  }

  /**
   * Format amount for input
   */
  static formatAmountForInput(amount: number, currency: string): string {
    // Round to 2 decimal places for display
    return amount.toFixed(2);
  }

  /**
   * Parse amount from input
   */
  static parseAmountFromInput(input: string): number {
    // Remove any non-numeric characters except decimal point
    const cleaned = input.replace(/[^0-9.]/g, '');
    const amount = parseFloat(cleaned);
    return isNaN(amount) ? 0 : amount;
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
}
