import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '@theme/colors';
import { formatCurrency } from '@utils/helpers';

interface WithdrawOTPScreenProps {
  navigation: any;
  route: {
    params: {
      amount: number;
      bankAccount: {
        id: string;
        bankName: string;
        accountNumber: string;
        accountName: string;
      };
    };
  };
}

const WithdrawOTPScreen: React.FC<WithdrawOTPScreenProps> = ({ navigation, route }) => {
  const { amount, bankAccount } = route.params;
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Mock user email (would come from user profile)
  const userEmail = 'john.doe@example.com';

  useEffect(() => {
    // Start resend timer
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleOtpChange = (value: string) => {
    // Only allow numeric input and limit to 6 digits
    const cleanValue = value.replace(/[^0-9]/g, '').slice(0, 6);
    setOtp(cleanValue);
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter the complete 6-digit OTP.');
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate OTP verification
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real app, verify OTP with backend
      if (otp === '123456') { // Mock OTP for testing
        navigation.navigate('WithdrawSuccess', {
          amount,
          bankAccount,
        });
      } else {
        Alert.alert('Invalid OTP', 'The OTP you entered is incorrect. Please try again.');
        setOtp('');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to verify OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;

    setIsLoading(true);
    
    try {
      // Simulate resending OTP
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert('OTP Sent', `A new OTP has been sent to ${userEmail}`);
      
      // Reset timer
      setResendTimer(60);
      setCanResend(false);
      
      // Restart timer
      const timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
    } catch (error) {
      Alert.alert('Error', 'Failed to resend OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      {/* Header */}
      <LinearGradient colors={[colors.primary, colors.primaryLight]} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Verify OTP</Text>
          <View style={styles.placeholder} />
        </View>
        
        <View style={styles.transactionContainer}>
          <Text style={styles.transactionLabel}>Withdrawal Details</Text>
          <Text style={styles.transactionAmount}>{formatCurrency(amount)}</Text>
          <Text style={styles.transactionBank}>
            To: {bankAccount.bankName} ****{bankAccount.accountNumber.slice(-4)}
          </Text>
        </View>
      </LinearGradient>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.otpSection}>
          <View style={styles.iconContainer}>
            <Ionicons name="mail" size={48} color={colors.primary} />
          </View>
          
          <Text style={styles.otpTitle}>Enter OTP</Text>
          <Text style={styles.otpSubtitle}>
            We've sent a 6-digit code to{'\n'}
            <Text style={styles.emailText}>{userEmail}</Text>
          </Text>
          
          <View style={styles.otpInputContainer}>
            <TextInput
              style={styles.otpInput}
              value={otp}
              onChangeText={handleOtpChange}
              keyboardType="numeric"
              maxLength={6}
              autoFocus
              placeholder="000000"
              placeholderTextColor={colors.textSecondary}
            />
          </View>
          
          <View style={styles.resendContainer}>
            {canResend ? (
              <TouchableOpacity onPress={handleResendOTP} disabled={isLoading}>
                <Text style={styles.resendText}>Resend OTP</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.timerText}>
                Resend OTP in {formatTimer(resendTimer)}
              </Text>
            )}
          </View>
        </View>

        {/* Security Info */}
        <View style={styles.securityCard}>
          <View style={styles.securityItem}>
            <Ionicons name="shield-checkmark" size={20} color={colors.success} />
            <Text style={styles.securityText}>
              OTP expires in 10 minutes
            </Text>
          </View>
          <View style={styles.securityItem}>
            <Ionicons name="mail" size={20} color={colors.info} />
            <Text style={styles.securityText}>
              Check your email for the OTP code
            </Text>
          </View>
          <View style={styles.securityItem}>
            <Ionicons name="lock-closed" size={20} color={colors.info} />
            <Text style={styles.securityText}>
              This is the final step to complete your withdrawal
            </Text>
          </View>
        </View>
      </View>

      {/* Verify Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.verifyButton,
            otp.length !== 6 && styles.disabledButton
          ]}
          onPress={handleVerifyOTP}
          disabled={otp.length !== 6 || isLoading}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.verifyButtonText}>Verifying...</Text>
            </View>
          ) : (
            <Text style={styles.verifyButtonText}>Verify OTP</Text>
          )}
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
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  transactionContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  transactionLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginBottom: 8,
  },
  transactionAmount: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  transactionBank: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  otpSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  otpTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  otpSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  emailText: {
    color: colors.primary,
    fontWeight: '500',
  },
  otpInputContainer: {
    marginBottom: 24,
  },
  otpInput: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: colors.border,
    minWidth: 200,
    ...shadows.small,
  },
  resendContainer: {
    alignItems: 'center',
  },
  resendText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500',
  },
  timerText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  securityCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    ...shadows.small,
  },
  securityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  securityText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 12,
    flex: 1,
  },
  buttonContainer: {
    padding: 20,
    backgroundColor: 'white',
    ...shadows.small,
  },
  verifyButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  verifyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: colors.border,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default WithdrawOTPScreen;
