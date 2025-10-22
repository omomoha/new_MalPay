import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '@theme/colors';
import { formatCurrency } from '@utils/helpers';
import { transferChargesService, TransferCharges } from '@services/TransferChargesService';

interface SendMoneyScreenProps {
  navigation: any;
  route?: {
    params?: {
      recipientEmail?: string;
      recipientName?: string;
      fromQR?: boolean;
    };
  };
}

interface RecipientInfo {
  email: string;
  name: string;
  phoneNumber: string;
  avatar?: string;
  isVerified: boolean;
}

const SendMoneyScreen: React.FC<SendMoneyScreenProps> = ({ navigation, route }) => {
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientInfo, setRecipientInfo] = useState<RecipientInfo | null>(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [fromQR, setFromQR] = useState(false);
  const [transferCharges, setTransferCharges] = useState<TransferCharges | null>(null);
  const [selectedProcessor, setSelectedProcessor] = useState<'tron' | 'polygon' | 'ethereum'>('tron');
  const [showChargesBreakdown, setShowChargesBreakdown] = useState(false);

  // Mock user balance (would come from Redux store)
  const [userBalance] = useState(15420.50);

  // Handle QR code parameters
  useEffect(() => {
    if (route?.params) {
      const { recipientEmail: qrEmail, recipientName: qrName, fromQR: isFromQR } = route.params;
      
      if (qrEmail && qrName) {
        setRecipientEmail(qrEmail);
        setFromQR(isFromQR || false);
        
        // Auto-populate recipient info from QR code
        const qrRecipientInfo: RecipientInfo = {
          email: qrEmail,
          name: qrName,
          phoneNumber: '+234 801 234 5678', // Would come from QR data
          isVerified: true,
        };
        setRecipientInfo(qrRecipientInfo);
      }
    }
  }, [route?.params]);

  // Mock recipients database (would be API call in real app)
  const mockRecipients: RecipientInfo[] = [
    {
      email: 'john.doe@example.com',
      name: 'John Doe',
      phoneNumber: '+234 801 234 5678',
      isVerified: true,
    },
    {
      email: 'jane.smith@example.com',
      name: 'Jane Smith',
      phoneNumber: '+234 802 345 6789',
      isVerified: true,
    },
    {
      email: 'mike.wilson@example.com',
      name: 'Mike Wilson',
      phoneNumber: '+234 803 456 7890',
      isVerified: false,
    },
  ];

  // Lookup recipient by email
  const lookupRecipient = async (email: string) => {
    if (!email || !email.includes('@')) {
      setRecipientInfo(null);
      return;
    }

    setIsLookingUp(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const recipient = mockRecipients.find(r => r.email.toLowerCase() === email.toLowerCase());
      setRecipientInfo(recipient || null);
      
      if (!recipient) {
        setErrors({ email: 'No account found with this email address' });
      } else {
        setErrors({});
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to lookup recipient. Please try again.');
    } finally {
      setIsLookingUp(false);
    }
  };

  // Debounced email lookup
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (recipientEmail) {
        lookupRecipient(recipientEmail);
      } else {
        setRecipientInfo(null);
        setErrors({});
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [recipientEmail]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!recipientEmail.trim()) {
      newErrors.email = 'Recipient email is required';
    } else if (!/\S+@\S+\.\S+/.test(recipientEmail)) {
      newErrors.email = 'Please enter a valid email address';
    } else if (!recipientInfo) {
      newErrors.email = 'No account found with this email';
    }

    if (!amount.trim()) {
      newErrors.amount = 'Amount is required';
    } else {
      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        newErrors.amount = 'Please enter a valid amount';
      } else if (amountNum > userBalance) {
        newErrors.amount = 'Insufficient balance';
      } else if (amountNum < 100) {
        newErrors.amount = 'Minimum amount is ₦100';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendMoney = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors before proceeding');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call to initiate transfer
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Navigate to PIN verification screen
      navigation.navigate('PINVerification', {
        transferData: {
          recipientEmail,
          recipientInfo,
          amount: parseFloat(amount),
          description: description.trim(),
          userBalance,
        },
        step: 'send_money',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to initiate transfer. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatAmountForInput = (value: string) => {
    // Remove non-numeric characters except decimal point
    const cleaned = value.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Calculate transfer charges when amount changes
    if (cleaned && !isNaN(parseFloat(cleaned))) {
      const charges = transferChargesService.calculateTransferCharges(
        parseFloat(cleaned),
        'NGN',
        selectedProcessor
      );
      setTransferCharges(charges);
    } else {
      setTransferCharges(null);
    }
    
    return cleaned;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      {/* Header */}
      <LinearGradient colors={[colors.primary, colors.primaryLight]} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Send Money</Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <KeyboardAvoidingView 
        style={styles.content} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Balance Card */}
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <Text style={styles.balanceAmount}>{formatCurrency(userBalance)}</Text>
          </View>

          {/* Recipient Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Send To</Text>
            
            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <View style={[styles.inputContainer, errors.email && styles.inputError]}>
                <Ionicons name="mail-outline" size={20} color={colors.textSecondary} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter recipient's email"
                  placeholderTextColor={colors.textSecondary}
                  value={recipientEmail}
                  onChangeText={setRecipientEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {isLookingUp && (
                  <Ionicons name="hourglass-outline" size={20} color={colors.secondary} />
                )}
              </View>
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            {/* Recipient Info */}
            {recipientInfo && (
              <View style={styles.recipientCard}>
                <View style={styles.recipientInfo}>
                  <View style={styles.avatarContainer}>
                    <Text style={styles.avatarText}>
                      {recipientInfo.name.split(' ').map(n => n[0]).join('')}
                    </Text>
                  </View>
                  <View style={styles.recipientDetails}>
                    <Text style={styles.recipientName}>{recipientInfo.name}</Text>
                    <Text style={styles.recipientEmail}>{recipientInfo.email}</Text>
                    <Text style={styles.recipientPhone}>{recipientInfo.phoneNumber}</Text>
                    {fromQR && (
                      <View style={styles.qrIndicator}>
                        <Ionicons name="qr-code" size={16} color={colors.primary} />
                        <Text style={styles.qrIndicatorText}>From QR Code</Text>
                      </View>
                    )}
                    {recipientInfo.isVerified && (
                      <View style={styles.verifiedBadge}>
                        <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                        <Text style={styles.verifiedText}>Verified</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Amount Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Amount</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Enter Amount</Text>
              <View style={[styles.inputContainer, errors.amount && styles.inputError]}>
                <Text style={styles.currencySymbol}>₦</Text>
                <TextInput
                  style={styles.amountInput}
                  placeholder="0.00"
                  placeholderTextColor={colors.textSecondary}
                  value={amount}
                  onChangeText={(value) => setAmount(formatAmountForInput(value))}
                  keyboardType="numeric"
                />
              </View>
              {errors.amount && <Text style={styles.errorText}>{errors.amount}</Text>}
            </View>

            {/* Transfer Charges Display */}
            {transferCharges && (
              <View style={styles.chargesCard}>
                <View style={styles.chargesHeader}>
                  <Text style={styles.chargesTitle}>Transfer Charges</Text>
                  <TouchableOpacity
                    style={styles.chargesToggle}
                    onPress={() => setShowChargesBreakdown(!showChargesBreakdown)}
                  >
                    <Text style={styles.chargesToggleText}>
                      {showChargesBreakdown ? 'Hide' : 'Show'} Details
                    </Text>
                    <Ionicons 
                      name={showChargesBreakdown ? 'chevron-up' : 'chevron-down'} 
                      size={16} 
                      color={colors.primary} 
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.chargesSummary}>
                  <View style={styles.chargesRow}>
                    <Text style={styles.chargesLabel}>Transfer Amount</Text>
                    <Text style={styles.chargesValue}>{formatCurrency(transferCharges.amount)}</Text>
                  </View>
                  
                  <View style={styles.chargesRow}>
                    <Text style={styles.chargesLabel}>Crypto Processor Fee</Text>
                    <Text style={styles.chargesValue}>{formatCurrency(transferCharges.cryptoProcessorFee)}</Text>
                  </View>
                  
                  <View style={styles.chargesRow}>
                    <Text style={styles.chargesLabel}>MalPay Service Charge</Text>
                    <Text style={styles.chargesValue}>{formatCurrency(transferCharges.malpayCharge)}</Text>
                  </View>
                  
                  <View style={styles.chargesDivider} />
                  
                  <View style={styles.chargesRow}>
                    <Text style={styles.chargesTotalLabel}>Total Amount</Text>
                    <Text style={styles.chargesTotalValue}>{formatCurrency(transferCharges.totalAmount)}</Text>
                  </View>
                </View>

                {showChargesBreakdown && (
                  <View style={styles.chargesBreakdown}>
                    <Text style={styles.breakdownTitle}>Fee Breakdown</Text>
                    <Text style={styles.breakdownText}>
                      • Crypto processor fee: {((transferCharges.cryptoProcessorFee / transferCharges.amount) * 100).toFixed(2)}%
                    </Text>
                    <Text style={styles.breakdownText}>
                      • MalPay charge: {transferCharges.amount >= 1000 ? '0.1%' : '0%'} (above ₦1000, max ₦2000)
                    </Text>
                    <Text style={styles.breakdownText}>
                      • Total fees: {formatCurrency(transferCharges.totalFees)}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Quick Amount Buttons */}
            <View style={styles.quickAmounts}>
              <TouchableOpacity 
                style={styles.quickAmountButton}
                onPress={() => setAmount('1000')}
              >
                <Text style={styles.quickAmountText}>₦1,000</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.quickAmountButton}
                onPress={() => setAmount('5000')}
              >
                <Text style={styles.quickAmountText}>₦5,000</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.quickAmountButton}
                onPress={() => setAmount('10000')}
              >
                <Text style={styles.quickAmountText}>₦10,000</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.quickAmountButton}
                onPress={() => setAmount(userBalance.toString())}
              >
                <Text style={styles.quickAmountText}>All</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Description Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description (Optional)</Text>
            
            <View style={styles.inputGroup}>
              <View style={styles.inputContainer}>
                <Ionicons name="chatbubble-outline" size={20} color={colors.textSecondary} />
                <TextInput
                  style={styles.input}
                  placeholder="Add a note for this transfer"
                  placeholderTextColor={colors.textSecondary}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
            </View>
          </View>

          {/* Transfer Summary */}
          {recipientInfo && amount && (
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Transfer Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>To</Text>
                <Text style={styles.summaryValue}>{recipientInfo.name}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Amount</Text>
                <Text style={styles.summaryValue}>{formatCurrency(parseFloat(amount) || 0)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Fee</Text>
                <Text style={styles.summaryValue}>₦0.00</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryTotalLabel}>Total</Text>
                <Text style={styles.summaryTotalValue}>{formatCurrency(parseFloat(amount) || 0)}</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Send Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.sendButton, isLoading && styles.sendButtonDisabled]}
            onPress={handleSendMoney}
            disabled={isLoading || !recipientInfo || !amount}
          >
            <LinearGradient
              colors={isLoading ? [colors.textSecondary, colors.textSecondary] : [colors.secondary, colors.secondaryLight]}
              style={styles.sendGradient}
            >
              <Text style={styles.sendButtonText}>
                {isLoading ? 'Processing...' : 'Send Money'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  balanceCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    alignItems: 'center',
    ...shadows.card,
  },
  balanceLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  section: {
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 15,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.card,
  },
  inputError: {
    borderColor: colors.error,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    marginLeft: 12,
  },
  amountInput: {
    flex: 1,
    fontSize: 18,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  currencySymbol: {
    fontSize: 18,
    color: colors.textPrimary,
    fontWeight: 'bold',
    marginRight: 8,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: 4,
  },
  chargesCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    ...shadows.small,
  },
  chargesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  chargesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  chargesToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chargesToggleText: {
    fontSize: 14,
    color: colors.primary,
    marginRight: 4,
  },
  chargesSummary: {
    marginBottom: 8,
  },
  chargesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  chargesLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  chargesValue: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  chargesDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 8,
  },
  chargesTotalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  chargesTotalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  chargesBreakdown: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  breakdownTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  breakdownText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  recipientCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginTop: 10,
    ...shadows.card,
  },
  recipientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  recipientDetails: {
    flex: 1,
  },
  recipientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  recipientEmail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  recipientPhone: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifiedText: {
    fontSize: 12,
    color: colors.success,
    marginLeft: 4,
    fontWeight: '500',
  },
  qrIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  qrIndicatorText: {
    marginLeft: 4,
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  quickAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  quickAmountButton: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  quickAmountText: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    marginBottom: 20,
    ...shadows.card,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: 8,
  },
  summaryTotalLabel: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: 'bold',
  },
  summaryTotalValue: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: 'bold',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 30,
  },
  sendButton: {
    borderRadius: 12,
    overflow: 'hidden',
    ...shadows.large,
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  sendButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SendMoneyScreen;