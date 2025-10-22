import { Pool } from 'pg';
import { Logger } from 'winston';
import { WalletService } from './WalletService';
import { ExchangeRateService } from './ExchangeRateService';
import { BlockchainService } from './BlockchainService';
import { UserService } from './UserService';
import { NotificationService } from './NotificationService';

export interface Transaction {
  id: string;
  txHash?: string;
  senderId: string;
  receiverId: string;
  amountUSDT: number;
  amountFiat: number;
  currency: string;
  type: 'transfer' | 'deposit' | 'withdrawal' | 'fee';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  sourceType?: string;
  sourceId?: string;
  fee: number;
  exchangeRate: number;
  description?: string;
  metadata?: any;
  createdAt: Date;
  completedAt?: Date;
  failedAt?: Date;
  failureReason?: string;
}

export interface TransferRequest {
  senderId: string;
  receiverEmail: string;
  amount: number;
  currency: string;
  description?: string;
  pin: string;
}

export interface TransferResponse {
  transactionId: string;
  status: string;
  amount: number;
  currency: string;
  recipient: {
    username: string;
    email: string;
  };
  fee: number;
  estimatedCompletion?: string;
}

export class PaymentService {
  private db: Pool;
  private logger: Logger;
  private walletService: WalletService;
  private exchangeRateService: ExchangeRateService;
  private blockchainService: BlockchainService;
  private userService: UserService;
  private notificationService: NotificationService;

  constructor(
    db: Pool,
    logger: Logger,
    walletService: WalletService,
    exchangeRateService: ExchangeRateService,
    blockchainService: BlockchainService,
    userService: UserService,
    notificationService: NotificationService
  ) {
    this.db = db;
    this.logger = logger;
    this.walletService = walletService;
    this.exchangeRateService = exchangeRateService;
    this.blockchainService = blockchainService;
    this.userService = userService;
    this.notificationService = notificationService;
  }

  /**
   * Transfer money between users (USDT internal with fiat display)
   */
  async transfer(request: TransferRequest): Promise<TransferResponse> {
    const client = await this.db.connect();
    
    try {
      await client.query('BEGIN');

      // 1. Find receiver by email
      const receiver = await this.userService.findByEmail(request.receiverEmail);
      if (!receiver) {
        throw new Error('Receiver not found');
      }

      // 2. Get current exchange rate
      const exchangeRate = await this.exchangeRateService.getUSDTToFiatRate(request.currency);

      // 3. Convert fiat amount to USDT
      const amountUSDT = request.amount / exchangeRate;

      // 4. Check sender balance
      const senderWallet = await this.walletService.getByUserId(request.senderId);
      if (!senderWallet) {
        throw new Error('Sender wallet not found');
      }

      if (senderWallet.balanceUSDT < amountUSDT) {
        throw new Error('Insufficient balance');
      }

      // 5. Calculate fee (2.5% of fiat amount)
      const fee = request.amount * 0.025;
      const feeUSDT = fee / exchangeRate;

      // 6. Create transaction record
      const transactionQuery = `
        INSERT INTO transactions (
          sender_id, receiver_id, amount_usdt, amount_fiat, currency, 
          tx_type, status, exchange_rate, fee, description
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id, created_at
      `;

      const transactionResult = await client.query(transactionQuery, [
        request.senderId,
        receiver.id,
        amountUSDT,
        request.amount,
        request.currency,
        'transfer',
        'pending',
        exchangeRate,
        fee,
        request.description
      ]);

      const transactionId = transactionResult.rows[0].id;

      // 7. Execute blockchain transfer
      const txHash = await this.blockchainService.transferUSDT(
        senderWallet.walletAddress,
        receiver.walletAddress,
        amountUSDT
      );

      // 8. Update transaction with hash
      await client.query(
        'UPDATE transactions SET tx_hash = $1, status = $2 WHERE id = $3',
        [txHash, 'processing', transactionId]
      );

      // 9. Update wallet balances
      await this.walletService.deductUSDT(request.senderId, amountUSDT);
      await this.walletService.addUSDT(receiver.id, amountUSDT);

      // 10. Update transaction status to completed
      await client.query(
        'UPDATE transactions SET status = $1, completed_at = CURRENT_TIMESTAMP WHERE id = $2',
        ['completed', transactionId]
      );

      // 11. Send notifications
      await this.notificationService.sendNotification(
        request.senderId,
        'transaction',
        'Transfer Sent',
        `You sent ${request.currency} ${request.amount.toFixed(2)} to ${receiver.email}`
      );

      await this.notificationService.sendNotification(
        receiver.id,
        'transaction',
        'Transfer Received',
        `You received ${request.currency} ${request.amount.toFixed(2)} from ${request.senderId}`
      );

      await client.query('COMMIT');

      this.logger.info(`Transfer completed: ${transactionId}`);

      return {
        transactionId,
        status: 'completed',
        amount: request.amount,
        currency: request.currency,
        recipient: {
          username: receiver.username,
          email: receiver.email
        },
        fee,
        estimatedCompletion: new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 minutes
      };

    } catch (error) {
      await client.query('ROLLBACK');
      this.logger.error('Transfer failed:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get transaction by ID
   */
  async getTransaction(transactionId: string): Promise<Transaction | null> {
    try {
      const query = `
        SELECT id, tx_hash, sender_id, receiver_id, amount_usdt, amount_fiat, currency,
               tx_type, status, source_type, source_id, exchange_rate, fee, description,
               metadata, created_at, completed_at, failed_at, failure_reason
        FROM transactions
        WHERE id = $1
      `;

      const result = await this.db.query(query, [transactionId]);
      
      if (result.rows.length === 0) {
        return null;
      }

      return this.mapRowToTransaction(result.rows[0]);
    } catch (error) {
      this.logger.error('Error getting transaction:', error);
      throw error;
    }
  }

  /**
   * Get transactions for a user
   */
  async getTransactions(
    userId: string, 
    limit: number = 20, 
    offset: number = 0,
    type?: string,
    status?: string
  ): Promise<Transaction[]> {
    try {
      let query = `
        SELECT id, tx_hash, sender_id, receiver_id, amount_usdt, amount_fiat, currency,
               tx_type, status, source_type, source_id, exchange_rate, fee, description,
               metadata, created_at, completed_at, failed_at, failure_reason
        FROM transactions
        WHERE (sender_id = $1 OR receiver_id = $1)
      `;
      
      const params: any[] = [userId];
      let paramCount = 1;

      if (type) {
        paramCount++;
        query += ` AND tx_type = $${paramCount}`;
        params.push(type);
      }

      if (status) {
        paramCount++;
        query += ` AND status = $${paramCount}`;
        params.push(status);
      }

      query += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
      params.push(limit, offset);

      const result = await this.db.query(query, params);
      return result.rows.map(row => this.mapRowToTransaction(row));
    } catch (error) {
      this.logger.error('Error getting transactions:', error);
      throw error;
    }
  }

  /**
   * Process deposit from external source
   */
  async processDeposit(
    userId: string, 
    amount: number, 
    currency: string, 
    sourceType: string, 
    sourceId: string
  ): Promise<Transaction> {
    const client = await this.db.connect();
    
    try {
      await client.query('BEGIN');

      // Get exchange rate and convert to USDT
      const exchangeRate = await this.exchangeRateService.getUSDTToFiatRate(currency);
      const amountUSDT = amount / exchangeRate;

      // Create transaction record
      const transactionQuery = `
        INSERT INTO transactions (
          sender_id, receiver_id, amount_usdt, amount_fiat, currency,
          tx_type, status, source_type, source_id, exchange_rate, fee
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING id, created_at
      `;

      const result = await client.query(transactionQuery, [
        null, // No sender for deposits
        userId,
        amountUSDT,
        amount,
        currency,
        'deposit',
        'pending',
        sourceType,
        sourceId,
        exchangeRate,
        0 // No fee for deposits
      ]);

      const transactionId = result.rows[0].id;

      // Add to wallet
      await this.walletService.addUSDT(userId, amountUSDT);

      // Update transaction status
      await client.query(
        'UPDATE transactions SET status = $1, completed_at = CURRENT_TIMESTAMP WHERE id = $2',
        ['completed', transactionId]
      );

      await client.query('COMMIT');

      // Send notification
      await this.notificationService.sendNotification(
        userId,
        'transaction',
        'Deposit Received',
        `You received ${currency} ${amount.toFixed(2)}`
      );

      const transaction = await this.getTransaction(transactionId);
      return transaction!;

    } catch (error) {
      await client.query('ROLLBACK');
      this.logger.error('Deposit processing failed:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Process withdrawal to external destination
   */
  async processWithdrawal(
    userId: string,
    amount: number,
    currency: string,
    destinationType: string,
    destinationId: string
  ): Promise<Transaction> {
    const client = await this.db.connect();
    
    try {
      await client.query('BEGIN');

      // Get exchange rate and convert to USDT
      const exchangeRate = await this.exchangeRateService.getUSDTToFiatRate(currency);
      const amountUSDT = amount / exchangeRate;

      // Check balance
      const wallet = await this.walletService.getByUserId(userId);
      if (!wallet || wallet.balanceUSDT < amountUSDT) {
        throw new Error('Insufficient balance');
      }

      // Calculate fee
      const fee = amount * 0.025;
      const feeUSDT = fee / exchangeRate;
      const totalUSDT = amountUSDT + feeUSDT;

      // Create transaction record
      const transactionQuery = `
        INSERT INTO transactions (
          sender_id, receiver_id, amount_usdt, amount_fiat, currency,
          tx_type, status, source_type, source_id, exchange_rate, fee
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING id, created_at
      `;

      const result = await client.query(transactionQuery, [
        userId,
        null, // No receiver for withdrawals
        totalUSDT,
        amount + fee,
        currency,
        'withdrawal',
        'pending',
        destinationType,
        destinationId,
        exchangeRate,
        fee
      ]);

      const transactionId = result.rows[0].id;

      // Deduct from wallet
      await this.walletService.deductUSDT(userId, totalUSDT);

      // Update transaction status
      await client.query(
        'UPDATE transactions SET status = $1, completed_at = CURRENT_TIMESTAMP WHERE id = $2',
        ['completed', transactionId]
      );

      await client.query('COMMIT');

      // Send notification
      await this.notificationService.sendNotification(
        userId,
        'transaction',
        'Withdrawal Processed',
        `You withdrew ${currency} ${amount.toFixed(2)}`
      );

      const transaction = await this.getTransaction(transactionId);
      return transaction!;

    } catch (error) {
      await client.query('ROLLBACK');
      this.logger.error('Withdrawal processing failed:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Map database row to Transaction object
   */
  private mapRowToTransaction(row: any): Transaction {
    return {
      id: row.id,
      txHash: row.tx_hash,
      senderId: row.sender_id,
      receiverId: row.receiver_id,
      amountUSDT: parseFloat(row.amount_usdt),
      amountFiat: parseFloat(row.amount_fiat),
      currency: row.currency,
      type: row.tx_type,
      status: row.status,
      sourceType: row.source_type,
      sourceId: row.source_id,
      fee: parseFloat(row.fee),
      exchangeRate: parseFloat(row.exchange_rate),
      description: row.description,
      metadata: row.metadata,
      createdAt: row.created_at,
      completedAt: row.completed_at,
      failedAt: row.failed_at,
      failureReason: row.failure_reason
    };
  }
}
