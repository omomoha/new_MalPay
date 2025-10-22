import { Router } from 'express';
import { body } from 'express-validator';
import { asyncHandler } from '../middleware/errorHandler';
import { authMiddleware } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import { BankAccountController } from '../controllers/BankAccountController';

const router = Router();
const bankAccountController = new BankAccountController();

// All routes require authentication
router.use(authMiddleware);

// Validation rules
const addBankAccountValidation = [
  body('bankCode')
    .notEmpty()
    .withMessage('Bank code is required'),
  body('accountNumber')
    .isLength({ min: 10, max: 10 })
    .isNumeric()
    .withMessage('Account number must be 10 digits'),
];

const verifyBankAccountValidation = [
  body('verificationCode')
    .notEmpty()
    .withMessage('Verification code is required'),
];

// Bank account routes
router.get('/', asyncHandler(bankAccountController.getBankAccounts));
router.post('/', addBankAccountValidation, validateRequest, asyncHandler(bankAccountController.addBankAccount));
router.post('/:id/verify', verifyBankAccountValidation, validateRequest, asyncHandler(bankAccountController.verifyBankAccount));
router.delete('/:id', asyncHandler(bankAccountController.removeBankAccount));

export default router;