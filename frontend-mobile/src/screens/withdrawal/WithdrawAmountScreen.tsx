import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  TextInput,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '@theme/colors';
import { formatCurrency } from '@utils/helpers';

interface WithdrawAmountScreenProps {
  navigation: any;
}

const WithdrawAmountScreen: React.FC<WithdrawAmountScreenProps> = ({ navigation }) => {
  const [amount, setAmount] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const userBalance = 25000.00;

  const quickAmounts = [5000, 10000, 15000, 20000];

  const validateAmount = (inputAmount: string): boolean => {
    const numAmount = parseFloat(inputAmount);
    
    if (!inputAmount || isNaN(numAmount)) {
      setErrors({ amount: 'Please enter a valid amount' });
      return false;
    }

    if (numAmount <= 0) {
      setErrors({ amount: 'Amount must be greater than zero' });
      return false;
    }

    if (numAmount > userBalance) {
      setErrors({ amount: `Amount cannot exceed your balance of ${formatCurrency(userBalance)}` });
      return false;
    }

    if (numAmount < 100) {
      setErrors({ amount: 'Minimum withdrawal amount is ₦100' });
      return false;
    }

    setErrors({});
    return true;
  };

  const handleAmountChange = (value: string) => {
    // Remove any non-numeric characters except decimal point
    const cleanValue = value.replace(/[^0-9.]/g, '');
    setAmount(cleanValue);
    
    if (errors.amount) {
      setErrors({});
    }
  };

  const handleQuickAmount = (quickAmount: number) => {
    if (quickAmount > userBalance) {
      Alert.alert('Insufficient Balance', `You cannot withdraw ${formatCurrency(quickAmount)}. Your balance is ${formatCurrency(userBalance)}.`);
      return;
    }
    setAmount(quickAmount.toString());
    setErrors({});
  };

  const handleContinue = () => {
    if (validateAmount(amount)) {
      navigation.navigate('SelectBank', {
        amount: parseFloat(amount),
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      {/* Header */}
      <LinearGradient colors={[colors.primary, colors.primaryLight]} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Withdraw Money</Text>
          <View style={styles.placeholder} />
        </View>
        
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceAmount}>{formatCurrency(userBalance)}</Text>
        </View>
      </LinearGradient>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Enter Amount</Text>
          <Text style={styles.sectionSubtitle}>How much would you like to withdraw?</Text>
          
          <View style={styles.amountInputContainer}>
            <Text style={styles.currencySymbol}>₦</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={handleAmountChange}
              placeholder="0.00"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              autoFocus
            />
          </View>
          
          {errors.amount && (
            <Text style={styles.errorText}>{errors.amount}</Text>
          )}
        </View>

        {/* Quick Amounts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Amounts</Text>
          <View style={styles.quickAmounts}>
            {quickAmounts.map((quickAmount) => (
              <TouchableOpacity
                key={quickAmount}
                style={[
                  styles.quickAmountButton,
                  quickAmount > userBalance && styles.disabledButton
                ]}
                onPress={() => handleQuickAmount(quickAmount)}
                disabled={quickAmount > userBalance}
              >
                <Text style={[
                  styles.quickAmountText,
                  quickAmount > userBalance && styles.disabledText
                ]}>
                  {formatCurrency(quickAmount)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Withdrawal Info */}
        <View style={styles.infoCard}>
          <View style={styles.infoItem}>
            <Ionicons name="information-circle" size={20} color={colors.info} />
            <Text style={styles.infoText}>
              Withdrawals are processed within 24 hours
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="card" size={20} color={colors.info} />
            <Text style={styles.infoText}>
              Money will be sent to your selected bank account
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="shield-checkmark" size={20} color={colors.info} />
            <Text style={styles.infoText}>
              Secure transaction with PIN and OTP verification
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            (!amount || errors.amount) && styles.disabledButton
          ]}
          onPress={handleContinue}
          disabled={!amount || !!errors.amount}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
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
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  balanceContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  balanceLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginBottom: 8,
  },
  balanceAmount: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    ...shadows.small,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.textPrimary,
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    marginTop: 8,
  },
  quickAmounts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAmountButton: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    width: '48%',
    marginBottom: 8,
    alignItems: 'center',
    ...shadows.small,
  },
  quickAmountText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  disabledButton: {
    backgroundColor: colors.border,
  },
  disabledText: {
    color: colors.textSecondary,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    ...shadows.small,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 12,
    flex: 1,
  },
  buttonContainer: {
    padding: 20,
    backgroundColor: 'white',
    ...shadows.small,
  },
  continueButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default WithdrawAmountScreen;
