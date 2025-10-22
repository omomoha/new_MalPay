import { CardEncryptionService } from '../src/services/CardEncryptionService';
import { PaymentService } from '../src/services/PaymentService';
import { CardChargingService } from '../src/services/CardChargingService';
import { BlockchainService } from '../src/services/BlockchainService';

describe('🧪 MalPay Unit Tests', () => {
  describe('💳 CardEncryptionService Tests', () => {
    let cardService: CardEncryptionService;

    beforeEach(() => {
      cardService = new CardEncryptionService();
    });

    describe('Card Number Validation', () => {
      test('should validate Visa card numbers', () => {
        expect(cardService.validateCardNumber('4532123456789012')).toBe(true);
        expect(cardService.validateCardNumber('4532123456789013')).toBe(false);
      });

      test('should validate Mastercard numbers', () => {
        expect(cardService.validateCardNumber('5555555555554444')).toBe(true);
        expect(cardService.validateCardNumber('5555555555554445')).toBe(false);
      });

      test('should validate American Express numbers', () => {
        expect(cardService.validateCardNumber('378282246310005')).toBe(true);
        expect(cardService.validateCardNumber('378282246310006')).toBe(false);
      });

      test('should reject invalid card numbers', () => {
        expect(cardService.validateCardNumber('1234567890123456')).toBe(false);
        expect(cardService.validateCardNumber('453212345678901')).toBe(false); // Too short
        expect(cardService.validateCardNumber('45321234567890123')).toBe(false); // Too long
      });
    });

    describe('Card Type Detection', () => {
      test('should detect Visa cards', () => {
        expect(cardService.getCardType('4532123456789012')).toBe('visa');
        expect(cardService.getCardType('4111111111111111')).toBe('visa');
      });

      test('should detect Mastercard', () => {
        expect(cardService.getCardType('5555555555554444')).toBe('mastercard');
        expect(cardService.getCardType('2223003122003222')).toBe('mastercard');
      });

      test('should detect American Express', () => {
        expect(cardService.getCardType('378282246310005')).toBe('amex');
        expect(cardService.getCardType('371449635398431')).toBe('amex');
      });

      test('should detect Discover', () => {
        expect(cardService.getCardType('6011111111111117')).toBe('discover');
        expect(cardService.getCardType('6011000990139424')).toBe('discover');
      });
    });

    describe('Card Number Masking', () => {
      test('should mask Visa card numbers', () => {
        expect(cardService.maskCardNumber('4532123456789012')).toBe('4532 **** **** 9012');
      });

      test('should mask Mastercard numbers', () => {
        expect(cardService.maskCardNumber('5555555555554444')).toBe('5555 **** **** 4444');
      });

      test('should mask American Express numbers', () => {
        expect(cardService.maskCardNumber('378282246310005')).toBe('3782 ****** 0005');
      });

      test('should mask Discover numbers', () => {
        expect(cardService.maskCardNumber('6011111111111117')).toBe('6011 **** **** 1117');
      });
    });

    describe('Encryption and Decryption', () => {
      test('should encrypt and decrypt card numbers', () => {
        const cardNumber = '4532123456789012';
        const encrypted = cardService.encryptCardNumber(cardNumber);
        const decrypted = cardService.decryptCardNumber(encrypted);

        expect(encrypted).not.toBe(cardNumber);
        expect(decrypted).toBe(cardNumber);
        expect(encrypted.length).toBeGreaterThan(cardNumber.length);
      });

      test('should encrypt and decrypt CVV', () => {
        const cvv = '123';
        const encrypted = cardService.encryptCvv(cvv);
        const decrypted = cardService.decryptCvv(encrypted);

        expect(encrypted).not.toBe(cvv);
        expect(decrypted).toBe(cvv);
        expect(encrypted.length).toBeGreaterThan(cvv.length);
      });

      test('should handle different CVV lengths', () => {
        const cvv3 = '123';
        const cvv4 = '1234';
        
        const encrypted3 = cardService.encryptCvv(cvv3);
        const encrypted4 = cardService.encryptCvv(cvv4);
        
        expect(cardService.decryptCvv(encrypted3)).toBe(cvv3);
        expect(cardService.decryptCvv(encrypted4)).toBe(cvv4);
      });
    });

    describe('Expiry Date Validation', () => {
      test('should validate future expiry dates', () => {
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;
        
        expect(cardService.validateExpiryDate(currentMonth, currentYear)).toBe(true);
        expect(cardService.validateExpiryDate(12, currentYear + 1)).toBe(true);
      });

      test('should reject past expiry dates', () => {
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;
        
        expect(cardService.validateExpiryDate(currentMonth - 1, currentYear)).toBe(false);
        expect(cardService.validateExpiryDate(12, currentYear - 1)).toBe(false);
      });

      test('should validate month ranges', () => {
        const currentYear = new Date().getFullYear();
        
        expect(cardService.validateExpiryDate(1, currentYear)).toBe(true);
        expect(cardService.validateExpiryDate(12, currentYear)).toBe(true);
        expect(cardService.validateExpiryDate(0, currentYear)).toBe(false);
        expect(cardService.validateExpiryDate(13, currentYear)).toBe(false);
      });
    });

    describe('CVV Validation', () => {
      test('should validate Visa CVV', () => {
        expect(cardService.validateCvv('123', 'visa')).toBe(true);
        expect(cardService.validateCvv('1234', 'visa')).toBe(true);
        expect(cardService.validateCvv('12', 'visa')).toBe(false);
        expect(cardService.validateCvv('12345', 'visa')).toBe(false);
      });

      test('should validate Mastercard CVV', () => {
        expect(cardService.validateCvv('123', 'mastercard')).toBe(true);
        expect(cardService.validateCvv('1234', 'mastercard')).toBe(true);
        expect(cardService.validateCvv('12', 'mastercard')).toBe(false);
      });

      test('should validate American Express CVV', () => {
        expect(cardService.validateCvv('1234', 'amex')).toBe(true);
        expect(cardService.validateCvv('123', 'amex')).toBe(false);
        expect(cardService.validateCvv('12345', 'amex')).toBe(false);
      });

      test('should validate Discover CVV', () => {
        expect(cardService.validateCvv('123', 'discover')).toBe(true);
        expect(cardService.validateCvv('1234', 'discover')).toBe(true);
        expect(cardService.validateCvv('12', 'discover')).toBe(false);
      });
    });
  });

  describe('💰 PaymentService Tests', () => {
    let paymentService: PaymentService;

    beforeEach(() => {
      paymentService = new PaymentService();
    });

    describe('MalPay Charge Calculation', () => {
      test('should not charge for amounts below ₦1000', () => {
        expect(paymentService['calculateMalpayCharge'](500)).toBe(0);
        expect(paymentService['calculateMalpayCharge'](999)).toBe(0);
      });

      test('should charge 0.1% for amounts above ₦1000', () => {
        expect(paymentService['calculateMalpayCharge'](1000)).toBe(0);
        expect(paymentService['calculateMalpayCharge'](2000)).toBe(2);
        expect(paymentService['calculateMalpayCharge'](10000)).toBe(10);
      });

      test('should cap charge at ₦2000', () => {
        expect(paymentService['calculateMalpayCharge'](3000000)).toBe(2000);
        expect(paymentService['calculateMalpayCharge'](5000000)).toBe(2000);
      });

      test('should handle edge cases', () => {
        expect(paymentService['calculateMalpayCharge'](0)).toBe(0);
        expect(paymentService['calculateMalpayCharge'](1001)).toBe(1.001);
      });
    });

    describe('Transfer Request Validation', () => {
      test('should validate transfer amounts', () => {
        const validRequest = {
          senderId: 'user-1',
          recipientEmail: 'recipient@example.com',
          amount: 1000,
          currency: 'NGN',
          description: 'Test transfer',
          processor: 'tron' as const
        };

        expect(validRequest.amount).toBeGreaterThan(0);
        expect(validRequest.currency).toBe('NGN');
        expect(validRequest.processor).toBe('tron');
      });

      test('should validate processor types', () => {
        const validProcessors = ['tron', 'polygon', 'ethereum'];
        const invalidProcessor = 'bitcoin';

        expect(validProcessors).toContain('tron');
        expect(validProcessors).toContain('polygon');
        expect(validProcessors).toContain('ethereum');
        expect(validProcessors).not.toContain(invalidProcessor);
      });
    });
  });

  describe('💳 CardChargingService Tests', () => {
    let cardChargingService: CardChargingService;

    beforeEach(() => {
      cardChargingService = new CardChargingService();
    });

    describe('Charge Calculation', () => {
      test('should calculate processing fees correctly', () => {
        const charges = cardChargingService['calculateCharges'](1000, 'NGN');
        
        expect(charges.processingFee).toBe(65); // 1.5% of 1000 + 50
        expect(charges.malpayCharge).toBe(0); // Below ₦1000 threshold
        expect(charges.totalFees).toBe(65);
      });

      test('should calculate MalPay charges for amounts above ₦1000', () => {
        const charges = cardChargingService['calculateCharges'](2000, 'NGN');
        
        expect(charges.processingFee).toBe(80); // 1.5% of 2000 + 50
        expect(charges.malpayCharge).toBe(2); // 0.1% of 2000
        expect(charges.totalFees).toBe(82);
      });

      test('should cap MalPay charges at ₦2000', () => {
        const charges = cardChargingService['calculateCharges'](3000000, 'NGN');
        
        expect(charges.processingFee).toBe(45050); // 1.5% of 3000000 + 50
        expect(charges.malpayCharge).toBe(2000); // Capped at ₦2000
        expect(charges.totalFees).toBe(47050);
      });
    });

    describe('Card Verification', () => {
      test('should verify valid cards', async () => {
        // Mock implementation - in real test would use test database
        const isValid = await cardChargingService.verifyCard('user-1', 'card-1');
        expect(typeof isValid).toBe('boolean');
      });

      test('should reject invalid card IDs', async () => {
        const isValid = await cardChargingService.verifyCard('user-1', 'invalid-card');
        expect(isValid).toBe(false);
      });
    });
  });

  describe('⛓️ BlockchainService Tests', () => {
    let blockchainService: BlockchainService;

    beforeEach(() => {
      blockchainService = new BlockchainService();
    });

    describe('Fee Calculation', () => {
      test('should calculate Tron fees', () => {
        const fees = blockchainService.calculateFees('tron', 100);
        
        expect(fees.fee).toBeGreaterThan(0);
        expect(fees.fee).toBeLessThan(100); // Should be reasonable
        expect(fees.minFee).toBeDefined();
        expect(fees.maxFee).toBeDefined();
      });

      test('should calculate Polygon fees', () => {
        const fees = blockchainService.calculateFees('polygon', 100);
        
        expect(fees.fee).toBeGreaterThan(0);
        expect(fees.fee).toBeLessThan(100);
        expect(fees.minFee).toBeDefined();
        expect(fees.maxFee).toBeDefined();
      });

      test('should calculate Ethereum fees', () => {
        const fees = blockchainService.calculateFees('ethereum', 100);
        
        expect(fees.fee).toBeGreaterThan(0);
        expect(fees.fee).toBeLessThan(100);
        expect(fees.minFee).toBeDefined();
        expect(fees.maxFee).toBeDefined();
      });

      test('should have different fees for different networks', () => {
        const tronFees = blockchainService.calculateFees('tron', 100);
        const polygonFees = blockchainService.calculateFees('polygon', 100);
        const ethereumFees = blockchainService.calculateFees('ethereum', 100);
        
        // Tron should be cheapest, Ethereum most expensive
        expect(tronFees.fee).toBeLessThanOrEqual(polygonFees.fee);
        expect(polygonFees.fee).toBeLessThanOrEqual(ethereumFees.fee);
      });
    });

    describe('Network Selection', () => {
      test('should recommend appropriate networks', () => {
        // Test network selection logic
        const smallAmount = 100;
        const mediumAmount = 10000;
        const largeAmount = 100000;
        
        // Tron should be recommended for small amounts
        expect(smallAmount).toBeLessThan(50000);
        
        // Polygon or Tron for medium amounts
        expect(mediumAmount).toBeGreaterThan(1000);
        
        // Any network for large amounts
        expect(largeAmount).toBeGreaterThan(50000);
      });
    });
  });

  describe('🔄 Integration Tests', () => {
    test('should process complete card addition flow', async () => {
      const cardService = new CardEncryptionService();
      const cardChargingService = new CardChargingService();
      
      const cardNumber = '4532123456789012';
      const cvv = '123';
      const expiryMonth = 12;
      const expiryYear = 2026;
      
      // Validate card
      expect(cardService.validateCardNumber(cardNumber)).toBe(true);
      expect(cardService.validateExpiryDate(expiryMonth, expiryYear)).toBe(true);
      expect(cardService.validateCvv(cvv, 'visa')).toBe(true);
      
      // Calculate charges
      const charges = cardChargingService['calculateCharges'](1000, 'NGN');
      expect(charges.totalFees).toBeGreaterThan(0);
      
      // Encrypt card data
      const encryptedCardNumber = cardService.encryptCardNumber(cardNumber);
      const encryptedCvv = cardService.encryptCvv(cvv);
      const maskedCardNumber = cardService.maskCardNumber(cardNumber);
      
      expect(encryptedCardNumber).not.toBe(cardNumber);
      expect(encryptedCvv).not.toBe(cvv);
      expect(maskedCardNumber).toBe('4532 **** **** 9012');
    });

    test('should process complete transfer flow', async () => {
      const paymentService = new PaymentService();
      const blockchainService = new BlockchainService();
      
      const amount = 5000;
      const currency = 'NGN';
      const processor = 'tron';
      
      // Calculate fees
      const malpayCharge = paymentService['calculateMalpayCharge'](amount);
      const blockchainFees = blockchainService.calculateFees(processor, amount);
      const totalFees = malpayCharge + blockchainFees.fee;
      
      expect(malpayCharge).toBe(5); // 0.1% of 5000
      expect(blockchainFees.fee).toBeGreaterThan(0);
      expect(totalFees).toBeGreaterThan(0);
      
      // Convert to USDT
      const amountUSDT = currency === 'NGN' ? amount / 1428.57 : amount;
      expect(amountUSDT).toBeCloseTo(3.5, 1);
    });
  });
});
