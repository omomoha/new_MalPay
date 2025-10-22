import React, { useState } from 'react';
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
  ActivityIndicator,
  TextInput,
  Divider,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootState, AppDispatch } from '@store';
import { PaymentStackParamList } from '@navigation/AppNavigator';
import { customTheme } from '@theme';
import Icon from 'react-native-vector-icons/MaterialIcons';

type PaymentConfirmScreenNavigationProp = StackNavigationProp<PaymentStackParamList, 'PaymentConfirm'>;
type PaymentConfirmScreenRouteProp = RouteProp<PaymentStackParamList, 'PaymentConfirm'>;

const PaymentConfirmScreen: React.FC = () => {
  const navigation = useNavigation<PaymentConfirmScreenNavigationProp>();
  const route = useRoute<PaymentConfirmScreenRouteProp>();
  const { recipient, amount, currency, description } = route.params;
  
  const dispatch = useDispatch<AppDispatch>();
  const { balance } = useSelector((state: RootState) => state.wallet);

  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPin, setShowPin] = useState(false);

  const formatCurrency = (amount: number, currency: string = 'NGN') => {
    const symbols: { [key: string]: string } = {
      NGN: '₦',
      USD: '$',
      EUR: '€',
      GBP: '£',
    };
    return `${symbols[currency] || '₦'}${amount.toLocaleString()}`;
  };

  const getCurrencySymbol = (currency: string) => {
    const symbols: { [key: string]: string } = {
      NGN: '₦',
      USD: '$',
      EUR: '€',
      GBP: '£',
    };
    return symbols[currency] || '₦';
  };

  const validatePin = () => {
    if (!pin) {
      Alert.alert('Error', 'Please enter your PIN');
      return false;
    }

    if (!APP_CONFIG.validation.pin.pattern.test(pin)) {
      Alert.alert('Error', APP_CONFIG.validation.pin.message);
      return false;
    }

    return true;
  };

  const handleConfirmPayment = async () => {
    if (!validatePin()) return;

    try {
      setIsLoading(true);
      
      // TODO: Implement actual payment confirmation API call
      // For now, simulate payment processing
      setTimeout(() => {
        setIsLoading(false);
        
        // Navigate to success screen
        navigation.navigate('PaymentSuccess', {
          transactionId: 'tx_' + Date.now(),
          amount: amount,
          currency: currency,
          recipient: recipient,
        });
      }, 2000);
    } catch (err) {
      setIsLoading(false);
      Alert.alert('Error', 'Payment failed. Please try again.');
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Payment',
      'Are you sure you want to cancel this payment?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  const getRecipientInfo = () => {
    // In a real app, this would fetch recipient details from the API
    return {
      name: 'Amina Hassan',
      email: recipient,
      username: 'amina34',
    };
  };

  const recipientInfo = getRecipientInfo();
  const fee = 25; // Fixed fee for now
  const total = amount + fee;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Icon name="security" size={48} color={customTheme.colors.primary} />
          <Text variant="headlineSmall" style={styles.headerTitle}>
            Confirm Payment
          </Text>
          <Text variant="bodyMedium" style={styles.headerSubtitle}>
            Review your payment details before confirming
          </Text>
        </View>

        {/* Payment Details */}
        <Card style={styles.detailsCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Payment Details
            </Text>
            
            {/* Recipient Info */}
            <View style={styles.recipientSection}>
              <View style={styles.recipientHeader}>
                <Icon name="person" size={24} color={customTheme.colors.primary} />
                <Text variant="titleSmall" style={styles.recipientLabel}>
                  Recipient
                </Text>
              </View>
              <View style={styles.recipientInfo}>
                <Text variant="bodyLarge" style={styles.recipientName}>
                  {recipientInfo.name}
                </Text>
                <Text variant="bodyMedium" style={styles.recipientEmail}>
                  {recipientInfo.email}
                </Text>
                <Text variant="bodySmall" style={styles.recipientUsername}>
                  @{recipientInfo.username}
                </Text>
              </View>
            </View>

            <Divider style={styles.divider} />

            {/* Amount Details */}
            <View style={styles.amountSection}>
              <View style={styles.amountRow}>
                <Text variant="bodyLarge">Amount:</Text>
                <Text variant="headlineSmall" style={styles.amountValue}>
                  {formatCurrency(amount, currency)}
                </Text>
              </View>
              
              <View style={styles.amountRow}>
                <Text variant="bodyMedium">Fee:</Text>
                <Text variant="bodyLarge" style={styles.feeValue}>
                  {formatCurrency(fee, currency)}
                </Text>
              </View>
              
              <Divider style={styles.amountDivider} />
              
              <View style={styles.amountRow}>
                <Text variant="titleMedium" style={styles.totalLabel}>Total:</Text>
                <Text variant="headlineMedium" style={styles.totalValue}>
                  {formatCurrency(total, currency)}
                </Text>
              </View>
            </View>

            {description && (
              <>
                <Divider style={styles.divider} />
                <View style={styles.descriptionSection}>
                  <Text variant="bodyMedium" style={styles.descriptionLabel}>
                    Description:
                  </Text>
                  <Text variant="bodyMedium" style={styles.descriptionText}>
                    {description}
                  </Text>
                </View>
              </>
            )}
          </Card.Content>
        </Card>

        {/* Balance Check */}
        <Card style={styles.balanceCard}>
          <Card.Content>
            <View style={styles.balanceRow}>
              <Text variant="bodyLarge">Available Balance:</Text>
              <Text variant="bodyLarge" style={styles.balanceValue}>
                {balance ? formatCurrency(balance.fiat, balance.currency) : '₦0.00'}
              </Text>
            </View>
            <View style={styles.balanceRow}>
              <Text variant="bodyMedium">After Payment:</Text>
              <Text variant="bodyMedium" style={styles.remainingValue}>
                {balance ? formatCurrency(balance.fiat - total, balance.currency) : '₦0.00'}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* PIN Input */}
        <Card style={styles.pinCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Security Verification
            </Text>
            <Text variant="bodyMedium" style={styles.pinLabel}>
              Enter your 4-digit PIN to confirm this payment
            </Text>
            
            <TextInput
              label="PIN"
              value={pin}
              onChangeText={setPin}
              mode="outlined"
              keyboardType="numeric"
              secureTextEntry={!showPin}
              maxLength={4}
              style={styles.pinInput}
              right={
                <TextInput.Icon
                  icon={showPin ? 'eye-off' : 'eye'}
                  onPress={() => setShowPin(!showPin)}
                />
              }
            />
          </Card.Content>
        </Card>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleConfirmPayment}
            style={styles.confirmButton}
            loading={isLoading}
            disabled={isLoading || !pin}
            contentStyle={styles.buttonContent}
            icon="check"
          >
            {isLoading ? 'Processing...' : 'Confirm Payment'}
          </Button>
          
          <Button
            mode="outlined"
            onPress={handleCancel}
            style={styles.cancelButton}
            disabled={isLoading}
            contentStyle={styles.buttonContent}
            icon="close"
          >
            Cancel
          </Button>
        </View>

        {/* Security Notice */}
        <Card style={styles.securityCard}>
          <Card.Content>
            <View style={styles.securityHeader}>
              <Icon name="security" size={20} color={customTheme.colors.primary} />
              <Text variant="bodyMedium" style={styles.securityTitle}>
                Security Notice
              </Text>
            </View>
            <Text variant="bodySmall" style={styles.securityText}>
              This payment is secured with bank-level encryption. Your PIN is required to authorize this transaction.
            </Text>
          </Card.Content>
        </Card>
      </ScrollView>
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
    alignItems: 'center',
    padding: customTheme.spacing.lg,
    paddingTop: customTheme.spacing.xl,
  },
  headerTitle: {
    color: customTheme.colors.primary,
    fontWeight: 'bold',
    marginTop: customTheme.spacing.md,
    marginBottom: customTheme.spacing.sm,
  },
  headerSubtitle: {
    color: customTheme.colors.onSurfaceVariant,
    textAlign: 'center',
  },
  detailsCard: {
    margin: customTheme.spacing.lg,
    marginTop: 0,
    elevation: 2,
    borderRadius: customTheme.borderRadius.lg,
  },
  sectionTitle: {
    color: customTheme.colors.onSurface,
    fontWeight: 'bold',
    marginBottom: customTheme.spacing.md,
  },
  recipientSection: {
    marginBottom: customTheme.spacing.md,
  },
  recipientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: customTheme.spacing.sm,
  },
  recipientLabel: {
    color: customTheme.colors.onSurface,
    fontWeight: '500',
    marginLeft: customTheme.spacing.sm,
  },
  recipientInfo: {
    marginLeft: customTheme.spacing.xl,
  },
  recipientName: {
    color: customTheme.colors.onSurface,
    fontWeight: 'bold',
    marginBottom: customTheme.spacing.xs,
  },
  recipientEmail: {
    color: customTheme.colors.onSurfaceVariant,
    marginBottom: customTheme.spacing.xs,
  },
  recipientUsername: {
    color: customTheme.colors.onSurfaceVariant,
  },
  divider: {
    marginVertical: customTheme.spacing.md,
  },
  amountSection: {
    marginBottom: customTheme.spacing.md,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: customTheme.spacing.sm,
  },
  amountValue: {
    color: customTheme.colors.primary,
    fontWeight: 'bold',
  },
  feeValue: {
    color: customTheme.colors.onSurfaceVariant,
  },
  amountDivider: {
    marginVertical: customTheme.spacing.sm,
  },
  totalLabel: {
    color: customTheme.colors.onSurface,
    fontWeight: 'bold',
  },
  totalValue: {
    color: customTheme.colors.primary,
    fontWeight: 'bold',
  },
  descriptionSection: {
    marginTop: customTheme.spacing.md,
  },
  descriptionLabel: {
    color: customTheme.colors.onSurfaceVariant,
    marginBottom: customTheme.spacing.xs,
  },
  descriptionText: {
    color: customTheme.colors.onSurface,
    fontStyle: 'italic',
  },
  balanceCard: {
    marginHorizontal: customTheme.spacing.lg,
    marginBottom: customTheme.spacing.md,
    elevation: 1,
    borderRadius: customTheme.borderRadius.lg,
    backgroundColor: customTheme.colors.surfaceVariant,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: customTheme.spacing.sm,
  },
  balanceValue: {
    color: customTheme.colors.onSurface,
    fontWeight: '500',
  },
  remainingValue: {
    color: customTheme.colors.onSurfaceVariant,
  },
  pinCard: {
    marginHorizontal: customTheme.spacing.lg,
    marginBottom: customTheme.spacing.md,
    elevation: 2,
    borderRadius: customTheme.borderRadius.lg,
  },
  pinLabel: {
    color: customTheme.colors.onSurfaceVariant,
    marginBottom: customTheme.spacing.md,
  },
  pinInput: {
    marginBottom: customTheme.spacing.sm,
  },
  buttonContainer: {
    paddingHorizontal: customTheme.spacing.lg,
    marginBottom: customTheme.spacing.lg,
  },
  confirmButton: {
    marginBottom: customTheme.spacing.md,
    borderRadius: customTheme.borderRadius.lg,
  },
  cancelButton: {
    borderRadius: customTheme.borderRadius.lg,
    borderColor: customTheme.colors.outline,
  },
  buttonContent: {
    paddingVertical: customTheme.spacing.sm,
  },
  securityCard: {
    margin: customTheme.spacing.lg,
    marginTop: 0,
    elevation: 1,
    borderRadius: customTheme.borderRadius.lg,
    backgroundColor: customTheme.colors.primaryContainer,
  },
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: customTheme.spacing.sm,
  },
  securityTitle: {
    color: customTheme.colors.onPrimaryContainer,
    fontWeight: 'bold',
    marginLeft: customTheme.spacing.sm,
  },
  securityText: {
    color: customTheme.colors.onPrimaryContainer,
    lineHeight: 20,
  },
});

export default PaymentConfirmScreen;
