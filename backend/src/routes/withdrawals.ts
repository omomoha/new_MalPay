import { Router } from 'express';
import { body } from 'express-validator';
import { asyncHandler } from '../middleware/errorHandler';
import { authMiddleware } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import { WithdrawalController } from '../controllers/WithdrawalController';

const router = Router();
const withdrawalController = new WithdrawalController();

// All routes require authentication
router.use(authMiddleware);

// Validation rules
const withdrawalValidation = [
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  body('currency')
    .isIn(['NGN', 'USD'])
    .withMessage('Currency must be NGN or USD'),
  body('bankAccountId')
    .isUUID()
    .withMessage('Valid bank account ID is required'),
  body('pin')
    .isLength({ min: 4, max: 6 })
    .isNumeric()
    .withMessage('PIN must be 4-6 digits'),
];

// Withdrawal routes
router.post('/request', withdrawalValidation, validateRequest, asyncHandler(withdrawalController.requestWithdrawal));
router.get('/', asyncHandler(withdrawalController.getWithdrawals));
router.get('/:id', asyncHandler(withdrawalController.getWithdrawal));
router.post('/:id/cancel', asyncHandler(withdrawalController.cancelWithdrawal));

export default router;