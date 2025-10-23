import axios, { AxiosResponse } from 'axios';
import crypto from 'crypto';
import { logger } from '../utils/logger';

export interface MastercardBalanceResponse {
  accountBalance: {
    availableBalance: number;
    currency: string;
    accountNumber: string;
    lastUpdated: string;
  };
  status: 'success' | 'error';
  message?: string;
}

export interface MastercardBalanceRequest {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  cardholderName: string;
}

export class MastercardBalanceService {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly merchantId: string;
  private readonly encryptionKey: string;

  constructor() {
    this.baseUrl = process.env.MASTERCARD_API_BASE_URL || 'https://sandbox.api.mastercard.com';
    this.apiKey = process.env.MASTERCARD_API_KEY || '';
    this.merchantId = process.env.MASTERCARD_MERCHANT_ID || '';
    this.encryptionKey = process.env.MASTERCARD_ENCRYPTION_KEY || process.env.ENCRYPTION_KEY || '';

    if (!this.apiKey || !this.merchantId) {
      logger.warn('Mastercard API credentials not configured. Balance checking will use mock data.');
    }
  }

  /**
   * Check account balance using Mastercard Account Balance Verification API
   */
  async checkAccountBalance(request: MastercardBalanceRequest): Promise<MastercardBalanceResponse> {
    try {
      // Validate card type
      const cardType = this.getCardType(request.cardNumber);
      if (cardType !== 'mastercard') {
        throw new Error('Only Mastercard cards are supported for balance checking');
      }

      // In production, use real Mastercard API
      if (this.apiKey && this.merchantId) {
        return await this.callMastercardAPI(request);
      } else {
        // Mock response for development/testing
        return await this.getMockBalance(request);
      }
    } catch (error) {
      logger.error('Mastercard balance check error:', error);
      throw new Error('Failed to check account balance');
    }
  }

  /**
   * Call actual Mastercard Account Balance Verification API
   */
  private async callMastercardAPI(request: MastercardBalanceRequest): Promise<MastercardBalanceResponse> {
    try {
      const timestamp = new Date().toISOString();
      const nonce = crypto.randomBytes(16).toString('hex');
      
      // Create OAuth 1.0 signature (simplified for this example)
      const signature = this.createOAuthSignature(request, timestamp, nonce);
      
      const headers = {
        'Authorization': `OAuth oauth_consumer_key="${this.apiKey}", oauth_nonce="${nonce}", oauth_signature="${signature}", oauth_signature_method="HMAC-SHA1", oauth_timestamp="${Math.floor(Date.now() / 1000)}", oauth_version="1.0"`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      const requestBody = {
        accountNumber: this.encryptAccountNumber(request.cardNumber),
        cardExpiryMonth: request.expiryMonth,
        cardExpiryYear: request.expiryYear,
        cardholderName: request.cardholderName,
        merchantId: this.merchantId,
      };

      const response: AxiosResponse = await axios.post(
        `${this.baseUrl}/open-banking/account-balance-verification/v1/balance-inquiry`,
        requestBody,
        { headers, timeout: 30000 }
      );

      return {
        accountBalance: {
          availableBalance: response.data.accountBalance.availableBalance,
          currency: response.data.accountBalance.currency,
          accountNumber: this.decryptAccountNumber(response.data.accountBalance.accountNumber),
          lastUpdated: response.data.accountBalance.lastUpdated,
        },
        status: 'success',
      };
    } catch (error) {
      logger.error('Mastercard API call failed:', error);
      throw new Error('Mastercard API service unavailable');
    }
  }

  /**
   * Get mock balance data for development/testing
   */
  private async getMockBalance(request: MastercardBalanceRequest): Promise<MastercardBalanceResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Generate mock balance based on card number for consistency
    const cardHash = crypto.createHash('md5').update(request.cardNumber).digest('hex');
    const balanceSeed = parseInt(cardHash.substring(0, 8), 16);
    const mockBalance = (balanceSeed % 100000) + 1000; // Balance between 1000-101000

    return {
      accountBalance: {
        availableBalance: mockBalance,
        currency: 'NGN',
        accountNumber: this.maskAccountNumber(request.cardNumber),
        lastUpdated: new Date().toISOString(),
      },
      status: 'success',
      message: 'Mock data - Mastercard API not configured',
    };
  }

  /**
   * Get card type from card number
   */
  private getCardType(cardNumber: string): string {
    const cleaned = cardNumber.replace(/\s/g, '');
    
    // Mastercard patterns
    if (/^5[1-5]/.test(cleaned) || /^2[2-7]/.test(cleaned)) {
      return 'mastercard';
    }
    
    // Visa pattern
    if (/^4/.test(cleaned)) {
      return 'visa';
    }
    
    // American Express pattern
    if (/^3[47]/.test(cleaned)) {
      return 'amex';
    }
    
    // Discover pattern
    if (/^6(?:011|5)/.test(cleaned)) {
      return 'discover';
    }
    
    return 'unknown';
  }

  /**
   * Encrypt account number for API transmission
   */
  private encryptAccountNumber(accountNumber: string): string {
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipher('aes-256-cbc', this.encryptionKey);
      let encrypted = cipher.update(accountNumber, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      return iv.toString('hex') + ':' + encrypted;
    } catch (error) {
      logger.error('Account number encryption error:', error);
      throw new Error('Failed to encrypt account number');
    }
  }

  /**
   * Decrypt account number from API response
   */
  private decryptAccountNumber(encryptedAccountNumber: string): string {
    try {
      const textParts = encryptedAccountNumber.split(':');
      const iv = Buffer.from(textParts.shift()!, 'hex');
      const encryptedText = textParts.join(':');
      const decipher = crypto.createDecipher('aes-256-cbc', this.encryptionKey);
      let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      logger.error('Account number decryption error:', error);
      throw new Error('Failed to decrypt account number');
    }
  }

  /**
   * Mask account number for display
   */
  private maskAccountNumber(accountNumber: string): string {
    const cleaned = accountNumber.replace(/\s/g, '');
    if (cleaned.length < 8) {
      return accountNumber;
    }
    const firstFour = cleaned.substring(0, 4);
    const lastFour = cleaned.substring(cleaned.length - 4);
    const middle = '*'.repeat(cleaned.length - 8);
    return `${firstFour} ${middle} ${lastFour}`;
  }

  /**
   * Create OAuth 1.0 signature for Mastercard API
   */
  private createOAuthSignature(request: MastercardBalanceRequest, timestamp: string, nonce: string): string {
    // Simplified OAuth signature creation
    // In production, implement proper OAuth 1.0 signature generation
    const baseString = `POST&${encodeURIComponent(this.baseUrl + '/open-banking/account-balance-verification/v1/balance-inquiry')}&${encodeURIComponent(`oauth_consumer_key=${this.apiKey}&oauth_nonce=${nonce}&oauth_signature_method=HMAC-SHA1&oauth_timestamp=${Math.floor(Date.now() / 1000)}&oauth_version=1.0`)}`;
    const signingKey = `${encodeURIComponent(this.apiKey)}&`;
    return crypto.createHmac('sha1', signingKey).update(baseString).digest('base64');
  }

  /**
   * Validate Mastercard card number
   */
  validateMastercardNumber(cardNumber: string): boolean {
    const cleaned = cardNumber.replace(/\s/g, '');
    
    // Mastercard patterns: 5[1-5] or 2[2-7]
    if (!(/^5[1-5]/.test(cleaned) || /^2[2-7]/.test(cleaned))) {
      return false;
    }

    // Luhn algorithm validation
    let sum = 0;
    let isEven = false;

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
  }
}

export default MastercardBalanceService;
