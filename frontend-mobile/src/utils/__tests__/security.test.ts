import CardEncryption from '../cardEncryption';

describe('Security Test Suite', () => {
  describe('Encryption Security', () => {
    test('should prevent data leakage in encrypted output', () => {
      const sensitiveData = {
        cardNumber: '4111111111111111',
        expiryDate: '12/26',
        cvv: '123',
        cardholderName: 'John Doe',
      };

      const encrypted = CardEncryption.encryptCardData(sensitiveData);
      
      // Verify no original data appears in encrypted output
      expect(encrypted.encryptedCardNumber).not.toContain(sensitiveData.cardNumber);
      expect(encrypted.encryptedExpiryDate).not.toContain(sensitiveData.expiryDate);
      expect(encrypted.encryptedCVV).not.toContain(sensitiveData.cvv);
      expect(encrypted.encryptedCardholderName).not.toContain(sensitiveData.cardholderName);
    });

    test('should use different IVs for each encryption', () => {
      const data = { cardNumber: '4111111111111111', expiryDate: '12/26', cvv: '123', cardholderName: 'John Doe' };
      
      const encrypted1 = CardEncryption.encryptCardData(data);
      const encrypted2 = CardEncryption.encryptCardData(data);
      
      expect(encrypted1.iv1).not.toBe(encrypted2.iv1);
      expect(encrypted1.iv2).not.toBe(encrypted2.iv2);
      expect(encrypted1.iv3).not.toBe(encrypted2.iv3);
    });

    test('should resist known plaintext attacks', () => {
      const knownData = { cardNumber: '0000000000000000', expiryDate: '01/01', cvv: '000', cardholderName: 'Test' };
      
      const encrypted1 = CardEncryption.encryptCardData(knownData);
      const encrypted2 = CardEncryption.encryptCardData(knownData);
      
      // Even with known data, encrypted outputs should be different
      expect(encrypted1.encryptedCardNumber).not.toBe(encrypted2.encryptedCardNumber);
    });
  });

  describe('PIN Security', () => {
    test('should resist timing attacks on PIN verification', async () => {
      const correctPIN = '123456';
      const wrongPIN = '654321';
      const userId = 'user123';
      
      const encryptedPIN = CardEncryption.encryptPIN(correctPIN, userId);
      
      const startCorrect = Date.now();
      await CardEncryption.verifyPIN(correctPIN, encryptedPIN, userId);
      const timeCorrect = Date.now() - startCorrect;
      
      const startWrong = Date.now();
      await CardEncryption.verifyPIN(wrongPIN, encryptedPIN, userId);
      const timeWrong = Date.now() - startWrong;
      
      // Timing difference should be minimal (within 100ms)
      expect(Math.abs(timeCorrect - timeWrong)).toBeLessThan(100);
    });

    test('should use user-specific salt for PIN encryption', () => {
      const pin = '123456';
      const user1 = 'user1';
      const user2 = 'user2';
      
      const encrypted1 = CardEncryption.encryptPIN(pin, user1);
      const encrypted2 = CardEncryption.encryptPIN(pin, user2);
      
      expect(encrypted1).not.toBe(encrypted2);
    });
  });

  describe('Data Integrity', () => {
    test('should detect tampered encrypted data', () => {
      const data = { cardNumber: '4111111111111111', expiryDate: '12/26', cvv: '123', cardholderName: 'John Doe' };
      const encrypted = CardEncryption.encryptCardData(data);
      
      // Tamper with encrypted data
      const tampered = {
        ...encrypted,
        encryptedCardNumber: encrypted.encryptedCardNumber.slice(0, -1) + 'X',
      };
      
      expect(() => {
        CardEncryption.decryptCardData(tampered);
      }).toThrow();
    });

    test('should handle malformed IV gracefully', () => {
      const data = { cardNumber: '4111111111111111', expiryDate: '12/26', cvv: '123', cardholderName: 'John Doe' };
      const encrypted = CardEncryption.encryptCardData(data);
      
      const malformed = {
        ...encrypted,
        iv1: 'invalid-iv',
      };
      
      expect(() => {
        CardEncryption.decryptCardData(malformed);
      }).toThrow();
    });
  });

  describe('Input Validation Security', () => {
    test('should handle SQL injection attempts', () => {
      const maliciousData = {
        cardNumber: "4111111111111111'; DROP TABLE cards; --",
        expiryDate: "12/26",
        cvv: "123",
        cardholderName: "'; DROP TABLE users; --",
      };
      
      expect(() => {
        CardEncryption.encryptCardData(maliciousData);
      }).not.toThrow();
    });

    test('should handle XSS attempts', () => {
      const maliciousData = {
        cardNumber: '4111111111111111',
        expiryDate: '12/26',
        cvv: '123',
        cardholderName: '<script>alert("xss")</script>',
      };
      
      const encrypted = CardEncryption.encryptCardData(maliciousData);
      const decrypted = CardEncryption.decryptCardData(encrypted);
      
      expect(decrypted.cardholderName).toBe(maliciousData.cardholderName);
    });

    test('should handle extremely long inputs', () => {
      const longData = {
        cardNumber: '4111111111111111',
        expiryDate: '12/26',
        cvv: '123',
        cardholderName: 'A'.repeat(10000), // Very long name
      };
      
      expect(() => {
        CardEncryption.encryptCardData(longData);
      }).not.toThrow();
    });
  });

  describe('Memory Security', () => {
    test('should not expose sensitive data in error messages', () => {
      const data = { cardNumber: '4111111111111111', expiryDate: '12/26', cvv: '123', cardholderName: 'John Doe' };
      
      try {
        // Force an error by providing invalid data structure
        CardEncryption.decryptCardData({} as any);
      } catch (error: any) {
        expect(error.message).not.toContain('4111111111111111');
        expect(error.message).not.toContain('John Doe');
        expect(error.message).toBe('Failed to decrypt card data');
      }
    });
  });

  describe('Performance Security', () => {
    test('should complete encryption within reasonable time', () => {
      const data = { cardNumber: '4111111111111111', expiryDate: '12/26', cvv: '123', cardholderName: 'John Doe' };
      
      const start = Date.now();
      CardEncryption.encryptCardData(data);
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });

    test('should handle concurrent encryption requests', async () => {
      const data = { cardNumber: '4111111111111111', expiryDate: '12/26', cvv: '123', cardholderName: 'John Doe' };
      
      const promises = Array.from({ length: 10 }, () => 
        Promise.resolve(CardEncryption.encryptCardData(data))
      );
      
      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
      
      // All results should be different due to random IVs
      const encryptedNumbers = results.map(r => r.encryptedCardNumber);
      const uniqueNumbers = new Set(encryptedNumbers);
      expect(uniqueNumbers.size).toBe(10);
    });
  });
});
