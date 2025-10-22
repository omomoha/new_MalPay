import { ethers } from 'ethers';
import TronWeb from 'tronweb';
import { query, transaction } from '../config/database';
import { logger } from '../utils/logger';
import { CustomError, handleDatabaseError } from '../middleware/errorHandler';

export interface UserWallet {
  id: string;
  userId: string;
  tronAddress: string;
  polygonAddress: string;
  ethereumAddress: string;
  tronPrivateKey: string; // Encrypted
  polygonPrivateKey: string; // Encrypted
  ethereumPrivateKey: string; // Encrypted
  createdAt: string;
  updatedAt: string;
}

export interface WalletBalance {
  tron: number;
  polygon: number;
  ethereum: number;
  total: number;
}

export class UserWalletService {
  private encryptionKey: string;

  constructor() {
    this.encryptionKey = process.env.WALLET_ENCRYPTION_KEY || 'default-encryption-key-change-in-production';
  }

  /**
   * Create wallet addresses for a new user
   */
  async createUserWallet(userId: string): Promise<UserWallet> {
    try {
      // Generate addresses for all networks
      const tronWallet = this.generateTronWallet();
      const polygonWallet = this.generateEVMWallet();
      const ethereumWallet = this.generateEVMWallet();

      // Encrypt private keys
      const encryptedTronKey = this.encryptPrivateKey(tronWallet.privateKey);
      const encryptedPolygonKey = this.encryptPrivateKey(polygonWallet.privateKey);
      const encryptedEthereumKey = this.encryptPrivateKey(ethereumWallet.privateKey);

      const result = await query(
        `INSERT INTO user_wallets (id, user_id, tron_address, polygon_address, ethereum_address, 
         tron_private_key, polygon_private_key, ethereum_private_key, created_at, updated_at)
         VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
         RETURNING id, user_id, tron_address, polygon_address, ethereum_address, 
         tron_private_key, polygon_private_key, ethereum_private_key, created_at, updated_at`,
        [
          userId,
          tronWallet.address,
          polygonWallet.address,
          ethereumWallet.address,
          encryptedTronKey,
          encryptedPolygonKey,
          encryptedEthereumKey,
        ]
      );

      const wallet = result.rows[0];

      logger.info(`User wallet created for user ${userId}`);

      return {
        id: wallet.id,
        userId: wallet.user_id,
        tronAddress: wallet.tron_address,
        polygonAddress: wallet.polygon_address,
        ethereumAddress: wallet.ethereum_address,
        tronPrivateKey: wallet.tron_private_key,
        polygonPrivateKey: wallet.polygon_private_key,
        ethereumPrivateKey: wallet.ethereum_private_key,
        createdAt: wallet.created_at,
        updatedAt: wallet.updated_at,
      };
    } catch (error) {
      logger.error('Failed to create user wallet:', error);
      throw handleDatabaseError(error);
    }
  }

  /**
   * Get user wallet by user ID
   */
  async getUserWallet(userId: string): Promise<UserWallet | null> {
    try {
      const result = await query(
        `SELECT id, user_id, tron_address, polygon_address, ethereum_address, 
         tron_private_key, polygon_private_key, ethereum_private_key, created_at, updated_at
         FROM user_wallets WHERE user_id = $1`,
        [userId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const wallet = result.rows[0];

      return {
        id: wallet.id,
        userId: wallet.user_id,
        tronAddress: wallet.tron_address,
        polygonAddress: wallet.polygon_address,
        ethereumAddress: wallet.ethereum_address,
        tronPrivateKey: wallet.tron_private_key,
        polygonPrivateKey: wallet.polygon_private_key,
        ethereumPrivateKey: wallet.ethereum_private_key,
        createdAt: wallet.created_at,
        updatedAt: wallet.updated_at,
      };
    } catch (error) {
      logger.error('Failed to get user wallet:', error);
      throw handleDatabaseError(error);
    }
  }

  /**
   * Get user wallet addresses (without private keys)
   */
  async getUserWalletAddresses(userId: string): Promise<{ tron: string; polygon: string; ethereum: string } | null> {
    try {
      const result = await query(
        `SELECT tron_address, polygon_address, ethereum_address
         FROM user_wallets WHERE user_id = $1`,
        [userId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const wallet = result.rows[0];

      return {
        tron: wallet.tron_address,
        polygon: wallet.polygon_address,
        ethereum: wallet.ethereum_address,
      };
    } catch (error) {
      logger.error('Failed to get user wallet addresses:', error);
      throw handleDatabaseError(error);
    }
  }

  /**
   * Get decrypted private key for a specific network
   */
  async getPrivateKey(userId: string, network: 'tron' | 'polygon' | 'ethereum'): Promise<string | null> {
    try {
      const result = await query(
        `SELECT ${network}_private_key FROM user_wallets WHERE user_id = $1`,
        [userId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const encryptedKey = result.rows[0][`${network}_private_key`];
      return this.decryptPrivateKey(encryptedKey);
    } catch (error) {
      logger.error(`Failed to get ${network} private key for user ${userId}:`, error);
      throw handleDatabaseError(error);
    }
  }

  /**
   * Generate Tron wallet
   */
  private generateTronWallet(): { address: string; privateKey: string } {
    try {
      const tronWeb = new TronWeb({
        fullHost: 'https://api.trongrid.io',
      });

      const account = tronWeb.createAccount();
      
      return {
        address: account.address.base58,
        privateKey: account.privateKey,
      };
    } catch (error) {
      logger.error('Failed to generate Tron wallet:', error);
      throw new CustomError('Failed to generate Tron wallet', 500);
    }
  }

  /**
   * Generate EVM-compatible wallet (for Polygon and Ethereum)
   */
  private generateEVMWallet(): { address: string; privateKey: string } {
    try {
      const wallet = ethers.Wallet.createRandom();
      
      return {
        address: wallet.address,
        privateKey: wallet.privateKey,
      };
    } catch (error) {
      logger.error('Failed to generate EVM wallet:', error);
      throw new CustomError('Failed to generate EVM wallet', 500);
    }
  }

  /**
   * Encrypt private key
   */
  private encryptPrivateKey(privateKey: string): string {
    try {
      // Simple encryption using AES (in production, use a more secure method)
      const crypto = require('crypto');
      const cipher = crypto.createCipher('aes-256-cbc', this.encryptionKey);
      let encrypted = cipher.update(privateKey, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      return encrypted;
    } catch (error) {
      logger.error('Failed to encrypt private key:', error);
      throw new CustomError('Failed to encrypt private key', 500);
    }
  }

  /**
   * Decrypt private key
   */
  private decryptPrivateKey(encryptedKey: string): string {
    try {
      // Simple decryption using AES (in production, use a more secure method)
      const crypto = require('crypto');
      const decipher = crypto.createDecipher('aes-256-cbc', this.encryptionKey);
      let decrypted = decipher.update(encryptedKey, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      logger.error('Failed to decrypt private key:', error);
      throw new CustomError('Failed to decrypt private key', 500);
    }
  }

  /**
   * Update wallet addresses (if needed)
   */
  async updateUserWallet(userId: string, updates: Partial<Pick<UserWallet, 'tronAddress' | 'polygonAddress' | 'ethereumAddress'>>): Promise<void> {
    try {
      const updateFields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (updates.tronAddress) {
        updateFields.push(`tron_address = $${paramIndex}`);
        values.push(updates.tronAddress);
        paramIndex++;
      }

      if (updates.polygonAddress) {
        updateFields.push(`polygon_address = $${paramIndex}`);
        values.push(updates.polygonAddress);
        paramIndex++;
      }

      if (updates.ethereumAddress) {
        updateFields.push(`ethereum_address = $${paramIndex}`);
        values.push(updates.ethereumAddress);
        paramIndex++;
      }

      if (updateFields.length === 0) {
        return;
      }

      updateFields.push(`updated_at = NOW()`);
      values.push(userId);

      await query(
        `UPDATE user_wallets SET ${updateFields.join(', ')} WHERE user_id = $${paramIndex}`,
        values
      );

      logger.info(`User wallet updated for user ${userId}`);
    } catch (error) {
      logger.error('Failed to update user wallet:', error);
      throw handleDatabaseError(error);
    }
  }

  /**
   * Delete user wallet
   */
  async deleteUserWallet(userId: string): Promise<void> {
    try {
      await query(
        'DELETE FROM user_wallets WHERE user_id = $1',
        [userId]
      );

      logger.info(`User wallet deleted for user ${userId}`);
    } catch (error) {
      logger.error('Failed to delete user wallet:', error);
      throw handleDatabaseError(error);
    }
  }

  /**
   * Get wallet balance across all networks
   */
  async getWalletBalance(userId: string, blockchainService: any): Promise<WalletBalance> {
    try {
      const wallet = await this.getUserWallet(userId);
      if (!wallet) {
        throw new CustomError('User wallet not found', 404);
      }

      const [tronBalance, polygonBalance, ethereumBalance] = await Promise.all([
        blockchainService.getBalance('tron', wallet.tronAddress),
        blockchainService.getBalance('polygon', wallet.polygonAddress),
        blockchainService.getBalance('ethereum', wallet.ethereumAddress),
      ]);

      const balance: WalletBalance = {
        tron: tronBalance.success ? tronBalance.balance : 0,
        polygon: polygonBalance.success ? polygonBalance.balance : 0,
        ethereum: ethereumBalance.success ? ethereumBalance.balance : 0,
        total: 0,
      };

      balance.total = balance.tron + balance.polygon + balance.ethereum;

      return balance;
    } catch (error) {
      logger.error('Failed to get wallet balance:', error);
      throw handleDatabaseError(error);
    }
  }

  /**
   * Validate wallet address format
   */
  validateAddress(network: string, address: string): boolean {
    try {
      switch (network) {
        case 'tron':
          return TronWeb.isAddress(address);
        case 'polygon':
        case 'ethereum':
          return ethers.isAddress(address);
        default:
          return false;
      }
    } catch (error) {
      return false;
    }
  }

  /**
   * Get wallet statistics
   */
  async getWalletStats(): Promise<{ totalWallets: number; totalAddresses: number }> {
    try {
      const result = await query(
        'SELECT COUNT(*) as total_wallets FROM user_wallets'
      );

      const totalWallets = parseInt(result.rows[0].total_wallets);
      const totalAddresses = totalWallets * 3; // 3 addresses per wallet (tron, polygon, ethereum)

      return {
        totalWallets,
        totalAddresses,
      };
    } catch (error) {
      logger.error('Failed to get wallet stats:', error);
      throw handleDatabaseError(error);
    }
  }
}
