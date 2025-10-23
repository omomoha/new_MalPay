import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useGetAllCardBalancesQuery, useRefreshCardBalanceMutation } from '@store/api/api';
import { theme } from '@theme/theme';
import RefreshBalanceModal from '@components/Balance/RefreshBalanceModal';

interface CardBalance {
  cardId: string;
  cardType: string;
  maskedCardNumber: string;
  balance: number;
  currency: string;
  lastUpdated: string;
  isMastercard: boolean;
}

const BalanceScreen: React.FC = () => {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string>('');
  const [refreshModalVisible, setRefreshModalVisible] = useState(false);

  const {
    data: balanceData,
    isLoading,
    error,
    refetch,
  } = useGetAllCardBalancesQuery();

  const [refreshCardBalance, { isLoading: isRefreshing }] = useRefreshCardBalanceMutation();

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      console.error('Error refreshing balances:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleCardRefresh = (cardId: string) => {
    setSelectedCardId(cardId);
    setRefreshModalVisible(true);
  };

  const handleRefreshConfirm = async (cardData: any) => {
    try {
      await refreshCardBalance({
        cardId: selectedCardId,
        cardData,
      }).unwrap();
      setRefreshModalVisible(false);
      Alert.alert('Success', 'Balance refreshed successfully');
    } catch (error: any) {
      Alert.alert('Error', error.data?.error?.message || 'Failed to refresh balance');
    }
  };

  const formatCurrency = (amount: number, currency: string = 'NGN'): string => {
    const symbols: { [key: string]: string } = {
      NGN: '₦',
      USD: '$',
      EUR: '€',
      GBP: '£',
    };

    const symbol = symbols[currency] || currency;
    return `${symbol}${amount.toLocaleString('en-NG', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCardTypeColor = (cardType: string): string => {
    switch (cardType.toLowerCase()) {
      case 'mastercard':
        return '#eb001b';
      case 'visa':
        return '#1a1f71';
      case 'amex':
        return '#006fcf';
      case 'discover':
        return '#ff6000';
      case 'verve':
        return '#7c3aed';
      default:
        return '#6b7280';
    }
  };

  const getCardTypeIcon = (cardType: string): string => {
    switch (cardType.toLowerCase()) {
      case 'mastercard':
        return 'card';
      case 'visa':
        return 'card';
      case 'amex':
        return 'card';
      case 'discover':
        return 'card';
      case 'verve':
        return 'card';
      default:
        return 'card';
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading balances...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color={theme.colors.error} />
          <Text style={styles.errorTitle}>Error Loading Balances</Text>
          <Text style={styles.errorText}>
            {error.data?.error?.message || 'Failed to load balance information'}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const balances = balanceData?.balances || [];
  const totalBalance = balanceData?.totalBalance || 0;
  const currency = balanceData?.currency || 'NGN';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Account Balances</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Mastercard Only Notice */}
        <View style={styles.noticeContainer}>
          <Ionicons name="information-circle" size={20} color={theme.colors.primary} />
          <Text style={styles.noticeText}>
            Only Mastercard holders can view their account balance
          </Text>
        </View>

        {/* Total Balance Summary */}
        {balances.length > 0 && (
          <View style={styles.totalBalanceContainer}>
            <Text style={styles.totalBalanceLabel}>Total Available Balance</Text>
            <Text style={styles.totalBalanceAmount}>
              {formatCurrency(totalBalance, currency)}
            </Text>
          </View>
        )}

        {/* Balances List */}
        {balances.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="card" size={64} color={theme.colors.textSecondary} />
            <Text style={styles.emptyTitle}>No Mastercard Balances Found</Text>
            <Text style={styles.emptyText}>
              Add a Mastercard to your account to view your balance information
            </Text>
            <TouchableOpacity
              style={styles.addCardButton}
              onPress={() => navigation.navigate('AddCard' as never)}
            >
              <Text style={styles.addCardButtonText}>Add Mastercard</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.balancesList}>
            {balances.map((balance: CardBalance) => (
              <View
                key={balance.cardId}
                style={[
                  styles.balanceCard,
                  { borderLeftColor: getCardTypeColor(balance.cardType) },
                ]}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.cardInfo}>
                    <Ionicons
                      name={getCardTypeIcon(balance.cardType) as any}
                      size={24}
                      color={getCardTypeColor(balance.cardType)}
                    />
                    <View style={styles.cardDetails}>
                      <Text style={styles.cardType}>
                        {balance.cardType.toUpperCase()}
                      </Text>
                      <Text style={styles.cardNumber}>
                        {balance.maskedCardNumber}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.refreshButton}
                    onPress={() => handleCardRefresh(balance.cardId)}
                    disabled={isRefreshing}
                  >
                    {isRefreshing ? (
                      <ActivityIndicator size="small" color={theme.colors.primary} />
                    ) : (
                      <Ionicons name="refresh" size={20} color={theme.colors.primary} />
                    )}
                  </TouchableOpacity>
                </View>

                <View style={styles.balanceInfo}>
                  <Text style={styles.balanceAmount}>
                    {formatCurrency(balance.balance, balance.currency)}
                  </Text>
                  <Text style={styles.balanceLabel}>Available Balance</Text>
                </View>

                <View style={styles.cardFooter}>
                  <Text style={styles.lastUpdated}>
                    Last updated: {formatDate(balance.lastUpdated)}
                  </Text>
                  <View style={styles.mastercardBadge}>
                    <Text style={styles.mastercardBadgeText}>Mastercard</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Refresh Balance Modal */}
      <RefreshBalanceModal
        visible={refreshModalVisible}
        onClose={() => setRefreshModalVisible(false)}
        onConfirm={handleRefreshConfirm}
        cardId={selectedCardId}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
  },
  placeholder: {
    width: 40,
  },
  noticeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryLight,
    padding: 12,
    margin: 16,
    borderRadius: 8,
  },
  noticeText: {
    marginLeft: 8,
    fontSize: 14,
    color: theme.colors.primary,
    flex: 1,
  },
  totalBalanceContainer: {
    backgroundColor: theme.colors.primary,
    margin: 16,
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  totalBalanceLabel: {
    fontSize: 16,
    color: theme.colors.white,
    opacity: 0.9,
    marginBottom: 8,
  },
  totalBalanceAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.colors.white,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  addCardButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addCardButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  balancesList: {
    padding: 16,
  },
  balanceCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: theme.colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardDetails: {
    marginLeft: 12,
    flex: 1,
  },
  cardType: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  cardNumber: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  refreshButton: {
    padding: 8,
  },
  balanceInfo: {
    marginBottom: 16,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  balanceLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastUpdated: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  mastercardBadge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  mastercardBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.white,
  },
});

export default BalanceScreen;
