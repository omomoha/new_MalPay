import { MastercardBalanceService } from '../services/MastercardBalanceService';
import { CardBalanceService } from '../services/CardBalanceService';

describe('Mastercard Balance Service', () => {
  let mastercardService: MastercardBalanceService;

  beforeEach(() => {
    mastercardService = new MastercardBalanceService();
  });

  describe('validateMastercardNumber', () => {
    it('should validate Mastercard numbers correctly', () => {
      // Valid Mastercard numbers
      expect(mastercardService.validateMastercardNumber('5555555555554444')).toBe(true);
      expect(mastercardService.validateMastercardNumber('2223003122003222')).toBe(true);
      
      // Invalid Mastercard numbers
      expect(mastercardService.validateMastercardNumber('4111111111111111')).toBe(false); // Visa
      expect(mastercardService.validateMastercardNumber('1234567890123456')).toBe(false); // Invalid
      expect(mastercardService.validateMastercardNumber('555555555555444')).toBe(false); // Too short
    });
  });

  describe('checkAccountBalance', () => {
    it('should return mock balance for development', async () => {
      const request = {
        cardNumber: '5555555555554444',
        expiryMonth: '12',
        expiryYear: '2025',
        cvv: '123',
        cardholderName: 'John Doe',
      };

      const result = await mastercardService.checkAccountBalance(request);

      expect(result.status).toBe('success');
      expect(result.accountBalance).toBeDefined();
      expect(result.accountBalance.availableBalance).toBeGreaterThan(0);
      expect(result.accountBalance.currency).toBe('NGN');
    });

    it('should reject non-Mastercard cards', async () => {
      const request = {
        cardNumber: '4111111111111111', // Visa
        expiryMonth: '12',
        expiryYear: '2025',
        cvv: '123',
        cardholderName: 'John Doe',
      };

      await expect(mastercardService.checkAccountBalance(request))
        .rejects.toThrow('Only Mastercard cards are supported for balance checking');
    });
  });
});

describe('Card Balance Service', () => {
  let cardBalanceService: CardBalanceService;

  beforeEach(() => {
    cardBalanceService = new CardBalanceService();
  });

  describe('maskCardNumber', () => {
    it('should mask card numbers correctly', () => {
      const masked = cardBalanceService['maskCardNumber']('5555555555554444');
      expect(masked).toBe('5555 **** **** 4444');
    });

    it('should handle short card numbers', () => {
      const masked = cardBalanceService['maskCardNumber']('1234');
      expect(masked).toBe('1234');
    });
  });

  describe('encryptBalanceData', () => {
    it('should encrypt balance data', () => {
      const balanceData = {
        balance: 1000,
        currency: 'NGN',
        accountNumber: '1234567890',
        lastUpdated: '2024-01-01T00:00:00Z',
      };

      const encrypted = cardBalanceService['encryptBalanceData'](balanceData);
      expect(encrypted).toBeDefined();
      expect(encrypted).toContain(':');
    });

    it('should decrypt balance data correctly', () => {
      const balanceData = {
        balance: 1000,
        currency: 'NGN',
        accountNumber: '1234567890',
        lastUpdated: '2024-01-01T00:00:00Z',
      };

      const encrypted = cardBalanceService['encryptBalanceData'](balanceData);
      const decrypted = cardBalanceService['decryptBalanceData'](encrypted);
      
      expect(decrypted).toEqual(balanceData);
    });
  });
});
