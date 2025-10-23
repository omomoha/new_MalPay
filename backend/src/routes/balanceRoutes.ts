import express from 'express';
import { CardBalanceService } from '../services/CardBalanceService';
import { logger } from '../utils/logger';

const router = express.Router();
const cardBalanceService = new CardBalanceService();

// Middleware to check if user is not admin
const checkNotAdmin = (req: any, res: any, next: any) => {
  const user = req.user;
  if (user && user.email === 'admin@malpay.com') {
    return res.status(403).json({
      success: false,
      error: {
        message: 'Admins cannot access user balance information',
        code: 'ADMIN_ACCESS_DENIED',
      },
    });
  }
  next();
};

/**
 * GET /api/v1/balance/cards
 * Get all card balances for the authenticated user
 */
router.get('/cards', checkNotAdmin, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const balances = await cardBalanceService.getAllCardBalances(userId);

    // Filter to show only Mastercard balances with notification
    const mastercardBalances = balances.filter(balance => balance.isMastercard);
    const hasNonMastercardCards = balances.some(balance => !balance.isMastercard);

    res.json({
      success: true,
      balances: mastercardBalances,
      notification: hasNonMastercardCards ? {
        message: 'Only Mastercard holders can view their account balance. Other card types are not supported.',
        type: 'info',
        showAlways: true,
      } : null,
      totalBalance: mastercardBalances.reduce((sum, balance) => sum + balance.balance, 0),
      currency: mastercardBalances.length > 0 ? mastercardBalances[0].currency : 'NGN',
    });
  } catch (error) {
    logger.error('Error getting card balances:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to retrieve card balances',
        code: 'BALANCE_RETRIEVAL_ERROR',
      },
    });
  }
});

/**
 * GET /api/v1/balance/cards/:cardId
 * Get balance for a specific card
 */
router.get('/cards/:cardId', checkNotAdmin, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const { cardId } = req.params;

    const balance = await cardBalanceService.getCardBalance(userId, cardId);

    if (!balance) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Card balance not found',
          code: 'BALANCE_NOT_FOUND',
        },
      });
    }

    if (!balance.isMastercard) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Only Mastercard holders can view their account balance',
          code: 'NON_MASTERCARD_CARD',
        },
      });
    }

    res.json({
      success: true,
      balance,
    });
  } catch (error) {
    logger.error('Error getting card balance:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to retrieve card balance',
        code: 'BALANCE_RETRIEVAL_ERROR',
      },
    });
  }
});

/**
 * POST /api/v1/balance/cards/:cardId/refresh
 * Refresh balance for a specific Mastercard
 */
router.post('/cards/:cardId/refresh', checkNotAdmin, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const { cardId } = req.params;
    const { cardNumber, expiryMonth, expiryYear, cvv, cardholderName } = req.body;

    // Validate required fields
    if (!cardNumber || !expiryMonth || !expiryYear || !cvv || !cardholderName) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'All card details are required for balance refresh',
          code: 'MISSING_CARD_DETAILS',
        },
      });
    }

    // Validate card number format
    const cardNumberRegex = /^\d{13,19}$/;
    if (!cardNumberRegex.test(cardNumber.replace(/\s/g, ''))) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid card number format',
          code: 'INVALID_CARD_NUMBER',
        },
      });
    }

    // Validate expiry date
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    
    if (parseInt(expiryYear) < currentYear || 
        (parseInt(expiryYear) === currentYear && parseInt(expiryMonth) < currentMonth)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Card has expired',
          code: 'EXPIRED_CARD',
        },
      });
    }

    const balance = await cardBalanceService.updateMastercardBalance(
      userId,
      cardId,
      cardNumber,
      expiryMonth,
      expiryYear,
      cvv,
      cardholderName
    );

    res.json({
      success: true,
      balance,
      message: 'Balance refreshed successfully',
    });
  } catch (error) {
    logger.error('Error refreshing card balance:', error);
    
    if (error.message.includes('Only Mastercard cards support balance checking')) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Only Mastercard cards support balance checking',
          code: 'NON_MASTERCARD_CARD',
        },
      });
    }

    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to refresh card balance',
        code: 'BALANCE_REFRESH_ERROR',
      },
    });
  }
});

/**
 * GET /api/v1/balance/mastercard-status
 * Check if user has any Mastercard balances
 */
router.get('/mastercard-status', checkNotAdmin, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const hasMastercardBalances = await cardBalanceService.hasMastercardBalances(userId);

    res.json({
      success: true,
      hasMastercardBalances,
      message: hasMastercardBalances 
        ? 'You have Mastercard balances available' 
        : 'No Mastercard balances found. Add a Mastercard to view your account balance.',
    });
  } catch (error) {
    logger.error('Error checking Mastercard status:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to check Mastercard status',
        code: 'MASTERCARD_STATUS_ERROR',
      },
    });
  }
});

/**
 * DELETE /api/v1/balance/cards/:cardId
 * Deactivate card balance (when card is removed)
 */
router.delete('/cards/:cardId', checkNotAdmin, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const { cardId } = req.params;

    await cardBalanceService.deactivateCardBalance(userId, cardId);

    res.json({
      success: true,
      message: 'Card balance deactivated successfully',
    });
  } catch (error) {
    logger.error('Error deactivating card balance:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to deactivate card balance',
        code: 'BALANCE_DEACTIVATION_ERROR',
      },
    });
  }
});

export default router;
