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
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '@navigation/AppNavigator';
import { customTheme } from '@theme';
import { APP_CONFIG } from '@config/app.config';

type ForgotPasswordScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'ForgotPassword'>;

const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const validateEmail = () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return false;
    }

    if (!APP_CONFIG.validation.email.pattern.test(email)) {
      Alert.alert('Error', APP_CONFIG.validation.email.message);
      return false;
    }

    return true;
  };

  const handleResetPassword = async () => {
    if (!validateEmail()) return;

    try {
      setIsLoading(true);
      
      // TODO: Implement actual password reset API call
      // For now, simulate API call
      setTimeout(() => {
        setIsLoading(false);
        setSnackbarMessage('Password reset instructions sent to your email');
        setSnackbarVisible(true);
        
        // Navigate back to login after a delay
        setTimeout(() => {
          navigation.navigate('Login');
        }, 2000);
      }, 1000);
    } catch (err) {
      setIsLoading(false);
      setSnackbarMessage('Failed to send reset instructions. Please try again.');
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
            Forgot Password?
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Enter your email address and we'll send you instructions to reset your password
          </Text>
        </View>

        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              style={styles.input}
            />

            <Button
              mode="contained"
              onPress={handleResetPassword}
              style={styles.resetButton}
              loading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Send Reset Instructions'}
            </Button>

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
  resetButton: {
    marginBottom: customTheme.spacing.md,
    paddingVertical: customTheme.spacing.sm,
  },
  backButton: {
    alignSelf: 'center',
  },
  snackbar: {
    backgroundColor: customTheme.colors.primary,
  },
});

export default ForgotPasswordScreen;
