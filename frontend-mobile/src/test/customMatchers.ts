import '@testing-library/jest-native/extend-expect';

// Custom matchers for MalPay mobile app tests
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidCardNumber(): R;
      toBeValidEmail(): R;
      toBeValidPhoneNumber(): R;
      toBeValidAmount(): R;
      toBeValidCurrency(): R;
      toBeValidDate(): R;
      toBeValidPIN(): R;
      toBeValidPassword(): R;
      toBeValidWalletAddress(): R;
      toBeValidTransactionId(): R;
    }
  }
}

// Card number validation matcher
expect.extend({
  toBeValidCardNumber(received: string) {
    const pass = /^\d{13,19}$/.test(received.replace(/\s/g, ''));
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid card number`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid card number`,
        pass: false,
      };
    }
  },
});

// Email validation matcher
expect.extend({
  toBeValidEmail(received: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const pass = emailRegex.test(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid email`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid email`,
        pass: false,
      };
    }
  },
});

// Phone number validation matcher
expect.extend({
  toBeValidPhoneNumber(received: string) {
    const phoneRegex = /^(\+234|234|0)?[789][01]\d{8}$/;
    const pass = phoneRegex.test(received.replace(/\s/g, ''));
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid phone number`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid phone number`,
        pass: false,
      };
    }
  },
});

// Amount validation matcher
expect.extend({
  toBeValidAmount(received: number) {
    const pass = typeof received === 'number' && received > 0 && !isNaN(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid amount`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid amount`,
        pass: false,
      };
    }
  },
});

// Currency validation matcher
expect.extend({
  toBeValidCurrency(received: string) {
    const validCurrencies = ['NGN', 'USD', 'EUR', 'GBP'];
    const pass = validCurrencies.includes(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid currency`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid currency`,
        pass: false,
      };
    }
  },
});

// Date validation matcher
expect.extend({
  toBeValidDate(received: string | Date) {
    const date = new Date(received);
    const pass = date instanceof Date && !isNaN(date.getTime());
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid date`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid date`,
        pass: false,
      };
    }
  },
});

// PIN validation matcher
expect.extend({
  toBeValidPIN(received: string) {
    const pass = /^\d{4,6}$/.test(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid PIN`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid PIN`,
        pass: false,
      };
    }
  },
});

// Password validation matcher
expect.extend({
  toBeValidPassword(received: string) {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    const pass = passwordRegex.test(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid password`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid password`,
        pass: false,
      };
    }
  },
});

// Wallet address validation matcher
expect.extend({
  toBeValidWalletAddress(received: string) {
    const pass = /^[A-Za-z0-9]{26,42}$/.test(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid wallet address`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid wallet address`,
        pass: false,
      };
    }
  },
});

// Transaction ID validation matcher
expect.extend({
  toBeValidTransactionId(received: string) {
    const pass = /^[A-Za-z0-9]{8,32}$/.test(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid transaction ID`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid transaction ID`,
        pass: false,
      };
    }
  },
});

export {};