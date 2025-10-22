import { Router } from 'express';
import { body } from 'express-validator';
import { asyncHandler } from '../middleware/errorHandler';
import { authMiddleware } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import { PaymentController } from '../controllers/PaymentController';

const router = Router();
const paymentController = new PaymentController();

// All routes require authentication
router.use(authMiddleware);

// Validation rules
const transferValidation = [
  body('recipientEmail')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid recipient email address'),
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  body('currency')
    .isIn(['NGN', 'USD', 'USDT'])
    .withMessage('Currency must be NGN, USD, or USDT'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  body('pin')
    .isLength({ min: 4, max: 6 })
    .isNumeric()
    .withMessage('PIN must be 4-6 digits'),
  body('processor')
    .isIn(['tron', 'polygon', 'ethereum'])
    .withMessage('Processor must be tron, polygon, or ethereum'),
];

// Payment routes
router.post('/transfer', transferValidation, validateRequest, asyncHandler(paymentController.transfer));
router.get('/transactions', asyncHandler(paymentController.getTransactions));
router.get('/transactions/:id', asyncHandler(paymentController.getTransaction));

export default router;