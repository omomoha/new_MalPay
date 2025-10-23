import crypto from 'crypto';
import { CardBalance } from '../models/CardBalance';
import { MastercardBalanceService } from './MastercardBalanceService';
import { logger } from '../utils/logger';

export interface BalanceData {
  balance: number;
  currency: string;
  accountNumber: string;
  lastUpdated: string;
}

export interface CardBalanceResponse {
  cardId: string;
  cardType: string;
  maskedCardNumber: string;
  balance: number;
  currency: string;
  lastUpdated: string;
  isMastercard: boolean;
}

export class CardBalanceService {
  private mastercardService: MastercardBalanceService;
  private encryptionKey: string;

  constructor() {
    this.mastercardService = new MastercardBalanceService();
    this.encryptionKey = process.env.ENCRYPTION_KEY || 'default-encryption-key-change-in-production';
  }

  /**
   * Get balance for a specific card
   */
  async getCardBalance(userId: string, cardId: string): Promise<CardBalanceResponse | null> {
    try {
      const cardBalance = await CardBalance.findOne({
        where: {
          userId,
          cardId,
          isActive: true,
        },
      });

      if (!cardBalance) {
        return null;
      }

      // Decrypt balance data
      const balanceData = this.decryptBalanceData(cardBalance.encryptedBalance);
      const currency = this.decryptString(cardBalance.encryptedCurrency);
      const accountNumber = this.decryptString(cardBalance.encryptedAccountNumber);

      return {
        cardId: cardBalance.cardId,
        cardType: cardBalance.cardType,
        maskedCardNumber: this.maskCardNumber(accountNumber),
        balance: balanceData.balance,
        currency: currency,
        lastUpdated: balanceData.lastUpdated,
        isMastercard: cardBalance.cardType === 'mastercard',
      };
    } catch (error) {
      logger.error('Error getting card balance:', error);
      throw new Error('Failed to retrieve card balance');
    }
  }

  /**
   * Get all card balances for a user
   */
  async getAllCardBalances(userId: string): Promise<CardBalanceResponse[]> {
    try {
      const cardBalances = await CardBalance.findAll({
        where: {
          userId,
          isActive: true,
        },
        order: [['lastUpdated', 'DESC']],
      });

      const balances: CardBalanceResponse[] = [];

      for (const cardBalance of cardBalances) {
        try {
          const balanceData = this.decryptBalanceData(cardBalance.encryptedBalance);
          const currency = this.decryptString(cardBalance.encryptedCurrency);
          const accountNumber = this.decryptString(cardBalance.encryptedAccountNumber);

          balances.push({
            cardId: cardBalance.cardId,
            cardType: cardBalance.cardType,
            maskedCardNumber: this.maskCardNumber(accountNumber),
            balance: balanceData.balance,
            currency: currency,
            lastUpdated: balanceData.lastUpdated,
            isMastercard: cardBalance.cardType === 'mastercard',
          });
        } catch (error) {
          logger.error(`Error decrypting balance for card ${cardBalance.cardId}:`, error);
          // Skip this card and continue with others
        }
      }

      return balances;
    } catch (error) {
      logger.error('Error getting all card balances:', error);
      throw new Error('Failed to retrieve card balances');
    }
  }

  /**
   * Update card balance from Mastercard API
   */
  async updateMastercardBalance(
    userId: string,
    cardId: string,
    cardNumber: string,
    expiryMonth: string,
    expiryYear: string,
    cvv: string,
    cardholderName: string
  ): Promise<CardBalanceResponse> {
    try {
      // Validate that it's a Mastercard
      if (!this.mastercardService.validateMastercardNumber(cardNumber)) {
        throw new Error('Only Mastercard cards support balance checking');
      }

      // Get balance from Mastercard API
      const balanceResponse = await this.mastercardService.checkAccountBalance({
        cardNumber,
        expiryMonth,
        expiryYear,
        cvv,
        cardholderName,
      });

      if (balanceResponse.status !== 'success') {
        throw new Error(balanceResponse.message || 'Failed to get balance from Mastercard');
      }

      // Encrypt balance data
      const encryptedBalance = this.encryptBalanceData({
        balance: balanceResponse.accountBalance.availableBalance,
        currency: balanceResponse.accountBalance.currency,
        accountNumber: balanceResponse.accountBalance.accountNumber,
        lastUpdated: balanceResponse.accountBalance.lastUpdated,
      });

      const encryptedCurrency = this.encryptString(balanceResponse.accountBalance.currency);
      const encryptedAccountNumber = this.encryptString(balanceResponse.accountBalance.accountNumber);

      // Update or create card balance record
      const [cardBalance, created] = await CardBalance.upsert({
        id: crypto.randomUUID(),
        userId,
        cardId,
        cardType: 'mastercard',
        encryptedBalance,
        encryptedCurrency,
        encryptedAccountNumber,
        lastUpdated: new Date(balanceResponse.accountBalance.lastUpdated),
        isActive: true,
      });

      return {
        cardId: cardBalance.cardId,
        cardType: cardBalance.cardType,
        maskedCardNumber: this.maskCardNumber(balanceResponse.accountBalance.accountNumber),
        balance: balanceResponse.accountBalance.availableBalance,
        currency: balanceResponse.accountBalance.currency,
        lastUpdated: balanceResponse.accountBalance.lastUpdated,
        isMastercard: true,
      };
    } catch (error) {
      logger.error('Error updating Mastercard balance:', error);
      throw new Error('Failed to update Mastercard balance');
    }
  }

  /**
   * Check if user has any Mastercard balances
   */
  async hasMastercardBalances(userId: string): Promise<boolean> {
    try {
      const count = await CardBalance.count({
        where: {
          userId,
          cardType: 'mastercard',
          isActive: true,
        },
      });

      return count > 0;
    } catch (error) {
      logger.error('Error checking Mastercard balances:', error);
      return false;
    }
  }

  /**
   * Encrypt balance data
   */
  private encryptBalanceData(balanceData: BalanceData): string {
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipher('aes-256-cbc', this.encryptionKey);
      let encrypted = cipher.update(JSON.stringify(balanceData), 'utf8', 'hex');
      encrypted += cipher.final('hex');
      return iv.toString('hex') + ':' + encrypted;
    } catch (error) {
      logger.error('Balance data encryption error:', error);
      throw new Error('Failed to encrypt balance data');
    }
  }

  /**
   * Decrypt balance data
   */
  private decryptBalanceData(encryptedBalanceData: string): BalanceData {
    try {
      const textParts = encryptedBalanceData.split(':');
      const iv = Buffer.from(textParts.shift()!, 'hex');
      const encryptedText = textParts.join(':');
      const decipher = crypto.createDecipher('aes-256-cbc', this.encryptionKey);
      let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return JSON.parse(decrypted);
    } catch (error) {
      logger.error('Balance data decryption error:', error);
      throw new Error('Failed to decrypt balance data');
    }
  }

  /**
   * Encrypt string data
   */
  private encryptString(data: string): string {
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipher('aes-256-cbc', this.encryptionKey);
      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      return iv.toString('hex') + ':' + encrypted;
    } catch (error) {
      logger.error('String encryption error:', error);
      throw new Error('Failed to encrypt string data');
    }
  }

  /**
   * Decrypt string data
   */
  private decryptString(encryptedData: string): string {
    try {
      const textParts = encryptedData.split(':');
      const iv = Buffer.from(textParts.shift()!, 'hex');
      const encryptedText = textParts.join(':');
      const decipher = crypto.createDecipher('aes-256-cbc', this.encryptionKey);
      let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      logger.error('String decryption error:', error);
      throw new Error('Failed to decrypt string data');
    }
  }

  /**
   * Mask card number for display
   */
  private maskCardNumber(cardNumber: string): string {
    const cleaned = cardNumber.replace(/\s/g, '');
    if (cleaned.length < 8) {
      return cardNumber;
    }
    const firstFour = cleaned.substring(0, 4);
    const lastFour = cleaned.substring(cleaned.length - 4);
    const middle = '*'.repeat(cleaned.length - 8);
    return `${firstFour} ${middle} ${lastFour}`;
  }

  /**
   * Deactivate card balance (for card removal)
   */
  async deactivateCardBalance(userId: string, cardId: string): Promise<void> {
    try {
      await CardBalance.update(
        { isActive: false },
        {
          where: {
            userId,
            cardId,
          },
        }
      );
    } catch (error) {
      logger.error('Error deactivating card balance:', error);
      throw new Error('Failed to deactivate card balance');
    }
  }
}

export default CardBalanceService;
