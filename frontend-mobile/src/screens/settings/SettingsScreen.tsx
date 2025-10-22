import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {
  Text,
  Card,
  List,
  Divider,
  Switch,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SettingsStackParamList } from '@navigation/AppNavigator';
import { customTheme } from '@theme';
import Icon from 'react-native-vector-icons/MaterialIcons';

type SettingsScreenNavigationProp = StackNavigationProp<SettingsStackParamList, 'Settings'>;

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<SettingsScreenNavigationProp>();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  const settingsSections = [
    {
      title: 'Account',
      items: [
        {
          title: 'Personal Information',
          description: 'Update your profile details',
          icon: 'account-edit',
          onPress: () => {},
        },
        {
          title: 'Change Password',
          description: 'Update your account password',
          icon: 'lock',
          onPress: () => {},
        },
        {
          title: 'Two-Factor Authentication',
          description: 'Secure your account with 2FA',
          icon: 'shield-account',
          onPress: () => {},
        },
      ],
    },
    {
      title: 'Payment Methods',
      items: [
        {
          title: 'Linked Cards',
          description: 'Manage your linked cards',
          icon: 'credit-card',
          onPress: () => navigation.navigate('LinkedCards'),
        },
        {
          title: 'Bank Accounts',
          description: 'Manage withdrawal accounts',
          icon: 'account-balance',
          onPress: () => navigation.navigate('BankAccounts'),
        },
      ],
    },
    {
      title: 'Security & Privacy',
      items: [
        {
          title: 'Security Settings',
          description: 'Password, PIN, and security options',
          icon: 'security',
          onPress: () => navigation.navigate('Security'),
        },
        {
          title: 'Privacy Settings',
          description: 'Control your privacy preferences',
          icon: 'shield-account',
          onPress: () => {},
        },
        {
          title: 'Data & Storage',
          description: 'Manage your data and storage',
          icon: 'database',
          onPress: () => {},
        },
      ],
    },
    {
      title: 'Verification',
      items: [
        {
          title: 'KYC Verification',
          description: 'Complete identity verification',
          icon: 'account-check',
          onPress: () => navigation.navigate('KYC'),
        },
        {
          title: 'Document Upload',
          description: 'Upload verification documents',
          icon: 'file-upload',
          onPress: () => {},
        },
      ],
    },
    {
      title: 'Notifications',
      items: [
        {
          title: 'Push Notifications',
          description: 'Manage notification preferences',
          icon: 'bell',
          onPress: () => navigation.navigate('Notifications'),
        },
        {
          title: 'Email Notifications',
          description: 'Configure email alerts',
          icon: 'email',
          onPress: () => {},
        },
        {
          title: 'SMS Notifications',
          description: 'Manage SMS alerts',
          icon: 'message-text',
          onPress: () => {},
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          title: 'Help Center',
          description: 'Get help and support',
          icon: 'help-circle',
          onPress: () => {},
        },
        {
          title: 'Contact Support',
          description: 'Send us a message',
          icon: 'email',
          onPress: () => {},
        },
        {
          title: 'Report a Problem',
          description: 'Report issues or bugs',
          icon: 'bug',
          onPress: () => {},
        },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text variant="headlineSmall" style={styles.title}>
            Settings
          </Text>
        </View>

        {/* Settings Sections */}
        {settingsSections.map((section, sectionIndex) => (
          <Card key={sectionIndex} style={styles.sectionCard}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                {section.title}
              </Text>
              
              {section.items.map((item, itemIndex) => (
                <React.Fragment key={itemIndex}>
                  <List.Item
                    title={item.title}
                    description={item.description}
                    left={(props) => <List.Icon {...props} icon={item.icon} />}
                    right={(props) => <List.Icon {...props} icon="chevron-right" />}
                    onPress={item.onPress}
                    style={styles.listItem}
                  />
                  {itemIndex < section.items.length - 1 && (
                    <Divider style={styles.divider} />
                  )}
                </React.Fragment>
              ))}
            </Card.Content>
          </Card>
        ))}

        {/* Quick Settings */}
        <Card style={styles.quickSettingsCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Quick Settings
            </Text>
            
            <List.Item
              title="Push Notifications"
              description="Receive transaction and security alerts"
              left={(props) => <List.Icon {...props} icon="bell" />}
              right={() => (
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  color={customTheme.colors.primary}
                />
              )}
              style={styles.listItem}
            />
            <Divider style={styles.divider} />
            
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
              title="Dark Mode"
              description="Switch to dark theme"
              left={(props) => <List.Icon {...props} icon="theme-light-dark" />}
              right={() => (
                <Switch
                  value={darkModeEnabled}
                  onValueChange={setDarkModeEnabled}
                  color={customTheme.colors.primary}
                />
              )}
              style={styles.listItem}
            />
          </Card.Content>
        </Card>

        {/* App Info */}
        <Card style={styles.appInfoCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              App Information
            </Text>
            
            <List.Item
              title="App Version"
              description="MalPay v1.0.0"
              left={(props) => <List.Icon {...props} icon="information" />}
              style={styles.listItem}
            />
            <Divider style={styles.divider} />
            
            <List.Item
              title="Terms of Service"
              description="Read our terms and conditions"
              left={(props) => <List.Icon {...props} icon="file-document" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {}}
              style={styles.listItem}
            />
            <Divider style={styles.divider} />
            
            <List.Item
              title="Privacy Policy"
              description="How we protect your data"
              left={(props) => <List.Icon {...props} icon="shield-account" />}
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
  header: {
    padding: customTheme.spacing.lg,
    paddingTop: customTheme.spacing.xl,
  },
  title: {
    color: customTheme.colors.onSurface,
    fontWeight: 'bold',
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
  quickSettingsCard: {
    marginHorizontal: customTheme.spacing.lg,
    marginBottom: customTheme.spacing.md,
    elevation: 2,
    borderRadius: customTheme.borderRadius.lg,
  },
  appInfoCard: {
    margin: customTheme.spacing.lg,
    marginTop: 0,
    elevation: 2,
    borderRadius: customTheme.borderRadius.lg,
  },
});

export default SettingsScreen;
