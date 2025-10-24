import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const ProfileSetupScreen: React.FC = () => {
  const navigation = useNavigation();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [showCardModal, setShowCardModal] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);

  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardholderName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardType: 'visa',
  });

  const [bankData, setBankData] = useState({
    accountName: '',
    accountNumber: '',
    bankName: '',
    bankCode: '',
  });

  const [profileData, setProfileData] = useState({
    firstName: 'Tanjiro',
    lastName: 'Kamado',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
  });

  const steps = [
    {
      label: 'Personal Information',
      description: 'Complete your basic profile details',
      icon: 'person-outline',
    },
    {
      label: 'Add Payment Card',
      description: 'Add a credit or debit card for payments',
      icon: 'card-outline',
    },
    {
      label: 'Add Bank Account',
      description: 'Link your bank account for withdrawals',
      icon: 'business-outline',
    },
    {
      label: 'Security Setup',
      description: 'Set up PIN and security preferences',
      icon: 'shield-outline',
    },
  ];

  const nigerianBanks = [
    { name: 'Access Bank', code: '044' },
    { name: 'Citibank Nigeria', code: '023' },
    { name: 'Diamond Bank', code: '063' },
    { name: 'Ecobank Nigeria', code: '050' },
    { name: 'Fidelity Bank', code: '070' },
    { name: 'First Bank of Nigeria', code: '011' },
    { name: 'First City Monument Bank', code: '214' },
    { name: 'Guaranty Trust Bank', code: '058' },
    { name: 'Heritage Bank', code: '030' },
    { name: 'Keystone Bank', code: '082' },
    { name: 'Kuda Bank', code: '50211' },
    { name: 'Opay', code: '100032' },
    { name: 'PalmPay', code: '999991' },
    { name: 'Polaris Bank', code: '076' },
    { name: 'Providus Bank', code: '101' },
    { name: 'Stanbic IBTC Bank', code: '221' },
    { name: 'Standard Chartered Bank', code: '068' },
    { name: 'Sterling Bank', code: '232' },
    { name: 'Suntrust Bank', code: '100' },
    { name: 'Union Bank of Nigeria', code: '032' },
    { name: 'United Bank for Africa', code: '033' },
    { name: 'Unity Bank', code: '215' },
    { name: 'VFD Microfinance Bank', code: '566' },
    { name: 'Wema Bank', code: '035' },
    { name: 'Zenith Bank', code: '057' },
  ];

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Success',
        'Profile setup completed successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Dashboard' as never),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to complete profile setup. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStepComplete = (stepIndex: number) => {
    if (!completedSteps.includes(stepIndex)) {
      setCompletedSteps([...completedSteps, stepIndex]);
    }
  };

  const handleCardSubmit = () => {
    console.log('Card data:', cardData);
    handleStepComplete(1);
    setShowCardModal(false);
    Alert.alert('Success', 'Card added successfully!');
  };

  const handleBankSubmit = () => {
    console.log('Bank data:', bankData);
    handleStepComplete(2);
    setShowBankModal(false);
    Alert.alert('Success', 'Bank account added successfully!');
  };

  const renderStepContent = (stepIndex: number) => {
    switch (stepIndex) {
      case 0:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Personal Information</Text>
            
            <View style={styles.inputRow}>
              <View style={styles.inputHalf}>
                <Text style={styles.inputLabel}>First Name</Text>
                <TextInput
                  style={styles.input}
                  value={profileData.firstName}
                  onChangeText={(value) => setProfileData({ ...profileData, firstName: value })}
                  placeholder="Enter first name"
                />
              </View>
              <View style={styles.inputHalf}>
                <Text style={styles.inputLabel}>Last Name</Text>
                <TextInput
                  style={styles.input}
                  value={profileData.lastName}
                  onChangeText={(value) => setProfileData({ ...profileData, lastName: value })}
                  placeholder="Enter last name"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <View style={styles.inputWithIcon}>
                <Ionicons name="call-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={profileData.phone}
                  onChangeText={(value) => setProfileData({ ...profileData, phone: value })}
                  placeholder="Enter phone number"
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Address</Text>
              <View style={styles.inputWithIcon}>
                <Ionicons name="location-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={profileData.address}
                  onChangeText={(value) => setProfileData({ ...profileData, address: value })}
                  placeholder="Enter address"
                />
              </View>
            </View>

            <View style={styles.inputRow}>
              <View style={styles.inputThird}>
                <Text style={styles.inputLabel}>City</Text>
                <TextInput
                  style={styles.input}
                  value={profileData.city}
                  onChangeText={(value) => setProfileData({ ...profileData, city: value })}
                  placeholder="City"
                />
              </View>
              <View style={styles.inputThird}>
                <Text style={styles.inputLabel}>State</Text>
                <TextInput
                  style={styles.input}
                  value={profileData.state}
                  onChangeText={(value) => setProfileData({ ...profileData, state: value })}
                  placeholder="State"
                />
              </View>
              <View style={styles.inputThird}>
                <Text style={styles.inputLabel}>ZIP Code</Text>
                <TextInput
                  style={styles.input}
                  value={profileData.zipCode}
                  onChangeText={(value) => setProfileData({ ...profileData, zipCode: value })}
                  placeholder="ZIP"
                />
              </View>
            </View>

            <View style={styles.infoBox}>
              <Ionicons name="information-circle-outline" size={20} color="#1976d2" />
              <Text style={styles.infoText}>
                This information is required for identity verification and compliance with financial regulations.
              </Text>
            </View>
          </View>
        );

      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Add Payment Card</Text>
            <Text style={styles.stepDescription}>
              Add a credit or debit card to enable payments and transactions.
            </Text>

            <View style={styles.emptyState}>
              <Ionicons name="card-outline" size={48} color="#666" />
              <Text style={styles.emptyStateTitle}>No cards added yet</Text>
              <Text style={styles.emptyStateDescription}>
                Add your first card to start making payments
              </Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setShowCardModal(true)}
              >
                <Ionicons name="add" size={20} color="white" />
                <Text style={styles.addButtonText}>Add Card</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.warningBox}>
              <Ionicons name="warning-outline" size={20} color="#f57c00" />
              <Text style={styles.warningText}>
                You need to add at least one card to complete your profile setup.
              </Text>
            </View>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Add Bank Account</Text>
            <Text style={styles.stepDescription}>
              Link your bank account to enable withdrawals and transfers.
            </Text>

            <View style={styles.emptyState}>
              <Ionicons name="business-outline" size={48} color="#666" />
              <Text style={styles.emptyStateTitle}>No bank accounts added yet</Text>
              <Text style={styles.emptyStateDescription}>
                Add your bank account to enable withdrawals
              </Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setShowBankModal(true)}
              >
                <Ionicons name="add" size={20} color="white" />
                <Text style={styles.addButtonText}>Add Bank Account</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.warningBox}>
              <Ionicons name="warning-outline" size={20} color="#f57c00" />
              <Text style={styles.warningText}>
                You need to add at least one bank account to complete your profile setup.
              </Text>
            </View>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Security Setup</Text>
            <Text style={styles.stepDescription}>
              Set up your security preferences and PIN for secure transactions.
            </Text>

            <View style={styles.securityItem}>
              <Ionicons name="shield-outline" size={24} color="#1976d2" />
              <View style={styles.securityInfo}>
                <Text style={styles.securityTitle}>Set Transaction PIN</Text>
                <Text style={styles.securityDescription}>Create a 4-digit PIN for secure transactions</Text>
              </View>
              <TouchableOpacity style={styles.setupButton}>
                <Text style={styles.setupButtonText}>Setup</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.securityItem}>
              <Ionicons name="checkmark-circle" size={24} color="#4caf50" />
              <View style={styles.securityInfo}>
                <Text style={styles.securityTitle}>Enable Biometric Authentication</Text>
                <Text style={styles.securityDescription}>Use fingerprint or face ID for quick access</Text>
              </View>
              <View style={styles.toggle}>
                <View style={styles.toggleActive} />
              </View>
            </View>

            <View style={styles.securityItem}>
              <Ionicons name="checkmark-circle" size={24} color="#4caf50" />
              <View style={styles.securityInfo}>
                <Text style={styles.securityTitle}>Enable Two-Factor Authentication</Text>
                <Text style={styles.securityDescription}>Add an extra layer of security to your account</Text>
              </View>
              <View style={styles.toggle}>
                <View style={styles.toggleActive} />
              </View>
            </View>

            <View style={styles.successBox}>
              <Ionicons name="checkmark-circle-outline" size={20} color="#4caf50" />
              <Text style={styles.successText}>
                Your security settings have been configured. You can change these anytime in settings.
              </Text>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1976d2" />
      
      {/* Header */}
      <LinearGradient colors={['#1976d2', '#1565c0']} style={styles.header}>
        <Text style={styles.headerTitle}>Complete Your Profile</Text>
        <Text style={styles.headerSubtitle}>Set up your account to start using MalPay</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Progress Steps */}
        <View style={styles.progressContainer}>
          {steps.map((step, index) => (
            <View key={index} style={styles.stepContainer}>
              <View style={styles.stepIndicator}>
                <View
                  style={[
                    styles.stepCircle,
                    activeStep >= index && styles.stepCircleActive,
                    completedSteps.includes(index) && styles.stepCircleCompleted,
                  ]}
                >
                  {completedSteps.includes(index) ? (
                    <Ionicons name="checkmark" size={20} color="white" />
                  ) : (
                    <Ionicons name={step.icon as any} size={20} color="white" />
                  )}
                </View>
                {index < steps.length - 1 && (
                  <View
                    style={[
                      styles.stepLine,
                      activeStep > index && styles.stepLineActive,
                    ]}
                  />
                )}
              </View>
              <View style={styles.stepInfo}>
                <Text style={styles.stepLabel}>{step.label}</Text>
                <Text style={styles.stepDescription}>{step.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Step Content */}
        <View style={styles.stepContentContainer}>
          {renderStepContent(activeStep)}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            disabled={activeStep === 0}
          >
            <Text style={[styles.backButtonText, activeStep === 0 && styles.backButtonTextDisabled]}>
              Back
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNext}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Text style={styles.nextButtonText}>
                  {activeStep === steps.length - 1 ? 'Complete Setup' : 'Next'}
                </Text>
                <Ionicons name="arrow-forward" size={20} color="white" />
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Add Card Modal */}
      <Modal visible={showCardModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCardModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Payment Card</Text>
            <TouchableOpacity onPress={handleCardSubmit}>
              <Text style={styles.modalDone}>Done</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Card Number</Text>
              <TextInput
                style={styles.input}
                value={cardData.cardNumber}
                onChangeText={(value) => setCardData({ ...cardData, cardNumber: value })}
                placeholder="1234 5678 9012 3456"
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Cardholder Name</Text>
              <TextInput
                style={styles.input}
                value={cardData.cardholderName}
                onChangeText={(value) => setCardData({ ...cardData, cardholderName: value })}
                placeholder="John Doe"
              />
            </View>
            
            <View style={styles.inputRow}>
              <View style={styles.inputHalf}>
                <Text style={styles.inputLabel}>Expiry Month</Text>
                <TextInput
                  style={styles.input}
                  value={cardData.expiryMonth}
                  onChangeText={(value) => setCardData({ ...cardData, expiryMonth: value })}
                  placeholder="MM"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.inputHalf}>
                <Text style={styles.inputLabel}>Expiry Year</Text>
                <TextInput
                  style={styles.input}
                  value={cardData.expiryYear}
                  onChangeText={(value) => setCardData({ ...cardData, expiryYear: value })}
                  placeholder="YYYY"
                  keyboardType="numeric"
                />
              </View>
            </View>
            
            <View style={styles.inputRow}>
              <View style={styles.inputHalf}>
                <Text style={styles.inputLabel}>CVV</Text>
                <TextInput
                  style={styles.input}
                  value={cardData.cvv}
                  onChangeText={(value) => setCardData({ ...cardData, cvv: value })}
                  placeholder="123"
                  keyboardType="numeric"
                  secureTextEntry
                />
              </View>
              <View style={styles.inputHalf}>
                <Text style={styles.inputLabel}>Card Type</Text>
                <TextInput
                  style={styles.input}
                  value={cardData.cardType}
                  onChangeText={(value) => setCardData({ ...cardData, cardType: value })}
                  placeholder="visa"
                />
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Add Bank Modal */}
      <Modal visible={showBankModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowBankModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Bank Account</Text>
            <TouchableOpacity onPress={handleBankSubmit}>
              <Text style={styles.modalDone}>Done</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Account Name</Text>
              <TextInput
                style={styles.input}
                value={bankData.accountName}
                onChangeText={(value) => setBankData({ ...bankData, accountName: value })}
                placeholder="John Doe"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Account Number</Text>
              <TextInput
                style={styles.input}
                value={bankData.accountNumber}
                onChangeText={(value) => setBankData({ ...bankData, accountNumber: value })}
                placeholder="1234567890"
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Bank</Text>
              <TextInput
                style={styles.input}
                value={bankData.bankName}
                onChangeText={(value) => setBankData({ ...bankData, bankName: value })}
                placeholder="Select bank"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Bank Code</Text>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={bankData.bankCode}
                editable={false}
                placeholder="Auto-filled"
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
  },
  content: {
    flex: 1,
  },
  progressContainer: {
    padding: 20,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  stepIndicator: {
    alignItems: 'center',
    marginRight: 16,
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: {
    backgroundColor: '#1976d2',
  },
  stepCircleCompleted: {
    backgroundColor: '#4caf50',
  },
  stepLine: {
    width: 2,
    height: 40,
    backgroundColor: '#e0e0e0',
    marginTop: 4,
  },
  stepLineActive: {
    backgroundColor: '#1976d2',
  },
  stepInfo: {
    flex: 1,
    paddingTop: 8,
  },
  stepLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: '#666',
  },
  stepContentContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  stepContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  stepDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  inputHalf: {
    flex: 1,
    marginRight: 8,
  },
  inputThird: {
    flex: 1,
    marginRight: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 12,
  },
  inputDisabled: {
    backgroundColor: '#f5f5f5',
    color: '#999',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1976d2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#1976d2',
    marginLeft: 8,
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#fff3e0',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: '#f57c00',
    marginLeft: 8,
  },
  successBox: {
    flexDirection: 'row',
    backgroundColor: '#e8f5e9',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  successText: {
    flex: 1,
    fontSize: 14,
    color: '#4caf50',
    marginLeft: 8,
  },
  securityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  securityInfo: {
    flex: 1,
    marginLeft: 12,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  securityDescription: {
    fontSize: 14,
    color: '#666',
  },
  setupButton: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  setupButtonText: {
    fontSize: 14,
    color: '#1976d2',
    fontWeight: '500',
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4caf50',
    alignSelf: 'flex-end',
  },
  actionContainer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  backButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#666',
  },
  backButtonTextDisabled: {
    color: '#ccc',
  },
  nextButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1976d2',
    borderRadius: 8,
  },
  nextButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
    marginRight: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalCancel: {
    fontSize: 16,
    color: '#666',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalDone: {
    fontSize: 16,
    color: '#1976d2',
    fontWeight: '500',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
});

export default ProfileSetupScreen;
