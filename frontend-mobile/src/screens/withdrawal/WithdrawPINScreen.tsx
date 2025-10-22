import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '@theme/colors';
import { formatCurrency } from '@utils/helpers';
import * as LocalAuthentication from 'expo-local-authentication';

interface WithdrawPINScreenProps {
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

const WithdrawPINScreen: React.FC<WithdrawPINScreenProps> = ({ navigation, route }) => {
  const { amount, bankAccount } = route.params;
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState('');

  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      
      if (hasHardware && isEnrolled) {
        setBiometricAvailable(true);
        if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
          setBiometricType('Face ID');
        } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
          setBiometricType('Fingerprint');
        } else {
          setBiometricType('Biometric');
        }
      }
    } catch (error) {
      console.error('Error checking biometric availability:', error);
    }
  };

  const handlePinChange = (value: string) => {
    // Only allow numeric input and limit to 4 digits
    const cleanValue = value.replace(/[^0-9]/g, '').slice(0, 4);
    setPin(cleanValue);
  };

  const handleContinue = async () => {
    if (pin.length !== 4) {
      Alert.alert('Invalid PIN', 'Please enter a 4-digit PIN.');
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate PIN verification
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real app, verify PIN with backend
      if (pin === '1234') { // Mock PIN for testing
        navigation.navigate('WithdrawOTP', {
          amount,
          bankAccount,
        });
      } else {
        Alert.alert('Invalid PIN', 'The PIN you entered is incorrect. Please try again.');
        setPin('');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to verify PIN. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricAuth = async () => {
    if (!biometricAvailable) {
      Alert.alert('Biometric Not Available', 'Biometric authentication is not available.');
      return;
    }

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to continue withdrawal',
        fallbackLabel: 'Use PIN',
        disableDeviceFallback: false,
      });

      if (result.success) {
        // Biometric authentication successful, proceed to next step
        navigation.navigate('WithdrawOTP', {
          amount,
          bankAccount,
        });
      } else {
        Alert.alert('Authentication Failed', 'Biometric authentication was cancelled or failed.');
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to authenticate with biometrics.');
    }
  };

  const handleForgotPIN = () => {
    Alert.alert(
      'Forgot PIN?',
      'You can reset your PIN in Settings > Security.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Go to Settings', onPress: () => navigation.navigate('Settings', { screen: 'Security' }) },
      ]
    );
  };

  const renderPinDot = (index: number) => (
    <View
      key={index}
      style={[
        styles.pinDot,
        index < pin.length && styles.pinDotFilled,
      ]}
    />
  );

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
          <Text style={styles.headerTitle}>Enter PIN</Text>
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
        <View style={styles.pinSection}>
          <Text style={styles.pinTitle}>Enter your PIN</Text>
          <Text style={styles.pinSubtitle}>
            Enter your 4-digit PIN to authorize this withdrawal
          </Text>
          
          <View style={styles.pinContainer}>
            {Array.from({ length: 4 }, (_, index) => renderPinDot(index))}
          </View>
          
          {/* Hidden PIN Input */}
          <TextInput
            style={styles.hiddenInput}
            value={pin}
            onChangeText={handlePinChange}
            keyboardType="numeric"
            maxLength={4}
            autoFocus
            secureTextEntry
          />
        </View>

        {/* Security Info */}
        <View style={styles.securityCard}>
          <View style={styles.securityItem}>
            <Ionicons name="shield-checkmark" size={20} color={colors.success} />
            <Text style={styles.securityText}>
              Your PIN is encrypted and secure
            </Text>
          </View>
          <View style={styles.securityItem}>
            <Ionicons name="lock-closed" size={20} color={colors.info} />
            <Text style={styles.securityText}>
              This transaction is protected by PIN verification
            </Text>
          </View>
        </View>

        {/* Forgot PIN */}
        <TouchableOpacity style={styles.forgotPinButton} onPress={handleForgotPIN}>
          <Text style={styles.forgotPinText}>Forgot your PIN?</Text>
        </TouchableOpacity>

        {/* Biometric Authentication */}
        {biometricAvailable && (
          <TouchableOpacity
            style={styles.biometricButton}
            onPress={handleBiometricAuth}
          >
            <Ionicons 
              name={biometricType === 'Face ID' ? 'face-recognition' : 'finger-print'} 
              size={24} 
              color={colors.primary} 
            />
            <Text style={styles.biometricButtonText}>
              Use {biometricType} Instead
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Continue Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            pin.length !== 4 && styles.disabledButton
          ]}
          onPress={handleContinue}
          disabled={pin.length !== 4 || isLoading}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.continueButtonText}>Verifying...</Text>
            </View>
          ) : (
            <Text style={styles.continueButtonText}>Continue</Text>
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
  pinSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  pinTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  pinSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 40,
  },
  pinContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  pinDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    marginHorizontal: 12,
    backgroundColor: 'transparent',
  },
  pinDotFilled: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 0,
    height: 0,
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
  forgotPinButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  forgotPinText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500',
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.primary,
    ...shadows.small,
  },
  biometricButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.primary,
    marginLeft: 8,
  },
  buttonContainer: {
    padding: 20,
    backgroundColor: 'white',
    ...shadows.small,
  },
  continueButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  continueButtonText: {
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

export default WithdrawPINScreen;
