import { Request, Response } from 'express';
import { query, transaction } from '../config/database';
import { logger } from '../utils/logger';
import { handleDatabaseError, CustomError } from '../middleware/errorHandler';
import { CardEncryptionService } from '../services/CardEncryptionService';

export class CardController {
  private cardEncryptionService: CardEncryptionService;

  constructor() {
    this.cardEncryptionService = new CardEncryptionService();
  }

  // Get user's cards
  getCards = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: { message: 'User not authenticated' },
        });
        return;
      }

      const result = await query(
        `SELECT id, card_number_masked, card_type, expiry_month, expiry_year, 
                cardholder_name, is_default, created_at
         FROM linked_cards 
         WHERE user_id = $1 AND is_active = true 
         ORDER BY is_default DESC, created_at DESC`,
        [userId]
      );

      const cards = result.rows.map(card => ({
        id: card.id,
        cardNumberMasked: card.card_number_masked,
        cardType: card.card_type,
        expiryMonth: card.expiry_month,
        expiryYear: card.expiry_year,
        cardholderName: card.cardholder_name,
        isDefault: card.is_default,
        createdAt: card.created_at,
      }));

      res.json({
        success: true,
        cards,
        count: cards.length,
        maxCards: 3,
      });
    } catch (error) {
      logger.error('Get cards error:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to fetch cards' },
      });
    }
  };

  // Add a new card
  addCard = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      const { cardNumber, expiryMonth, expiryYear, cvv, cardholderName } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: { message: 'User not authenticated' },
        });
        return;
      }

      // Check card limit (max 3 cards)
      const existingCardsResult = await query(
        'SELECT COUNT(*) as count FROM linked_cards WHERE user_id = $1 AND is_active = true',
        [userId]
      );
      const existingCardCount = parseInt(existingCardsResult.rows[0].count);
      if (existingCardCount >= 3) {
        res.status(400).json({
          success: false,
          error: { message: 'Maximum of 3 cards allowed. Please remove a card before adding a new one.' },
        });
        return;
      }

      // Validate card number using Luhn algorithm
      if (!this.cardEncryptionService.validateCardNumber(cardNumber)) {
        res.status(400).json({
          success: false,
          error: { message: 'Invalid card number' },
        });
        return;
      }

      // Validate expiry date
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;

      if (expiryYear < currentYear || (expiryYear === currentYear && expiryMonth < currentMonth)) {
        res.status(400).json({
          success: false,
          error: { message: 'Card has expired' },
        });
        return;
      }

      // Get card type for CVV validation
      const cardType = this.cardEncryptionService.getCardType(cardNumber);

      // Validate CVV
      if (!this.cardEncryptionService.validateCvv(cvv, cardType)) {
        res.status(400).json({
          success: false,
          error: { message: 'Invalid CVV' },
        });
        return;
      }

      // Process card addition in transaction
      const result = await transaction(async (client) => {
        // Encrypt card details
        const encryptedCardNumber = this.cardEncryptionService.encryptCardNumber(cardNumber);
        const encryptedCvv = this.cardEncryptionService.encryptCvv(cvv);
        const cardNumberMasked = this.cardEncryptionService.maskCardNumber(cardNumber);

        // Insert card
        const cardResult = await client.query(
          `INSERT INTO linked_cards (id, user_id, card_number_encrypted, card_number_masked, 
           card_type, expiry_month, expiry_year, cvv_encrypted, cardholder_name, is_default, 
           is_active, created_at, updated_at)
           VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, $6, $7, $8, $9, true, NOW(), NOW())
           RETURNING id, card_number_masked, card_type, expiry_month, expiry_year, 
           cardholder_name, is_default, created_at`,
          [
            userId,
            encryptedCardNumber,
            cardNumberMasked,
            cardType,
            expiryMonth,
            expiryYear,
            encryptedCvv,
            cardholderName,
            existingCardCount === 0, // First card is default
          ]
        );

        const card = cardResult.rows[0];

        // Create transaction record for card addition fee
        const cardAdditionFee = 50; // 50 Naira
        await client.query(
          `INSERT INTO transactions (id, user_id, type, status, amount, currency, description,
           crypto_processor_fee, malpay_charge, total_fees, created_at, updated_at, completed_at)
           VALUES (uuid_generate_v4(), $1, 'card_addition', 'completed', $2, 'NGN',
           'Card addition fee', 0, $2, $2, NOW(), NOW(), NOW())`,
          [userId, cardAdditionFee]
        );

        return card;
      });

      logger.info('Card added successfully', {
        userId,
        cardId: result.id,
        cardType: result.card_type,
      });

      res.status(201).json({
        success: true,
        card: {
          id: result.id,
          cardNumberMasked: result.card_number_masked,
          cardType: result.card_type,
          expiryMonth: result.expiry_month,
          expiryYear: result.expiry_year,
          cardholderName: result.cardholder_name,
          isDefault: result.is_default,
          createdAt: result.created_at,
        },
        fee: {
          amount: 50,
          currency: 'NGN',
          description: 'Card addition fee'
        },
        message: 'Card added successfully',
      });
    } catch (error) {
      logger.error('Add card error:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to add card' },
      });
    }
  };

  // Set default card
  setDefaultCard = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      const { cardId } = req.params;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: { message: 'User not authenticated' },
        });
        return;
      }

      await transaction(async (client) => {
        // Remove default from all user's cards
        await client.query(
          'UPDATE linked_cards SET is_default = false WHERE user_id = $1',
          [userId]
        );

        // Set the specified card as default
        const result = await client.query(
          'UPDATE linked_cards SET is_default = true WHERE id = $1 AND user_id = $2 AND is_active = true RETURNING id',
          [cardId, userId]
        );

        if (result.rows.length === 0) {
          throw new CustomError('Card not found or does not belong to user', 404);
        }
      });

      res.json({
        success: true,
        message: 'Default card updated successfully',
      });
    } catch (error) {
      logger.error('Set default card error:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to set default card' },
      });
    }
  };

  // Remove a card
  removeCard = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      const { cardId } = req.params;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: { message: 'User not authenticated' },
        });
        return;
      }

      await transaction(async (client) => {
        // Check if card exists and belongs to user
        const cardResult = await client.query(
          'SELECT id, is_default FROM linked_cards WHERE id = $1 AND user_id = $2 AND is_active = true',
          [cardId, userId]
        );

        if (cardResult.rows.length === 0) {
          throw new CustomError('Card not found or does not belong to user', 404);
        }

        const card = cardResult.rows[0];

        // Check if this is the last card
        const remainingCardsResult = await client.query(
          'SELECT COUNT(*) as count FROM linked_cards WHERE user_id = $1 AND is_active = true',
          [userId]
        );
        const remainingCards = parseInt(remainingCardsResult.rows[0].count);

        if (remainingCards <= 1) {
          throw new CustomError('Cannot remove the last card. Please add another card first.', 400);
        }

        // Soft delete the card
        await client.query(
          'UPDATE linked_cards SET is_active = false WHERE id = $1',
          [cardId]
        );

        // If the removed card was default, set another card as default
        if (card.is_default) {
          const newDefaultResult = await client.query(
            'SELECT id FROM linked_cards WHERE user_id = $1 AND is_active = true ORDER BY created_at DESC LIMIT 1',
            [userId]
          );

          if (newDefaultResult.rows.length > 0) {
            await client.query(
              'UPDATE linked_cards SET is_default = true WHERE id = $1',
              [newDefaultResult.rows[0].id]
            );
          }
        }
      });

      res.json({
        success: true,
        message: 'Card removed successfully',
      });
    } catch (error) {
      logger.error('Remove card error:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to remove card' },
      });
    }
  };
}