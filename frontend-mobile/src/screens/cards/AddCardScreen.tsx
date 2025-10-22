import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '@theme/colors';
import { formatCurrency } from '@utils/helpers';
import { validateCardNumber, validateExpiryDate, validateCVV } from '@utils/cardValidation';
import CardEncryption from '@utils/cardEncryption';

interface AddCardScreenProps {
  navigation: any;
}

const AddCardScreen: React.FC<AddCardScreenProps> = ({ navigation }) => {
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [cardType, setCardType] = useState<'visa' | 'mastercard' | 'amex' | 'discover' | null>(null);

  // Detect card type based on card number
  useEffect(() => {
    const number = formData.cardNumber.replace(/\s/g, '');
    if (number.startsWith('4')) {
      setCardType('visa');
    } else if (number.startsWith('5') || number.startsWith('2')) {
      setCardType('mastercard');
    } else if (number.startsWith('3')) {
      setCardType('amex');
    } else if (number.startsWith('6')) {
      setCardType('discover');
    } else {
      setCardType(null);
    }
  }, [formData.cardNumber]);

  const formatCardNumber = (text: string) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, '');
    // Add spaces every 4 digits
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
    return formatted;
  };

  const formatExpiryDate = (text: string) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, '');
    // Add slash after 2 digits
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  const handleInputChange = (field: string, value: string) => {
    let formattedValue = value;
    
    if (field === 'cardNumber') {
      formattedValue = formatCardNumber(value);
      if (formattedValue.replace(/\s/g, '').length > 19) return; // Max 19 digits
    } else if (field === 'expiryDate') {
      formattedValue = formatExpiryDate(value);
      if (formattedValue.length > 5) return; // MM/YY format
    } else if (field === 'cvv') {
      formattedValue = value.replace(/\D/g, '');
      if (formattedValue.length > 4) return; // Max 4 digits for Amex
    }

    setFormData(prev => ({ ...prev, [field]: formattedValue }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validate card number
    if (!formData.cardNumber.trim()) {
      newErrors.cardNumber = 'Card number is required';
    } else if (!validateCardNumber(formData.cardNumber)) {
      newErrors.cardNumber = 'Invalid card number';
    }

    // Validate expiry date
    if (!formData.expiryDate.trim()) {
      newErrors.expiryDate = 'Expiry date is required';
    } else if (!validateExpiryDate(formData.expiryDate)) {
      newErrors.expiryDate = 'Invalid expiry date';
    }

    // Validate CVV
    if (!formData.cvv.trim()) {
      newErrors.cvv = 'CVV is required';
    } else if (!validateCVV(formData.cvv, cardType)) {
      newErrors.cvv = 'Invalid CVV';
    }

    // Validate cardholder name
    if (!formData.cardholderName.trim()) {
      newErrors.cardholderName = 'Cardholder name is required';
    } else if (formData.cardholderName.trim().length < 2) {
      newErrors.cardholderName = 'Cardholder name must be at least 2 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors before proceeding');
      return;
    }

    setIsLoading(true);

    try {
      // Encrypt card data using triple encryption
      const encryptedCardData = CardEncryption.encryptCardData({
        cardNumber: formData.cardNumber.replace(/\s/g, ''), // Remove spaces
        expiryDate: formData.expiryDate,
        cvv: formData.cvv,
        cardholderName: formData.cardholderName,
      });

      // Generate secure token for this operation
      const secureToken = CardEncryption.generateSecureToken();

      // Simulate API call to initiate card addition with encrypted data
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Navigate to OTP verification screen with encrypted data
      navigation.navigate('OTPVerification', {
        encryptedCardData,
        secureToken,
        cardType,
        phoneNumber: '+234 801 234 5678', // This would come from user profile
        step: 'card_addition',
        // Keep original data for display purposes only
        displayData: {
          cardNumber: formData.cardNumber,
          expiryDate: formData.expiryDate,
          cardholderName: formData.cardholderName,
        },
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to encrypt and initiate card addition. Please try again.');
    } finally {
      setIsLoading(false);
    }
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

  const getCardIcon = () => {
    switch (cardType) {
      case 'visa':
        return 'card';
      case 'mastercard':
        return 'card';
      case 'amex':
        return 'card';
      case 'discover':
        return 'card';
      default:
        return 'card-outline';
    }
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
          <Text style={styles.headerTitle}>Add Card</Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <KeyboardAvoidingView 
        style={styles.content} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Dummy Card Template */}
          <View style={styles.cardSection}>
            <Text style={styles.sectionTitle}>Card Preview</Text>
            <LinearGradient
              colors={getCardGradient()}
              style={styles.cardTemplate}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.cardHeader}>
                <Ionicons name={getCardIcon()} size={24} color="white" />
                <Text style={styles.cardTypeText}>
                  {cardType ? cardType.toUpperCase() : 'CARD'}
                </Text>
              </View>
              
              <View style={styles.cardNumberContainer}>
                <Text style={styles.cardNumberText}>
                  {formData.cardNumber || '1234 5678 9012 3456'}
                </Text>
              </View>
              
              <View style={styles.cardFooter}>
                <View>
                  <Text style={styles.cardLabel}>CARDHOLDER</Text>
                  <Text style={styles.cardholderText}>
                    {formData.cardholderName || 'JOHN DOE'}
                  </Text>
                </View>
                <View style={styles.cardExpiry}>
                  <Text style={styles.cardLabel}>EXPIRES</Text>
                  <Text style={styles.cardExpiryText}>
                    {formData.expiryDate || '12/26'}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Card Details</Text>
            
            {/* Card Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Card Number</Text>
              <View style={[styles.inputContainer, errors.cardNumber && styles.inputError]}>
                <Ionicons name="card-outline" size={20} color={colors.textSecondary} />
                <TextInput
                  style={styles.input}
                  placeholder="1234 5678 9012 3456"
                  placeholderTextColor={colors.textSecondary}
                  value={formData.cardNumber}
                  onChangeText={(value) => handleInputChange('cardNumber', value)}
                  keyboardType="numeric"
                  maxLength={23} // 19 digits + 4 spaces
                />
              </View>
              {errors.cardNumber && <Text style={styles.errorText}>{errors.cardNumber}</Text>}
            </View>

            {/* Cardholder Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Cardholder Name</Text>
              <View style={[styles.inputContainer, errors.cardholderName && styles.inputError]}>
                <Ionicons name="person-outline" size={20} color={colors.textSecondary} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter cardholder name"
                  placeholderTextColor={colors.textSecondary}
                  value={formData.cardholderName}
                  onChangeText={(value) => handleInputChange('cardholderName', value)}
                  autoCapitalize="words"
                />
              </View>
              {errors.cardholderName && <Text style={styles.errorText}>{errors.cardholderName}</Text>}
            </View>

            {/* Expiry Date and CVV */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.inputLabel}>Expiry Date</Text>
                <View style={[styles.inputContainer, errors.expiryDate && styles.inputError]}>
                  <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
                  <TextInput
                    style={styles.input}
                    placeholder="MM/YY"
                    placeholderTextColor={colors.textSecondary}
                    value={formData.expiryDate}
                    onChangeText={(value) => handleInputChange('expiryDate', value)}
                    keyboardType="numeric"
                    maxLength={5}
                  />
                </View>
                {errors.expiryDate && <Text style={styles.errorText}>{errors.expiryDate}</Text>}
              </View>

              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.inputLabel}>CVV</Text>
                <View style={[styles.inputContainer, errors.cvv && styles.inputError]}>
                  <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} />
                  <TextInput
                    style={styles.input}
                    placeholder="123"
                    placeholderTextColor={colors.textSecondary}
                    value={formData.cvv}
                    onChangeText={(value) => handleInputChange('cvv', value)}
                    keyboardType="numeric"
                    maxLength={4}
                    secureTextEntry
                  />
                </View>
                {errors.cvv && <Text style={styles.errorText}>{errors.cvv}</Text>}
              </View>
            </View>

            {/* Fee Information */}
            <View style={styles.feeInfo}>
              <View style={styles.feeRow}>
                <Text style={styles.feeLabel}>Card Addition Fee</Text>
                <Text style={styles.feeAmount}>{formatCurrency(50)}</Text>
              </View>
              <Text style={styles.feeDescription}>
                A one-time fee will be charged to verify and add your card securely.
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Submit Button */}
        <View style={styles.submitContainer}>
          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <LinearGradient
              colors={isLoading ? [colors.textSecondary, colors.textSecondary] : [colors.secondary, colors.secondaryLight]}
              style={styles.submitGradient}
            >
              <Text style={styles.submitButtonText}>
                {isLoading ? 'Processing...' : 'Add Card'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  cardSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 15,
  },
  cardTemplate: {
    height: 200,
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
  formSection: {
    marginTop: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.card,
  },
  inputError: {
    borderColor: colors.error,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  feeInfo: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: 12,
    padding: 16,
    marginTop: 10,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  feeLabel: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  feeAmount: {
    fontSize: 16,
    color: colors.secondary,
    fontWeight: 'bold',
  },
  feeDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  submitContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 30,
  },
  submitButton: {
    borderRadius: 12,
    overflow: 'hidden',
    ...shadows.large,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddCardScreen;
