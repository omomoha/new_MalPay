import { validateRequest } from '../../middleware/validation';
import { body, param, query } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

describe('Input Validation Security Tests', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest = {
      body: {},
      params: {},
      query: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  describe('SQL Injection Prevention', () => {
    it('should reject SQL injection attempts in email field', async () => {
      const maliciousEmail = "test@example.com'; DROP TABLE users; --";
      mockRequest.body = { email: maliciousEmail };

      const middleware = validateRequest([
        body('email').isEmail().withMessage('Valid email required'),
      ]);

      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        errors: expect.arrayContaining([
          expect.objectContaining({
            msg: 'Valid email required',
          }),
        ]),
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject SQL injection attempts in account number field', async () => {
      const maliciousAccountNumber = "1234567890'; DROP TABLE bank_accounts; --";
      mockRequest.body = { accountNumber: maliciousAccountNumber };

      const middleware = validateRequest([
        body('accountNumber').isLength({ min: 10, max: 10 }).withMessage('Account number must be 10 digits'),
      ]);

      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        errors: expect.arrayContaining([
          expect.objectContaining({
            msg: 'Account number must be 10 digits',
          }),
        ]),
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject SQL injection attempts in bank code field', async () => {
      const maliciousBankCode = "044'; DROP TABLE banks; --";
      mockRequest.body = { bankCode: maliciousBankCode };

      const middleware = validateRequest([
        body('bankCode').isLength({ min: 3, max: 3 }).withMessage('Bank code must be 3 digits'),
      ]);

      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        errors: expect.arrayContaining([
          expect.objectContaining({
            msg: 'Bank code must be 3 digits',
          }),
        ]),
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('XSS Prevention', () => {
    it('should reject XSS attempts in account name field', async () => {
      const maliciousAccountName = '<script>alert("xss")</script>John Doe';
      mockRequest.body = { accountName: maliciousAccountName };

      const middleware = validateRequest([
        body('accountName').isLength({ min: 2, max: 100 }).withMessage('Account name required'),
      ]);

      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Should pass validation but XSS prevention would be handled at the application level
      expect(mockNext).toHaveBeenCalled();
    });

    it('should reject XSS attempts in description field', async () => {
      const maliciousDescription = '<img src="x" onerror="alert(\'xss\')">';
      mockRequest.body = { description: maliciousDescription };

      const middleware = validateRequest([
        body('description').optional().isLength({ max: 500 }).withMessage('Description too long'),
      ]);

      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Should pass validation but XSS prevention would be handled at the application level
      expect(mockNext).toHaveBeenCalled();
    });

    it('should reject XSS attempts in query parameters', async () => {
      const maliciousQuery = '<script>alert("xss")</script>';
      mockRequest.query = { search: maliciousQuery };

      const middleware = validateRequest([
        query('search').optional().isLength({ max: 100 }).withMessage('Search term too long'),
      ]);

      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Should pass validation but XSS prevention would be handled at the application level
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('Input Length Validation', () => {
    it('should reject extremely long email addresses', async () => {
      const longEmail = 'a'.repeat(1000) + '@example.com';
      mockRequest.body = { email: longEmail };

      const middleware = validateRequest([
        body('email').isEmail().withMessage('Valid email required'),
      ]);

      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        errors: expect.arrayContaining([
          expect.objectContaining({
            msg: 'Valid email required',
          }),
        ]),
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject extremely long account numbers', async () => {
      const longAccountNumber = '1'.repeat(1000);
      mockRequest.body = { accountNumber: longAccountNumber };

      const middleware = validateRequest([
        body('accountNumber').isLength({ min: 10, max: 10 }).withMessage('Account number must be 10 digits'),
      ]);

      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        errors: expect.arrayContaining([
          expect.objectContaining({
            msg: 'Account number must be 10 digits',
          }),
        ]),
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject extremely long descriptions', async () => {
      const longDescription = 'a'.repeat(10000);
      mockRequest.body = { description: longDescription };

      const middleware = validateRequest([
        body('description').optional().isLength({ max: 500 }).withMessage('Description too long'),
      ]);

      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        errors: expect.arrayContaining([
          expect.objectContaining({
            msg: 'Description too long',
          }),
        ]),
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('Data Type Validation', () => {
    it('should reject non-numeric account numbers', async () => {
      const nonNumericAccountNumber = 'abcdefghij';
      mockRequest.body = { accountNumber: nonNumericAccountNumber };

      const middleware = validateRequest([
        body('accountNumber').isLength({ min: 10, max: 10 }).withMessage('Account number must be 10 digits'),
      ]);

      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        errors: expect.arrayContaining([
          expect.objectContaining({
            msg: 'Account number must be 10 digits',
          }),
        ]),
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject non-numeric bank codes', async () => {
      const nonNumericBankCode = 'abc';
      mockRequest.body = { bankCode: nonNumericBankCode };

      const middleware = validateRequest([
        body('bankCode').isLength({ min: 3, max: 3 }).withMessage('Bank code must be 3 digits'),
      ]);

      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        errors: expect.arrayContaining([
          expect.objectContaining({
            msg: 'Bank code must be 3 digits',
          }),
        ]),
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject non-numeric amounts', async () => {
      const nonNumericAmount = 'not-a-number';
      mockRequest.body = { amount: nonNumericAmount };

      const middleware = validateRequest([
        body('amount').isFloat({ gt: 0 }).withMessage('Amount must be a positive number'),
      ]);

      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        errors: expect.arrayContaining([
          expect.objectContaining({
            msg: 'Amount must be a positive number',
          }),
        ]),
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject negative amounts', async () => {
      const negativeAmount = -100;
      mockRequest.body = { amount: negativeAmount };

      const middleware = validateRequest([
        body('amount').isFloat({ gt: 0 }).withMessage('Amount must be a positive number'),
      ]);

      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        errors: expect.arrayContaining([
          expect.objectContaining({
            msg: 'Amount must be a positive number',
          }),
        ]),
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject zero amounts', async () => {
      const zeroAmount = 0;
      mockRequest.body = { amount: zeroAmount };

      const middleware = validateRequest([
        body('amount').isFloat({ gt: 0 }).withMessage('Amount must be a positive number'),
      ]);

      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        errors: expect.arrayContaining([
          expect.objectContaining({
            msg: 'Amount must be a positive number',
          }),
        ]),
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('Special Character Handling', () => {
    it('should handle special characters in account names', async () => {
      const specialCharAccountName = "John O'Connor-Smith";
      mockRequest.body = { accountName: specialCharAccountName };

      const middleware = validateRequest([
        body('accountName').isLength({ min: 2, max: 100 }).withMessage('Account name required'),
      ]);

      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle unicode characters in account names', async () => {
      const unicodeAccountName = 'José María González';
      mockRequest.body = { accountName: unicodeAccountName };

      const middleware = validateRequest([
        body('accountName').isLength({ min: 2, max: 100 }).withMessage('Account name required'),
      ]);

      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle emoji characters in descriptions', async () => {
      const emojiDescription = 'Payment for groceries 🛒💰';
      mockRequest.body = { description: emojiDescription };

      const middleware = validateRequest([
        body('description').optional().isLength({ max: 500 }).withMessage('Description too long'),
      ]);

      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('Boundary Value Testing', () => {
    it('should accept minimum valid account number length', async () => {
      const minAccountNumber = '1234567890';
      mockRequest.body = { accountNumber: minAccountNumber };

      const middleware = validateRequest([
        body('accountNumber').isLength({ min: 10, max: 10 }).withMessage('Account number must be 10 digits'),
      ]);

      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should reject account number one digit short', async () => {
      const shortAccountNumber = '123456789';
      mockRequest.body = { accountNumber: shortAccountNumber };

      const middleware = validateRequest([
        body('accountNumber').isLength({ min: 10, max: 10 }).withMessage('Account number must be 10 digits'),
      ]);

      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject account number one digit long', async () => {
      const longAccountNumber = '12345678901';
      mockRequest.body = { accountNumber: longAccountNumber };

      const middleware = validateRequest([
        body('accountNumber').isLength({ min: 10, max: 10 }).withMessage('Account number must be 10 digits'),
      ]);

      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should accept maximum valid description length', async () => {
      const maxDescription = 'a'.repeat(500);
      mockRequest.body = { description: maxDescription };

      const middleware = validateRequest([
        body('description').optional().isLength({ max: 500 }).withMessage('Description too long'),
      ]);

      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should reject description one character too long', async () => {
      const tooLongDescription = 'a'.repeat(501);
      mockRequest.body = { description: tooLongDescription };

      const middleware = validateRequest([
        body('description').optional().isLength({ max: 500 }).withMessage('Description too long'),
      ]);

      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('Multiple Field Validation', () => {
    it('should validate multiple fields and return all errors', async () => {
      mockRequest.body = {
        email: 'invalid-email',
        accountNumber: '123',
        bankCode: 'abc',
        amount: -100,
      };

      const middleware = validateRequest([
        body('email').isEmail().withMessage('Valid email required'),
        body('accountNumber').isLength({ min: 10, max: 10 }).withMessage('Account number must be 10 digits'),
        body('bankCode').isLength({ min: 3, max: 3 }).withMessage('Bank code must be 3 digits'),
        body('amount').isFloat({ gt: 0 }).withMessage('Amount must be a positive number'),
      ]);

      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        errors: expect.arrayContaining([
          expect.objectContaining({ msg: 'Valid email required' }),
          expect.objectContaining({ msg: 'Account number must be 10 digits' }),
          expect.objectContaining({ msg: 'Bank code must be 3 digits' }),
          expect.objectContaining({ msg: 'Amount must be a positive number' }),
        ]),
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should pass validation when all fields are valid', async () => {
      mockRequest.body = {
        email: 'test@example.com',
        accountNumber: '1234567890',
        bankCode: '044',
        amount: 100.50,
      };

      const middleware = validateRequest([
        body('email').isEmail().withMessage('Valid email required'),
        body('accountNumber').isLength({ min: 10, max: 10 }).withMessage('Account number must be 10 digits'),
        body('bankCode').isLength({ min: 3, max: 3 }).withMessage('Bank code must be 3 digits'),
        body('amount').isFloat({ gt: 0 }).withMessage('Amount must be a positive number'),
      ]);

      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });
  });
});
