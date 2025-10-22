import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { authMiddleware } from '../middleware/authMiddleware';
import { WalletController } from '../controllers/WalletController';

const router = Router();
const walletController = new WalletController();

// All routes require authentication
router.use(authMiddleware);

// Wallet routes
router.get('/balance', asyncHandler(walletController.getBalance));
router.get('/transactions', asyncHandler(walletController.getTransactions));

export default router;