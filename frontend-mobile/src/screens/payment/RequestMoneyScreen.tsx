import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  ActivityIndicator,
  Snackbar,
  Chip,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootState, AppDispatch } from '@store';
import { PaymentStackParamList } from '@navigation/AppNavigator';
import { customTheme } from '@theme';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { APP_CONFIG } from '@config/app.config';

type RequestMoneyScreenNavigationProp = StackNavigationProp<PaymentStackParamList, 'RequestMoney'>;

const RequestMoneyScreen: React.FC = () => {
  const navigation = useNavigation<RequestMoneyScreenNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  
  const { user } = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState({
    sender: '',
    amount: '',
    currency: 'NGN',
    description: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const currencies = [
    { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
  ];

  const recentContacts = [
    { id: '1', name: 'Chinedu Okonkwo', email: 'chinedu@example.com', username: 'chinedu29' },
    { id: '2', name: 'Emeka Okonkwo', email: 'emeka@example.com', username: 'emeka_dev' },
    { id: '3', name: 'Sarah Johnson', email: 'sarah@example.com', username: 'sarah_j' },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.sender || !formData.amount) {
      Alert.alert('Error', 'Please fill in all required fields');
      return false;
    }

    if (!APP_CONFIG.validation.email.pattern.test(formData.sender) && !formData.sender.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address or username');
      return false;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return false;
    }

    if (amount < APP_CONFIG.settings.minTransactionAmount) {
      Alert.alert('Error', `Minimum request amount is ${APP_CONFIG.settings.minTransactionAmount}`);
      return false;
    }

    if (amount > APP_CONFIG.settings.maxTransactionAmount) {
      Alert.alert('Error', `Maximum request amount is ${APP_CONFIG.settings.maxTransactionAmount}`);
      return false;
    }

    return true;
  };

  const handleRequestMoney = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      
      // TODO: Implement actual money request API call
      // For now, simulate request processing
      setTimeout(() => {
        setIsLoading(false);
        setSnackbarMessage('Money request sent successfully!');
        setSnackbarVisible(true);
        
        // Clear form after successful request
        setFormData({
          sender: '',
          amount: '',
          currency: 'NGN',
          description: '',
        });
      }, 1000);
    } catch (err) {
      setIsLoading(false);
      setSnackbarMessage('Failed to send money request. Please try again.');
      setSnackbarVisible(true);
    }
  };

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

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Icon name="call-received" size={48} color={customTheme.colors.primary} />
          <Text variant="headlineSmall" style={styles.headerTitle}>
            Request Money
          </Text>
          <Text variant="bodyMedium" style={styles.headerSubtitle}>
            Send a money request to someone
          </Text>
        </View>

        {/* Request Form */}
        <Card style={styles.formCard}>
          <Card.Content style={styles.formContent}>
            <Text variant="titleMedium" style={styles.formTitle}>
              Request Details
            </Text>

            {/* Sender Input */}
            <TextInput
              label="From (Email or Username)"
              value={formData.sender}
              onChangeText={(value) => handleInputChange('sender', value)}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              right={
                <TextInput.Icon
                  icon="account-search"
                  onPress={() => {
                    // TODO: Open contact picker
                  }}
                />
              }
            />

            {/* Amount Input */}
            <View style={styles.amountContainer}>
              <TextInput
                label="Amount"
                value={formData.amount}
                onChangeText={(value) => handleInputChange('amount', value)}
                mode="outlined"
                keyboardType="numeric"
                style={styles.amountInput}
                left={<TextInput.Affix text={getCurrencySymbol(formData.currency)} />}
              />
              
              {/* Currency Selector */}
              <View style={styles.currencyContainer}>
                {currencies.map((currency) => (
                  <Chip
                    key={currency.code}
                    selected={formData.currency === currency.code}
                    onPress={() => handleInputChange('currency', currency.code)}
                    style={styles.currencyChip}
                  >
                    {currency.code}
                  </Chip>
                ))}
              </View>
            </View>

            {/* Description Input */}
            <TextInput
              label="Message (Optional)"
              value={formData.description}
              onChangeText={(value) => handleInputChange('description', value)}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.input}
              placeholder="Add a message for your request"
            />

            {/* Request Summary */}
            {formData.amount && parseFloat(formData.amount) > 0 && (
              <Card style={styles.summaryCard}>
                <Card.Content>
                  <Text variant="titleSmall" style={styles.summaryTitle}>
                    Request Summary
                  </Text>
                  <View style={styles.summaryRow}>
                    <Text variant="bodyMedium">Requesting:</Text>
                    <Text variant="bodyLarge" style={styles.summaryAmount}>
                      {formatCurrency(parseFloat(formData.amount), formData.currency)}
                    </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text variant="bodyMedium">From:</Text>
                    <Text variant="bodyMedium" style={styles.summarySender}>
                      {formData.sender}
                    </Text>
                  </View>
                  {formData.description && (
                    <View style={styles.summaryRow}>
                      <Text variant="bodyMedium">Message:</Text>
                      <Text variant="bodySmall" style={styles.summaryMessage}>
                        {formData.description}
                      </Text>
                    </View>
                  )}
                </Card.Content>
              </Card>
            )}

            {/* Request Button */}
            <Button
              mode="contained"
              onPress={handleRequestMoney}
              style={styles.requestButton}
              loading={isLoading}
              disabled={isLoading || !formData.sender || !formData.amount}
              contentStyle={styles.buttonContent}
              icon="send"
            >
              {isLoading ? 'Sending Request...' : 'Send Request'}
            </Button>
          </Card.Content>
        </Card>

        {/* Recent Contacts */}
        <Card style={styles.contactsCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Recent Contacts
            </Text>
            {recentContacts.map((contact) => (
              <Button
                key={contact.id}
                mode="outlined"
                onPress={() => handleInputChange('sender', contact.email)}
                style={styles.contactButton}
                contentStyle={styles.contactButtonContent}
                icon="account"
              >
                {contact.name}
              </Button>
            ))}
          </Card.Content>
        </Card>

        {/* Info Card */}
        <Card style={styles.infoCard}>
          <Card.Content>
            <View style={styles.infoHeader}>
              <Icon name="info" size={24} color={customTheme.colors.primary} />
              <Text variant="titleSmall" style={styles.infoTitle}>
                How it works
              </Text>
            </View>
            <Text variant="bodySmall" style={styles.infoText}>
              • Send a money request to someone via email or username{'\n'}
              • They'll receive a notification about your request{'\n'}
              • Once they approve, the money will be transferred to your account{'\n'}
              • You'll be notified when the payment is completed
            </Text>
          </Card.Content>
        </Card>
      </ScrollView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={4000}
        style={styles.snackbar}
      >
        {snackbarMessage}
      </Snackbar>
    </KeyboardAvoidingView>
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
  formCard: {
    margin: customTheme.spacing.lg,
    marginTop: 0,
    elevation: 2,
    borderRadius: customTheme.borderRadius.lg,
  },
  formContent: {
    paddingVertical: customTheme.spacing.lg,
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
  amountContainer: {
    marginBottom: customTheme.spacing.md,
  },
  amountInput: {
    marginBottom: customTheme.spacing.sm,
  },
  currencyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: customTheme.spacing.sm,
  },
  currencyChip: {
    marginRight: customTheme.spacing.sm,
  },
  summaryCard: {
    marginVertical: customTheme.spacing.md,
    elevation: 1,
    borderRadius: customTheme.borderRadius.md,
    backgroundColor: customTheme.colors.surfaceVariant,
  },
  summaryTitle: {
    color: customTheme.colors.onSurface,
    fontWeight: 'bold',
    marginBottom: customTheme.spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: customTheme.spacing.sm,
  },
  summaryAmount: {
    color: customTheme.colors.primary,
    fontWeight: 'bold',
  },
  summarySender: {
    color: customTheme.colors.onSurface,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  summaryMessage: {
    color: customTheme.colors.onSurfaceVariant,
    flex: 1,
    textAlign: 'right',
    fontStyle: 'italic',
  },
  requestButton: {
    marginTop: customTheme.spacing.lg,
    borderRadius: customTheme.borderRadius.lg,
  },
  buttonContent: {
    paddingVertical: customTheme.spacing.sm,
  },
  contactsCard: {
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
  contactButton: {
    marginBottom: customTheme.spacing.sm,
    borderRadius: customTheme.borderRadius.lg,
    borderColor: customTheme.colors.outline,
  },
  contactButtonContent: {
    paddingVertical: customTheme.spacing.sm,
  },
  infoCard: {
    margin: customTheme.spacing.lg,
    marginTop: 0,
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
  snackbar: {
    backgroundColor: customTheme.colors.primary,
  },
});

export default RequestMoneyScreen;
