import React, { useState } from 'react';
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

interface TransactionPINSetupScreenProps {
  navigation: any;
}

const TransactionPINSetupScreen: React.FC<TransactionPINSetupScreenProps> = ({ navigation }) => {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'create' | 'confirm'>('create');

  const handlePinChange = (value: string) => {
    // Only allow numeric input and limit to 4 digits
    const cleanValue = value.replace(/[^0-9]/g, '').slice(0, 4);
    
    if (step === 'create') {
      setPin(cleanValue);
    } else {
      setConfirmPin(cleanValue);
    }
  };

  const handleCreatePIN = () => {
    if (pin.length !== 4) {
      Alert.alert('Invalid PIN', 'Please enter a 4-digit PIN.');
      return;
    }

    // Check for weak PINs
    if (pin === '0000' || pin === '1111' || pin === '1234' || pin === '4321') {
      Alert.alert(
        'Weak PIN',
        'Please choose a stronger PIN. Avoid common patterns like 0000, 1111, 1234, etc.',
        [{ text: 'OK' }]
      );
      return;
    }

    setStep('confirm');
  };

  const handleConfirmPIN = async () => {
    if (confirmPin.length !== 4) {
      Alert.alert('Invalid PIN', 'Please enter a 4-digit PIN.');
      return;
    }

    if (pin !== confirmPin) {
      Alert.alert('PIN Mismatch', 'The PINs do not match. Please try again.');
      setConfirmPin('');
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate PIN creation API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'PIN Created Successfully',
        'Your transaction PIN has been set up successfully. You can now use it for secure transactions.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create PIN. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'confirm') {
      setStep('create');
      setConfirmPin('');
    } else {
      navigation.goBack();
    }
  };

  const renderPinDot = (index: number, currentPin: string) => (
    <View
      key={index}
      style={[
        styles.pinDot,
        index < currentPin.length && styles.pinDotFilled,
      ]}
    />
  );

  const getStepTitle = () => {
    return step === 'create' ? 'Create Transaction PIN' : 'Confirm Transaction PIN';
  };

  const getStepSubtitle = () => {
    return step === 'create' 
      ? 'Create a 4-digit PIN for secure transactions'
      : 'Re-enter your PIN to confirm';
  };

  const getCurrentPin = () => {
    return step === 'create' ? pin : confirmPin;
  };

  const isPinComplete = () => {
    return getCurrentPin().length === 4;
  };

  const handleContinue = () => {
    if (step === 'create') {
      handleCreatePIN();
    } else {
      handleConfirmPIN();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      {/* Header */}
      <LinearGradient colors={[colors.primary, colors.primaryLight]} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{getStepTitle()}</Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.pinSection}>
          <View style={styles.iconContainer}>
            <Ionicons 
              name={step === 'create' ? 'lock-closed' : 'checkmark-circle'} 
              size={48} 
              color={colors.primary} 
            />
          </View>
          
          <Text style={styles.pinTitle}>{getStepTitle()}</Text>
          <Text style={styles.pinSubtitle}>{getStepSubtitle()}</Text>
          
          <View style={styles.pinContainer}>
            {Array.from({ length: 4 }, (_, index) => renderPinDot(index, getCurrentPin()))}
          </View>
          
          {/* Hidden PIN Input */}
          <TextInput
            style={styles.hiddenInput}
            value={getCurrentPin()}
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
              Your PIN is encrypted and stored securely
            </Text>
          </View>
          <View style={styles.securityItem}>
            <Ionicons name="lock-closed" size={20} color={colors.info} />
            <Text style={styles.securityText}>
              Required for all transactions and sensitive operations
            </Text>
          </View>
          <View style={styles.securityItem}>
            <Ionicons name="warning" size={20} color={colors.warning} />
            <Text style={styles.securityText}>
              Choose a PIN that's easy to remember but hard to guess
            </Text>
          </View>
        </View>

        {/* PIN Tips */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>PIN Tips:</Text>
          <Text style={styles.tipText}>• Use 4 different digits</Text>
          <Text style={styles.tipText}>• Avoid sequential numbers (1234)</Text>
          <Text style={styles.tipText}>• Avoid repeated numbers (1111)</Text>
          <Text style={styles.tipText}>• Don't use your birth year</Text>
        </View>
      </View>

      {/* Continue Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            !isPinComplete() && styles.disabledButton
          ]}
          onPress={handleContinue}
          disabled={!isPinComplete() || isLoading}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.continueButtonText}>Setting up PIN...</Text>
            </View>
          ) : (
            <Text style={styles.continueButtonText}>
              {step === 'create' ? 'Continue' : 'Confirm PIN'}
            </Text>
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
    paddingTop: 40,
  },
  pinSection: {
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
    marginBottom: 20,
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
  tipsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    ...shadows.small,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
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

export default TransactionPINSetupScreen;
