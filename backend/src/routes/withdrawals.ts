import { Router, Request, Response } from 'express';
import { WithdrawalService } from '../services/WithdrawalService';
import { authMiddleware } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { body, param, query } from 'express-validator';

const router = Router();

// Initialize services (these would be injected via DI in a real app)
const withdrawalService = new WithdrawalService(/* dependencies */);

/**
 * POST /api/v1/withdrawals
 * Create a withdrawal request
 */
router.post('/',
  authMiddleware,
  validateRequest([
    body('bankAccountId').isUUID().withMessage('Valid bank account ID required'),
    body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
    body('currency').isString().isLength({ min: 3, max: 3 }).withMessage('Currency must be 3 characters'),
    body('pin').isString().isLength({ min: 4, max: 4 }).withMessage('PIN must be 4 digits')
  ]),
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const { bankAccountId, amount, currency, pin } = req.body;

      const withdrawalData = {
        userId,
        bankAccountId,
        amount,
        currency: currency.toUpperCase(),
        pin
      };

      const result = await withdrawalService.createWithdrawal(withdrawalData);

      res.status(201).json({
        success: true,
        data: {
          withdrawalId: result.withdrawalId,
          status: result.status,
          amount: result.amount,
          currency: result.currency,
          fee: result.fee,
          estimatedCompletion: result.estimatedCompletion
        },
        message: 'Withdrawal request submitted successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
);

/**
 * GET /api/v1/withdrawals
 * Get user's withdrawal history
 */
router.get('/',
  authMiddleware,
  validateRequest([
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
  ]),
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;

      const withdrawals = await withdrawalService.getWithdrawalsByUserId(userId, limit, offset);

      // Convert to fiat-only response
      const fiatWithdrawals = withdrawals.map(withdrawal => ({
        id: withdrawal.id,
        amount: withdrawal.amountFiat, // Only show fiat amount
        currency: withdrawal.currency,
        status: withdrawal.status,
        fee: withdrawal.fee,
        processingFee: withdrawal.processingFee,
        txHash: withdrawal.txHash,
        createdAt: withdrawal.createdAt,
        completedAt: withdrawal.completedAt,
        failureReason: withdrawal.failureReason
        // Hide USDT amounts and exchange rates from user
      }));

      res.json({
        success: true,
        data: {
          withdrawals: fiatWithdrawals,
          pagination: {
            page,
            limit,
            total: fiatWithdrawals.length,
            pages: Math.ceil(fiatWithdrawals.length / limit)
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

/**
 * GET /api/v1/withdrawals/:id
 * Get specific withdrawal details
 */
router.get('/:id',
  authMiddleware,
  validateRequest([
    param('id').isUUID().withMessage('Invalid withdrawal ID')
  ]),
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const withdrawalId = req.params.id;

      const withdrawal = await withdrawalService.getWithdrawalById(withdrawalId);

      if (!withdrawal) {
        return res.status(404).json({
          success: false,
          error: 'Withdrawal not found'
        });
      }

      // Check if withdrawal belongs to user
      if (withdrawal.userId !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      // Return fiat-only withdrawal details
      res.json({
        success: true,
        data: {
          id: withdrawal.id,
          amount: withdrawal.amountFiat, // Only show fiat amount
          currency: withdrawal.currency,
          status: withdrawal.status,
          fee: withdrawal.fee,
          processingFee: withdrawal.processingFee,
          txHash: withdrawal.txHash,
          createdAt: withdrawal.createdAt,
          completedAt: withdrawal.completedAt,
          failureReason: withdrawal.failureReason
          // Hide USDT amounts and exchange rates from user
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

/**
 * DELETE /api/v1/withdrawals/:id
 * Cancel withdrawal request
 */
router.delete('/:id',
  authMiddleware,
  validateRequest([
    param('id').isUUID().withMessage('Invalid withdrawal ID')
  ]),
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const withdrawalId = req.params.id;

      await withdrawalService.cancelWithdrawal(userId, withdrawalId);

      res.json({
        success: true,
        message: 'Withdrawal cancelled successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
);

/**
 * GET /api/v1/withdrawals/stats
 * Get withdrawal statistics for user
 */
router.get('/stats', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const stats = await withdrawalService.getWithdrawalStats(userId);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
