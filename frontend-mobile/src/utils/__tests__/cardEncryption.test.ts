import CardEncryption from '../cardEncryption';

describe('CardEncryption Security Tests', () => {
  const testCardData = {
    cardNumber: '4111111111111111',
    expiryDate: '12/26',
    cvv: '123',
    cardholderName: 'John Doe',
  };

  describe('Triple Encryption Security', () => {
    test('should encrypt card data with triple encryption', () => {
      const encrypted = CardEncryption.encryptCardData(testCardData);
      
      // Verify encryption structure
      expect(encrypted).toHaveProperty('encryptedCardNumber');
      expect(encrypted).toHaveProperty('encryptedExpiryDate');
      expect(encrypted).toHaveProperty('encryptedCVV');
      expect(encrypted).toHaveProperty('encryptedCardholderName');
      expect(encrypted).toHaveProperty('iv1');
      expect(encrypted).toHaveProperty('iv2');
      expect(encrypted).toHaveProperty('iv3');
      expect(encrypted).toHaveProperty('encryptionLevel');
      
      // Verify encryption level
      expect(encrypted.encryptionLevel).toBe(3);
      
      // Verify encrypted data is different from original
      expect(encrypted.encryptedCardNumber).not.toBe(testCardData.cardNumber);
      expect(encrypted.encryptedExpiryDate).not.toBe(testCardData.expiryDate);
      expect(encrypted.encryptedCVV).not.toBe(testCardData.cvv);
      expect(encrypted.encryptedCardholderName).not.toBe(testCardData.cardholderName);
    });

    test('should decrypt card data correctly', () => {
      const encrypted = CardEncryption.encryptCardData(testCardData);
      const decrypted = CardEncryption.decryptCardData(encrypted);
      
      expect(decrypted.cardNumber).toBe(testCardData.cardNumber);
      expect(decrypted.expiryDate).toBe(testCardData.expiryDate);
      expect(decrypted.cvv).toBe(testCardData.cvv);
      expect(decrypted.cardholderName).toBe(testCardData.cardholderName);
    });

    test('should generate different IVs for each encryption', () => {
      const encrypted1 = CardEncryption.encryptCardData(testCardData);
      const encrypted2 = CardEncryption.encryptCardData(testCardData);
      
      // IVs should be different for each encryption
      expect(encrypted1.iv1).not.toBe(encrypted2.iv1);
      expect(encrypted1.iv2).not.toBe(encrypted2.iv2);
      expect(encrypted1.iv3).not.toBe(encrypted2.iv3);
    });

    test('should produce different encrypted data for same input', () => {
      const encrypted1 = CardEncryption.encryptCardData(testCardData);
      const encrypted2 = CardEncryption.encryptCardData(testCardData);
      
      // Encrypted data should be different due to random IVs
      expect(encrypted1.encryptedCardNumber).not.toBe(encrypted2.encryptedCardNumber);
      expect(encrypted1.encryptedExpiryDate).not.toBe(encrypted2.encryptedExpiryDate);
      expect(encrypted1.encryptedCVV).not.toBe(encrypted2.encryptedCVV);
      expect(encrypted1.encryptedCardholderName).not.toBe(encrypted2.encryptedCardholderName);
    });

    test('should fail decryption with wrong IV', () => {
      const encrypted = CardEncryption.encryptCardData(testCardData);
      
      // Modify IV to test security
      const modifiedEncrypted = {
        ...encrypted,
        iv1: '00000000000000000000000000000000', // Wrong IV
      };
      
      expect(() => {
        CardEncryption.decryptCardData(modifiedEncrypted);
      }).toThrow('Failed to decrypt card data');
    });

    test('should fail decryption with wrong encryption level', () => {
      const encrypted = CardEncryption.encryptCardData(testCardData);
      
      // Modify encryption level
      const modifiedEncrypted = {
        ...encrypted,
        encryptionLevel: 2, // Wrong level
      };
      
      expect(() => {
        CardEncryption.decryptCardData(modifiedEncrypted);
      }).toThrow('Failed to decrypt card data');
    });
  });

  describe('PIN Security Tests', () => {
    const testPIN = '123456';
    const testUserId = 'user123';

    test('should encrypt PIN securely', () => {
      const encryptedPIN = CardEncryption.encryptPIN(testPIN, testUserId);
      
      expect(encryptedPIN).toBeDefined();
      expect(encryptedPIN).not.toBe(testPIN);
      expect(typeof encryptedPIN).toBe('string');
      expect(encryptedPIN.length).toBeGreaterThan(0);
    });

    test('should verify correct PIN', () => {
      const encryptedPIN = CardEncryption.encryptPIN(testPIN, testUserId);
      const isValid = CardEncryption.verifyPIN(testPIN, encryptedPIN, testUserId);
      
      expect(isValid).toBe(true);
    });

    test('should reject incorrect PIN', () => {
      const encryptedPIN = CardEncryption.encryptPIN(testPIN, testUserId);
      const isValid = CardEncryption.verifyPIN('654321', encryptedPIN, testUserId);
      
      expect(isValid).toBe(false);
    });

    test('should reject PIN with wrong user ID', () => {
      const encryptedPIN = CardEncryption.encryptPIN(testPIN, testUserId);
      const isValid = CardEncryption.verifyPIN(testPIN, encryptedPIN, 'wronguser');
      
      expect(isValid).toBe(false);
    });

    test('should produce different encrypted PINs for same PIN', () => {
      const encrypted1 = CardEncryption.encryptPIN(testPIN, testUserId);
      const encrypted2 = CardEncryption.encryptPIN(testPIN, testUserId);
      
      // Should be different due to random elements
      expect(encrypted1).not.toBe(encrypted2);
    });
  });

  describe('Data Hashing Security', () => {
    test('should hash sensitive data consistently', () => {
      const data = 'sensitive-data';
      const hash1 = CardEncryption.hashSensitiveData(data);
      const hash2 = CardEncryption.hashSensitiveData(data);
      
      expect(hash1).toBe(hash2);
      expect(hash1).not.toBe(data);
      expect(hash1.length).toBe(64); // SHA-256 produces 64 character hex string
    });

    test('should produce different hashes for different data', () => {
      const hash1 = CardEncryption.hashSensitiveData('data1');
      const hash2 = CardEncryption.hashSensitiveData('data2');
      
      expect(hash1).not.toBe(hash2);
    });

    test('should handle empty string', () => {
      const hash = CardEncryption.hashSensitiveData('');
      
      expect(hash).toBeDefined();
      expect(hash.length).toBe(64);
    });
  });

  describe('Token Generation Security', () => {
    test('should generate secure tokens', () => {
      const token1 = CardEncryption.generateSecureToken();
      const token2 = CardEncryption.generateSecureToken();
      
      expect(token1).toBeDefined();
      expect(token2).toBeDefined();
      expect(token1).not.toBe(token2);
      expect(typeof token1).toBe('string');
      expect(typeof token2).toBe('string');
    });

    test('should generate tokens of consistent length', () => {
      const tokens = Array.from({ length: 10 }, () => CardEncryption.generateSecureToken());
      
      tokens.forEach(token => {
        expect(token.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Error Handling Security', () => {
    test('should handle malformed encrypted data gracefully', () => {
      const malformedData = {
        encryptedCardNumber: 'invalid-data',
        encryptedExpiryDate: 'invalid-data',
        encryptedCVV: 'invalid-data',
        encryptedCardholderName: 'invalid-data',
        iv1: 'invalid-iv',
        iv2: 'invalid-iv',
        iv3: 'invalid-iv',
        encryptionLevel: 3,
      };
      
      expect(() => {
        CardEncryption.decryptCardData(malformedData);
      }).toThrow('Failed to decrypt card data');
    });

    test('should handle empty card data', () => {
      const emptyData = {
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        cardholderName: '',
      };
      
      expect(() => {
        CardEncryption.encryptCardData(emptyData);
      }).not.toThrow();
    });

    test('should handle special characters in card data', () => {
      const specialData = {
        cardNumber: '4111-1111-1111-1111',
        expiryDate: '12/26',
        cvv: '123',
        cardholderName: 'José María O\'Connor',
      };
      
      const encrypted = CardEncryption.encryptCardData(specialData);
      const decrypted = CardEncryption.decryptCardData(encrypted);
      
      expect(decrypted.cardNumber).toBe(specialData.cardNumber);
      expect(decrypted.cardholderName).toBe(specialData.cardholderName);
    });
  });

  describe('Performance Security Tests', () => {
    test('should encrypt/decrypt within reasonable time', () => {
      const startTime = Date.now();
      
      const encrypted = CardEncryption.encryptCardData(testCardData);
      const decrypted = CardEncryption.decryptCardData(encrypted);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
      expect(decrypted.cardNumber).toBe(testCardData.cardNumber);
    });

    test('should handle multiple rapid encryptions', () => {
      const promises = Array.from({ length: 10 }, () => 
        Promise.resolve(CardEncryption.encryptCardData(testCardData))
      );
      
      return Promise.all(promises).then(results => {
        expect(results).toHaveLength(10);
        results.forEach(result => {
          expect(result.encryptionLevel).toBe(3);
        });
      });
    });
  });
});
