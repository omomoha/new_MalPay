import React from 'react';
import { Alert } from 'react-native';

export interface TransferCharges {
  amount: number;
  cryptoProcessorFee: number;
  malpayCharge: number;
  totalFees: number;
  totalAmount: number;
  adminId: string; // Admin account ID to receive charges
  breakdown: {
    originalAmount: number;
    cryptoProcessorFee: number;
    malpayCharge: number;
    totalFees: number;
    totalAmount: number;
  };
}

export interface CryptoProcessorConfig {
  name: string;
  feePercentage: number;
  minimumFee: number;
  maximumFee: number;
  currency: string;
}

export interface MalPayConfig {
  chargePercentage: number; // 0.1% = 0.001
  minimumAmount: number; // ₦1000
  maximumCharge: number; // ₦2000
  currency: string;
}

class TransferChargesService {
  private static instance: TransferChargesService;
  
  // Crypto payment processor configurations
  private cryptoProcessors: CryptoProcessorConfig[] = [
    {
      name: 'Tron USDT',
      feePercentage: 0.5, // 0.5%
      minimumFee: 1, // 1 USDT
      maximumFee: 50, // 50 USDT
      currency: 'USDT',
    },
    {
      name: 'Polygon USDT',
      feePercentage: 0.3, // 0.3%
      minimumFee: 0.5, // 0.5 USDT
      maximumFee: 30, // 30 USDT
      currency: 'USDT',
    },
    {
      name: 'Ethereum USDT',
      feePercentage: 1.0, // 1.0%
      minimumFee: 5, // 5 USDT
      maximumFee: 100, // 100 USDT
      currency: 'USDT',
    },
  ];

  // MalPay configuration
  private malpayConfig: MalPayConfig = {
    chargePercentage: 0.001, // 0.1%
    minimumAmount: 1000, // ₦1000
    maximumCharge: 2000, // ₦2000
    currency: 'NGN',
  };

  // Admin account configuration
  private adminConfig = {
    adminId: 'malpay-admin-001', // Default admin account ID
    adminEmail: 'admin@malpay.com',
    adminUsername: 'malpay_admin',
  };

  // Exchange rates (in a real app, this would come from an API)
  private exchangeRates = {
    NGN_TO_USDT: 0.00065, // 1 NGN = 0.00065 USDT (approximate)
    USDT_TO_NGN: 1538.46, // 1 USDT = 1538.46 NGN (approximate)
  };

  public static getInstance(): TransferChargesService {
    if (!TransferChargesService.instance) {
      TransferChargesService.instance = new TransferChargesService();
    }
    return TransferChargesService.instance;
  }

  /**
   * Calculate all transfer charges for a given amount
   */
  calculateTransferCharges(
    amount: number,
    currency: 'NGN' | 'USDT' = 'NGN',
    processorType: 'tron' | 'polygon' | 'ethereum' = 'tron'
  ): TransferCharges {
    // Convert amount to USDT if needed
    const amountInUSDT = currency === 'NGN' ? this.convertNGNToUSDT(amount) : amount;
    const amountInNGN = currency === 'USDT' ? this.convertUSDTToNGN(amount) : amount;

    // Get crypto processor configuration
    const processor = this.getCryptoProcessor(processorType);
    
    // Calculate crypto processor fee
    const cryptoProcessorFee = this.calculateCryptoProcessorFee(amountInUSDT, processor);
    
    // Calculate MalPay charge
    const malpayCharge = this.calculateMalPayCharge(amountInNGN);
    
    // Calculate total fees
    const totalFees = cryptoProcessorFee + malpayCharge;
    const totalAmount = amount + totalFees;

    return {
      amount,
      cryptoProcessorFee,
      malpayCharge,
      totalFees,
      totalAmount,
      adminId: this.adminConfig.adminId,
      breakdown: {
        originalAmount: amount,
        cryptoProcessorFee,
        malpayCharge,
        totalFees,
        totalAmount,
      },
    };
  }

  /**
   * Get crypto processor configuration
   */
  private getCryptoProcessor(type: 'tron' | 'polygon' | 'ethereum'): CryptoProcessorConfig {
    switch (type) {
      case 'tron':
        return this.cryptoProcessors[0];
      case 'polygon':
        return this.cryptoProcessors[1];
      case 'ethereum':
        return this.cryptoProcessors[2];
      default:
        return this.cryptoProcessors[0];
    }
  }

  /**
   * Calculate crypto processor fee
   */
  private calculateCryptoProcessorFee(amountInUSDT: number, processor: CryptoProcessorConfig): number {
    const percentageFee = (amountInUSDT * processor.feePercentage) / 100;
    
    // Apply minimum and maximum limits
    let fee = Math.max(percentageFee, processor.minimumFee);
    fee = Math.min(fee, processor.maximumFee);
    
    // Convert back to NGN
    return this.convertUSDTToNGN(fee);
  }

  /**
   * Calculate MalPay charge (0.1% above ₦1000, capped at ₦2000)
   */
  private calculateMalPayCharge(amountInNGN: number): number {
    if (amountInNGN < this.malpayConfig.minimumAmount) {
      return 0; // No charge for amounts below ₦1000
    }

    const charge = amountInNGN * this.malpayConfig.chargePercentage;
    return Math.min(charge, this.malpayConfig.maximumCharge);
  }

  /**
   * Convert NGN to USDT
   */
  private convertNGNToUSDT(ngnAmount: number): number {
    return ngnAmount * this.exchangeRates.NGN_TO_USDT;
  }

  /**
   * Convert USDT to NGN
   */
  private convertUSDTToNGN(usdtAmount: number): number {
    return usdtAmount * this.exchangeRates.USDT_TO_NGN;
  }

  /**
   * Get fee breakdown for display
   */
  getFeeBreakdown(charges: TransferCharges): {
    items: Array<{
      label: string;
      amount: number;
      percentage?: number;
      description: string;
    }>;
    total: number;
  } {
    const items = [
      {
        label: 'Transfer Amount',
        amount: charges.amount,
        description: 'Amount to be transferred',
      },
      {
        label: 'Crypto Processor Fee',
        amount: charges.cryptoProcessorFee,
        percentage: (charges.cryptoProcessorFee / charges.amount) * 100,
        description: 'Fee for crypto transaction processing',
      },
      {
        label: 'MalPay Service Charge',
        amount: charges.malpayCharge,
        percentage: (charges.malpayCharge / charges.amount) * 100,
        description: 'MalPay platform fee (0.1% above ₦1000, max ₦2000)',
      },
    ];

    return {
      items,
      total: charges.totalAmount,
    };
  }

  /**
   * Validate if user has sufficient balance for transfer
   */
  validateSufficientBalance(
    userBalance: number,
    charges: TransferCharges
  ): { isValid: boolean; shortfall?: number } {
    if (userBalance >= charges.totalAmount) {
      return { isValid: true };
    }

    return {
      isValid: false,
      shortfall: charges.totalAmount - userBalance,
    };
  }

  /**
   * Get available crypto processors
   */
  getAvailableProcessors(): Array<{
    type: 'tron' | 'polygon' | 'ethereum';
    name: string;
    feePercentage: number;
    description: string;
  }> {
    return [
      {
        type: 'tron',
        name: 'Tron USDT',
        feePercentage: 0.5,
        description: 'Fast and low-cost transfers',
      },
      {
        type: 'polygon',
        name: 'Polygon USDT',
        feePercentage: 0.3,
        description: 'Ultra-low fees, instant transfers',
      },
      {
        type: 'ethereum',
        name: 'Ethereum USDT',
        feePercentage: 1.0,
        description: 'Most secure, higher fees',
      },
    ];
  }

  /**
   * Update exchange rates (would be called from API in real app)
   */
  updateExchangeRates(rates: { NGN_TO_USDT: number; USDT_TO_NGN: number }) {
    this.exchangeRates = rates;
  }

  /**
   * Get current exchange rates
   */
  getExchangeRates() {
    return { ...this.exchangeRates };
  }

  /**
   * Get admin configuration
   */
  getAdminConfig() {
    return { ...this.adminConfig };
  }

  /**
   * Update admin configuration
   */
  updateAdminConfig(config: { adminId?: string; adminEmail?: string; adminUsername?: string }) {
    this.adminConfig = { ...this.adminConfig, ...config };
  }

  /**
   * Get admin ID for charging fees
   */
  getAdminId(): string {
    return this.adminConfig.adminId;
  }

  /**
   * Process admin earnings from transaction
   */
  async processAdminEarnings(charges: TransferCharges, transactionId: string): Promise<{
    success: boolean;
    adminTransactionId?: string;
    error?: string;
  }> {
    try {
      // In a real implementation, this would make an API call to the backend
      // to credit the admin wallet with the MalPay charges
      
      const adminEarningsData = {
        adminId: charges.adminId,
        amount: charges.malpayCharge,
        currency: 'NGN',
        transactionId,
        description: `MalPay service charge for transfer of ${charges.amount} NGN`,
        metadata: {
          originalAmount: charges.amount,
          cryptoProcessorFee: charges.cryptoProcessorFee,
          malpayCharge: charges.malpayCharge,
          totalFees: charges.totalFees,
          totalAmount: charges.totalAmount,
        },
      };

      // Simulate API call
      console.log('Processing admin earnings:', adminEarningsData);
      
      // Mock successful response
      return {
        success: true,
        adminTransactionId: `admin-tx-${Date.now()}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export const transferChargesService = TransferChargesService.getInstance();

// Transfer Charges Display Component
interface TransferChargesDisplayProps {
  charges: TransferCharges;
  onProcessorChange?: (processor: 'tron' | 'polygon' | 'ethereum') => void;
  selectedProcessor?: 'tron' | 'polygon' | 'ethereum';
}

export const TransferChargesDisplay: React.FC<TransferChargesDisplayProps> = ({
  charges,
  onProcessorChange,
  selectedProcessor = 'tron',
}) => {
  const breakdown = transferChargesService.getFeeBreakdown(charges);
  const processors = transferChargesService.getAvailableProcessors();

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Transfer Charges</h3>
        <p style={styles.subtitle}>Breakdown of fees and charges</p>
      </div>

      {/* Fee Breakdown */}
      <div style={styles.breakdown}>
        {breakdown.items.map((item, index) => (
          <div key={index} style={styles.feeItem}>
            <div style={styles.feeLabel}>
              <Text style={styles.feeName}>{item.label}</Text>
              {item.percentage && (
                <Text style={styles.feePercentage}>({item.percentage.toFixed(2)}%)</Text>
              )}
            </div>
            <Text style={styles.feeAmount}>₦{item.amount.toFixed(2)}</Text>
          </div>
        ))}
        
        <div style={styles.divider} />
        
        <div style={styles.totalItem}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalAmount}>₦{breakdown.total.toFixed(2)}</Text>
        </div>
      </div>

      {/* Processor Selection */}
      {onProcessorChange && (
        <div style={styles.processorSection}>
          <Text style={styles.processorTitle}>Crypto Processor</Text>
          <div style={styles.processorOptions}>
            {processors.map((processor) => (
              <TouchableOpacity
                key={processor.type}
                style={[
                  styles.processorOption,
                  selectedProcessor === processor.type && styles.selectedProcessor
                ]}
                onPress={() => onProcessorChange(processor.type)}
              >
                <Text style={[
                  styles.processorName,
                  selectedProcessor === processor.type && styles.selectedProcessorText
                ]}>
                  {processor.name}
                </Text>
                <Text style={[
                  styles.processorFee,
                  selectedProcessor === processor.type && styles.selectedProcessorText
                ]}>
                  {processor.feePercentage}% fee
                </Text>
                <Text style={[
                  styles.processorDescription,
                  selectedProcessor === processor.type && styles.selectedProcessorText
                ]}>
                  {processor.description}
                </Text>
              </TouchableOpacity>
            ))}
          </div>
        </div>
      )}

      {/* Information */}
      <div style={styles.infoSection}>
        <Text style={styles.infoTitle}>Fee Information:</Text>
        <Text style={styles.infoText}>• Crypto processor fees vary by network</Text>
        <Text style={styles.infoText}>• MalPay charges 0.1% for transfers above ₦1000</Text>
        <Text style={styles.infoText}>• Maximum MalPay charge is ₦2000</Text>
        <Text style={styles.infoText}>• All fees are included in the total amount</Text>
      </div>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    margin: 16,
    ...shadows.small,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  breakdown: {
    marginBottom: 20,
  },
  feeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  feeLabel: {
    flex: 1,
  },
  feeName: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  feePercentage: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  feeAmount: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 8,
  },
  totalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  totalLabel: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: 'bold',
  },
  processorSection: {
    marginBottom: 20,
  },
  processorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  processorOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  processorOption: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    margin: 4,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  selectedProcessor: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary,
  },
  processorName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  processorFee: {
    fontSize: 10,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  processorDescription: {
    fontSize: 9,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  selectedProcessorText: {
    color: colors.primary,
  },
  infoSection: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
};

export default transferChargesService;
