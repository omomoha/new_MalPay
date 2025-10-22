import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '@theme/colors';
import { formatCurrency } from '@utils/helpers';
import { 
  useGetWalletBalanceQuery,
  useGetWalletTransactionsQuery,
  useGetUserProfileQuery 
} from '@store/api/api';
import { useLoadingState } from '@services/LoadingStateService';
import { handleAPIError } from '@services/ErrorHandlerService';

const HomeScreen = () => {
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const theme = useTheme();

  // API queries
  const { 
    data: walletBalance, 
    error: balanceError, 
    refetch: refetchBalance,
    isLoading: balanceLoading 
  } = useGetWalletBalanceQuery();

  const { 
    data: transactions, 
    error: transactionsError, 
    refetch: refetchTransactions,
    isLoading: transactionsLoading 
  } = useGetWalletTransactionsQuery({
    page: 1,
    limit: 5,
    status: 'completed'
  });

  const { 
    data: userProfile, 
    error: profileError, 
    refetch: refetchProfile,
    isLoading: profileLoading 
  } = useGetUserProfileQuery();

  // Loading state management
  const { loadingState, setLoading, setError } = useLoadingState();

  // Handle errors
  useEffect(() => {
    if (balanceError) {
      handleAPIError(balanceError, { showAlert: false });
    }
    if (transactionsError) {
      handleAPIError(transactionsError, { showAlert: false });
    }
    if (profileError) {
      handleAPIError(profileError, { showAlert: false });
    }
  }, [balanceError, transactionsError, profileError]);

  // Pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchBalance(),
        refetchTransactions(),
        refetchProfile(),
      ]);
    } catch (error) {
      handleAPIError(error);
    } finally {
      setRefreshing(false);
    }
  };

  // Calculate weekly spending (mock calculation for now)
  const weeklySpending = transactions?.reduce((total, transaction) => {
    if (transaction.type === 'transfer' && transaction.status === 'completed') {
      return total + transaction.amount;
    }
    return total;
  }, 0) || 0;

  const actionButtons = [
    { id: 'send', title: 'Send', icon: 'paper-plane-outline' },
    { id: 'withdraw', title: 'Withdraw', icon: 'business-outline' },
    { id: 'invest', title: 'Invest', icon: 'trending-up-outline' },
    { id: 'add', title: 'Add', icon: 'add-outline' },
  ];

  const renderTransactionItem = (transaction: any) => {
    const isPositive = transaction.type === 'deposit' || transaction.type === 'transfer';
    const iconMap: Record<string, { icon: string; color: string }> = {
      'transfer': { icon: 'send', color: colors.primary },
      'deposit': { icon: 'add-circle', color: colors.success },
      'withdrawal': { icon: 'remove-circle', color: colors.warning },
      'fee': { icon: 'card', color: colors.error },
    };
    
    const iconInfo = iconMap[transaction.type] || { icon: 'card', color: colors.textSecondary };
    
    return (
      <View key={transaction.id} style={styles.transactionItem}>
        <View style={styles.transactionLeft}>
          <View style={[styles.transactionIcon, { backgroundColor: iconInfo.color }]}>
            <Ionicons name={iconInfo.icon as any} size={20} color="white" />
          </View>
          <View style={styles.transactionDetails}>
            <Text style={styles.transactionType}>
              {transaction.description || `${transaction.type} payment`}
            </Text>
            <Text style={styles.transactionTime}>
              {new Date(transaction.createdAt).toLocaleDateString('en-NG', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
        </View>
        <Text style={[
          styles.transactionAmount,
          { color: isPositive ? colors.success : colors.error }
        ]}>
          {isPositive ? '+' : '-'}{formatCurrency(transaction.amount)}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      {/* Header */}
      <LinearGradient colors={[colors.primary, colors.primaryLight]} style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.time}>9:41</Text>
          <View style={styles.statusIcons}>
            <Ionicons name="cellular-outline" size={16} color="white" />
            <Ionicons name="wifi-outline" size={16} color="white" style={styles.statusIcon} />
            <Ionicons name="battery-half-outline" size={16} color="white" />
          </View>
        </View>
        
        <View style={styles.headerContent}>
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>
              {userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : 'Loading...'}
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="notifications-outline" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Ionicons name="person-outline" size={20} color="white" />
              </View>
              <View style={styles.avatarBadge}>
                <Ionicons name="shield-checkmark" size={12} color={colors.secondary} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Balance Section */}
        <View style={styles.balanceSection}>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceAmount}>
              {balanceVisible 
                ? (walletBalance ? formatCurrency(walletBalance.balances.NGN) : 'Loading...')
                : '••••••'
              }
            </Text>
            <TouchableOpacity 
              onPress={() => setBalanceVisible(!balanceVisible)}
              style={styles.eyeButton}
            >
              <Ionicons 
                name={balanceVisible ? "eye-outline" : "eye-off-outline"} 
                size={20} 
                color="white" 
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.balanceLabel}>Account Balance</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {actionButtons.map((button) => (
            <TouchableOpacity key={button.id} style={styles.actionButton}>
              <Ionicons name={button.icon as any} size={24} color="white" />
              <Text style={styles.actionButtonText}>{button.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      {/* Content */}
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Transactions Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See all {'>'}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.transactionsCard}>
            {transactionsLoading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading transactions...</Text>
              </View>
            ) : transactions && transactions.length > 0 ? (
              transactions.map(renderTransactionItem)
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="receipt-outline" size={48} color={colors.textSecondary} />
                <Text style={styles.emptyText}>No recent transactions</Text>
                <Text style={styles.emptySubtext}>Your transaction history will appear here</Text>
              </View>
            )}
          </View>
        </View>

        {/* Weekly Spending Section */}
        <View style={styles.section}>
          <View style={styles.weeklySpendingCard}>
            <View style={styles.weeklySpendingContent}>
              <Text style={styles.weeklySpendingTitle}>
                Weekly spending: {formatCurrency(weeklySpending)}
              </Text>
              <Text style={styles.weeklySpendingSubtitle}>
                You're staying right on track
              </Text>
            </View>
            <View style={styles.weeklySpendingIcon}>
              <Ionicons name="layers-outline" size={24} color={colors.secondary} />
            </View>
          </View>
        </View>
      </ScrollView>
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
    paddingBottom: 30,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  time: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  statusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    marginHorizontal: 4,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  welcomeSection: {
    flex: 1,
  },
  welcomeText: {
    color: 'white',
    fontSize: 16,
    opacity: 0.9,
  },
  userName: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    marginRight: 15,
    padding: 8,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceSection: {
    marginBottom: 30,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceAmount: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
    marginRight: 12,
  },
  eyeButton: {
    padding: 4,
  },
  balanceLabel: {
    color: 'white',
    fontSize: 14,
    opacity: 0.9,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  seeAllText: {
    fontSize: 14,
    color: colors.secondary,
    fontWeight: '500',
  },
  transactionsCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    ...shadows.small,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionType: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  transactionTime: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  weeklySpendingCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...shadows.small,
  },
  weeklySpendingContent: {
    flex: 1,
  },
  weeklySpendingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  weeklySpendingSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  weeklySpendingIcon: {
    marginLeft: 12,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default HomeScreen;