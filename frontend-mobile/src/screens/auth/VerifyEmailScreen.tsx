import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  Snackbar,
} from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '@navigation/AppNavigator';
import { customTheme } from '@theme';

type VerifyEmailScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'VerifyEmail'>;
type VerifyEmailScreenRouteProp = RouteProp<AuthStackParamList, 'VerifyEmail'>;

const VerifyEmailScreen: React.FC = () => {
  const navigation = useNavigation<VerifyEmailScreenNavigationProp>();
  const route = useRoute<VerifyEmailScreenRouteProp>();
  const { email } = route.params;

  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const validateCode = () => {
    if (!verificationCode) {
      Alert.alert('Error', 'Please enter the verification code');
      return false;
    }

    if (verificationCode.length !== 6) {
      Alert.alert('Error', 'Verification code must be 6 digits');
      return false;
    }

    return true;
  };

  const handleVerifyEmail = async () => {
    if (!validateCode()) return;

    try {
      setIsLoading(true);
      
      // TODO: Implement actual email verification API call
      // For now, simulate API call
      setTimeout(() => {
        setIsLoading(false);
        setSnackbarMessage('Email verified successfully!');
        setSnackbarVisible(true);
        
        // Navigate to login after successful verification
        setTimeout(() => {
          navigation.navigate('Login');
        }, 2000);
      }, 1000);
    } catch (err) {
      setIsLoading(false);
      setSnackbarMessage('Invalid verification code. Please try again.');
      setSnackbarVisible(true);
    }
  };

  const handleResendCode = async () => {
    try {
      // TODO: Implement resend verification code API call
      setSnackbarMessage('Verification code sent to your email');
      setSnackbarVisible(true);
    } catch (err) {
      setSnackbarMessage('Failed to resend code. Please try again.');
      setSnackbarVisible(true);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text variant="headlineLarge" style={styles.title}>
            Verify Email
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            We've sent a verification code to{'\n'}
            <Text style={styles.emailText}>{email}</Text>
          </Text>
        </View>

        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <TextInput
              label="Verification Code"
              value={verificationCode}
              onChangeText={setVerificationCode}
              mode="outlined"
              keyboardType="numeric"
              maxLength={6}
              style={styles.input}
              placeholder="Enter 6-digit code"
            />

            <Button
              mode="contained"
              onPress={handleVerifyEmail}
              style={styles.verifyButton}
              loading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? 'Verifying...' : 'Verify Email'}
            </Button>

            <View style={styles.resendContainer}>
              <Text variant="bodyMedium" style={styles.resendText}>
                Didn't receive the code?{' '}
              </Text>
              <Button
                mode="text"
                onPress={handleResendCode}
                style={styles.resendButton}
              >
                Resend Code
              </Button>
            </View>

            <Button
              mode="text"
              onPress={() => navigation.navigate('Login')}
              style={styles.backButton}
            >
              Back to Sign In
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={4000}
        style={styles.snackbar}
      >
        {snackbarMessage}
      </Snackbar>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: customTheme.colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: customTheme.spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: customTheme.spacing.xl,
  },
  title: {
    color: customTheme.colors.primary,
    fontWeight: 'bold',
    marginBottom: customTheme.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    color: customTheme.colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 24,
  },
  emailText: {
    color: customTheme.colors.primary,
    fontWeight: 'bold',
  },
  card: {
    elevation: 4,
    borderRadius: customTheme.borderRadius.lg,
  },
  cardContent: {
    padding: customTheme.spacing.lg,
  },
  input: {
    marginBottom: customTheme.spacing.lg,
  },
  verifyButton: {
    marginBottom: customTheme.spacing.md,
    paddingVertical: customTheme.spacing.sm,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: customTheme.spacing.md,
  },
  resendText: {
    color: customTheme.colors.onSurfaceVariant,
  },
  resendButton: {
    marginLeft: -customTheme.spacing.sm,
  },
  backButton: {
    alignSelf: 'center',
  },
  snackbar: {
    backgroundColor: customTheme.colors.primary,
  },
});

export default VerifyEmailScreen;
