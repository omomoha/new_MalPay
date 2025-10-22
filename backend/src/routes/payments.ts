import { Router, Request, Response } from 'express';
import { PaymentService } from '../services/PaymentService';
import { authMiddleware } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { body, param, query } from 'express-validator';

const router = Router();

// Initialize services (these would be injected via DI in a real app)
const paymentService = new PaymentService(/* dependencies */);

/**
 * POST /api/v1/payments/transfer
 * Transfer money between users (USDT internal with fiat display)
 */
router.post('/transfer',
  authMiddleware,
  validateRequest([
    body('receiverEmail').isEmail().withMessage('Valid email required'),
    body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
    body('currency').isString().isLength({ min: 3, max: 3 }).withMessage('Currency must be 3 characters'),
    body('description').optional().isString().isLength({ max: 500 }).withMessage('Description too long'),
    body('pin').isString().isLength({ min: 4, max: 4 }).withMessage('PIN must be 4 digits')
  ]),
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const { receiverEmail, amount, currency, description, pin } = req.body;

      const transferRequest = {
        senderId: userId,
        receiverEmail,
        amount,
        currency: currency.toUpperCase(),
        description,
        pin
      };

      const result = await paymentService.transfer(transferRequest);

      res.json({
        success: true,
        data: {
          transactionId: result.transactionId,
          status: result.status,
          amount: result.amount,
          currency: result.currency,
          recipient: result.recipient,
          fee: result.fee,
          estimatedCompletion: result.estimatedCompletion
        }
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
 * GET /api/v1/payments/transactions
 * Get user's transaction history (fiat amounts only)
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

      const transactions = await paymentService.getTransactions(userId, limit, offset, type, status);

      // Convert to fiat-only response
      const fiatTransactions = transactions.map(tx => ({
        id: tx.id,
        txHash: tx.txHash,
        type: tx.type,
        status: tx.status,
        amount: tx.amountFiat, // Only show fiat amount
        currency: tx.currency,
        fee: tx.fee,
        description: tx.description,
        createdAt: tx.createdAt,
        completedAt: tx.completedAt,
        // Hide USDT amounts and exchange rates from user
      }));

      res.json({
        success: true,
        data: {
          transactions: fiatTransactions,
          pagination: {
            page,
            limit,
            total: fiatTransactions.length,
            pages: Math.ceil(fiatTransactions.length / limit)
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
 * GET /api/v1/payments/transactions/:id
 * Get specific transaction details (fiat amounts only)
 */
router.get('/transactions/:id',
  authMiddleware,
  validateRequest([
    param('id').isUUID().withMessage('Invalid transaction ID')
  ]),
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const transactionId = req.params.id;

      const transaction = await paymentService.getTransaction(transactionId);

      if (!transaction) {
        return res.status(404).json({
          success: false,
          error: 'Transaction not found'
        });
      }

      // Check if user is sender or receiver
      if (transaction.senderId !== userId && transaction.receiverId !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      // Return fiat-only transaction details
      res.json({
        success: true,
        data: {
          id: transaction.id,
          txHash: transaction.txHash,
          type: transaction.type,
          status: transaction.status,
          amount: transaction.amountFiat, // Only show fiat amount
          currency: transaction.currency,
          fee: transaction.fee,
          description: transaction.description,
          createdAt: transaction.createdAt,
          completedAt: transaction.completedAt,
          failedAt: transaction.failedAt,
          failureReason: transaction.failureReason,
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
 * POST /api/v1/payments/deposit
 * Process deposit from external source
 */
router.post('/deposit',
  authMiddleware,
  validateRequest([
    body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
    body('currency').isString().isLength({ min: 3, max: 3 }).withMessage('Currency must be 3 characters'),
    body('sourceType').isString().withMessage('Source type required'),
    body('sourceId').isString().withMessage('Source ID required')
  ]),
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const { amount, currency, sourceType, sourceId } = req.body;

      const transaction = await paymentService.processDeposit(
        userId,
        amount,
        currency.toUpperCase(),
        sourceType,
        sourceId
      );

      res.json({
        success: true,
        data: {
          transactionId: transaction.id,
          amount: transaction.amountFiat, // Only show fiat amount
          currency: transaction.currency,
          status: transaction.status,
          createdAt: transaction.createdAt
        }
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
 * POST /api/v1/payments/withdraw
 * Process withdrawal to external destination
 */
router.post('/withdraw',
  authMiddleware,
  validateRequest([
    body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
    body('currency').isString().isLength({ min: 3, max: 3 }).withMessage('Currency must be 3 characters'),
    body('destinationType').isString().withMessage('Destination type required'),
    body('destinationId').isString().withMessage('Destination ID required'),
    body('pin').isString().isLength({ min: 4, max: 4 }).withMessage('PIN must be 4 digits')
  ]),
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const { amount, currency, destinationType, destinationId, pin } = req.body;

      const transaction = await paymentService.processWithdrawal(
        userId,
        amount,
        currency.toUpperCase(),
        destinationType,
        destinationId
      );

      res.json({
        success: true,
        data: {
          transactionId: transaction.id,
          amount: transaction.amountFiat, // Only show fiat amount
          currency: transaction.currency,
          status: transaction.status,
          createdAt: transaction.createdAt
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
);

export default router;
