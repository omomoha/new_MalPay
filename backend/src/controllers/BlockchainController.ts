import { Request, Response } from 'express';
import { PaymentService } from '../services/PaymentService';
import { BlockchainService } from '../services/BlockchainService';
import { UserWalletService } from '../services/UserWalletService';
import { logger } from '../utils/logger';
import { handleDatabaseError } from '../middleware/errorHandler';

export class BlockchainController {
  private paymentService: PaymentService;
  private blockchainService: BlockchainService;
  private userWalletService: UserWalletService;

  constructor() {
    this.paymentService = new PaymentService();
    this.blockchainService = new BlockchainService();
    this.userWalletService = new UserWalletService();
  }

  /**
   * Process blockchain transfer
   */
  transfer = async (req: Request, res: Response): Promise<void> => {
    try {
      const { recipientEmail, amount, currency, description, processor } = req.body;
      const senderId = req.user?.id;

      if (!senderId) {
        res.status(401).json({
          success: false,
          error: { message: 'User not authenticated' },
        });
        return;
      }

      const result = await this.paymentService.processTransfer({
        senderId,
        recipientEmail,
        amount: parseFloat(amount),
        currency,
        description,
        processor,
      });

      if (result.success) {
        res.json({
          success: true,
          transaction: {
            id: result.transactionId,
            txHash: result.txHash,
            amount: parseFloat(amount),
            currency,
            description,
            processor,
            fees: result.fees,
            status: 'completed',
            createdAt: new Date().toISOString(),
          },
          message: result.message,
        });
      } else {
        res.status(400).json({
          success: false,
          error: { message: result.error || 'Transfer failed' },
        });
      }
    } catch (error) {
      logger.error('Transfer error:', error);
      throw handleDatabaseError(error);
    }
  };

  /**
   * Process blockchain deposit
   */
  deposit = async (req: Request, res: Response): Promise<void> => {
    try {
      const { amount, currency, processor } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: { message: 'User not authenticated' },
        });
        return;
      }

      const result = await this.paymentService.processDeposit({
        userId,
        amount: parseFloat(amount),
        currency,
        processor,
      });

      if (result.success) {
        res.json({
          success: true,
          transaction: {
            id: result.transactionId,
            txHash: result.txHash,
            amount: parseFloat(amount),
            currency,
            processor,
            fees: result.fees,
            status: 'completed',
            createdAt: new Date().toISOString(),
          },
          message: result.message,
        });
      } else {
        res.status(400).json({
          success: false,
          error: { message: result.error || 'Deposit failed' },
        });
      }
    } catch (error) {
      logger.error('Deposit error:', error);
      throw handleDatabaseError(error);
    }
  };

  /**
   * Process blockchain withdrawal
   */
  withdraw = async (req: Request, res: Response): Promise<void> => {
    try {
      const { amount, currency, processor, toAddress } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: { message: 'User not authenticated' },
        });
        return;
      }

      const result = await this.paymentService.processWithdrawal({
        userId,
        amount: parseFloat(amount),
        currency,
        processor,
        toAddress,
      });

      if (result.success) {
        res.json({
          success: true,
          transaction: {
            id: result.transactionId,
            txHash: result.txHash,
            amount: parseFloat(amount),
            currency,
            processor,
            toAddress,
            fees: result.fees,
            status: 'completed',
            createdAt: new Date().toISOString(),
          },
          message: result.message,
        });
      } else {
        res.status(400).json({
          success: false,
          error: { message: result.error || 'Withdrawal failed' },
        });
      }
    } catch (error) {
      logger.error('Withdrawal error:', error);
      throw handleDatabaseError(error);
    }
  };

  /**
   * Get user's blockchain balances
   */
  getBalance = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: { message: 'User not authenticated' },
        });
        return;
      }

      const balances = await this.paymentService.getUserBlockchainBalances(userId);

      res.json({
        success: true,
        balances: {
          tron: balances.tron,
          polygon: balances.polygon,
          ethereum: balances.ethereum,
          total: balances.total,
        },
        lastUpdated: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Get balance error:', error);
      throw handleDatabaseError(error);
    }
  };

  /**
   * Get user's blockchain addresses
   */
  getAddresses = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: { message: 'User not authenticated' },
        });
        return;
      }

      const addresses = await this.userWalletService.getUserWalletAddresses(userId);

      if (!addresses) {
        res.status(404).json({
          success: false,
          error: { message: 'User wallet not found' },
        });
        return;
      }

      res.json({
        success: true,
        addresses: {
          tron: addresses.tron,
          polygon: addresses.polygon,
          ethereum: addresses.ethereum,
        },
      });
    } catch (error) {
      logger.error('Get addresses error:', error);
      throw handleDatabaseError(error);
    }
  };

  /**
   * Get transaction status
   */
  getTransactionStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: { message: 'User not authenticated' },
        });
        return;
      }

      const status = await this.paymentService.getTransactionStatus(id);

      res.json({
        success: status.success,
        transactionId: id,
        status: status.status,
        confirmations: status.confirmations,
        error: status.error,
      });
    } catch (error) {
      logger.error('Get transaction status error:', error);
      throw handleDatabaseError(error);
    }
  };

  /**
   * Calculate transaction fees
   */
  calculateFees = async (req: Request, res: Response): Promise<void> => {
    try {
      const { processor, amount } = req.params;
      const amountNum = parseFloat(amount);

      if (isNaN(amountNum) || amountNum <= 0) {
        res.status(400).json({
          success: false,
          error: { message: 'Invalid amount' },
        });
        return;
      }

      const fees = this.blockchainService.calculateFees(processor, amountNum);

      res.json({
        success: true,
        fees: {
          processor,
          amount: amountNum,
          fee: fees.fee,
          minFee: fees.minFee,
          maxFee: fees.maxFee,
          feeRate: this.blockchainService.getNetworkConfig(processor)?.feeRate || 0,
        },
      });
    } catch (error) {
      logger.error('Calculate fees error:', error);
      res.status(400).json({
        success: false,
        error: { message: error instanceof Error ? error.message : 'Failed to calculate fees' },
      });
    }
  };

  /**
   * Get supported networks
   */
  getSupportedNetworks = async (req: Request, res: Response): Promise<void> => {
    try {
      const networks = this.blockchainService.getSupportedNetworks();
      const networkConfigs = networks.map(network => {
        const config = this.blockchainService.getNetworkConfig(network);
        return {
          network,
          feeRate: config?.feeRate || 0,
          minFee: config?.minFee || 0,
          maxFee: config?.maxFee || 0,
          usdtContractAddress: config?.usdtContractAddress || '',
        };
      });

      res.json({
        success: true,
        networks: networkConfigs,
      });
    } catch (error) {
      logger.error('Get supported networks error:', error);
      throw handleDatabaseError(error);
    }
  };
}
