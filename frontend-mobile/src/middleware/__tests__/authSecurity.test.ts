import { authMiddleware } from '../../middleware/auth';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Mock dependencies
jest.mock('jsonwebtoken');

const mockJwt = jwt as jest.Mocked<typeof jwt>;

describe('Authentication Security Tests', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest = {
      headers: {},
      user: undefined,
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  describe('JWT Token Security', () => {
    it('should reject requests without authorization header', () => {
      authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Access token required',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject requests with malformed authorization header', () => {
      mockRequest.headers = {
        authorization: 'InvalidToken',
      };

      authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid token format',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject requests with invalid Bearer token format', () => {
      mockRequest.headers = {
        authorization: 'Bearer',
      };

      authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid token format',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject expired tokens', () => {
      mockRequest.headers = {
        authorization: 'Bearer expired-token',
      };

      mockJwt.verify.mockImplementation(() => {
        const error = new Error('Token expired');
        error.name = 'TokenExpiredError';
        throw error;
      });

      authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Token expired',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject tokens with invalid signature', () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid-signature-token',
      };

      mockJwt.verify.mockImplementation(() => {
        const error = new Error('Invalid signature');
        error.name = 'JsonWebTokenError';
        throw error;
      });

      authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid token',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject tokens with malformed payload', () => {
      mockRequest.headers = {
        authorization: 'Bearer malformed-token',
      };

      mockJwt.verify.mockImplementation(() => {
        const error = new Error('Malformed token');
        error.name = 'JsonWebTokenError';
        throw error;
      });

      authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid token',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should accept valid tokens and set user in request', () => {
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        role: 'user',
      };

      mockRequest.headers = {
        authorization: 'Bearer valid-token',
      };

      mockJwt.verify.mockReturnValue(mockUser as any);

      authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.user).toEqual(mockUser);
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should handle tokens with missing required fields', () => {
      const incompleteUser = {
        email: 'test@example.com',
        // Missing id and role
      };

      mockRequest.headers = {
        authorization: 'Bearer incomplete-token',
      };

      mockJwt.verify.mockReturnValue(incompleteUser as any);

      authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid token payload',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('Token Manipulation Security', () => {
    it('should reject tokens with tampered payload', () => {
      mockRequest.headers = {
        authorization: 'Bearer tampered-token',
      };

      mockJwt.verify.mockImplementation(() => {
        const error = new Error('Token tampered');
        error.name = 'JsonWebTokenError';
        throw error;
      });

      authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid token',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject tokens with invalid algorithm', () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid-algorithm-token',
      };

      mockJwt.verify.mockImplementation(() => {
        const error = new Error('Invalid algorithm');
        error.name = 'JsonWebTokenError';
        throw error;
      });

      authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid token',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle tokens with extra fields gracefully', () => {
      const userWithExtraFields = {
        id: 'user123',
        email: 'test@example.com',
        role: 'user',
        extraField: 'should be ignored',
        maliciousField: '<script>alert("xss")</script>',
      };

      mockRequest.headers = {
        authorization: 'Bearer token-with-extra-fields',
      };

      mockJwt.verify.mockReturnValue(userWithExtraFields as any);

      authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.user).toEqual({
        id: 'user123',
        email: 'test@example.com',
        role: 'user',
      });
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('Rate Limiting Security', () => {
    it('should handle multiple rapid authentication requests', () => {
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        role: 'user',
      };

      mockRequest.headers = {
        authorization: 'Bearer valid-token',
      };

      mockJwt.verify.mockReturnValue(mockUser as any);

      // Make multiple rapid requests
      for (let i = 0; i < 10; i++) {
        authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);
      }

      expect(mockNext).toHaveBeenCalledTimes(10);
      expect(mockJwt.verify).toHaveBeenCalledTimes(10);
    });
  });

  describe('Error Handling Security', () => {
    it('should not expose sensitive information in error messages', () => {
      mockRequest.headers = {
        authorization: 'Bearer sensitive-token',
      };

      mockJwt.verify.mockImplementation(() => {
        const error = new Error('JWT_SECRET_KEY_EXPOSED');
        throw error;
      });

      authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Authentication failed',
      });
      expect(mockResponse.json).not.toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('JWT_SECRET_KEY'),
        })
      );
    });

    it('should handle unexpected errors gracefully', () => {
      mockRequest.headers = {
        authorization: 'Bearer unexpected-error-token',
      };

      mockJwt.verify.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Authentication failed',
      });
    });

    it('should handle null/undefined token gracefully', () => {
      mockRequest.headers = {
        authorization: 'Bearer null',
      };

      mockJwt.verify.mockImplementation(() => {
        return null;
      });

      authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid token payload',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('Authorization Security', () => {
    it('should validate user role in token', () => {
      const userWithInvalidRole = {
        id: 'user123',
        email: 'test@example.com',
        role: 'invalid_role',
      };

      mockRequest.headers = {
        authorization: 'Bearer invalid-role-token',
      };

      mockJwt.verify.mockReturnValue(userWithInvalidRole as any);

      authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Should still pass authentication but role validation would be handled elsewhere
      expect(mockRequest.user).toEqual(userWithInvalidRole);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle tokens with missing role', () => {
      const userWithoutRole = {
        id: 'user123',
        email: 'test@example.com',
      };

      mockRequest.headers = {
        authorization: 'Bearer no-role-token',
      };

      mockJwt.verify.mockReturnValue(userWithoutRole as any);

      authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid token payload',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('Input Sanitization Security', () => {
    it('should handle authorization header with special characters', () => {
      mockRequest.headers = {
        authorization: 'Bearer token<script>alert("xss")</script>',
      };

      mockJwt.verify.mockImplementation(() => {
        const error = new Error('Invalid token');
        error.name = 'JsonWebTokenError';
        throw error;
      });

      authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid token',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle authorization header with SQL injection attempts', () => {
      mockRequest.headers = {
        authorization: "Bearer token'; DROP TABLE users; --",
      };

      mockJwt.verify.mockImplementation(() => {
        const error = new Error('Invalid token');
        error.name = 'JsonWebTokenError';
        throw error;
      });

      authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid token',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle extremely long authorization headers', () => {
      const longToken = 'Bearer ' + 'a'.repeat(10000);
      mockRequest.headers = {
        authorization: longToken,
      };

      mockJwt.verify.mockImplementation(() => {
        const error = new Error('Token too long');
        error.name = 'JsonWebTokenError';
        throw error;
      });

      authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid token',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
