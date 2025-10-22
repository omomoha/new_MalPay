import { query, transaction } from '../config/database';
import { logger } from '../utils/logger';
import { CustomError, handleDatabaseError } from '../middleware/errorHandler';
import { CardEncryptionService } from './CardEncryptionService';

export interface CardChargeRequest {
  userId: string;
  amount: number;
  currency: string;
  description?: string;
  cardId?: string; // Optional - if not provided, uses default card
}

export interface CardChargeResponse {
  success: boolean;
  transactionId: string;
  amount: number;
  currency: string;
  fees: {
    processingFee: number;
    malpayCharge: number;
    totalFees: number;
  };
  cardDetails: {
    maskedNumber: string;
    cardType: string;
  };
  error?: string;
}

export interface CardChargeResult {
  success: boolean;
  transactionId?: string;
  error?: string;
  gatewayResponse?: any;
}

export class CardChargingService {
  private cardEncryptionService: CardEncryptionService;

  constructor() {
    this.cardEncryptionService = new CardEncryptionService();
  }

  /**
   * Charge user's card directly for a transaction
   */
  async chargeCard(request: CardChargeRequest): Promise<CardChargeResponse> {
    try {
      return await transaction(async (client) => {
        // 1. Get user's card (default or specified)
        const card = await this.getUserCard(client, request.userId, request.cardId);
        if (!card) {
          throw new CustomError('No active card found for user', 404);
        }

        // 2. Calculate fees
        const fees = this.calculateCharges(request.amount, request.currency);
        const totalAmount = request.amount + fees.totalFees;

        // 3. Decrypt card details for charging
        const decryptedCardNumber = this.cardEncryptionService.decryptCardNumber(card.card_number_encrypted);
        const decryptedCvv = this.cardEncryptionService.decryptCvv(card.cvv_encrypted);

        // 4. Process card charge through payment gateway
        const chargeResult = await this.processCardCharge({
          cardNumber: decryptedCardNumber,
          cvv: decryptedCvv,
          expiryMonth: card.expiry_month,
          expiryYear: card.expiry_year,
          cardholderName: card.cardholder_name,
          amount: totalAmount,
          currency: request.currency,
          description: request.description || 'MalPay Transaction'
        });

        if (!chargeResult.success) {
          throw new CustomError(`Card charge failed: ${chargeResult.error}`, 400);
        }

        // 5. Create transaction record
        const transactionResult = await client.query(
          `INSERT INTO transactions (id, user_id, type, status, amount, currency, description,
           crypto_processor_fee, malpay_charge, total_fees, gateway_transaction_id, 
           created_at, updated_at, completed_at)
           VALUES (uuid_generate_v4(), $1, 'card_charge', 'completed', $2, $3, $4, $5, $6, $7, $8, NOW(), NOW(), NOW())
           RETURNING id`,
          [
            request.userId,
            request.amount,
            request.currency,
            request.description || 'Card charge',
            fees.processingFee,
            fees.malpayCharge,
            fees.totalFees,
            chargeResult.transactionId
          ]
        );

        const transactionId = transactionResult.rows[0].id;

        logger.info('Card charged successfully', {
          userId: request.userId,
          amount: request.amount,
          currency: request.currency,
          transactionId,
          cardId: card.id
        });

        return {
          success: true,
          transactionId,
          amount: request.amount,
          currency: request.currency,
          fees,
          cardDetails: {
            maskedNumber: card.card_number_masked,
            cardType: card.card_type
          }
        };
      });
    } catch (error) {
      logger.error('Card charging error:', error);
      throw handleDatabaseError(error);
    }
  }

  /**
   * Get user's card (default or specified)
   */
  private async getUserCard(client: any, userId: string, cardId?: string): Promise<any> {
    let queryText: string;
    let params: any[];

    if (cardId) {
      // Get specific card
      queryText = `
        SELECT id, card_number_encrypted, card_number_masked, card_type, expiry_month, 
               expiry_year, cvv_encrypted, cardholder_name, is_default
        FROM linked_cards 
        WHERE user_id = $1 AND id = $2 AND is_active = true
      `;
      params = [userId, cardId];
    } else {
      // Get default card
      queryText = `
        SELECT id, card_number_encrypted, card_number_masked, card_type, expiry_month, 
               expiry_year, cvv_encrypted, cardholder_name, is_default
        FROM linked_cards 
        WHERE user_id = $1 AND is_active = true 
        ORDER BY is_default DESC, created_at DESC 
        LIMIT 1
      `;
      params = [userId];
    }

    const result = await client.query(queryText, params);
    return result.rows[0] || null;
  }

  /**
   * Calculate charges for card funding (NOT payment processing fees)
   * Payment processing fees are handled by blockchain networks
   */
  private calculateCharges(amount: number, currency: string): {
    processingFee: number;
    malpayCharge: number;
    totalFees: number;
  } {
    // Card processing fee (for charging the card, not payment processing)
    // This is for funding the transaction, blockchain handles payment processing
    const processingFee = (amount * 0.015) + 50;

    // MalPay charge - 0.1% for amounts > ₦1000, capped at ₦2000
    let malpayCharge = 0;
    if (amount > 1000) {
      malpayCharge = Math.min(amount * 0.001, 2000);
    }

    const totalFees = processingFee + malpayCharge;

    return {
      processingFee,
      malpayCharge,
      totalFees
    };
  }

  /**
   * Process card charge for funding (NOT payment processing)
   * The blockchain is the actual payment processor
   */
  private async processCardCharge(cardDetails: {
    cardNumber: string;
    cvv: string;
    expiryMonth: number;
    expiryYear: number;
    cardholderName: string;
    amount: number;
    currency: string;
    description: string;
  }): Promise<CardChargeResult> {
    try {
      // TODO: Integrate with card processing gateway (for card charging only)
      // This is NOT for payment processing - blockchain handles that
      // This is only for charging the user's card to fund the transaction
      
      // Simulate card charge response
      const mockTransactionId = `CARD_CHARGE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      logger.info('Card charged for funding (blockchain will process payment)', {
        amount: cardDetails.amount,
        currency: cardDetails.currency,
        transactionId: mockTransactionId,
        cardType: this.cardEncryptionService.getCardType(cardDetails.cardNumber),
        note: 'Blockchain will handle actual payment processing'
      });

      return {
        success: true,
        transactionId: mockTransactionId,
        gatewayResponse: {
          status: 'success',
          reference: mockTransactionId,
          amount: cardDetails.amount,
          currency: cardDetails.currency,
          purpose: 'funding' // Not payment processing
        }
      };
    } catch (error) {
      logger.error('Card charging error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Card charging failed'
      };
    }
  }

  /**
   * Verify card is valid and active
   */
  async verifyCard(userId: string, cardId: string): Promise<boolean> {
    try {
      const result = await query(
        'SELECT id FROM linked_cards WHERE user_id = $1 AND id = $2 AND is_active = true',
        [userId, cardId]
      );
      return result.rows.length > 0;
    } catch (error) {
      logger.error('Card verification error:', error);
      return false;
    }
  }

  /**
   * Get user's available cards for charging
   */
  async getUserCards(userId: string): Promise<any[]> {
    try {
      const result = await query(
        `SELECT id, card_number_masked, card_type, expiry_month, expiry_year, 
                cardholder_name, is_default, created_at
         FROM linked_cards 
         WHERE user_id = $1 AND is_active = true 
         ORDER BY is_default DESC, created_at DESC`,
        [userId]
      );
      return result.rows;
    } catch (error) {
      logger.error('Get user cards error:', error);
      throw handleDatabaseError(error);
    }
  }
}
