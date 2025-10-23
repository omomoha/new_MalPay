import crypto from 'crypto';
import { logger } from '../utils/logger';

export class CardEncryptionService {
  private encryptionKey: string;
  private algorithm: string = 'aes-256-cbc';

  constructor() {
    // Generate a proper 32-byte (256-bit) key for AES-256
    const defaultKey = 'malpay-secure-key-2024-production-ready-32bytes';
    this.encryptionKey = process.env.CARD_ENCRYPTION_KEY || defaultKey;
    
    // Ensure the key is exactly 32 bytes for AES-256
    if (this.encryptionKey.length !== 32) {
      this.encryptionKey = this.encryptionKey.padEnd(32, '0').substring(0, 32);
    }
  }

  /**
   * Encrypt card number
   */
  encryptCardNumber(cardNumber: string): string {
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(this.algorithm, Buffer.from(this.encryptionKey, 'utf8'), iv);
      let encrypted = cipher.update(cardNumber, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      return iv.toString('hex') + ':' + encrypted;
    } catch (error) {
      logger.error('Card number encryption error:', error);
      throw new Error('Failed to encrypt card number');
    }
  }

  /**
   * Decrypt card number
   */
  decryptCardNumber(encryptedCardNumber: string): string {
    try {
      const textParts = encryptedCardNumber.split(':');
      const iv = Buffer.from(textParts.shift()!, 'hex');
      const encryptedText = textParts.join(':');
      const decipher = crypto.createDecipheriv(this.algorithm, Buffer.from(this.encryptionKey, 'utf8'), iv);
      let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      logger.error('Card number decryption error:', error);
      throw new Error('Failed to decrypt card number');
    }
  }

  /**
   * Encrypt CVV
   */
  encryptCvv(cvv: string): string {
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(this.algorithm, Buffer.from(this.encryptionKey, 'utf8'), iv);
      let encrypted = cipher.update(cvv, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      return iv.toString('hex') + ':' + encrypted;
    } catch (error) {
      logger.error('CVV encryption error:', error);
      throw new Error('Failed to encrypt CVV');
    }
  }

  /**
   * Decrypt CVV
   */
  decryptCvv(encryptedCvv: string): string {
    try {
      const textParts = encryptedCvv.split(':');
      const iv = Buffer.from(textParts.shift()!, 'hex');
      const encryptedText = textParts.join(':');
      const decipher = crypto.createDecipheriv(this.algorithm, Buffer.from(this.encryptionKey, 'utf8'), iv);
      let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      logger.error('CVV decryption error:', error);
      throw new Error('Failed to decrypt CVV');
    }
  }

  /**
   * Mask card number for display
   */
  maskCardNumber(cardNumber: string): string {
    try {
      const cleaned = cardNumber.replace(/\s/g, '');
      if (cleaned.length < 8) {
        return cardNumber;
      }
      
      const firstFour = cleaned.substring(0, 4);
      const lastFour = cleaned.substring(cleaned.length - 4);
      
      // Different masking patterns based on card type
      const cardType = this.detectCardType(cleaned);
      let middle: string;
      
      if (cardType === 'amex') {
        // American Express: 4-6-5 format (3782 ****** 0005)
        middle = '*'.repeat(6);
      } else {
        // Visa, Mastercard, Discover: 4-4-4-4 format (4532 **** **** 9012)
        middle = '*'.repeat(4) + ' ' + '*'.repeat(4);
      }
      
      return `${firstFour} ${middle} ${lastFour}`;
    } catch (error) {
      logger.error('Card masking error:', error);
      return cardNumber;
    }
  }

  /**
   * Detect card type based on card number
   */
  detectCardType(cardNumber: string): string {
    const cleaned = cardNumber.replace(/\s/g, '');
    
    if (cleaned.startsWith('4')) {
      return 'visa';
    } else if (cleaned.startsWith('5') || cleaned.startsWith('2')) {
      return 'mastercard';
    } else if (cleaned.startsWith('3')) {
      return 'amex';
    } else if (cleaned.startsWith('6')) {
      return 'discover';
    }
    
    return 'unknown';
  }

  /**
   * Validate card number using Luhn algorithm
   */
  validateCardNumber(cardNumber: string): boolean {
    try {
      const cleaned = cardNumber.replace(/\s/g, '');
      
      // Check if it's all digits
      if (!/^\d+$/.test(cleaned)) {
        return false;
      }

      // Check length (most cards are 13-19 digits)
      if (cleaned.length < 13 || cleaned.length > 19) {
        return false;
      }

      // Luhn algorithm
      let sum = 0;
      let isEven = false;

      // Process digits from right to left
      for (let i = cleaned.length - 1; i >= 0; i--) {
        let digit = parseInt(cleaned[i]);

        if (isEven) {
          digit *= 2;
          if (digit > 9) {
            digit -= 9;
          }
        }

        sum += digit;
        isEven = !isEven;
      }

      return sum % 10 === 0;
    } catch (error) {
      logger.error('Card validation error:', error);
      return false;
    }
  }

  /**
   * Get card type based on card number
   */
  getCardType(cardNumber: string): string {
    try {
      const cleaned = cardNumber.replace(/\s/g, '');

      // Visa
      if (/^4/.test(cleaned)) {
        return 'visa';
      }

      // Mastercard
      if (/^5[1-5]/.test(cleaned) || /^2[2-7]/.test(cleaned)) {
        return 'mastercard';
      }

      // American Express
      if (/^3[47]/.test(cleaned)) {
        return 'amex';
      }

      // Discover
      if (/^6(?:011|5)/.test(cleaned)) {
        return 'discover';
      }

      // Default
      return 'unknown';
    } catch (error) {
      logger.error('Card type detection error:', error);
      return 'unknown';
    }
  }

  /**
   * Validate expiry date
   */
  validateExpiryDate(month: number, year: number): boolean {
    try {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;

      // Check if month is valid (1-12)
      if (month < 1 || month > 12) {
        return false;
      }

      // Check if year is not in the past
      if (year < currentYear) {
        return false;
      }

      // Check if month is not in the past for current year
      if (year === currentYear && month < currentMonth) {
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Expiry date validation error:', error);
      return false;
    }
  }

  /**
   * Validate CVV
   */
  validateCvv(cvv: string, cardType: string): boolean {
    try {
      // Check if CVV is all digits
      if (!/^\d+$/.test(cvv)) {
        return false;
      }

      // Check length based on card type
      if (cardType === 'amex') {
        return cvv.length === 4;
      } else {
        return cvv.length === 3 || cvv.length === 4; // Allow both 3 and 4 digits for non-AMEX cards
      }
    } catch (error) {
      logger.error('CVV validation error:', error);
      return false;
    }
  }

  /**
   * Generate secure token for card operations
   */
  generateCardToken(): string {
    try {
      return crypto.randomBytes(32).toString('hex');
    } catch (error) {
      logger.error('Card token generation error:', error);
      throw new Error('Failed to generate card token');
    }
  }

  /**
   * Hash card number for duplicate detection
   */
  hashCardNumber(cardNumber: string): string {
    try {
      const cleaned = cardNumber.replace(/\s/g, '');
      return crypto.createHash('sha256').update(cleaned + this.encryptionKey).digest('hex');
    } catch (error) {
      logger.error('Card hashing error:', error);
      throw new Error('Failed to hash card number');
    }
  }
}
