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

const SavingsScreen = () => {
  const [balanceVisible, setBalanceVisible] = useState(true);
  const savingsBalance = 12149.00;

  const savingsGoals = [
    {
      id: '1',
      title: 'Education',
      icon: 'school-outline',
      current: 2250,
      target: 10000,
      color: colors.secondary,
    },
    {
      id: '2',
      title: 'Vacation',
      icon: 'airplane-outline',
      current: 1250,
      target: 5000,
      color: colors.info,
    },
    {
      id: '3',
      title: 'Concert',
      icon: 'ticket-outline',
      current: 1800,
      target: 4000,
      color: colors.warning,
    },
    {
      id: '4',
      title: 'Wedding',
      icon: 'diamond-outline',
      current: 5500,
      target: 15000,
      color: colors.success,
    },
    {
      id: '5',
      title: 'Pet care',
      icon: 'paw-outline',
      current: 0,
      target: 2000,
      color: colors.error,
    },
    {
      id: '6',
      title: 'Retirement',
      icon: 'gift-outline',
      current: 0,
      target: 50000,
      color: colors.textSecondary,
    },
  ];

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const renderSavingsGoal = (goal: any) => {
    const progress = getProgressPercentage(goal.current, goal.target);
    
    return (
      <View key={goal.id} style={styles.savingsGoalCard}>
        <View style={styles.savingsGoalHeader}>
          <View style={[styles.savingsGoalIcon, { backgroundColor: goal.color }]}>
            <Ionicons name={goal.icon as any} size={20} color="white" />
          </View>
          <View style={styles.savingsGoalDetails}>
            <Text style={styles.savingsGoalTitle}>{goal.title}</Text>
            <Text style={styles.savingsGoalAmount}>
              {formatCurrency(goal.current)}/{formatCurrency(goal.target)}
            </Text>
          </View>
        </View>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${progress}%`,
                  backgroundColor: goal.color,
                }
              ]} 
            />
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.secondary} />
      
      {/* Header */}
      <LinearGradient colors={[colors.secondary, colors.secondaryLight]} style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.time}>9:41</Text>
          <View style={styles.statusIcons}>
            <Ionicons name="cellular-outline" size={16} color="white" />
            <Ionicons name="wifi-outline" size={16} color="white" style={styles.statusIcon} />
            <Ionicons name="battery-half-outline" size={16} color="white" />
          </View>
        </View>
        
        <Text style={styles.headerTitle}>Savings</Text>

        {/* Balance Section */}
        <View style={styles.balanceSection}>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceAmount}>
              {balanceVisible ? formatCurrency(savingsBalance) : '••••••'}
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
          <Text style={styles.balanceLabel}>Saving Balance</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.primaryButton}>
            <Ionicons name="add" size={20} color="white" />
            <Text style={styles.primaryButtonText}>+ Create New</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Withdraw</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.savingsGoalsSection}>
          {savingsGoals.map(renderSavingsGoal)}
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
    marginBottom: 30,
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
    justifyContent: 'space-between',
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 12,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  secondaryButtonText: {
    color: colors.secondary,
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  savingsGoalsSection: {
    marginTop: 20,
  },
  savingsGoalCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...shadows.card,
  },
  savingsGoalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  savingsGoalIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  savingsGoalDetails: {
    flex: 1,
  },
  savingsGoalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  savingsGoalAmount: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.borderLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
});

export default SavingsScreen;
