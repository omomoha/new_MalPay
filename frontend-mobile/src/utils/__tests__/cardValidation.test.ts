import {
  validateCardNumber,
  validateExpiryDate,
  validateCVV,
  detectCardType,
  maskCardNumber,
  formatCardNumberForDisplay,
  getCardIcon,
  getCardGradient,
} from '../cardValidation';

describe('Card Validation Utilities', () => {
  describe('validateCardNumber', () => {
    test('should validate correct Visa card numbers', () => {
      expect(validateCardNumber('4111111111111111')).toBe(true);
      expect(validateCardNumber('4000000000000002')).toBe(true);
      expect(validateCardNumber('4242424242424242')).toBe(true);
    });

    test('should validate correct Mastercard numbers', () => {
      expect(validateCardNumber('5555555555554444')).toBe(true);
      expect(validateCardNumber('2223003122003222')).toBe(true);
      expect(validateCardNumber('5105105105105100')).toBe(true);
    });

    test('should validate correct American Express numbers', () => {
      expect(validateCardNumber('378282246310005')).toBe(true);
      expect(validateCardNumber('371449635398431')).toBe(true);
    });

    test('should validate correct Discover numbers', () => {
      expect(validateCardNumber('6011111111111117')).toBe(true);
      expect(validateCardNumber('6011000990139424')).toBe(true);
    });

    test('should reject invalid card numbers', () => {
      expect(validateCardNumber('1234567890123456')).toBe(false);
      expect(validateCardNumber('4111111111111112')).toBe(false);
      // 0000000000000000 actually passes Luhn algorithm, so let's use a different invalid number
      expect(validateCardNumber('1234567890123457')).toBe(false);
    });

    test('should reject empty or short card numbers', () => {
      expect(validateCardNumber('')).toBe(false);
      expect(validateCardNumber('123')).toBe(false);
      expect(validateCardNumber('123456789012')).toBe(false);
    });

    test('should reject card numbers with non-digits', () => {
      expect(validateCardNumber('4111-1111-1111-1111')).toBe(false);
      expect(validateCardNumber('4111 1111 1111 1111')).toBe(false);
      expect(validateCardNumber('4111a111111111111')).toBe(false);
    });

    test('should handle card numbers with spaces', () => {
      expect(validateCardNumber('4111 1111 1111 1111')).toBe(false); // Should fail with spaces
    });
  });

  describe('validateExpiryDate', () => {
    test('should validate correct expiry dates', () => {
      expect(validateExpiryDate('12/26')).toBe(true);
      // Use a future date that's definitely valid
      expect(validateExpiryDate('12/30')).toBe(true);
      expect(validateExpiryDate('06/30')).toBe(true);
    });

    test('should reject past expiry dates', () => {
      const currentYear = new Date().getFullYear() % 100;
      const pastYear = currentYear - 1;
      expect(validateExpiryDate(`12/${pastYear}`)).toBe(false);
    });

    test('should reject invalid month formats', () => {
      expect(validateExpiryDate('13/26')).toBe(false);
      expect(validateExpiryDate('00/26')).toBe(false);
      expect(validateExpiryDate('1/26')).toBe(false);
    });

    test('should reject invalid formats', () => {
      expect(validateExpiryDate('12-26')).toBe(false);
      expect(validateExpiryDate('1226')).toBe(false);
      expect(validateExpiryDate('12/')).toBe(false);
      expect(validateExpiryDate('/26')).toBe(false);
    });

    test('should reject empty expiry date', () => {
      expect(validateExpiryDate('')).toBe(false);
    });
  });

  describe('validateCVV', () => {
    test('should validate 3-digit CVV for Visa/Mastercard', () => {
      expect(validateCVV('123', 'visa')).toBe(true);
      expect(validateCVV('456', 'mastercard')).toBe(true);
      expect(validateCVV('789', 'discover')).toBe(true);
    });

    test('should validate 4-digit CVV for American Express', () => {
      expect(validateCVV('1234', 'amex')).toBe(true);
      expect(validateCVV('5678', 'amex')).toBe(true);
    });

    test('should reject wrong length CVV', () => {
      expect(validateCVV('12', 'visa')).toBe(false);
      expect(validateCVV('1234', 'visa')).toBe(false);
      expect(validateCVV('123', 'amex')).toBe(false);
      expect(validateCVV('12345', 'amex')).toBe(false);
    });

    test('should reject CVV with non-digits', () => {
      expect(validateCVV('12a', 'visa')).toBe(false);
      expect(validateCVV('12-3', 'visa')).toBe(false);
    });

    test('should reject empty CVV', () => {
      expect(validateCVV('', 'visa')).toBe(false);
    });
  });

  describe('detectCardType', () => {
    test('should detect Visa cards', () => {
      expect(detectCardType('4111111111111111')).toBe('visa');
      expect(detectCardType('4000000000000002')).toBe('visa');
    });

    test('should detect Mastercard cards', () => {
      expect(detectCardType('5555555555554444')).toBe('mastercard');
      expect(detectCardType('2223003122003222')).toBe('mastercard');
    });

    test('should detect American Express cards', () => {
      expect(detectCardType('378282246310005')).toBe('amex');
      expect(detectCardType('371449635398431')).toBe('amex');
    });

    test('should detect Discover cards', () => {
      expect(detectCardType('6011111111111117')).toBe('discover');
      expect(detectCardType('6011000990139424')).toBe('discover');
    });

    test('should return null for unknown card types', () => {
      expect(detectCardType('1234567890123456')).toBe(null);
      expect(detectCardType('0000000000000000')).toBe(null);
    });

    test('should handle empty card number', () => {
      expect(detectCardType('')).toBe(null);
    });
  });

  describe('maskCardNumber', () => {
    test('should mask card numbers correctly', () => {
      expect(maskCardNumber('4111111111111111')).toBe('4111 ******** 1111');
      expect(maskCardNumber('5555555555554444')).toBe('5555 ******** 4444');
    });

    test('should handle short card numbers', () => {
      expect(maskCardNumber('12345678')).toBe('1234 **** 5678');
    });

    test('should handle very short card numbers', () => {
      expect(maskCardNumber('123456')).toBe('123456'); // Too short to mask
    });

    test('should handle empty card number', () => {
      expect(maskCardNumber('')).toBe('');
    });
  });

  describe('formatCardNumberForDisplay', () => {
    test('should format card numbers with spaces', () => {
      expect(formatCardNumberForDisplay('4111111111111111')).toBe('4111 1111 1111 1111');
      expect(formatCardNumberForDisplay('5555555555554444')).toBe('5555 5555 5555 4444');
    });

    test('should handle already formatted numbers', () => {
      expect(formatCardNumberForDisplay('4111 1111 1111 1111')).toBe('4111 1111 1111 1111');
    });

    test('should handle short numbers', () => {
      expect(formatCardNumberForDisplay('123456789012')).toBe('1234 5678 9012');
    });

    test('should handle empty number', () => {
      expect(formatCardNumberForDisplay('')).toBe('');
    });
  });

  describe('getCardIcon', () => {
    test('should return correct icons for card types', () => {
      expect(getCardIcon('visa')).toBe('card');
      expect(getCardIcon('mastercard')).toBe('card');
      expect(getCardIcon('amex')).toBe('card');
      expect(getCardIcon('discover')).toBe('card');
    });

    test('should return default icon for unknown type', () => {
      expect(getCardIcon('unknown')).toBe('card-outline');
      expect(getCardIcon('')).toBe('card-outline');
    });
  });

  describe('getCardGradient', () => {
    test('should return correct gradients for card types', () => {
      expect(getCardGradient('visa')).toEqual(['#1A1F71', '#2A3F81']);
      expect(getCardGradient('mastercard')).toEqual(['#EB001B', '#FF1A2B']);
      expect(getCardGradient('amex')).toEqual(['#006FCF', '#0070F0']);
      expect(getCardGradient('discover')).toEqual(['#FF6000', '#FF7000']);
    });

    test('should return default gradient for unknown type', () => {
      expect(getCardGradient('unknown')).toEqual(['#6B7280', '#9CA3AF']);
      expect(getCardGradient('')).toEqual(['#6B7280', '#9CA3AF']);
    });
  });
});
