import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Text,
  Button,
  Card,
  ProgressBar,
  Chip,
  ActivityIndicator,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '@navigation/AppNavigator';
import { colors, shadows } from '@theme/colors';
import { Ionicons } from '@expo/vector-icons';

type ProfileCompletionScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'ProfileCompletion'>;

interface ProfileCompletionScreenProps {
  navigation: ProfileCompletionScreenNavigationProp;
}

const ProfileCompletionScreen: React.FC<ProfileCompletionScreenProps> = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [profileStatus, setProfileStatus] = useState({
    isComplete: false,
    hasBankAccount: false,
    hasCards: false,
    cardCount: 0,
    maxCards: 3,
    missingSteps: ['Link a bank account', 'Add at least one card'],
  });

  useEffect(() => {
    // TODO: Fetch profile completion status from API
    // For now, using mock data
  }, []);

  const handleLinkBankAccount = () => {
    navigation.navigate('BankAccountSetup');
  };

  const handleAddCard = () => {
    navigation.navigate('AddCard');
  };

  const handleSkip = () => {
    Alert.alert(
      'Skip Profile Setup',
      'You can complete your profile later, but you\'ll need at least one card and bank account to send money.',
      [
        {
          text: 'Complete Later',
          onPress: () => navigation.navigate('Main'),
        },
        {
          text: 'Continue Setup',
          style: 'cancel',
        },
      ]
    );
  };

  const getCompletionPercentage = () => {
    const totalSteps = 2; // Bank account + Card
    const completedSteps = (profileStatus.hasBankAccount ? 1 : 0) + (profileStatus.hasCards ? 1 : 0);
    return completedSteps / totalSteps;
  };

  const renderStepCard = (title: string, description: string, completed: boolean, onPress: () => void, icon: string) => (
    <Card style={[styles.stepCard, completed && styles.completedCard]} onPress={onPress}>
      <Card.Content style={styles.stepContent}>
        <View style={styles.stepHeader}>
          <View style={[styles.iconContainer, completed && styles.completedIcon]}>
            <Ionicons 
              name={completed ? 'checkmark' : icon as any} 
              size={24} 
              color={completed ? colors.success : colors.primary} 
            />
          </View>
          <View style={styles.stepText}>
            <Text variant="titleMedium" style={[styles.stepTitle, completed && styles.completedText]}>
              {title}
            </Text>
            <Text variant="bodyMedium" style={[styles.stepDescription, completed && styles.completedText]}>
              {description}
            </Text>
          </View>
          {completed && (
            <Chip mode="outlined" compact style={styles.completedChip}>
              Done
            </Chip>
          )}
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text variant="headlineLarge" style={styles.title}>
          Complete Your Profile
        </Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          Set up your account to start sending money instantly
        </Text>
        
        <View style={styles.progressContainer}>
          <ProgressBar 
            progress={getCompletionPercentage()} 
            color={colors.primary}
            style={styles.progressBar}
          />
          <Text variant="bodySmall" style={styles.progressText}>
            {Math.round(getCompletionPercentage() * 100)}% Complete
          </Text>
        </View>
      </View>

      <View style={styles.stepsContainer}>
        {renderStepCard(
          'Link Bank Account',
          'Connect your bank account for withdrawals',
          profileStatus.hasBankAccount,
          handleLinkBankAccount,
          'card-outline'
        )}

        {renderStepCard(
          'Add Payment Card',
          'Add a debit/credit card for instant payments',
          profileStatus.hasCards,
          handleAddCard,
          'wallet-outline'
        )}
      </View>

      <View style={styles.footer}>
        <Button
          mode="contained"
          onPress={profileStatus.isComplete ? () => navigation.navigate('Main') : handleSkip}
          style={styles.continueButton}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            profileStatus.isComplete ? 'Continue to App' : 'Skip for Now'
          )}
        </Button>

        {!profileStatus.isComplete && (
          <Text variant="bodySmall" style={styles.skipNote}>
            You can complete these steps later in Settings
          </Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 24,
    alignItems: 'center',
  },
  title: {
    color: colors.textPrimary,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  progressText: {
    color: colors.textSecondary,
    fontWeight: '500',
  },
  stepsContainer: {
    padding: 24,
    gap: 16,
  },
  stepCard: {
    ...shadows.small,
    borderRadius: 12,
  },
  completedCard: {
    backgroundColor: colors.success + '10',
    borderColor: colors.success,
    borderWidth: 1,
  },
  stepContent: {
    padding: 20,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  completedIcon: {
    backgroundColor: colors.success + '20',
  },
  stepText: {
    flex: 1,
  },
  stepTitle: {
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: 4,
  },
  stepDescription: {
    color: colors.textSecondary,
    lineHeight: 20,
  },
  completedText: {
    color: colors.success,
  },
  completedChip: {
    borderColor: colors.success,
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  continueButton: {
    width: '100%',
    paddingVertical: 8,
    marginBottom: 12,
  },
  skipNote: {
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default ProfileCompletionScreen;
