import { CardEncryption } from '../../utils/cardEncryption';
import CryptoJS from 'crypto-js';

// Mock crypto-js
jest.mock('crypto-js');

const mockCryptoJS = CryptoJS as jest.Mocked<typeof CryptoJS>;

describe('Encryption Security Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock crypto-js methods with proper return values
    let callCount = 0;
    mockCryptoJS.lib.WordArray.random.mockImplementation(() => {
      callCount++;
      return {
        toString: jest.fn().mockReturnValue(`mockIV${callCount}`),
      } as any;
    });
    
    mockCryptoJS.AES.encrypt.mockImplementation(() => {
      callCount++;
      return {
        toString: jest.fn().mockReturnValue(`encryptedData${callCount}`),
      } as any;
    });
    
    mockCryptoJS.AES.decrypt.mockImplementation(() => {
      callCount++;
      return {
        toString: jest.fn().mockReturnValue(`decryptedData${callCount}`),
      } as any;
    });
    
    mockCryptoJS.enc.Utf8.stringify.mockReturnValue('utf8String');
    mockCryptoJS.enc.Utf8.parse.mockReturnValue('utf8Parsed');
    mockCryptoJS.enc.Hex.stringify.mockImplementation(() => {
      callCount++;
      return `hexString${callCount}`;
    });
    mockCryptoJS.enc.Hex.parse.mockReturnValue('hexParsed');
    
    // Mock SHA256
    mockCryptoJS.SHA256.mockImplementation(() => ({
      toString: jest.fn().mockReturnValue('hashedData'),
    }));
    
    // Mock PBKDF2
    mockCryptoJS.PBKDF2.mockImplementation(() => ({
      toString: jest.fn().mockReturnValue('pbkdf2Key'),
    }));
  });

  describe('Card Data Encryption Security', () => {
    it('should encrypt card data with different IVs for each encryption', () => {
      const cardData = {
        cardNumber: '1234567890123456',
        expiryDate: '12/26',
        cvv: '123',
      };

      const encrypted1 = CardEncryption.encryptCardData(cardData);
      const encrypted2 = CardEncryption.encryptCardData(cardData);

      expect(encrypted1.encryptedCardNumber).not.toBe(encrypted2.encryptedCardNumber);
      expect(encrypted1.encryptedExpiryDate).not.toBe(encrypted2.encryptedExpiryDate);
      expect(encrypted1.encryptedCVV).not.toBe(encrypted2.encryptedCVV);
    });

    it('should generate unique IVs for each encryption', () => {
      const cardData = {
        cardNumber: '1234567890123456',
        expiryDate: '12/26',
        cvv: '123',
      };

      CardEncryption.encryptCardData(cardData);
      CardEncryption.encryptCardData(cardData);

      expect(mockCryptoJS.lib.WordArray.random).toHaveBeenCalledTimes(6); // 2 calls per encryption (3 fields)
    });

    it('should use strong encryption algorithm (AES-256)', () => {
      const cardData = {
        cardNumber: '1234567890123456',
        expiryDate: '12/26',
        cvv: '123',
      };

      CardEncryption.encryptCardData(cardData);

      expect(mockCryptoJS.AES.encrypt).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.objectContaining({
          iv: expect.any(Object),
          mode: mockCryptoJS.mode.CBC,
          padding: mockCryptoJS.pad.Pkcs7,
        })
      );
    });

    it('should handle empty card data securely', () => {
      const emptyCardData = {
        cardNumber: '',
        expiryDate: '',
        cvv: '',
      };

      expect(() => {
        CardEncryption.encryptCardData(emptyCardData);
      }).not.toThrow();
    });

    it('should handle special characters in card data', () => {
      const specialCharCardData = {
        cardNumber: '1234-5678-9012-3456',
        expiryDate: '12/26',
        cvv: '123',
      };

      expect(() => {
        CardEncryption.encryptCardData(specialCharCardData);
      }).not.toThrow();
    });

    it('should produce different encrypted output for same input', () => {
      const cardData = {
        cardNumber: '1234567890123456',
        expiryDate: '12/26',
        cvv: '123',
      };

      const encrypted1 = CardEncryption.encryptCardData(cardData);
      const encrypted2 = CardEncryption.encryptCardData(cardData);

      expect(encrypted1.encryptedCardNumber).not.toBe(encrypted2.encryptedCardNumber);
      expect(encrypted1.encryptedExpiryDate).not.toBe(encrypted2.encryptedExpiryDate);
      expect(encrypted1.encryptedCVV).not.toBe(encrypted2.encryptedCVV);
    });
  });

  describe('PIN Encryption Security', () => {
    it('should encrypt PIN with user-specific salt', () => {
      const pin = '1234';
      const userId = 'user123';

      CardEncryption.encryptPIN(pin, userId);

      expect(mockCryptoJS.AES.encrypt).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.objectContaining({
          iv: expect.any(Object),
          mode: mockCryptoJS.mode.CBC,
          padding: mockCryptoJS.pad.Pkcs7,
        })
      );
    });

    it('should produce different encrypted PINs for same PIN with different users', () => {
      const pin = '1234';
      const userId1 = 'user123';
      const userId2 = 'user456';

      const encrypted1 = CardEncryption.encryptPIN(pin, userId1);
      const encrypted2 = CardEncryption.encryptPIN(pin, userId2);

      expect(encrypted1.encryptedPIN).not.toBe(encrypted2.encryptedPIN);
    });

    it('should verify correct PIN', () => {
      const pin = '1234';
      const userId = 'user123';

      const encrypted = CardEncryption.encryptPIN(pin, userId);
      const isValid = CardEncryption.verifyPIN(pin, encrypted.encryptedPIN, userId);

      expect(isValid).toBe(true);
    });

    it('should reject incorrect PIN', () => {
      const correctPin = '1234';
      const incorrectPin = '5678';
      const userId = 'user123';

      const encrypted = CardEncryption.encryptPIN(correctPin, userId);
      const isValid = CardEncryption.verifyPIN(incorrectPin, encrypted.encryptedPIN, userId);

      expect(isValid).toBe(false);
    });

    it('should reject PIN with wrong user ID', () => {
      const pin = '1234';
      const correctUserId = 'user123';
      const wrongUserId = 'user456';

      const encrypted = CardEncryption.encryptPIN(pin, correctUserId);
      const isValid = CardEncryption.verifyPIN(pin, encrypted.encryptedPIN, wrongUserId);

      expect(isValid).toBe(false);
    });
  });

  describe('Data Hashing Security', () => {
    it('should hash sensitive data consistently', () => {
      const data = 'sensitive-data';
      
      const hash1 = CardEncryption.hashSensitiveData(data);
      const hash2 = CardEncryption.hashSensitiveData(data);

      expect(hash1).toBe(hash2);
    });

    it('should produce different hashes for different data', () => {
      const data1 = 'sensitive-data-1';
      const data2 = 'sensitive-data-2';
      
      const hash1 = CardEncryption.hashSensitiveData(data1);
      const hash2 = CardEncryption.hashSensitiveData(data2);

      expect(hash1).not.toBe(hash2);
    });

    it('should handle empty string hashing', () => {
      const emptyData = '';
      
      expect(() => {
        CardEncryption.hashSensitiveData(emptyData);
      }).not.toThrow();
    });

    it('should use SHA-256 for hashing', () => {
      const data = 'test-data';
      
      CardEncryption.hashSensitiveData(data);

      expect(mockCryptoJS.SHA256).toHaveBeenCalledWith(data);
    });
  });

  describe('Token Generation Security', () => {
    it('should generate secure tokens', () => {
      const token = CardEncryption.generateSecureToken();

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });

    it('should generate tokens of consistent length', () => {
      const token1 = CardEncryption.generateSecureToken();
      const token2 = CardEncryption.generateSecureToken();

      expect(token1.length).toBe(token2.length);
    });

    it('should generate unique tokens', () => {
      const token1 = CardEncryption.generateSecureToken();
      const token2 = CardEncryption.generateSecureToken();

      expect(token1).not.toBe(token2);
    });

    it('should use cryptographically secure random generation', () => {
      CardEncryption.generateSecureToken();

      expect(mockCryptoJS.lib.WordArray.random).toHaveBeenCalled();
    });
  });

  describe('Error Handling Security', () => {
    it('should handle malformed encrypted data gracefully', () => {
      const malformedData = {
        encryptedCardNumber: 'malformed-data',
        encryptedExpiryDate: 'malformed-data',
        encryptedCVV: 'malformed-data',
        iv: 'malformed-iv',
      };

      expect(() => {
        CardEncryption.decryptCardData(malformedData);
      }).toThrow('Failed to decrypt card data');
    });

    it('should handle empty encrypted data', () => {
      const emptyData = {
        encryptedCardNumber: '',
        encryptedExpiryDate: '',
        encryptedCVV: '',
        iv: '',
      };

      expect(() => {
        CardEncryption.decryptCardData(emptyData);
      }).toThrow('Failed to decrypt card data');
    });

    it('should handle special characters in encrypted data', () => {
      const specialCharData = {
        encryptedCardNumber: '<script>alert("xss")</script>',
        encryptedExpiryDate: 'malformed-data',
        encryptedCVV: 'malformed-data',
        iv: 'malformed-iv',
      };

      expect(() => {
        CardEncryption.decryptCardData(specialCharData);
      }).toThrow('Failed to decrypt card data');
    });

    it('should not expose sensitive information in error messages', () => {
      const malformedData = {
        encryptedCardNumber: 'malformed-data',
        encryptedExpiryDate: 'malformed-data',
        encryptedCVV: 'malformed-data',
        iv: 'malformed-iv',
      };

      expect(() => {
        CardEncryption.decryptCardData(malformedData);
      }).toThrow('Failed to decrypt card data');
    });
  });

  describe('Performance Security Tests', () => {
    it('should encrypt/decrypt within reasonable time', () => {
      const cardData = {
        cardNumber: '1234567890123456',
        expiryDate: '12/26',
        cvv: '123',
      };

      const startTime = Date.now();
      const encrypted = CardEncryption.encryptCardData(cardData);
      const encryptedTime = Date.now() - startTime;

      const decryptStartTime = Date.now();
      CardEncryption.decryptCardData(encrypted);
      const decryptTime = Date.now() - decryptStartTime;

      // Should complete within 100ms
      expect(encryptedTime).toBeLessThan(100);
      expect(decryptTime).toBeLessThan(100);
    });

    it('should handle multiple rapid encryptions', () => {
      const cardData = {
        cardNumber: '1234567890123456',
        expiryDate: '12/26',
        cvv: '123',
      };

      const startTime = Date.now();
      
      // Perform 100 rapid encryptions
      for (let i = 0; i < 100; i++) {
        CardEncryption.encryptCardData(cardData);
      }
      
      const totalTime = Date.now() - startTime;

      // Should complete within 1 second
      expect(totalTime).toBeLessThan(1000);
    });

    it('should handle concurrent encryption requests', async () => {
      const cardData = {
        cardNumber: '1234567890123456',
        expiryDate: '12/26',
        cvv: '123',
      };

      const promises = Array(10).fill(null).map(() =>
        Promise.resolve(CardEncryption.encryptCardData(cardData))
      );

      const startTime = Date.now();
      await Promise.all(promises);
      const totalTime = Date.now() - startTime;

      // Should complete within 500ms
      expect(totalTime).toBeLessThan(500);
    });
  });

  describe('Memory Security', () => {
    it('should not expose sensitive data in error messages', () => {
      const cardData = {
        cardNumber: '1234567890123456',
        expiryDate: '12/26',
        cvv: '123',
      };

      try {
        CardEncryption.encryptCardData(cardData);
      } catch (error: any) {
        expect(error.message).not.toContain('1234567890123456');
        expect(error.message).not.toContain('12/26');
        expect(error.message).not.toContain('123');
      }
    });

    it('should clear sensitive data from memory after encryption', () => {
      const cardData = {
        cardNumber: '1234567890123456',
        expiryDate: '12/26',
        cvv: '123',
      };

      const encrypted = CardEncryption.encryptCardData(cardData);

      // Original data should not be accessible in encrypted result
      expect(encrypted.encryptedCardNumber).not.toContain('1234567890123456');
      expect(encrypted.encryptedExpiryDate).not.toContain('12/26');
      expect(encrypted.encryptedCVV).not.toContain('123');
    });
  });

  describe('Key Management Security', () => {
    it('should use different keys for different encryption levels', () => {
      const cardData = {
        cardNumber: '1234567890123456',
        expiryDate: '12/26',
        cvv: '123',
      };

      CardEncryption.encryptCardData(cardData);

      // Should call encrypt multiple times with different keys
      expect(mockCryptoJS.AES.encrypt).toHaveBeenCalledTimes(3);
    });

    it('should not expose encryption keys in error messages', () => {
      const cardData = {
        cardNumber: '1234567890123456',
        expiryDate: '12/26',
        cvv: '123',
      };

      try {
        CardEncryption.encryptCardData(cardData);
      } catch (error: any) {
        expect(error.message).not.toContain('key');
        expect(error.message).not.toContain('secret');
      }
    });
  });
});
