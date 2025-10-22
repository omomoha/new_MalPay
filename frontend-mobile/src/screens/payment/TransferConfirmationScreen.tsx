import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '@theme/colors';
import { formatCurrency } from '@utils/helpers';

const TransferConfirmationScreen = () => {
  const transferAmount = 32.00;
  const recipientName = 'Nezuko Kamado';
  const transferDate = '10:48 AM 20 May, 2024';
  const transferType = 'BI-FAST';
  const transferFee = 'Free';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.statusIcons}>
          <Ionicons name="wifi-outline" size={16} color="white" />
          <Ionicons name="battery-half-outline" size={16} color="white" style={styles.statusIcon} />
        </View>
      </View>

      {/* Main Content */}
      <LinearGradient colors={[colors.primary, colors.primaryLight]} style={styles.content}>
        {/* Success Icon */}
        <View style={styles.successIconContainer}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark" size={40} color="white" />
          </View>
          <View style={styles.sparkles}>
            <Ionicons name="star" size={12} color="#FFD700" style={styles.sparkle1} />
            <Ionicons name="star" size={8} color="#FFD700" style={styles.sparkle2} />
            <Ionicons name="star" size={10} color="#FFD700" style={styles.sparkle3} />
            <Ionicons name="star" size={6} color="#FFD700" style={styles.sparkle4} />
          </View>
        </View>

        {/* Success Message */}
        <Text style={styles.successMessage}>
          You've sent {formatCurrency(transferAmount)} to {recipientName}
        </Text>

        {/* Transaction Details Card */}
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailValue}>{transferDate}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Type</Text>
            <Text style={styles.detailValue}>{transferType}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Nominal</Text>
            <Text style={[styles.detailValue, styles.nominalValue]}>
              {formatCurrency(transferAmount)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Fee</Text>
            <Text style={styles.detailValue}>{transferFee}</Text>
          </View>
        </View>

        {/* Share Button */}
        <TouchableOpacity style={styles.shareButton}>
          <Ionicons name="share-outline" size={20} color="white" />
          <Text style={styles.shareButtonText}>Share detail transfer</Text>
        </TouchableOpacity>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    padding: 4,
  },
  statusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    marginLeft: 8,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  successIconContainer: {
    position: 'relative',
    marginBottom: 30,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.large,
  },
  sparkles: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sparkle1: {
    position: 'absolute',
    top: -5,
    right: -5,
  },
  sparkle2: {
    position: 'absolute',
    top: 10,
    left: -10,
  },
  sparkle3: {
    position: 'absolute',
    bottom: -5,
    left: 10,
  },
  sparkle4: {
    position: 'absolute',
    bottom: 15,
    right: -8,
  },
  successMessage: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  detailsCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    width: '100%',
    marginBottom: 40,
    ...shadows.card,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  nominalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  shareButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default TransferConfirmationScreen;
