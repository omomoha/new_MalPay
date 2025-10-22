import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '@theme/colors';
import { formatCurrency } from '@utils/helpers';

interface TransferSuccessScreenProps {
  navigation: any;
  route: {
    params: {
      transferData: {
        recipientEmail: string;
        recipientInfo: {
          name: string;
          email: string;
          phoneNumber: string;
          isVerified: boolean;
        };
        amount: number;
        description: string;
        userBalance: number;
      };
      transactionId: string;
      timestamp: string;
    };
  };
}

const TransferSuccessScreen: React.FC<TransferSuccessScreenProps> = ({ navigation, route }) => {
  const { transferData, transactionId, timestamp } = route.params;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate success icon
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Animate content fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      delay: 300,
      useNativeDriver: true,
    }).start();

    // Animate sparkles
    Animated.loop(
      Animated.sequence([
        Animated.timing(sparkleAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(sparkleAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleDone = () => {
    navigation.navigate('Main');
  };

  const handleSendMore = () => {
    navigation.navigate('Main', { screen: 'SendMoney' });
  };

  const handleViewTransactions = () => {
    navigation.navigate('Main', { screen: 'Transactions' });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      {/* Header */}
      <LinearGradient colors={[colors.primary, colors.primaryLight]} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Transfer Successful!</Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Success Animation */}
        <View style={styles.animationContainer}>
          <Animated.View
            style={[
              styles.successIconContainer,
              {
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <LinearGradient
              colors={[colors.success, colors.successLight]}
              style={styles.successIcon}
            >
              <Ionicons name="checkmark" size={48} color="white" />
            </LinearGradient>
          </Animated.View>

          {/* Sparkles */}
          <Animated.View
            style={[
              styles.sparkle1,
              {
                opacity: sparkleAnim,
                transform: [
                  {
                    rotate: sparkleAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg'],
                    }),
                  },
                ],
              },
            ]}
          >
            <Ionicons name="sparkles" size={24} color={colors.warning} />
          </Animated.View>
          <Animated.View
            style={[
              styles.sparkle2,
              {
                opacity: sparkleAnim,
                transform: [
                  {
                    rotate: sparkleAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['360deg', '0deg'],
                    }),
                  },
                ],
              },
            ]}
          >
            <Ionicons name="sparkles" size={20} color={colors.warning} />
          </Animated.View>
        </View>

        <Animated.View style={[styles.detailsContainer, { opacity: fadeAnim }]}>
          {/* Transfer Details */}
          <View style={styles.transferDetails}>
            <Text style={styles.sectionTitle}>Transfer Details</Text>
            <View style={styles.detailsCard}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Transaction ID</Text>
                <Text style={styles.detailValue}>{transactionId}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Amount Sent</Text>
                <Text style={styles.detailValue}>{formatCurrency(transferData.amount)}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>To</Text>
                <Text style={styles.detailValue}>{transferData.recipientInfo.name}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Email</Text>
                <Text style={styles.detailValue}>{transferData.recipientInfo.email}</Text>
              </View>
              {transferData.description && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Note</Text>
                  <Text style={styles.detailValue}>{transferData.description}</Text>
                </View>
              )}
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Date & Time</Text>
                <Text style={styles.detailValue}>{formatDateTime(timestamp)}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Status</Text>
                <Text style={[styles.detailValue, { color: colors.success }]}>Completed</Text>
              </View>
            </View>
          </View>

          {/* Next Steps */}
          <View style={styles.nextSteps}>
            <Text style={styles.sectionTitle}>What's Next?</Text>
            <View style={styles.stepsCard}>
              <View style={styles.stepItem}>
                <View style={styles.stepIcon}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                </View>
                <Text style={styles.stepText}>Money has been sent successfully</Text>
              </View>
              <View style={styles.stepItem}>
                <View style={styles.stepIcon}>
                  <Ionicons name="mail" size={20} color={colors.secondary} />
                </View>
                <Text style={styles.stepText}>Recipient will receive a notification</Text>
              </View>
              <View style={styles.stepItem}>
                <View style={styles.stepIcon}>
                  <Ionicons name="receipt" size={20} color={colors.secondary} />
                </View>
                <Text style={styles.stepText}>Transaction receipt sent to your email</Text>
              </View>
            </View>
          </View>

          {/* Balance Update */}
          <View style={styles.balanceUpdate}>
            <Text style={styles.sectionTitle}>Updated Balance</Text>
            <View style={styles.balanceCard}>
              <Text style={styles.balanceLabel}>Available Balance</Text>
              <Text style={styles.balanceAmount}>
                {formatCurrency(transferData.userBalance - transferData.amount)}
              </Text>
            </View>
          </View>
        </Animated.View>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.secondaryButton} onPress={handleSendMore}>
          <Text style={styles.secondaryButtonText}>Send More</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.primaryButton} onPress={handleDone}>
          <LinearGradient
            colors={[colors.secondary, colors.secondaryLight]}
            style={styles.primaryGradient}
          >
            <Text style={styles.primaryButtonText}>Done</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
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
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  animationContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 30,
    position: 'relative',
  },
  successIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.large,
  },
  sparkle1: {
    position: 'absolute',
    top: 10,
    right: 60,
  },
  sparkle2: {
    position: 'absolute',
    bottom: 10,
    left: 60,
  },
  detailsContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 15,
  },
  transferDetails: {
    marginBottom: 30,
  },
  detailsCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    ...shadows.card,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  nextSteps: {
    marginBottom: 30,
  },
  stepsCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    ...shadows.card,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  stepIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepText: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  balanceUpdate: {
    marginBottom: 20,
  },
  balanceCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    ...shadows.card,
  },
  balanceLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 30,
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  primaryButton: {
    flex: 2,
    borderRadius: 12,
    overflow: 'hidden',
    ...shadows.large,
  },
  primaryGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TransferSuccessScreen;
