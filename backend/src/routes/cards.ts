import { Router } from 'express';
import { body } from 'express-validator';
import { asyncHandler } from '../middleware/errorHandler';
import { authMiddleware } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import { CardController } from '../controllers/CardController';

const router = Router();
const cardController = new CardController();

// All routes require authentication
router.use(authMiddleware);

// Validation rules
const addCardValidation = [
  body('cardNumber')
    .isLength({ min: 13, max: 19 })
    .withMessage('Card number must be between 13 and 19 digits')
    .isNumeric()
    .withMessage('Card number must contain only numbers'),
  body('expiryMonth')
    .isInt({ min: 1, max: 12 })
    .withMessage('Expiry month must be between 1 and 12'),
  body('expiryYear')
    .isInt({ min: new Date().getFullYear() })
    .withMessage('Expiry year must be current year or later'),
  body('cvv')
    .isLength({ min: 3, max: 4 })
    .withMessage('CVV must be 3 or 4 digits')
    .isNumeric()
    .withMessage('CVV must contain only numbers'),
  body('cardholderName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Cardholder name must be between 2 and 50 characters'),
];

// Card routes
router.get('/', asyncHandler(cardController.getCards));
router.post('/', addCardValidation, validateRequest, asyncHandler(cardController.addCard));
router.put('/:cardId/set-default', asyncHandler(cardController.setDefaultCard));
router.delete('/:cardId', asyncHandler(cardController.removeCard));

export default router;
