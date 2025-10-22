import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  ActivityIndicator,
  Snackbar,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootState, AppDispatch } from '@store';
import { loginStart, loginFailure, clearError } from '@store/slices/authSlice';
import { AuthStackParamList } from '@navigation/AppNavigator';
import { customTheme } from '@theme';
import { APP_CONFIG } from '@config/app.config';
import { useBiometricAuth } from '@services/BiometricAuthService';

type LoginScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>;

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error, twoFactorRequired } = useSelector((state: RootState) => state.auth);
  const { capabilities, authenticateForLogin, isLoading: biometricLoading } = useBiometricAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    twoFactorCode: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  useEffect(() => {
    // Check if biometric is enabled for this user
    // This would typically come from user preferences or secure storage
    checkBiometricStatus();
  }, []);

  const checkBiometricStatus = async () => {
    // TODO: Check from secure storage if biometric is enabled for this user
    // For now, we'll assume it's available if the device supports it
    setBiometricEnabled(capabilities.isAvailable);
  };

  const handleBiometricLogin = async () => {
    try {
      const result = await authenticateForLogin();
      
      if (result.success) {
        // TODO: Implement biometric login with stored credentials
        Alert.alert(
          'Biometric Login',
          'Biometric authentication successful! This would log you in automatically.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Authentication Failed',
          result.error || 'Biometric authentication failed. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'An error occurred during biometric authentication.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) {
      dispatch(clearError());
    }
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      Alert.alert('Error', 'Please fill in all fields');
      return false;
    }

    if (!APP_CONFIG.validation.email.pattern.test(formData.email)) {
      Alert.alert('Error', APP_CONFIG.validation.email.message);
      return false;
    }

    return true;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      dispatch(loginStart());
      
      // TODO: Implement actual login API call
      // For now, simulate login
      setTimeout(() => {
        if (formData.email === 'test@example.com' && formData.password === 'password123') {
          // Simulate successful login
          dispatch({
            type: 'auth/loginSuccess',
            payload: {
              user: {
                id: '1',
                email: formData.email,
                username: 'testuser',
                role: 'user' as any,
                isVerified: true,
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
              token: 'mock-token',
              refreshToken: 'mock-refresh-token',
            },
          });
        } else {
          dispatch(loginFailure('Invalid email or password'));
        }
      }, 1000);
    } catch (err) {
      dispatch(loginFailure('Login failed. Please try again.'));
    }
  };

  const handleTwoFactorSubmit = async () => {
    if (!formData.twoFactorCode) {
      Alert.alert('Error', 'Please enter the verification code');
      return;
    }

    try {
      // TODO: Implement 2FA verification
      dispatch({
        type: 'auth/twoFactorSuccess',
        payload: {
          user: {
            id: '1',
            email: formData.email,
            username: 'testuser',
            role: 'user' as any,
            isVerified: true,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          token: 'mock-token',
          refreshToken: 'mock-refresh-token',
        },
      });
    } catch (err) {
      dispatch(loginFailure('Invalid verification code'));
    }
  };

  React.useEffect(() => {
    if (error) {
      setSnackbarVisible(true);
    }
  }, [error]);

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
            Welcome Back
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Sign in to your MalPay account
          </Text>
        </View>

        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            {!twoFactorRequired ? (
              <>
                <TextInput
                  label="Email"
                  value={formData.email}
                  onChangeText={(value) => handleInputChange('email', value)}
                  mode="outlined"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  style={styles.input}
                  error={!!error && error.includes('email')}
                />

                <TextInput
                  label="Password"
                  value={formData.password}
                  onChangeText={(value) => handleInputChange('password', value)}
                  mode="outlined"
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                  style={styles.input}
                  right={
                    <TextInput.Icon
                      icon={showPassword ? 'eye-off' : 'eye'}
                      onPress={() => setShowPassword(!showPassword)}
                    />
                  }
                  error={!!error && error.includes('password')}
                />

                <Button
                  mode="text"
                  onPress={() => navigation.navigate('ForgotPassword')}
                  style={styles.forgotPassword}
                >
                  Forgot Password?
                </Button>

                <Button
                  mode="contained"
                  onPress={handleLogin}
                  style={styles.loginButton}
                  loading={isLoading}
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Button>

                {/* Biometric Login Button */}
                {biometricEnabled && capabilities.isAvailable && (
                  <TouchableOpacity
                    style={styles.biometricButton}
                    onPress={handleBiometricLogin}
                    disabled={biometricLoading}
                  >
                    <View style={styles.biometricButtonContent}>
                      <Ionicons 
                        name={capabilities.biometryType === 'face' ? 'face-id' : 'finger-print'} 
                        size={24} 
                        color={customTheme.colors.primary} 
                      />
                      <Text style={styles.biometricButtonText}>
                        {biometricLoading ? 'Authenticating...' : `Use ${capabilities.biometryType === 'face' ? 'Face ID' : 'Fingerprint'}`}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <>
                <Text variant="headlineSmall" style={styles.twoFactorTitle}>
                  Two-Factor Authentication
                </Text>
                <Text variant="bodyMedium" style={styles.twoFactorSubtitle}>
                  Enter the verification code from your authenticator app
                </Text>

                <TextInput
                  label="Verification Code"
                  value={formData.twoFactorCode}
                  onChangeText={(value) => handleInputChange('twoFactorCode', value)}
                  mode="outlined"
                  keyboardType="numeric"
                  maxLength={6}
                  style={styles.input}
                />

                <Button
                  mode="contained"
                  onPress={handleTwoFactorSubmit}
                  style={styles.loginButton}
                  loading={isLoading}
                  disabled={isLoading}
                >
                  {isLoading ? 'Verifying...' : 'Verify'}
                </Button>
              </>
            )}

            <View style={styles.signupContainer}>
              <Text variant="bodyMedium">Don't have an account? </Text>
              <Button
                mode="text"
                onPress={() => navigation.navigate('Register')}
                style={styles.signupButton}
              >
                Sign Up
              </Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={4000}
        style={styles.snackbar}
      >
        {error}
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
  },
  subtitle: {
    color: customTheme.colors.onSurfaceVariant,
    textAlign: 'center',
  },
  card: {
    elevation: 4,
    borderRadius: customTheme.borderRadius.lg,
  },
  cardContent: {
    padding: customTheme.spacing.lg,
  },
  input: {
    marginBottom: customTheme.spacing.md,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: customTheme.spacing.lg,
  },
  loginButton: {
    marginBottom: customTheme.spacing.lg,
    paddingVertical: customTheme.spacing.sm,
  },
  biometricButton: {
    marginTop: 12,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: customTheme.colors.primary,
    backgroundColor: 'transparent',
  },
  biometricButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  biometricButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
    color: customTheme.colors.primary,
  },
  twoFactorTitle: {
    textAlign: 'center',
    marginBottom: customTheme.spacing.sm,
    color: customTheme.colors.primary,
  },
  twoFactorSubtitle: {
    textAlign: 'center',
    marginBottom: customTheme.spacing.lg,
    color: customTheme.colors.onSurfaceVariant,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupButton: {
    marginLeft: -customTheme.spacing.sm,
  },
  snackbar: {
    backgroundColor: customTheme.colors.error,
  },
});

export default LoginScreen;
