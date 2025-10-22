import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '@theme/colors';
import * as LocalAuthentication from 'expo-local-authentication';

interface BiometricSettingsScreenProps {
  navigation: any;
}

interface BiometricCapabilities {
  hasHardware: boolean;
  isEnrolled: boolean;
  supportedTypes: string[];
}

const BiometricSettingsScreen: React.FC<BiometricSettingsScreenProps> = ({ navigation }) => {
  const [biometricLogin, setBiometricLogin] = useState(false);
  const [biometricTransaction, setBiometricTransaction] = useState(false);
  const [biometricCapabilities, setBiometricCapabilities] = useState<BiometricCapabilities>({
    hasHardware: false,
    isEnrolled: false,
    supportedTypes: [],
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkBiometricCapabilities();
    loadBiometricSettings();
  }, []);

  const checkBiometricCapabilities = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      
      setBiometricCapabilities({
        hasHardware,
        isEnrolled,
        supportedTypes: supportedTypes.map(type => {
          switch (type) {
            case LocalAuthentication.AuthenticationType.FINGERPRINT:
              return 'Fingerprint';
            case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
              return 'Face ID';
            case LocalAuthentication.AuthenticationType.IRIS:
              return 'Iris';
            default:
              return 'Unknown';
          }
        }),
      });
    } catch (error) {
      console.error('Error checking biometric capabilities:', error);
    }
  };

  const loadBiometricSettings = () => {
    // In a real app, load from secure storage or user preferences
    setBiometricLogin(false);
    setBiometricTransaction(false);
  };

  const handleBiometricLoginToggle = async (value: boolean) => {
    if (!biometricCapabilities.hasHardware || !biometricCapabilities.isEnrolled) {
      Alert.alert(
        'Biometric Not Available',
        'Biometric authentication is not available on this device or not set up.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (value) {
      // Test biometric authentication before enabling
      const result = await testBiometricAuthentication();
      if (result.success) {
        setBiometricLogin(value);
        // In a real app, save to secure storage
        Alert.alert('Success', 'Biometric login has been enabled.');
      } else {
        Alert.alert('Authentication Failed', result.error || 'Biometric authentication failed.');
      }
    } else {
      setBiometricLogin(value);
      Alert.alert('Disabled', 'Biometric login has been disabled.');
    }
  };

  const handleBiometricTransactionToggle = async (value: boolean) => {
    if (!biometricCapabilities.hasHardware || !biometricCapabilities.isEnrolled) {
      Alert.alert(
        'Biometric Not Available',
        'Biometric authentication is not available on this device or not set up.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (value) {
      // Test biometric authentication before enabling
      const result = await testBiometricAuthentication();
      if (result.success) {
        setBiometricTransaction(value);
        // In a real app, save to secure storage
        Alert.alert('Success', 'Biometric transactions have been enabled.');
      } else {
        Alert.alert('Authentication Failed', result.error || 'Biometric authentication failed.');
      }
    } else {
      setBiometricTransaction(value);
      Alert.alert('Disabled', 'Biometric transactions have been disabled.');
    }
  };

  const testBiometricAuthentication = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to enable biometric settings',
        fallbackLabel: 'Use PIN',
        disableDeviceFallback: false,
      });

      return {
        success: result.success,
        error: result.success ? undefined : 'Authentication was cancelled or failed',
      };
    } catch (error) {
      return {
        success: false,
        error: 'Biometric authentication error',
      };
    }
  };

  const handleTestBiometric = async () => {
    setIsLoading(true);
    
    try {
      const result = await testBiometricAuthentication();
      
      if (result.success) {
        Alert.alert('Success', 'Biometric authentication is working correctly!');
      } else {
        Alert.alert('Failed', result.error || 'Biometric authentication failed.');
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to test biometric authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  const getBiometricIcon = () => {
    if (biometricCapabilities.supportedTypes.includes('Face ID')) {
      return 'face-recognition';
    } else if (biometricCapabilities.supportedTypes.includes('Fingerprint')) {
      return 'finger-print';
    } else {
      return 'shield-checkmark';
    }
  };

  const getBiometricType = () => {
    if (biometricCapabilities.supportedTypes.includes('Face ID')) {
      return 'Face ID';
    } else if (biometricCapabilities.supportedTypes.includes('Fingerprint')) {
      return 'Fingerprint';
    } else {
      return 'Biometric';
    }
  };

  const isBiometricAvailable = biometricCapabilities.hasHardware && biometricCapabilities.isEnrolled;

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
          <Text style={styles.headerTitle}>Biometric Settings</Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      {/* Content */}
      <View style={styles.content}>
        {/* Biometric Status */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Ionicons 
              name={getBiometricIcon()} 
              size={32} 
              color={isBiometricAvailable ? colors.success : colors.warning} 
            />
            <Text style={styles.statusTitle}>
              {getBiometricType()} Status
            </Text>
          </View>
          
          <Text style={[
            styles.statusText,
            { color: isBiometricAvailable ? colors.success : colors.warning }
          ]}>
            {isBiometricAvailable ? 'Available and Ready' : 'Not Available'}
          </Text>
          
          {biometricCapabilities.supportedTypes.length > 0 && (
            <Text style={styles.supportedTypes}>
              Supported: {biometricCapabilities.supportedTypes.join(', ')}
            </Text>
          )}
        </View>

        {/* Biometric Login */}
        <View style={styles.settingCard}>
          <View style={styles.settingHeader}>
            <View style={styles.settingIcon}>
              <Ionicons name="log-in" size={24} color={colors.primary} />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Biometric Login</Text>
              <Text style={styles.settingSubtitle}>
                Use {getBiometricType().toLowerCase()} to log into your account
              </Text>
            </View>
            <Switch
              value={biometricLogin}
              onValueChange={handleBiometricLoginToggle}
              disabled={!isBiometricAvailable}
              trackColor={{ false: colors.border, true: colors.primary + '40' }}
              thumbColor={biometricLogin ? colors.primary : colors.textSecondary}
            />
          </View>
        </View>

        {/* Biometric Transactions */}
        <View style={styles.settingCard}>
          <View style={styles.settingHeader}>
            <View style={styles.settingIcon}>
              <Ionicons name="card" size={24} color={colors.primary} />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Biometric Transactions</Text>
              <Text style={styles.settingSubtitle}>
                Use {getBiometricType().toLowerCase()} for payments and transfers
              </Text>
            </View>
            <Switch
              value={biometricTransaction}
              onValueChange={handleBiometricTransactionToggle}
              disabled={!isBiometricAvailable}
              trackColor={{ false: colors.border, true: colors.primary + '40' }}
              thumbColor={biometricTransaction ? colors.primary : colors.textSecondary}
            />
          </View>
        </View>

        {/* Test Biometric */}
        {isBiometricAvailable && (
          <TouchableOpacity
            style={styles.testButton}
            onPress={handleTestBiometric}
            disabled={isLoading}
          >
            <Ionicons name="checkmark-circle" size={20} color="white" />
            <Text style={styles.testButtonText}>
              {isLoading ? 'Testing...' : 'Test Biometric Authentication'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Information Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>About Biometric Authentication</Text>
          
          <View style={styles.infoItem}>
            <Ionicons name="shield-checkmark" size={16} color={colors.success} />
            <Text style={styles.infoText}>
              Your biometric data never leaves your device
            </Text>
          </View>
          
          <View style={styles.infoItem}>
            <Ionicons name="lock-closed" size={16} color={colors.info} />
            <Text style={styles.infoText}>
              More secure than traditional passwords
            </Text>
          </View>
          
          <View style={styles.infoItem}>
            <Ionicons name="flash" size={16} color={colors.info} />
            <Text style={styles.infoText}>
              Faster and more convenient than typing PINs
            </Text>
          </View>
          
          <View style={styles.infoItem}>
            <Ionicons name="warning" size={16} color={colors.warning} />
            <Text style={styles.infoText}>
              You can always fall back to PIN if biometric fails
            </Text>
          </View>
        </View>

        {/* Setup Instructions */}
        {!isBiometricAvailable && (
          <View style={styles.setupCard}>
            <Text style={styles.setupTitle}>Setup Required</Text>
            <Text style={styles.setupText}>
              To use biometric authentication, you need to:
            </Text>
            <Text style={styles.setupStep}>1. Set up {getBiometricType()} in your device settings</Text>
            <Text style={styles.setupStep}>2. Enroll your biometric data</Text>
            <Text style={styles.setupStep}>3. Return to this screen to enable the features</Text>
          </View>
        )}
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  statusCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    ...shadows.small,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginLeft: 12,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  supportedTypes: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  settingCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...shadows.small,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  testButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    ...shadows.small,
  },
  testButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    ...shadows.small,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 12,
    flex: 1,
  },
  setupCard: {
    backgroundColor: colors.warning + '20',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.warning + '40',
  },
  setupTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.warning,
    marginBottom: 8,
  },
  setupText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  setupStep: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
    marginLeft: 8,
  },
});

export default BiometricSettingsScreen;
