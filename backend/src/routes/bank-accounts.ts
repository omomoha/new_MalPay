import { Router, Request, Response } from 'express';
import { BankAccountService } from '../services/BankAccountService';
import { authMiddleware } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { body, param } from 'express-validator';

const router = Router();

// Initialize services (these would be injected via DI in a real app)
const bankAccountService = new BankAccountService(/* dependencies */);

/**
 * GET /api/v1/bank-accounts
 * Get user's bank accounts
 */
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const bankAccounts = await bankAccountService.getBankAccountsByUserId(userId);

    res.json({
      success: true,
      data: bankAccounts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/v1/bank-accounts
 * Add a new bank account
 */
router.post('/',
  authMiddleware,
  validateRequest([
    body('accountNumber').isString().isLength({ min: 10, max: 10 }).withMessage('Account number must be 10 digits'),
    body('bankCode').isString().isLength({ min: 3, max: 3 }).withMessage('Bank code must be 3 digits'),
    body('accountName').isString().isLength({ min: 2, max: 100 }).withMessage('Account name required'),
    body('accountType').isIn(['savings', 'current']).withMessage('Account type must be savings or current'),
    body('isPrimary').optional().isBoolean().withMessage('isPrimary must be boolean')
  ]),
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const { accountNumber, bankCode, accountName, accountType, isPrimary } = req.body;

      const bankAccountData = {
        userId,
        accountNumber,
        bankCode,
        accountName,
        accountType,
        isPrimary
      };

      const bankAccount = await bankAccountService.addBankAccount(bankAccountData);

      res.status(201).json({
        success: true,
        data: bankAccount,
        message: 'Bank account added successfully'
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
 * GET /api/v1/bank-accounts/banks
 * Get list of supported banks
 */
router.get('/banks', async (req: Request, res: Response) => {
  try {
    const banks = bankAccountService.getSupportedBanks();

    res.json({
      success: true,
      data: banks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/v1/bank-accounts/verify
 * Verify bank account details (public endpoint for account verification)
 */
router.post('/verify',
  validateRequest([
    body('accountNumber').isString().isLength({ min: 10, max: 10 }).withMessage('Account number must be 10 digits'),
    body('bankCode').isString().isLength({ min: 3, max: 3 }).withMessage('Bank code must be 3 digits')
  ]),
  async (req: Request, res: Response) => {
    try {
      const { accountNumber, bankCode } = req.body;

      const verification = await bankAccountService.verifyAccount(accountNumber, bankCode);

      if (verification.success) {
        res.json({
          success: true,
          data: {
            accountName: verification.accountName,
            bankName: verification.bankName,
            accountNumber,
            bankCode
          }
        });
      } else {
        res.status(400).json({
          success: false,
          error: verification.error
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);

/**
 * PUT /api/v1/bank-accounts/:id/primary
 * Set bank account as primary
 */
router.put('/:id/primary',
  authMiddleware,
  validateRequest([
    param('id').isUUID().withMessage('Invalid bank account ID')
  ]),
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const accountId = req.params.id;

      await bankAccountService.setPrimaryAccount(userId, accountId);

      res.json({
        success: true,
        message: 'Primary bank account updated successfully'
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
 * DELETE /api/v1/bank-accounts/:id
 * Delete bank account
 */
router.delete('/:id',
  authMiddleware,
  validateRequest([
    param('id').isUUID().withMessage('Invalid bank account ID')
  ]),
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const accountId = req.params.id;

      await bankAccountService.deleteBankAccount(userId, accountId);

      res.json({
        success: true,
        message: 'Bank account deleted successfully'
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
 * GET /api/v1/bank-accounts/primary
 * Get primary bank account
 */
router.get('/primary', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const primaryAccount = await bankAccountService.getPrimaryBankAccount(userId);

    if (!primaryAccount) {
      return res.status(404).json({
        success: false,
        error: 'No primary bank account found'
      });
    }

    res.json({
      success: true,
      data: primaryAccount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/v1/bank-accounts/status
 * Check if user has verified bank accounts
 */
router.get('/status', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const hasVerifiedAccounts = await bankAccountService.hasVerifiedBankAccounts(userId);

    res.json({
      success: true,
      data: {
        hasVerifiedAccounts
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
