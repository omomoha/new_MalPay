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
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '@theme/colors';
import { formatCurrency } from '@utils/helpers';

interface CardsScreenProps {
  navigation: any;
}

const CardsScreen: React.FC<CardsScreenProps> = ({ navigation }) => {
  const [cardVisible, setCardVisible] = useState(true);
  const cardBalance = 15420.50;

  const cards = [
    {
      id: '1',
      type: 'Visa',
      number: '**** **** **** 1234',
      expiryDate: '12/26',
      balance: 15420.50,
      color: '#1A1F71',
      gradient: ['#1A1F71', '#2A3F81'],
    },
    {
      id: '2',
      type: 'Mastercard',
      number: '**** **** **** 5678',
      expiryDate: '08/25',
      balance: 8750.00,
      color: '#EB001B',
      gradient: ['#EB001B', '#FF1A2B'],
    },
  ];

  const recentTransactions = [
    {
      id: '1',
      merchant: 'Amazon Nigeria',
      amount: -2500.00,
      date: 'Today, 2:30 PM',
      type: 'debit',
    },
    {
      id: '2',
      merchant: 'Jumia',
      amount: -1800.00,
      date: 'Yesterday, 4:15 PM',
      type: 'debit',
    },
    {
      id: '3',
      merchant: 'Refund - Shoprite',
      amount: 1200.00,
      date: 'Yesterday, 1:20 PM',
      type: 'credit',
    },
  ];

  const renderCard = (card: any) => (
    <LinearGradient
      key={card.id}
      colors={card.gradient}
      style={styles.card}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardType}>{card.type}</Text>
        <TouchableOpacity
          onPress={() => setCardVisible(!cardVisible)}
          style={styles.eyeButton}
        >
          <Ionicons
            name={cardVisible ? "eye-outline" : "eye-off-outline"}
            size={20}
            color="white"
          />
        </TouchableOpacity>
      </View>
      
      <View style={styles.cardNumberContainer}>
        <Text style={styles.cardNumber}>{card.number}</Text>
      </View>
      
      <View style={styles.cardFooter}>
        <View>
          <Text style={styles.cardLabel}>Balance</Text>
          <Text style={styles.cardBalance}>
            {cardVisible ? formatCurrency(card.balance) : '••••••'}
          </Text>
        </View>
        <View style={styles.cardExpiry}>
          <Text style={styles.cardLabel}>Expires</Text>
          <Text style={styles.cardExpiryDate}>{card.expiryDate}</Text>
        </View>
      </View>
    </LinearGradient>
  );

  const renderTransaction = (transaction: any) => (
    <View key={transaction.id} style={styles.transactionItem}>
      <View style={styles.transactionLeft}>
        <View style={styles.transactionIcon}>
          <Ionicons
            name={transaction.type === 'debit' ? 'arrow-down' : 'arrow-up'}
            size={20}
            color={transaction.type === 'debit' ? colors.error : colors.success}
          />
        </View>
        <View style={styles.transactionDetails}>
          <Text style={styles.transactionMerchant}>{transaction.merchant}</Text>
          <Text style={styles.transactionDate}>{transaction.date}</Text>
        </View>
      </View>
      <Text
        style={[
          styles.transactionAmount,
          {
            color: transaction.type === 'debit' ? colors.error : colors.success,
          },
        ]}
      >
        {transaction.type === 'debit' ? '-' : '+'}
        {formatCurrency(Math.abs(transaction.amount))}
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
        
        <Text style={styles.headerTitle}>Cards</Text>
      </LinearGradient>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Cards Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Cards</Text>
            <TouchableOpacity 
              style={styles.addCardButton}
              onPress={() => navigation.navigate('Settings', { screen: 'LinkedCards' })}
            >
              <Ionicons name="add" size={20} color={colors.secondary} />
              <Text style={styles.addCardText}>Add Card</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cardsContainer}>
            {cards.map(renderCard)}
          </ScrollView>
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See all {'>'}</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.transactionsCard}>
            {recentTransactions.map(renderTransaction)}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickActionButton}>
              <Ionicons name="card-outline" size={24} color={colors.secondary} />
              <Text style={styles.quickActionText}>Block Card</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton}>
              <Ionicons name="refresh-outline" size={24} color={colors.secondary} />
              <Text style={styles.quickActionText}>Replace Card</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton}>
              <Ionicons name="settings-outline" size={24} color={colors.secondary} />
              <Text style={styles.quickActionText}>Card Settings</Text>
            </TouchableOpacity>
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
  headerTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
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
  addCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  addCardText: {
    color: colors.secondary,
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  seeAllText: {
    fontSize: 14,
    color: colors.secondary,
    fontWeight: '500',
  },
  cardsContainer: {
    marginBottom: 10,
  },
  card: {
    width: 300,
    height: 180,
    borderRadius: 16,
    padding: 20,
    marginRight: 16,
    ...shadows.large,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  cardType: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  eyeButton: {
    padding: 4,
  },
  cardNumberContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  cardNumber: {
    color: 'white',
    fontSize: 18,
    fontWeight: '500',
    letterSpacing: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    marginBottom: 4,
  },
  cardBalance: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardExpiry: {
    alignItems: 'flex-end',
  },
  cardExpiryDate: {
    color: 'white',
    fontSize: 14,
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
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionMerchant: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    ...shadows.card,
  },
  quickActionButton: {
    alignItems: 'center',
    flex: 1,
  },
  quickActionText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default CardsScreen;
