import { BankAccountService } from '../../services/BankAccountService';
import { Pool } from 'pg';
import { Logger } from 'winston';
import axios from 'axios';

// Mock dependencies
jest.mock('pg');
jest.mock('winston');
jest.mock('axios');

const mockAxios = axios as jest.Mocked<typeof axios>;
const mockPool = {
  query: jest.fn(),
  connect: jest.fn(),
} as unknown as Pool;
const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
} as unknown as Logger;

describe('Bank Account Security Tests', () => {
  let bankAccountService: BankAccountService;

  beforeEach(() => {
    jest.clearAllMocks();
    bankAccountService = new BankAccountService(mockPool, mockLogger, 'test-paystack-key');
  });

  describe('Input Validation Security', () => {
    it('should reject SQL injection attempts in account number', async () => {
      const maliciousAccountNumber = "1234567890'; DROP TABLE bank_accounts; --";
      const bankCode = '044';

      mockAxios.post.mockRejectedValue(new Error('Invalid account'));

      await expect(
        bankAccountService.verifyAccount(maliciousAccountNumber, bankCode)
      ).rejects.toThrow();
    });

    it('should reject XSS attempts in account number', async () => {
      const maliciousAccountNumber = '<script>alert("xss")</script>';
      const bankCode = '044';

      mockAxios.post.mockRejectedValue(new Error('Invalid account'));

      await expect(
        bankAccountService.verifyAccount(maliciousAccountNumber, bankCode)
      ).rejects.toThrow();
    });

    it('should reject extremely long account numbers', async () => {
      const longAccountNumber = '1'.repeat(1000);
      const bankCode = '044';

      mockAxios.post.mockRejectedValue(new Error('Invalid account'));

      await expect(
        bankAccountService.verifyAccount(longAccountNumber, bankCode)
      ).rejects.toThrow();
    });

    it('should reject non-numeric account numbers', async () => {
      const nonNumericAccountNumber = 'abcdefghij';
      const bankCode = '044';

      mockAxios.post.mockRejectedValue(new Error('Invalid account'));

      await expect(
        bankAccountService.verifyAccount(nonNumericAccountNumber, bankCode)
      ).rejects.toThrow();
    });

    it('should reject invalid bank codes', async () => {
      const accountNumber = '1234567890';
      const invalidBankCode = '999'; // Non-existent bank code

      mockAxios.post.mockRejectedValue(new Error('Invalid bank code'));

      await expect(
        bankAccountService.verifyAccount(accountNumber, invalidBankCode)
      ).rejects.toThrow();
    });

    it('should reject empty account number', async () => {
      const emptyAccountNumber = '';
      const bankCode = '044';

      mockAxios.post.mockRejectedValue(new Error('Account number required'));

      await expect(
        bankAccountService.verifyAccount(emptyAccountNumber, bankCode)
      ).rejects.toThrow();
    });

    it('should reject empty bank code', async () => {
      const accountNumber = '1234567890';
      const emptyBankCode = '';

      mockAxios.post.mockRejectedValue(new Error('Bank code required'));

      await expect(
        bankAccountService.verifyAccount(accountNumber, emptyBankCode)
      ).rejects.toThrow();
    });
  });

  describe('API Security', () => {
    it('should handle Paystack API failures gracefully', async () => {
      const accountNumber = '1234567890';
      const bankCode = '044';

      mockAxios.post.mockRejectedValue(new Error('Paystack API unavailable'));

      const result = await bankAccountService.verifyAccount(accountNumber, bankCode);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Account verification service unavailable');
    });

    it('should handle Paystack API timeout', async () => {
      const accountNumber = '1234567890';
      const bankCode = '044';

      mockAxios.post.mockRejectedValue(new Error('timeout'));

      const result = await bankAccountService.verifyAccount(accountNumber, bankCode);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Account verification service unavailable');
    });

    it('should handle Paystack API rate limiting', async () => {
      const accountNumber = '1234567890';
      const bankCode = '044';

      mockAxios.post.mockRejectedValue({
        response: {
          status: 429,
          data: { message: 'Rate limit exceeded' }
        }
      });

      const result = await bankAccountService.verifyAccount(accountNumber, bankCode);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Rate limit exceeded');
    });

    it('should handle Paystack API authentication errors', async () => {
      const accountNumber = '1234567890';
      const bankCode = '044';

      mockAxios.post.mockRejectedValue({
        response: {
          status: 401,
          data: { message: 'Unauthorized' }
        }
      });

      const result = await bankAccountService.verifyAccount(accountNumber, bankCode);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized');
    });

    it('should not expose sensitive API keys in error messages', async () => {
      const accountNumber = '1234567890';
      const bankCode = '044';

      mockAxios.post.mockRejectedValue(new Error('Invalid API key: sk_test_123456789'));

      const result = await bankAccountService.verifyAccount(accountNumber, bankCode);

      expect(result.success).toBe(false);
      expect(result.error).not.toContain('sk_test_');
      expect(result.error).toBe('Account verification service unavailable');
    });
  });

  describe('Data Validation Security', () => {
    it('should validate account number format', () => {
      expect(bankAccountService.validateAccountNumber('1234567890', '044')).toBe(true);
      expect(bankAccountService.validateAccountNumber('123456789', '044')).toBe(false); // Too short
      expect(bankAccountService.validateAccountNumber('12345678901', '044')).toBe(false); // Too long
      expect(bankAccountService.validateAccountNumber('123456789a', '044')).toBe(false); // Non-numeric
    });

    it('should validate bank code format', () => {
      expect(bankAccountService.getBankName('044')).toBe('Access Bank');
      expect(bankAccountService.getBankName('999')).toBe('Unknown Bank');
      expect(bankAccountService.getBankName('')).toBe('Unknown Bank');
    });

    it('should handle special characters in account number', () => {
      expect(bankAccountService.validateAccountNumber('1234-567-890', '044')).toBe(false);
      expect(bankAccountService.validateAccountNumber('1234 567 890', '044')).toBe(false);
      expect(bankAccountService.validateAccountNumber('1234.567.890', '044')).toBe(false);
    });
  });

  describe('Response Security', () => {
    it('should not expose internal errors to client', async () => {
      const accountNumber = '1234567890';
      const bankCode = '044';

      mockAxios.post.mockRejectedValue(new Error('Internal database error'));

      const result = await bankAccountService.verifyAccount(accountNumber, bankCode);

      expect(result.success).toBe(false);
      expect(result.error).not.toContain('database');
      expect(result.error).toBe('Account verification service unavailable');
    });

    it('should sanitize account name in response', async () => {
      const accountNumber = '1234567890';
      const bankCode = '044';

      mockAxios.post.mockResolvedValue({
        data: {
          status: true,
          data: {
            details: {
              account_name: '<script>alert("xss")</script>John Doe'
            }
          }
        }
      });

      const result = await bankAccountService.verifyAccount(accountNumber, bankCode);

      expect(result.success).toBe(true);
      expect(result.accountName).toBe('<script>alert("xss")</script>John Doe'); // Paystack should handle sanitization
    });

    it('should handle null response from Paystack', async () => {
      const accountNumber = '1234567890';
      const bankCode = '044';

      mockAxios.post.mockResolvedValue({
        data: null
      });

      const result = await bankAccountService.verifyAccount(accountNumber, bankCode);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Account verification service unavailable');
    });

    it('should handle malformed Paystack response', async () => {
      const accountNumber = '1234567890';
      const bankCode = '044';

      mockAxios.post.mockResolvedValue({
        data: {
          status: true,
          data: {
            // Missing details object
          }
        }
      });

      const result = await bankAccountService.verifyAccount(accountNumber, bankCode);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Account verification service unavailable');
    });
  });

  describe('Rate Limiting Security', () => {
    it('should handle multiple rapid verification requests', async () => {
      const accountNumber = '1234567890';
      const bankCode = '044';

      mockAxios.post.mockResolvedValue({
        data: {
          status: true,
          data: {
            details: {
              account_name: 'John Doe'
            }
          }
        }
      });

      // Make multiple rapid requests
      const promises = Array(10).fill(null).map(() =>
        bankAccountService.verifyAccount(accountNumber, bankCode)
      );

      const results = await Promise.all(promises);

      results.forEach(result => {
        expect(result.success).toBe(true);
        expect(result.accountName).toBe('John Doe');
      });

      expect(mockAxios.post).toHaveBeenCalledTimes(10);
    });
  });

  describe('Data Integrity Security', () => {
    it('should maintain data consistency during verification', async () => {
      const accountNumber = '1234567890';
      const bankCode = '044';

      mockAxios.post.mockResolvedValue({
        data: {
          status: true,
          data: {
            details: {
              account_name: 'John Doe'
            }
          }
        }
      });

      const result = await bankAccountService.verifyAccount(accountNumber, bankCode);

      expect(result.success).toBe(true);
      expect(result.accountNumber).toBe(accountNumber);
      expect(result.bankCode).toBe(bankCode);
      expect(result.accountName).toBe('John Doe');
      expect(result.bankName).toBe('Access Bank');
    });

    it('should handle concurrent verification requests for same account', async () => {
      const accountNumber = '1234567890';
      const bankCode = '044';

      mockAxios.post.mockResolvedValue({
        data: {
          status: true,
          data: {
            details: {
              account_name: 'John Doe'
            }
          }
        }
      });

      // Make concurrent requests for same account
      const promises = Array(5).fill(null).map(() =>
        bankAccountService.verifyAccount(accountNumber, bankCode)
      );

      const results = await Promise.all(promises);

      results.forEach(result => {
        expect(result.success).toBe(true);
        expect(result.accountNumber).toBe(accountNumber);
        expect(result.bankCode).toBe(bankCode);
      });
    });
  });

  describe('Error Handling Security', () => {
    it('should not leak stack traces in error responses', async () => {
      const accountNumber = '1234567890';
      const bankCode = '044';

      mockAxios.post.mockRejectedValue(new Error('Detailed stack trace here'));

      const result = await bankAccountService.verifyAccount(accountNumber, bankCode);

      expect(result.success).toBe(false);
      expect(result.error).not.toContain('stack trace');
      expect(result.error).toBe('Account verification service unavailable');
    });

    it('should handle network errors gracefully', async () => {
      const accountNumber = '1234567890';
      const bankCode = '044';

      mockAxios.post.mockRejectedValue(new Error('Network Error'));

      const result = await bankAccountService.verifyAccount(accountNumber, bankCode);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Account verification service unavailable');
    });

    it('should handle malformed JSON responses', async () => {
      const accountNumber = '1234567890';
      const bankCode = '044';

      mockAxios.post.mockRejectedValue(new Error('Unexpected token in JSON'));

      const result = await bankAccountService.verifyAccount(accountNumber, bankCode);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Account verification service unavailable');
    });
  });
});
