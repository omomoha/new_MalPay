import React, { useState, useEffect } from 'react';
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

interface SelectBankScreenProps {
  navigation: any;
  route: {
    params: {
      amount: number;
    };
  };
}

interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  isVerified: boolean;
  isPrimary: boolean;
}

const SelectBankScreen: React.FC<SelectBankScreenProps> = ({ navigation, route }) => {
  const { amount } = route.params;
  const [selectedBank, setSelectedBank] = useState<BankAccount | null>(null);

  // Mock bank accounts (would come from API)
  const [bankAccounts] = useState<BankAccount[]>([
    {
      id: '1',
      bankName: 'Access Bank',
      accountNumber: '1234567890',
      accountName: 'John Doe',
      isVerified: true,
      isPrimary: true,
    },
    {
      id: '2',
      bankName: 'GTBank',
      accountNumber: '0987654321',
      accountName: 'John Doe',
      isVerified: true,
      isPrimary: false,
    },
    {
      id: '3',
      bankName: 'First Bank',
      accountNumber: '1122334455',
      accountName: 'John Doe',
      isVerified: false,
      isPrimary: false,
    },
  ]);

  const handleBankSelect = (bank: BankAccount) => {
    if (!bank.isVerified) {
      Alert.alert(
        'Unverified Account',
        'This bank account is not verified. Please verify it first or select a verified account.',
        [{ text: 'OK' }]
      );
      return;
    }
    setSelectedBank(bank);
  };

  const handleContinue = () => {
    if (!selectedBank) {
      Alert.alert('Select Bank Account', 'Please select a bank account to continue.');
      return;
    }

    navigation.navigate('WithdrawPIN', {
      amount,
      bankAccount: selectedBank,
    });
  };

  const handleAddBank = () => {
    Alert.alert(
      'Add Bank Account',
      'You can add a new bank account in Settings > Bank Accounts.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Go to Settings', onPress: () => navigation.navigate('Settings', { screen: 'BankAccounts' }) },
      ]
    );
  };

  const renderBankAccount = (bank: BankAccount) => (
    <TouchableOpacity
      key={bank.id}
      style={[
        styles.bankCard,
        selectedBank?.id === bank.id && styles.selectedBankCard,
        !bank.isVerified && styles.unverifiedBankCard,
      ]}
      onPress={() => handleBankSelect(bank)}
    >
      <View style={styles.bankHeader}>
        <View style={styles.bankInfo}>
          <Text style={styles.bankName}>{bank.bankName}</Text>
          <Text style={styles.accountNumber}>****{bank.accountNumber.slice(-4)}</Text>
          <Text style={styles.accountName}>{bank.accountName}</Text>
        </View>
        
        <View style={styles.bankStatus}>
          {bank.isPrimary && (
            <View style={styles.primaryBadge}>
              <Text style={styles.primaryText}>Primary</Text>
            </View>
          )}
          {bank.isVerified ? (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          ) : (
            <View style={styles.unverifiedBadge}>
              <Ionicons name="warning" size={20} color={colors.warning} />
              <Text style={styles.unverifiedText}>Unverified</Text>
            </View>
          )}
        </View>
      </View>
      
      {selectedBank?.id === bank.id && (
        <View style={styles.selectedIndicator}>
          <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
        </View>
      )}
    </TouchableOpacity>
  );

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
          <Text style={styles.headerTitle}>Select Bank Account</Text>
          <View style={styles.placeholder} />
        </View>
        
        <View style={styles.amountContainer}>
          <Text style={styles.amountLabel}>Withdrawal Amount</Text>
          <Text style={styles.amountValue}>{formatCurrency(amount)}</Text>
        </View>
      </LinearGradient>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose Bank Account</Text>
          <Text style={styles.sectionSubtitle}>
            Select the bank account where you want to receive the money
          </Text>
        </View>

        {/* Bank Accounts List */}
        <View style={styles.bankList}>
          {bankAccounts.map(renderBankAccount)}
        </View>

        {/* Add Bank Account */}
        <TouchableOpacity style={styles.addBankButton} onPress={handleAddBank}>
          <View style={styles.addBankContent}>
            <Ionicons name="add-circle" size={24} color={colors.primary} />
            <Text style={styles.addBankText}>Add New Bank Account</Text>
          </View>
        </TouchableOpacity>

        {/* Withdrawal Info */}
        <View style={styles.infoCard}>
          <View style={styles.infoItem}>
            <Ionicons name="time" size={20} color={colors.info} />
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
            !selectedBank && styles.disabledButton
          ]}
          onPress={handleContinue}
          disabled={!selectedBank}
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
  amountContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  amountLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginBottom: 8,
  },
  amountValue: {
    color: 'white',
    fontSize: 24,
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
  bankList: {
    marginBottom: 16,
  },
  bankCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    ...shadows.small,
  },
  selectedBankCard: {
    borderColor: colors.primary,
  },
  unverifiedBankCard: {
    opacity: 0.6,
  },
  bankHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  bankInfo: {
    flex: 1,
  },
  bankName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  accountNumber: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  accountName: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  bankStatus: {
    alignItems: 'flex-end',
  },
  primaryBadge: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  primaryText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.primary,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifiedText: {
    fontSize: 12,
    color: colors.success,
    marginLeft: 4,
  },
  unverifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unverifiedText: {
    fontSize: 12,
    color: colors.warning,
    marginLeft: 4,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  addBankButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    ...shadows.small,
  },
  addBankContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBankText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.primary,
    marginLeft: 8,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
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
  disabledButton: {
    backgroundColor: colors.border,
  },
});

export default SelectBankScreen;
