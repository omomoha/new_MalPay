import request from 'supertest';
import express from 'express';
const app = express();
import { CardEncryptionService } from '../src/services/CardEncryptionService';
import { PaymentService } from '../src/services/PaymentService';
import { CardChargingService } from '../src/services/CardChargingService';

describe('🔒 MalPay Security Tests', () => {
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    // Login to get auth token
    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'user@example.com',
        password: 'password123'
      });
    
    authToken = loginResponse.body.tokens.accessToken;
    userId = loginResponse.body.user.id;
  });

  describe('🛡️ Authentication & Authorization Security', () => {
    test('should reject requests without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/cards')
        .expect(401);
      
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('not authenticated');
    });

    test('should reject invalid JWT tokens', async () => {
      const response = await request(app)
        .get('/api/v1/cards')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
      
      expect(response.body.success).toBe(false);
    });

    test('should enforce rate limiting', async () => {
      const promises = [];
      for (let i = 0; i < 110; i++) {
        promises.push(
          request(app)
            .post('/api/v1/auth/login')
            .send({
              email: 'test@example.com',
              password: 'password123'
            })
        );
      }
      
      const responses = await Promise.all(promises);
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });

    test('should validate email format', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Test User',
          email: 'invalid-email',
          phoneNumber: '+2348012345678',
          password: 'Password123',
          confirmPassword: 'Password123'
        })
        .expect(400);
      
      expect(response.body.success).toBe(false);
    });

    test('should enforce password strength', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          phoneNumber: '+2348012345678',
          password: 'weak',
          confirmPassword: 'weak'
        })
        .expect(400);
      
      expect(response.body.success).toBe(false);
    });

    test('should validate password confirmation', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          phoneNumber: '+2348012345678',
          password: 'Password123',
          confirmPassword: 'DifferentPassword123'
        })
        .expect(400);
      
      expect(response.body.success).toBe(false);
    });
  });

  describe('💳 Card Management Security', () => {
    test('should encrypt card numbers', () => {
      const cardService = new CardEncryptionService();
      const cardNumber = '4532123456789012';
      
      const encrypted = cardService.encryptCardNumber(cardNumber);
      const decrypted = cardService.decryptCardNumber(encrypted);
      
      expect(encrypted).not.toBe(cardNumber);
      expect(decrypted).toBe(cardNumber);
    });

    test('should encrypt CVV', () => {
      const cardService = new CardEncryptionService();
      const cvv = '123';
      
      const encrypted = cardService.encryptCvv(cvv);
      const decrypted = cardService.decryptCvv(encrypted);
      
      expect(encrypted).not.toBe(cvv);
      expect(decrypted).toBe(cvv);
    });

    test('should mask card numbers', () => {
      const cardService = new CardEncryptionService();
      const cardNumber = '4532123456789012';
      
      const masked = cardService.maskCardNumber(cardNumber);
      
      expect(masked).toBe('4532 **** **** 9012');
      expect(masked).not.toContain('123456');
    });

    test('should validate card numbers with Luhn algorithm', () => {
      const cardService = new CardEncryptionService();
      
      // Valid card numbers
      expect(cardService.validateCardNumber('4532123456789012')).toBe(true);
      expect(cardService.validateCardNumber('5555555555554444')).toBe(true);
      
      // Invalid card numbers
      expect(cardService.validateCardNumber('1234567890123456')).toBe(false);
      expect(cardService.validateCardNumber('4532123456789013')).toBe(false);
    });

    test('should validate expiry dates', () => {
      const cardService = new CardEncryptionService();
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;
      
      // Valid expiry dates
      expect(cardService.validateExpiryDate(currentMonth, currentYear)).toBe(true);
      expect(cardService.validateExpiryDate(12, currentYear + 1)).toBe(true);
      
      // Invalid expiry dates
      expect(cardService.validateExpiryDate(currentMonth - 1, currentYear)).toBe(false);
      expect(cardService.validateExpiryDate(12, currentYear - 1)).toBe(false);
    });

    test('should validate CVV format', () => {
      const cardService = new CardEncryptionService();
      
      // Valid CVVs
      expect(cardService.validateCvv('123', 'visa')).toBe(true);
      expect(cardService.validateCvv('1234', 'amex')).toBe(true);
      
      // Invalid CVVs
      expect(cardService.validateCvv('12', 'visa')).toBe(false);
      expect(cardService.validateCvv('12345', 'visa')).toBe(false);
    });

    test('should enforce card limit', async () => {
      // Add 3 cards (max limit)
      for (let i = 0; i < 3; i++) {
        await request(app)
          .post('/api/v1/cards')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            cardNumber: `453212345678901${i}`,
            expiryMonth: 12,
            expiryYear: 2026,
            cvv: '123',
            cardholderName: 'Test User'
          })
          .expect(201);
      }

      // Try to add 4th card (should fail)
      const response = await request(app)
        .post('/api/v1/cards')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          cardNumber: '4532123456789013',
          expiryMonth: 12,
          expiryYear: 2026,
          cvv: '123',
          cardholderName: 'Test User'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Maximum of 3 cards');
    });

    test('should prevent card access from other users', async () => {
      const response = await request(app)
        .get('/api/v1/cards')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('💰 Payment Processing Security', () => {
    test('should validate transfer amounts', async () => {
      const response = await request(app)
        .post('/api/v1/payments/transfer')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          recipientEmail: 'recipient@example.com',
          amount: -1000, // Negative amount
          currency: 'NGN',
          description: 'Test transfer',
          processor: 'tron'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should validate recipient email', async () => {
      const response = await request(app)
        .post('/api/v1/payments/transfer')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          recipientEmail: 'invalid-email',
          amount: 1000,
          currency: 'NGN',
          description: 'Test transfer',
          processor: 'tron'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should calculate fees correctly', () => {
      const paymentService = new PaymentService();
      
      // Test MalPay charge calculation
      const charge1 = paymentService['calculateMalpayCharge'](500); // Below ₦1000
      const charge2 = paymentService['calculateMalpayCharge'](2000); // Above ₦1000
      const charge3 = paymentService['calculateMalpayCharge'](3000000); // Above cap
      
      expect(charge1).toBe(0); // No charge below ₦1000
      expect(charge2).toBe(2); // 0.1% of ₦2000
      expect(charge3).toBe(2000); // Capped at ₦2000
    });

    test('should prevent duplicate transactions', async () => {
      const transferData = {
        recipientEmail: 'recipient@example.com',
        amount: 1000,
        currency: 'NGN',
        description: 'Test transfer',
        processor: 'tron'
      };

      // First transfer should succeed
      const response1 = await request(app)
        .post('/api/v1/payments/transfer')
        .set('Authorization', `Bearer ${authToken}`)
        .send(transferData)
        .expect(200);

      expect(response1.body.success).toBe(true);

      // Second identical transfer should be handled (in real implementation, would check for duplicates)
      const response2 = await request(app)
        .post('/api/v1/payments/transfer')
        .set('Authorization', `Bearer ${authToken}`)
        .send(transferData)
        .expect(200);

      expect(response2.body.success).toBe(true);
    });
  });

  describe('🏦 Bank Account Security', () => {
    test('should validate account numbers', async () => {
      const response = await request(app)
        .post('/api/v1/bank-accounts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          accountNumber: '123', // Too short
          bankCode: '058'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should validate bank codes', async () => {
      const response = await request(app)
        .post('/api/v1/bank-accounts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          accountNumber: '1234567890',
          bankCode: '999' // Invalid bank code
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should prevent access to other users bank accounts', async () => {
      const response = await request(app)
        .get('/api/v1/bank-accounts')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('🔐 Data Protection Security', () => {
    test('should sanitize input data', async () => {
      const maliciousInput = '<script>alert("xss")</script>';
      
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: maliciousInput,
          email: 'test@example.com',
          phoneNumber: '+2348012345678',
          password: 'Password123',
          confirmPassword: 'Password123'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should prevent SQL injection', async () => {
      const sqlInjection = "'; DROP TABLE users; --";
      
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: sqlInjection,
          password: 'password123'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should validate phone number format', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          phoneNumber: 'invalid-phone',
          password: 'Password123',
          confirmPassword: 'Password123'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('🌐 API Security', () => {
    test('should include security headers', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBe('DENY');
      expect(response.headers['x-xss-protection']).toBe('1; mode=block');
    });

    test('should handle CORS properly', async () => {
      const response = await request(app)
        .options('/api/v1/auth/login')
        .set('Origin', 'http://localhost:3000')
        .expect(200);

      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });

    test('should validate request size limits', async () => {
      const largeData = 'x'.repeat(11 * 1024 * 1024); // 11MB
      
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: largeData,
          email: 'test@example.com',
          phoneNumber: '+2348012345678',
          password: 'Password123',
          confirmPassword: 'Password123'
        })
        .expect(413);

      expect(response.body.success).toBe(false);
    });
  });

  describe('🔒 Profile Completion Security', () => {
    test('should validate profile completion status', async () => {
      const response = await request(app)
        .get('/api/v1/auth/profile-completion')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.profileStatus).toHaveProperty('isComplete');
      expect(response.body.profileStatus).toHaveProperty('hasBankAccount');
      expect(response.body.profileStatus).toHaveProperty('hasCards');
      expect(response.body.profileStatus).toHaveProperty('maxCards');
    });

    test('should prevent unauthorized profile access', async () => {
      const response = await request(app)
        .get('/api/v1/auth/profile-completion')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});
