import { Request, Response } from 'express';
import { WalletService } from '../services/WalletService';
import { logger } from '../utils/logger';
import { handleDatabaseError } from '../middleware/errorHandler';

export class WalletController {
  private walletService: WalletService;

  constructor() {
    this.walletService = new WalletService();
  }

  getBalance = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: { message: 'User not authenticated' } });
        return;
      }

      const balance = await this.walletService.getWalletBalance(userId);
      
      res.json({
        success: true,
        data: balance,
      });
    } catch (error) {
      logger.error('Get balance error:', error);
      throw handleDatabaseError(error);
    }
  };

  getTransactions = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: { message: 'User not authenticated' } });
        return;
      }

      const filters = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        type: req.query.type as string,
        status: req.query.status as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
      };

      const transactions = await this.walletService.getWalletTransactions(userId, filters);
      
      res.json({
        success: true,
        data: transactions,
      });
    } catch (error) {
      logger.error('Get transactions error:', error);
      throw handleDatabaseError(error);
    }
  };
}
