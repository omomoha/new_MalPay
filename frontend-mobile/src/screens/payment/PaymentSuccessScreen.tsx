import React, { useEffect } from 'react';
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
  Divider,
} from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { PaymentStackParamList } from '@navigation/AppNavigator';
import { customTheme } from '@theme';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@store';

type PaymentSuccessScreenNavigationProp = StackNavigationProp<PaymentStackParamList, 'PaymentSuccess'>;
type PaymentSuccessScreenRouteProp = RouteProp<PaymentStackParamList, 'PaymentSuccess'>;

const PaymentSuccessScreen: React.FC = () => {
  const navigation = useNavigation<PaymentSuccessScreenNavigationProp>();
  const route = useRoute<PaymentSuccessScreenRouteProp>();
  const { transactionId, amount, currency, recipient } = route.params;
  
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    // Update transaction list in Redux store
    dispatch({
      type: 'transactions/addTransaction',
      payload: {
        id: transactionId,
        amountFiat: amount,
        currency: currency,
        type: 'transfer',
        status: 'completed',
        receiver: { username: recipient },
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
      },
    });

    // Update wallet balance
    dispatch({
      type: 'wallet/updateBalance',
      payload: {
        fiat: 0, // This would be calculated from current balance - amount - fee
        currency: currency,
      },
    });
  }, [transactionId, amount, currency, recipient, dispatch]);

  const formatCurrency = (amount: number, currency: string = 'NGN') => {
    const symbols: { [key: string]: string } = {
      NGN: '₦',
      USD: '$',
      EUR: '€',
      GBP: '£',
    };
    return `${symbols[currency] || '₦'}${amount.toLocaleString()}`;
  };

  const handleViewTransaction = () => {
    navigation.navigate('Main', { screen: 'Transactions' });
  };

  const handleSendMore = () => {
    navigation.navigate('SendMoney');
  };

  const handleGoHome = () => {
    navigation.navigate('Main', { screen: 'Home' });
  };

  const handleShareReceipt = () => {
    Alert.alert('Share Receipt', 'Receipt sharing feature coming soon!');
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Success Header */}
        <View style={styles.header}>
          <View style={styles.successIcon}>
            <Icon name="check-circle" size={80} color={customTheme.colors.primary} />
          </View>
          <Text variant="headlineMedium" style={styles.successTitle}>
            Payment Successful!
          </Text>
          <Text variant="bodyLarge" style={styles.successSubtitle}>
            Your money has been sent successfully
          </Text>
        </View>

        {/* Transaction Details */}
        <Card style={styles.detailsCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Transaction Details
            </Text>
            
            <View style={styles.detailRow}>
              <Text variant="bodyMedium" style={styles.detailLabel}>
                Transaction ID:
              </Text>
              <Text variant="bodyMedium" style={styles.detailValue}>
                {transactionId}
              </Text>
            </View>
            
            <Divider style={styles.divider} />
            
            <View style={styles.detailRow}>
              <Text variant="bodyMedium" style={styles.detailLabel}>
                Amount Sent:
              </Text>
              <Text variant="headlineSmall" style={styles.amountValue}>
                {formatCurrency(amount, currency)}
              </Text>
            </View>
            
            <Divider style={styles.divider} />
            
            <View style={styles.detailRow}>
              <Text variant="bodyMedium" style={styles.detailLabel}>
                Recipient:
              </Text>
              <Text variant="bodyLarge" style={styles.recipientValue}>
                {recipient}
              </Text>
            </View>
            
            <Divider style={styles.divider} />
            
            <View style={styles.detailRow}>
              <Text variant="bodyMedium" style={styles.detailLabel}>
                Date & Time:
              </Text>
              <Text variant="bodyMedium" style={styles.detailValue}>
                {new Date().toLocaleString()}
              </Text>
            </View>
            
            <Divider style={styles.divider} />
            
            <View style={styles.detailRow}>
              <Text variant="bodyMedium" style={styles.detailLabel}>
                Status:
              </Text>
              <View style={styles.statusContainer}>
                <Icon name="check-circle" size={16} color={customTheme.colors.primary} />
                <Text variant="bodyMedium" style={styles.statusText}>
                  Completed
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Quick Actions */}
        <Card style={styles.actionsCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              What's Next?
            </Text>
            
            <Button
              mode="contained"
              onPress={handleViewTransaction}
              style={styles.actionButton}
              contentStyle={styles.buttonContent}
              icon="history"
            >
              View Transaction History
            </Button>
            
            <Button
              mode="outlined"
              onPress={handleSendMore}
              style={styles.actionButton}
              contentStyle={styles.buttonContent}
              icon="send"
            >
              Send More Money
            </Button>
            
            <Button
              mode="text"
              onPress={handleShareReceipt}
              style={styles.actionButton}
              contentStyle={styles.buttonContent}
              icon="share"
            >
              Share Receipt
            </Button>
          </Card.Content>
        </Card>

        {/* Security Notice */}
        <Card style={styles.securityCard}>
          <Card.Content>
            <View style={styles.securityHeader}>
              <Icon name="security" size={20} color={customTheme.colors.primary} />
              <Text variant="bodyMedium" style={styles.securityTitle}>
                Transaction Secured
              </Text>
            </View>
            <Text variant="bodySmall" style={styles.securityText}>
              This transaction was processed securely using bank-level encryption. 
              You will receive a confirmation email shortly.
            </Text>
          </Card.Content>
        </Card>

        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          <Button
            mode="contained"
            onPress={handleGoHome}
            style={styles.homeButton}
            contentStyle={styles.buttonContent}
            icon="home"
          >
            Go to Home
          </Button>
        </View>
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
    paddingTop: customTheme.spacing.xxl,
  },
  successIcon: {
    marginBottom: customTheme.spacing.lg,
  },
  successTitle: {
    color: customTheme.colors.primary,
    fontWeight: 'bold',
    marginBottom: customTheme.spacing.sm,
    textAlign: 'center',
  },
  successSubtitle: {
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
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: customTheme.spacing.sm,
  },
  detailLabel: {
    color: customTheme.colors.onSurfaceVariant,
    flex: 1,
  },
  detailValue: {
    color: customTheme.colors.onSurface,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  amountValue: {
    color: customTheme.colors.primary,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'right',
  },
  recipientValue: {
    color: customTheme.colors.onSurface,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  divider: {
    marginVertical: customTheme.spacing.sm,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  statusText: {
    color: customTheme.colors.primary,
    fontWeight: '500',
    marginLeft: customTheme.spacing.xs,
  },
  actionsCard: {
    marginHorizontal: customTheme.spacing.lg,
    marginBottom: customTheme.spacing.md,
    elevation: 2,
    borderRadius: customTheme.borderRadius.lg,
  },
  actionButton: {
    marginBottom: customTheme.spacing.md,
    borderRadius: customTheme.borderRadius.lg,
  },
  buttonContent: {
    paddingVertical: customTheme.spacing.sm,
  },
  securityCard: {
    marginHorizontal: customTheme.spacing.lg,
    marginBottom: customTheme.spacing.lg,
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
  bottomActions: {
    paddingHorizontal: customTheme.spacing.lg,
    paddingBottom: customTheme.spacing.xxl,
  },
  homeButton: {
    borderRadius: customTheme.borderRadius.lg,
  },
});

export default PaymentSuccessScreen;
