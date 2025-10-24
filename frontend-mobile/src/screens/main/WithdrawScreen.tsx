import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const WithdrawScreen: React.FC = () => {
  const navigation = useNavigation();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    amount: '',
    bankAccount: '',
    withdrawalMethod: 'bank',
    description: '',
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleNext = () => {
    if (step === 1 && formData.amount && formData.bankAccount) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigation.goBack();
    }
  };

  const handleWithdraw = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Success',
        `Successfully withdrew $${formData.amount} to your bank account`,
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Dashboard' as never),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to withdraw funds. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const bankAccounts = [
    { id: '1', bankName: 'Access Bank', accountNumber: '1234567890', isPrimary: true },
    { id: '2', bankName: 'GTBank', accountNumber: '0987654321', isPrimary: false },
  ];

  const withdrawalMethods = [
    { id: 'bank', name: 'Bank Transfer', icon: 'business-outline', fee: 0, time: '1-3 business days' },
    { id: 'card', name: 'Card Withdrawal', icon: 'card-outline', fee: 2.50, time: 'Instant' },
    { id: 'crypto', name: 'Crypto Transfer', icon: 'trending-up-outline', fee: 1.00, time: '5-10 minutes' },
  ];

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>How much do you want to withdraw?</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.currencySymbol}>$</Text>
        <TextInput
          style={[styles.input, styles.amountInput]}
          placeholder="0.00"
          value={formData.amount}
          onChangeText={(value) => handleInputChange('amount', value)}
          keyboardType="numeric"
        />
      </View>

      <Text style={styles.sectionTitle}>Select Bank Account</Text>
      
      {bankAccounts.map((account) => (
        <TouchableOpacity
          key={account.id}
          style={[
            styles.bankAccountItem,
            formData.bankAccount === account.id && styles.bankAccountSelected,
          ]}
          onPress={() => setFormData({ ...formData, bankAccount: account.id })}
        >
          <View style={styles.bankAccountInfo}>
            <Ionicons name="business-outline" size={24} color="#1976d2" />
            <View style={styles.bankAccountDetails}>
              <Text style={styles.bankAccountName}>{account.bankName}</Text>
              <Text style={styles.bankAccountNumber}>{account.accountNumber}</Text>
            </View>
          </View>
          <View style={styles.bankAccountBadge}>
            {account.isPrimary && (
              <View style={styles.primaryBadge}>
                <Text style={styles.primaryBadgeText}>Primary</Text>
              </View>
            )}
            {formData.bankAccount === account.id && (
              <Ionicons name="checkmark-circle" size={20} color="#4caf50" />
            )}
          </View>
        </TouchableOpacity>
      ))}

      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="What's this withdrawal for? (Optional)"
          value={formData.description}
          onChangeText={(value) => handleInputChange('description', value)}
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.balanceInfo}>
        <Text style={styles.balanceText}>Available balance: $32,149.00</Text>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Choose Withdrawal Method</Text>
      
      {withdrawalMethods.map((method) => (
        <TouchableOpacity
          key={method.id}
          style={[
            styles.withdrawalMethod,
            formData.withdrawalMethod === method.id && styles.withdrawalMethodSelected,
          ]}
          onPress={() => setFormData({ ...formData, withdrawalMethod: method.id })}
        >
          <View style={styles.withdrawalMethodInfo}>
            <Ionicons name={method.icon as any} size={24} color="#1976d2" />
            <View style={styles.withdrawalMethodDetails}>
              <Text style={styles.withdrawalMethodName}>{method.name}</Text>
              <Text style={styles.withdrawalMethodDetails}>
                Fee: ${method.fee} • {method.time}
              </Text>
            </View>
          </View>
          {formData.withdrawalMethod === method.id && (
            <Ionicons name="checkmark-circle" size={20} color="#4caf50" />
          )}
        </TouchableOpacity>
      ))}

      <View style={styles.limitInfo}>
        <Text style={styles.limitText}>Withdrawal limits: $500 per day, $5,000 per month</Text>
      </View>
    </View>
  );

  const renderStep3 = () => {
    const selectedAccount = bankAccounts.find(acc => acc.id === formData.bankAccount);
    const selectedMethod = withdrawalMethods.find(m => m.id === formData.withdrawalMethod);
    
    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>Review Withdrawal</Text>
        
        <View style={styles.reviewItem}>
          <Text style={styles.reviewLabel}>Amount</Text>
          <Text style={styles.reviewAmount}>${formData.amount}</Text>
        </View>

        <View style={styles.reviewItem}>
          <Text style={styles.reviewLabel}>Bank Account</Text>
          <View style={styles.reviewValueContainer}>
            <Text style={styles.reviewValue}>{selectedAccount?.bankName}</Text>
            <Text style={styles.reviewSubValue}>{selectedAccount?.accountNumber}</Text>
          </View>
        </View>

        <View style={styles.reviewItem}>
          <Text style={styles.reviewLabel}>Withdrawal Method</Text>
          <Text style={styles.reviewValue}>{selectedMethod?.name}</Text>
        </View>

        {formData.description && (
          <View style={styles.reviewItem}>
            <Text style={styles.reviewLabel}>Description</Text>
            <Text style={styles.reviewValue}>{formData.description}</Text>
          </View>
        )}

        <View style={styles.divider} />

        <View style={styles.reviewItem}>
          <Text style={styles.reviewLabel}>Withdrawal Fee</Text>
          <Text style={styles.reviewValue}>${selectedMethod?.fee}</Text>
        </View>

        <View style={styles.reviewItem}>
          <Text style={styles.reviewLabel}>Processing Time</Text>
          <Text style={styles.reviewValue}>{selectedMethod?.time}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.reviewItem}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalAmount}>
            ${(parseFloat(formData.amount) + (selectedMethod?.fee || 0)).toFixed(2)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1976d2" />
      
      {/* Header */}
      <LinearGradient colors={['#1976d2', '#1565c0']} style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Withdraw Funds</Text>
        <TouchableOpacity style={styles.qrButton}>
          <Ionicons name="qr-code-outline" size={24} color="white" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          {[1, 2, 3].map((stepNumber) => (
            <View
              key={stepNumber}
              style={[
                styles.progressDot,
                step >= stepNumber && styles.progressDotActive,
              ]}
            />
          ))}
        </View>
        <Text style={styles.progressText}>Step {step} of 3</Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={styles.backButtonAction}
          onPress={handleBack}
        >
          <Text style={styles.backButtonText}>
            {step === 1 ? 'Cancel' : 'Back'}
          </Text>
        </TouchableOpacity>
        
        {step < 3 ? (
          <TouchableOpacity
            style={[
              styles.nextButton,
              (!formData.amount || !formData.bankAccount) && styles.nextButtonDisabled,
            ]}
            onPress={handleNext}
            disabled={!formData.amount || !formData.bankAccount}
          >
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.withdrawButton}
            onPress={handleWithdraw}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Ionicons name="business-outline" size={20} color="white" style={styles.withdrawIcon} />
                <Text style={styles.withdrawButtonText}>Withdraw Funds</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  qrButton: {
    padding: 8,
  },
  progressContainer: {
    backgroundColor: 'white',
    paddingVertical: 16,
    alignItems: 'center',
  },
  progressBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 4,
  },
  progressDotActive: {
    backgroundColor: '#1976d2',
  },
  progressText: {
    fontSize: 12,
    color: '#666',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  stepContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    backgroundColor: 'white',
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 12,
  },
  amountInput: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
    marginTop: 8,
  },
  bankAccountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: 'white',
  },
  bankAccountSelected: {
    borderColor: '#1976d2',
    backgroundColor: '#f3f9ff',
  },
  bankAccountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bankAccountDetails: {
    marginLeft: 12,
    flex: 1,
  },
  bankAccountName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  bankAccountNumber: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  bankAccountBadge: {
    alignItems: 'flex-end',
  },
  primaryBadge: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  primaryBadgeText: {
    fontSize: 12,
    color: '#1976d2',
    fontWeight: '500',
  },
  balanceInfo: {
    backgroundColor: '#e8f5e9',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  balanceText: {
    fontSize: 14,
    color: '#2e7d32',
    textAlign: 'center',
  },
  withdrawalMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: 'white',
  },
  withdrawalMethodSelected: {
    borderColor: '#1976d2',
    backgroundColor: '#f3f9ff',
  },
  withdrawalMethodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  withdrawalMethodDetails: {
    marginLeft: 12,
    flex: 1,
  },
  withdrawalMethodName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  limitInfo: {
    backgroundColor: '#fff3e0',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  limitText: {
    fontSize: 14,
    color: '#f57c00',
    textAlign: 'center',
  },
  reviewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  reviewLabel: {
    fontSize: 14,
    color: '#666',
  },
  reviewValueContainer: {
    alignItems: 'flex-end',
  },
  reviewValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  reviewSubValue: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  reviewAmount: {
    fontSize: 20,
    color: '#1976d2',
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  actionContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  backButtonAction: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#666',
  },
  nextButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#1976d2',
    borderRadius: 8,
  },
  nextButtonDisabled: {
    backgroundColor: '#e0e0e0',
  },
  nextButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
  withdrawButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1976d2',
    borderRadius: 8,
  },
  withdrawIcon: {
    marginRight: 8,
  },
  withdrawButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
});

export default WithdrawScreen;
