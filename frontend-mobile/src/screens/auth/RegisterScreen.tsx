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
  ActivityIndicator,
  Snackbar,
  Checkbox,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootState, AppDispatch } from '@store';
import { loginFailure, clearError } from '@store/slices/authSlice';
import { AuthStackParamList } from '@navigation/AppNavigator';
import { customTheme } from '@theme';
import { APP_CONFIG } from '@config/app.config';

type RegisterScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Register'>;

const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) {
      dispatch(clearError());
    }
  };

  const validateForm = () => {
    const { firstName, lastName, email, username, phone, password, confirmPassword } = formData;

    if (!firstName || !lastName || !email || !username || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all required fields');
      return false;
    }

    if (!APP_CONFIG.validation.email.pattern.test(email)) {
      Alert.alert('Error', APP_CONFIG.validation.email.message);
      return false;
    }

    if (!APP_CONFIG.validation.username.pattern.test(username)) {
      Alert.alert('Error', APP_CONFIG.validation.username.message);
      return false;
    }

    if (!APP_CONFIG.validation.password.pattern.test(password)) {
      Alert.alert('Error', APP_CONFIG.validation.password.message);
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }

    if (phone && !APP_CONFIG.validation.phone.pattern.test(phone)) {
      Alert.alert('Error', APP_CONFIG.validation.phone.message);
      return false;
    }

    if (!acceptTerms) {
      Alert.alert('Error', 'Please accept the Terms and Conditions');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      // TODO: Implement actual registration API call
      // For now, simulate registration
      setTimeout(() => {
        Alert.alert(
          'Registration Successful',
          'Please check your email for verification instructions.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('VerifyEmail', { email: formData.email }),
            },
          ]
        );
      }, 1000);
    } catch (err) {
      dispatch(loginFailure('Registration failed. Please try again.'));
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
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text variant="headlineLarge" style={styles.title}>
            Create Account
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Join MalPay and start sending money instantly
          </Text>
        </View>

        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.nameRow}>
              <TextInput
                label="First Name"
                value={formData.firstName}
                onChangeText={(value) => handleInputChange('firstName', value)}
                mode="outlined"
                autoCapitalize="words"
                autoComplete="given-name"
                style={[styles.input, styles.halfInput]}
                error={!!error && error.includes('firstName')}
              />
              <TextInput
                label="Last Name"
                value={formData.lastName}
                onChangeText={(value) => handleInputChange('lastName', value)}
                mode="outlined"
                autoCapitalize="words"
                autoComplete="family-name"
                style={[styles.input, styles.halfInput]}
                error={!!error && error.includes('lastName')}
              />
            </View>

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
              label="Username"
              value={formData.username}
              onChangeText={(value) => handleInputChange('username', value)}
              mode="outlined"
              autoCapitalize="none"
              autoComplete="username"
              style={styles.input}
              error={!!error && error.includes('username')}
            />

            <TextInput
              label="Phone Number (Optional)"
              value={formData.phone}
              onChangeText={(value) => handleInputChange('phone', value)}
              mode="outlined"
              keyboardType="phone-pad"
              autoComplete="tel"
              style={styles.input}
              error={!!error && error.includes('phone')}
            />

            <TextInput
              label="Password"
              value={formData.password}
              onChangeText={(value) => handleInputChange('password', value)}
              mode="outlined"
              secureTextEntry={!showPassword}
              autoComplete="new-password"
              style={styles.input}
              right={
                <TextInput.Icon
                  icon={showPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
              error={!!error && error.includes('password')}
            />

            <TextInput
              label="Confirm Password"
              value={formData.confirmPassword}
              onChangeText={(value) => handleInputChange('confirmPassword', value)}
              mode="outlined"
              secureTextEntry={!showConfirmPassword}
              autoComplete="new-password"
              style={styles.input}
              right={
                <TextInput.Icon
                  icon={showConfirmPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                />
              }
              error={!!error && error.includes('confirmPassword')}
            />

            <View style={styles.termsContainer}>
              <Checkbox
                status={acceptTerms ? 'checked' : 'unchecked'}
                onPress={() => setAcceptTerms(!acceptTerms)}
              />
              <Text variant="bodySmall" style={styles.termsText}>
                I agree to the{' '}
                <Text style={styles.linkText}>Terms and Conditions</Text>
                {' '}and{' '}
                <Text style={styles.linkText}>Privacy Policy</Text>
              </Text>
            </View>

            <Button
              mode="contained"
              onPress={handleRegister}
              style={styles.registerButton}
              loading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>

            <View style={styles.loginContainer}>
              <Text variant="bodyMedium">Already have an account? </Text>
              <Button
                mode="text"
                onPress={() => navigation.navigate('Login')}
                style={styles.loginButton}
              >
                Sign In
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
    padding: customTheme.spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: customTheme.spacing.lg,
    marginTop: customTheme.spacing.xl,
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
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    flex: 0.48,
  },
  input: {
    marginBottom: customTheme.spacing.md,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: customTheme.spacing.lg,
  },
  termsText: {
    flex: 1,
    marginLeft: customTheme.spacing.sm,
    lineHeight: 20,
  },
  linkText: {
    color: customTheme.colors.primary,
    textDecorationLine: 'underline',
  },
  registerButton: {
    marginBottom: customTheme.spacing.lg,
    paddingVertical: customTheme.spacing.sm,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButton: {
    marginLeft: -customTheme.spacing.sm,
  },
  snackbar: {
    backgroundColor: customTheme.colors.error,
  },
});

export default RegisterScreen;
