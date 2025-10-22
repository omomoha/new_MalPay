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

interface CardAdditionSuccessScreenProps {
  navigation: any;
  route: {
    params: {
      cardData: {
        cardNumber: string;
        expiryDate: string;
        cvv: string;
        cardholderName: string;
      };
      cardType: string;
      feeAmount: number;
      transactionId: string;
    };
  };
}

const CardAdditionSuccessScreen: React.FC<CardAdditionSuccessScreenProps> = ({ navigation, route }) => {
  const { cardData, cardType, feeAmount, transactionId } = route.params;
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

  const handleViewCards = () => {
    navigation.navigate('Main');
  };

  const handleGoHome = () => {
    navigation.navigate('Main');
  };

  const getCardGradient = () => {
    switch (cardType) {
      case 'visa':
        return ['#1A1F71', '#2A3F81'];
      case 'mastercard':
        return ['#EB001B', '#FF1A2B'];
      case 'amex':
        return ['#006FCF', '#0070F0'];
      case 'discover':
        return ['#FF6000', '#FF7000'];
      default:
        return ['#6B7280', '#9CA3AF'];
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      {/* Header */}
      <LinearGradient colors={[colors.primary, colors.primaryLight]} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Card Added Successfully!</Text>
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
          {/* Card Preview */}
          <View style={styles.cardPreview}>
            <Text style={styles.sectionTitle}>Your New Card</Text>
            <LinearGradient
              colors={getCardGradient()}
              style={styles.cardTemplate}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.cardHeader}>
                <Ionicons name="card" size={24} color="white" />
                <Text style={styles.cardTypeText}>
                  {cardType?.toUpperCase() || 'CARD'}
                </Text>
              </View>
              
              <View style={styles.cardNumberContainer}>
                <Text style={styles.cardNumberText}>
                  **** **** **** {cardData.cardNumber.slice(-4)}
                </Text>
              </View>
              
              <View style={styles.cardFooter}>
                <View>
                  <Text style={styles.cardLabel}>CARDHOLDER</Text>
                  <Text style={styles.cardholderText}>
                    {cardData.cardholderName}
                  </Text>
                </View>
                <View style={styles.cardExpiry}>
                  <Text style={styles.cardLabel}>EXPIRES</Text>
                  <Text style={styles.cardExpiryText}>
                    {cardData.expiryDate}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Transaction Details */}
          <View style={styles.transactionDetails}>
            <Text style={styles.sectionTitle}>Transaction Details</Text>
            <View style={styles.detailsCard}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Transaction ID</Text>
                <Text style={styles.detailValue}>{transactionId}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Fee Charged</Text>
                <Text style={styles.detailValue}>{formatCurrency(feeAmount)}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Status</Text>
                <Text style={[styles.detailValue, { color: colors.success }]}>Completed</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Date & Time</Text>
                <Text style={styles.detailValue}>
                  {new Date().toLocaleString('en-NG', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            </View>
          </View>

          {/* Next Steps */}
          <View style={styles.nextSteps}>
            <Text style={styles.sectionTitle}>What's Next?</Text>
            <View style={styles.stepsCard}>
              <View style={styles.stepItem}>
                <View style={styles.stepIcon}>
                  <Ionicons name="card" size={20} color={colors.secondary} />
                </View>
                <Text style={styles.stepText}>Your card is now linked and ready to use</Text>
              </View>
              <View style={styles.stepItem}>
                <View style={styles.stepIcon}>
                  <Ionicons name="shield-checkmark" size={20} color={colors.secondary} />
                </View>
                <Text style={styles.stepText}>Card is secured with bank-level encryption</Text>
              </View>
              <View style={styles.stepItem}>
                <View style={styles.stepIcon}>
                  <Ionicons name="flash" size={20} color={colors.secondary} />
                </View>
                <Text style={styles.stepText}>Start making payments instantly</Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.secondaryButton} onPress={handleViewCards}>
          <Text style={styles.secondaryButtonText}>View Cards</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.primaryButton} onPress={handleGoHome}>
          <LinearGradient
            colors={[colors.secondary, colors.secondaryLight]}
            style={styles.primaryGradient}
          >
            <Text style={styles.primaryButtonText}>Go to Home</Text>
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
    color: colors.textPrimary,
    marginBottom: 15,
  },
  cardPreview: {
    marginBottom: 30,
  },
  cardTemplate: {
    height: 180,
    borderRadius: 16,
    padding: 20,
    ...shadows.large,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  cardTypeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  cardNumberContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  cardNumberText: {
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
    fontSize: 10,
    marginBottom: 4,
    letterSpacing: 1,
  },
  cardholderText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  cardExpiry: {
    alignItems: 'flex-end',
  },
  cardExpiryText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  transactionDetails: {
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
    color: colors.textPrimary,
    fontWeight: '500',
  },
  nextSteps: {
    marginBottom: 20,
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
    color: colors.textPrimary,
    flex: 1,
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
    color: colors.textPrimary,
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

export default CardAdditionSuccessScreen;
