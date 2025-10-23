import { CardEncryptionService } from '../src/services/CardEncryptionService';
import { PaymentService } from '../src/services/PaymentService';
import { CardChargingService } from '../src/services/CardChargingService';

describe('🧪 MalPay Core Functionality Tests', () => {
  describe('💳 CardEncryptionService Tests', () => {
    let cardService: CardEncryptionService;

    beforeEach(() => {
      cardService = new CardEncryptionService();
    });

    test('should validate Visa card numbers', () => {
      expect(cardService.validateCardNumber('4111111111111111')).toBe(true);
      expect(cardService.validateCardNumber('4532123456789013')).toBe(false);
    });

    test('should validate Mastercard numbers', () => {
      expect(cardService.validateCardNumber('5555555555554444')).toBe(true);
      expect(cardService.validateCardNumber('5555555555554445')).toBe(false);
    });

    test('should detect card types correctly', () => {
      expect(cardService.getCardType('4532123456789012')).toBe('visa');
      expect(cardService.getCardType('5555555555554444')).toBe('mastercard');
      expect(cardService.getCardType('378282246310005')).toBe('amex');
    });

    test('should mask card numbers properly', () => {
      expect(cardService.maskCardNumber('4532123456789012')).toBe('4532 **** **** 9012');
      expect(cardService.maskCardNumber('5555555555554444')).toBe('5555 **** **** 4444');
      expect(cardService.maskCardNumber('378282246310005')).toBe('3782 ****** 0005');
    });

    test('should encrypt and decrypt card numbers', () => {
      const cardNumber = '4532123456789012';
      const encrypted = cardService.encryptCardNumber(cardNumber);
      const decrypted = cardService.decryptCardNumber(encrypted);

      expect(encrypted).not.toBe(cardNumber);
      expect(decrypted).toBe(cardNumber);
    });

    test('should encrypt and decrypt CVV', () => {
      const cvv = '123';
      const encrypted = cardService.encryptCvv(cvv);
      const decrypted = cardService.decryptCvv(encrypted);

      expect(encrypted).not.toBe(cvv);
      expect(decrypted).toBe(cvv);
    });

    test('should validate expiry dates', () => {
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;
      
      expect(cardService.validateExpiryDate(currentMonth, currentYear)).toBe(true);
      expect(cardService.validateExpiryDate(12, currentYear + 1)).toBe(true);
      expect(cardService.validateExpiryDate(currentMonth - 1, currentYear)).toBe(false);
    });

    test('should validate CVV format', () => {
      expect(cardService.validateCvv('123', 'visa')).toBe(true);
      expect(cardService.validateCvv('1234', 'amex')).toBe(true);
      expect(cardService.validateCvv('12', 'visa')).toBe(false);
    });
  });

  describe('💰 PaymentService Tests', () => {
    let paymentService: PaymentService;

    beforeEach(() => {
      paymentService = new PaymentService();
    });

    test('should calculate MalPay charges correctly', () => {
      expect(paymentService['calculateMalpayCharge'](500)).toBe(0); // Below ₦1000
      expect(paymentService['calculateMalpayCharge'](2000)).toBe(2); // 0.1% of ₦2000
      expect(paymentService['calculateMalpayCharge'](3000000)).toBe(2000); // Capped at ₦2000
    });

    test('should handle edge cases for charge calculation', () => {
      expect(paymentService['calculateMalpayCharge'](0)).toBe(0);
      expect(paymentService['calculateMalpayCharge'](1000)).toBe(0);
      expect(paymentService['calculateMalpayCharge'](1001)).toBe(1.001);
    });
  });

  describe('💳 CardChargingService Tests', () => {
    let cardChargingService: CardChargingService;

    beforeEach(() => {
      cardChargingService = new CardChargingService();
    });

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

  describe('🔄 Integration Tests', () => {
    test('should process complete card addition flow', () => {
      const cardService = new CardEncryptionService();
      const cardChargingService = new CardChargingService();
      
      const cardNumber = '4111111111111111';
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
      expect(maskedCardNumber).toBe('4111 **** **** 1111');
    });

    test('should process complete transfer flow', () => {
      const paymentService = new PaymentService();
      
      const amount = 5000;
      const currency = 'NGN';
      
      // Calculate fees
      const malpayCharge = paymentService['calculateMalpayCharge'](amount);
      expect(malpayCharge).toBe(5); // 0.1% of 5000
      
      // Convert to USDT
      const amountUSDT = currency === 'NGN' ? amount / 1428.57 : amount;
      expect(amountUSDT).toBeCloseTo(3.5, 1);
    });
  });

  describe('🔒 Security Tests', () => {
    test('should not expose sensitive data', () => {
      const cardService = new CardEncryptionService();
      const cardNumber = '4532123456789012';
      
      const encrypted = cardService.encryptCardNumber(cardNumber);
      const masked = cardService.maskCardNumber(cardNumber);
      
      expect(encrypted).not.toContain(cardNumber);
      expect(masked).not.toContain('123456');
    });

    test('should validate input data', () => {
      const cardService = new CardEncryptionService();
      
      // Invalid card numbers should be rejected
      expect(cardService.validateCardNumber('1234567890123456')).toBe(false);
      expect(cardService.validateCardNumber('45321234567890')).toBe(false); // Too short (14 digits)
      
      // Invalid CVVs should be rejected
      expect(cardService.validateCvv('12', 'visa')).toBe(false);
      expect(cardService.validateCvv('12345', 'visa')).toBe(false);
    });
  });
});
