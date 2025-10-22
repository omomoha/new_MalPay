import { query, transaction } from '../config/database';
import { logger } from '../utils/logger';
import { CustomError, handleDatabaseError } from '../middleware/errorHandler';

export class WalletService {
  async createWallet(client: any, userId: string): Promise<void> {
    try {
      await client.query(
        `INSERT INTO wallets (user_id, ngn_balance, usd_balance, usdt_balance, created_at, updated_at)
         VALUES ($1, 0.00, 0.00, 0.00, NOW(), NOW())`,
        [userId]
      );
      
      logger.info('Wallet created successfully', { userId });
    } catch (error) {
      logger.error('Failed to create wallet:', error);
      throw handleDatabaseError(error);
    }
  }

  async getWalletBalance(userId: string): Promise<any> {
    try {
      const result = await query(
        `SELECT id, user_id, ngn_balance, usd_balance, usdt_balance, created_at, updated_at
         FROM wallets WHERE user_id = $1`,
        [userId]
      );

      if (result.rows.length === 0) {
        throw new CustomError('Wallet not found', 404);
      }

      return {
        id: result.rows[0].id,
        userId: result.rows[0].user_id,
        balances: {
          NGN: parseFloat(result.rows[0].ngn_balance),
          USD: parseFloat(result.rows[0].usd_balance),
          USDT: parseFloat(result.rows[0].usdt_balance),
        },
        lastUpdated: result.rows[0].updated_at,
      };
    } catch (error) {
      logger.error('Failed to get wallet balance:', error);
      throw handleDatabaseError(error);
    }
  }

  async updateBalance(userId: string, currency: string, amount: number, operation: 'add' | 'subtract'): Promise<void> {
    try {
      const column = `${currency.toLowerCase()}_balance`;
      const operator = operation === 'add' ? '+' : '-';
      
      await query(
        `UPDATE wallets 
         SET ${column} = ${column} ${operator} $1, updated_at = NOW()
         WHERE user_id = $2`,
        [amount, userId]
      );

      logger.info('Wallet balance updated', { userId, currency, amount, operation });
    } catch (error) {
      logger.error('Failed to update wallet balance:', error);
      throw handleDatabaseError(error);
    }
  }

  async getWalletTransactions(userId: string, filters: any = {}): Promise<any[]> {
    try {
      const { page = 1, limit = 10, type, status, startDate, endDate } = filters;
      const offset = (page - 1) * limit;

      let whereClause = 'WHERE user_id = $1';
      const queryParams: any[] = [userId];
      let paramIndex = 2;

      if (type) {
        whereClause += ` AND type = $${paramIndex}`;
        queryParams.push(type);
        paramIndex++;
      }

      if (status) {
        whereClause += ` AND status = $${paramIndex}`;
        queryParams.push(status);
        paramIndex++;
      }

      if (startDate) {
        whereClause += ` AND created_at >= $${paramIndex}`;
        queryParams.push(startDate);
        paramIndex++;
      }

      if (endDate) {
        whereClause += ` AND created_at <= $${paramIndex}`;
        queryParams.push(endDate);
        paramIndex++;
      }

      const result = await query(
        `SELECT id, tx_hash, type, status, amount, currency, description, recipient_email, recipient_name, 
                sender_email, sender_name, crypto_processor_fee, malpay_charge, total_fees, exchange_rate, 
                processor, created_at, updated_at, completed_at, failure_reason
         FROM transactions 
         ${whereClause}
         ORDER BY created_at DESC
         LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
        [...queryParams, limit, offset]
      );

      return result.rows.map(row => ({
        id: row.id,
        txHash: row.tx_hash,
        type: row.type,
        status: row.status,
        amount: parseFloat(row.amount),
        currency: row.currency,
        description: row.description,
        recipientEmail: row.recipient_email,
        recipientName: row.recipient_name,
        senderEmail: row.sender_email,
        senderName: row.sender_name,
        fees: {
          cryptoProcessorFee: parseFloat(row.crypto_processor_fee),
          malpayCharge: parseFloat(row.malpay_charge),
          totalFees: parseFloat(row.total_fees),
        },
        exchangeRate: row.exchange_rate ? parseFloat(row.exchange_rate) : null,
        processor: row.processor,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        completedAt: row.completed_at,
        failureReason: row.failure_reason,
      }));
    } catch (error) {
      logger.error('Failed to get wallet transactions:', error);
      throw handleDatabaseError(error);
    }
  }

  async checkSufficientFunds(userId: string, amount: number, currency: string): Promise<boolean> {
    try {
      const wallet = await this.getWalletBalance(userId);
      const balance = wallet.balances[currency];
      
      return balance >= amount;
    } catch (error) {
      logger.error('Failed to check sufficient funds:', error);
      throw handleDatabaseError(error);
    }
  }

  async transferFunds(fromUserId: string, toUserId: string, amount: number, currency: string, description?: string): Promise<any> {
    try {
      return await transaction(async (client) => {
        // Check if sender has sufficient funds
        const senderWallet = await client.query(
          `SELECT ${currency.toLowerCase()}_balance FROM wallets WHERE user_id = $1`,
          [fromUserId]
        );

        if (senderWallet.rows.length === 0) {
          throw new CustomError('Sender wallet not found', 404);
        }

        const senderBalance = parseFloat(senderWallet.rows[0][`${currency.toLowerCase()}_balance`]);
        if (senderBalance < amount) {
          throw new CustomError('Insufficient funds', 400);
        }

        // Check if recipient wallet exists
        const recipientWallet = await client.query(
          `SELECT id FROM wallets WHERE user_id = $1`,
          [toUserId]
        );

        if (recipientWallet.rows.length === 0) {
          throw new CustomError('Recipient wallet not found', 404);
        }

        // Deduct from sender
        await client.query(
          `UPDATE wallets 
           SET ${currency.toLowerCase()}_balance = ${currency.toLowerCase()}_balance - $1, updated_at = NOW()
           WHERE user_id = $2`,
          [amount, fromUserId]
        );

        // Add to recipient
        await client.query(
          `UPDATE wallets 
           SET ${currency.toLowerCase()}_balance = ${currency.toLowerCase()}_balance + $1, updated_at = NOW()
           WHERE user_id = $2`,
          [amount, toUserId]
        );

        // Create transaction record
        const transactionResult = await client.query(
          `INSERT INTO transactions (id, user_id, type, status, amount, currency, description, created_at, updated_at)
           VALUES (uuid_generate_v4(), $1, 'transfer', 'completed', $2, $3, $4, NOW(), NOW())
           RETURNING id, created_at`,
          [fromUserId, amount, currency, description]
        );

        logger.info('Funds transferred successfully', { fromUserId, toUserId, amount, currency });

        return {
          transactionId: transactionResult.rows[0].id,
          createdAt: transactionResult.rows[0].created_at,
        };
      });
    } catch (error) {
      logger.error('Failed to transfer funds:', error);
      throw handleDatabaseError(error);
    }
  }
}