import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '@theme/colors';
import { formatCurrency } from '@utils/helpers';

const HomeScreen = () => {
  const [balanceVisible, setBalanceVisible] = useState(true);
  const theme = useTheme();

  const mockBalance = 32149.00;
  const weeklySpending = 320.00;

  const recentTransactions = [
    {
      id: '1',
      type: 'Subscription payments',
      icon: 'logo-vimeo',
      iconColor: colors.vimeo,
      time: '20 May, 13:28',
      amount: -20.00,
      isPositive: false,
    },
    {
      id: '2',
      type: 'Creator payments',
      icon: 'logo-youtube',
      iconColor: colors.youtube,
      time: '20 May, 10:32',
      amount: 12.99,
      isPositive: true,
    },
    {
      id: '3',
      type: 'Purchase payments',
      icon: 'logo-paypal',
      iconColor: colors.paypal,
      time: '20 May, 09:24',
      amount: -32.00,
      isPositive: false,
    },
  ];

  const actionButtons = [
    { id: 'send', title: 'Send', icon: 'paper-plane-outline' },
    { id: 'withdraw', title: 'Withdraw', icon: 'business-outline' },
    { id: 'invest', title: 'Invest', icon: 'trending-up-outline' },
    { id: 'add', title: 'Add', icon: 'add-outline' },
  ];

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
            <Text style={styles.userName}>Tanjiro Kamado</Text>
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
              {balanceVisible ? formatCurrency(mockBalance) : '••••••'}
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
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Transactions Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Transactions</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See all ></Text>
            </TouchableOpacity>
          </View>
          <View style={styles.transactionsCard}>
            {recentTransactions.map(renderTransactionItem)}
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
    color: colors.text,
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
    ...shadows.card,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
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
  weeklySpendingCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...shadows.card,
  },
  weeklySpendingContent: {
    flex: 1,
  },
  weeklySpendingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  weeklySpendingSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  weeklySpendingIcon: {
    marginLeft: 12,
  },
});

export default HomeScreen;