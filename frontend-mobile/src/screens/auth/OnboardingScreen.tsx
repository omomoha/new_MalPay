import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import {
  Text,
  Button,
  Card,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '@navigation/AppNavigator';
import { customTheme } from '@theme';
import Icon from 'react-native-vector-icons/MaterialIcons';

type OnboardingScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Onboarding'>;

const { width } = Dimensions.get('window');

const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation<OnboardingScreenNavigationProp>();

  const features = [
    {
      icon: 'send',
      title: 'Send Money Instantly',
      description: 'Transfer money to anyone using just their email address',
    },
    {
      icon: 'security',
      title: 'Secure & Safe',
      description: 'Your money is protected with bank-level security',
    },
    {
      icon: 'account-balance-wallet',
      title: 'Manage Cards',
      description: 'Link multiple cards and manage them in one place',
    },
    {
      icon: 'history',
      title: 'Track Everything',
      description: 'View all your transactions and spending history',
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Icon name="account-balance-wallet" size={60} color={customTheme.colors.primary} />
          </View>
          <Text variant="headlineLarge" style={styles.title}>
            Welcome to MalPay
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Your unified payment platform for seamless money transfers
          </Text>
        </View>

        {/* Features */}
        <View style={styles.featuresContainer}>
          {features.map((feature, index) => (
            <Card key={index} style={styles.featureCard}>
              <Card.Content style={styles.featureContent}>
                <View style={styles.featureIcon}>
                  <Icon name={feature.icon} size={32} color={customTheme.colors.primary} />
                </View>
                <Text variant="titleMedium" style={styles.featureTitle}>
                  {feature.title}
                </Text>
                <Text variant="bodyMedium" style={styles.featureDescription}>
                  {feature.description}
                </Text>
              </Card.Content>
            </Card>
          ))}
        </View>

        {/* CTA Buttons */}
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('Register')}
            style={styles.primaryButton}
            contentStyle={styles.buttonContent}
          >
            Get Started
          </Button>
          
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('Login')}
            style={styles.secondaryButton}
            contentStyle={styles.buttonContent}
          >
            Sign In
          </Button>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text variant="bodySmall" style={styles.footerText}>
            By continuing, you agree to our{' '}
            <Text style={styles.linkText}>Terms of Service</Text>
            {' '}and{' '}
            <Text style={styles.linkText}>Privacy Policy</Text>
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: customTheme.colors.background,
  },
  content: {
    flex: 1,
    padding: customTheme.spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginTop: customTheme.spacing.xxl,
    marginBottom: customTheme.spacing.xl,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: customTheme.colors.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: customTheme.spacing.lg,
  },
  title: {
    color: customTheme.colors.primary,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: customTheme.spacing.sm,
  },
  subtitle: {
    color: customTheme.colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: customTheme.spacing.md,
  },
  featuresContainer: {
    marginBottom: customTheme.spacing.xl,
  },
  featureCard: {
    marginBottom: customTheme.spacing.md,
    elevation: 2,
    borderRadius: customTheme.borderRadius.lg,
  },
  featureContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: customTheme.spacing.md,
  },
  featureIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: customTheme.colors.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: customTheme.spacing.md,
  },
  featureTitle: {
    color: customTheme.colors.onSurface,
    fontWeight: 'bold',
    marginBottom: customTheme.spacing.xs,
    flex: 1,
  },
  featureDescription: {
    color: customTheme.colors.onSurfaceVariant,
    flex: 1,
    lineHeight: 20,
  },
  buttonContainer: {
    marginBottom: customTheme.spacing.xl,
  },
  primaryButton: {
    marginBottom: customTheme.spacing.md,
    borderRadius: customTheme.borderRadius.lg,
  },
  secondaryButton: {
    borderRadius: customTheme.borderRadius.lg,
    borderColor: customTheme.colors.primary,
  },
  buttonContent: {
    paddingVertical: customTheme.spacing.sm,
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: customTheme.spacing.md,
  },
  footerText: {
    color: customTheme.colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 18,
  },
  linkText: {
    color: customTheme.colors.primary,
    textDecorationLine: 'underline',
  },
});

export default OnboardingScreen;
