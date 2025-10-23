import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@theme/theme';

interface RefreshBalanceModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (cardData: any) => void;
  cardId: string;
}

const RefreshBalanceModal: React.FC<RefreshBalanceModalProps> = ({
  visible,
  onClose,
  onConfirm,
  cardId,
}) => {
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardholderName: '',
  });
  const [showCvv, setShowCvv] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    let processedValue = value;

    // Format card number with spaces
    if (field === 'cardNumber') {
      const cleaned = value.replace(/\s/g, '');
      processedValue = cleaned.replace(/(.{4})/g, '$1 ').trim();
    }
    // Format expiry month (2 digits max)
    else if (field === 'expiryMonth') {
      processedValue = value.replace(/\D/g, '').slice(0, 2);
    }
    // Format expiry year (4 digits max)
    else if (field === 'expiryYear') {
      processedValue = value.replace(/\D/g, '').slice(0, 4);
    }
    // Format CVV (3-4 digits max)
    else if (field === 'cvv') {
      processedValue = value.replace(/\D/g, '').slice(0, 4);
    }

    setFormData(prev => ({ ...prev, [field]: processedValue }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Card number validation
    const cardNumber = formData.cardNumber.replace(/\s/g, '');
    if (!cardNumber) {
      newErrors.cardNumber = 'Card number is required';
    } else if (!/^\d{13,19}$/.test(cardNumber)) {
      newErrors.cardNumber = 'Card number must be 13-19 digits';
    } else if (!/^5[1-5]/.test(cardNumber) && !/^2[2-7]/.test(cardNumber)) {
      newErrors.cardNumber = 'Only Mastercard numbers are supported';
    }

    // Expiry month validation
    if (!formData.expiryMonth) {
      newErrors.expiryMonth = 'Expiry month is required';
    } else if (!/^(0[1-9]|1[0-2])$/.test(formData.expiryMonth)) {
      newErrors.expiryMonth = 'Invalid month (01-12)';
    }

    // Expiry year validation
    if (!formData.expiryYear) {
      newErrors.expiryYear = 'Expiry year is required';
    } else {
      const year = parseInt(formData.expiryYear);
      const currentYear = new Date().getFullYear();
      if (year < currentYear || year > currentYear + 20) {
        newErrors.expiryYear = 'Invalid year';
      }
    }

    // CVV validation
    if (!formData.cvv) {
      newErrors.cvv = 'CVV is required';
    } else if (!/^\d{3,4}$/.test(formData.cvv)) {
      newErrors.cvv = 'CVV must be 3-4 digits';
    }

    // Cardholder name validation
    if (!formData.cardholderName.trim()) {
      newErrors.cardholderName = 'Cardholder name is required';
    } else if (formData.cardholderName.trim().length < 2) {
      newErrors.cardholderName = 'Cardholder name must be at least 2 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onConfirm({
        cardNumber: formData.cardNumber.replace(/\s/g, ''),
        expiryMonth: formData.expiryMonth,
        expiryYear: formData.expiryYear,
        cvv: formData.cvv,
        cardholderName: formData.cardholderName.trim(),
      });
    }
  };

  const handleClose = () => {
    setFormData({
      cardNumber: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
      cardholderName: '',
    });
    setErrors({});
    setShowCvv(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Refresh Balance</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Info Alert */}
          <View style={styles.infoContainer}>
            <Ionicons name="information-circle" size={20} color={theme.colors.primary} />
            <Text style={styles.infoText}>
              Enter your Mastercard details to refresh your account balance. 
              This information is encrypted and securely transmitted.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Card Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Card Number</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="card" size={20} color={theme.colors.textSecondary} />
                <TextInput
                  style={styles.input}
                  value={formData.cardNumber}
                  onChangeText={(value) => handleInputChange('cardNumber', value)}
                  placeholder="1234 5678 9012 3456"
                  keyboardType="numeric"
                  maxLength={19}
                />
              </View>
              {errors.cardNumber && (
                <Text style={styles.errorText}>{errors.cardNumber}</Text>
              )}
            </View>

            {/* Expiry Date Row */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Expiry Month</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="calendar" size={20} color={theme.colors.textSecondary} />
                  <TextInput
                    style={styles.input}
                    value={formData.expiryMonth}
                    onChangeText={(value) => handleInputChange('expiryMonth', value)}
                    placeholder="12"
                    keyboardType="numeric"
                    maxLength={2}
                  />
                </View>
                {errors.expiryMonth && (
                  <Text style={styles.errorText}>{errors.expiryMonth}</Text>
                )}
              </View>

              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Expiry Year</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="calendar" size={20} color={theme.colors.textSecondary} />
                  <TextInput
                    style={styles.input}
                    value={formData.expiryYear}
                    onChangeText={(value) => handleInputChange('expiryYear', value)}
                    placeholder="2025"
                    keyboardType="numeric"
                    maxLength={4}
                  />
                </View>
                {errors.expiryYear && (
                  <Text style={styles.errorText}>{errors.expiryYear}</Text>
                )}
              </View>
            </View>

            {/* CVV */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>CVV</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="shield-checkmark" size={20} color={theme.colors.textSecondary} />
                <TextInput
                  style={styles.input}
                  value={formData.cvv}
                  onChangeText={(value) => handleInputChange('cvv', value)}
                  placeholder="123"
                  keyboardType="numeric"
                  secureTextEntry={!showCvv}
                  maxLength={4}
                />
                <TouchableOpacity
                  onPress={() => setShowCvv(!showCvv)}
                  style={styles.eyeButton}
                >
                  <Ionicons
                    name={showCvv ? 'eye-off' : 'eye'}
                    size={20}
                    color={theme.colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
              {errors.cvv && (
                <Text style={styles.errorText}>{errors.cvv}</Text>
              )}
            </View>

            {/* Cardholder Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Cardholder Name</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person" size={20} color={theme.colors.textSecondary} />
                <TextInput
                  style={styles.input}
                  value={formData.cardholderName}
                  onChangeText={(value) => handleInputChange('cardholderName', value)}
                  placeholder="John Doe"
                  autoCapitalize="words"
                />
              </View>
              {errors.cardholderName && (
                <Text style={styles.errorText}>{errors.cardholderName}</Text>
              )}
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.confirmButton,
              Object.values(errors).some(error => error !== '') && styles.disabledButton,
            ]}
            onPress={handleSubmit}
            disabled={Object.values(errors).some(error => error !== '')}
          >
            <Text style={styles.confirmButtonText}>Refresh Balance</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  placeholder: {
    width: 40,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: theme.colors.primaryLight,
    padding: 12,
    margin: 16,
    borderRadius: 8,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
    color: theme.colors.primary,
    flex: 1,
    lineHeight: 20,
  },
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
    marginLeft: 8,
  },
  eyeButton: {
    padding: 4,
  },
  errorText: {
    fontSize: 12,
    color: theme.colors.error,
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: theme.colors.textSecondary,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.white,
  },
});

export default RefreshBalanceModal;
