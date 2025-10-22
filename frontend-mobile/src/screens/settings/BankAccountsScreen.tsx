import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  List,
  Divider,
  ActivityIndicator,
  FAB,
  TextInput,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootState, AppDispatch } from '@store';
import { SettingsStackParamList } from '@navigation/AppNavigator';
import { customTheme } from '@theme';
import Icon from 'react-native-vector-icons/MaterialIcons';
import BankSelectionModal from '@components/BankSelectionModal';

type BankAccountsScreenNavigationProp = StackNavigationProp<SettingsStackParamList, 'BankAccounts'>;

const BankAccountsScreen: React.FC = () => {
  const navigation = useNavigation<BankAccountsScreenNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [formData, setFormData] = useState({
    accountNumber: '',
    bankCode: '',
    accountName: '',
    accountType: 'savings',
  });
  
  const [verificationData, setVerificationData] = useState<{
    accountName: string;
    bankName: string;
    accountNumber: string;
    bankCode: string;
  } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);

  const banks = [
    { code: '044', name: 'Access Bank' },
    { code: '014', name: 'Afribank Nigeria Plc' },
    { code: '023', name: 'Citibank Nigeria Limited' },
    { code: '050', name: 'Ecobank Nigeria Plc' },
    { code: '011', name: 'First Bank of Nigeria' },
    { code: '214', name: 'First City Monument Bank' },
    { code: '070', name: 'Fidelity Bank Nigeria' },
    { code: '058', name: 'Guaranty Trust Bank' },
    { code: '030', name: 'Heritage Bank' },
    { code: '301', name: 'Jaiz Bank' },
    { code: '082', name: 'Keystone Bank' },
    { code: '221', name: 'Stanbic IBTC Bank' },
    { code: '068', name: 'Standard Chartered Bank' },
    { code: '232', name: 'Sterling Bank' },
    { code: '032', name: 'Union Bank of Nigeria' },
    { code: '033', name: 'United Bank for Africa' },
    { code: '215', name: 'Unity Bank' },
    { code: '035', name: 'Wema Bank' },
    { code: '057', name: 'Zenith Bank' },
  ];

  useEffect(() => {
    loadBankAccounts();
  }, []);

  const loadBankAccounts = async () => {
    try {
      setIsLoading(true);
      // TODO: Implement actual API call to load bank accounts
      setTimeout(() => {
        setIsLoading(false);
        // Mock data loading
      }, 1000);
    } catch (error) {
      console.error('Error loading bank accounts:', error);
      setIsLoading(false);
    }
  };

  const handleAddAccount = () => {
    setShowAddForm(true);
    setShowConfirmation(false);
    setVerificationData(null);
    setFormData({
      accountNumber: '',
      bankCode: '',
      accountName: '',
      accountType: 'savings',
    });
  };

  const handleVerifyAccount = async () => {
    if (!formData.accountNumber || !formData.bankCode) {
      Alert.alert('Error', 'Please enter account number and select bank');
      return;
    }

    if (formData.accountNumber.length !== 10) {
      Alert.alert('Error', 'Account number must be 10 digits');
      return;
    }

    try {
      setIsVerifying(true);
      
      // Call API to verify account
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/v1/bank-accounts/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountNumber: formData.accountNumber,
          bankCode: formData.bankCode,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setVerificationData({
          accountName: result.data.accountName,
          bankName: result.data.bankName,
          accountNumber: formData.accountNumber,
          bankCode: formData.bankCode,
        });
        setShowConfirmation(true);
      } else {
        Alert.alert('Verification Failed', result.error || 'Unable to verify account details');
      }
    } catch (error) {
      console.error('Account verification error:', error);
      Alert.alert('Error', 'Failed to verify account. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleConfirmAccount = async () => {
    if (!verificationData) {
      Alert.alert('Error', 'No verification data available');
      return;
    }

    try {
      setIsAddingAccount(true);
      
      // Call API to add verified bank account
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/v1/bank-accounts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${'user_token_here'}`, // This would come from auth state
        },
        body: JSON.stringify({
          accountNumber: verificationData.accountNumber,
          bankCode: verificationData.bankCode,
          accountName: verificationData.accountName,
          accountType: formData.accountType,
          isPrimary: false,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setShowAddForm(false);
        setShowConfirmation(false);
        setVerificationData(null);
        setFormData({
          accountNumber: '',
          bankCode: '',
          accountName: '',
          accountType: 'savings',
        });
        Alert.alert('Success', 'Bank account added successfully');
        loadBankAccounts(); // Reload the list
      } else {
        Alert.alert('Error', result.error || 'Failed to add bank account');
      }
    } catch (error) {
      console.error('Add bank account error:', error);
      Alert.alert('Error', 'Failed to add bank account. Please try again.');
    } finally {
      setIsAddingAccount(false);
    }
  };

  const handleCancelVerification = () => {
    setShowConfirmation(false);
    setVerificationData(null);
  };

  const handleSelectBank = (bank: { code: string; name: string }) => {
    setFormData(prev => ({ ...prev, bankCode: bank.code }));
    setShowBankModal(false);
  };

  const handleRemoveAccount = (accountId: string) => {
    Alert.alert(
      'Remove Bank Account',
      'Are you sure you want to remove this bank account?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setBankAccounts(prev => prev.filter(account => account.id !== accountId));
            Alert.alert('Success', 'Bank account removed successfully');
          },
        },
      ]
    );
  };

  const handleVerifyExistingAccount = (accountId: string) => {
    Alert.alert(
      'Verify Account',
      'Account verification will send a small amount to your account. Please check your bank statement for the verification code.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Verify',
          onPress: () => {
            // TODO: Implement account verification
            Alert.alert('Verification', 'Account verification initiated. Please check your bank statement.');
          },
        },
      ]
    );
  };

  const getBankName = (bankCode: string) => {
    const bank = banks.find(b => b.code === bankCode);
    return bank ? bank.name : 'Unknown Bank';
  };

  const renderBankAccount = (account: any) => (
    <Card key={account.id} style={styles.accountItem}>
      <Card.Content style={styles.accountContent}>
        <View style={styles.accountHeader}>
          <View style={styles.accountInfo}>
            <View style={styles.accountIcon}>
              <Icon name="account-balance" size={24} color={customTheme.colors.primary} />
            </View>
            <View style={styles.accountDetails}>
              <Text variant="bodyLarge" style={styles.accountName}>
                {account.accountName}
              </Text>
              <Text variant="bodySmall" style={styles.accountNumber}>
                {getBankName(account.bankCode)} •••• {account.accountNumber.slice(-4)}
              </Text>
              <Text variant="bodySmall" style={styles.accountType}>
                {account.accountType.toUpperCase()} {account.isPrimary ? '• PRIMARY' : ''}
              </Text>
              <View style={styles.statusContainer}>
                <Icon
                  name={account.isVerified ? 'check-circle' : 'clock'}
                  size={16}
                  color={account.isVerified ? customTheme.colors.primary : customTheme.colors.tertiary}
                />
                <Text
                  variant="bodySmall"
                  style={[
                    styles.statusText,
                    {
                      color: account.isVerified ? customTheme.colors.primary : customTheme.colors.tertiary,
                    },
                  ]}
                >
                  {account.isVerified ? 'Verified' : 'Pending Verification'}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.accountActions}>
            {!account.isVerified && (
              <Button
                mode="text"
                onPress={() => handleVerifyExistingAccount(account.id)}
                style={styles.actionButton}
                textColor={customTheme.colors.primary}
              >
                Verify
              </Button>
            )}
            <Button
              mode="text"
              onPress={() => handleRemoveAccount(account.id)}
              style={styles.actionButton}
              textColor={customTheme.colors.error}
            >
              Remove
            </Button>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const renderEmptyState = () => (
    <Card style={styles.emptyCard}>
      <Card.Content style={styles.emptyContent}>
        <Icon name="account-balance" size={64} color={customTheme.colors.onSurfaceVariant} />
        <Text variant="headlineSmall" style={styles.emptyTitle}>
          No Bank Accounts
        </Text>
        <Text variant="bodyMedium" style={styles.emptyText}>
          Add your bank accounts to enable withdrawals and transfers
        </Text>
        <Button
          mode="contained"
          onPress={handleAddAccount}
          style={styles.emptyButton}
        >
          Add Bank Account
        </Button>
      </Card.Content>
    </Card>
  );

  const renderAddForm = () => (
    <Card style={styles.formCard}>
      <Card.Content>
        <Text variant="titleMedium" style={styles.formTitle}>
          Add Bank Account
        </Text>
        
        <TextInput
          label="Enter Account Number"
          value={formData.accountNumber}
          onChangeText={(value) => setFormData(prev => ({ ...prev, accountNumber: value }))}
          mode="outlined"
          keyboardType="numeric"
          style={styles.input}
          placeholder="1234567890"
          maxLength={10}
        />
        
        <TextInput
          label="Select Bank"
          value={formData.bankCode ? getBankName(formData.bankCode) : ''}
          mode="outlined"
          style={styles.input}
          placeholder="Tap to select bank"
          onPressIn={() => setShowBankModal(true)}
          right={<TextInput.Icon icon="chevron-down" />}
        />
        
        <View style={styles.buttonContainer}>
          <Button
            mode="outlined"
            onPress={() => setShowAddForm(false)}
            style={styles.cancelButton}
            disabled={isVerifying || isAddingAccount}
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleVerifyAccount}
            style={styles.submitButton}
            loading={isVerifying}
            disabled={isVerifying || isAddingAccount || !formData.accountNumber || !formData.bankCode}
          >
            {isVerifying ? 'Verifying...' : 'Verify Account'}
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  const renderConfirmationForm = () => (
    <Card style={styles.formCard}>
      <Card.Content>
        <Text variant="titleMedium" style={styles.formTitle}>
          Confirm Bank Account
        </Text>
        
        <View style={styles.confirmationContainer}>
          <View style={styles.confirmationItem}>
            <Text variant="bodyMedium" style={styles.confirmationLabel}>Account Name:</Text>
            <Text variant="bodyLarge" style={styles.confirmationValue}>
              {verificationData?.accountName}
            </Text>
          </View>
          
          <View style={styles.confirmationItem}>
            <Text variant="bodyMedium" style={styles.confirmationLabel}>Bank:</Text>
            <Text variant="bodyLarge" style={styles.confirmationValue}>
              {verificationData?.bankName}
            </Text>
          </View>
          
          <View style={styles.confirmationItem}>
            <Text variant="bodyMedium" style={styles.confirmationLabel}>Account Number:</Text>
            <Text variant="bodyLarge" style={styles.confirmationValue}>
              ••••{verificationData?.accountNumber.slice(-4)}
            </Text>
          </View>
        </View>
        
        <Text variant="bodySmall" style={styles.confirmationNote}>
          Please confirm that the account details above are correct before proceeding.
        </Text>
        
        <View style={styles.buttonContainer}>
          <Button
            mode="outlined"
            onPress={handleCancelVerification}
            style={styles.cancelButton}
            disabled={isAddingAccount}
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleConfirmAccount}
            style={styles.submitButton}
            loading={isAddingAccount}
            disabled={isAddingAccount}
          >
            {isAddingAccount ? 'Adding...' : 'Confirm & Add Account'}
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text variant="headlineSmall" style={styles.title}>
            Bank Accounts
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Manage your withdrawal accounts
          </Text>
        </View>

        {/* Add Form or Confirmation Form */}
        {showAddForm && !showConfirmation && renderAddForm()}
        {showConfirmation && renderConfirmationForm()}

        {/* Bank Accounts List */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={customTheme.colors.primary} />
            <Text variant="bodyMedium" style={styles.loadingText}>
              Loading bank accounts...
            </Text>
          </View>
        ) : bankAccounts.length > 0 ? (
          <View style={styles.accountsContainer}>
            {bankAccounts.map(renderBankAccount)}
          </View>
        ) : !showAddForm ? (
          renderEmptyState()
        ) : null}

        {/* Information Card */}
        <Card style={styles.infoCard}>
          <Card.Content>
            <View style={styles.infoHeader}>
              <Icon name="info" size={24} color={customTheme.colors.primary} />
              <Text variant="titleSmall" style={styles.infoTitle}>
                About Bank Accounts
              </Text>
            </View>
            <Text variant="bodySmall" style={styles.infoText}>
              • Add multiple bank accounts for withdrawals{'\n'}
              • Accounts must be verified before use{'\n'}
              • Verification involves sending a small amount{'\n'}
              • All transactions are secure and encrypted
            </Text>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Floating Action Button */}
      {!showAddForm && (
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={handleAddAccount}
          label="Add Account"
        />
      )}

      {/* Bank Selection Modal */}
      <BankSelectionModal
        visible={showBankModal}
        onDismiss={() => setShowBankModal(false)}
        onSelectBank={handleSelectBank}
        selectedBankCode={formData.bankCode}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: customTheme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: customTheme.spacing.lg,
    paddingTop: customTheme.spacing.xl,
  },
  title: {
    color: customTheme.colors.onSurface,
    fontWeight: 'bold',
    marginBottom: customTheme.spacing.xs,
  },
  subtitle: {
    color: customTheme.colors.onSurfaceVariant,
  },
  formCard: {
    margin: customTheme.spacing.lg,
    marginTop: 0,
    elevation: 2,
    borderRadius: customTheme.borderRadius.lg,
  },
  formTitle: {
    color: customTheme.colors.onSurface,
    fontWeight: 'bold',
    marginBottom: customTheme.spacing.lg,
    textAlign: 'center',
  },
  input: {
    marginBottom: customTheme.spacing.md,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: customTheme.spacing.md,
  },
  cancelButton: {
    flex: 0.48,
    borderRadius: customTheme.borderRadius.lg,
  },
  submitButton: {
    flex: 0.48,
    borderRadius: customTheme.borderRadius.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: customTheme.spacing.xxl,
  },
  loadingText: {
    color: customTheme.colors.onSurfaceVariant,
    marginTop: customTheme.spacing.md,
  },
  accountsContainer: {
    paddingHorizontal: customTheme.spacing.lg,
    marginBottom: customTheme.spacing.lg,
  },
  accountItem: {
    marginBottom: customTheme.spacing.md,
    elevation: 2,
    borderRadius: customTheme.borderRadius.lg,
  },
  accountContent: {
    paddingVertical: customTheme.spacing.md,
  },
  accountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accountInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: customTheme.colors.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: customTheme.spacing.md,
  },
  accountDetails: {
    flex: 1,
  },
  accountName: {
    color: customTheme.colors.onSurface,
    fontWeight: 'bold',
    marginBottom: customTheme.spacing.xs,
  },
  accountNumber: {
    color: customTheme.colors.onSurfaceVariant,
    marginBottom: customTheme.spacing.xs,
  },
  accountType: {
    color: customTheme.colors.onSurfaceVariant,
    marginBottom: customTheme.spacing.xs,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    marginLeft: customTheme.spacing.xs,
    fontWeight: '500',
  },
  accountActions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: customTheme.spacing.sm,
  },
  emptyCard: {
    margin: customTheme.spacing.lg,
    elevation: 1,
    borderRadius: customTheme.borderRadius.lg,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: customTheme.spacing.xxl,
  },
  emptyTitle: {
    color: customTheme.colors.onSurface,
    fontWeight: 'bold',
    marginTop: customTheme.spacing.lg,
    marginBottom: customTheme.spacing.sm,
  },
  emptyText: {
    color: customTheme.colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: customTheme.spacing.lg,
    lineHeight: 20,
  },
  emptyButton: {
    borderRadius: customTheme.borderRadius.lg,
  },
  infoCard: {
    marginHorizontal: customTheme.spacing.lg,
    marginBottom: customTheme.spacing.lg,
    elevation: 1,
    borderRadius: customTheme.borderRadius.lg,
    backgroundColor: customTheme.colors.primaryContainer,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: customTheme.spacing.sm,
  },
  infoTitle: {
    color: customTheme.colors.onPrimaryContainer,
    fontWeight: 'bold',
    marginLeft: customTheme.spacing.sm,
  },
  infoText: {
    color: customTheme.colors.onPrimaryContainer,
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    margin: customTheme.spacing.lg,
    right: 0,
    bottom: 0,
    backgroundColor: customTheme.colors.primary,
  },
  confirmationContainer: {
    backgroundColor: customTheme.colors.surfaceVariant,
    borderRadius: customTheme.borderRadius.md,
    padding: customTheme.spacing.md,
    marginBottom: customTheme.spacing.md,
  },
  confirmationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: customTheme.spacing.sm,
  },
  confirmationLabel: {
    color: customTheme.colors.onSurfaceVariant,
    fontWeight: '500',
  },
  confirmationValue: {
    color: customTheme.colors.onSurface,
    fontWeight: 'bold',
  },
  confirmationNote: {
    color: customTheme.colors.onSurfaceVariant,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: customTheme.spacing.md,
  },
});

export default BankAccountsScreen;
