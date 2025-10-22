import { ethers } from 'ethers';
import TronWeb from 'tronweb';
import { logger } from '../utils/logger';

export interface BlockchainConfig {
  network: 'tron' | 'polygon' | 'ethereum';
  rpcUrl: string;
  privateKey: string;
  usdtContractAddress: string;
  feeRate: number; // Percentage fee (e.g., 0.5 for 0.5%)
  minFee: number; // Minimum fee in USDT
  maxFee: number; // Maximum fee in USDT
}

export interface TransactionRequest {
  to: string;
  amount: number; // Amount in USDT
  from?: string; // Optional sender address
}

export interface TransactionResult {
  success: boolean;
  txHash?: string;
  gasUsed?: number;
  fee?: number;
  error?: string;
}

export interface BalanceResult {
  success: boolean;
  balance: number;
  error?: string;
}

export class BlockchainService {
  private configs: Map<string, BlockchainConfig> = new Map();
  private tronWeb: TronWeb | null = null;
  private polygonProvider: ethers.Provider | null = null;
  private ethereumProvider: ethers.Provider | null = null;

  constructor() {
    this.initializeConfigs();
    this.initializeProviders();
  }

  private initializeConfigs(): void {
    // Tron configuration
    this.configs.set('tron', {
      network: 'tron',
      rpcUrl: process.env.TRON_RPC_URL || 'https://api.trongrid.io',
      privateKey: process.env.TRON_PRIVATE_KEY || '',
      usdtContractAddress: process.env.TRON_USDT_CONTRACT || 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
      feeRate: 0.5, // 0.5%
      minFee: 1, // 1 USDT
      maxFee: 50, // 50 USDT
    });

    // Polygon configuration
    this.configs.set('polygon', {
      network: 'polygon',
      rpcUrl: process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com',
      privateKey: process.env.POLYGON_PRIVATE_KEY || '',
      usdtContractAddress: process.env.POLYGON_USDT_CONTRACT || '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
      feeRate: 0.3, // 0.3%
      minFee: 0.5, // 0.5 USDT
      maxFee: 25, // 25 USDT
    });

    // Ethereum configuration
    this.configs.set('ethereum', {
      network: 'ethereum',
      rpcUrl: process.env.ETHEREUM_RPC_URL || 'https://mainnet.infura.io/v3/YOUR_PROJECT_ID',
      privateKey: process.env.ETHEREUM_PRIVATE_KEY || '',
      usdtContractAddress: process.env.ETHEREUM_USDT_CONTRACT || '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      feeRate: 1.0, // 1.0%
      minFee: 2, // 2 USDT
      maxFee: 100, // 100 USDT
    });
  }

  private initializeProviders(): void {
    try {
      // Initialize TronWeb
      const tronConfig = this.configs.get('tron');
      if (tronConfig) {
        this.tronWeb = new TronWeb({
          fullHost: tronConfig.rpcUrl,
          privateKey: tronConfig.privateKey,
        });
        logger.info('TronWeb initialized successfully');
      }

      // Initialize Polygon provider
      const polygonConfig = this.configs.get('polygon');
      if (polygonConfig) {
        this.polygonProvider = new ethers.JsonRpcProvider(polygonConfig.rpcUrl);
        logger.info('Polygon provider initialized successfully');
      }

      // Initialize Ethereum provider
      const ethereumConfig = this.configs.get('ethereum');
      if (ethereumConfig) {
        this.ethereumProvider = new ethers.JsonRpcProvider(ethereumConfig.rpcUrl);
        logger.info('Ethereum provider initialized successfully');
      }
    } catch (error) {
      logger.error('Failed to initialize blockchain providers:', error);
    }
  }

  /**
   * Calculate transaction fees for a given network and amount
   */
  calculateFees(network: string, amount: number): { fee: number; minFee: number; maxFee: number } {
    const config = this.configs.get(network);
    if (!config) {
      throw new Error(`Unsupported network: ${network}`);
    }

    const calculatedFee = (amount * config.feeRate) / 100;
    const fee = Math.max(config.minFee, Math.min(calculatedFee, config.maxFee));

    return {
      fee,
      minFee: config.minFee,
      maxFee: config.maxFee,
    };
  }

  /**
   * Get USDT balance for an address on a specific network
   */
  async getBalance(network: string, address: string): Promise<BalanceResult> {
    try {
      switch (network) {
        case 'tron':
          return await this.getTronBalance(address);
        case 'polygon':
          return await this.getPolygonBalance(address);
        case 'ethereum':
          return await this.getEthereumBalance(address);
        default:
          return {
            success: false,
            balance: 0,
            error: `Unsupported network: ${network}`,
          };
      }
    } catch (error) {
      logger.error(`Failed to get balance for ${address} on ${network}:`, error);
      return {
        success: false,
        balance: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Send USDT transaction on a specific network
   */
  async sendTransaction(network: string, request: TransactionRequest): Promise<TransactionResult> {
    try {
      switch (network) {
        case 'tron':
          return await this.sendTronTransaction(request);
        case 'polygon':
          return await this.sendPolygonTransaction(request);
        case 'ethereum':
          return await this.sendEthereumTransaction(request);
        default:
          return {
            success: false,
            error: `Unsupported network: ${network}`,
          };
      }
    } catch (error) {
      logger.error(`Failed to send transaction on ${network}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get Tron USDT balance
   */
  private async getTronBalance(address: string): Promise<BalanceResult> {
    if (!this.tronWeb) {
      return {
        success: false,
        balance: 0,
        error: 'TronWeb not initialized',
      };
    }

    try {
      const config = this.configs.get('tron')!;
      const contract = await this.tronWeb.contract().at(config.usdtContractAddress);
      const balance = await contract.balanceOf(address).call();
      
      // Convert from Sun to USDT (1 USDT = 1,000,000 Sun)
      const usdtBalance = balance.toNumber() / 1000000;

      return {
        success: true,
        balance: usdtBalance,
      };
    } catch (error) {
      return {
        success: false,
        balance: 0,
        error: error instanceof Error ? error.message : 'Failed to get Tron balance',
      };
    }
  }

  /**
   * Send Tron USDT transaction
   */
  private async sendTronTransaction(request: TransactionRequest): Promise<TransactionResult> {
    if (!this.tronWeb) {
      return {
        success: false,
        error: 'TronWeb not initialized',
      };
    }

    try {
      const config = this.configs.get('tron')!;
      const contract = await this.tronWeb.contract().at(config.usdtContractAddress);
      
      // Convert USDT to Sun (1 USDT = 1,000,000 Sun)
      const amountInSun = Math.floor(request.amount * 1000000);

      // Send transaction
      const transaction = await contract.transfer(request.to, amountInSun).send();
      
      logger.info(`Tron transaction sent: ${transaction}`);

      return {
        success: true,
        txHash: transaction,
        fee: this.calculateFees('tron', request.amount).fee,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send Tron transaction',
      };
    }
  }

  /**
   * Get Polygon USDT balance
   */
  private async getPolygonBalance(address: string): Promise<BalanceResult> {
    if (!this.polygonProvider) {
      return {
        success: false,
        balance: 0,
        error: 'Polygon provider not initialized',
      };
    }

    try {
      const config = this.configs.get('polygon')!;
      
      // USDT contract ABI (minimal for balanceOf)
      const contractABI = [
        'function balanceOf(address owner) view returns (uint256)',
        'function decimals() view returns (uint8)',
      ];

      const contract = new ethers.Contract(config.usdtContractAddress, contractABI, this.polygonProvider);
      const balance = await contract.balanceOf(address);
      const decimals = await contract.decimals();
      
      // Convert from wei to USDT
      const usdtBalance = parseFloat(ethers.formatUnits(balance, decimals));

      return {
        success: true,
        balance: usdtBalance,
      };
    } catch (error) {
      return {
        success: false,
        balance: 0,
        error: error instanceof Error ? error.message : 'Failed to get Polygon balance',
      };
    }
  }

  /**
   * Send Polygon USDT transaction
   */
  private async sendPolygonTransaction(request: TransactionRequest): Promise<TransactionResult> {
    if (!this.polygonProvider) {
      return {
        success: false,
        error: 'Polygon provider not initialized',
      };
    }

    try {
      const config = this.configs.get('polygon')!;
      
      // Create wallet from private key
      const wallet = new ethers.Wallet(config.privateKey, this.polygonProvider);
      
      // USDT contract ABI (minimal for transfer)
      const contractABI = [
        'function transfer(address to, uint256 amount) returns (bool)',
        'function decimals() view returns (uint8)',
      ];

      const contract = new ethers.Contract(config.usdtContractAddress, contractABI, wallet);
      const decimals = await contract.decimals();
      
      // Convert USDT to wei
      const amountInWei = ethers.parseUnits(request.amount.toString(), decimals);

      // Send transaction
      const transaction = await contract.transfer(request.to, amountInWei);
      const receipt = await transaction.wait();

      logger.info(`Polygon transaction sent: ${transaction.hash}`);

      return {
        success: true,
        txHash: transaction.hash,
        gasUsed: receipt.gasUsed,
        fee: this.calculateFees('polygon', request.amount).fee,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send Polygon transaction',
      };
    }
  }

  /**
   * Get Ethereum USDT balance
   */
  private async getEthereumBalance(address: string): Promise<BalanceResult> {
    if (!this.ethereumProvider) {
      return {
        success: false,
        balance: 0,
        error: 'Ethereum provider not initialized',
      };
    }

    try {
      const config = this.configs.get('ethereum')!;
      
      // USDT contract ABI (minimal for balanceOf)
      const contractABI = [
        'function balanceOf(address owner) view returns (uint256)',
        'function decimals() view returns (uint8)',
      ];

      const contract = new ethers.Contract(config.usdtContractAddress, contractABI, this.ethereumProvider);
      const balance = await contract.balanceOf(address);
      const decimals = await contract.decimals();
      
      // Convert from wei to USDT
      const usdtBalance = parseFloat(ethers.formatUnits(balance, decimals));

      return {
        success: true,
        balance: usdtBalance,
      };
    } catch (error) {
      return {
        success: false,
        balance: 0,
        error: error instanceof Error ? error.message : 'Failed to get Ethereum balance',
      };
    }
  }

  /**
   * Send Ethereum USDT transaction
   */
  private async sendEthereumTransaction(request: TransactionRequest): Promise<TransactionResult> {
    if (!this.ethereumProvider) {
      return {
        success: false,
        error: 'Ethereum provider not initialized',
      };
    }

    try {
      const config = this.configs.get('ethereum')!;
      
      // Create wallet from private key
      const wallet = new ethers.Wallet(config.privateKey, this.ethereumProvider);
      
      // USDT contract ABI (minimal for transfer)
      const contractABI = [
        'function transfer(address to, uint256 amount) returns (bool)',
        'function decimals() view returns (uint8)',
      ];

      const contract = new ethers.Contract(config.usdtContractAddress, contractABI, wallet);
      const decimals = await contract.decimals();
      
      // Convert USDT to wei
      const amountInWei = ethers.parseUnits(request.amount.toString(), decimals);

      // Send transaction
      const transaction = await contract.transfer(request.to, amountInWei);
      const receipt = await transaction.wait();

      logger.info(`Ethereum transaction sent: ${transaction.hash}`);

      return {
        success: true,
        txHash: transaction.hash,
        gasUsed: receipt.gasUsed,
        fee: this.calculateFees('ethereum', request.amount).fee,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send Ethereum transaction',
      };
    }
  }

  /**
   * Get transaction status by hash
   */
  async getTransactionStatus(network: string, txHash: string): Promise<{ success: boolean; status: string; confirmations?: number; error?: string }> {
    try {
      switch (network) {
        case 'tron':
          return await this.getTronTransactionStatus(txHash);
        case 'polygon':
          return await this.getPolygonTransactionStatus(txHash);
        case 'ethereum':
          return await this.getEthereumTransactionStatus(txHash);
        default:
          return {
            success: false,
            status: 'unknown',
            error: `Unsupported network: ${network}`,
          };
      }
    } catch (error) {
      return {
        success: false,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get Tron transaction status
   */
  private async getTronTransactionStatus(txHash: string): Promise<{ success: boolean; status: string; confirmations?: number; error?: string }> {
    if (!this.tronWeb) {
      return {
        success: false,
        status: 'error',
        error: 'TronWeb not initialized',
      };
    }

    try {
      const transaction = await this.tronWeb.trx.getTransaction(txHash);
      
      if (!transaction) {
        return {
          success: false,
          status: 'not_found',
          error: 'Transaction not found',
        };
      }

      const confirmations = transaction.confirmations || 0;
      const status = confirmations >= 1 ? 'confirmed' : 'pending';

      return {
        success: true,
        status,
        confirmations,
      };
    } catch (error) {
      return {
        success: false,
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to get transaction status',
      };
    }
  }

  /**
   * Get Polygon transaction status
   */
  private async getPolygonTransactionStatus(txHash: string): Promise<{ success: boolean; status: string; confirmations?: number; error?: string }> {
    if (!this.polygonProvider) {
      return {
        success: false,
        status: 'error',
        error: 'Polygon provider not initialized',
      };
    }

    try {
      const receipt = await this.polygonProvider.getTransactionReceipt(txHash);
      
      if (!receipt) {
        return {
          success: false,
          status: 'pending',
        };
      }

      const status = receipt.status === 1 ? 'confirmed' : 'failed';
      const confirmations = receipt.confirmations;

      return {
        success: true,
        status,
        confirmations,
      };
    } catch (error) {
      return {
        success: false,
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to get transaction status',
      };
    }
  }

  /**
   * Get Ethereum transaction status
   */
  private async getEthereumTransactionStatus(txHash: string): Promise<{ success: boolean; status: string; confirmations?: number; error?: string }> {
    if (!this.ethereumProvider) {
      return {
        success: false,
        status: 'error',
        error: 'Ethereum provider not initialized',
      };
    }

    try {
      const receipt = await this.ethereumProvider.getTransactionReceipt(txHash);
      
      if (!receipt) {
        return {
          success: false,
          status: 'pending',
        };
      }

      const status = receipt.status === 1 ? 'confirmed' : 'failed';
      const confirmations = receipt.confirmations;

      return {
        success: true,
        status,
        confirmations,
      };
    } catch (error) {
      return {
        success: false,
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to get transaction status',
      };
    }
  }

  /**
   * Get supported networks
   */
  getSupportedNetworks(): string[] {
    return Array.from(this.configs.keys());
  }

  /**
   * Get network configuration
   */
  getNetworkConfig(network: string): BlockchainConfig | null {
    return this.configs.get(network) || null;
  }
}
