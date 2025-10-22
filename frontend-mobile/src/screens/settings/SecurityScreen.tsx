import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  List,
  Switch,
  Divider,
  TextInput,
  ActivityIndicator,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootState, AppDispatch } from '@store';
import { SettingsStackParamList } from '@navigation/AppNavigator';
import { customTheme } from '@theme';
import Icon from 'react-native-vector-icons/MaterialIcons';

type SecurityScreenNavigationProp = StackNavigationProp<SettingsStackParamList, 'Security'>;

const SecurityScreen: React.FC = () => {
  const navigation = useNavigation<SecurityScreenNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  
  const { user } = useSelector((state: RootState) => state.auth);

  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricLoginEnabled, setBiometricLoginEnabled] = useState(false);
  const [biometricTransactionEnabled, setBiometricTransactionEnabled] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [pinEnabled, setPinEnabled] = useState(true);
  const [transactionPinSet, setTransactionPinSet] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return;
    }

    try {
      setIsChangingPassword(true);
      
      // TODO: Implement actual password change API call
      setTimeout(() => {
        setIsChangingPassword(false);
        Alert.alert('Success', 'Password changed successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }, 1000);
    } catch (error) {
      setIsChangingPassword(false);
      Alert.alert('Error', 'Failed to change password. Please try again.');
    }
  };

  const handleChangePin = async () => {
    if (!currentPin || !newPin || !confirmPin) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPin !== confirmPin) {
      Alert.alert('Error', 'New PINs do not match');
      return;
    }

    if (newPin.length !== 4) {
      Alert.alert('Error', 'PIN must be exactly 4 digits');
      return;
    }

    try {
      setIsChangingPin(true);
      
      // TODO: Implement actual PIN change API call
      setTimeout(() => {
        setIsChangingPin(false);
        Alert.alert('Success', 'PIN changed successfully');
        setCurrentPin('');
        setNewPin('');
        setConfirmPin('');
      }, 1000);
    } catch (error) {
      setIsChangingPin(false);
      Alert.alert('Error', 'Failed to change PIN. Please try again.');
    }
  };

  const handleEnableTwoFactor = () => {
    Alert.alert(
      'Two-Factor Authentication',
      'This will enable 2FA for your account. You will need to use an authenticator app to generate codes.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Enable',
          onPress: () => {
            // TODO: Implement 2FA setup
            Alert.alert('2FA Setup', 'Two-factor authentication setup coming soon!');
          },
        },
      ]
    );
  };

  const handleDisableTwoFactor = () => {
    Alert.alert(
      'Disable Two-Factor Authentication',
      'Are you sure you want to disable 2FA? This will make your account less secure.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Disable',
          style: 'destructive',
          onPress: () => {
            setTwoFactorEnabled(false);
            Alert.alert('Success', 'Two-factor authentication disabled');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Authentication Methods */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Authentication Methods
            </Text>
            
            <List.Item
              title="Biometric Authentication"
              description="Use fingerprint or face ID for login"
              left={(props) => <List.Icon {...props} icon="fingerprint" />}
              right={() => (
                <Switch
                  value={biometricEnabled}
                  onValueChange={setBiometricEnabled}
                  color={customTheme.colors.primary}
                />
              )}
              style={styles.listItem}
            />
            <Divider style={styles.divider} />
            
            <List.Item
              title="Two-Factor Authentication"
              description="Add an extra layer of security"
              left={(props) => <List.Icon {...props} icon="shield-account" />}
              right={() => (
                <Switch
                  value={twoFactorEnabled}
                  onValueChange={twoFactorEnabled ? handleDisableTwoFactor : handleEnableTwoFactor}
                  color={customTheme.colors.primary}
                />
              )}
              style={styles.listItem}
            />
            <Divider style={styles.divider} />
            
            <List.Item
              title="PIN Authentication"
              description="Use PIN for quick access"
              left={(props) => <List.Icon {...props} icon="numeric" />}
              right={() => (
                <Switch
                  value={pinEnabled}
                  onValueChange={setPinEnabled}
                  color={customTheme.colors.primary}
                />
              )}
              style={styles.listItem}
            />
            <Divider style={styles.divider} />
            
            <List.Item
              title="Transaction PIN"
              description={transactionPinSet ? "PIN is set up" : "Set up a 4-digit PIN for transactions"}
              left={(props) => <List.Icon {...props} icon="lock" />}
              right={() => (
                <Button
                  mode="text"
                  onPress={() => navigation.navigate('TransactionPINSetup')}
                  compact
                  labelStyle={styles.actionButtonLabel}
                >
                  {transactionPinSet ? 'Change' : 'Setup'}
                </Button>
              )}
              style={styles.listItem}
            />
          </Card.Content>
        </Card>

        {/* Biometric Settings */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Biometric Settings
            </Text>
            
            <List.Item
              title="Biometric Settings"
              description="Configure fingerprint and face recognition"
              left={(props) => <List.Icon {...props} icon="fingerprint" />}
              right={() => (
                <Button
                  mode="text"
                  onPress={() => navigation.navigate('BiometricSettings')}
                  compact
                  labelStyle={styles.actionButtonLabel}
                >
                  Configure
                </Button>
              )}
              style={styles.listItem}
            />
            <Divider style={styles.divider} />
            
            <List.Item
              title="Biometric Login"
              description="Use biometric authentication to log in"
              left={(props) => <List.Icon {...props} icon="login" />}
              right={() => (
                <Switch
                  value={biometricLoginEnabled}
                  onValueChange={setBiometricLoginEnabled}
                  color={customTheme.colors.primary}
                />
              )}
              style={styles.listItem}
            />
            <Divider style={styles.divider} />
            
            <List.Item
              title="Biometric Transactions"
              description="Use biometric authentication for payments"
              left={(props) => <List.Icon {...props} icon="credit-card" />}
              right={() => (
                <Switch
                  value={biometricTransactionEnabled}
                  onValueChange={setBiometricTransactionEnabled}
                  color={customTheme.colors.primary}
                />
              )}
              style={styles.listItem}
            />
          </Card.Content>
        </Card>

        {/* Change Password */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Change Password
            </Text>
            
            <TextInput
              label="Current Password"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              mode="outlined"
              secureTextEntry
              style={styles.input}
            />
            
            <TextInput
              label="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              mode="outlined"
              secureTextEntry
              style={styles.input}
            />
            
            <TextInput
              label="Confirm New Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              mode="outlined"
              secureTextEntry
              style={styles.input}
            />
            
            <Button
              mode="contained"
              onPress={handleChangePassword}
              style={styles.actionButton}
              loading={isChangingPassword}
              disabled={isChangingPassword}
              contentStyle={styles.buttonContent}
            >
              {isChangingPassword ? 'Changing...' : 'Change Password'}
            </Button>
          </Card.Content>
        </Card>

        {/* Change PIN */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Change PIN
            </Text>
            
            <TextInput
              label="Current PIN"
              value={currentPin}
              onChangeText={setCurrentPin}
              mode="outlined"
              keyboardType="numeric"
              secureTextEntry
              maxLength={4}
              style={styles.input}
            />
            
            <TextInput
              label="New PIN"
              value={newPin}
              onChangeText={setNewPin}
              mode="outlined"
              keyboardType="numeric"
              secureTextEntry
              maxLength={4}
              style={styles.input}
            />
            
            <TextInput
              label="Confirm New PIN"
              value={confirmPin}
              onChangeText={setConfirmPin}
              mode="outlined"
              keyboardType="numeric"
              secureTextEntry
              maxLength={4}
              style={styles.input}
            />
            
            <Button
              mode="contained"
              onPress={handleChangePin}
              style={styles.actionButton}
              loading={isChangingPin}
              disabled={isChangingPin}
              contentStyle={styles.buttonContent}
            >
              {isChangingPin ? 'Changing...' : 'Change PIN'}
            </Button>
          </Card.Content>
        </Card>

        {/* Security Information */}
        <Card style={styles.infoCard}>
          <Card.Content>
            <View style={styles.infoHeader}>
              <Icon name="security" size={24} color={customTheme.colors.primary} />
              <Text variant="titleSmall" style={styles.infoTitle}>
                Security Tips
              </Text>
            </View>
            <Text variant="bodySmall" style={styles.infoText}>
              • Use a strong, unique password{'\n'}
              • Enable two-factor authentication{'\n'}
              • Keep your PIN private and don't share it{'\n'}
              • Log out from shared devices{'\n'}
              • Report suspicious activity immediately
            </Text>
          </Card.Content>
        </Card>

        {/* Account Security */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Account Security
            </Text>
            
            <List.Item
              title="Active Sessions"
              description="Manage your active login sessions"
              left={(props) => <List.Icon {...props} icon="devices" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {}}
              style={styles.listItem}
            />
            <Divider style={styles.divider} />
            
            <List.Item
              title="Login History"
              description="View your recent login activity"
              left={(props) => <List.Icon {...props} icon="history" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {}}
              style={styles.listItem}
            />
            <Divider style={styles.divider} />
            
            <List.Item
              title="Security Alerts"
              description="Manage security notifications"
              left={(props) => <List.Icon {...props} icon="alert" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {}}
              style={styles.listItem}
            />
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: customTheme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  sectionCard: {
    marginHorizontal: customTheme.spacing.lg,
    marginBottom: customTheme.spacing.md,
    elevation: 2,
    borderRadius: customTheme.borderRadius.lg,
  },
  sectionTitle: {
    color: customTheme.colors.onSurface,
    fontWeight: 'bold',
    marginBottom: customTheme.spacing.md,
  },
  listItem: {
    paddingVertical: customTheme.spacing.xs,
  },
  divider: {
    marginVertical: customTheme.spacing.xs,
  },
  input: {
    marginBottom: customTheme.spacing.md,
  },
  actionButton: {
    marginTop: customTheme.spacing.sm,
    borderRadius: customTheme.borderRadius.lg,
  },
  buttonContent: {
    paddingVertical: customTheme.spacing.sm,
  },
  infoCard: {
    marginHorizontal: customTheme.spacing.lg,
    marginBottom: customTheme.spacing.md,
    elevation: 1,
    borderRadius: customTheme.borderRadius.lg,
    backgroundColor: customTheme.colors.primaryContainer,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: customTheme.spacing.sm,
  },
  infoTitle: {
    color: customTheme.colors.onPrimaryContainer,
    fontWeight: 'bold',
    marginLeft: customTheme.spacing.sm,
  },
  infoText: {
    color: customTheme.colors.onPrimaryContainer,
    lineHeight: 20,
  },
});

export default SecurityScreen;
