import CryptoJS from 'crypto-js';

/**
 * CardEncryption utility for mobile app
 * Provides secure encryption/decryption for card data
 */
export class CardEncryption {
  private static readonly ENCRYPTION_KEY = 'malpay-secure-key-2024';
  private static readonly ALGORITHM = 'AES';

  /**
   * Encrypt card data
   */
  static encryptCardData(cardData: {
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    cardholderName: string;
  }): {
    encryptedCardNumber: string;
    encryptedExpiryDate: string;
    encryptedCVV: string;
    encryptedCardholderName: string;
    iv1: string;
    iv2: string;
    iv3: string;
    iv4: string;
    encryptionLevel: number;
  } {
    try {
      const iv1 = CryptoJS.lib.WordArray.random(16);
      const iv2 = CryptoJS.lib.WordArray.random(16);
      const iv3 = CryptoJS.lib.WordArray.random(16);
      const iv4 = CryptoJS.lib.WordArray.random(16);

      const encryptedCardNumber = CryptoJS.AES.encrypt(
        cardData.cardNumber,
        this.ENCRYPTION_KEY,
        { iv: iv1 }
      ).toString();

      const encryptedExpiryDate = CryptoJS.AES.encrypt(
        cardData.expiryDate,
        this.ENCRYPTION_KEY,
        { iv: iv2 }
      ).toString();

      const encryptedCVV = CryptoJS.AES.encrypt(
        cardData.cvv,
        this.ENCRYPTION_KEY,
        { iv: iv3 }
      ).toString();

      const encryptedCardholderName = CryptoJS.AES.encrypt(
        cardData.cardholderName,
        this.ENCRYPTION_KEY,
        { iv: iv4 }
      ).toString();

      return {
        encryptedCardNumber,
        encryptedExpiryDate,
        encryptedCVV,
        encryptedCardholderName,
        iv1: iv1.toString(),
        iv2: iv2.toString(),
        iv3: iv3.toString(),
        iv4: iv4.toString(),
        encryptionLevel: 3,
      };
    } catch (error) {
      throw new Error('Failed to encrypt card data');
    }
  }

  /**
   * Decrypt card data
   */
  static decryptCardData(encryptedData: {
    encryptedCardNumber: string;
    encryptedExpiryDate: string;
    encryptedCVV: string;
    encryptedCardholderName: string;
    iv1: string;
    iv2: string;
    iv3: string;
    iv4: string;
    encryptionLevel?: number;
  }): {
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    cardholderName: string;
  } {
    try {
      // Validate encryption level if provided
      if (encryptedData.encryptionLevel && encryptedData.encryptionLevel !== 3) {
        throw new Error('Invalid encryption level');
      }

      // Validate IVs are valid hex strings and not all zeros
      if (!/^[0-9a-fA-F]{32}$/.test(encryptedData.iv1) ||
          !/^[0-9a-fA-F]{32}$/.test(encryptedData.iv2) ||
          !/^[0-9a-fA-F]{32}$/.test(encryptedData.iv3) ||
          !/^[0-9a-fA-F]{32}$/.test(encryptedData.iv4) ||
          encryptedData.iv1 === '00000000000000000000000000000000' ||
          encryptedData.iv2 === '00000000000000000000000000000000' ||
          encryptedData.iv3 === '00000000000000000000000000000000' ||
          encryptedData.iv4 === '00000000000000000000000000000000') {
        throw new Error('Invalid IV format');
      }

      const iv1 = CryptoJS.enc.Hex.parse(encryptedData.iv1);
      const iv2 = CryptoJS.enc.Hex.parse(encryptedData.iv2);
      const iv3 = CryptoJS.enc.Hex.parse(encryptedData.iv3);
      const iv4 = CryptoJS.enc.Hex.parse(encryptedData.iv4);

      const cardNumber = CryptoJS.AES.decrypt(
        encryptedData.encryptedCardNumber,
        this.ENCRYPTION_KEY,
        { iv: iv1 }
      ).toString(CryptoJS.enc.Utf8);

      const expiryDate = CryptoJS.AES.decrypt(
        encryptedData.encryptedExpiryDate,
        this.ENCRYPTION_KEY,
        { iv: iv2 }
      ).toString(CryptoJS.enc.Utf8);

      const cvv = CryptoJS.AES.decrypt(
        encryptedData.encryptedCVV,
        this.ENCRYPTION_KEY,
        { iv: iv3 }
      ).toString(CryptoJS.enc.Utf8);

      const cardholderName = CryptoJS.AES.decrypt(
        encryptedData.encryptedCardholderName,
        this.ENCRYPTION_KEY,
        { iv: iv4 }
      ).toString(CryptoJS.enc.Utf8);

      // Validate decrypted data is not empty
      if (!cardNumber || !expiryDate || !cvv || !cardholderName) {
        throw new Error('Invalid decrypted data');
      }

      return {
        cardNumber,
        expiryDate,
        cvv,
        cardholderName,
      };
    } catch (error) {
      throw new Error('Failed to decrypt card data');
    }
  }

  /**
   * Encrypt PIN
   */
  static encryptPIN(pin: string, userId: string): string {
    try {
      const salt = CryptoJS.lib.WordArray.random(16);
      // Include userId in the key derivation to make it user-specific
      const combinedInput = pin + userId;
      const key = CryptoJS.PBKDF2(combinedInput, salt, {
        keySize: 256 / 32,
        iterations: 10000,
      });
      
      const encrypted = CryptoJS.AES.encrypt(
        pin,
        key,
        { iv: salt }
      ).toString();

      return salt.toString() + ':' + encrypted;
    } catch (error) {
      throw new Error('Failed to encrypt PIN');
    }
  }

  /**
   * Verify PIN
   */
  static verifyPIN(pin: string, encryptedPIN: string, userId: string): boolean {
    try {
      const [saltHex, encrypted] = encryptedPIN.split(':');
      const salt = CryptoJS.enc.Hex.parse(saltHex);
      
      // Use the same combined input as encryption
      const combinedInput = pin + userId;
      const key = CryptoJS.PBKDF2(combinedInput, salt, {
        keySize: 256 / 32,
        iterations: 10000,
      });

      const decrypted = CryptoJS.AES.decrypt(
        encrypted,
        key,
        { iv: salt }
      ).toString(CryptoJS.enc.Utf8);

      return decrypted === pin;
    } catch (error) {
      return false;
    }
  }

  /**
   * Hash sensitive data
   */
  static hashSensitiveData(data: string): string {
    try {
      return CryptoJS.SHA256(data).toString();
    } catch (error) {
      throw new Error('Failed to hash data');
    }
  }

  /**
   * Generate secure token
   */
  static generateSecureToken(): string {
    try {
      return CryptoJS.lib.WordArray.random(32).toString();
    } catch (error) {
      throw new Error('Failed to generate token');
    }
  }
}

export default CardEncryption;