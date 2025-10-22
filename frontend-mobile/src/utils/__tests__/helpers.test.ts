import {
  formatCurrency,
  formatNumber,
  formatDate,
  formatDateTime,
  validateEmail,
  validatePassword,
  validatePIN,
  getStorageKey,
  isIOS,
  isAndroid,
  capitalizeFirst,
  truncateText,
  formatAmountForInput,
  parseAmountFromInput,
  formatRelativeTime,
} from '../helpers';

describe('Helper Functions', () => {
  describe('formatCurrency', () => {
    test('should format NGN currency correctly', () => {
      expect(formatCurrency(1234.56, 'NGN')).toBe('₦1,234.56');
      expect(formatCurrency(100, 'NGN')).toBe('₦100.00');
      expect(formatCurrency(0, 'NGN')).toBe('₦0.00');
    });

    test('should default to NGN currency when no currency specified', () => {
      expect(formatCurrency(100)).toBe('₦100.00');
      expect(formatCurrency(99.99)).toBe('₦99.99');
    });

    test('should format USD currency correctly', () => {
      expect(formatCurrency(100, 'USD')).toBe('$100.00');
      expect(formatCurrency(99.99, 'USD')).toBe('$99.99');
    });

    test('should format EUR currency correctly', () => {
      expect(formatCurrency(1234.56, 'EUR')).toBe('€1,234.56');
    });

    test('should format GBP currency correctly', () => {
      expect(formatCurrency(1234.56, 'GBP')).toBe('£1,234.56');
    });

    test('should handle unknown currency by defaulting to NGN', () => {
      expect(formatCurrency(123.45, 'XYZ')).toBe('₦123.45');
    });
  });

  describe('formatNumber', () => {
    test('should format numbers with default 2 decimal places', () => {
      expect(formatNumber(1234.567)).toBe('1,234.57');
      expect(formatNumber(100)).toBe('100.00');
    });

    test('should format numbers with custom decimal places', () => {
      expect(formatNumber(1234.567, 1)).toBe('1,234.6');
      expect(formatNumber(1234.567, 3)).toBe('1,234.567');
    });
  });

  describe('formatDate', () => {
    test('should format dates correctly', () => {
      const date = new Date('2023-12-25');
      expect(formatDate(date)).toBe('Dec 25, 2023');
    });

    test('should format date strings correctly', () => {
      expect(formatDate('2023-12-25')).toBe('Dec 25, 2023');
    });
  });

  describe('formatDateTime', () => {
    test('should format date and time correctly', () => {
      const date = new Date('2023-12-25T14:30:00');
      expect(formatDateTime(date)).toBe('Dec 25, 2023, 02:30 PM');
    });
  });

  describe('validateEmail', () => {
    test('should return true for valid emails', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name+tag@domain.co.uk')).toBe(true);
    });

    test('should return false for invalid emails', () => {
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('test@.com')).toBe(false);
      expect(validateEmail('test@com')).toBe(false);
      expect(validateEmail('')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    test('should return true for valid passwords', () => {
      expect(validatePassword('StrongP@ss1')).toBe(true);
      expect(validatePassword('AnotherP@ss2')).toBe(true);
    });

    test('should return false for passwords that are too short', () => {
      expect(validatePassword('Short1@')).toBe(false);
    });

    test('should return false for passwords missing uppercase', () => {
      expect(validatePassword('lowercase1@')).toBe(false);
    });

    test('should return false for passwords missing lowercase', () => {
      expect(validatePassword('UPPERCASE1@')).toBe(false);
    });

    test('should return false for passwords missing number', () => {
      expect(validatePassword('NoNumber@ss')).toBe(false);
    });

    test('should return false for passwords missing special character', () => {
      expect(validatePassword('NoSpecial123')).toBe(false);
    });
  });

  describe('validatePIN', () => {
    test('should return true for a valid 4-digit PIN', () => {
      expect(validatePIN('1234')).toBe(true);
      expect(validatePIN('0000')).toBe(true);
    });

    test('should return false for PINs with incorrect length', () => {
      expect(validatePIN('123')).toBe(false);
      expect(validatePIN('12345')).toBe(false);
      expect(validatePIN('')).toBe(false);
    });

    test('should return false for non-numeric PINs', () => {
      expect(validatePIN('abcd')).toBe(false);
      expect(validatePIN('12a4')).toBe(false);
    });
  });

  describe('getStorageKey', () => {
    test('should return the correct storage key format', () => {
      expect(getStorageKey('accessToken')).toBe('@MalPay:accessToken');
      expect(getStorageKey('userProfile')).toBe('@MalPay:userProfile');
    });
  });

  describe('Platform helpers', () => {
    test('should detect iOS platform', () => {
      expect(typeof isIOS()).toBe('boolean');
    });

    test('should detect Android platform', () => {
      expect(typeof isAndroid()).toBe('boolean');
    });
  });

  describe('String helpers', () => {
    test('should capitalize first letter', () => {
      expect(capitalizeFirst('hello')).toBe('Hello');
      expect(capitalizeFirst('HELLO')).toBe('Hello');
      expect(capitalizeFirst('hELLO')).toBe('Hello');
    });

    test('should truncate text correctly', () => {
      expect(truncateText('This is a long text', 10)).toBe('This is a ...');
      expect(truncateText('Short', 10)).toBe('Short');
    });
  });

  describe('Amount helpers', () => {
    test('should format amounts for input', () => {
      expect(formatAmountForInput(123.456)).toBe('123.46');
      expect(formatAmountForInput(100)).toBe('100.00');
    });

    test('should parse amounts from input', () => {
      expect(parseAmountFromInput('123.45')).toBe(123.45);
      expect(parseAmountFromInput('$123.45')).toBe(123.45);
      expect(parseAmountFromInput('invalid')).toBe(0);
    });
  });

  describe('Time helpers', () => {
    test('should format relative time correctly', () => {
      const now = new Date();
      const thirtySecondsAgo = new Date(now.getTime() - 30 * 1000);
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      expect(formatRelativeTime(thirtySecondsAgo)).toBe('Just now');
      expect(formatRelativeTime(oneHourAgo)).toMatch(/\d+h ago/);
      expect(formatRelativeTime(oneDayAgo)).toMatch(/\d+d ago/);
    });
  });
});