import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@theme/colors';
import * as LocalAuthentication from 'expo-local-authentication';

export interface BiometricAuthResult {
  success: boolean;
  error?: string;
  biometryType?: string;
}

export interface BiometricCapabilities {
  isAvailable: boolean;
  biometryType: string;
  isEnrolled: boolean;
}

class BiometricAuthService {
  private static instance: BiometricAuthService;
  
  public static getInstance(): BiometricAuthService {
    if (!BiometricAuthService.instance) {
      BiometricAuthService.instance = new BiometricAuthService();
    }
    return BiometricAuthService.instance;
  }

  /**
   * Check if biometric authentication is available on the device
   */
  async checkBiometricAvailability(): Promise<BiometricCapabilities> {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const biometryType = await LocalAuthentication.supportedAuthenticationTypesAsync();
      
      let biometryTypeString = 'none';
      if (biometryType.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        biometryTypeString = 'face';
      } else if (biometryType.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        biometryTypeString = 'fingerprint';
      } else if (biometryType.includes(LocalAuthentication.AuthenticationType.IRIS)) {
        biometryTypeString = 'iris';
      }

      return {
        isAvailable: hasHardware && isEnrolled,
        biometryType: biometryTypeString,
        isEnrolled,
      };
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      return {
        isAvailable: false,
        biometryType: 'none',
        isEnrolled: false,
      };
    }
  }

  /**
   * Authenticate using biometrics
   */
  async authenticate(reason: string = 'Authenticate to continue'): Promise<BiometricAuthResult> {
    try {
      const capabilities = await this.checkBiometricAvailability();
      
      if (!capabilities.isAvailable) {
        return {
          success: false,
          error: 'Biometric authentication is not available on this device',
        };
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: reason,
        cancelLabel: 'Cancel',
        fallbackLabel: 'Use PIN',
        disableDeviceFallback: false,
      });

      if (result.success) {
        return {
          success: true,
          biometryType: capabilities.biometryType,
        };
      } else {
        return {
          success: false,
          error: result.error || 'Authentication failed',
        };
      }
    } catch (error) {
      console.error('Biometric authentication error:', error);
      return {
        success: false,
        error: 'Authentication failed. Please try again.',
      };
    }
  }

  /**
   * Authenticate for sensitive operations (transactions, etc.)
   */
  async authenticateForTransaction(amount?: number): Promise<BiometricAuthResult> {
    const reason = amount 
      ? `Authenticate to send ₦${amount.toLocaleString()}`
      : 'Authenticate to complete this transaction';
    
    return this.authenticate(reason);
  }

  /**
   * Authenticate for app login
   */
  async authenticateForLogin(): Promise<BiometricAuthResult> {
    return this.authenticate('Authenticate to access your MalPay account');
  }

  /**
   * Authenticate for card addition
   */
  async authenticateForCardAddition(): Promise<BiometricAuthResult> {
    return this.authenticate('Authenticate to add a new card');
  }

  /**
   * Get biometric icon based on type
   */
  getBiometricIcon(biometryType: string): string {
    switch (biometryType) {
      case 'face':
        return Platform.OS === 'ios' ? 'face-id' : 'face-recognition';
      case 'fingerprint':
        return 'finger-print';
      case 'iris':
        return 'eye';
      default:
        return 'shield-checkmark';
    }
  }

  /**
   * Get biometric display name
   */
  getBiometricDisplayName(biometryType: string): string {
    switch (biometryType) {
      case 'face':
        return Platform.OS === 'ios' ? 'Face ID' : 'Face Recognition';
      case 'fingerprint':
        return 'Fingerprint';
      case 'iris':
        return 'Iris Scan';
      default:
        return 'Biometric';
    }
  }
}

export default BiometricAuthService;

// React Hook for Biometric Authentication
export const useBiometricAuth = () => {
  const [capabilities, setCapabilities] = useState<BiometricCapabilities>({
    isAvailable: false,
    biometryType: 'none',
    isEnrolled: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkAvailability();
  }, []);

  const checkAvailability = async () => {
    try {
      const authService = BiometricAuthService.getInstance();
      const caps = await authService.checkBiometricAvailability();
      setCapabilities(caps);
    } catch (error) {
      console.error('Error checking biometric capabilities:', error);
    }
  };

  const authenticate = async (reason?: string): Promise<BiometricAuthResult> => {
    setIsLoading(true);
    try {
      const authService = BiometricAuthService.getInstance();
      const result = await authService.authenticate(reason);
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const authenticateForTransaction = async (amount?: number): Promise<BiometricAuthResult> => {
    setIsLoading(true);
    try {
      const authService = BiometricAuthService.getInstance();
      const result = await authService.authenticateForTransaction(amount);
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const authenticateForLogin = async (): Promise<BiometricAuthResult> => {
    setIsLoading(true);
    try {
      const authService = BiometricAuthService.getInstance();
      const result = await authService.authenticateForLogin();
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const authenticateForCardAddition = async (): Promise<BiometricAuthResult> => {
    setIsLoading(true);
    try {
      const authService = BiometricAuthService.getInstance();
      const result = await authService.authenticateForCardAddition();
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    capabilities,
    isLoading,
    authenticate,
    authenticateForTransaction,
    authenticateForLogin,
    authenticateForCardAddition,
    checkAvailability,
  };
};

// Biometric Setup Component
interface BiometricSetupProps {
  onSetupComplete: (enabled: boolean) => void;
  onCancel: () => void;
}

export const BiometricSetup: React.FC<BiometricSetupProps> = ({
  onSetupComplete,
  onCancel,
}) => {
  const { capabilities, authenticateForLogin } = useBiometricAuth();

  const handleEnableBiometric = async () => {
    const result = await authenticateForLogin();
    
    if (result.success) {
      onSetupComplete(true);
      Alert.alert(
        'Biometric Authentication Enabled',
        `${BiometricAuthService.getInstance().getBiometricDisplayName(capabilities.biometryType)} has been enabled for your MalPay account.`,
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert(
        'Setup Failed',
        result.error || 'Failed to enable biometric authentication. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  if (!capabilities.isAvailable) {
    return (
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <Ionicons name="shield-outline" size={64} color={colors.textSecondary} />
        </View>
        <Text style={styles.title}>Biometric Authentication Not Available</Text>
        <Text style={styles.description}>
          Your device doesn't support biometric authentication or it's not set up.
        </Text>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Continue Without Biometric</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons 
          name={BiometricAuthService.getInstance().getBiometricIcon(capabilities.biometryType)} 
          size={64} 
          color={colors.primary} 
        />
      </View>
      <Text style={styles.title}>
        Enable {BiometricAuthService.getInstance().getBiometricDisplayName(capabilities.biometryType)}
      </Text>
      <Text style={styles.description}>
        Use {BiometricAuthService.getInstance().getBiometricDisplayName(capabilities.biometryType)} to quickly and securely access your MalPay account and authorize transactions.
      </Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.enableButton} onPress={handleEnableBiometric}>
          <Text style={styles.enableButtonText}>
            Enable {BiometricAuthService.getInstance().getBiometricDisplayName(capabilities.biometryType)}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Skip for Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.background,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  buttonContainer: {
    width: '100%',
  },
  enableButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  enableButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});
