import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '@theme/colors';
import { formatCurrency } from '@utils/helpers';

interface CardFeeConfirmationScreenProps {
  navigation: any;
  route: {
    params: {
      cardData: {
        cardNumber: string;
        expiryDate: string;
        cvv: string;
        cardholderName: string;
      };
      cardType: string;
      phoneNumber: string;
      step: string;
    };
  };
}

const CardFeeConfirmationScreen: React.FC<CardFeeConfirmationScreenProps> = ({ navigation, route }) => {
  const { cardData, cardType, phoneNumber } = route.params;
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentBalance] = useState(15420.50); // This would come from user's wallet
  const [feeAmount] = useState(50);

  const handleConfirmFee = async () => {
    Alert.alert(
      'Confirm Fee Deduction',
      `A fee of ${formatCurrency(feeAmount)} will be deducted from your wallet to complete the card addition process.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Confirm',
          onPress: () => processFeeDeduction(),
        },
      ]
    );
  };

  const processFeeDeduction = async () => {
    setIsProcessing(true);

    try {
      // Check if user has sufficient balance
      if (currentBalance < feeAmount) {
        Alert.alert(
          'Insufficient Balance',
          `You need ${formatCurrency(feeAmount)} to add this card. Your current balance is ${formatCurrency(currentBalance)}.`,
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Main'),
            },
          ]
        );
        return;
      }

      // Simulate API call to process fee deduction
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Navigate to success screen
      navigation.navigate('CardAdditionSuccess', {
        cardData,
        cardType,
        feeAmount,
        transactionId: 'TXN_' + Date.now(),
      });
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to process fee deduction. Please try again.',
        [
          {
            text: 'Retry',
            onPress: () => processFeeDeduction(),
          },
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Card Addition',
      'Are you sure you want to cancel adding this card?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => navigation.navigate('Main'),
        },
      ]
    );
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
          <Text style={styles.headerTitle}>Confirm Fee</Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Card Preview */}
        <View style={styles.cardPreview}>
          <Text style={styles.sectionTitle}>Card Details</Text>
          <View style={styles.cardContainer}>
            <View style={styles.cardInfo}>
              <Ionicons name="card" size={24} color={colors.secondary} />
              <View style={styles.cardDetails}>
                <Text style={styles.cardType}>{cardType?.toUpperCase() || 'CARD'}</Text>
                <Text style={styles.cardNumber}>
                  **** **** **** {cardData.cardNumber.slice(-4)}
                </Text>
                <Text style={styles.cardholder}>{cardData.cardholderName}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Fee Information */}
        <View style={styles.feeSection}>
          <Text style={styles.sectionTitle}>Fee Information</Text>
          <View style={styles.feeCard}>
            <View style={styles.feeRow}>
              <View style={styles.feeItem}>
                <Ionicons name="card-outline" size={20} color={colors.textSecondary} />
                <Text style={styles.feeLabel}>Card Addition Fee</Text>
              </View>
              <Text style={styles.feeAmount}>{formatCurrency(feeAmount)}</Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.feeRow}>
              <View style={styles.feeItem}>
                <Ionicons name="wallet-outline" size={20} color={colors.textSecondary} />
                <Text style={styles.feeLabel}>Current Balance</Text>
              </View>
              <Text style={styles.balanceAmount}>{formatCurrency(currentBalance)}</Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.feeRow}>
              <View style={styles.feeItem}>
                <Ionicons name="calculator-outline" size={20} color={colors.textSecondary} />
                <Text style={styles.feeLabel}>Balance After Fee</Text>
              </View>
              <Text style={styles.remainingAmount}>
                {formatCurrency(currentBalance - feeAmount)}
              </Text>
            </View>
          </View>
        </View>

        {/* Security Information */}
        <View style={styles.securitySection}>
          <Text style={styles.sectionTitle}>Security & Privacy</Text>
          <View style={styles.securityCard}>
            <View style={styles.securityItem}>
              <Ionicons name="shield-checkmark" size={20} color={colors.success} />
              <Text style={styles.securityText}>Your card information is encrypted</Text>
            </View>
            <View style={styles.securityItem}>
              <Ionicons name="lock-closed" size={20} color={colors.success} />
              <Text style={styles.securityText}>PCI DSS compliant security</Text>
            </View>
            <View style={styles.securityItem}>
              <Ionicons name="eye-off" size={20} color={colors.success} />
              <Text style={styles.securityText}>CVV is never stored</Text>
            </View>
            <View style={styles.securityItem}>
              <Ionicons name="card" size={20} color={colors.success} />
              <Text style={styles.securityText}>Card can be removed anytime</Text>
            </View>
          </View>
        </View>

        {/* Terms and Conditions */}
        <View style={styles.termsSection}>
          <Text style={styles.termsTitle}>Terms & Conditions</Text>
          <Text style={styles.termsText}>
            By adding this card, you agree to our terms of service and privacy policy. 
            The card addition fee is non-refundable and will be deducted from your wallet balance.
          </Text>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.cancelButton, isProcessing && styles.buttonDisabled]}
          onPress={handleCancel}
          disabled={isProcessing}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.confirmButton, isProcessing && styles.buttonDisabled]}
          onPress={handleConfirmFee}
          disabled={isProcessing}
        >
          <LinearGradient
            colors={isProcessing ? [colors.textSecondary, colors.textSecondary] : [colors.secondary, colors.secondaryLight]}
            style={styles.confirmGradient}
          >
            <Text style={styles.confirmButtonText}>
              {isProcessing ? 'Processing...' : `Pay ${formatCurrency(feeAmount)}`}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 15,
  },
  cardPreview: {
    marginTop: 20,
  },
  cardContainer: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    ...shadows.card,
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardDetails: {
    marginLeft: 12,
  },
  cardType: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
  },
  cardNumber: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 2,
  },
  cardholder: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  feeSection: {
    marginTop: 30,
  },
  feeCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    ...shadows.card,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  feeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  feeLabel: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 8,
  },
  feeAmount: {
    fontSize: 16,
    color: colors.secondary,
    fontWeight: 'bold',
  },
  balanceAmount: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  remainingAmount: {
    fontSize: 16,
    color: colors.success,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: 8,
  },
  securitySection: {
    marginTop: 30,
  },
  securityCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    ...shadows.card,
  },
  securityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  securityText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 12,
  },
  termsSection: {
    marginTop: 30,
    marginBottom: 20,
  },
  termsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  termsText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 30,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  confirmButton: {
    flex: 2,
    borderRadius: 12,
    overflow: 'hidden',
    ...shadows.large,
  },
  confirmGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default CardFeeConfirmationScreen;
