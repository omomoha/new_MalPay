import { Pool } from 'pg';
import { Logger } from 'winston';
import { ExchangeRateService } from './ExchangeRateService';
import { BlockchainService } from './BlockchainService';
import { encrypt, decrypt } from '../utils/encryption';

export interface Wallet {
  id: string;
  userId: string;
  walletAddress: string;
  blockchainType: 'tron' | 'polygon';
  balanceUSDT: number;
  balanceFiat: number;
  currency: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WalletBalance {
  crypto: number; // USDT (hidden from user)
  fiat: number;   // Display balance in fiat
  currency: string;
}

export interface CreateWalletData {
  userId: string;
  blockchainType: 'tron' | 'polygon';
  currency: string;
}

export class WalletService {
  private db: Pool;
  private logger: Logger;
  private exchangeRateService: ExchangeRateService;
  private blockchainService: BlockchainService;

  constructor(
    db: Pool, 
    logger: Logger, 
    exchangeRateService: ExchangeRateService,
    blockchainService: BlockchainService
  ) {
    this.db = db;
    this.logger = logger;
    this.exchangeRateService = exchangeRateService;
    this.blockchainService = blockchainService;
  }

  /**
   * Create a new wallet for a user
   */
  async createWallet(data: CreateWalletData): Promise<Wallet> {
    try {
      // Generate new wallet address and private key
      const walletData = await this.blockchainService.generateWallet(data.blockchainType);
      
      // Encrypt private key
      const encryptedPrivateKey = encrypt(walletData.privateKey);

      const query = `
        INSERT INTO wallets (user_id, wallet_address, private_key_encrypted, blockchain_type, currency)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, user_id, wallet_address, blockchain_type, balance_usdt, balance_fiat, currency, is_active, created_at, updated_at
      `;

      const result = await this.db.query(query, [
        data.userId,
        walletData.address,
        encryptedPrivateKey,
        data.blockchainType,
        data.currency
      ]);

      const wallet = this.mapRowToWallet(result.rows[0]);
      this.logger.info(`Created wallet for user ${data.userId}: ${wallet.walletAddress}`);
      
      return wallet;
    } catch (error) {
      this.logger.error('Error creating wallet:', error);
      throw error;
    }
  }

  /**
   * Get wallet by user ID
   */
  async getByUserId(userId: string): Promise<Wallet | null> {
    try {
      const query = `
        SELECT id, user_id, wallet_address, blockchain_type, balance_usdt, balance_fiat, currency, is_active, created_at, updated_at
        FROM wallets
        WHERE user_id = $1 AND is_active = true
        ORDER BY created_at DESC
        LIMIT 1
      `;

      const result = await this.db.query(query, [userId]);
      
      if (result.rows.length === 0) {
        return null;
      }

      return this.mapRowToWallet(result.rows[0]);
    } catch (error) {
      this.logger.error('Error getting wallet by user ID:', error);
      throw error;
    }
  }

  /**
   * Get wallet by ID
   */
  async getById(walletId: string): Promise<Wallet | null> {
    try {
      const query = `
        SELECT id, user_id, wallet_address, blockchain_type, balance_usdt, balance_fiat, currency, is_active, created_at, updated_at
        FROM wallets
        WHERE id = $1 AND is_active = true
      `;

      const result = await this.db.query(query, [walletId]);
      
      if (result.rows.length === 0) {
        return null;
      }

      return this.mapRowToWallet(result.rows[0]);
    } catch (error) {
      this.logger.error('Error getting wallet by ID:', error);
      throw error;
    }
  }

  /**
   * Get wallet balance (fiat display only)
   */
  async getBalance(userId: string): Promise<WalletBalance> {
    try {
      const wallet = await this.getByUserId(userId);
      if (!wallet) {
        throw new Error('Wallet not found');
      }

      // Convert USDT to fiat for display
      const exchangeRate = await this.exchangeRateService.getUSDTToFiatRate(wallet.currency);
      const fiatBalance = wallet.balanceUSDT * exchangeRate;

      return {
        crypto: wallet.balanceUSDT,      // Internal USDT (hidden from user)
        fiat: fiatBalance,               // Display balance in fiat
        currency: wallet.currency
      };
    } catch (error) {
      this.logger.error('Error getting wallet balance:', error);
      throw error;
    }
  }

  /**
   * Update wallet balance (both USDT and fiat)
   */
  async updateBalance(userId: string, usdtAmount: number, fiatAmount: number): Promise<void> {
    try {
      const query = `
        UPDATE wallets 
        SET balance_usdt = $1, balance_fiat = $2, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $3 AND is_active = true
      `;

      await this.db.query(query, [usdtAmount, fiatAmount, userId]);
      this.logger.info(`Updated wallet balance for user ${userId}: ${usdtAmount} USDT, ${fiatAmount} ${fiatAmount > 0 ? 'fiat' : ''}`);
    } catch (error) {
      this.logger.error('Error updating wallet balance:', error);
      throw error;
    }
  }

  /**
   * Add USDT to wallet and update fiat display
   */
  async addUSDT(userId: string, usdtAmount: number): Promise<void> {
    try {
      const wallet = await this.getByUserId(userId);
      if (!wallet) {
        throw new Error('Wallet not found');
      }

      const newUSDTBalance = wallet.balanceUSDT + usdtAmount;
      
      // Convert to fiat for display
      const exchangeRate = await this.exchangeRateService.getUSDTToFiatRate(wallet.currency);
      const newFiatBalance = newUSDTBalance * exchangeRate;

      await this.updateBalance(userId, newUSDTBalance, newFiatBalance);
      this.logger.info(`Added ${usdtAmount} USDT to wallet ${wallet.id}`);
    } catch (error) {
      this.logger.error('Error adding USDT to wallet:', error);
      throw error;
    }
  }

  /**
   * Deduct USDT from wallet and update fiat display
   */
  async deductUSDT(userId: string, usdtAmount: number): Promise<void> {
    try {
      const wallet = await this.getByUserId(userId);
      if (!wallet) {
        throw new Error('Wallet not found');
      }

      if (wallet.balanceUSDT < usdtAmount) {
        throw new Error('Insufficient USDT balance');
      }

      const newUSDTBalance = wallet.balanceUSDT - usdtAmount;
      
      // Convert to fiat for display
      const exchangeRate = await this.exchangeRateService.getUSDTToFiatRate(wallet.currency);
      const newFiatBalance = newUSDTBalance * exchangeRate;

      await this.updateBalance(userId, newUSDTBalance, newFiatBalance);
      this.logger.info(`Deducted ${usdtAmount} USDT from wallet ${wallet.id}`);
    } catch (error) {
      this.logger.error('Error deducting USDT from wallet:', error);
      throw error;
    }
  }

  /**
   * Transfer USDT between wallets
   */
  async transferUSDT(fromUserId: string, toUserId: string, usdtAmount: number): Promise<void> {
    try {
      // Check sender balance
      const fromWallet = await this.getByUserId(fromUserId);
      if (!fromWallet) {
        throw new Error('Sender wallet not found');
      }

      if (fromWallet.balanceUSDT < usdtAmount) {
        throw new Error('Insufficient USDT balance');
      }

      // Get receiver wallet
      const toWallet = await this.getByUserId(toUserId);
      if (!toWallet) {
        throw new Error('Receiver wallet not found');
      }

      // Deduct from sender
      await this.deductUSDT(fromUserId, usdtAmount);

      // Add to receiver
      await this.addUSDT(toUserId, usdtAmount);

      this.logger.info(`Transferred ${usdtAmount} USDT from ${fromUserId} to ${toUserId}`);
    } catch (error) {
      this.logger.error('Error transferring USDT:', error);
      throw error;
    }
  }

  /**
   * Sync wallet balance with blockchain
   */
  async syncBalance(userId: string): Promise<void> {
    try {
      const wallet = await this.getByUserId(userId);
      if (!wallet) {
        throw new Error('Wallet not found');
      }

      // Get actual balance from blockchain
      const actualBalance = await this.blockchainService.getBalance(
        wallet.walletAddress, 
        wallet.blockchainType
      );

      // Update database with actual balance
      const exchangeRate = await this.exchangeRateService.getUSDTToFiatRate(wallet.currency);
      const fiatBalance = actualBalance * exchangeRate;

      await this.updateBalance(userId, actualBalance, fiatBalance);
      this.logger.info(`Synced wallet balance for ${userId}: ${actualBalance} USDT`);
    } catch (error) {
      this.logger.error('Error syncing wallet balance:', error);
      throw error;
    }
  }

  /**
   * Get wallet private key (decrypted)
   */
  async getPrivateKey(walletId: string): Promise<string> {
    try {
      const query = `
        SELECT private_key_encrypted
        FROM wallets
        WHERE id = $1 AND is_active = true
      `;

      const result = await this.db.query(query, [walletId]);
      
      if (result.rows.length === 0) {
        throw new Error('Wallet not found');
      }

      return decrypt(result.rows[0].private_key_encrypted);
    } catch (error) {
      this.logger.error('Error getting wallet private key:', error);
      throw error;
    }
  }

  /**
   * Update wallet currency
   */
  async updateCurrency(userId: string, newCurrency: string): Promise<void> {
    try {
      const wallet = await this.getByUserId(userId);
      if (!wallet) {
        throw new Error('Wallet not found');
      }

      // Convert current USDT balance to new currency
      const exchangeRate = await this.exchangeRateService.getUSDTToFiatRate(newCurrency);
      const newFiatBalance = wallet.balanceUSDT * exchangeRate;

      const query = `
        UPDATE wallets 
        SET currency = $1, balance_fiat = $2, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $3 AND is_active = true
      `;

      await this.db.query(query, [newCurrency, newFiatBalance, userId]);
      this.logger.info(`Updated wallet currency for user ${userId} to ${newCurrency}`);
    } catch (error) {
      this.logger.error('Error updating wallet currency:', error);
      throw error;
    }
  }

  /**
   * Deactivate wallet
   */
  async deactivateWallet(walletId: string): Promise<void> {
    try {
      const query = `
        UPDATE wallets 
        SET is_active = false, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `;

      await this.db.query(query, [walletId]);
      this.logger.info(`Deactivated wallet ${walletId}`);
    } catch (error) {
      this.logger.error('Error deactivating wallet:', error);
      throw error;
    }
  }

  /**
   * Get all wallets for a user
   */
  async getWalletsByUserId(userId: string): Promise<Wallet[]> {
    try {
      const query = `
        SELECT id, user_id, wallet_address, blockchain_type, balance_usdt, balance_fiat, currency, is_active, created_at, updated_at
        FROM wallets
        WHERE user_id = $1
        ORDER BY created_at DESC
      `;

      const result = await this.db.query(query, [userId]);
      return result.rows.map(row => this.mapRowToWallet(row));
    } catch (error) {
      this.logger.error('Error getting wallets by user ID:', error);
      throw error;
    }
  }

  /**
   * Map database row to Wallet object
   */
  private mapRowToWallet(row: any): Wallet {
    return {
      id: row.id,
      userId: row.user_id,
      walletAddress: row.wallet_address,
      blockchainType: row.blockchain_type,
      balanceUSDT: parseFloat(row.balance_usdt),
      balanceFiat: parseFloat(row.balance_fiat),
      currency: row.currency,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}
