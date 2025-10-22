import { Router } from 'express';
import { body } from 'express-validator';
import { asyncHandler } from '../middleware/errorHandler';
import { authMiddleware } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import { BlockchainController } from '../controllers/BlockchainController';

const router = Router();
const blockchainController = new BlockchainController();

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
  body('processor')
    .isIn(['tron', 'polygon', 'ethereum'])
    .withMessage('Processor must be tron, polygon, or ethereum'),
];

const depositValidation = [
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  body('currency')
    .isIn(['NGN', 'USD', 'USDT'])
    .withMessage('Currency must be NGN, USD, or USDT'),
  body('processor')
    .isIn(['tron', 'polygon', 'ethereum'])
    .withMessage('Processor must be tron, polygon, or ethereum'),
];

const withdrawalValidation = [
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  body('currency')
    .isIn(['NGN', 'USD', 'USDT'])
    .withMessage('Currency must be NGN, USD, or USDT'),
  body('processor')
    .isIn(['tron', 'polygon', 'ethereum'])
    .withMessage('Processor must be tron, polygon, or ethereum'),
  body('toAddress')
    .notEmpty()
    .withMessage('Recipient address is required'),
];

// Blockchain routes
router.post('/transfer', transferValidation, validateRequest, asyncHandler(blockchainController.transfer));
router.post('/deposit', depositValidation, validateRequest, asyncHandler(blockchainController.deposit));
router.post('/withdraw', withdrawalValidation, validateRequest, asyncHandler(blockchainController.withdraw));
router.get('/balance', asyncHandler(blockchainController.getBalance));
router.get('/addresses', asyncHandler(blockchainController.getAddresses));
router.get('/transaction/:id/status', asyncHandler(blockchainController.getTransactionStatus));
router.get('/fees/:processor/:amount', asyncHandler(blockchainController.calculateFees));
router.get('/networks', asyncHandler(blockchainController.getSupportedNetworks));

export default router;
