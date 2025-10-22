import { WalletService } from '../WalletService';

// Mock the API
jest.mock('@store/api/api', () => ({
  api: {
    injectEndpoints: jest.fn(() => ({
      endpoints: jest.fn(() => ({
        getWalletBalance: {
          query: jest.fn(),
          providesTags: ['Wallet'],
        },
        getCurrencies: {
          query: jest.fn(),
          providesTags: ['ExchangeRates'],
        },
        changeCurrency: {
          query: jest.fn(),
          invalidatesTags: ['Wallet', 'ExchangeRates'],
        },
        syncBalance: {
          query: jest.fn(),
          invalidatesTags: ['Wallet'],
        },
        getWalletTransactions: {
          query: jest.fn(),
          providesTags: ['Transactions'],
        },
      })),
    })),
  },
}));

describe('WalletService', () => {
  describe('formatCurrency', () => {
    test('should format NGN currency correctly', () => {
      expect(WalletService.formatCurrency(1000, 'NGN')).toBe('₦1,000.00');
      expect(WalletService.formatCurrency(1500.50, 'NGN')).toBe('₦1,500.50');
    });

    test('should format USD currency correctly', () => {
      expect(WalletService.formatCurrency(100, 'USD')).toBe('$100.00');
      expect(WalletService.formatCurrency(99.99, 'USD')).toBe('$99.99');
    });

    test('should format EUR currency correctly', () => {
      expect(WalletService.formatCurrency(50, 'EUR')).toBe('€50.00');
    });

    test('should format GBP currency correctly', () => {
      expect(WalletService.formatCurrency(25, 'GBP')).toBe('£25.00');
    });
  });

  describe('getCurrencySymbol', () => {
    test('should return correct currency symbols', () => {
      expect(WalletService.getCurrencySymbol('NGN')).toBe('₦');
      expect(WalletService.getCurrencySymbol('USD')).toBe('$');
      expect(WalletService.getCurrencySymbol('EUR')).toBe('€');
      expect(WalletService.getCurrencySymbol('GBP')).toBe('£');
      expect(WalletService.getCurrencySymbol('UNKNOWN')).toBe('UNKNOWN');
    });
  });

  describe('isValidCurrency', () => {
    test('should validate supported currencies', () => {
      expect(WalletService.isValidCurrency('NGN')).toBe(true);
      expect(WalletService.isValidCurrency('USD')).toBe(true);
      expect(WalletService.isValidCurrency('EUR')).toBe(true);
      expect(WalletService.isValidCurrency('GBP')).toBe(true);
      expect(WalletService.isValidCurrency('ngn')).toBe(true); // Case insensitive
    });

    test('should reject unsupported currencies', () => {
      expect(WalletService.isValidCurrency('BTC')).toBe(false);
      expect(WalletService.isValidCurrency('ETH')).toBe(false);
      expect(WalletService.isValidCurrency('')).toBe(false);
    });
  });

  describe('getCurrencyName', () => {
    test('should return correct currency names', () => {
      expect(WalletService.getCurrencyName('NGN')).toBe('Nigerian Naira');
      expect(WalletService.getCurrencyName('USD')).toBe('US Dollar');
      expect(WalletService.getCurrencyName('EUR')).toBe('Euro');
      expect(WalletService.getCurrencyName('GBP')).toBe('British Pound');
      expect(WalletService.getCurrencyName('UNKNOWN')).toBe('UNKNOWN');
    });
  });

  describe('calculateFee', () => {
    test('should calculate 2.5% transfer fee correctly', () => {
      expect(WalletService.calculateFee(100, 'NGN')).toBe(2.5);
      expect(WalletService.calculateFee(1000, 'USD')).toBe(25);
      expect(WalletService.calculateFee(0, 'EUR')).toBe(0);
    });
  });

  describe('calculateWithdrawalFee', () => {
    test('should calculate withdrawal fees correctly', () => {
      const result = WalletService.calculateWithdrawalFee(100, 'NGN');
      expect(result.fee).toBe(2.5); // 2.5%
      expect(result.processingFee).toBe(1); // 1%
      expect(result.total).toBe(3.5); // Total
    });

    test('should calculate withdrawal fees for different amounts', () => {
      const result = WalletService.calculateWithdrawalFee(1000, 'USD');
      expect(result.fee).toBe(25);
      expect(result.processingFee).toBe(10);
      expect(result.total).toBe(35);
    });
  });

  describe('validateAmount', () => {
    test('should validate positive amounts', () => {
      const result = WalletService.validateAmount(100, 'NGN');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    test('should reject zero amounts', () => {
      const result = WalletService.validateAmount(0, 'NGN');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Amount must be greater than 0');
    });

    test('should reject negative amounts', () => {
      const result = WalletService.validateAmount(-100, 'NGN');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Amount must be greater than 0');
    });

    test('should reject amounts below minimum', () => {
      const result = WalletService.validateAmount(0.005, 'NGN');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Minimum amount is 0.01');
    });

    test('should validate minimum amounts for different currencies', () => {
      const ngnResult = WalletService.validateAmount(50, 'NGN');
      expect(ngnResult.isValid).toBe(false);
      expect(ngnResult.error).toContain('Minimum amount is ₦100');

      const usdResult = WalletService.validateAmount(0.5, 'USD');
      expect(usdResult.isValid).toBe(false);
      expect(usdResult.error).toContain('Minimum amount is $1');
    });
  });

  describe('formatAmountForInput', () => {
    test('should format amounts to 2 decimal places', () => {
      expect(WalletService.formatAmountForInput(100, 'NGN')).toBe('100.00');
      expect(WalletService.formatAmountForInput(99.9, 'USD')).toBe('99.90');
      expect(WalletService.formatAmountForInput(0.1, 'EUR')).toBe('0.10');
    });
  });

  describe('parseAmountFromInput', () => {
    test('should parse valid numeric input', () => {
      expect(WalletService.parseAmountFromInput('100')).toBe(100);
      expect(WalletService.parseAmountFromInput('99.99')).toBe(99.99);
      expect(WalletService.parseAmountFromInput('0.01')).toBe(0.01);
    });

    test('should handle invalid input', () => {
      expect(WalletService.parseAmountFromInput('abc')).toBe(0);
      expect(WalletService.parseAmountFromInput('')).toBe(0);
      expect(WalletService.parseAmountFromInput('100abc')).toBe(100);
    });

    test('should clean non-numeric characters', () => {
      expect(WalletService.parseAmountFromInput('$100.50')).toBe(100.5);
      expect(WalletService.parseAmountFromInput('₦1,000.00')).toBe(1000);
    });
  });

  describe('getTransactionStatusColor', () => {
    test('should return correct colors for transaction statuses', () => {
      expect(WalletService.getTransactionStatusColor('pending')).toBe('#FFC107');
      expect(WalletService.getTransactionStatusColor('processing')).toBe('#2196F3');
      expect(WalletService.getTransactionStatusColor('completed')).toBe('#4CAF50');
      expect(WalletService.getTransactionStatusColor('failed')).toBe('#F44336');
      expect(WalletService.getTransactionStatusColor('cancelled')).toBe('#9E9E9E');
      expect(WalletService.getTransactionStatusColor('unknown')).toBe('#9E9E9E');
    });
  });

  describe('getTransactionStatusText', () => {
    test('should return correct text for transaction statuses', () => {
      expect(WalletService.getTransactionStatusText('pending')).toBe('Pending');
      expect(WalletService.getTransactionStatusText('processing')).toBe('Processing');
      expect(WalletService.getTransactionStatusText('completed')).toBe('Completed');
      expect(WalletService.getTransactionStatusText('failed')).toBe('Failed');
      expect(WalletService.getTransactionStatusText('cancelled')).toBe('Cancelled');
      expect(WalletService.getTransactionStatusText('unknown')).toBe('unknown');
    });
  });

  describe('getTransactionTypeText', () => {
    test('should return correct text for transaction types', () => {
      expect(WalletService.getTransactionTypeText('transfer')).toBe('Transfer');
      expect(WalletService.getTransactionTypeText('deposit')).toBe('Deposit');
      expect(WalletService.getTransactionTypeText('withdrawal')).toBe('Withdrawal');
      expect(WalletService.getTransactionTypeText('fee')).toBe('Fee');
      expect(WalletService.getTransactionTypeText('unknown')).toBe('unknown');
    });
  });

  describe('getTransactionIcon', () => {
    test('should return correct icons for transaction types', () => {
      expect(WalletService.getTransactionIcon('transfer')).toBe('swap-horiz');
      expect(WalletService.getTransactionIcon('deposit')).toBe('arrow-down');
      expect(WalletService.getTransactionIcon('withdrawal')).toBe('arrow-up');
      expect(WalletService.getTransactionIcon('fee')).toBe('money');
      expect(WalletService.getTransactionIcon('unknown')).toBe('money');
    });
  });
});
