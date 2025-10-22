import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '@theme/colors';
import { formatCurrency } from '@utils/helpers';
import CardEncryption from '@utils/cardEncryption';

interface PINVerificationScreenProps {
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
      step: string;
    };
  };
}

const PINVerificationScreen: React.FC<PINVerificationScreenProps> = ({ navigation, route }) => {
  const { transferData, step } = route.params;
  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);
  const inputRefs = useRef<TextInput[]>([]);

  const MAX_ATTEMPTS = 3;
  const LOCKOUT_DURATION = 300; // 5 minutes in seconds

  useEffect(() => {
    // Check if user is locked out
    if (isLocked && lockoutTime > 0) {
      const timer = setInterval(() => {
        setLockoutTime(prev => {
          if (prev <= 1) {
            setIsLocked(false);
            setAttempts(0);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isLocked, lockoutTime]);

  const handlePinChange = (value: string, index: number) => {
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const verifyPIN = async (enteredPin: string) => {
    try {
      // Mock PIN verification (in real app, this would be server-side)
      const mockEncryptedPIN = CardEncryption.encryptPIN('123456', 'user123');
      const isValid = CardEncryption.verifyPIN(enteredPin, mockEncryptedPIN, 'user123');
      
      return isValid;
    } catch (error) {
      return false;
    }
  };

  const handleVerifyPIN = async () => {
    const pinString = pin.join('');
    
    if (pinString.length !== 6) {
      Alert.alert('Invalid PIN', 'Please enter the complete 6-digit PIN');
      return;
    }

    if (isLocked) {
      const minutes = Math.floor(lockoutTime / 60);
      const seconds = lockoutTime % 60;
      Alert.alert(
        'Account Locked',
        `Too many failed attempts. Please try again in ${minutes}:${seconds.toString().padStart(2, '0')}`
      );
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      const isValid = await verifyPIN(pinString);

      if (isValid) {
        // PIN is correct, proceed to OTP verification
        navigation.navigate('SendMoneyOTP', {
          transferData,
          step: 'pin_verified',
        });
      } else {
        // PIN is incorrect
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);

        if (newAttempts >= MAX_ATTEMPTS) {
          setIsLocked(true);
          setLockoutTime(LOCKOUT_DURATION);
          Alert.alert(
            'Account Locked',
            'Too many failed PIN attempts. Your account has been locked for 5 minutes.'
          );
        } else {
          Alert.alert(
            'Invalid PIN',
            `Incorrect PIN. ${MAX_ATTEMPTS - newAttempts} attempts remaining.`
          );
        }

        // Clear PIN
        setPin(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to verify PIN. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPIN = () => {
    Alert.alert(
      'Forgot PIN?',
      'To reset your PIN, you will need to verify your identity through your registered email and phone number.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset PIN',
          onPress: () => {
            // Navigate to PIN reset flow
            Alert.alert('Coming Soon', 'PIN reset feature will be available soon.');
          },
        },
      ]
    );
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      {/* Header */}
      <LinearGradient colors={[colors.primary, colors.primaryLight]} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Enter PIN</Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <KeyboardAvoidingView 
        style={styles.content} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Transfer Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Transfer Details</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>To</Text>
            <Text style={styles.summaryValue}>{transferData.recipientInfo.name}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Amount</Text>
            <Text style={styles.summaryValue}>{formatCurrency(transferData.amount)}</Text>
          </View>
          {transferData.description && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Note</Text>
              <Text style={styles.summaryValue}>{transferData.description}</Text>
            </View>
          )}
        </View>

        {/* PIN Instructions */}
        <View style={styles.instructionsContainer}>
          <View style={styles.iconContainer}>
            <Ionicons name="lock-closed" size={32} color={colors.secondary} />
          </View>
          <Text style={styles.title}>Enter Your PIN</Text>
          <Text style={styles.description}>
            Enter your 6-digit PIN to authorize this transfer
          </Text>
        </View>

        {/* PIN Input */}
        <View style={styles.pinContainer}>
          {pin.map((digit, index) => (
            <TextInput
              key={index}
              ref={ref => {
                if (ref) inputRefs.current[index] = ref;
              }}
              style={[
                styles.pinInput,
                digit && styles.pinInputFilled,
                isLocked && styles.pinInputDisabled,
              ]}
              value={digit}
              onChangeText={(value) => handlePinChange(value, index)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
              keyboardType="numeric"
              maxLength={1}
              selectTextOnFocus
              editable={!isLocked}
              secureTextEntry
            />
          ))}
        </View>

        {/* Attempts Counter */}
        {attempts > 0 && !isLocked && (
          <View style={styles.attemptsContainer}>
            <Text style={styles.attemptsText}>
              {MAX_ATTEMPTS - attempts} attempts remaining
            </Text>
          </View>
        )}

        {/* Lockout Timer */}
        {isLocked && (
          <View style={styles.lockoutContainer}>
            <Ionicons name="lock-closed" size={24} color={colors.error} />
            <Text style={styles.lockoutText}>
              Account locked. Try again in {formatTime(lockoutTime)}
            </Text>
          </View>
        )}

        {/* Forgot PIN */}
        <View style={styles.forgotContainer}>
          <TouchableOpacity onPress={handleForgotPIN} disabled={isLocked}>
            <Text style={[styles.forgotText, isLocked && styles.forgotTextDisabled]}>
              Forgot PIN?
            </Text>
          </TouchableOpacity>
        </View>

        {/* Security Notice */}
        <View style={styles.securityNotice}>
          <Ionicons name="shield-checkmark" size={20} color={colors.success} />
          <Text style={styles.securityText}>
            Your PIN is encrypted and never stored in plain text
          </Text>
        </View>
      </KeyboardAvoidingView>

      {/* Verify Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.verifyButton, (isLoading || isLocked || pin.some(digit => !digit)) && styles.verifyButtonDisabled]}
          onPress={handleVerifyPIN}
          disabled={isLoading || isLocked || pin.some(digit => !digit)}
        >
          <LinearGradient
            colors={isLoading ? [colors.textSecondary, colors.textSecondary] : [colors.secondary, colors.secondaryLight]}
            style={styles.verifyGradient}
          >
            <Text style={styles.verifyButtonText}>
              {isLoading ? 'Verifying...' : 'Verify PIN'}
            </Text>
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
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    ...shadows.card,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  instructionsContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  pinContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  pinInput: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderColor: colors.borderLight,
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    backgroundColor: colors.surface,
  },
  pinInputFilled: {
    borderColor: colors.secondary,
    backgroundColor: colors.surfaceVariant,
  },
  pinInputDisabled: {
    borderColor: colors.textSecondary,
    backgroundColor: colors.surfaceVariant,
    opacity: 0.5,
  },
  attemptsContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  attemptsText: {
    fontSize: 14,
    color: colors.warning,
    fontWeight: '500',
  },
  lockoutContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceVariant,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  lockoutText: {
    fontSize: 14,
    color: colors.error,
    marginLeft: 8,
    fontWeight: '500',
  },
  forgotContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  forgotText: {
    fontSize: 16,
    color: colors.secondary,
    fontWeight: '500',
  },
  forgotTextDisabled: {
    color: colors.textSecondary,
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceVariant,
    borderRadius: 12,
    padding: 16,
  },
  securityText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 30,
  },
  verifyButton: {
    borderRadius: 12,
    overflow: 'hidden',
    ...shadows.large,
  },
  verifyButtonDisabled: {
    opacity: 0.6,
  },
  verifyGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  verifyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PINVerificationScreen;
