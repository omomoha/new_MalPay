import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  ActivityIndicator,
  List,
  Divider,
  Surface,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RootState, AppDispatch } from '@store';
import { MainTabParamList } from '@navigation/AppNavigator';
import { customTheme } from '@theme';
import Icon from 'react-native-vector-icons/MaterialIcons';

type WalletScreenNavigationProp = BottomTabNavigationProp<MainTabParamList, 'Wallet'>;

const WalletScreen: React.FC = () => {
  const navigation = useNavigation<WalletScreenNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  
  const { wallets, activeWallet, balance, isLoading } = useSelector((state: RootState) => state.wallet);
  const { linkedCards } = useSelector((state: RootState) => state.cards);

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      // TODO: Implement actual API calls
      // For now, simulate loading
      setTimeout(() => {
        // Mock data loading
      }, 1000);
    } catch (error) {
      console.error('Error loading wallet data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWalletData();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number, currency: string = 'NGN') => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const handleAddCard = () => {
    navigation.navigate('Settings', { screen: 'LinkedCards' });
  };

  const handleAddBankAccount = () => {
    navigation.navigate('Settings', { screen: 'BankAccounts' });
  };

  const handleWithdraw = () => {
    // TODO: Implement withdrawal flow
    Alert.alert('Withdrawal', 'Withdrawal feature coming soon!');
  };

  const handleDeposit = () => {
    // TODO: Implement deposit flow
    Alert.alert('Deposit', 'Deposit feature coming soon!');
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text variant="headlineSmall" style={styles.title}>
            Wallet
          </Text>
        </View>

        {/* Balance Overview */}
        <Card style={styles.balanceCard}>
          <Card.Content style={styles.balanceContent}>
            <View style={styles.balanceHeader}>
              <Text variant="bodyMedium" style={styles.balanceLabel}>
                Total Balance
              </Text>
              <Icon name="account-balance-wallet" size={24} color={customTheme.colors.primary} />
            </View>
            {isLoading ? (
              <ActivityIndicator size="large" color={customTheme.colors.primary} />
            ) : (
              <Text variant="headlineLarge" style={styles.balanceAmount}>
                {balance ? formatCurrency(balance.fiat, balance.currency) : '₦0.00'}
              </Text>
            )}
            <Text variant="bodySmall" style={styles.balanceSubtext}>
              Last updated: {new Date().toLocaleTimeString()}
            </Text>
          </Card.Content>
        </Card>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Quick Actions
          </Text>
          <View style={styles.actionButtons}>
            <Button
              mode="contained"
              icon="call-received"
              onPress={handleDeposit}
              style={styles.actionButton}
              contentStyle={styles.actionButtonContent}
            >
              Deposit
            </Button>
            <Button
              mode="outlined"
              icon="call-made"
              onPress={handleWithdraw}
              style={styles.actionButton}
              contentStyle={styles.actionButtonContent}
            >
              Withdraw
            </Button>
          </View>
        </View>

        {/* Linked Cards */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Linked Cards
            </Text>
            <Button
              mode="text"
              onPress={handleAddCard}
              style={styles.addButton}
            >
              Add Card
            </Button>
          </View>
          
          {linkedCards.length > 0 ? (
            linkedCards.map((card, index) => (
              <Card key={card.id} style={styles.cardItem}>
                <Card.Content style={styles.cardContent}>
                  <View style={styles.cardInfo}>
                    <View style={styles.cardIcon}>
                      <Icon
                        name={card.cardType === 'visa' ? 'credit-card' : 'payment'}
                        size={24}
                        color={customTheme.colors.primary}
                      />
                    </View>
                    <View style={styles.cardDetails}>
                      <Text variant="bodyLarge" style={styles.cardName}>
                        {card.bankName} •••• {card.cardLastFour}
                      </Text>
                      <Text variant="bodySmall" style={styles.cardType}>
                        {card.cardType.toUpperCase()} {card.isPrimary ? '• Primary' : ''}
                      </Text>
                    </View>
                  </View>
                  <Button
                    mode="text"
                    icon="chevron-right"
                    onPress={() => {}}
                    style={styles.cardAction}
                  />
                </Card.Content>
              </Card>
            ))
          ) : (
            <Card style={styles.emptyCard}>
              <Card.Content style={styles.emptyContent}>
                <Icon name="credit-card" size={48} color={customTheme.colors.onSurfaceVariant} />
                <Text variant="bodyMedium" style={styles.emptyText}>
                  No cards linked
                </Text>
                <Button
                  mode="outlined"
                  onPress={handleAddCard}
                  style={styles.emptyButton}
                >
                  Link Your First Card
                </Button>
              </Card.Content>
            </Card>
          )}
        </View>

        {/* Bank Accounts */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Bank Accounts
            </Text>
            <Button
              mode="text"
              onPress={handleAddBankAccount}
              style={styles.addButton}
            >
              Add Account
            </Button>
          </View>
          
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Icon name="account-balance" size={48} color={customTheme.colors.onSurfaceVariant} />
              <Text variant="bodyMedium" style={styles.emptyText}>
                No bank accounts added
              </Text>
              <Button
                mode="outlined"
                onPress={handleAddBankAccount}
                style={styles.emptyButton}
              >
                Add Bank Account
              </Button>
            </Card.Content>
          </Card>
        </View>

        {/* Wallet Details */}
        <Card style={styles.detailsCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Wallet Details
            </Text>
            <List.Item
              title="Wallet Address"
              description={activeWallet?.walletAddress || 'Not available'}
              left={(props) => <List.Icon {...props} icon="wallet" />}
              right={(props) => (
                <Button
                  mode="text"
                  icon="content-copy"
                  onPress={() => {
                    // TODO: Copy to clipboard
                    Alert.alert('Copied', 'Wallet address copied to clipboard');
                  }}
                />
              )}
            />
            <Divider />
            <List.Item
              title="Blockchain"
              description={activeWallet?.blockchainType?.toUpperCase() || 'Not available'}
              left={(props) => <List.Icon {...props} icon="link" />}
            />
            <Divider />
            <List.Item
              title="Created"
              description={activeWallet?.createdAt ? new Date(activeWallet.createdAt).toLocaleDateString() : 'Not available'}
              left={(props) => <List.Icon {...props} icon="calendar" />}
            />
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
    padding: customTheme.spacing.lg,
    paddingTop: customTheme.spacing.xl,
  },
  title: {
    color: customTheme.colors.onSurface,
    fontWeight: 'bold',
  },
  balanceCard: {
    margin: customTheme.spacing.lg,
    marginTop: 0,
    elevation: 4,
    borderRadius: customTheme.borderRadius.lg,
    backgroundColor: customTheme.colors.surface,
  },
  balanceContent: {
    paddingVertical: customTheme.spacing.lg,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: customTheme.spacing.sm,
  },
  balanceLabel: {
    color: customTheme.colors.onSurfaceVariant,
  },
  balanceAmount: {
    color: customTheme.colors.onSurface,
    fontWeight: 'bold',
    marginBottom: customTheme.spacing.xs,
  },
  balanceSubtext: {
    color: customTheme.colors.onSurfaceVariant,
  },
  quickActions: {
    paddingHorizontal: customTheme.spacing.lg,
    marginBottom: customTheme.spacing.lg,
  },
  sectionTitle: {
    color: customTheme.colors.onSurface,
    fontWeight: 'bold',
    marginBottom: customTheme.spacing.md,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 0.48,
    borderRadius: customTheme.borderRadius.lg,
  },
  actionButtonContent: {
    paddingVertical: customTheme.spacing.sm,
  },
  section: {
    paddingHorizontal: customTheme.spacing.lg,
    marginBottom: customTheme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: customTheme.spacing.md,
  },
  addButton: {
    marginLeft: -customTheme.spacing.sm,
  },
  cardItem: {
    marginBottom: customTheme.spacing.sm,
    elevation: 1,
    borderRadius: customTheme.borderRadius.md,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: customTheme.spacing.sm,
  },
  cardInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: customTheme.colors.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: customTheme.spacing.md,
  },
  cardDetails: {
    flex: 1,
  },
  cardName: {
    color: customTheme.colors.onSurface,
    fontWeight: '500',
  },
  cardType: {
    color: customTheme.colors.onSurfaceVariant,
  },
  cardAction: {
    marginLeft: customTheme.spacing.sm,
  },
  emptyCard: {
    elevation: 1,
    borderRadius: customTheme.borderRadius.md,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: customTheme.spacing.xl,
  },
  emptyText: {
    color: customTheme.colors.onSurfaceVariant,
    marginTop: customTheme.spacing.md,
    marginBottom: customTheme.spacing.md,
  },
  emptyButton: {
    borderRadius: customTheme.borderRadius.lg,
  },
  detailsCard: {
    margin: customTheme.spacing.lg,
    marginTop: 0,
    elevation: 2,
    borderRadius: customTheme.borderRadius.lg,
  },
});

export default WalletScreen;
