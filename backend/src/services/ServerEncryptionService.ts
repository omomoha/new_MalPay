
import crypto from 'crypto';

export class ServerEncryptionService {
  private static readonly ALGORITHM = 'aes-256-gcm';
  private static readonly KEY_LENGTH = 32;
  private static readonly IV_LENGTH = 16;
  private static readonly TAG_LENGTH = 16;

  private static getKey(): Buffer {
    const key = process.env.ENCRYPTION_KEY;
    if (!key || key.length !== 64) {
      throw new Error('Invalid encryption key. Must be 64 characters (32 bytes)');
    }
    return Buffer.from(key, 'hex');
  }

  static encryptCardData(cardData: {
    cardNumber: string;
    expiryDate: string;
    cvv: string;
  }): {
    encryptedData: string;
    iv: string;
    tag: string;
  } {
    try {
      const key = this.getKey();
      const iv = crypto.randomBytes(this.IV_LENGTH);
      const cipher = crypto.createCipher(this.ALGORITHM, key);
      cipher.setAAD(Buffer.from('card-data', 'utf8'));
      
      const dataToEncrypt = JSON.stringify(cardData);
      let encrypted = cipher.update(dataToEncrypt, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const tag = cipher.getAuthTag();
      
      return {
        encryptedData: encrypted,
        iv: iv.toString('hex'),
        tag: tag.toString('hex')
      };
    } catch (error) {
      throw new Error('Failed to encrypt card data');
    }
  }

  static decryptCardData(encryptedData: {
    encryptedData: string;
    iv: string;
    tag: string;
  }): {
    cardNumber: string;
    expiryDate: string;
    cvv: string;
  } {
    try {
      const key = this.getKey();
      const iv = Buffer.from(encryptedData.iv, 'hex');
      const tag = Buffer.from(encryptedData.tag, 'hex');
      
      const decipher = crypto.createDecipher(this.ALGORITHM, key);
      decipher.setAAD(Buffer.from('card-data', 'utf8'));
      decipher.setAuthTag(tag);
      
      let decrypted = decipher.update(encryptedData.encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return JSON.parse(decrypted);
    } catch (error) {
      throw new Error('Failed to decrypt card data');
    }
  }

  static hashPIN(pin: string, userId: string): string {
    const salt = process.env.PIN_SALT || 'default-salt';
    const hash = crypto.pbkdf2Sync(pin + userId, salt, 100000, 64, 'sha512');
    return hash.toString('hex');
  }

  static verifyPIN(pin: string, userId: string, hashedPIN: string): boolean {
    const computedHash = this.hashPIN(pin, userId);
    return crypto.timingSafeEqual(Buffer.from(computedHash), Buffer.from(hashedPIN));
  }
}
