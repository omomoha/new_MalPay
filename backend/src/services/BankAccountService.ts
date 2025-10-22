import { Pool } from 'pg';
import { Logger } from 'winston';
import axios from 'axios';

export interface BankAccount {
  id: string;
  userId: string;
  accountNumber: string;
  bankCode: string;
  bankName: string;
  accountName: string;
  accountType: 'savings' | 'current';
  isVerified: boolean;
  isPrimary: boolean;
  verificationReference?: string;
  verifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AddBankAccountData {
  userId: string;
  accountNumber: string;
  bankCode: string;
  accountName: string;
  accountType: 'savings' | 'current';
  isPrimary?: boolean;
}

export interface BankVerificationResponse {
  success: boolean;
  accountName?: string;
  bankName?: string;
  error?: string;
}

export class BankAccountService {
  private db: Pool;
  private logger: Logger;
  private paystackSecretKey: string;

  // Nigerian banks list
  private banks = [
    { code: '044', name: 'Access Bank' },
    { code: '014', name: 'Afribank Nigeria Plc' },
    { code: '023', name: 'Citibank Nigeria Limited' },
    { code: '050', name: 'Ecobank Nigeria Plc' },
    { code: '011', name: 'First Bank of Nigeria' },
    { code: '214', name: 'First City Monument Bank' },
    { code: '070', name: 'Fidelity Bank Nigeria' },
    { code: '058', name: 'Guaranty Trust Bank' },
    { code: '030', name: 'Heritage Bank' },
    { code: '301', name: 'Jaiz Bank' },
    { code: '082', name: 'Keystone Bank' },
    { code: '221', name: 'Stanbic IBTC Bank' },
    { code: '068', name: 'Standard Chartered Bank' },
    { code: '232', name: 'Sterling Bank' },
    { code: '032', name: 'Union Bank of Nigeria' },
    { code: '033', name: 'United Bank for Africa' },
    { code: '215', name: 'Unity Bank' },
    { code: '035', name: 'Wema Bank' },
    { code: '057', name: 'Zenith Bank' }
  ];

  constructor(db: Pool, logger: Logger, paystackSecretKey: string) {
    this.db = db;
    this.logger = logger;
    this.paystackSecretKey = paystackSecretKey;
  }

  /**
   * Add a new bank account
   */
  async addBankAccount(data: AddBankAccountData): Promise<BankAccount> {
    try {
      // Verify account with bank
      const verification = await this.verifyAccount(data.accountNumber, data.bankCode);
      if (!verification.success) {
        throw new Error(verification.error || 'Account verification failed');
      }

      // If this is set as primary, unset other primary accounts
      if (data.isPrimary) {
        await this.unsetPrimaryAccount(data.userId);
      }

      const query = `
        INSERT INTO bank_accounts (
          user_id, account_number, bank_code, bank_name, account_name, 
          account_type, is_primary, is_verified, verification_reference, verified_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
        RETURNING id, user_id, account_number, bank_code, bank_name, account_name,
                  account_type, is_verified, is_primary, verification_reference, 
                  verified_at, created_at, updated_at
      `;

      const result = await this.db.query(query, [
        data.userId,
        data.accountNumber,
        data.bankCode,
        verification.bankName,
        verification.accountName,
        data.accountType,
        data.isPrimary || false,
        true, // Verified during addition
        `VERIFY_${Date.now()}`,
      ]);

      const bankAccount = this.mapRowToBankAccount(result.rows[0]);
      this.logger.info(`Added bank account for user ${data.userId}: ${bankAccount.accountNumber}`);

      return bankAccount;
    } catch (error) {
      this.logger.error('Error adding bank account:', error);
      throw error;
    }
  }

  /**
   * Get bank accounts for a user
   */
  async getBankAccountsByUserId(userId: string): Promise<BankAccount[]> {
    try {
      const query = `
        SELECT id, user_id, account_number, bank_code, bank_name, account_name,
               account_type, is_verified, is_primary, verification_reference,
               verified_at, created_at, updated_at
        FROM bank_accounts
        WHERE user_id = $1
        ORDER BY is_primary DESC, created_at DESC
      `;

      const result = await this.db.query(query, [userId]);
      return result.rows.map(row => this.mapRowToBankAccount(row));
    } catch (error) {
      this.logger.error('Error getting bank accounts:', error);
      throw error;
    }
  }

  /**
   * Get bank account by ID
   */
  async getBankAccountById(accountId: string): Promise<BankAccount | null> {
    try {
      const query = `
        SELECT id, user_id, account_number, bank_code, bank_name, account_name,
               account_type, is_verified, is_primary, verification_reference,
               verified_at, created_at, updated_at
        FROM bank_accounts
        WHERE id = $1
      `;

      const result = await this.db.query(query, [accountId]);
      
      if (result.rows.length === 0) {
        return null;
      }

      return this.mapRowToBankAccount(result.rows[0]);
    } catch (error) {
      this.logger.error('Error getting bank account by ID:', error);
      throw error;
    }
  }

  /**
   * Set primary bank account
   */
  async setPrimaryAccount(userId: string, accountId: string): Promise<void> {
    try {
      await this.db.query('BEGIN');

      // Unset current primary account
      await this.unsetPrimaryAccount(userId);

      // Set new primary account
      const query = `
        UPDATE bank_accounts 
        SET is_primary = true, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND user_id = $2
      `;

      const result = await this.db.query(query, [accountId, userId]);
      
      if (result.rowCount === 0) {
        throw new Error('Bank account not found or does not belong to user');
      }

      await this.db.query('COMMIT');
      this.logger.info(`Set primary bank account ${accountId} for user ${userId}`);
    } catch (error) {
      await this.db.query('ROLLBACK');
      this.logger.error('Error setting primary bank account:', error);
      throw error;
    }
  }

  /**
   * Unset primary bank account
   */
  private async unsetPrimaryAccount(userId: string): Promise<void> {
    const query = `
      UPDATE bank_accounts 
      SET is_primary = false, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $1 AND is_primary = true
    `;

    await this.db.query(query, [userId]);
  }

  /**
   * Delete bank account
   */
  async deleteBankAccount(userId: string, accountId: string): Promise<void> {
    try {
      const query = `
        DELETE FROM bank_accounts 
        WHERE id = $1 AND user_id = $2
      `;

      const result = await this.db.query(query, [accountId, userId]);
      
      if (result.rowCount === 0) {
        throw new Error('Bank account not found or does not belong to user');
      }

      this.logger.info(`Deleted bank account ${accountId} for user ${userId}`);
    } catch (error) {
      this.logger.error('Error deleting bank account:', error);
      throw error;
    }
  }

  /**
   * Verify bank account using Paystack
   */
  async verifyAccount(accountNumber: string, bankCode: string): Promise<BankVerificationResponse> {
    try {
      const response = await axios.post(
        'https://api.paystack.co/transferrecipient',
        {
          type: 'nuban',
          name: 'Account Holder', // Will be updated after verification
          account_number: accountNumber,
          bank_code: bankCode,
          currency: 'NGN'
        },
        {
          headers: {
            Authorization: `Bearer ${this.paystackSecretKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.status) {
        return {
          success: true,
          accountName: response.data.data.details.account_name,
          bankName: this.getBankName(bankCode)
        };
      } else {
        return {
          success: false,
          error: response.data.message || 'Verification failed'
        };
      }
    } catch (error: any) {
      this.logger.error('Bank account verification failed:', error);
      
      if (error.response?.data?.message) {
        return {
          success: false,
          error: error.response.data.message
        };
      }

      return {
        success: false,
        error: 'Account verification service unavailable'
      };
    }
  }

  /**
   * Get list of supported banks
   */
  getSupportedBanks(): Array<{ code: string; name: string }> {
    return this.banks;
  }

  /**
   * Get bank name by code
   */
  getBankName(bankCode: string): string {
    const bank = this.banks.find(b => b.code === bankCode);
    return bank ? bank.name : 'Unknown Bank';
  }

  /**
   * Validate bank account number format
   */
  validateAccountNumber(accountNumber: string, bankCode: string): boolean {
    // Basic validation - account numbers are typically 10 digits for Nigerian banks
    const cleanNumber = accountNumber.replace(/\D/g, '');
    
    if (cleanNumber.length !== 10) {
      return false;
    }

    // Additional bank-specific validation can be added here
    return true;
  }

  /**
   * Get primary bank account for user
   */
  async getPrimaryBankAccount(userId: string): Promise<BankAccount | null> {
    try {
      const query = `
        SELECT id, user_id, account_number, bank_code, bank_name, account_name,
               account_type, is_verified, is_primary, verification_reference,
               verified_at, created_at, updated_at
        FROM bank_accounts
        WHERE user_id = $1 AND is_primary = true AND is_verified = true
        LIMIT 1
      `;

      const result = await this.db.query(query, [userId]);
      
      if (result.rows.length === 0) {
        return null;
      }

      return this.mapRowToBankAccount(result.rows[0]);
    } catch (error) {
      this.logger.error('Error getting primary bank account:', error);
      throw error;
    }
  }

  /**
   * Check if user has verified bank accounts
   */
  async hasVerifiedBankAccounts(userId: string): Promise<boolean> {
    try {
      const query = `
        SELECT COUNT(*) as count
        FROM bank_accounts
        WHERE user_id = $1 AND is_verified = true
      `;

      const result = await this.db.query(query, [userId]);
      return parseInt(result.rows[0].count) > 0;
    } catch (error) {
      this.logger.error('Error checking verified bank accounts:', error);
      throw error;
    }
  }

  /**
   * Map database row to BankAccount object
   */
  private mapRowToBankAccount(row: any): BankAccount {
    return {
      id: row.id,
      userId: row.user_id,
      accountNumber: row.account_number,
      bankCode: row.bank_code,
      bankName: row.bank_name,
      accountName: row.account_name,
      accountType: row.account_type,
      isVerified: row.is_verified,
      isPrimary: row.is_primary,
      verificationReference: row.verification_reference,
      verifiedAt: row.verified_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}
