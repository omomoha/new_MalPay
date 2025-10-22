import { Pool } from 'pg';
import { Logger } from 'winston';
import axios from 'axios';
import { WalletService } from './WalletService';
import { ExchangeRateService } from './ExchangeRateService';
import { BankAccountService } from './BankAccountService';
import { NotificationService } from './NotificationService';

export interface WithdrawalRequest {
  id: string;
  userId: string;
  bankAccountId: string;
  amountUSDT: number;
  amountFiat: number;
  currency: string;
  exchangeRate: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  txHash?: string;
  fee: number;
  processingFee: number;
  createdAt: Date;
  completedAt?: Date;
  failureReason?: string;
}

export interface CreateWithdrawalData {
  userId: string;
  bankAccountId: string;
  amount: number;
  currency: string;
  pin: string;
}

export interface WithdrawalResponse {
  withdrawalId: string;
  status: string;
  amount: number;
  currency: string;
  fee: number;
  estimatedCompletion: string;
}

export class WithdrawalService {
  private db: Pool;
  private logger: Logger;
  private walletService: WalletService;
  private exchangeRateService: ExchangeRateService;
  private bankAccountService: BankAccountService;
  private notificationService: NotificationService;
  private paystackSecretKey: string;

  constructor(
    db: Pool,
    logger: Logger,
    walletService: WalletService,
    exchangeRateService: ExchangeRateService,
    bankAccountService: BankAccountService,
    notificationService: NotificationService,
    paystackSecretKey: string
  ) {
    this.db = db;
    this.logger = logger;
    this.walletService = walletService;
    this.exchangeRateService = exchangeRateService;
    this.bankAccountService = bankAccountService;
    this.notificationService = notificationService;
    this.paystackSecretKey = paystackSecretKey;
  }

  /**
   * Create a withdrawal request
   */
  async createWithdrawal(data: CreateWithdrawalData): Promise<WithdrawalResponse> {
    const client = await this.db.connect();
    
    try {
      await client.query('BEGIN');

      // 1. Verify bank account belongs to user
      const bankAccount = await this.bankAccountService.getBankAccountById(data.bankAccountId);
      if (!bankAccount || bankAccount.userId !== data.userId) {
        throw new Error('Bank account not found or does not belong to user');
      }

      if (!bankAccount.isVerified) {
        throw new Error('Bank account must be verified before withdrawal');
      }

      // 2. Get exchange rate and convert to USDT
      const exchangeRate = await this.exchangeRateService.getUSDTToFiatRate(data.currency);
      const amountUSDT = data.amount / exchangeRate;

      // 3. Check wallet balance
      const wallet = await this.walletService.getByUserId(data.userId);
      if (!wallet) {
        throw new Error('Wallet not found');
      }

      if (wallet.balanceUSDT < amountUSDT) {
        throw new Error('Insufficient balance');
      }

      // 4. Calculate fees
      const fee = data.amount * 0.025; // 2.5% fee
      const processingFee = data.amount * 0.01; // 1% processing fee
      const totalFee = fee + processingFee;
      const totalAmount = data.amount + totalFee;
      const totalAmountUSDT = totalAmount / exchangeRate;

      // 5. Check if user has enough balance for fees
      if (wallet.balanceUSDT < totalAmountUSDT) {
        throw new Error(`Insufficient balance. Required: ${data.currency} ${totalAmount.toFixed(2)} (including fees)`);
      }

      // 6. Create withdrawal request
      const withdrawalQuery = `
        INSERT INTO withdrawal_requests (
          user_id, bank_account_id, amount_usdt, amount_fiat, currency,
          exchange_rate, fee, processing_fee, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id, created_at
      `;

      const result = await client.query(withdrawalQuery, [
        data.userId,
        data.bankAccountId,
        amountUSDT,
        data.amount,
        data.currency,
        exchangeRate,
        fee,
        processingFee,
        'pending'
      ]);

      const withdrawalId = result.rows[0].id;

      // 7. Process withdrawal
      await this.processWithdrawal(withdrawalId);

      await client.query('COMMIT');

      // 8. Send notification
      await this.notificationService.sendNotification(
        data.userId,
        'transaction',
        'Withdrawal Requested',
        `Withdrawal request of ${data.currency} ${data.amount.toFixed(2)} has been submitted`
      );

      this.logger.info(`Withdrawal request created: ${withdrawalId}`);

      return {
        withdrawalId,
        status: 'pending',
        amount: data.amount,
        currency: data.currency,
        fee: totalFee,
        estimatedCompletion: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      };

    } catch (error) {
      await client.query('ROLLBACK');
      this.logger.error('Error creating withdrawal:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Process withdrawal request
   */
  async processWithdrawal(withdrawalId: string): Promise<void> {
    const client = await this.db.connect();
    
    try {
      await client.query('BEGIN');

      // 1. Get withdrawal request
      const withdrawal = await this.getWithdrawalById(withdrawalId);
      if (!withdrawal) {
        throw new Error('Withdrawal request not found');
      }

      if (withdrawal.status !== 'pending') {
        throw new Error('Withdrawal request is not pending');
      }

      // 2. Update status to processing
      await client.query(
        'UPDATE withdrawal_requests SET status = $1 WHERE id = $2',
        ['processing', withdrawalId]
      );

      // 3. Get bank account details
      const bankAccount = await this.bankAccountService.getBankAccountById(withdrawal.bankAccountId);
      if (!bankAccount) {
        throw new Error('Bank account not found');
      }

      // 4. Process transfer via Paystack
      const transferResult = await this.processBankTransfer(
        bankAccount.accountNumber,
        bankAccount.bankCode,
        withdrawal.amountFiat,
        withdrawal.currency
      );

      if (transferResult.success) {
        // 5. Deduct from wallet
        const totalAmountUSDT = withdrawal.amountUSDT + (withdrawal.fee / withdrawal.exchangeRate) + (withdrawal.processingFee / withdrawal.exchangeRate);
        await this.walletService.deductUSDT(withdrawal.userId, totalAmountUSDT);

        // 6. Update withdrawal status
        await client.query(
          'UPDATE withdrawal_requests SET status = $1, tx_hash = $2, completed_at = CURRENT_TIMESTAMP WHERE id = $3',
          ['completed', transferResult.transferCode, withdrawalId]
        );

        // 7. Create transaction record
        await client.query(`
          INSERT INTO transactions (
            sender_id, receiver_id, amount_usdt, amount_fiat, currency,
            tx_type, status, source_type, source_id, exchange_rate, fee,
            description, completed_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, CURRENT_TIMESTAMP)
        `, [
          withdrawal.userId,
          null, // No receiver for withdrawals
          totalAmountUSDT,
          withdrawal.amountFiat + withdrawal.fee + withdrawal.processingFee,
          withdrawal.currency,
          'withdrawal',
          'completed',
          'bank_account',
          withdrawal.bankAccountId,
          withdrawal.exchangeRate,
          withdrawal.fee + withdrawal.processingFee,
          `Withdrawal to ${bankAccount.bankName} - ${bankAccount.accountNumber}`
        ]);

        // 8. Send success notification
        await this.notificationService.sendNotification(
          withdrawal.userId,
          'transaction',
          'Withdrawal Completed',
          `Your withdrawal of ${withdrawal.currency} ${withdrawal.amountFiat.toFixed(2)} has been completed`
        );

        this.logger.info(`Withdrawal completed: ${withdrawalId}`);
      } else {
        // 9. Mark as failed
        await client.query(
          'UPDATE withdrawal_requests SET status = $1, failure_reason = $2 WHERE id = $3',
          ['failed', transferResult.error, withdrawalId]
        );

        // 10. Send failure notification
        await this.notificationService.sendNotification(
          withdrawal.userId,
          'transaction',
          'Withdrawal Failed',
          `Your withdrawal request failed: ${transferResult.error}`
        );

        this.logger.error(`Withdrawal failed: ${withdrawalId} - ${transferResult.error}`);
      }

      await client.query('COMMIT');

    } catch (error) {
      await client.query('ROLLBACK');
      
      // Mark withdrawal as failed
      await client.query(
        'UPDATE withdrawal_requests SET status = $1, failure_reason = $2 WHERE id = $3',
        ['failed', error.message, withdrawalId]
      );

      this.logger.error('Error processing withdrawal:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Process bank transfer via Paystack
   */
  private async processBankTransfer(
    accountNumber: string,
    bankCode: string,
    amount: number,
    currency: string
  ): Promise<{ success: boolean; transferCode?: string; error?: string }> {
    try {
      // 1. Create transfer recipient
      const recipientResponse = await axios.post(
        'https://api.paystack.co/transferrecipient',
        {
          type: 'nuban',
          name: 'MalPay User',
          account_number: accountNumber,
          bank_code: bankCode,
          currency: currency
        },
        {
          headers: {
            Authorization: `Bearer ${this.paystackSecretKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!recipientResponse.data.status) {
        return {
          success: false,
          error: recipientResponse.data.message || 'Failed to create transfer recipient'
        };
      }

      const recipientCode = recipientResponse.data.data.recipient_code;

      // 2. Initiate transfer
      const transferResponse = await axios.post(
        'https://api.paystack.co/transfer',
        {
          source: 'balance',
          amount: Math.round(amount * 100), // Convert to kobo
          recipient: recipientCode,
          reason: 'MalPay Withdrawal'
        },
        {
          headers: {
            Authorization: `Bearer ${this.paystackSecretKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (transferResponse.data.status) {
        return {
          success: true,
          transferCode: transferResponse.data.data.reference
        };
      } else {
        return {
          success: false,
          error: transferResponse.data.message || 'Transfer failed'
        };
      }

    } catch (error: any) {
      this.logger.error('Bank transfer failed:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Transfer service unavailable'
      };
    }
  }

  /**
   * Get withdrawal by ID
   */
  async getWithdrawalById(withdrawalId: string): Promise<WithdrawalRequest | null> {
    try {
      const query = `
        SELECT id, user_id, bank_account_id, amount_usdt, amount_fiat, currency,
               exchange_rate, status, tx_hash, fee, processing_fee, created_at,
               completed_at, failure_reason
        FROM withdrawal_requests
        WHERE id = $1
      `;

      const result = await this.db.query(query, [withdrawalId]);
      
      if (result.rows.length === 0) {
        return null;
      }

      return this.mapRowToWithdrawalRequest(result.rows[0]);
    } catch (error) {
      this.logger.error('Error getting withdrawal by ID:', error);
      throw error;
    }
  }

  /**
   * Get withdrawals for a user
   */
  async getWithdrawalsByUserId(
    userId: string, 
    limit: number = 20, 
    offset: number = 0
  ): Promise<WithdrawalRequest[]> {
    try {
      const query = `
        SELECT id, user_id, bank_account_id, amount_usdt, amount_fiat, currency,
               exchange_rate, status, tx_hash, fee, processing_fee, created_at,
               completed_at, failure_reason
        FROM withdrawal_requests
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3
      `;

      const result = await this.db.query(query, [userId, limit, offset]);
      return result.rows.map(row => this.mapRowToWithdrawalRequest(row));
    } catch (error) {
      this.logger.error('Error getting withdrawals by user ID:', error);
      throw error;
    }
  }

  /**
   * Cancel withdrawal request
   */
  async cancelWithdrawal(userId: string, withdrawalId: string): Promise<void> {
    try {
      const query = `
        UPDATE withdrawal_requests 
        SET status = $1 
        WHERE id = $2 AND user_id = $3 AND status = $4
      `;

      const result = await this.db.query(query, ['cancelled', withdrawalId, userId, 'pending']);
      
      if (result.rowCount === 0) {
        throw new Error('Withdrawal request not found or cannot be cancelled');
      }

      this.logger.info(`Withdrawal cancelled: ${withdrawalId}`);
    } catch (error) {
      this.logger.error('Error cancelling withdrawal:', error);
      throw error;
    }
  }

  /**
   * Get withdrawal statistics for a user
   */
  async getWithdrawalStats(userId: string): Promise<{
    totalWithdrawals: number;
    totalAmount: number;
    pendingWithdrawals: number;
    completedWithdrawals: number;
    failedWithdrawals: number;
  }> {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_withdrawals,
          SUM(amount_fiat) as total_amount,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_withdrawals,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_withdrawals,
          SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_withdrawals
        FROM withdrawal_requests
        WHERE user_id = $1
      `;

      const result = await this.db.query(query, [userId]);
      const row = result.rows[0];

      return {
        totalWithdrawals: parseInt(row.total_withdrawals) || 0,
        totalAmount: parseFloat(row.total_amount) || 0,
        pendingWithdrawals: parseInt(row.pending_withdrawals) || 0,
        completedWithdrawals: parseInt(row.completed_withdrawals) || 0,
        failedWithdrawals: parseInt(row.failed_withdrawals) || 0
      };
    } catch (error) {
      this.logger.error('Error getting withdrawal stats:', error);
      throw error;
    }
  }

  /**
   * Map database row to WithdrawalRequest object
   */
  private mapRowToWithdrawalRequest(row: any): WithdrawalRequest {
    return {
      id: row.id,
      userId: row.user_id,
      bankAccountId: row.bank_account_id,
      amountUSDT: parseFloat(row.amount_usdt),
      amountFiat: parseFloat(row.amount_fiat),
      currency: row.currency,
      exchangeRate: parseFloat(row.exchange_rate),
      status: row.status,
      txHash: row.tx_hash,
      fee: parseFloat(row.fee),
      processingFee: parseFloat(row.processing_fee),
      createdAt: row.created_at,
      completedAt: row.completed_at,
      failureReason: row.failure_reason
    };
  }
}
