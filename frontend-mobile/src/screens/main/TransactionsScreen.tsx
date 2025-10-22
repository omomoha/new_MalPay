import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '@theme/colors';
import { formatCurrency } from '@utils/helpers';

const TransactionsScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const transactions = [
    // Today's transactions
    {
      id: '1',
      type: 'Subscription payments',
      icon: 'logo-vimeo',
      iconColor: colors.vimeo,
      time: '20 May, 13:28',
      amount: -20.00,
      isPositive: false,
      date: 'TODAY',
    },
    {
      id: '2',
      type: 'Creator payments',
      icon: 'logo-youtube',
      iconColor: colors.youtube,
      time: '20 May, 10:32',
      amount: 12.99,
      isPositive: true,
      date: 'TODAY',
    },
    {
      id: '3',
      type: 'Purchase payments',
      icon: 'logo-paypal',
      iconColor: colors.paypal,
      time: '20 May, 09:24',
      amount: -32.00,
      isPositive: false,
      date: 'TODAY',
    },
    {
      id: '4',
      type: 'Sales earnings',
      icon: 'bag-outline',
      iconColor: colors.success,
      time: '20 May, 09:01',
      amount: 23.99,
      isPositive: true,
      date: 'TODAY',
    },
    // Yesterday's transactions
    {
      id: '5',
      type: 'Refunds received',
      icon: 'card-outline',
      iconColor: colors.mastercard,
      time: '19 May, 13:28',
      amount: 45.50,
      isPositive: true,
      date: '19 MAY 2025',
    },
    {
      id: '6',
      type: 'Incoming transfers',
      icon: 'logo-paypal',
      iconColor: colors.paypal,
      time: '19 May, 09:24',
      amount: 89.75,
      isPositive: true,
      date: '19 MAY 2025',
    },
  ];

  const groupedTransactions = transactions.reduce((acc, transaction) => {
    if (!acc[transaction.date]) {
      acc[transaction.date] = [];
    }
    acc[transaction.date].push(transaction);
    return acc;
  }, {} as Record<string, typeof transactions>);

  const renderTransactionItem = (transaction: any) => (
    <View key={transaction.id} style={styles.transactionItem}>
      <View style={styles.transactionLeft}>
        <View style={[styles.transactionIcon, { backgroundColor: transaction.iconColor }]}>
          <Ionicons name={transaction.icon as any} size={20} color="white" />
        </View>
        <View style={styles.transactionDetails}>
          <Text style={styles.transactionType}>{transaction.type}</Text>
          <Text style={styles.transactionTime}>{transaction.time}</Text>
        </View>
      </View>
      <Text style={[
        styles.transactionAmount,
        { color: transaction.isPositive ? colors.positive : colors.negative }
      ]}>
        {transaction.isPositive ? '+' : ''}{formatCurrency(transaction.amount)}
      </Text>
    </View>
  );

  const renderTransactionGroup = (date: string, transactions: any[]) => (
    <View key={date} style={styles.transactionGroup}>
      <Text style={styles.dateHeader}>{date}</Text>
      <View style={styles.transactionsList}>
        {transactions.map(renderTransactionItem)}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Transactions</Text>
          <View style={styles.headerIcons}>
            <Ionicons name="wifi-outline" size={16} color={colors.text} />
            <Ionicons name="battery-half-outline" size={16} color={colors.text} style={styles.statusIcon} />
          </View>
        </View>
        
        {/* Search and Filter */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search"
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="options-outline" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {Object.entries(groupedTransactions).map(([date, transactions]) =>
          renderTransactionGroup(date, transactions)
        )}
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
    backgroundColor: colors.surface,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    ...shadows.small,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    marginLeft: 8,
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: colors.text,
  },
  filterButton: {
    padding: 8,
    backgroundColor: colors.surfaceVariant,
    borderRadius: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  transactionGroup: {
    marginTop: 20,
  },
  dateHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  transactionsList: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    ...shadows.card,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
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
    color: colors.text,
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
});

export default TransactionsScreen;