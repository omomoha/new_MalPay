import { PaymentService } from '../PaymentService';
import { TransferRequest, WithdrawalRequest } from '@types/transaction.types';

// Mock the API
jest.mock('@store/api/api', () => ({
  api: {
    injectEndpoints: jest.fn(() => ({
      endpoints: jest.fn(() => ({
        transfer: {
          query: jest.fn(),
          invalidatesTags: ['Wallet', 'Transactions'],
        },
        getTransactions: {
          query: jest.fn(),
          providesTags: ['Transactions'],
        },
        getTransaction: {
          query: jest.fn(),
          providesTags: jest.fn(),
        },
        deposit: {
          query: jest.fn(),
          invalidatesTags: ['Wallet', 'Transactions'],
        },
        withdraw: {
          query: jest.fn(),
          invalidatesTags: ['Wallet', 'Transactions'],
        },
      })),
    })),
  },
}));

describe('PaymentService', () => {
  describe('validateTransferRequest', () => {
    test('should validate correct transfer request', () => {
      const validRequest: TransferRequest = {
        recipientEmail: 'test@example.com',
        amount: 100,
        currency: 'NGN',
        description: 'Test transfer',
        pin: '1234',
      };

      const result = PaymentService.validateTransferRequest(validRequest);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject invalid email', () => {
      const invalidRequest: TransferRequest = {
        recipientEmail: 'invalid-email',
        amount: 100,
        currency: 'NGN',
        pin: '1234',
      };

      const result = PaymentService.validateTransferRequest(invalidRequest);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Valid email address required');
    });

    test('should reject zero amount', () => {
      const invalidRequest: TransferRequest = {
        recipientEmail: 'test@example.com',
        amount: 0,
        currency: 'NGN',
        pin: '1234',
      };

      const result = PaymentService.validateTransferRequest(invalidRequest);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Amount must be greater than 0');
    });

    test('should reject negative amount', () => {
      const invalidRequest: TransferRequest = {
        recipientEmail: 'test@example.com',
        amount: -100,
        currency: 'NGN',
        pin: '1234',
      };

      const result = PaymentService.validateTransferRequest(invalidRequest);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Amount must be greater than 0');
    });

    test('should reject amount below minimum', () => {
      const invalidRequest: TransferRequest = {
        recipientEmail: 'test@example.com',
        amount: 0.005,
        currency: 'NGN',
        pin: '1234',
      };

      const result = PaymentService.validateTransferRequest(invalidRequest);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Minimum amount is 0.01');
    });

    test('should reject unsupported currency', () => {
      const invalidRequest: TransferRequest = {
        recipientEmail: 'test@example.com',
        amount: 100,
        currency: 'BTC',
        pin: '1234',
      };

      const result = PaymentService.validateTransferRequest(invalidRequest);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Unsupported currency');
    });

    test('should reject invalid PIN', () => {
      const invalidRequest: TransferRequest = {
        recipientEmail: 'test@example.com',
        amount: 100,
        currency: 'NGN',
        pin: '123',
      };

      const result = PaymentService.validateTransferRequest(invalidRequest);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('PIN must be 4 digits');
    });

    test('should reject long description', () => {
      const invalidRequest: TransferRequest = {
        recipientEmail: 'test@example.com',
        amount: 100,
        currency: 'NGN',
        description: 'a'.repeat(501),
        pin: '1234',
      };

      const result = PaymentService.validateTransferRequest(invalidRequest);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Description too long');
    });
  });

  describe('validateWithdrawalRequest', () => {
    test('should validate correct withdrawal request', () => {
      const validRequest: WithdrawalRequest = {
        bankAccountId: 'test-bank-id',
        amount: 100,
        currency: 'NGN',
        pin: '1234',
      };

      const result = PaymentService.validateWithdrawalRequest(validRequest);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject missing bank account ID', () => {
      const invalidRequest: WithdrawalRequest = {
        bankAccountId: '',
        amount: 100,
        currency: 'NGN',
        pin: '1234',
      };

      const result = PaymentService.validateWithdrawalRequest(invalidRequest);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Bank account required');
    });

    test('should reject invalid amount', () => {
      const invalidRequest: WithdrawalRequest = {
        bankAccountId: 'test-bank-id',
        amount: 0,
        currency: 'NGN',
        pin: '1234',
      };

      const result = PaymentService.validateWithdrawalRequest(invalidRequest);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Amount must be greater than 0');
    });

    test('should reject unsupported currency', () => {
      const invalidRequest: WithdrawalRequest = {
        bankAccountId: 'test-bank-id',
        amount: 100,
        currency: 'BTC',
        pin: '1234',
      };

      const result = PaymentService.validateWithdrawalRequest(invalidRequest);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Unsupported currency');
    });

    test('should reject invalid PIN', () => {
      const invalidRequest: WithdrawalRequest = {
        bankAccountId: 'test-bank-id',
        amount: 100,
        currency: 'NGN',
        pin: '123',
      };

      const result = PaymentService.validateWithdrawalRequest(invalidRequest);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('PIN must be 4 digits');
    });
  });

  describe('calculateTransferFee', () => {
    test('should calculate 2.5% transfer fee', () => {
      expect(PaymentService.calculateTransferFee(100, 'NGN')).toBe(2.5);
      expect(PaymentService.calculateTransferFee(1000, 'USD')).toBe(25);
      expect(PaymentService.calculateTransferFee(0, 'EUR')).toBe(0);
    });
  });

  describe('calculateWithdrawalFees', () => {
    test('should calculate withdrawal fees correctly', () => {
      const result = PaymentService.calculateWithdrawalFees(100, 'NGN');
      expect(result.fee).toBe(2.5); // 2.5%
      expect(result.processingFee).toBe(1); // 1%
      expect(result.total).toBe(3.5); // Total
    });

    test('should calculate withdrawal fees for different amounts', () => {
      const result = PaymentService.calculateWithdrawalFees(1000, 'USD');
      expect(result.fee).toBe(25);
      expect(result.processingFee).toBe(10);
      expect(result.total).toBe(35);
    });
  });

  describe('getMinimumTransferAmount', () => {
    test('should return correct minimum amounts', () => {
      expect(PaymentService.getMinimumTransferAmount('NGN')).toBe(100);
      expect(PaymentService.getMinimumTransferAmount('USD')).toBe(1);
      expect(PaymentService.getMinimumTransferAmount('EUR')).toBe(1);
      expect(PaymentService.getMinimumTransferAmount('GBP')).toBe(1);
      expect(PaymentService.getMinimumTransferAmount('UNKNOWN')).toBe(0.01);
    });
  });

  describe('getMaximumTransferAmount', () => {
    test('should return correct maximum amounts', () => {
      expect(PaymentService.getMaximumTransferAmount('NGN')).toBe(1000000);
      expect(PaymentService.getMaximumTransferAmount('USD')).toBe(10000);
      expect(PaymentService.getMaximumTransferAmount('EUR')).toBe(10000);
      expect(PaymentService.getMaximumTransferAmount('GBP')).toBe(10000);
      expect(PaymentService.getMaximumTransferAmount('UNKNOWN')).toBe(10000);
    });
  });

  describe('formatTransactionAmount', () => {
    test('should format transaction amounts correctly', () => {
      expect(PaymentService.formatTransactionAmount(100, 'NGN')).toBe('₦100.00');
      expect(PaymentService.formatTransactionAmount(99.99, 'USD')).toBe('$99.99');
      expect(PaymentService.formatTransactionAmount(50, 'EUR')).toBe('€50.00');
      expect(PaymentService.formatTransactionAmount(25, 'GBP')).toBe('£25.00');
    });
  });

  describe('getTransactionStatusColor', () => {
    test('should return correct colors for transaction statuses', () => {
      expect(PaymentService.getTransactionStatusColor('pending')).toBe('#FFC107');
      expect(PaymentService.getTransactionStatusColor('processing')).toBe('#2196F3');
      expect(PaymentService.getTransactionStatusColor('completed')).toBe('#4CAF50');
      expect(PaymentService.getTransactionStatusColor('failed')).toBe('#F44336');
      expect(PaymentService.getTransactionStatusColor('cancelled')).toBe('#9E9E9E');
      expect(PaymentService.getTransactionStatusColor('unknown')).toBe('#9E9E9E');
    });
  });

  describe('getTransactionStatusText', () => {
    test('should return correct text for transaction statuses', () => {
      expect(PaymentService.getTransactionStatusText('pending')).toBe('Pending');
      expect(PaymentService.getTransactionStatusText('processing')).toBe('Processing');
      expect(PaymentService.getTransactionStatusText('completed')).toBe('Completed');
      expect(PaymentService.getTransactionStatusText('failed')).toBe('Failed');
      expect(PaymentService.getTransactionStatusText('cancelled')).toBe('Cancelled');
      expect(PaymentService.getTransactionStatusText('unknown')).toBe('unknown');
    });
  });

  describe('getTransactionTypeText', () => {
    test('should return correct text for transaction types', () => {
      expect(PaymentService.getTransactionTypeText('transfer')).toBe('Transfer');
      expect(PaymentService.getTransactionTypeText('deposit')).toBe('Deposit');
      expect(PaymentService.getTransactionTypeText('withdrawal')).toBe('Withdrawal');
      expect(PaymentService.getTransactionTypeText('fee')).toBe('Fee');
      expect(PaymentService.getTransactionTypeText('unknown')).toBe('unknown');
    });
  });

  describe('getTransactionIcon', () => {
    test('should return correct icons for transaction types', () => {
      expect(PaymentService.getTransactionIcon('transfer')).toBe('swap-horiz');
      expect(PaymentService.getTransactionIcon('deposit')).toBe('arrow-down');
      expect(PaymentService.getTransactionIcon('withdrawal')).toBe('arrow-up');
      expect(PaymentService.getTransactionIcon('fee')).toBe('money');
      expect(PaymentService.getTransactionIcon('unknown')).toBe('money');
    });
  });

  describe('formatRelativeTime', () => {
    test('should format relative time correctly', () => {
      const now = new Date();
      const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      expect(PaymentService.formatRelativeTime(oneMinuteAgo.toISOString())).toBe('1m ago');
      expect(PaymentService.formatRelativeTime(oneHourAgo.toISOString())).toBe('1h ago');
      expect(PaymentService.formatRelativeTime(oneDayAgo.toISOString())).toBe('1d ago');
    });

    test('should show "Just now" for recent times', () => {
      const now = new Date();
      expect(PaymentService.formatRelativeTime(now.toISOString())).toBe('Just now');
    });
  });

  describe('filterTransactions', () => {
    const mockTransactions = [
      {
        id: '1',
        description: 'Transfer to John Doe',
        recipient: { username: 'johndoe', email: 'john@example.com' },
        sender: { username: 'sender', email: 'sender@example.com' },
      },
      {
        id: '2',
        description: 'Payment for services',
        recipient: { username: 'service', email: 'service@example.com' },
        sender: { username: 'user', email: 'user@example.com' },
      },
    ];

    test('should filter transactions by description', () => {
      const filtered = PaymentService.filterTransactions(mockTransactions, 'transfer');
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('1');
    });

    test('should filter transactions by recipient username', () => {
      const filtered = PaymentService.filterTransactions(mockTransactions, 'john');
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('1');
    });

    test('should filter transactions by recipient email', () => {
      const filtered = PaymentService.filterTransactions(mockTransactions, 'service@example.com');
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('2');
    });

    test('should return all transactions for empty search term', () => {
      const filtered = PaymentService.filterTransactions(mockTransactions, '');
      expect(filtered).toHaveLength(2);
    });

    test('should return empty array for no matches', () => {
      const filtered = PaymentService.filterTransactions(mockTransactions, 'nonexistent');
      expect(filtered).toHaveLength(0);
    });
  });

  describe('sortTransactionsByDate', () => {
    const mockTransactions = [
      { id: '1', createdAt: '2025-01-01T10:00:00Z' },
      { id: '2', createdAt: '2025-01-01T12:00:00Z' },
      { id: '3', createdAt: '2025-01-01T08:00:00Z' },
    ];

    test('should sort transactions by date descending by default', () => {
      const sorted = PaymentService.sortTransactionsByDate(mockTransactions);
      expect(sorted[0].id).toBe('2');
      expect(sorted[1].id).toBe('1');
      expect(sorted[2].id).toBe('3');
    });

    test('should sort transactions by date ascending when specified', () => {
      const sorted = PaymentService.sortTransactionsByDate(mockTransactions, true);
      expect(sorted[0].id).toBe('3');
      expect(sorted[1].id).toBe('1');
      expect(sorted[2].id).toBe('2');
    });
  });

  describe('groupTransactionsByDate', () => {
    const mockTransactions = [
      { id: '1', createdAt: '2025-01-01T10:00:00Z' },
      { id: '2', createdAt: '2025-01-01T12:00:00Z' },
      { id: '3', createdAt: '2025-01-02T08:00:00Z' },
    ];

    test('should group transactions by date', () => {
      const grouped = PaymentService.groupTransactionsByDate(mockTransactions);
      const dates = Object.keys(grouped);
      expect(dates).toHaveLength(2);
      expect(grouped[dates[0]]).toHaveLength(2); // Two transactions on first date
      expect(grouped[dates[1]]).toHaveLength(1); // One transaction on second date
    });
  });
});
