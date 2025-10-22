import { Router, Request, Response } from 'express';
import { WalletService } from '../services/WalletService';
import { ExchangeRateService } from '../services/ExchangeRateService';
import { authMiddleware } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { body, param, query } from 'express-validator';

const router = Router();

// Initialize services (these would be injected via DI in a real app)
const walletService = new WalletService(/* dependencies */);
const exchangeRateService = new ExchangeRateService(/* dependencies */);

/**
 * GET /api/v1/wallet/balance
 * Get user's wallet balance (fiat display only)
 */
router.get('/balance', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const balance = await walletService.getBalance(userId);

    res.json({
      success: true,
      data: {
        balance: balance.fiat, // Only show fiat amount to user
        currency: balance.currency,
        // USDT amount is hidden from user
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/v1/wallet/currencies
 * Get supported currencies and exchange rates
 */
router.get('/currencies', async (req: Request, res: Response) => {
  try {
    const rates = await exchangeRateService.getAllRates();
    
    const currencies = rates.map(rate => ({
      currency: rate.targetCurrency,
      rate: rate.rate,
      lastUpdated: rate.updatedAt
    }));

    res.json({
      success: true,
      data: {
        currencies,
        baseCurrency: 'USDT' // Hidden from user
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/v1/wallet/change-currency
 * Change user's preferred currency
 */
router.post('/change-currency', 
  authMiddleware,
  validateRequest([
    body('currency').isString().isLength({ min: 3, max: 3 }).withMessage('Currency must be 3 characters')
  ]),
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const { currency } = req.body;

      await walletService.updateCurrency(userId, currency.toUpperCase());

      res.json({
        success: true,
        message: 'Currency updated successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);

/**
 * POST /api/v1/wallet/sync
 * Sync wallet balance with blockchain
 */
router.post('/sync', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    await walletService.syncBalance(userId);

    const balance = await walletService.getBalance(userId);

    res.json({
      success: true,
      data: {
        balance: balance.fiat,
        currency: balance.currency,
        syncedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/v1/wallet/transactions
 * Get wallet transaction history (fiat amounts only)
 */
router.get('/transactions',
  authMiddleware,
  validateRequest([
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('type').optional().isIn(['transfer', 'deposit', 'withdrawal', 'fee']).withMessage('Invalid transaction type'),
    query('status').optional().isIn(['pending', 'processing', 'completed', 'failed', 'cancelled']).withMessage('Invalid status')
  ]),
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const type = req.query.type as string;
      const status = req.query.status as string;
      const offset = (page - 1) * limit;

      // This would use PaymentService in a real implementation
      // const transactions = await paymentService.getTransactions(userId, limit, offset, type, status);

      // Mock response for now
      const transactions = [];

      res.json({
        success: true,
        data: {
          transactions,
          pagination: {
            page,
            limit,
            total: 0,
            pages: 0
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);

export default router;
