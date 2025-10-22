import { jest } from '@jest/globals';

// Mock external dependencies
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('nodemailer');

// Global test setup
beforeAll(() => {
  console.log('🧪 Starting MalPay Test Suite...');
});

afterAll(() => {
  console.log('✅ MalPay Test Suite Completed');
});

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
