import { query, transaction } from '../config/database';
import { logger } from '../utils/logger';
import { CustomError, handleDatabaseError } from '../middleware/errorHandler';
import { BlockchainService, TransactionRequest } from './BlockchainService';
import { CardChargingService, CardChargeRequest } from './CardChargingService';
import { EmailService } from './EmailService';

export interface TransferRequest {
  senderId: string;
  recipientEmail: string;
  amount: number;
  currency: string;
  description?: string;
  processor: 'tron' | 'polygon' | 'ethereum';
}

export interface TransferResponse {
  success: boolean;
  transactionId?: string;
  txHash?: string;
  amount?: number;
  currency?: string;
  fees?: {
    cryptoProcessorFee: number;
    malpayCharge: number;
    totalFees: number;
  };
  recipient?: {
    email: string;
    name: string;
  };
  error?: string;
}

export interface DepositRequest {
  userId: string;
  amount: number;
  currency: string;
  processor: 'tron' | 'polygon' | 'ethereum';
}

export interface WithdrawalRequest {
  userId: string;
  amount: number;
  currency: string;
  processor: 'tron' | 'polygon' | 'ethereum';
  toAddress: string;
}

export class PaymentService {
  private blockchainService: BlockchainService;
  private cardChargingService: CardChargingService;
  private emailService: EmailService;

  constructor() {
    this.blockchainService = new BlockchainService();
    this.cardChargingService = new CardChargingService();
    this.emailService = new EmailService();
  }

  /**
   * Process user-to-user transfer with blockchain as payment processor
   */
  async processTransfer(request: TransferRequest): Promise<TransferResponse> {
    try {
      return await transaction(async (client) => {
        // 1. Find recipient by email
        const recipientResult = await client.query(
          'SELECT id, email, first_name, last_name FROM users WHERE email = $1',
          [request.recipientEmail]
        );

        if (recipientResult.rows.length === 0) {
          throw new CustomError('Recipient not found', 404);
        }

        const recipient = recipientResult.rows[0];

        // 2. Calculate blockchain processing fees
        const cryptoFees = this.blockchainService.calculateFees(request.processor, request.amount);
        const malpayCharge = this.calculateMalpayCharge(request.amount);
        const totalFees = cryptoFees.fee + malpayCharge;

        // 3. Convert amount to USDT for blockchain processing
        const amountUSDT = request.currency === 'NGN' ? request.amount / 1428.57 : request.amount;

        // 4. Charge sender's card for funding (NOT payment processing)
        const cardChargeRequest: CardChargeRequest = {
          userId: request.senderId,
          amount: request.amount,
          currency: request.currency,
          description: `Funding for transfer to ${recipient.email}`
        };

        const cardChargeResult = await this.cardChargingService.chargeCard(cardChargeRequest);
        if (!cardChargeResult.success) {
          throw new CustomError(`Card funding failed: ${cardChargeResult.error}`, 400);
        }

        // 5. Process payment via blockchain (THE ACTUAL PAYMENT PROCESSOR)
        const blockchainRequest: TransactionRequest = {
          to: this.getRecipientAddress(recipient.id, request.processor),
          amount: amountUSDT,
        };

        const blockchainResult = await this.blockchainService.sendTransaction(request.processor, blockchainRequest);

        if (!blockchainResult.success) {
          // Refund the card charge if blockchain processing fails
          await this.refundCardCharge(cardChargeResult.transactionId);
          throw new CustomError(`Blockchain payment processing failed: ${blockchainResult.error}`, 500);
        }

        // 6. Create transaction record
        const transactionResult = await client.query(
          `INSERT INTO transactions (id, tx_hash, user_id, type, status, amount, currency, description, 
           recipient_email, recipient_name, sender_email, sender_name, crypto_processor_fee, malpay_charge, 
           total_fees, exchange_rate, processor, gateway_transaction_id, created_at, updated_at, completed_at)
           VALUES (uuid_generate_v4(), $1, $2, 'transfer', 'completed', $3, $4, $5, $6, $7, $8, $9, 
           $10, $11, $12, $13, $14, $15, NOW(), NOW(), NOW())
           RETURNING id`,
          [
            blockchainResult.txHash,
            request.senderId,
            request.amount,
            request.currency,
            request.description,
            request.recipientEmail,
            `${recipient.first_name} ${recipient.last_name}`,
            'sender@example.com', // In production, get from sender profile
            'Sender Name', // In production, get from sender profile
            cryptoFees.fee,
            malpayCharge,
            totalFees,
            1428.57, // Exchange rate
            request.processor,
            cardChargeResult.transactionId
          ]
        );

        const transactionId = transactionResult.rows[0].id;

        // 7. Send notification emails
        await this.sendTransferNotifications(request.senderId, recipient.id, request.amount, request.currency);

        logger.info('Transfer completed successfully via blockchain payment processor', {
          transactionId,
          senderId: request.senderId,
          recipientEmail: request.recipientEmail,
          amount: request.amount,
          currency: request.currency,
          blockchainTxHash: blockchainResult.txHash,
          blockchainProcessor: request.processor,
          cardFundingId: cardChargeResult.transactionId
        });

        return {
          success: true,
          transactionId,
          txHash: blockchainResult.txHash,
          amount: request.amount,
          currency: request.currency,
          fees: {
            cryptoProcessorFee: cryptoFees.fee,
            malpayCharge,
            totalFees
          },
          recipient: {
            email: request.recipientEmail,
            name: `${recipient.first_name} ${recipient.last_name}`
          }
        };
      });
    } catch (error) {
      logger.error('Transfer processing error:', error);
      throw handleDatabaseError(error);
    }
  }

  /**
   * Process deposit (card charge to fund account)
   */
  async processDeposit(request: DepositRequest): Promise<TransferResponse> {
    try {
      return await transaction(async (client) => {
        // Charge user's card for the deposit amount
        const cardChargeRequest: CardChargeRequest = {
          userId: request.userId,
          amount: request.amount,
          currency: request.currency,
          description: `Deposit to MalPay account`
        };

        const cardChargeResult = await this.cardChargingService.chargeCard(cardChargeRequest);
        if (!cardChargeResult.success) {
          throw new CustomError(`Card charge failed: ${cardChargeResult.error}`, 400);
        }

        // Convert to USDT
        const amountUSDT = request.currency === 'NGN' ? request.amount / 1428.57 : request.amount;

        // Create transaction record
        const transactionResult = await client.query(
          `INSERT INTO transactions (id, user_id, type, status, amount, currency, description,
           crypto_processor_fee, malpay_charge, total_fees, gateway_transaction_id, 
           created_at, updated_at, completed_at)
           VALUES (uuid_generate_v4(), $1, 'deposit', 'completed', $2, $3, $4, $5, $6, $7, $8, NOW(), NOW(), NOW())
           RETURNING id`,
          [
            request.userId,
            request.amount,
            request.currency,
            'Deposit to account',
            cardChargeResult.fees.processingFee,
            cardChargeResult.fees.malpayCharge,
            cardChargeResult.fees.totalFees,
            cardChargeResult.transactionId
          ]
        );

        const transactionId = transactionResult.rows[0].id;

        logger.info('Deposit completed successfully', {
          transactionId,
          userId: request.userId,
          amount: request.amount,
          currency: request.currency,
          cardTransactionId: cardChargeResult.transactionId
        });

        return {
          success: true,
          transactionId,
          amount: request.amount,
          currency: request.currency,
          fees: cardChargeResult.fees
        };
      });
    } catch (error) {
      logger.error('Deposit processing error:', error);
      throw handleDatabaseError(error);
    }
  }

  /**
   * Process withdrawal (convert USDT to fiat and transfer to bank account)
   */
  async processWithdrawal(request: WithdrawalRequest): Promise<TransferResponse> {
    try {
      return await transaction(async (client) => {
        // Get user's bank account
        const bankAccountResult = await client.query(
          'SELECT * FROM bank_accounts WHERE user_id = $1 AND is_verified = true ORDER BY is_primary DESC LIMIT 1',
          [request.userId]
        );

        if (bankAccountResult.rows.length === 0) {
          throw new CustomError('No verified bank account found', 404);
        }

        const bankAccount = bankAccountResult.rows[0];

        // Convert amount to USDT
        const amountUSDT = request.currency === 'NGN' ? request.amount / 1428.57 : request.amount;

        // Calculate fees
        const cryptoFees = this.blockchainService.calculateFees(request.processor, amountUSDT);
        const malpayCharge = this.calculateMalpayCharge(request.amount);
        const totalFees = cryptoFees.fee + malpayCharge;

        // Process bank transfer
        const bankTransferResult = await this.processBankTransfer(
          bankAccount.account_number,
          bankAccount.bank_code,
          request.amount,
          request.currency
        );

        if (!bankTransferResult.success) {
          throw new CustomError(`Bank transfer failed: ${bankTransferResult.error}`, 400);
        }

        // Create transaction record
        const transactionResult = await client.query(
          `INSERT INTO transactions (id, user_id, type, status, amount, currency, description,
           crypto_processor_fee, malpay_charge, total_fees, gateway_transaction_id, 
           created_at, updated_at, completed_at)
           VALUES (uuid_generate_v4(), $1, 'withdrawal', 'completed', $2, $3, $4, $5, $6, $7, $8, NOW(), NOW(), NOW())
           RETURNING id`,
          [
            request.userId,
            request.amount,
            request.currency,
            'Withdrawal to bank account',
            cryptoFees.fee,
            malpayCharge,
            totalFees,
            bankTransferResult.transactionId
          ]
        );

        const transactionId = transactionResult.rows[0].id;

        logger.info('Withdrawal completed successfully', {
          transactionId,
          userId: request.userId,
          amount: request.amount,
          currency: request.currency,
          bankAccount: bankAccount.account_number
        });

        return {
          success: true,
          transactionId,
          amount: request.amount,
          currency: request.currency,
          fees: {
            cryptoProcessorFee: cryptoFees.fee,
            malpayCharge,
            totalFees
          }
        };
      });
    } catch (error) {
      logger.error('Withdrawal processing error:', error);
      throw handleDatabaseError(error);
    }
  }

  /**
   * Calculate MalPay charge (0.1% for amounts > ₦1000, capped at ₦2000)
   */
  private calculateMalpayCharge(amount: number): number {
    if (amount <= 1000) {
      return 0;
    }
    return Math.min(amount * 0.001, 2000);
  }

  /**
   * Get recipient's blockchain address
   */
  private getRecipientAddress(recipientId: string, processor: string): string {
    // TODO: Implement proper address generation/retrieval
    // For now, return a mock address
    return `recipient_${recipientId}_${processor}_address`;
  }

  /**
   * Refund a card charge
   */
  private async refundCardCharge(transactionId: string): Promise<void> {
    try {
      // TODO: Implement actual refund logic with payment gateway
      logger.info('Refunding card charge', { transactionId });
    } catch (error) {
      logger.error('Refund error:', error);
    }
  }

  /**
   * Process bank transfer
   */
  private async processBankTransfer(
    accountNumber: string,
    bankCode: string,
    amount: number,
    currency: string
  ): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    try {
      // TODO: Integrate with actual bank transfer API (Paystack/Flutterwave)
      // For now, simulate successful transfer
      const mockTransactionId = `BANK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      logger.info('Bank transfer processed', {
        accountNumber,
        bankCode,
        amount,
        currency,
        transactionId: mockTransactionId
      });

      return {
        success: true,
        transactionId: mockTransactionId
      };
    } catch (error) {
      logger.error('Bank transfer error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Bank transfer failed'
      };
    }
  }

  /**
   * Send transfer notifications
   */
  private async sendTransferNotifications(
    senderId: string,
    recipientId: string,
    amount: number,
    currency: string
  ): Promise<void> {
    try {
      // TODO: Implement actual email notifications
      logger.info('Sending transfer notifications', {
        senderId,
        recipientId,
        amount,
        currency
      });
    } catch (error) {
      logger.error('Notification error:', error);
    }
  }
}